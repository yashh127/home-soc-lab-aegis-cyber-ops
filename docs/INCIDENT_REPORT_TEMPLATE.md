# 📝 Incident Report Template — Home SOC Lab

> Standardized incident report template for documenting security incidents detected by the Home SOC Lab SIEM. Includes a blank template and a completed example.

---

## Table of Contents

- [Blank Template](#blank-template)
- [Completed Example — SSH Brute-Force Compromise](#completed-example--ssh-brute-force-compromise)

---

## Blank Template

Copy the template below and fill in all sections when documenting an incident.

---

### Incident Metadata

| Field | Value |
|-------|-------|
| **Incident ID** | INC-YYYY-NNNN |
| **Date/Time Detected** | YYYY-MM-DD HH:MM:SS (UTC) |
| **Date/Time Resolved** | YYYY-MM-DD HH:MM:SS (UTC) |
| **Analyst Name** | [Your Name] |
| **Severity** | ☐ Critical  ☐ High  ☐ Medium  ☐ Low |
| **Status** | ☐ Open  ☐ Investigating  ☐ Contained  ☐ Remediated  ☐ Closed |
| **Classification** | [e.g., Brute Force, Credential Theft, Data Exfiltration, Malware] |

---

### 1. Executive Summary

> Provide a 2-4 sentence high-level summary of the incident, including: what was detected, what was impacted, and what the outcome was. This section should be understandable by non-technical stakeholders.

[Write summary here]

---

### 2. Detection Details

| Field | Value |
|-------|-------|
| **Rule ID** | [e.g., 100301] |
| **Rule Name** | [e.g., SSH Brute-Force Attack Detected] |
| **MITRE ATT&CK Technique** | [e.g., T1110.001 — Password Guessing] |
| **MITRE ATT&CK Tactic** | [e.g., Credential Access] |
| **Alert Severity Level** | [e.g., Level 12 — High] |
| **Detection Source** | [e.g., Wazuh Manager — auth.log decoder] |
| **Alert Timestamp** | YYYY-MM-DD HH:MM:SS (UTC) |

**Alert Data (Key Fields):**

```json
{
  "Paste relevant alert JSON fields here"
}
```

---

### 3. Investigation Steps

Document each investigation step in chronological order:

1. **[Step Title]** — [Description of what was done and what was found]
2. **[Step Title]** — [Description of what was done and what was found]
3. **[Step Title]** — [Description of what was done and what was found]
4. **[Step Title]** — [Description of what was done and what was found]
5. **[Step Title]** — [Description of what was done and what was found]

---

### 4. Affected Systems

| Hostname | IP Address | Role | Operating System | Impact |
|----------|------------|------|------------------|--------|
| [hostname] | [IP] | [role] | [OS] | [description of impact] |

---

### 5. Timeline of Events

| Timestamp (UTC) | Event | Source | Details |
|-----------------|-------|--------|---------|
| YYYY-MM-DD HH:MM:SS | [event] | [log source] | [details] |
| YYYY-MM-DD HH:MM:SS | [event] | [log source] | [details] |
| YYYY-MM-DD HH:MM:SS | [event] | [log source] | [details] |

---

### 6. Root Cause Analysis

> Describe the root cause of the incident. What vulnerability, misconfiguration, or gap allowed the incident to occur?

[Write root cause analysis here]

---

### 7. Containment Actions Taken

> List all immediate containment actions taken to stop the attack and prevent further damage.

- [ ] [Containment action 1]
- [ ] [Containment action 2]
- [ ] [Containment action 3]

---

### 8. Remediation Steps

> List all remediation actions required to fully resolve the incident and prevent recurrence.

- [ ] [Remediation step 1]
- [ ] [Remediation step 2]
- [ ] [Remediation step 3]

---

### 9. Lessons Learned

> What could have prevented this incident? What should be improved in detection, response, or infrastructure?

| Area | Finding | Recommendation |
|------|---------|----------------|
| Detection | [finding] | [recommendation] |
| Response | [finding] | [recommendation] |
| Infrastructure | [finding] | [recommendation] |
| Policy | [finding] | [recommendation] |

---

### 10. Appendix

#### A. Raw Logs

```
[Paste relevant raw log entries here]
```

#### B. Screenshots

> Attach relevant screenshots of dashboard alerts, investigation queries, or forensic evidence.

#### C. Indicators of Compromise (IOCs)

| Type | Value | Context |
|------|-------|---------|
| IP Address | [IP] | [context] |
| Domain | [domain] | [context] |
| File Hash (SHA256) | [hash] | [context] |
| User Account | [username] | [context] |

---
---

## Completed Example — SSH Brute-Force Compromise

### Incident Metadata

| Field | Value |
|-------|-------|
| **Incident ID** | INC-2025-0042 |
| **Date/Time Detected** | 2025-03-15 14:23:17 (UTC) |
| **Date/Time Resolved** | 2025-03-15 16:45:00 (UTC) |
| **Analyst Name** | Yash (SOC Analyst) |
| **Severity** | ☒ Critical  ☐ High  ☐ Medium  ☐ Low |
| **Status** | ☒ Closed |
| **Classification** | Brute Force → Account Compromise → Persistence |

---

### 1. Executive Summary

An SSH brute-force attack originating from IP address 203.0.113.42 was detected targeting the production web server `prod-web-01` (10.0.1.50). After approximately 847 failed login attempts over 12 minutes, the attacker successfully authenticated to the `deploy` user account. Post-compromise investigation revealed the attacker accessed `/etc/shadow`, created a new privileged user account (`svc-backup`), and installed a crontab entry for persistence. The incident was contained by blocking the source IP, disabling the compromised account, and removing the persistence mechanisms.

---

### 2. Detection Details

| Field | Value |
|-------|-------|
| **Rule ID** | 100301 (initial), 100303 (follow-up) |
| **Rule Name** | SSH Brute-Force Attack Detected → Successful Login After Brute-Force |
| **MITRE ATT&CK Technique** | T1110.001 — Password Guessing, T1078 — Valid Accounts |
| **MITRE ATT&CK Tactic** | Credential Access → Initial Access |
| **Alert Severity Level** | Level 12 (High) → Level 15 (Critical) |
| **Detection Source** | Wazuh Manager — auth.log decoder |
| **Alert Timestamp** | 2025-03-15 14:23:17 (UTC) |

**Alert Data (Rule 100301 — Brute-Force):**

```json
{
  "rule": {
    "id": "100301",
    "level": 12,
    "description": "SSH brute-force attack detected",
    "mitre": {
      "id": ["T1110.001"],
      "tactic": ["Credential Access"]
    }
  },
  "agent": {
    "name": "prod-web-01",
    "ip": "10.0.1.50"
  },
  "data": {
    "srcip": "203.0.113.42",
    "srcport": "44892",
    "dstuser": "deploy",
    "program_name": "sshd"
  },
  "frequency": 47,
  "timeframe": 60
}
```

**Alert Data (Rule 100303 — Successful Login After Brute-Force):**

```json
{
  "rule": {
    "id": "100303",
    "level": 15,
    "description": "Successful login after brute-force attempt",
    "mitre": {
      "id": ["T1078"],
      "tactic": ["Initial Access"]
    }
  },
  "agent": {
    "name": "prod-web-01",
    "ip": "10.0.1.50"
  },
  "data": {
    "srcip": "203.0.113.42",
    "dstuser": "deploy",
    "action": "accepted"
  }
}
```

---

### 3. Investigation Steps

1. **Verified brute-force alert** — Confirmed Rule 100301 fired at 14:23:17 UTC with 47 failed `sshd` authentication attempts from 203.0.113.42 in 60 seconds against user `deploy` on `prod-web-01`.

2. **Checked for successful login** — Rule 100303 fired at 14:35:42 UTC confirming a successful SSH login from the same source IP (203.0.113.42) to user `deploy`. Correlation confirmed: the brute-force was successful.

3. **Source IP reputation check** — Queried AbuseIPDB and VirusTotal for 203.0.113.42. Result: IP flagged in AbuseIPDB with 94% confidence score, associated with SSH brute-force campaigns. GeoIP: Eastern Europe.

4. **Reviewed post-authentication activity** — Examined auth.log and command history for the `deploy` user session originating from 203.0.113.42:
   - 14:35:52 — `cat /etc/shadow` (accessed password hashes)
   - 14:36:15 — `useradd -m -G sudo svc-backup` (created new privileged user)
   - 14:36:28 — `echo 'svc-backup:P@ssw0rd123' | chpasswd` (set password for new user)
   - 14:37:01 — `crontab -e` (installed persistence via cron)

5. **Examined crontab entry** — Found the following entry in `svc-backup` crontab: `*/5 * * * * /tmp/.update-check.sh` — a reverse shell script connecting to 198.51.100.77:4444.

6. **Checked for lateral movement** — Reviewed auth.log across all hosts for logins from 10.0.1.50 or by users `deploy`/`svc-backup`. No lateral movement detected.

7. **Assessed data exposure** — Confirmed `/etc/shadow` was read. The file contained hashed passwords for 12 system accounts. No evidence of exfiltration beyond the SSH session.

---

### 4. Affected Systems

| Hostname | IP Address | Role | Operating System | Impact |
|----------|------------|------|------------------|--------|
| prod-web-01 | 10.0.1.50 | Production Web Server | Ubuntu 22.04 LTS | Compromised — unauthorized access, credential theft, persistence installed |

---

### 5. Timeline of Events

| Timestamp (UTC) | Event | Source | Details |
|-----------------|-------|--------|---------|
| 2025-03-15 14:22:30 | Brute-force begins | auth.log | First failed SSH login from 203.0.113.42 for user `deploy` |
| 2025-03-15 14:23:17 | Rule 100301 fires | Wazuh Alert | SSH brute-force threshold exceeded (47 failures in 60s) |
| 2025-03-15 14:35:42 | Successful SSH login | auth.log | `deploy` user authenticated from 203.0.113.42 |
| 2025-03-15 14:35:42 | Rule 100303 fires | Wazuh Alert | Successful login after brute-force detected (Critical) |
| 2025-03-15 14:35:52 | Shadow file accessed | command history | Attacker ran `cat /etc/shadow` |
| 2025-03-15 14:36:15 | New user created | auth.log | `svc-backup` user created with sudo privileges |
| 2025-03-15 14:36:15 | Rule 100101 fires | Wazuh Alert | Suspicious user creation detected |
| 2025-03-15 14:37:01 | Crontab modified | syslog (CRON) | Persistence installed: reverse shell every 5 minutes |
| 2025-03-15 14:37:01 | Rule 100101 fires | Wazuh Alert | Crontab modification detected |
| 2025-03-15 14:45:00 | Analyst begins investigation | SOC Workflow | Alert triaged, investigation initiated |
| 2025-03-15 15:10:00 | Source IP blocked | iptables | 203.0.113.42 blocked via firewall rule |
| 2025-03-15 15:15:00 | Compromised account disabled | auth.log | `deploy` account locked, SSH key removed |
| 2025-03-15 15:20:00 | Backdoor user removed | auth.log | `svc-backup` account deleted, home directory removed |
| 2025-03-15 15:22:00 | Persistence removed | syslog (CRON) | Malicious crontab entry and `/tmp/.update-check.sh` deleted |
| 2025-03-15 15:30:00 | Credential reset initiated | IAM Workflow | Password reset forced for all 12 accounts in `/etc/shadow` |
| 2025-03-15 16:45:00 | Incident closed | SOC Workflow | All containment and remediation actions verified complete |

---

### 6. Root Cause Analysis

The incident was caused by a **weak password on the `deploy` service account** combined with **SSH password authentication being enabled** on an internet-facing server. The `deploy` account used a dictionary-vulnerable password (`deploy2024`) that the attacker was able to guess through brute-force within approximately 847 attempts.

**Contributing factors:**
- SSH password authentication was enabled (key-only authentication was not enforced)
- No rate limiting or account lockout was configured for SSH
- The `deploy` account had excessive privileges (sudo group membership)
- fail2ban was not installed or configured on the server
- No network-level restriction on SSH access (no bastion/jump host requirement)

---

### 7. Containment Actions Taken

- [x] **Blocked source IP** — Added 203.0.113.42 to iptables deny rules and Wazuh active response blocklist
- [x] **Disabled compromised account** — Locked the `deploy` user account (`usermod -L deploy`)
- [x] **Removed SSH keys** — Deleted all entries from `/home/deploy/.ssh/authorized_keys`
- [x] **Killed active sessions** — Terminated all SSH sessions from 203.0.113.42
- [x] **Removed backdoor user** — Deleted `svc-backup` account and home directory (`userdel -r svc-backup`)
- [x] **Removed crontab persistence** — Deleted malicious crontab entry and `/tmp/.update-check.sh` script
- [x] **Blocked C2 IP** — Added 198.51.100.77 to firewall deny rules

---

### 8. Remediation Steps

- [x] **Force password reset** — Reset passwords for all 12 accounts whose hashes were in `/etc/shadow`
- [x] **Disable SSH password authentication** — Set `PasswordAuthentication no` in `/etc/ssh/sshd_config`
- [x] **Install fail2ban** — Configured to ban IPs after 3 failed attempts for 1 hour
- [x] **Implement SSH key-only authentication** — Distributed SSH keys to authorized users
- [ ] **Implement bastion host** — Route all SSH access through a hardened jump server (scheduled)
- [ ] **Reduce `deploy` account privileges** — Remove from sudo group, implement least-privilege (scheduled)
- [ ] **Deploy SSH certificate authentication** — Replace static keys with short-lived certificates (planned)
- [x] **Update Wazuh active response** — Configured automatic IP blocking on Rule 100301 trigger

---

### 9. Lessons Learned

| Area | Finding | Recommendation |
|------|---------|----------------|
| **Detection** | Rule 100301 fired within 1 minute of brute-force start, but the 12-minute gap before successful login was not flagged as escalating severity | Implement a rule that increases alert severity as brute-force duration extends |
| **Response** | 10-minute gap between Rule 100303 (critical) firing and analyst investigation start | Configure PagerDuty/Slack integration for Level 15 alerts to reduce response time to <5 minutes |
| **Infrastructure** | SSH password authentication was enabled on a production server | Enforce key-only SSH authentication across all servers via configuration management |
| **Policy** | The `deploy` service account had a weak, human-chosen password | Implement a password policy requiring 16+ character randomly generated passwords for service accounts |
| **Monitoring** | Post-compromise actions (shadow access, user creation) generated separate low-priority alerts that were not correlated | Build composite rules that chain brute-force → login → post-exploitation into a single escalating incident |

---

### 10. Appendix

#### A. Raw Logs

```
Mar 15 14:22:30 prod-web-01 sshd[28451]: Failed password for deploy from 203.0.113.42 port 44892 ssh2
Mar 15 14:22:31 prod-web-01 sshd[28453]: Failed password for deploy from 203.0.113.42 port 44894 ssh2
Mar 15 14:22:31 prod-web-01 sshd[28455]: Failed password for deploy from 203.0.113.42 port 44896 ssh2
[... 844 similar entries ...]
Mar 15 14:35:42 prod-web-01 sshd[29102]: Accepted password for deploy from 203.0.113.42 port 45738 ssh2
Mar 15 14:35:42 prod-web-01 sshd[29102]: pam_unix(sshd:session): session opened for user deploy(uid=1001) by (uid=0)
Mar 15 14:36:15 prod-web-01 useradd[29115]: new user: name=svc-backup, UID=1002, GID=1002, home=/home/svc-backup, shell=/bin/bash
Mar 15 14:37:01 prod-web-01 CRON[29130]: (svc-backup) REPLACE (*/5 * * * * /tmp/.update-check.sh)
```

#### B. Screenshots

> _Dashboard screenshots would be attached here showing the alert timeline, brute-force visualization, and post-compromise activity._

#### C. Indicators of Compromise (IOCs)

| Type | Value | Context |
|------|-------|---------|
| IP Address | 203.0.113.42 | Brute-force source — SSH password guessing |
| IP Address | 198.51.100.77 | C2 server — reverse shell destination (port 4444) |
| File Path | /tmp/.update-check.sh | Persistence — reverse shell script |
| User Account | svc-backup | Backdoor account created by attacker |
| User Account | deploy | Compromised service account |
| Crontab Entry | `*/5 * * * * /tmp/.update-check.sh` | Persistence mechanism — T1053.003 |
