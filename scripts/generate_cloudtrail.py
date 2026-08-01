#!/usr/bin/env python3
"""
generate_cloudtrail.py — Generate randomized AWS CloudTrail events.

Creates realistic CloudTrail log entries with a configurable mix of
normal operational events and suspicious/malicious activity patterns.
Output is JSON, compatible with the log_replay.py ingestion format.

Usage:
    python3 generate_cloudtrail.py --count 100 --output sample-logs/cloudtrail_events.json
    python3 generate_cloudtrail.py --suspicious-ratio 0.4 --time-range 48

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
    "eu-west-1", "eu-west-2", "eu-central-1",
    "ap-southeast-1", "ap-northeast-1", "ap-south-1",
]

ACCOUNT_IDS = [
    "123456789012", "234567890123", "345678901234",
    "456789012345", "567890123456", "678901234567",
]

NORMAL_USERNAMES = [
    "admin", "deploy-bot", "terraform-ci", "jenkins-svc",
    "ops-team", "devops-user", "monitoring-svc", "backup-agent",
    "readonly-auditor", "lambda-exec-role",
]

SUSPICIOUS_USERNAMES = [
    "root", "temp-admin", "test-user-999", "unknown-entity",
    "compromised-key", "lateral-move-svc", "exfil-bot",
]

USER_AGENTS = [
    "aws-cli/2.15.30 Python/3.11.8 Linux/5.15.0-1056-aws",
    "aws-sdk-java/2.20.162 Linux/5.15.0",
    "Boto3/1.34.69 Python/3.12.2 Linux/6.5.0",
    "console.amazonaws.com",
    "signin.amazonaws.com",
    "aws-sdk-go/1.51.6 (go1.22.1; linux; amd64)",
    "APN/1.0 HashiCorp/1.0 Terraform/1.7.4",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
]

# Normal operational events — grouped by service
NORMAL_EVENTS: list[tuple[str, str]] = [
    # EC2
    ("ec2.amazonaws.com", "DescribeInstances"),
    ("ec2.amazonaws.com", "DescribeSecurityGroups"),
    ("ec2.amazonaws.com", "DescribeSubnets"),
    ("ec2.amazonaws.com", "DescribeVpcs"),
    ("ec2.amazonaws.com", "DescribeVolumes"),
    ("ec2.amazonaws.com", "DescribeImages"),
    ("ec2.amazonaws.com", "CreateTags"),
    # S3
    ("s3.amazonaws.com", "ListBuckets"),
    ("s3.amazonaws.com", "GetBucketLocation"),
    ("s3.amazonaws.com", "GetBucketAcl"),
    ("s3.amazonaws.com", "GetObject"),
    ("s3.amazonaws.com", "PutObject"),
    ("s3.amazonaws.com", "HeadBucket"),
    # IAM
    ("iam.amazonaws.com", "ListUsers"),
    ("iam.amazonaws.com", "GetUser"),
    ("iam.amazonaws.com", "ListRoles"),
    ("iam.amazonaws.com", "GetRole"),
    ("iam.amazonaws.com", "ListPolicies"),
    ("iam.amazonaws.com", "GetPolicy"),
    # STS
    ("sts.amazonaws.com", "AssumeRole"),
    ("sts.amazonaws.com", "GetCallerIdentity"),
    # CloudWatch / Logs
    ("monitoring.amazonaws.com", "DescribeAlarms"),
    ("logs.amazonaws.com", "DescribeLogGroups"),
    ("logs.amazonaws.com", "GetLogEvents"),
    # Lambda
    ("lambda.amazonaws.com", "ListFunctions"),
    ("lambda.amazonaws.com", "GetFunction"),
    ("lambda.amazonaws.com", "Invoke"),
    # RDS
    ("rds.amazonaws.com", "DescribeDBInstances"),
    ("rds.amazonaws.com", "DescribeDBClusters"),
    # KMS
    ("kms.amazonaws.com", "ListKeys"),
    ("kms.amazonaws.com", "DescribeKey"),
    ("kms.amazonaws.com", "Decrypt"),
    ("kms.amazonaws.com", "Encrypt"),
]

# Suspicious / malicious events
SUSPICIOUS_EVENTS: list[tuple[str, str]] = [
    # Credential abuse
    ("iam.amazonaws.com", "CreateUser"),
    ("iam.amazonaws.com", "CreateAccessKey"),
    ("iam.amazonaws.com", "AttachUserPolicy"),
    ("iam.amazonaws.com", "CreateLoginProfile"),
    ("iam.amazonaws.com", "PutUserPolicy"),
    ("iam.amazonaws.com", "DeleteTrail"),
    # Privilege escalation
    ("iam.amazonaws.com", "AttachRolePolicy"),
    ("iam.amazonaws.com", "CreateRole"),
    ("iam.amazonaws.com", "UpdateAssumeRolePolicy"),
    ("iam.amazonaws.com", "PutRolePolicy"),
    # Reconnaissance
    ("iam.amazonaws.com", "ListAccessKeys"),
    ("iam.amazonaws.com", "ListMFADevices"),
    ("iam.amazonaws.com", "ListAttachedUserPolicies"),
    ("organizations.amazonaws.com", "ListAccounts"),
    ("ec2.amazonaws.com", "DescribeRegions"),
    # Data exfiltration / tampering
    ("s3.amazonaws.com", "PutBucketPolicy"),
    ("s3.amazonaws.com", "DeleteBucketPolicy"),
    ("s3.amazonaws.com", "PutBucketPublicAccessBlock"),
    ("s3.amazonaws.com", "GetBucketPolicy"),
    ("s3.amazonaws.com", "PutBucketAcl"),
    # Security evasion
    ("ec2.amazonaws.com", "StopLogging"),
    ("cloudtrail.amazonaws.com", "DeleteTrail"),
    ("cloudtrail.amazonaws.com", "StopLogging"),
    ("cloudtrail.amazonaws.com", "UpdateTrail"),
    ("guardduty.amazonaws.com", "DeleteDetector"),
    ("config.amazonaws.com", "StopConfigurationRecorder"),
    # EC2 abuse
    ("ec2.amazonaws.com", "RunInstances"),
    ("ec2.amazonaws.com", "AuthorizeSecurityGroupIngress"),
    ("ec2.amazonaws.com", "ModifyInstanceAttribute"),
    ("ec2.amazonaws.com", "CreateKeyPair"),
    # Console login failures
    ("signin.amazonaws.com", "ConsoleLogin"),
]

# Random source IPs
NORMAL_IPS = [
    "10.0.1.50", "10.0.2.100", "172.16.0.25", "172.31.5.10",
    "192.168.1.100", "54.239.28.85", "52.94.133.131",
]

SUSPICIOUS_IPS = [
    "198.51.100.77", "203.0.113.42", "45.33.32.156", "185.220.101.1",
    "91.219.237.11", "77.247.181.163", "104.244.72.115",
    "23.129.64.100",  # Tor exit node patterns
]

# ──────────────────────────── Helpers ────────────────────────────────────────

def random_id(prefix: str = "", length: int = 17) -> str:
    """Generate a random AWS-style resource ID."""
    chars = string.ascii_lowercase + string.digits
    body = "".join(random.choices(chars, k=length))
    return f"{prefix}{body}" if prefix else body


def random_arn(service: str, resource: str, account_id: str, region: str = "") -> str:
    """Build a plausible ARN."""
    region_part = region if region else random.choice(REGIONS)
    return f"arn:aws:{service}:{region_part}:{account_id}:{resource}"


def random_timestamp(base: datetime, time_range_hours: int) -> str:
    """Return an ISO-8601 timestamp within the specified range from base."""
    offset = timedelta(seconds=random.randint(0, time_range_hours * 3600))
    ts = base - offset
    return ts.strftime("%Y-%m-%dT%H:%M:%SZ")


def generate_request_parameters(event_source: str, event_name: str,
                                is_suspicious: bool) -> dict[str, Any]:
    """Generate plausible request parameters for the given event."""
    params: dict[str, Any] = {}

    if "Describe" in event_name or "List" in event_name or "Get" in event_name:
        # Read-only calls usually have minimal or no params
        return params

    if event_name == "RunInstances":
        params = {
            "instanceType": random.choice(["t3.micro", "c5.xlarge", "p3.2xlarge", "g4dn.xlarge"]),
            "imageId": f"ami-{random_id(length=8)}",
            "minCount": 1,
            "maxCount": random.choice([1, 5, 20]) if is_suspicious else 1,
            "subnetId": f"subnet-{random_id(length=8)}",
        }
    elif event_name == "CreateUser":
        params = {"userName": random.choice(SUSPICIOUS_USERNAMES) if is_suspicious else f"svc-{random_id(length=6)}"}
    elif event_name == "CreateAccessKey":
        params = {"userName": random.choice(SUSPICIOUS_USERNAMES) if is_suspicious else random.choice(NORMAL_USERNAMES)}
    elif event_name == "AttachUserPolicy":
        params = {
            "userName": random.choice(SUSPICIOUS_USERNAMES),
            "policyArn": "arn:aws:iam::aws:policy/AdministratorAccess" if is_suspicious
                         else "arn:aws:iam::aws:policy/ReadOnlyAccess",
        }
    elif event_name == "AuthorizeSecurityGroupIngress":
        params = {
            "groupId": f"sg-{random_id(length=8)}",
            "ipPermissions": [
                {
                    "ipProtocol": "tcp",
                    "fromPort": 0 if is_suspicious else 443,
                    "toPort": 65535 if is_suspicious else 443,
                    "ipRanges": [{"cidrIp": "0.0.0.0/0"}] if is_suspicious
                               else [{"cidrIp": "10.0.0.0/8"}],
                }
            ],
        }
    elif event_name == "ConsoleLogin":
        params = {"MFAUsed": "No" if is_suspicious else random.choice(["Yes", "No"])}
    elif event_name == "PutBucketPolicy":
        params = {
            "bucketName": f"company-data-{random_id(length=6)}",
            "policy": '{"Effect":"Allow","Principal":"*","Action":"s3:GetObject"}' if is_suspicious else "{}",
        }
    elif event_name in ("StopLogging", "DeleteTrail"):
        params = {"name": f"management-trail-{random.choice(REGIONS)}"}
    elif event_name == "AssumeRole":
        params = {
            "roleArn": f"arn:aws:iam::{random.choice(ACCOUNT_IDS)}:role/"
                       + (f"admin-{random_id(length=4)}" if is_suspicious else f"service-{random_id(length=4)}"),
            "roleSessionName": random_id(length=12),
        }

    return params


def generate_response_elements(event_name: str, is_suspicious: bool) -> dict[str, Any] | None:
    """Generate plausible response elements."""
    if event_name == "ConsoleLogin":
        if is_suspicious:
            return {"ConsoleLogin": random.choice(["Failure", "Failure", "Failure", "Success"])}
        return {"ConsoleLogin": "Success"}
    if event_name == "CreateAccessKey":
        return {
            "accessKey": {
                "accessKeyId": f"AKIA{random_id(length=16).upper()}",
                "status": "Active",
                "userName": random.choice(SUSPICIOUS_USERNAMES) if is_suspicious else random.choice(NORMAL_USERNAMES),
            }
        }
    if event_name == "RunInstances":
        return {
            "instancesSet": {
                "items": [{"instanceId": f"i-{random_id(length=17)}"} for _ in range(random.randint(1, 3))]
            }
        }
    return None


# ──────────────────────────── Event Builder ──────────────────────────────────

def build_event(is_suspicious: bool, base_time: datetime,
                time_range_hours: int) -> dict[str, Any]:
    """Build a single CloudTrail event record."""

    if is_suspicious:
        event_source, event_name = random.choice(SUSPICIOUS_EVENTS)
        source_ip = random.choice(SUSPICIOUS_IPS)
        username = random.choice(SUSPICIOUS_USERNAMES)
    else:
        event_source, event_name = random.choice(NORMAL_EVENTS)
        source_ip = random.choice(NORMAL_IPS)
        username = random.choice(NORMAL_USERNAMES)

    account_id = random.choice(ACCOUNT_IDS)
    region = random.choice(REGIONS)
    user_agent = random.choice(USER_AGENTS)

    # Determine user identity type
    if "console" in user_agent.lower() or "signin" in event_source:
        user_type = "IAMUser"
        arn = random_arn("iam", f"user/{username}", account_id, region="")
        principal_id = f"AIDA{random_id(length=16).upper()}"
    elif "lambda" in username or "svc" in username or "bot" in username:
        user_type = "AssumedRole"
        role_name = f"role/{username}"
        arn = random_arn("sts", f"assumed-role/{username}/{random_id(length=8)}", account_id, region="")
        principal_id = f"AROA{random_id(length=16).upper()}:{username}"
    else:
        user_type = random.choice(["IAMUser", "AssumedRole"])
        arn = random_arn("iam", f"user/{username}", account_id, region="")
        principal_id = f"AIDA{random_id(length=16).upper()}"

    event_time = random_timestamp(base_time, time_range_hours)
    request_params = generate_request_parameters(event_source, event_name, is_suspicious)
    response_elements = generate_response_elements(event_name, is_suspicious)

    # Determine error for suspicious failed events
    error_code = None
    error_message = None
    if is_suspicious and random.random() < 0.3:
        error_code = random.choice([
            "AccessDenied", "UnauthorizedAccess", "Client.UnauthorizedAccess",
            "Forbidden", "InvalidParameterValue",
        ])
        error_message = f"User: {arn} is not authorized to perform: {event_name} on resource"

    event: dict[str, Any] = {
        "eventVersion": "1.09",
        "userIdentity": {
            "type": user_type,
            "principalId": principal_id,
            "arn": arn,
            "accountId": account_id,
            "userName": username,
            "sessionContext": {
                "attributes": {
                    "creationDate": event_time,
                    "mfaAuthenticated": "false" if is_suspicious else random.choice(["true", "false"]),
                },
            },
        },
        "eventTime": event_time,
        "eventSource": event_source,
        "eventName": event_name,
        "awsRegion": region,
        "sourceIPAddress": source_ip,
        "userAgent": user_agent,
        "requestParameters": request_params if request_params else None,
        "responseElements": response_elements,
        "requestID": str(uuid.uuid4()),
        "eventID": str(uuid.uuid4()),
        "readOnly": event_name.startswith(("Describe", "List", "Get", "Head")),
        "eventType": "AwsApiCall",
        "managementEvent": True,
        "recipientAccountId": account_id,
        "eventCategory": "Management",
    }

    if error_code:
        event["errorCode"] = error_code
        event["errorMessage"] = error_message

    # Remove None values for cleaner output
    event = {k: v for k, v in event.items() if v is not None}

    return event


# ──────────────────────────── ANSI helpers ───────────────────────────────────

class Color:
    RESET   = "\033[0m"
    BOLD    = "\033[1m"
    DIM     = "\033[2m"
    RED     = "\033[91m"
    GREEN   = "\033[92m"
    YELLOW  = "\033[93m"
    CYAN    = "\033[96m"

def c(text: str, color: str) -> str:
    if hasattr(sys.stdout, "isatty") and sys.stdout.isatty():
        return f"{color}{text}{Color.RESET}"
    return text


# ──────────────────────────── CLI ────────────────────────────────────────────

BANNER = r"""
╔══════════════════════════════════════════════════════════╗
║       ☁️  SOC Lab — CloudTrail Event Generator  ☁️       ║
║        Generate realistic AWS CloudTrail events         ║
╚══════════════════════════════════════════════════════════╝
"""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate randomized AWS CloudTrail events for SOC lab testing.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  %(prog)s --count 100 --output cloudtrail_events.json\n"
            "  %(prog)s --suspicious-ratio 0.5 --time-range 48\n"
            "  %(prog)s --count 200 | python3 log_replay.py --source cloudtrail\n"
        ),
    )
    parser.add_argument("--count", "-n", type=int, default=50,
                        help="Number of events to generate (default: 50)")
    parser.add_argument("--output", "-o", default=None,
                        help="Output file path (default: stdout)")
    parser.add_argument("--suspicious-ratio", type=float, default=0.2,
                        help="Ratio of suspicious events, 0.0–1.0 (default: 0.2)")
    parser.add_argument("--time-range", type=int, default=24,
                        help="Time range in hours for event timestamps (default: 24)")
    parser.add_argument("--pretty", action="store_true",
                        help="Pretty-print JSON output")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    # Validate
    if not 0.0 <= args.suspicious_ratio <= 1.0:
        print(c("  ✗ --suspicious-ratio must be between 0.0 and 1.0", Color.RED), file=sys.stderr)
        sys.exit(1)
    if args.count < 1:
        print(c("  ✗ --count must be at least 1", Color.RED), file=sys.stderr)
        sys.exit(1)

    # Print banner to stderr so it doesn't mix with JSON on stdout
    if args.output is None:
        out_stream = sys.stdout
        info_stream = sys.stderr
    else:
        out_stream = None  # will write to file
        info_stream = sys.stderr

    print(c(BANNER, Color.CYAN), file=info_stream)
    print(c("  ▸ Generating events …", Color.BOLD), file=info_stream)
    print(f"    Count ··········· {c(str(args.count), Color.GREEN)}", file=info_stream)
    print(f"    Suspicious ratio  {c(f'{args.suspicious_ratio:.0%}', Color.YELLOW)}", file=info_stream)
    print(f"    Time range ······ {c(f'{args.time_range}h', Color.YELLOW)}", file=info_stream)

    base_time = datetime.now(timezone.utc)
    events: list[dict[str, Any]] = []
    suspicious_count = 0
    normal_count = 0

    for i in range(args.count):
        is_suspicious = random.random() < args.suspicious_ratio
        event = build_event(is_suspicious, base_time, args.time_range)
        events.append(event)
        if is_suspicious:
            suspicious_count += 1
        else:
            normal_count += 1

    # Sort by eventTime for realistic sequencing
    events.sort(key=lambda e: e.get("eventTime", ""))

    # Wrap in CloudTrail Records format
    output = {"Records": events}
    indent = 2 if args.pretty else None
    json_str = json.dumps(output, indent=indent, default=str)

    if args.output:
        from pathlib import Path
        out_path = Path(args.output)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json_str, encoding="utf-8")
        print(f"    Output ·········· {c(args.output, Color.GREEN)}", file=info_stream)
    else:
        print(json_str)

    # Summary
    print(f"\n{c('  ▸ Summary', Color.BOLD)}", file=info_stream)
    print(f"    Normal events ··· {c(str(normal_count), Color.GREEN)}", file=info_stream)
    print(f"    Suspicious events {c(str(suspicious_count), Color.RED)}", file=info_stream)
    print(f"    Total ··········· {c(str(len(events)), Color.CYAN)}", file=info_stream)

    # List some suspicious event names for awareness
    sus_names = set()
    for e in events:
        src = e.get("eventSource", "")
        name = e.get("eventName", "")
        # Check if it's in our suspicious list
        if (src, name) in SUSPICIOUS_EVENTS:
            sus_names.add(name)
    if sus_names:
        print(f"\n    {c('Suspicious events generated:', Color.YELLOW)}", file=info_stream)
        for name in sorted(sus_names):
            print(f"      • {name}", file=info_stream)

    print(f"\n{c('  ✓ Done.', Color.GREEN)}", file=info_stream)


if __name__ == "__main__":
    main()
