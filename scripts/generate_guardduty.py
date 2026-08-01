#!/usr/bin/env python3
"""
generate_guardduty.py — Generate randomized AWS GuardDuty findings.

Creates realistic GuardDuty finding JSON documents with proper schema,
severity levels, and resource metadata. Designed for SOC lab testing
and Wazuh rule validation.

Usage:
    python3 generate_guardduty.py --count 30 --output sample-logs/guardduty_findings.json
    python3 generate_guardduty.py --min-severity 5 --count 10

Requirements: Python 3.8+ (stdlib only, no third-party packages)
"""

import argparse
import json
import random
import string
import sys
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

# ──────────────────────────── Data Pools ─────────────────────────────────────

REGIONS = [
    "us-east-1", "us-east-2", "us-west-1", "us-west-2",
    "eu-west-1", "eu-central-1", "ap-southeast-1", "ap-northeast-1",
]

ACCOUNT_IDS = [
    "123456789012", "234567890123", "345678901234",
    "456789012345", "567890123456",
]

AVAILABILITY_ZONES = {
    "us-east-1": ["us-east-1a", "us-east-1b", "us-east-1c"],
    "us-west-2": ["us-west-2a", "us-west-2b", "us-west-2c"],
    "eu-west-1": ["eu-west-1a", "eu-west-1b", "eu-west-1c"],
}

# ── Finding type definitions ──
# (type_string, category, severity, title, description)
FINDING_TYPES: list[dict[str, Any]] = [
    # ─── Recon ───
    {
        "type": "Recon:EC2/PortProbeUnprotectedPort",
        "category": "Recon",
        "severity": 2,
        "title": "Unprotected port on EC2 instance is being probed",
        "description": "EC2 instance {instance_id} has an unprotected port which is being probed by a known malicious host.",
    },
    {
        "type": "Recon:EC2/Portscan",
        "category": "Recon",
        "severity": 5,
        "title": "EC2 instance is performing outbound port scans",
        "description": "EC2 instance {instance_id} is performing outbound port scans against remote host {remote_ip}.",
    },
    {
        "type": "Recon:IAMUser/TorIPCaller",
        "category": "Recon",
        "severity": 5,
        "title": "API was invoked from a Tor exit node IP address",
        "description": "An API was invoked from a Tor exit node IP address {remote_ip} by IAM user {username}.",
    },
    {
        "type": "Recon:IAMUser/MaliciousIPCaller",
        "category": "Recon",
        "severity": 5,
        "title": "API was invoked from a known malicious IP address",
        "description": "An API, commonly used in reconnaissance, was invoked from IP {remote_ip}.",
    },
    # ─── UnauthorizedAccess ───
    {
        "type": "UnauthorizedAccess:EC2/SSHBruteForce",
        "category": "UnauthorizedAccess",
        "severity": 5,
        "title": "EC2 instance is the target of SSH brute force attacks",
        "description": "EC2 instance {instance_id} is the target of SSH brute force attacks from {remote_ip}.",
    },
    {
        "type": "UnauthorizedAccess:EC2/RDPBruteForce",
        "category": "UnauthorizedAccess",
        "severity": 5,
        "title": "EC2 instance is the target of RDP brute force attacks",
        "description": "EC2 instance {instance_id} is the target of RDP brute force attacks from {remote_ip}.",
    },
    {
        "type": "UnauthorizedAccess:IAMUser/ConsoleLoginSuccess.B",
        "category": "UnauthorizedAccess",
        "severity": 8,
        "title": "Successful console login from a previously unseen IP",
        "description": "A console login was successfully completed from IP {remote_ip} that has not been used before.",
    },
    {
        "type": "UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration.OutsideAWS",
        "category": "UnauthorizedAccess",
        "severity": 8,
        "title": "Instance credentials are being used from an external IP",
        "description": "Credentials created for instance {instance_id} are being used from external IP {remote_ip}.",
    },
    {
        "type": "UnauthorizedAccess:S3/TorIPCaller",
        "category": "UnauthorizedAccess",
        "severity": 5,
        "title": "S3 bucket was accessed from a Tor exit node",
        "description": "An S3 API was invoked from a Tor exit node IP address {remote_ip}.",
    },
    # ─── CryptoCurrency ───
    {
        "type": "CryptoCurrency:EC2/BitcoinTool.B!DNS",
        "category": "CryptoCurrency",
        "severity": 8,
        "title": "EC2 instance is querying a domain associated with Bitcoin",
        "description": "EC2 instance {instance_id} is querying a domain name associated with Bitcoin-related activity.",
    },
    {
        "type": "CryptoCurrency:EC2/BitcoinTool.B",
        "category": "CryptoCurrency",
        "severity": 8,
        "title": "EC2 instance is communicating with a Bitcoin mining pool",
        "description": "EC2 instance {instance_id} is communicating with IP {remote_ip} associated with a cryptocurrency mining pool.",
    },
    # ─── Trojan ───
    {
        "type": "Trojan:EC2/BlackholeTraffic",
        "category": "Trojan",
        "severity": 8,
        "title": "EC2 instance is communicating with a black hole IP",
        "description": "EC2 instance {instance_id} is attempting to communicate with an IP of a remote host that is a known black hole.",
    },
    {
        "type": "Trojan:EC2/DropPoint",
        "category": "Trojan",
        "severity": 8,
        "title": "EC2 instance is communicating with a known drop point",
        "description": "EC2 instance {instance_id} is attempting to communicate with a drop point IP {remote_ip}.",
    },
    {
        "type": "Trojan:EC2/DGADomainRequest.B",
        "category": "Trojan",
        "severity": 8,
        "title": "EC2 instance is querying algorithmically generated domains",
        "description": "EC2 instance {instance_id} is querying algorithmically generated (DGA) domains, indicative of C&C activity.",
    },
    {
        "type": "Trojan:EC2/DNSDataExfiltration",
        "category": "Trojan",
        "severity": 8,
        "title": "EC2 instance is exfiltrating data through DNS queries",
        "description": "EC2 instance {instance_id} is exfiltrating data through DNS queries to domain {domain}.",
    },
    # ─── Backdoor ───
    {
        "type": "Backdoor:EC2/C&CActivity.B!DNS",
        "category": "Backdoor",
        "severity": 8,
        "title": "EC2 instance is querying a known C&C domain",
        "description": "EC2 instance {instance_id} is querying a domain associated with a known Command & Control server.",
    },
    {
        "type": "Backdoor:EC2/DenialOfService.Tcp",
        "category": "Backdoor",
        "severity": 8,
        "title": "EC2 instance is participating in a DDoS attack",
        "description": "EC2 instance {instance_id} is participating in a denial-of-service attack against host {remote_ip}.",
    },
    {
        "type": "Backdoor:EC2/Spambot",
        "category": "Backdoor",
        "severity": 5,
        "title": "EC2 instance is sending spam emails",
        "description": "EC2 instance {instance_id} is exhibiting behavior indicating it is being used to send spam emails.",
    },
]

# Threat actor IPs
REMOTE_IPS = [
    "198.51.100.77", "203.0.113.42", "45.33.32.156", "185.220.101.1",
    "91.219.237.11", "77.247.181.163", "104.244.72.115", "23.129.64.100",
    "46.166.139.111", "109.70.100.32", "176.10.99.200", "5.188.62.21",
]

LOCAL_IPS = [
    "10.0.1.50", "10.0.2.100", "10.0.3.25", "172.16.0.15",
    "172.31.5.10", "172.31.16.200",
]

USERNAMES = [
    "admin", "root", "deploy-bot", "temp-admin", "compromised-key",
    "test-user-999", "lateral-move-svc",
]

DGA_DOMAINS = [
    "xkajf8a3k.com", "mn3pw9zq.net", "bcdf1234.org", "az9xv2kl.info",
    "qwer7890.biz", "hijklm45.xyz", "nopqrs67.club",
]

# ──────────────────────────── Helpers ────────────────────────────────────────

def random_id(prefix: str = "", length: int = 17) -> str:
    chars = string.ascii_lowercase + string.digits
    body = "".join(random.choices(chars, k=length))
    return f"{prefix}{body}" if prefix else body


def random_instance_id() -> str:
    return f"i-{random_id(length=17)}"


def random_vpc_id() -> str:
    return f"vpc-{random_id(length=8)}"


def random_subnet_id() -> str:
    return f"subnet-{random_id(length=8)}"


def random_sg_id() -> str:
    return f"sg-{random_id(length=8)}"


def random_eni_id() -> str:
    return f"eni-{random_id(length=17)}"


def random_timestamp(base: datetime, range_hours: int = 24) -> str:
    offset = timedelta(seconds=random.randint(0, range_hours * 3600))
    ts = base - offset
    return ts.strftime("%Y-%m-%dT%H:%M:%S.000Z")


# ──────────────────────────── Finding Builder ────────────────────────────────

def build_ec2_resource(region: str, account_id: str) -> dict[str, Any]:
    """Build a realistic EC2 instance resource block."""
    instance_id = random_instance_id()
    vpc_id = random_vpc_id()
    subnet_id = random_subnet_id()
    sg_id = random_sg_id()
    private_ip = random.choice(LOCAL_IPS)
    az_list = AVAILABILITY_ZONES.get(region, [f"{region}a"])
    az = random.choice(az_list)

    return {
        "resourceType": "Instance",
        "instanceDetails": {
            "instanceId": instance_id,
            "instanceType": random.choice(["t3.micro", "t3.medium", "m5.large", "c5.xlarge"]),
            "launchTime": random_timestamp(datetime.now(timezone.utc), 720),  # up to 30 days ago
            "platform": None,
            "productCodes": [],
            "iamInstanceProfile": {
                "arn": f"arn:aws:iam::{account_id}:instance-profile/ec2-default-profile",
                "id": f"AIPA{random_id(length=16).upper()}",
            },
            "networkInterfaces": [
                {
                    "networkInterfaceId": random_eni_id(),
                    "privateDnsName": f"ip-{private_ip.replace('.', '-')}.{region}.compute.internal",
                    "privateIpAddress": private_ip,
                    "privateIpAddresses": [{"privateDnsName": f"ip-{private_ip.replace('.', '-')}.{region}.compute.internal", "privateIpAddress": private_ip}],
                    "subnetId": subnet_id,
                    "vpcId": vpc_id,
                    "securityGroups": [{"groupId": sg_id, "groupName": "default"}],
                    "publicIp": f"{random.randint(3,54)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}",
                }
            ],
            "outpostArn": None,
            "tags": [
                {"key": "Name", "value": f"soc-lab-instance-{random_id(length=4)}"},
                {"key": "Environment", "value": random.choice(["production", "staging", "development"])},
            ],
            "availabilityZone": az,
            "imageId": f"ami-{random_id(length=8)}",
            "imageDescription": "Amazon Linux 2023 AMI",
        },
    }


def build_finding(finding_def: dict[str, Any], base_time: datetime) -> dict[str, Any]:
    """Build a single GuardDuty finding from a finding definition."""
    account_id = random.choice(ACCOUNT_IDS)
    region = random.choice(REGIONS)
    instance_id = random_instance_id()
    remote_ip = random.choice(REMOTE_IPS)
    username = random.choice(USERNAMES)
    domain = random.choice(DGA_DOMAINS)
    created_at = random_timestamp(base_time, 24)
    updated_at = random_timestamp(base_time, 6)

    # Template the description
    description = finding_def["description"].format(
        instance_id=instance_id,
        remote_ip=remote_ip,
        username=username,
        domain=domain,
    )
    title = finding_def["title"]

    # Build the resource block
    resource = build_ec2_resource(region, account_id)

    # Build network connection info for network-related findings
    service_details: dict[str, Any] = {
        "serviceName": "guardduty",
        "detectorId": random_id(length=32),
        "action": {},
        "evidence": None,
        "archived": False,
        "count": random.randint(1, 50),
        "resourceRole": random.choice(["TARGET", "ACTOR"]),
        "additionalInfo": {},
    }

    # Different action types based on finding category
    category = finding_def["category"]
    if category in ("Recon", "UnauthorizedAccess", "Backdoor"):
        remote_port = random.choice([22, 3389, 443, 80, 8080, 4444, 1337])
        local_port = random.randint(32768, 65535)
        service_details["action"] = {
            "actionType": "NETWORK_CONNECTION",
            "networkConnectionAction": {
                "connectionDirection": random.choice(["INBOUND", "OUTBOUND"]),
                "remoteIpDetails": {
                    "ipAddressV4": remote_ip,
                    "organization": {
                        "asn": str(random.randint(1000, 65000)),
                        "asnOrg": random.choice(["Suspicious-Hosting-LLC", "TOR-Exit-Relay", "BulletProof-Net", "Anonymous-VPN-Corp"]),
                        "isp": random.choice(["SuspiciousISP", "AnonHost", "DarkNet-Transit"]),
                        "org": random.choice(["Unknown Organization", "Threat Actor Group", "Botnet Infrastructure"]),
                    },
                    "country": {"countryName": random.choice(["Russia", "China", "Iran", "North Korea", "Romania", "Netherlands"])},
                    "city": {"cityName": random.choice(["Moscow", "Beijing", "Tehran", "Bucharest", "Amsterdam"])},
                    "geoLocation": {"lat": round(random.uniform(-60, 60), 4), "lon": round(random.uniform(-180, 180), 4)},
                },
                "remotePortDetails": {"port": remote_port, "portName": "SSH" if remote_port == 22 else "Unknown"},
                "localPortDetails": {"port": local_port, "portName": "Unknown"},
                "protocol": "TCP",
                "blocked": random.choice([True, False]),
            },
        }
    elif category == "CryptoCurrency":
        service_details["action"] = {
            "actionType": "DNS_REQUEST",
            "dnsRequestAction": {
                "domain": random.choice(["pool.minergate.com", "xmr.pool.minergate.com", "mining.bitcoin.cz", "stratum.slushpool.com"]),
                "protocol": "UDP",
                "blocked": False,
            },
        }
    elif category == "Trojan":
        if "DNS" in finding_def["type"] or "DGA" in finding_def["type"]:
            service_details["action"] = {
                "actionType": "DNS_REQUEST",
                "dnsRequestAction": {
                    "domain": domain,
                    "protocol": "UDP",
                    "blocked": False,
                },
            }
        else:
            service_details["action"] = {
                "actionType": "NETWORK_CONNECTION",
                "networkConnectionAction": {
                    "connectionDirection": "OUTBOUND",
                    "remoteIpDetails": {
                        "ipAddressV4": remote_ip,
                        "organization": {"asn": str(random.randint(1000, 65000)), "asnOrg": "Malicious-Hosting"},
                        "country": {"countryName": random.choice(["Russia", "China", "Unknown"])},
                    },
                    "protocol": "TCP",
                    "blocked": False,
                },
            }

    finding: dict[str, Any] = {
        "schemaVersion": "2.0",
        "accountId": account_id,
        "region": region,
        "partition": "aws",
        "id": str(uuid.uuid4()),
        "arn": f"arn:aws:guardduty:{region}:{account_id}:detector/{random_id(length=32)}/finding/{str(uuid.uuid4())}",
        "type": finding_def["type"],
        "resource": resource,
        "service": service_details,
        "severity": finding_def["severity"],
        "createdAt": created_at,
        "updatedAt": updated_at,
        "title": title,
        "description": description,
    }

    return finding


# ──────────────────────────── ANSI helpers ───────────────────────────────────

class Color:
    RESET   = "\033[0m"
    BOLD    = "\033[1m"
    DIM     = "\033[2m"
    RED     = "\033[91m"
    GREEN   = "\033[92m"
    YELLOW  = "\033[93m"
    CYAN    = "\033[96m"
    MAGENTA = "\033[95m"

def c(text: str, color: str) -> str:
    if hasattr(sys.stdout, "isatty") and sys.stdout.isatty():
        return f"{color}{text}{Color.RESET}"
    return text

def severity_color(sev: int) -> str:
    if sev >= 7:
        return Color.RED
    elif sev >= 4:
        return Color.YELLOW
    return Color.GREEN

def severity_label(sev: int) -> str:
    if sev >= 7:
        return "HIGH"
    elif sev >= 4:
        return "MEDIUM"
    return "LOW"


# ──────────────────────────── CLI ────────────────────────────────────────────

BANNER = r"""
╔══════════════════════════════════════════════════════════╗
║       🛡️  SOC Lab — GuardDuty Finding Generator  🛡️      ║
║        Generate realistic AWS GuardDuty findings        ║
╚══════════════════════════════════════════════════════════╝
"""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate randomized AWS GuardDuty findings for SOC lab testing.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  %(prog)s --count 30 --output guardduty_findings.json\n"
            "  %(prog)s --min-severity 5\n"
            "  %(prog)s --count 50 --min-severity 8\n"
        ),
    )
    parser.add_argument("--count", "-n", type=int, default=20,
                        help="Number of findings to generate (default: 20)")
    parser.add_argument("--output", "-o", default=None,
                        help="Output file path (default: stdout)")
    parser.add_argument("--min-severity", type=int, default=2, choices=[2, 5, 8],
                        help="Minimum severity level: 2=LOW, 5=MEDIUM, 8=HIGH (default: 2)")
    parser.add_argument("--pretty", action="store_true",
                        help="Pretty-print JSON output")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if args.output is None:
        out_stream = sys.stdout
        info_stream = sys.stderr
    else:
        out_stream = None
        info_stream = sys.stderr

    print(c(BANNER, Color.CYAN), file=info_stream)
    print(c("  ▸ Generating findings …", Color.BOLD), file=info_stream)
    print(f"    Count ·········· {c(str(args.count), Color.GREEN)}", file=info_stream)
    print(f"    Min severity ··· {c(f'{args.min_severity} ({severity_label(args.min_severity)})', severity_color(args.min_severity))}", file=info_stream)

    # Filter available finding types by minimum severity
    available_types = [ft for ft in FINDING_TYPES if ft["severity"] >= args.min_severity]
    if not available_types:
        print(c("  ✗ No finding types match the minimum severity filter.", Color.RED), file=info_stream)
        sys.exit(1)

    print(f"    Finding types ·· {c(str(len(available_types)), Color.CYAN)} available", file=info_stream)

    base_time = datetime.now(timezone.utc)
    findings: list[dict[str, Any]] = []
    category_counts: dict[str, int] = {}
    severity_counts: dict[str, int] = {"LOW": 0, "MEDIUM": 0, "HIGH": 0}

    for _ in range(args.count):
        finding_def = random.choice(available_types)
        finding = build_finding(finding_def, base_time)
        findings.append(finding)

        cat = finding_def["category"]
        category_counts[cat] = category_counts.get(cat, 0) + 1
        severity_counts[severity_label(finding_def["severity"])] += 1

    # Sort by createdAt
    findings.sort(key=lambda f: f.get("createdAt", ""))

    # Output
    indent = 2 if args.pretty else None
    json_str = json.dumps(findings, indent=indent, default=str)

    if args.output:
        from pathlib import Path
        out_path = Path(args.output)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json_str, encoding="utf-8")
        print(f"    Output ········· {c(args.output, Color.GREEN)}", file=info_stream)
    else:
        print(json_str)

    # Summary
    print(f"\n{c('  ▸ Summary', Color.BOLD)}", file=info_stream)
    print(f"    {'─' * 44}", file=info_stream)
    print(f"    Total findings · {c(str(len(findings)), Color.CYAN)}", file=info_stream)
    print(f"    {'─' * 44}", file=info_stream)

    print(f"    {c('By Severity:', Color.BOLD)}", file=info_stream)
    for label in ["HIGH", "MEDIUM", "LOW"]:
        count = severity_counts[label]
        if count > 0:
            clr = severity_color(8 if label == "HIGH" else 5 if label == "MEDIUM" else 2)
            print(f"      {label:10s} {c(str(count), clr)}", file=info_stream)

    print(f"\n    {c('By Category:', Color.BOLD)}", file=info_stream)
    for cat, count in sorted(category_counts.items()):
        print(f"      {cat:25s} {c(str(count), Color.CYAN)}", file=info_stream)

    # List unique finding types generated
    unique_types = sorted(set(f["type"] for f in findings))
    print(f"\n    {c('Finding types generated:', Color.YELLOW)}", file=info_stream)
    for ft in unique_types:
        sev = next((d["severity"] for d in FINDING_TYPES if d["type"] == ft), 2)
        print(f"      • {c(ft, severity_color(sev))}", file=info_stream)

    print(f"\n{c('  ✓ Done.', Color.GREEN)}", file=info_stream)


if __name__ == "__main__":
    main()
