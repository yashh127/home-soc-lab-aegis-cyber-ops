export const initialAlerts = [
  {
    id: 'evt-1001',
    timestamp: '22:31:04',
    level: 12,
    ruleId: 100301,
    description: 'SSH brute-force attack detected (8+ failures in 2 minutes)',
    sourceIp: '18.197.45.112',
    source: 'LINUX / SSHD',
    mitre: 'T1110.001',
    raw: { agent: { id: '001', name: 'wazuh.manager' }, data: { srcip: '18.197.45.112', username: 'root' } }
  },
  {
    id: 'evt-1002',
    timestamp: '22:30:48',
    level: 14,
    ruleId: 100303,
    description: 'Successful login detected after brute-force attack - possible compromise',
    sourceIp: '18.197.45.112',
    source: 'LINUX / SSHD',
    mitre: 'T1078',
    raw: { agent: { id: '001', name: 'wazuh.manager' }, data: { srcip: '18.197.45.112', username: 'admin' } }
  },
  {
    id: 'evt-1003',
    timestamp: '22:30:15',
    level: 10,
    ruleId: 80202,
    description: 'AWS GuardDuty Alert: Trojan:EC2/DNSDataExfiltration detected',
    sourceIp: '34.221.90.14',
    source: 'AWS GUARDDUTY',
    mitre: 'T1048',
    raw: { eventSource: 'guardduty.amazonaws.com', severity: 8.0, instanceId: 'i-091a2b3c4d5e' }
  },
  {
    id: 'evt-1004',
    timestamp: '22:29:50',
    level: 12,
    ruleId: 80200,
    description: 'AWS CloudTrail: S3 Bucket Policy Modified to Public Access',
    sourceIp: '54.210.12.89',
    source: 'AWS CLOUDTRAIL',
    mitre: 'T1562.001',
    raw: { eventName: 'PutBucketAcl', userIdentity: { arn: 'arn:aws:iam::123456789012:user/admin' } }
  },
  {
    id: 'evt-1005',
    timestamp: '22:29:10',
    level: 8,
    ruleId: 100101,
    description: 'Scheduled task/crontab modification detected',
    sourceIp: '127.0.0.1',
    source: 'LINUX / SYSCHECK',
    mitre: 'T1053.003',
    raw: { file: '/etc/crontab', user: 'root', action: 'modified' }
  },
  {
    id: 'evt-1006',
    timestamp: '22:28:33',
    level: 12,
    ruleId: 100103,
    description: 'SUID/SGID binary created - privilege escalation attempt',
    sourceIp: '127.0.0.1',
    source: 'LINUX / AUDIT',
    mitre: 'T1548.001',
    raw: { file: '/tmp/test_suid_binary', permissions: '4755', user: 'www-data' }
  },
  {
    id: 'evt-1007',
    timestamp: '22:27:45',
    level: 10,
    ruleId: 91030,
    description: 'PowerShell Encoded Command Executed (Base64 WebClient Payload)',
    sourceIp: '192.168.1.105',
    source: 'WINDOWS / SYSMON',
    mitre: 'T1059.001',
    raw: { process: 'powershell.exe', commandLine: 'powershell -EncodedCommand JABjAGwAaQ...' }
  },
  {
    id: 'evt-1008',
    timestamp: '22:26:12',
    level: 10,
    ruleId: 60122,
    description: 'Windows RDP Brute-Force Attack Detected (Multiple Logon Failures)',
    sourceIp: '52.67.14.80',
    source: 'WINDOWS / SECURITY',
    mitre: 'T1110.001',
    raw: { targetUser: 'Administrator', failureReason: 'Unknown user name or bad password' }
  }
];

export const generateSampleEvent = () => {
  const sources = [
    { src: 'AWS CLOUDTRAIL', rule: 80200, desc: 'AWS CloudTrail: Unauthorized IAM Role Assumption Attempt', ip: '54.210.12.89', lvl: 10, mitre: 'T1078' },
    { src: 'AWS GUARDDUTY', rule: 80202, desc: 'AWS GuardDuty: CryptoCurrency Mining Activity Observed', ip: '34.221.90.14', lvl: 14, mitre: 'T1496' },
    { src: 'LINUX / SSHD', rule: 100301, desc: 'SSH Brute-Force Failed Password Attempt', ip: '18.197.45.112', lvl: 12, mitre: 'T1110.001' },
    { src: 'WINDOWS / SYSMON', rule: 91030, desc: 'MimiKatz LSA Password Secrets Extraction Attempt', ip: '13.112.8.201', lvl: 15, mitre: 'T1003' },
    { src: 'LINUX / SYSCHECK', rule: 100102, desc: 'SSH authorized_keys File Modified - Possible Persistence', ip: '127.0.0.1', lvl: 10, mitre: 'T1098.004' }
  ];

  const template = sources[Math.floor(Math.random() * sources.length)];
  const time = new Date().toLocaleTimeString();

  return {
    id: `evt-${Date.now()}`,
    timestamp: time,
    level: template.lvl,
    ruleId: template.rule,
    description: template.desc,
    sourceIp: template.ip,
    source: template.src,
    mitre: template.mitre,
    raw: {
      generatedAt: time,
      source: template.src,
      rule: { id: template.rule, level: template.lvl, description: template.desc },
      agent: { name: 'wazuh.manager', ip: '172.18.0.3' }
    }
  };
};
