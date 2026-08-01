#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# attack_simulation.sh — SAFE, Non-Destructive Attack Simulation
#
# Generates telemetry that triggers Wazuh alerts without causing real harm.
# Every action is explained, reversible, and confined to test artifacts.
#
# Supports: Linux (Ubuntu/Debian/RHEL) and macOS
#
# Usage:
#   chmod +x attack_simulation.sh
#   sudo ./attack_simulation.sh          # Menu-driven
#   sudo ./attack_simulation.sh --auto   # Run all simulations
# ─────────────────────────────────────────────────────────────────────────────
set -euo pipefail

# ──────────────────────────── Constants ──────────────────────────────────────

readonly SCRIPT_NAME="SOC Lab — Attack Simulator"
readonly VERSION="1.0.0"
readonly TEST_DIR="/tmp/soc-lab-sim"
readonly CRON_MARKER="# SOC-LAB-TEST-ENTRY"

# ──────────────────────────── Colours ────────────────────────────────────────

if [[ -t 1 ]]; then
    readonly C_RESET="\033[0m"
    readonly C_BOLD="\033[1m"
    readonly C_DIM="\033[2m"
    readonly C_RED="\033[91m"
    readonly C_GREEN="\033[92m"
    readonly C_YELLOW="\033[93m"
    readonly C_BLUE="\033[94m"
    readonly C_MAGENTA="\033[95m"
    readonly C_CYAN="\033[96m"
    readonly C_WHITE="\033[97m"
    readonly C_BG_RED="\033[41m"
else
    readonly C_RESET="" C_BOLD="" C_DIM="" C_RED="" C_GREEN=""
    readonly C_YELLOW="" C_BLUE="" C_MAGENTA="" C_CYAN="" C_WHITE="" C_BG_RED=""
fi

# ──────────────────────────── Helpers ────────────────────────────────────────

banner() {
    echo ""
    echo -e "${C_CYAN}╔══════════════════════════════════════════════════════════════╗${C_RESET}"
    echo -e "${C_CYAN}║       ⚔️   ${C_BOLD}${SCRIPT_NAME}${C_RESET}${C_CYAN}  v${VERSION}   ⚔️        ║${C_RESET}"
    echo -e "${C_CYAN}║     Safe, non-destructive telemetry for Wazuh testing       ║${C_RESET}"
    echo -e "${C_CYAN}╚══════════════════════════════════════════════════════════════╝${C_RESET}"
    echo ""
}

info()    { echo -e "  ${C_CYAN}ℹ${C_RESET}  $*"; }
success() { echo -e "  ${C_GREEN}✓${C_RESET}  $*"; }
warn()    { echo -e "  ${C_YELLOW}⚠${C_RESET}  $*"; }
error()   { echo -e "  ${C_RED}✗${C_RESET}  $*"; }
header()  { echo -e "\n${C_BOLD}${C_MAGENTA}  ──── $* ────${C_RESET}\n"; }
explain() { echo -e "  ${C_DIM}$*${C_RESET}"; }

separator() {
    echo -e "  ${C_DIM}$(printf '─%.0s' {1..56})${C_RESET}"
}

pause_for_user() {
    if [[ "${AUTO_MODE:-false}" == "true" ]]; then
        return
    fi
    echo ""
    echo -ne "  ${C_YELLOW}Press Enter to continue (or Ctrl+C to abort)…${C_RESET} "
    read -r
}

detect_os() {
    case "$(uname -s)" in
        Linux*)  echo "linux" ;;
        Darwin*) echo "macos" ;;
        *)       echo "unknown" ;;
    esac
}

ensure_test_dir() {
    mkdir -p "${TEST_DIR}"
    success "Test directory ready: ${TEST_DIR}"
}

cleanup_test_dir() {
    if [[ -d "${TEST_DIR}" ]]; then
        rm -rf "${TEST_DIR}"
        success "Cleaned up test directory: ${TEST_DIR}"
    fi
}

# ──────────────────────────── Simulation 1: SSH Brute Force ──────────────────

sim_ssh_brute_force() {
    header "Simulation 1: SSH Brute Force"

    explain "This generates rapid failed SSH login attempts to localhost."
    explain "Wazuh will detect repeated authentication failures and trigger"
    explain "rules like 5710 (sshd authentication failure) and 5712 (brute force)."
    echo ""
    explain "${C_YELLOW}Expected Wazuh Alerts:${C_RESET}"
    explain "  • Rule 5710 — sshd: authentication failed"
    explain "  • Rule 5712 — SSHD brute force (multiple failures)"
    explain "  • Rule 5720 — Multiple authentication failures"

    pause_for_user

    local OS
    OS="$(detect_os)"
    local ATTEMPTS=15
    local FAKE_USER="attacker_test_$$"

    info "Generating ${ATTEMPTS} rapid failed SSH attempts as '${FAKE_USER}' …"
    echo ""

    for i in $(seq 1 ${ATTEMPTS}); do
        # Use ssh with a non-existent user; ConnectTimeout ensures fast failure
        # BatchMode prevents password prompts; StrictHostKeyChecking avoids prompts
        if ssh -o BatchMode=yes \
               -o ConnectTimeout=1 \
               -o StrictHostKeyChecking=no \
               -o UserKnownHostsFile=/dev/null \
               -o LogLevel=ERROR \
               "${FAKE_USER}@localhost" \
               "exit" 2>/dev/null; then
            :  # won't succeed
        fi
        echo -ne "\r    Attempt ${C_CYAN}${i}/${ATTEMPTS}${C_RESET} "
        sleep 0.1
    done

    echo ""
    success "SSH brute force simulation complete (${ATTEMPTS} failed attempts)"
}

# ──────────────────────────── Simulation 2: Suspicious Process Chains ────────

sim_suspicious_processes() {
    header "Simulation 2: Suspicious Process Chains"

    explain "Creates and executes harmless scripts in /tmp to mimic malware"
    explain "behavior patterns like downloading and executing payloads."
    explain "Wazuh monitors process creation from /tmp and suspicious chains."
    echo ""
    explain "${C_YELLOW}Expected Wazuh Alerts:${C_RESET}"
    explain "  • Rule 100200 — Executable run from /tmp"
    explain "  • Rule 100201 — Suspicious process chain"
    explain "  • Syscheck alerts for /tmp modifications"

    pause_for_user

    ensure_test_dir

    # Create harmless "payload" scripts
    local PAYLOADS=(
        "stage1_dropper.sh"
        "stage2_beacon.sh"
        "data_collector.sh"
    )

    for payload in "${PAYLOADS[@]}"; do
        local script="${TEST_DIR}/${payload}"
        cat > "${script}" <<'PAYLOAD_EOF'
#!/bin/bash
# SOC Lab — Harmless test payload
# This script does nothing harmful; it exists to trigger Wazuh alerts
echo "[SOC-LAB-TEST] Simulated payload executed: $(basename "$0") at $(date)"
sleep 1
echo "[SOC-LAB-TEST] Payload simulation complete"
PAYLOAD_EOF
        chmod +x "${script}"
        info "Created ${C_CYAN}${script}${C_RESET}"
    done

    echo ""
    info "Executing simulated payload chain …"

    for payload in "${PAYLOADS[@]}"; do
        local script="${TEST_DIR}/${payload}"
        echo -e "    ${C_DIM}→ Running ${payload}${C_RESET}"
        "${script}" 2>/dev/null || true
        sleep 0.5
    done

    # Simulate a suspicious chain: bash → curl → sh pattern (harmless)
    info "Simulating bash → download → execute chain …"
    echo -e "    ${C_DIM}→ /bin/bash -c 'echo simulated-download | /bin/cat'${C_RESET}"
    /bin/bash -c 'echo "[SOC-LAB-TEST] Simulated download-and-execute chain" | /bin/cat' 2>/dev/null || true

    # Clean up payloads
    for payload in "${PAYLOADS[@]}"; do
        rm -f "${TEST_DIR}/${payload}"
    done

    echo ""
    success "Suspicious process chain simulation complete"
}

# ──────────────────────────── Simulation 3: File Integrity Changes ───────────

sim_file_integrity() {
    header "Simulation 3: File Integrity Changes"

    explain "Creates, modifies, and deletes test files in monitored paths."
    explain "Wazuh's Syscheck (FIM) module will detect these changes and"
    explain "generate alerts for file creation, modification, and deletion."
    echo ""
    explain "${C_YELLOW}Expected Wazuh Alerts:${C_RESET}"
    explain "  • Rule 550 — Integrity checksum changed"
    explain "  • Rule 554 — File added to the system"
    explain "  • Rule 553 — File deleted from the system"

    pause_for_user

    ensure_test_dir
    local FIM_DIR="${TEST_DIR}/fim-test"
    mkdir -p "${FIM_DIR}"

    # Phase 1: Create files
    info "Phase 1: Creating test files …"
    for i in 1 2 3; do
        local fname="${FIM_DIR}/sensitive_data_${i}.txt"
        echo "SOC-LAB-TEST: Original content for file ${i} — $(date)" > "${fname}"
        echo -e "    ${C_GREEN}+ Created${C_RESET} sensitive_data_${i}.txt"
    done

    # Create a fake config file
    local config_file="${FIM_DIR}/app_config.conf"
    cat > "${config_file}" <<EOF
# SOC Lab Test Configuration
# This file is monitored by Wazuh Syscheck
database_host=localhost
database_port=5432
api_key=test-key-not-real-abc123
debug_mode=false
EOF
    echo -e "    ${C_GREEN}+ Created${C_RESET} app_config.conf"
    sleep 2

    # Phase 2: Modify files
    info "Phase 2: Modifying test files …"
    for i in 1 2 3; do
        local fname="${FIM_DIR}/sensitive_data_${i}.txt"
        echo "SOC-LAB-TEST: MODIFIED content — $(date)" >> "${fname}"
        echo -e "    ${C_YELLOW}~ Modified${C_RESET} sensitive_data_${i}.txt"
    done

    # Modify config — simulate unauthorized change
    sed -i.bak 's/debug_mode=false/debug_mode=true/' "${config_file}" 2>/dev/null || \
    sed -i '' 's/debug_mode=false/debug_mode=true/' "${config_file}" 2>/dev/null || true
    echo -e "    ${C_YELLOW}~ Modified${C_RESET} app_config.conf (debug_mode toggled)"
    sleep 2

    # Phase 3: Permission changes
    info "Phase 3: Changing file permissions …"
    chmod 777 "${FIM_DIR}/sensitive_data_1.txt" 2>/dev/null || true
    echo -e "    ${C_YELLOW}~ Permissions changed${C_RESET} sensitive_data_1.txt → 777"
    chmod 000 "${FIM_DIR}/sensitive_data_2.txt" 2>/dev/null || true
    echo -e "    ${C_YELLOW}~ Permissions changed${C_RESET} sensitive_data_2.txt → 000"
    sleep 2

    # Phase 4: Delete files
    info "Phase 4: Deleting test files …"
    for i in 1 2 3; do
        local fname="${FIM_DIR}/sensitive_data_${i}.txt"
        rm -f "${fname}"
        echo -e "    ${C_RED}✗ Deleted${C_RESET} sensitive_data_${i}.txt"
    done
    rm -f "${config_file}" "${config_file}.bak"
    echo -e "    ${C_RED}✗ Deleted${C_RESET} app_config.conf"

    rmdir "${FIM_DIR}" 2>/dev/null || true

    echo ""
    success "File integrity change simulation complete"
}

# ──────────────────────────── Simulation 4: Crontab Modification ─────────────

sim_crontab_modification() {
    header "Simulation 4: Crontab Modification"

    explain "Adds a harmless crontab entry and immediately removes it."
    explain "Wazuh monitors crontab changes as potential persistence mechanisms."
    echo ""
    explain "${C_YELLOW}Expected Wazuh Alerts:${C_RESET}"
    explain "  • Rule 2832 — Crontab entry added"
    explain "  • Rule 2833 — Crontab entry removed"
    explain "  • Syscheck alert for /var/spool/cron changes"

    pause_for_user

    local OS
    OS="$(detect_os)"

    # Save current crontab
    local ORIGINAL_CRON=""
    ORIGINAL_CRON=$(crontab -l 2>/dev/null || echo "")

    info "Adding harmless test crontab entry …"

    # Add test entry
    local TEST_ENTRY="* * * * * /bin/echo 'SOC-LAB-TEST: harmless cron entry' > /dev/null 2>&1 ${CRON_MARKER}"

    if [[ -n "${ORIGINAL_CRON}" ]]; then
        (echo "${ORIGINAL_CRON}"; echo "${TEST_ENTRY}") | crontab - 2>/dev/null || {
            warn "Could not modify crontab (may require different privileges)"
            return
        }
    else
        echo "${TEST_ENTRY}" | crontab - 2>/dev/null || {
            warn "Could not modify crontab (may require different privileges)"
            return
        }
    fi

    echo -e "    ${C_GREEN}+ Added:${C_RESET} ${C_DIM}${TEST_ENTRY}${C_RESET}"
    sleep 3

    # Remove test entry (restore original)
    info "Removing test crontab entry (restoring original) …"
    if [[ -n "${ORIGINAL_CRON}" ]]; then
        echo "${ORIGINAL_CRON}" | crontab - 2>/dev/null || true
    else
        crontab -r 2>/dev/null || true
    fi
    echo -e "    ${C_RED}✗ Removed${C_RESET} test entry"

    echo ""
    success "Crontab modification simulation complete"
}

# ──────────────────────────── Simulation 5: Encoded PowerShell ───────────────

sim_encoded_powershell() {
    header "Simulation 5: Encoded PowerShell Simulation"

    explain "Echoes base64-encoded strings that mimic encoded PowerShell"
    explain "commands commonly used in living-off-the-land attacks."
    explain "These are logged and detected by Wazuh command monitoring."
    echo ""
    explain "${C_YELLOW}Expected Wazuh Alerts:${C_RESET}"
    explain "  • Rule 91030 — Potential encoded PowerShell command"
    explain "  • Rule 91031 — Suspicious base64 encoded string"
    explain "  • Sysmon/auditd command-line monitoring alerts"

    pause_for_user

    ensure_test_dir

    # Harmless strings that LOOK like encoded powershell
    local ENCODED_CMDS=(
        "JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0AA=="
        "SQBuAHYAbwBrAGUALQBXAGUAYgBSAGUAcQB1AGUAcwB0ACAALQBVAHIAaQAgAGgAdAB0AHAAcwA6AC8ALwBlAHgAYQBtAHAAbABlAC4AYwBvAG0A"
        "cABvAHcAZQByAHMAaABlAGwAbAAgAC0AZQBuAGMAbwBkAGUAZABjAG8AbQBtAGEAbgBkAA=="
        "RwBlAHQALQBQAHIAbwBjAGUAcwBzACAALQBOAGEAbQBlACAAZQB4AHAAbABvAHIAZQByAA=="
    )

    local LOG_FILE="${TEST_DIR}/encoded_commands.log"

    info "Simulating encoded command patterns …"
    echo ""

    for i in "${!ENCODED_CMDS[@]}"; do
        local cmd="${ENCODED_CMDS[$i]}"
        local idx=$((i + 1))

        # Log it (this is what Wazuh would capture)
        echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] SIMULATED: powershell.exe -EncodedCommand ${cmd}" >> "${LOG_FILE}"

        # Also echo it to trigger command monitoring
        echo -e "    ${C_YELLOW}${idx}.${C_RESET} ${C_DIM}powershell.exe -EncodedCommand${C_RESET} ${cmd:0:40}…"

        # Decode and show what it actually is (for operator awareness)
        local decoded
        decoded=$(echo "${cmd}" | base64 -d 2>/dev/null | tr -d '\0' 2>/dev/null || echo "(decode unavailable)")
        echo -e "       ${C_DIM}Decoded: ${decoded}${C_RESET}"

        sleep 0.5
    done

    # Simulate the actual pattern that triggers detection
    info "Logging simulated encoded commands to ${LOG_FILE}"

    echo ""
    success "Encoded PowerShell simulation complete"
}

# ──────────────────────────── Simulation 6: Privilege Escalation ─────────────

sim_privilege_escalation() {
    header "Simulation 6: Privilege Escalation Attempts"

    explain "Generates logged sudo commands and privilege escalation patterns"
    explain "that Wazuh detects through PAM and sudo log analysis."
    echo ""
    explain "${C_YELLOW}Expected Wazuh Alerts:${C_RESET}"
    explain "  • Rule 5401 — sudo: user NOT in sudoers"
    explain "  • Rule 5402 — sudo: failed attempt"
    explain "  • Rule 5403 — sudo: 3 incorrect password attempts"
    explain "  • Rule 5407 — First time user executes sudo"

    pause_for_user

    ensure_test_dir
    local OS
    OS="$(detect_os)"

    # Pattern 1: Suspicious sudo commands (will be logged by syslog)
    info "Pattern 1: Generating logged sudo activity …"

    local SUSPICIOUS_CMDS=(
        "cat /etc/shadow"
        "useradd backdoor-test"
        "chmod u+s /bin/bash"
        "visudo"
        "passwd root"
    )

    for cmd in "${SUSPICIOUS_CMDS[@]}"; do
        echo -e "    ${C_DIM}→ sudo ${cmd} (logged, not executed)${C_RESET}"
        # Log the pattern without actually executing dangerous commands
        logger -t "sudo" -p auth.warning "SOC-LAB-TEST : TTY=pts/0 ; PWD=/ ; USER=root ; COMMAND=/usr/bin/${cmd}" 2>/dev/null || true
        sleep 0.3
    done

    # Pattern 2: su attempts
    echo ""
    info "Pattern 2: Simulating su failure patterns …"
    for i in 1 2 3; do
        echo -e "    ${C_DIM}→ su attempt ${i} (simulated failure)${C_RESET}"
        logger -t "su" -p auth.warning "SOC-LAB-TEST: FAILED SU (to root) testuser on pts/0" 2>/dev/null || true
        sleep 0.3
    done

    # Pattern 3: SUID binary creation simulation
    echo ""
    info "Pattern 3: SUID binary pattern (harmless test file) …"
    local SUID_TEST="${TEST_DIR}/test_suid_binary"
    echo '#!/bin/bash' > "${SUID_TEST}"
    echo 'echo "SOC-LAB-TEST: This is a harmless SUID test file"' >> "${SUID_TEST}"
    chmod 4755 "${SUID_TEST}" 2>/dev/null || {
        chmod 755 "${SUID_TEST}" 2>/dev/null || true
        warn "Could not set SUID bit (requires root)"
    }
    echo -e "    ${C_YELLOW}Created SUID test binary:${C_RESET} ${SUID_TEST}"
    "${SUID_TEST}" 2>/dev/null || true
    rm -f "${SUID_TEST}"
    echo -e "    ${C_RED}✗ Cleaned up${C_RESET} SUID test binary"

    echo ""
    success "Privilege escalation simulation complete"
}

# ──────────────────────────── Run All ────────────────────────────────────────

sim_run_all() {
    header "Running All Simulations"
    explain "This will execute all 6 simulations sequentially."
    explain "Each simulation is safe and non-destructive."

    pause_for_user

    sim_ssh_brute_force
    separator
    sim_suspicious_processes
    separator
    sim_file_integrity
    separator
    sim_crontab_modification
    separator
    sim_encoded_powershell
    separator
    sim_privilege_escalation

    echo ""
    header "All Simulations Complete"
    info "Check your Wazuh dashboard for generated alerts."
    info "Alerts may take 30–60 seconds to appear depending on configuration."
}

# ──────────────────────────── Menu ───────────────────────────────────────────

show_menu() {
    echo ""
    echo -e "  ${C_BOLD}Select a simulation:${C_RESET}"
    echo ""
    echo -e "    ${C_CYAN}1${C_RESET})  SSH Brute Force           ${C_DIM}— Rapid failed SSH logins${C_RESET}"
    echo -e "    ${C_CYAN}2${C_RESET})  Suspicious Process Chains ${C_DIM}— /tmp executables & chains${C_RESET}"
    echo -e "    ${C_CYAN}3${C_RESET})  File Integrity Changes    ${C_DIM}— Create/modify/delete files${C_RESET}"
    echo -e "    ${C_CYAN}4${C_RESET})  Crontab Modification      ${C_DIM}— Add & remove cron entry${C_RESET}"
    echo -e "    ${C_CYAN}5${C_RESET})  Encoded PowerShell        ${C_DIM}— Base64 command patterns${C_RESET}"
    echo -e "    ${C_CYAN}6${C_RESET})  Privilege Escalation      ${C_DIM}— sudo/su/SUID patterns${C_RESET}"
    echo -e "    ${C_CYAN}7${C_RESET})  ${C_GREEN}Run All Simulations${C_RESET}"
    echo -e "    ${C_CYAN}0${C_RESET})  Exit"
    echo ""
    echo -ne "  ${C_BOLD}Choice [0-7]:${C_RESET} "
}

# ──────────────────────────── Main ───────────────────────────────────────────

main() {
    local AUTO_MODE="false"

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --auto|-a)
                AUTO_MODE="true"
                export AUTO_MODE
                shift
                ;;
            --help|-h)
                echo "Usage: $0 [--auto | --help]"
                echo ""
                echo "Options:"
                echo "  --auto, -a    Run all simulations without prompts"
                echo "  --help, -h    Show this help message"
                exit 0
                ;;
            *)
                error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    export AUTO_MODE

    banner

    local OS
    OS="$(detect_os)"
    info "Detected OS: ${C_GREEN}${OS}${C_RESET}"
    info "Test artifacts: ${C_DIM}${TEST_DIR}${C_RESET}"

    if [[ "${AUTO_MODE}" == "true" ]]; then
        info "Running in ${C_YELLOW}automatic mode${C_RESET} (all simulations)"
        sim_run_all
        cleanup_test_dir
        exit 0
    fi

    # Interactive menu loop
    while true; do
        show_menu
        read -r choice

        case "${choice}" in
            1) sim_ssh_brute_force ;;
            2) sim_suspicious_processes ;;
            3) sim_file_integrity ;;
            4) sim_crontab_modification ;;
            5) sim_encoded_powershell ;;
            6) sim_privilege_escalation ;;
            7) sim_run_all ;;
            0)
                echo ""
                cleanup_test_dir
                info "Goodbye! Check your Wazuh dashboard for alerts. 👋"
                echo ""
                exit 0
                ;;
            *)
                warn "Invalid choice. Please enter 0-7."
                ;;
        esac

        separator
    done
}

main "$@"
