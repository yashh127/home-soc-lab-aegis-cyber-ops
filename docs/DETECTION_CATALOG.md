# 🔍 Detection Catalog — Home SOC Lab

> Complete catalog of all 20 custom detection rules organized by threat category, mapped to MITRE ATT&CK, with tuning guidance and false positive considerations.

---

## Table of Contents

- [Windows Attack Detection](#windows-attack-detection)
- [Linux Persistence Detection](#linux-persistence-detection)
- [Cloud Threat Detection (AWS)](#cloud-threat-detection-aws)
- [Brute Force Detection](#brute-force-detection)
- [False Positive Considerations](#false-positive-considerations)
- [Tuning Recommendations](#tuning-recommendations)
- [Adding New Rules](#adding-new-rules)

---

## Windows Attack Detection

**Rule File:** `rules/windows_attacks.xml`
**Log Sources:** Windows Security Event Log, Sysmon, PowerShell Operational Log

| Rule ID | Rule Name | Description | MITRE Technique ID | MITRE Tactic | Severity | Log Source | Notes |
|---------|-----------|-------------|--------------------|--------------|----------|------------|-------|
| 100001 | Mimikatz Credential Dumping | Detects Mimikatz execution via process name, command-line arguments (`sekurlsa::`, `kerberos::`, `lsadump::`), or known hashes. Triggers on Sysmon Event ID 1 (Process Create) with matching patterns. | T1003 — OS Credential Dumping | Credential Access | **Critical** | Sysmon EID 1 | Low false positive rate. May trigger on legitimate security tools that reference similar strings. Correlate with LSASS access (100004). |
| 100002 | Encoded PowerShell Execution | Detects PowerShell invocation with `-EncodedCommand`, `-enc`, or `-e` flags, which are commonly used to obfuscate malicious scripts. Checks for base64-encoded payloads in the command line. | T1059.001 — PowerShell | Execution | **High** | PowerShell EID 4104, Sysmon EID 1 | Some legitimate admin scripts use encoded commands. Whitelist known automation accounts. Decode the base64 payload for investigation. |
| 100003 | New Service Created via CLI | Detects service creation using `sc.exe create` or `New-Service` PowerShell cmdlet. Adversaries install malicious services for persistence or privilege escalation. | T1543.003 — Windows Service | Persistence | **Medium** | Security EID 4697, Sysmon EID 1 | Software installations legitimately create services. Correlate with time of change windows and authorized deployment tools. |
| 100004 | LSASS Memory Access | Detects processes accessing the LSASS process memory, a precursor to credential dumping. Monitors Sysmon Event ID 10 (ProcessAccess) where the target is `lsass.exe`. | T1003.001 — LSASS Memory | Credential Access | **Critical** | Sysmon EID 10 | AV/EDR products legitimately access LSASS. Whitelist known security products by process path. High-fidelity when source is unexpected. |
| 100005 | Suspicious Parent-Child Process | Detects anomalous parent-child process relationships indicative of exploitation or injection (e.g., `winword.exe` spawning `cmd.exe`, `explorer.exe` spawning `powershell.exe` with encoded args). | T1055 — Process Injection | Defense Evasion | **High** | Sysmon EID 1 | Requires well-defined baseline of normal parent-child relationships. May need tuning per environment. Focus on Office apps, browsers spawning shells. |

---

## Linux Persistence Detection

**Rule File:** `rules/linux_persistence.xml`
**Log Sources:** Linux auth.log, syslog, auditd

| Rule ID | Rule Name | Description | MITRE Technique ID | MITRE Tactic | Severity | Log Source | Notes |
|---------|-----------|-------------|--------------------|--------------|----------|------------|-------|
| 100101 | Crontab Modification | Detects modifications to user or system crontabs via `crontab -e`, direct edits to `/etc/crontab`, or new files in `/etc/cron.d/`. Attackers use cron jobs for persistence and recurring execution. | T1053.003 — Cron | Persistence, Execution | **High** | syslog (CRON), auditd | Legitimate cron job changes are common in server environments. Correlate with user context — unexpected users modifying cron are high-priority. |
| 100102 | SSH Authorized Keys Modified | Detects additions or modifications to `~/.ssh/authorized_keys` files. Adversaries inject their public keys to maintain persistent SSH access without passwords. | T1098.004 — SSH Authorized Keys | Persistence | **High** | auditd, syslog | DevOps/SRE teams regularly manage SSH keys. Alert on non-standard users or keys added outside of provisioning workflows. Check key fingerprint against known authorized keys. |
| 100103 | SUID Binary Creation | Detects creation of new files with the SUID bit set (`chmod +s` or `chmod 4xxx`). SUID binaries run with the file owner's privileges, enabling privilege escalation if the owner is root. | T1548.001 — Setuid/Setgid | Privilege Escalation | **Critical** | auditd (chmod, fchmod) | Package managers may set SUID during installation. Maintain a baseline of expected SUID binaries. New SUID binaries outside package management are high-confidence indicators. |
| 100104 | Execution from /tmp Directory | Detects process execution from `/tmp`, `/var/tmp`, or `/dev/shm` directories. These world-writable directories are commonly used by attackers to stage and execute malware. | T1036.005 — Match Legitimate Name or Location | Defense Evasion | **Medium** | auditd (execve), Sysmon for Linux | Some legitimate software uses `/tmp` for execution (e.g., package installers, update scripts). Correlate with file creation time and process ancestry. |

---

## Cloud Threat Detection (AWS)

**Rule File:** `rules/cloud_threats.xml`
**Log Sources:** AWS CloudTrail, AWS GuardDuty

| Rule ID | Rule Name | Description | MITRE Technique ID | MITRE Tactic | Severity | Log Source | Notes |
|---------|-----------|-------------|--------------------|--------------|----------|------------|-------|
| 100201 | AWS Console Login Without MFA | Detects IAM user console logins where MFA was not used (`additionalEventData.MFAUsed == "No"`). Non-MFA logins increase the risk of credential-based account takeover. | T1078 — Valid Accounts | Initial Access | **High** | CloudTrail (ConsoleLogin) | Federated/SSO logins may not use IAM MFA. Exclude service accounts and federated identities. Check if MFA is enforced via IAM policy. |
| 100202 | S3 Bucket Made Public | Detects S3 bucket policy or ACL changes that result in public access (`PutBucketPolicy`, `PutBucketAcl` with public grants). Public S3 buckets are a leading cause of cloud data breaches. | T1530 — Data from Cloud Storage | Collection | **Critical** | CloudTrail (S3 API) | Some buckets legitimately serve public content (e.g., static websites). Maintain an allowlist of intentionally public buckets. Immediate response required for non-allowlisted buckets. |
| 100203 | New IAM User Created | Detects IAM `CreateUser` API calls. Unauthorized user creation may indicate an attacker establishing persistence in the AWS account. | T1136.003 — Cloud Account | Persistence | **Medium** | CloudTrail (CreateUser) | IAM user creation is routine in managed environments. Correlate with the identity that created the user — unexpected principals are high-priority. Check for immediately attached admin policies. |
| 100204 | Root Account Usage | Detects any API call made with the AWS root account credentials. Root usage should be near-zero in well-managed environments and may indicate compromise or policy violation. | T1078.004 — Cloud Accounts | Privilege Escalation | **Critical** | CloudTrail (root identity) | A small number of actions require root (e.g., account settings, certain billing operations). All other root usage is suspicious. Enforce root MFA hardware token. |
| 100205 | Crypto Mining Activity (GuardDuty) | Detects GuardDuty findings of type `CryptoCurrency:EC2/BitcoinTool*` indicating EC2 instances communicating with known cryptocurrency mining pools. | T1496 — Resource Hijacking | Impact | **Critical** | GuardDuty | Very low false positive rate for GuardDuty crypto findings. Indicates instance compromise. Immediate isolation required. Check for IAM credential exfiltration from the instance role. |
| 100206 | Command & Control Communication (GuardDuty) | Detects GuardDuty findings indicating EC2 instances communicating with known command-and-control (C2) servers, including `Backdoor:EC2/C&CActivity*` and `Trojan:EC2/C&CActivity*`. | T1071 — Application Layer Protocol | Command and Control | **Critical** | GuardDuty | Investigate the instance immediately. Capture network flow logs and memory. Check for unauthorized outbound connections and data exfiltration. |
| 100207 | CloudTrail Logging Disabled | Detects `StopLogging` or `DeleteTrail` API calls that would disable CloudTrail logging. Disabling logging is a common attacker action to cover tracks. | T1562.008 — Disable Cloud Logs | Defense Evasion | **Critical** | CloudTrail (StopLogging, DeleteTrail) | Extremely high-fidelity detection. CloudTrail should never be disabled in production. Immediate investigation and re-enablement required. Set up an SCP to prevent trail deletion. |
| 100208 | Excessive AccessDenied Errors | Detects a high volume of `AccessDenied` or `UnauthorizedAccess` errors from a single IAM principal within a short time window (frequency-based rule: >10 in 120 seconds). Indicates reconnaissance or misconfigured automation. | T1580 — Cloud Infrastructure Discovery | Discovery | **Medium** | CloudTrail (ErrorCode) | Misconfigured applications and overly restricted policies generate legitimate AccessDenied errors. Tune the threshold based on environment baseline. Investigate the principal's intended actions. |

---

## Brute Force Detection

**Rule File:** `rules/brute_force.xml`
**Log Sources:** Linux auth.log, Windows Security Event Log

| Rule ID | Rule Name | Description | MITRE Technique ID | MITRE Tactic | Severity | Log Source | Notes |
|---------|-----------|-------------|--------------------|--------------|----------|------------|-------|
| 100301 | SSH Brute-Force Attack | Detects multiple failed SSH login attempts from a single source IP within a short time window (frequency-based rule: >5 failures in 60 seconds). Indicates password guessing or credential stuffing. | T1110.001 — Password Guessing | Credential Access | **High** | auth.log (sshd) | Internet-facing SSH servers will generate frequent alerts. Use geo-IP enrichment to prioritize unexpected source countries. Consider fail2ban integration for automated blocking. |
| 100302 | RDP Brute-Force Attack | Detects multiple failed RDP login attempts (Event ID 4625, Logon Type 10) from a single source IP within a short time window (frequency-based rule: >5 failures in 60 seconds). | T1110.001 — Password Guessing | Credential Access | **High** | Security EID 4625 | RDP should not be exposed to the internet. If alerts fire from external IPs, the immediate priority is closing the RDP exposure. NLA misconfiguration can cause false positives from legitimate users. |
| 100303 | Successful Login After Brute-Force | Detects a successful authentication event (SSH or RDP) from a source IP that previously triggered a brute-force alert (100301 or 100302). This correlation indicates a likely account compromise. | T1078 — Valid Accounts | Initial Access | **Critical** | auth.log (sshd), Security EID 4624 | High-fidelity composite rule. Requires prior 100301 or 100302 alert from the same source IP. Immediate containment: disable the compromised account, block the source IP, and begin forensic investigation. |

---

## False Positive Considerations

Understanding and managing false positives is critical for maintaining analyst trust in the detection system. Below are general considerations that apply across rule categories:

### Common False Positive Sources

| Source | Affected Rules | Mitigation |
|--------|---------------|------------|
| **Automated deployment tools** (Ansible, Puppet, Chef) | 100003, 100101, 100102, 100103 | Whitelist service accounts and CI/CD pipeline IPs |
| **Security scanning tools** (Nessus, Qualys, CrowdStrike) | 100001, 100004, 100005 | Whitelist scanner process paths and source IPs |
| **Package managers** (apt, yum, Windows Update) | 100003, 100103, 100104 | Correlate with scheduled maintenance windows |
| **Federated identity / SSO** | 100201 | Exclude federated login events from MFA checks |
| **Terraform / CloudFormation** | 100203, 100202 | Whitelist infrastructure-as-code IAM principals |
| **Misconfigured applications** | 100208 | Tune frequency thresholds and exclude known app service accounts |

### False Positive Handling Workflow

1. **Triage** — Assess if the alert represents a true or false positive
2. **Document** — Record the false positive source and reason
3. **Tune** — Add exceptions to the rule (whitelist entries, adjusted thresholds)
4. **Validate** — Confirm the tuning does not suppress true positives
5. **Review** — Periodically review exceptions to ensure they remain valid

---

## Tuning Recommendations

### Frequency-Based Rules (100208, 100301, 100302)

| Parameter | Default | Low-Noise Environment | High-Traffic Environment |
|-----------|---------|----------------------|--------------------------|
| `<frequency>` | 5-10 | 3-5 | 15-20 |
| `<timeframe>` | 60-120s | 120-300s | 30-60s |
| `<ignore>` | Not set | 60s | 30s |

### CDB List Enrichment

The `malicious_ips.txt` CDB list enhances detection accuracy. Keep it updated:

```bash
# Add a known malicious IP
echo "203.0.113.42:" >> config/wazuh/lists/malicious_ips.txt

# Reload the list without restarting
/var/ossec/bin/wazuh-control reload
```

### Severity Level Adjustments

Wazuh rule levels map to severity as follows:

| Level Range | Severity | Recommended Action |
|-------------|----------|-------------------|
| 1-4 | Low | Log only — no analyst notification |
| 5-8 | Medium | Queue for analyst review (next business day) |
| 9-12 | High | Alert analyst immediately (within 1 hour) |
| 13-15 | Critical | Page on-call analyst (within 15 minutes) |

Adjust rule `<level>` values based on your environment's risk tolerance and analyst capacity.

---

## Adding New Rules

### Step 1: Choose the Correct Rule File

| Category | File | ID Range |
|----------|------|----------|
| Windows Attacks | `rules/windows_attacks.xml` | 100001-100099 |
| Linux Persistence | `rules/linux_persistence.xml` | 100100-100199 |
| Cloud Threats | `rules/cloud_threats.xml` | 100200-100299 |
| Brute Force | `rules/brute_force.xml` | 100300-100399 |
| Custom / Other | Create new file | 100400+ |

### Step 2: Write the Rule

```xml
<group name="custom,new_category,">

  <rule id="100401" level="12">
    <decoded_as>json</decoded_as>
    <field name="event.type">^suspicious_event$</field>
    <description>Description of what this rule detects</description>
    <mitre>
      <id>T1234</id>
    </mitre>
    <options>no_full_log</options>
    <group>attack,mitre_tactic,</group>
  </rule>

</group>
```

### Step 3: Add a Decoder (If Needed)

If the log format is not already decoded, add a custom decoder to `config/wazuh/local_decoders.xml`:

```xml
<decoder name="custom_decoder">
  <prematch>^custom_app: </prematch>
  <regex>^custom_app: (\S+) (\S+) (.+)$</regex>
  <order>user, action, details</order>
</decoder>
```

### Step 4: Test the Rule

```bash
# Use the Wazuh rule testing tool
/var/ossec/bin/wazuh-logtest

# Paste a sample log event and verify it matches the expected rule
```

### Step 5: Deploy

```bash
# Restart the Wazuh Manager to load new rules
docker compose restart wazuh.manager

# Or reload rules without full restart
docker compose exec wazuh.manager /var/ossec/bin/wazuh-control reload
```

### Step 6: Update This Catalog

Add the new rule to the appropriate table in this document with all required fields: Rule ID, Rule Name, Description, MITRE Technique ID, MITRE Tactic, Severity Level, Log Source, and Notes.
