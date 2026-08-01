#!/usr/bin/env bash
# =============================================================================
# Home SOC Lab — Bootstrap Script
# =============================================================================
# Automates the full setup of a single-node Wazuh SOC lab:
#   1. Prerequisite checks (docker, docker compose, sysctl)
#   2. Directory creation
#   3. Kernel tuning (vm.max_map_count)
#   4. TLS certificate generation
#   5. Stack deployment (docker compose up)
#   6. Health check wait loop with spinner
#   7. Dashboard import (*.ndjson)
#   8. Summary output with credentials & next steps
#
# Usage:
#   ./scripts/setup_lab.sh          # Bootstrap the lab
#   ./scripts/setup_lab.sh --down   # Tear down the lab
#   ./scripts/setup_lab.sh --help   # Show help
#
# Requirements:
#   - Docker Engine ≥ 24.0
#   - Docker Compose v2 (docker compose)
#   - Internet access (to pull images)
#   - sudo / root (for vm.max_map_count on Linux)
# =============================================================================

set -euo pipefail

# =============================================================================
# Color & formatting helpers
# =============================================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

info()    { printf "${BLUE}[INFO]${NC}  %s\n" "$*"; }
success() { printf "${GREEN}[OK]${NC}    %s\n" "$*"; }
warn()    { printf "${YELLOW}[WARN]${NC}  %s\n" "$*"; }
error()   { printf "${RED}[ERROR]${NC} %s\n" "$*" >&2; }
header()  { printf "\n${BOLD}${CYAN}═══ %s ═══${NC}\n\n" "$*"; }

# =============================================================================
# Configuration
# =============================================================================
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
HEALTH_CHECK_TIMEOUT=300   # seconds
HEALTH_CHECK_INTERVAL=5    # seconds
WAZUH_VERSION="${WAZUH_VERSION:-4.9.2}"
CERTS_DIR="${PROJECT_DIR}/config/wazuh_indexer_ssl_certs"
CLUSTER_CERTS_DIR="${PROJECT_DIR}/config/wazuh_cluster_ssl_certs"

# =============================================================================
# Help text
# =============================================================================
show_help() {
    cat <<EOF
${BOLD}Home SOC Lab — Setup Script${NC}

Usage:
  $(basename "$0")           Bootstrap the full Wazuh stack
  $(basename "$0") --down    Tear down containers (preserves volumes)
  $(basename "$0") --nuke    Tear down containers AND destroy all volumes
  $(basename "$0") --help    Show this help message

Environment variables:
  WAZUH_VERSION    Wazuh version to deploy (default: 4.9.2)
EOF
}

# =============================================================================
# Tear-down mode
# =============================================================================
teardown() {
    header "Tearing Down SOC Lab"

    cd "${PROJECT_DIR}"

    if [[ "${1:-}" == "--nuke" ]]; then
        warn "Destroying all containers AND volumes..."
        docker compose down -v --remove-orphans 2>/dev/null || true
        success "All containers and volumes removed."
    else
        info "Stopping containers (volumes preserved)..."
        docker compose down --remove-orphans 2>/dev/null || true
        success "Containers stopped. Data volumes preserved."
    fi

    info "To restart: ./scripts/setup_lab.sh"
    exit 0
}

# =============================================================================
# Parse arguments
# =============================================================================
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    --down)
        teardown
        ;;
    --nuke)
        teardown "--nuke"
        ;;
esac

# =============================================================================
# 1. Prerequisite Checks
# =============================================================================
header "Checking Prerequisites"

# Docker
if command -v docker &>/dev/null; then
    DOCKER_VERSION=$(docker --version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    success "Docker found: v${DOCKER_VERSION}"
else
    error "Docker is not installed. Please install Docker Engine ≥ 24.0"
    error "  → https://docs.docker.com/engine/install/"
    exit 1
fi

# Docker Compose v2
if docker compose version &>/dev/null; then
    COMPOSE_VERSION=$(docker compose version --short 2>/dev/null || docker compose version | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    success "Docker Compose found: v${COMPOSE_VERSION}"
else
    error "Docker Compose v2 is not available."
    error "  → Ensure 'docker compose' (not 'docker-compose') works."
    exit 1
fi

# sysctl (Linux only)
OS_TYPE="$(uname -s)"
if [[ "${OS_TYPE}" == "Linux" ]]; then
    if command -v sysctl &>/dev/null; then
        success "sysctl found (Linux)"
    else
        error "sysctl is required on Linux for kernel parameter tuning."
        exit 1
    fi
elif [[ "${OS_TYPE}" == "Darwin" ]]; then
    info "macOS detected — vm.max_map_count is managed by Docker Desktop."
else
    warn "Unknown OS: ${OS_TYPE} — skipping sysctl check."
fi

# =============================================================================
# 2. Create Required Directories
# =============================================================================
header "Creating Directory Structure"

DIRS=(
    "${PROJECT_DIR}/config/wazuh"
    "${PROJECT_DIR}/config/wazuh/lists"
    "${PROJECT_DIR}/config/sysmon"
    "${PROJECT_DIR}/config/wazuh_indexer_ssl_certs"
    "${PROJECT_DIR}/config/wazuh_cluster_ssl_certs"
    "${PROJECT_DIR}/rules"
    "${PROJECT_DIR}/dashboards"
    "${PROJECT_DIR}/logs"
    "${PROJECT_DIR}/scripts"
)

for dir in "${DIRS[@]}"; do
    mkdir -p "${dir}"
done
success "Directory structure created."

# =============================================================================
# 3. Kernel Tuning (vm.max_map_count)
# =============================================================================
header "Configuring Kernel Parameters"

if [[ "${OS_TYPE}" == "Linux" ]]; then
    CURRENT_MAP_COUNT=$(sysctl -n vm.max_map_count 2>/dev/null || echo "0")
    REQUIRED_MAP_COUNT=262144

    if [[ "${CURRENT_MAP_COUNT}" -lt "${REQUIRED_MAP_COUNT}" ]]; then
        info "Setting vm.max_map_count=${REQUIRED_MAP_COUNT} (current: ${CURRENT_MAP_COUNT})"

        if [[ $EUID -eq 0 ]]; then
            sysctl -w vm.max_map_count=${REQUIRED_MAP_COUNT}
        else
            sudo sysctl -w vm.max_map_count=${REQUIRED_MAP_COUNT}
        fi

        # Persist across reboots
        if ! grep -q "vm.max_map_count" /etc/sysctl.conf 2>/dev/null; then
            echo "vm.max_map_count=${REQUIRED_MAP_COUNT}" | sudo tee -a /etc/sysctl.conf >/dev/null
            info "Persisted to /etc/sysctl.conf"
        fi

        success "vm.max_map_count set to ${REQUIRED_MAP_COUNT}"
    else
        success "vm.max_map_count already ≥ ${REQUIRED_MAP_COUNT} (current: ${CURRENT_MAP_COUNT})"
    fi
elif [[ "${OS_TYPE}" == "Darwin" ]]; then
    info "macOS: vm.max_map_count is handled inside the Docker Desktop VM."
    info "If the indexer fails to start, increase Docker Desktop memory to ≥ 4GB."
    success "No kernel tuning required on macOS."
else
    warn "Skipping kernel tuning for OS: ${OS_TYPE}"
fi

# =============================================================================
# 4. Generate TLS Certificates
# =============================================================================
header "Generating TLS Certificates"

if [[ -f "${CERTS_DIR}/root-ca.pem" ]]; then
    info "TLS certificates already exist in ${CERTS_DIR}"
    success "Using existing certificates."
else
    info "Generating TLS certificates via wazuh-certs-generator..."

    # Create the certs config file
    cat > "${PROJECT_DIR}/config/certs.yml" <<'CERTSEOF'
nodes:
  # Wazuh Indexer nodes
  indexer:
    - name: wazuh.indexer
      ip: "127.0.0.1"

  # Wazuh Server nodes
  server:
    - name: wazuh.manager
      ip: "127.0.0.1"

  # Wazuh Dashboard nodes
  dashboard:
    - name: wazuh.dashboard
      ip: "127.0.0.1"
CERTSEOF

    # Run the certificate generator
    docker run --rm -t \
        -v "${PROJECT_DIR}/config/certs.yml:/config/certs.yml:ro" \
        -v "${CERTS_DIR}:/certificates/" \
        wazuh/wazuh-certs-generator:0.0.2

    if [[ $? -eq 0 && -f "${CERTS_DIR}/root-ca.pem" ]]; then
        success "TLS certificates generated successfully."
    else
        error "Certificate generation failed."
        error "Check Docker access and try again."
        exit 1
    fi

    # Copy certs for cluster SSL (used by manager authd)
    info "Copying certificates for cluster SSL..."
    cp "${CERTS_DIR}/root-ca.pem" "${CLUSTER_CERTS_DIR}/"
    cp "${CERTS_DIR}/wazuh.manager.pem" "${CLUSTER_CERTS_DIR}/"
    cp "${CERTS_DIR}/wazuh.manager-key.pem" "${CLUSTER_CERTS_DIR}/"
    success "Cluster SSL certificates copied."
fi

# Populate Docker named volume indexer_ssl_certs with certificates and native 1000:1000 permissions
info "Populating Docker volume for indexer and dashboard certificates..."
VOL_NAME="home-soc-lab_indexer_ssl_certs"
docker volume create "${VOL_NAME}" >/dev/null 2>&1 || true
docker run --rm -v "${VOL_NAME}:/certs" -v "${CERTS_DIR}:/host_certs:ro" alpine sh -c "
  cp /host_certs/* /certs/
  cp /certs/wazuh.indexer.pem /certs/indexer.pem 2>/dev/null || true
  cp /certs/wazuh.indexer-key.pem /certs/indexer-key.pem 2>/dev/null || true
  cp /certs/wazuh.dashboard.pem /certs/dashboard.pem 2>/dev/null || true
  cp /certs/wazuh.dashboard-key.pem /certs/dashboard-key.pem 2>/dev/null || true
  chown -R 1000:1000 /certs
  chmod 755 /certs
  chmod 644 /certs/*
"
success "Docker cert volume populated with native Linux permissions."

# =============================================================================
# 5. Deploy Stack
# =============================================================================
header "Deploying Wazuh Stack (v${WAZUH_VERSION})"

cd "${PROJECT_DIR}"

info "Pulling latest images..."
docker compose pull 2>&1 | tail -3

info "Starting services..."
docker compose up -d 2>&1

success "Docker Compose services started."

# =============================================================================
# 6. Wait for Health Checks
# =============================================================================
header "Waiting for Services to Become Healthy"

SERVICES=("wazuh.indexer" "wazuh.manager" "wazuh.dashboard")
SPINNER='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
ELAPSED=0

wait_for_health() {
    local service="$1"
    local elapsed=0
    local spin_idx=0

    while [[ ${elapsed} -lt ${HEALTH_CHECK_TIMEOUT} ]]; do
        local status
        status=$(docker inspect --format='{{.State.Health.Status}}' "${service}" 2>/dev/null || echo "not_found")

        case "${status}" in
            healthy)
                printf "\r${GREEN}[✔]${NC} %-25s healthy\n" "${service}"
                return 0
                ;;
            unhealthy)
                printf "\r${RED}[✘]${NC} %-25s unhealthy (check logs)\n" "${service}"
                return 1
                ;;
            *)
                local spin_char="${SPINNER:${spin_idx}:1}"
                printf "\r${YELLOW}[${spin_char}]${NC} %-25s %s (%ds/%ds)" \
                    "${service}" "${status}" "${elapsed}" "${HEALTH_CHECK_TIMEOUT}"
                spin_idx=$(( (spin_idx + 1) % ${#SPINNER} ))
                ;;
        esac

        sleep "${HEALTH_CHECK_INTERVAL}"
        elapsed=$((elapsed + HEALTH_CHECK_INTERVAL))
    done

    printf "\r${RED}[✘]${NC} %-25s timed out after %ds\n" "${service}" "${HEALTH_CHECK_TIMEOUT}"
    return 1
}

ALL_HEALTHY=true
for svc in "${SERVICES[@]}"; do
    if ! wait_for_health "${svc}"; then
        ALL_HEALTHY=false
    fi
done

if [[ "${ALL_HEALTHY}" == "true" ]]; then
    success "All services are healthy!"
else
    warn "Some services did not become healthy within ${HEALTH_CHECK_TIMEOUT}s."
    warn "Check logs with: docker compose logs <service>"
fi

# =============================================================================
# 7. Import Dashboards
# =============================================================================
header "Importing Custom Dashboards"

DASHBOARD_DIR="${PROJECT_DIR}/dashboards"
DASHBOARD_URL="https://localhost:443"
DASHBOARD_USER="${DASHBOARD_USERNAME:-kibanaserver}"
DASHBOARD_PASS="${DASHBOARD_PASSWORD:-kibanaserver}"

# Source .env for credentials if available
if [[ -f "${PROJECT_DIR}/.env" ]]; then
    set -a
    # shellcheck disable=SC1091
    source "${PROJECT_DIR}/.env"
    set +a
    DASHBOARD_USER="${DASHBOARD_USERNAME:-kibanaserver}"
    DASHBOARD_PASS="${DASHBOARD_PASSWORD:-kibanaserver}"
fi

NDJSON_COUNT=$(find "${DASHBOARD_DIR}" -name "*.ndjson" 2>/dev/null | wc -l | tr -d ' ')

if [[ "${NDJSON_COUNT}" -gt 0 ]]; then
    info "Found ${NDJSON_COUNT} dashboard file(s) to import."

    # Wait a few seconds for the dashboard API to be fully ready
    sleep 5

    for ndjson_file in "${DASHBOARD_DIR}"/*.ndjson; do
        filename=$(basename "${ndjson_file}")
        info "Importing: ${filename}..."

        HTTP_CODE=$(curl -sk -o /dev/null -w "%{http_code}" \
            -X POST "${DASHBOARD_URL}/api/saved_objects/_import?overwrite=true" \
            -u "${DASHBOARD_USER}:${DASHBOARD_PASS}" \
            -H "osd-xsrf: true" \
            --form "file=@${ndjson_file}" \
            2>/dev/null || echo "000")

        if [[ "${HTTP_CODE}" == "200" ]]; then
            success "Imported: ${filename}"
        else
            warn "Failed to import ${filename} (HTTP ${HTTP_CODE}). Import manually later."
        fi
    done
else
    info "No .ndjson files found in ${DASHBOARD_DIR}/"
    info "To import dashboards later, place .ndjson files there and re-run."
fi

# =============================================================================
# 8. Summary
# =============================================================================
header "🎉  Home SOC Lab — Ready!"

cat <<EOF

${BOLD}┌──────────────────────────────────────────────────────────────────┐
│                        ACCESS DETAILS                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                │
│  ${CYAN}Wazuh Dashboard${NC}                                               │
│    URL:      ${GREEN}https://localhost:443${NC}                              │
│    Username: ${YELLOW}admin${NC}                                              │
│    Password: ${YELLOW}SecretPassword${NC}                                     │
│                                                                │
│  ${CYAN}Wazuh API${NC}                                                      │
│    URL:      ${GREEN}https://localhost:55000${NC}                             │
│    Username: ${YELLOW}wazuh-wui${NC}                                          │
│    Password: ${YELLOW}MyS3cr3tP4ssw0rd${NC}                                  │
│                                                                │
│  ${CYAN}Agent Enrollment${NC}                                               │
│    Address:  ${GREEN}localhost:1515${NC}                                      │
│    Protocol: TCP                                               │
│                                                                │
│  ${CYAN}Syslog Input${NC}                                                   │
│    Address:  ${GREEN}localhost:514${NC}                                       │
│    Protocol: UDP/TCP                                           │
│                                                                │
└──────────────────────────────────────────────────────────────────┘

${BOLD}NEXT STEPS:${NC}

  1. ${CYAN}Enroll a Linux agent:${NC}
     curl -so wazuh-agent.deb https://packages.wazuh.com/${WAZUH_VERSION}/apt/pool/main/w/wazuh-agent/wazuh-agent_${WAZUH_VERSION}-1_amd64.deb
     sudo WAZUH_MANAGER='<MANAGER_IP>' dpkg -i wazuh-agent.deb
     sudo systemctl enable --now wazuh-agent

  2. ${CYAN}Install Sysmon on Windows endpoints:${NC}
     sysmon64.exe -accepteula -i config/sysmon/sysmonconfig.xml

  3. ${CYAN}Replay test logs:${NC}
     Place JSON files in logs/ and run:
     cat logs/sample.json | nc -q1 localhost 514

  4. ${CYAN}Add custom detection rules:${NC}
     Create .xml files in rules/custom/ and restart:
     docker compose restart wazuh.manager

  5. ${CYAN}View container logs:${NC}
     docker compose logs -f wazuh.manager
     docker compose logs -f wazuh.indexer

  6. ${CYAN}Tear down the lab:${NC}
     ./scripts/setup_lab.sh --down       # Keep data
     ./scripts/setup_lab.sh --nuke       # Destroy everything

EOF

success "Setup complete. Happy hunting! 🔍"
