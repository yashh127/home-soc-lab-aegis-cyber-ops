import React from 'react';
import { AlertOctagon, ShieldAlert, AlertTriangle, Info, Server } from 'lucide-react';

export default function KpiMetrics({ stats, showHelp }) {
  const cards = [
    {
      title: 'CRITICAL THREATS',
      subtitle: 'High Severity Attacks (Needs Action)',
      helpText: 'Attacks that breach core security (e.g. Root Login, Privilege Escalation).',
      value: stats.critical,
      icon: AlertOctagon,
      color: 'text-rose-400',
      borderColor: 'border-rose-500/30',
      bgGlow: 'bg-rose-500/10',
      badge: 'URGENT CONTAINMENT',
      badgeColor: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
    },
    {
      title: 'HIGH SEVERITY',
      subtitle: 'Suspicious Behavior & Password Guessing',
      helpText: 'Repeated failed logins, brute force attempts, or unauthorized changes.',
      value: stats.high,
      icon: ShieldAlert,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      bgGlow: 'bg-amber-500/10',
      badge: 'INVESTIGATING',
      badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    },
    {
      title: 'NORMAL & LOW',
      subtitle: 'System Notifications & Warnings',
      helpText: 'Routine system events, minor config updates, or low-risk log entries.',
      value: stats.mediumLow,
      icon: AlertTriangle,
      color: 'text-sky-400',
      borderColor: 'border-sky-500/30',
      bgGlow: 'bg-sky-500/10',
      badge: 'MONITORING',
      badgeColor: 'bg-sky-500/15 text-sky-300 border-sky-500/30'
    },
    {
      title: 'EVENTS ANALYZED',
      subtitle: 'Total Security Logs Ingested',
      helpText: 'Total stream of raw logs collected across all systems and cloud services.',
      value: stats.total,
      icon: Info,
      color: 'text-purple-400',
      borderColor: 'border-purple-500/30',
      bgGlow: 'bg-purple-500/10',
      badge: 'LIVE FEED (514)',
      badgeColor: 'bg-purple-500/15 text-purple-300 border-purple-500/30'
    },
    {
      title: 'SIEM NODES ONLINE',
      subtitle: 'Active Security Services',
      helpText: 'Number of active Wazuh and OpenSearch indexing nodes running healthy.',
      value: stats.activeAgents,
      icon: Server,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgGlow: 'bg-emerald-500/10',
      badge: '100% HEALTHY',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
      {cards.map((c, i) => {
        const IconComponent = c.icon;
        return (
          <div
            key={i}
            className={`cyber-card p-4.5 flex flex-col justify-between border ${c.borderColor} hover:scale-[1.02] transition-all group`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${c.bgGlow} ${c.color} border border-white/5`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <span className={`badge-label ${c.badgeColor}`}>
                {c.badge}
              </span>
            </div>

            <div>
              <div className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{c.title}</div>
              <div className={`text-3xl font-extrabold font-cyber ${c.color} my-1 tracking-tight`}>
                {c.value.toLocaleString()}
              </div>
              <div className="text-xs text-slate-300 font-medium truncate">{c.subtitle}</div>
              {showHelp && (
                <div className="mt-2 text-[11px] text-amber-300/90 bg-amber-950/40 p-2 rounded-lg border border-amber-500/20 leading-tight">
                  💡 {c.helpText}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
