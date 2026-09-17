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
    <div className="cyber-card p-5 flex flex-col h-full border-zinc-700/80 bg-zinc-900/90">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-700/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-zinc-800 text-white border border-zinc-600 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-cyber text-base font-bold text-white tracking-wide">
              ZERO-TRUST ARCHITECTURE & CLOUD POSTURE (CSPM)
            </h2>
            <p className="text-xs text-zinc-300 font-medium">Continuous Identity Verification & Compliance Scorecard</p>
          </div>
        </div>
        <span className="badge-label bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold shadow-sm">
          96% POSTURE HEALTHY
        </span>
      </div>

      {showHelp && (
        <div className="mb-3 text-xs bg-zinc-800/90 p-3 rounded-xl border border-zinc-600 text-zinc-200 font-sans leading-relaxed">
          💡 <strong>What this demonstrates to recruiters:</strong> Modern cybersecurity relies on "Zero-Trust" (never trust, always verify) and Cloud Security Posture Management (CSPM). This card proves your lab monitors AWS configuration hardening, CIS benchmarks, and continuous workload defense.
        </div>
      )}

      {/* Compliance Scorecards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
        {complianceFrameworks.map((fw, idx) => (
          <div key={idx} className="bg-zinc-850/90 p-3 rounded-xl border border-zinc-700 shadow-sm flex flex-col justify-between">
            <div className="text-[10px] font-mono font-bold text-zinc-300 truncate">{fw.name}</div>
            <div className="text-2xl font-cyber font-extrabold text-white my-0.5">
              {fw.score}<span className="text-xs text-emerald-400">%</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> {fw.status}
              </span>
              <span className="text-zinc-400">{fw.checks}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Zero Trust Posture Checks Stream */}
      <div className="space-y-2 flex-1">
        {postureChecks.map((check, idx) => {
          const IconComponent = check.icon;
          return (
            <div
              key={idx}
              className="p-3 rounded-xl bg-zinc-850/90 border border-zinc-750 hover:border-zinc-500 hover:bg-zinc-800 transition-colors flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300">
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="text-xs font-cyber font-bold text-white mb-0.5 truncate">
                    {check.title}
                  </div>
                  <div className="text-[11px] text-zinc-200 font-sans leading-snug">
                    {plainEnglishMode ? check.plainDesc : check.techDesc}
                  </div>
                </div>
              </div>
              <span className="badge-label bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] shrink-0 font-mono font-bold">
                ● {check.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
