import React from 'react';
import { Globe, ShieldCheck, Zap } from 'lucide-react';

export default function ThreatMap({ activeAttacks, showHelp }) {
  const defaultNodes = [
    { name: 'US-East (Virginia)', x: 26, y: 38, ip: '54.210.12.89', count: 42, type: 'AWS CloudTrail S3 Leak', risk: 'HIGH' },
    { name: 'US-West (Oregon)', x: 18, y: 35, ip: '34.221.90.14', count: 28, type: 'GuardDuty Trojan', risk: 'CRITICAL' },
    { name: 'EU-Central (Frankfurt)', x: 52, y: 30, ip: '18.197.45.112', count: 64, type: 'SSH Brute Force', risk: 'HIGH' },
    { name: 'AP-East (Tokyo)', x: 84, y: 40, ip: '13.112.8.201', count: 19, type: 'MimiKatz Credential Dump', risk: 'CRITICAL' },
    { name: 'SA-East (São Paulo)', x: 36, y: 72, ip: '52.67.14.80', count: 15, type: 'RDP Password Spray', risk: 'MEDIUM' },
  ];

  const socTarget = { name: 'A.E.G.I.S. SENTINEL HUB', x: 50, y: 50, ip: '127.0.0.1 (Protected SIEM)' };

  return (
    <div className="cyber-card p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-sky-500/15">
        <div className="flex items-center gap-2.5">
          <Globe className="w-5 h-5 text-sky-400 animate-spin-slow" />
          <div>
            <h2 className="font-cyber text-base font-bold text-white tracking-wide">
              GLOBAL THREAT & ATTACK TRAJECTORIES
            </h2>
            <p className="text-xs text-slate-400 font-medium">Visualizing attack origin locations targeting your SOC Sentinel Hub</p>
          </div>
        </div>
        <span className="badge-label bg-rose-500/15 border border-rose-500/30 text-rose-300">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          LIVE THREAT ARCS
        </span>
      </div>

      {showHelp && (
        <div className="mb-3 text-xs bg-sky-950/40 p-2.5 rounded-xl border border-sky-500/20 text-sky-200">
          ℹ️ <strong>How to read this map:</strong> The pulsing red dots represent attack origins across AWS Cloud, Windows, and Linux environments. Hover over any node to see the attacker IP address, attack vector, and total event count.
        </div>
      )}

      {/* Map Canvas Box */}
      <div className="relative w-full h-[320px] bg-slate-950/90 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
        {/* Grid Dots */}
        <div 
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        ></div>

        {/* SVG Attack Arcs */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <linearGradient id="attackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {defaultNodes.map((node, idx) => {
            const x1 = `${node.x}%`;
            const y1 = `${node.y}%`;
            const x2 = `${socTarget.x}%`;
            const y2 = `${socTarget.y}%`;

            return (
              <g key={idx}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="url(#attackGrad)"
                  strokeWidth="2"
                  strokeDasharray="6,4"
                  className="animate-pulse"
                />
              </g>
            );
          })}
        </svg>

        {/* Attacker Nodes */}
        {defaultNodes.map((node, idx) => (
          <div
            key={idx}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <div className="relative">
              <div className="w-4 h-4 rounded-full bg-rose-500 animate-ping opacity-75"></div>
              <div className="absolute inset-0 w-4 h-4 rounded-full bg-rose-500 border-2 border-white shadow-lg shadow-rose-500/50"></div>
            </div>

            {/* Tooltip on Hover */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 hidden group-hover:block z-30 w-52 p-3 rounded-xl bg-slate-900/95 border border-rose-500/40 text-xs font-sans text-slate-200 shadow-2xl backdrop-blur-md pointer-events-none">
              <div className="flex items-center justify-between font-bold text-rose-400 mb-1">
                <span>{node.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono">{node.risk}</span>
              </div>
              <div className="text-slate-300 font-mono text-[11px]">IP: {node.ip}</div>
              <div className="text-sky-300 mt-1 font-medium">{node.type}</div>
              <div className="text-emerald-400 font-semibold mt-1 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>{node.count} Threat Events Ingested</span>
              </div>
            </div>
          </div>
        ))}

        {/* Target SOC Center Node */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
          style={{ left: `${socTarget.x}%`, top: `${socTarget.y}%` }}
        >
          <div className="relative flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-sky-500/30 border-2 border-sky-400 animate-pulse shadow-lg shadow-sky-500/50"></div>
            <div className="absolute w-5 h-5 rounded-full bg-sky-400 flex items-center justify-center text-slate-950">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-950 font-bold" />
            </div>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1.5 text-[11px] font-mono font-bold text-sky-300 whitespace-nowrap bg-slate-950/90 px-2.5 py-1 rounded-full border border-sky-500/40 shadow-lg">
            {socTarget.name}
          </div>
        </div>
      </div>

      {/* Legend / Footer */}
      <div className="mt-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-medium text-slate-300">
        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span>AWS S3 Leak</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>GuardDuty Trojan</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
          <span>SSH/RDP Attack</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
          <span>SIEM Protection</span>
        </div>
      </div>
    </div>
  );
}
