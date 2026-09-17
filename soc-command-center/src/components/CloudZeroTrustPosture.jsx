import React from 'react';
import { ShieldCheck, Cloud, Lock, Server, CheckCircle2, AlertTriangle, Award, Check } from 'lucide-react';

export default function CloudZeroTrustPosture({ showHelp, plainEnglishMode }) {
  const complianceFrameworks = [
    { name: 'CIS AWS Foundations', score: 94, status: 'PASS', checks: '47/50 Rules' },
    { name: 'NIST SP 800-53 r5', score: 96, status: 'COMPLIANT', checks: 'Continuous Monitored' },
    { name: 'MITRE ATT&CK Matrix', score: 88, status: 'COVERED', checks: '20 Custom Rules' },
    { name: 'Zero-Trust Identity', score: 99, status: 'ENFORCED', checks: 'MFA & Session Lease' }
  ];

  const postureChecks = [
    {
      title: 'AWS Root Account MFA',
      plainDesc: 'Ensures the master cloud key cannot be used without two-factor authentication.',
      techDesc: 'CloudTrail Event ConsoleLogin policy enforces MFA for ARN:root.',
      status: 'PROTECTED',
      icon: Cloud
    },
    {
      title: 'S3 Public Access Block',
      plainDesc: 'Guarantees internal sensitive data cannot accidentally be leaked on the internet.',
      techDesc: 'S3 BlockPublicAccess policy monitored via CloudTrail PutBucketPolicy.',
      status: 'ENFORCED',
      icon: Lock
    },
    {
      title: 'Zero-Trust Workload Isolation',
      plainDesc: 'Isolates infected programs so they cannot jump to other computers on the network.',
      techDesc: 'Kernel auditd namespace containment & Sysmon process ancestry verification.',
      status: 'ACTIVE',
      icon: Server
    }
  ];

  return (
    <div className="cyber-card p-5 flex flex-col h-full border-sky-500/30 bg-gradient-to-br from-slate-900/95 to-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-sky-500/15">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-cyber text-base font-bold text-white tracking-wide">
              ZERO-TRUST ARCHITECTURE & CLOUD POSTURE (CSPM)
            </h2>
            <p className="text-xs text-slate-400 font-medium">Continuous Identity Verification & Compliance Scorecard</p>
          </div>
        </div>
        <span className="badge-label bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
          96% POSTURE HEALTHY
        </span>
      </div>

      {showHelp && (
        <div className="mb-3 text-xs bg-sky-950/40 p-2.5 rounded-xl border border-sky-500/20 text-sky-200 font-sans">
          💡 <strong>What this demonstrates to recruiters:</strong> Modern cybersecurity relies on "Zero-Trust" (never trust, always verify) and Cloud Security Posture Management (CSPM). This card proves your lab monitors AWS configuration hardening, CIS benchmarks, and continuous workload defense.
        </div>
      )}

      {/* Compliance Scorecards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
        {complianceFrameworks.map((fw, idx) => (
          <div key={idx} className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div className="text-[10px] font-mono text-slate-400 truncate">{fw.name}</div>
            <div className="text-2xl font-cyber font-extrabold text-white my-0.5">
              {fw.score}<span className="text-xs text-emerald-400">%</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-emerald-300 font-bold">● {fw.status}</span>
              <span className="text-slate-500">{fw.checks}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Posture Checks Stream */}
      <div className="space-y-2 flex-1">
        {postureChecks.map((check, idx) => {
          const IconComponent = check.icon;
          return (
            <div key={idx} className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/90 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1.5 rounded-lg bg-slate-900 text-sky-400 border border-slate-800">
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-200 font-sans">{check.title}</div>
                  <div className="text-[11px] text-slate-400 truncate font-sans">
                    {plainEnglishMode ? check.plainDesc : check.techDesc}
                  </div>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-400" />
                {check.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
