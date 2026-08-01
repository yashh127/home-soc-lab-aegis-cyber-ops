#!/usr/bin/env python3
"""
log_replay.py — Replay sample log files into Wazuh via syslog.

Reads JSON log files from the sample-logs/ directory and forwards them
to a syslog receiver (e.g., Wazuh) over UDP or TCP. Supports speed
control, source filtering, and colored terminal output.

Usage:
    python3 log_replay.py --target 192.168.1.100 --source cloudtrail --speed fast
    python3 log_replay.py --source all --repeat 3 --verbose

Requirements: Python 3.8+ (stdlib only, no third-party packages)
"""

import argparse
import glob
import json
import os
import random
import socket
import struct
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

# ──────────────────────────── ANSI colour helpers ────────────────────────────

class Color:
    """ANSI escape sequences for terminal colouring."""
    RESET   = "\033[0m"
    BOLD    = "\033[1m"
    DIM     = "\033[2m"
    RED     = "\033[91m"
    GREEN   = "\033[92m"
    YELLOW  = "\033[93m"
    BLUE    = "\033[94m"
    MAGENTA = "\033[95m"
    CYAN    = "\033[96m"
    WHITE   = "\033[97m"
    BG_RED  = "\033[41m"

    @staticmethod
    def supports_color() -> bool:
        """Return True when stdout is a TTY that likely supports colour."""
        return hasattr(sys.stdout, "isatty") and sys.stdout.isatty()


_USE_COLOR = Color.supports_color()


def c(text: str, color: str) -> str:
    """Wrap *text* with ANSI colour if the terminal supports it."""
    return f"{color}{text}{Color.RESET}" if _USE_COLOR else text


# ──────────────────────────── Syslog formatting ──────────────────────────────

# Syslog facility & severity → priority mapping
FACILITY_LOCAL0 = 16          # local0
SEVERITY_INFO   = 6           # informational
SEVERITY_WARN   = 4           # warning
SEVERITY_ERR    = 3           # error

SOURCE_TAG_MAP = {
    "cloudtrail": ("aws-cloudtrail", FACILITY_LOCAL0, SEVERITY_INFO),
    "guardduty":  ("aws-guardduty",  FACILITY_LOCAL0, SEVERITY_WARN),
    "windows":    ("windows-event",  FACILITY_LOCAL0, SEVERITY_INFO),
    "linux":      ("linux-syslog",   FACILITY_LOCAL0, SEVERITY_INFO),
}

VALID_SOURCES = list(SOURCE_TAG_MAP.keys()) + ["all"]


def syslog_priority(facility: int, severity: int) -> int:
    """Calculate the RFC-5424 priority value."""
    return (facility * 8) + severity


def format_syslog_message(tag: str, payload: str, facility: int, severity: int,
                          hostname: str = "soc-lab") -> bytes:
    """Build a BSD-style syslog message (RFC 3164)."""
    pri = syslog_priority(facility, severity)
    timestamp = datetime.now(timezone.utc).strftime("%b %d %H:%M:%S")
    msg = f"<{pri}>{timestamp} {hostname} {tag}: {payload}"
    return msg.encode("utf-8", errors="replace")


# ──────────────────────────── Progress bar ───────────────────────────────────

def progress_bar(current: int, total: int, width: int = 40, extra: str = "") -> str:
    """Return a single-line progress bar string."""
    pct = current / total if total else 0
    filled = int(width * pct)
    bar = "█" * filled + "░" * (width - filled)
    pct_str = f"{pct * 100:5.1f}%"
    return f"\r  {c(bar, Color.CYAN)} {pct_str} [{current}/{total}] {extra}"


# ──────────────────────────── Log discovery ──────────────────────────────────

def discover_log_files(sample_dir: str, source: str) -> list[Path]:
    """
    Find JSON log files in *sample_dir* that match the requested *source*.

    Naming convention:  <source>_*.json   (e.g. cloudtrail_events.json)
    If source == 'all', every .json file in the directory is returned.
    """
    sample_path = Path(sample_dir)
    if not sample_path.is_dir():
        print(c(f"  ✗ Sample-logs directory not found: {sample_dir}", Color.RED))
        print(c(f"    Create it and add JSON files, or use generate_*.py first.", Color.DIM))
        sys.exit(1)

    if source == "all":
        files = sorted(sample_path.rglob("*.json"))
    else:
        files = sorted(sample_path.rglob(f"{source}*.json")) + sorted(sample_path.rglob(f"*/{source}*.json"))
        # Deduplicate while keeping order
        seen = set()
        unique_files = []
        for f in files:
            if f not in seen:
                seen.add(f)
                unique_files.append(f)
        files = unique_files

    return files


def load_events(files: list[Path], verbose: bool = False) -> list[tuple[str, dict]]:
    """
    Load JSON events from *files*.

    Returns a list of (source_tag, event_dict) tuples.
    Each file may contain a JSON array of events **or** newline-delimited JSON.
    """
    events: list[tuple[str, dict]] = []

    for fp in files:
        # Infer source tag from filename prefix
        stem = fp.stem.lower()
        tag_info = None
        for src_key, info in SOURCE_TAG_MAP.items():
            if stem.startswith(src_key):
                tag_info = (src_key, info)
                break
        if tag_info is None:
            tag_info = ("generic", ("generic", FACILITY_LOCAL0, SEVERITY_INFO))

        src_key, (tag, fac, sev) = tag_info

        try:
            raw = fp.read_text(encoding="utf-8")
            # Try JSON array first
            try:
                data = json.loads(raw)
                if isinstance(data, list):
                    for item in data:
                        events.append((src_key, item))
                elif isinstance(data, dict):
                    # Could be a wrapper like {"Records": [...]}
                    for key in ("Records", "records", "Events", "events", "Findings", "findings"):
                        if key in data and isinstance(data[key], list):
                            for item in data[key]:
                                events.append((src_key, item))
                            break
                    else:
                        events.append((src_key, data))
            except json.JSONDecodeError:
                # Fall back to newline-delimited JSON
                for lineno, line in enumerate(raw.splitlines(), 1):
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        events.append((src_key, json.loads(line)))
                    except json.JSONDecodeError:
                        if verbose:
                            print(c(f"    ⚠ Skipping invalid JSON at {fp.name}:{lineno}", Color.YELLOW))

            if verbose:
                print(c(f"    ✓ Loaded {fp.name}", Color.GREEN))

        except OSError as exc:
            print(c(f"    ✗ Error reading {fp.name}: {exc}", Color.RED))

    return events


# ──────────────────────────── Sending ────────────────────────────────────────

class SyslogSender:
    """Sends syslog messages over UDP or TCP."""

    def __init__(self, target: str, port: int, protocol: str):
        self.target = target
        self.port = port
        self.protocol = protocol.lower()
        self._sock: socket.socket | None = None

    def connect(self) -> None:
        if self.protocol == "tcp":
            self._sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self._sock.settimeout(10)
            self._sock.connect((self.target, self.port))
        else:
            self._sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

    def send(self, message: bytes) -> None:
        if self._sock is None:
            raise RuntimeError("SyslogSender is not connected")
        if self.protocol == "tcp":
            # Octet-counted framing (RFC 5425 style)
            framed = f"{len(message)} ".encode() + message
            self._sock.sendall(framed)
        else:
            self._sock.sendto(message, (self.target, self.port))

    def close(self) -> None:
        if self._sock:
            self._sock.close()
            self._sock = None


# ──────────────────────────── Speed control ──────────────────────────────────

SPEED_DELAYS = {
    "realtime": 1.0,       # ~1 event/sec, mimics real pace
    "fast":     0.05,      # 20 events/sec
    "instant":  0.0,       # as fast as possible
}


# ──────────────────────────── Banner ─────────────────────────────────────────

BANNER = r"""
╔══════════════════════════════════════════════════════════╗
║           🔁  SOC Lab — Log Replay Engine  🔁           ║
║         Replay sample logs into Wazuh via syslog        ║
╚══════════════════════════════════════════════════════════╝
"""


def print_banner() -> None:
    print(c(BANNER, Color.CYAN))


# ──────────────────────────── Main ───────────────────────────────────────────

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Replay sample JSON log files into Wazuh via syslog.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  %(prog)s --source cloudtrail --speed fast\n"
            "  %(prog)s --target 192.168.1.100 --protocol tcp --source all\n"
            "  %(prog)s --source guardduty --repeat 5 --verbose\n"
        ),
    )
    parser.add_argument("--target", default="localhost",
                        help="Syslog receiver host (default: localhost)")
    parser.add_argument("--port", type=int, default=514,
                        help="Syslog receiver port (default: 514)")
    parser.add_argument("--protocol", choices=["udp", "tcp"], default="udp",
                        help="Transport protocol (default: udp)")
    parser.add_argument("--source", choices=VALID_SOURCES, default="all",
                        help="Log source to replay (default: all)")
    parser.add_argument("--speed", choices=list(SPEED_DELAYS.keys()), default="fast",
                        help="Replay speed (default: fast)")
    parser.add_argument("--repeat", type=int, default=1,
                        help="Number of times to replay the log set (default: 1)")
    parser.add_argument("--sample-dir", default=None,
                        help="Path to sample-logs/ directory (auto-detected)")
    parser.add_argument("--verbose", "-v", action="store_true",
                        help="Enable verbose output")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    print_banner()

    # ── Resolve sample-logs directory ──
    if args.sample_dir:
        sample_dir = args.sample_dir
    else:
        # Walk up from this script to find sample-logs/
        script_dir = Path(__file__).resolve().parent
        sample_dir = str(script_dir.parent / "sample-logs")

    # ── Configuration summary ──
    print(c("  ▸ Configuration", Color.BOLD))
    print(f"    Target ····· {c(f'{args.target}:{args.port}', Color.GREEN)} ({args.protocol.upper()})")
    print(f"    Source ····· {c(args.source, Color.YELLOW)}")
    print(f"    Speed ······ {c(args.speed, Color.YELLOW)}")
    print(f"    Repeat ····· {c(str(args.repeat), Color.YELLOW)}")
    print(f"    Log dir ···· {c(sample_dir, Color.DIM)}")
    print()

    # ── Discover & load ──
    print(c("  ▸ Loading sample logs …", Color.BOLD))
    files = discover_log_files(sample_dir, args.source)
    if not files:
        print(c(f"  ✗ No matching log files found for source '{args.source}'.", Color.RED))
        print(c(f"    Run generate_cloudtrail.py / generate_guardduty.py first.", Color.DIM))
        sys.exit(1)

    print(f"    Found {c(str(len(files)), Color.GREEN)} file(s)")
    events = load_events(files, verbose=args.verbose)
    if not events:
        print(c("  ✗ No events found in log files.", Color.RED))
        sys.exit(1)
    print(f"    Loaded {c(str(len(events)), Color.GREEN)} event(s)")
    print()

    # ── Connect ──
    print(c("  ▸ Connecting to syslog receiver …", Color.BOLD))
    sender = SyslogSender(args.target, args.port, args.protocol)
    try:
        sender.connect()
    except OSError as exc:
        print(c(f"  ✗ Connection failed: {exc}", Color.RED))
        print(c(f"    Ensure the syslog receiver is running at {args.target}:{args.port}", Color.DIM))
        sys.exit(1)
    print(c(f"    ✓ Connected via {args.protocol.upper()}", Color.GREEN))
    print()

    # ── Replay loop ──
    delay = SPEED_DELAYS[args.speed]
    total = len(events) * args.repeat
    sent = 0
    errors = 0
    start_time = time.monotonic()
    source_counts: dict[str, int] = {}

    print(c("  ▸ Replaying logs …", Color.BOLD))
    try:
        for iteration in range(1, args.repeat + 1):
            if args.repeat > 1:
                print(f"\n    {c(f'── Iteration {iteration}/{args.repeat} ──', Color.DIM)}")

            # Shuffle for more realistic interleaving
            shuffled = list(events)
            random.shuffle(shuffled)

            for src_key, event in shuffled:
                tag, fac, sev = SOURCE_TAG_MAP.get(
                    src_key, ("generic", FACILITY_LOCAL0, SEVERITY_INFO)
                )

                payload = json.dumps(event, separators=(",", ":"))
                message = format_syslog_message(tag, payload, fac, sev)

                try:
                    sender.send(message)
                    sent += 1
                    source_counts[src_key] = source_counts.get(src_key, 0) + 1
                except OSError as exc:
                    errors += 1
                    if args.verbose:
                        print(c(f"\n    ✗ Send error: {exc}", Color.RED))

                if args.verbose and sent % 10 == 0:
                    extra = c(f"src={src_key}", Color.DIM)
                    sys.stdout.write(progress_bar(sent, total, extra=extra))
                    sys.stdout.flush()
                elif not args.verbose:
                    sys.stdout.write(progress_bar(sent, total))
                    sys.stdout.flush()

                if delay > 0:
                    time.sleep(delay)

    except KeyboardInterrupt:
        print(c("\n\n  ⚠ Interrupted by user.", Color.YELLOW))
    finally:
        sender.close()

    # ── Summary ──
    elapsed = time.monotonic() - start_time
    eps = sent / elapsed if elapsed > 0 else 0

    print("\n")
    print(c("  ▸ Replay Summary", Color.BOLD))
    print(f"    {'─' * 44}")
    print(f"    Events sent ··· {c(str(sent), Color.GREEN)}")
    print(f"    Errors ········ {c(str(errors), Color.RED if errors else Color.GREEN)}")
    print(f"    Duration ······ {elapsed:.2f}s")
    print(f"    Throughput ···· {eps:.1f} events/sec")
    print(f"    {'─' * 44}")
    for src, count in sorted(source_counts.items()):
        print(f"    {src:20s} {c(str(count), Color.CYAN)} events")
    print(f"    {'─' * 44}")
    print()

    if errors:
        print(c("  ⚠ Some events failed to send. Check connectivity and receiver status.", Color.YELLOW))
    else:
        print(c("  ✓ All events replayed successfully.", Color.GREEN))
    print()


if __name__ == "__main__":
    main()
