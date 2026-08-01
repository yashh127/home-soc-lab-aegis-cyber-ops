import React from 'react';
import { Cpu, ShieldAlert, Terminal, Layers } from 'lucide-react';

export default function MitreMatrix() {
  const tactics = [
    {
      name: 'INITIAL ACCESS',
      code: 'TA0001',
      techniques: [
        { id: 'T1110.001', name: 'Password Guessing', count: 42, active: true, rule: '100301 / 100302' },
        { id: 'T1190', name: 'Exploit Public App', count: 12, active: false, rule: '5710' }
      ]
    },
    {
      name: 'EXECUTION',
      code: 'TA0002',
      techniques: [
        { id: 'T1059.004', name: 'Unix Shell Script', count: 35, active: true, rule: '100104' },
        { id: 'T1059.001', name: 'PowerShell Encoded', count: 28, active: true, rule: '91030' }
      ]
    },
    {
      name: 'PERSISTENCE',
      code: 'TA0003',
      techniques: [
        { id: 'T1053.003', name: 'Cron Scheduled Job', count: 56, active: true, rule: '100101' },
        { id: 'T1098.004', name: 'SSH Authorized Keys', count: 19, active: true, rule: '100102' }
      ]
    },
    {
      name: 'PRIV ESCALATION',
      code: 'TA0004',
      techniques: [
        { id: 'T1548.001', name: 'SUID/SGID Bits', count: 31, active: true, rule: '100103' },
        { id: 'T1078', name: 'Valid Accounts', count: 24, active: true, rule: '100303' }
      ]
    },
    {
      name: 'CREDENTIAL ACCESS',
      code: 'TA0006',
      techniques: [
        { id: 'T1003', name: 'OS Credential Dumping', count: 18, active: true, rule: '60122' },
        { id: 'T1110', name: 'Brute Force Spray', count: 45, active: true, rule: '100301' }
      ]
    }
  ];

  return (
    <div className="cyber-card p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-purple-400" />
          <h2 className="font-cyber text-sm font-bold text-white tracking-wide">
            MITRE ATT&CK THREAT MATRIX HEATMAP
          </h2>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950 border border-purple-500/30 text-purple-300">
          5 TACTICS COVERED
        </span>
      </div>

      {/* Grid Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 flex-1">
        {tactics.map((tactic, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800 text-center">
              <div className="text-[11px] font-cyber font-bold text-cyan-300">{tactic.name}</div>
              <div className="text-[9px] font-mono text-slate-500">{tactic.code}</div>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              {tactic.techniques.map((tech, tIdx) => (
                <div
                  key={tIdx}
                  className={`p-2.5 rounded border flex flex-col justify-between transition-all cursor-pointer group ${
                    tech.active
                      ? 'bg-rose-950/30 border-rose-500/40 hover:border-rose-500 hover:bg-rose-950/60'
                      : 'bg-slate-900/40 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-mono font-bold text-rose-300">{tech.id}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                      {tech.count}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-slate-200 mt-1 line-clamp-1">{tech.name}</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-1 flex items-center justify-between">
                    <span>Rule SID:</span>
                    <span className="text-cyan-400">{tech.rule}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
