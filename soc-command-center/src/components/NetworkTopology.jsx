import React from 'react';
import { Server, Cloud, Shield, Laptop, Database, Cpu, Activity } from 'lucide-react';

export default function NetworkTopology() {
  const nodes = [
    { id: 'cloud', name: 'AWS Cloud (S3/Trail)', icon: Cloud, status: 'ONLINE', ip: 'AWS-GLOBAL', color: 'text-amber-400', border: 'border-amber-500/40' },
    { id: 'firewall', name: 'Boundary Firewall', icon: Shield, status: 'FILTERING', ip: '10.0.0.1', color: 'text-rose-400', border: 'border-rose-500/40' },
    { id: 'manager', name: 'Wazuh SIEM Manager', icon: Server, status: 'ACTIVE', ip: '172.18.0.3', color: 'text-cyan-400', border: 'border-cyan-500/40' },
    { id: 'indexer', name: 'OpenSearch Indexer', icon: Database, status: 'HEALTHY', ip: '172.18.0.2', color: 'text-emerald-400', border: 'border-emerald-500/40' },
    { id: 'endpoints', name: 'Linux/Windows Hosts', icon: Laptop, status: 'MONITORED', ip: '192.168.1.0/24', color: 'text-purple-400', border: 'border-purple-500/40' }
  ];

  return (
    <div className="cyber-card p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h2 className="font-cyber text-sm font-bold text-white tracking-wide">
            ENTERPRISE ASSET & NETWORK EXPOSURE TOPOLOGY
          </h2>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
          <Activity className="w-3 h-3 text-emerald-400 animate-spin" />
          TOPOLOGY LIVE BRIDGED
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 flex-1 items-center">
        {nodes.map((node) => {
          const IconComp = node.icon;
          return (
            <div
              key={node.id}
              className={`p-3 rounded-lg bg-slate-950/80 border ${node.border} flex flex-col items-center text-center transition-all hover:scale-105 group relative`}
            >
              <div className={`p-3 rounded-full bg-slate-900 mb-2 ${node.color} group-hover:scale-110 transition-transform`}>
                <IconComp className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-white font-cyber mb-0.5">{node.name}</div>
              <div className="text-[10px] font-mono text-slate-400">{node.ip}</div>
              <span className={`mt-2 text-[9px] font-mono px-2 py-0.5 rounded font-bold ${node.color} bg-slate-900 border border-slate-800`}>
                ● {node.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
