import React from 'react';
import { ShieldAlert, AlertCircle, Activity, Radio, ShieldCheck, Zap } from 'lucide-react';

export default function SystemAdvisoryWidget({ showHelp }) {
  const advisories = [
    { id: 1, severity: 'HIGH', title: 'CISA KEV Notice: Active Exploitation of SSH Credentials', time: '10m ago' },
    { id: 2, severity: 'CRITICAL', title: 'AWS CloudTrail: Root User Logins Detected Without MFA', time: '24m ago' },
    { id: 3, severity: 'MEDIUM', title: 'Windows Sysmon: Unverified Binary Execution in /tmp', time: '1h ago' }
  ];

  return (
    <div className="cyber-card p-5 flex flex-col h-full border-zinc-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-zinc-900 text-zinc-300 border border-zinc-700">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-cyber text-base font-bold text-white tracking-wide">
              SECURITY ADVISORY & THREAT RADAR
            </h2>
            <p className="text-xs text-zinc-400 font-medium">Real-Time Threat Level Index & US-CERT Bulletins</p>
          </div>
        </div>
        <span className="badge-label bg-zinc-900 border border-zinc-700 text-zinc-200">
          DEFCON 3 ELEVATED
        </span>
      </div>

      {showHelp && (
        <div className="mb-3 text-xs bg-zinc-900/80 p-2.5 rounded-xl border border-zinc-700 text-zinc-300">
          💡 <strong>What is this?</strong> This widget monitors the overall threat risk score (78/100) and displays live global security bulletins from CISA and AWS security advisories.
        </div>
      )}

      {/* Threat Index Gauge Box */}
      <div className="grid grid-cols-2 gap-3 mb-3.5">
        <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-700/60 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            THREAT RISK INDEX
          </div>
          <div className="text-3xl font-extrabold font-cyber text-white my-0.5">
            78<span className="text-xs text-zinc-500 font-mono">/100</span>
          </div>
          <div className="text-[11px] text-zinc-300 font-medium flex items-center gap-1 mt-1">
            <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
            <span>HIGH THREAT STATE</span>
          </div>
        </div>

        <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-700/60 flex flex-col items-center justify-center text-center">
          <div className="text-[10px] font-mono font-semibold text-zinc-400 uppercase tracking-wider mb-1">
            ANALYST SQUAD
          </div>
          <div className="text-sm font-bold font-cyber text-emerald-400 my-1">
            ALPHA-1 (J.A.R.V.I.S.)
          </div>
          <div className="text-[11px] text-emerald-300 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>AUTONOMOUS ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Advisory Feed Stream */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {advisories.map((adv) => (
          <div
            key={adv.id}
            className="p-2.5 rounded-xl bg-zinc-950/90 border border-zinc-800/90 hover:border-zinc-600 transition-colors flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <AlertCircle className={`w-4 h-4 shrink-0 ${
                adv.severity === 'CRITICAL' ? 'text-rose-400' : adv.severity === 'HIGH' ? 'text-amber-400' : 'text-zinc-400'
              }`} />
              <div className="text-xs font-sans text-zinc-200 truncate font-medium">
                {adv.title}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                adv.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                adv.severity === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                'bg-zinc-800 text-zinc-300 border border-zinc-700'
              }`}>
                {adv.severity}
              </span>
              <span className="text-[10px] font-mono text-zinc-500">{adv.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
