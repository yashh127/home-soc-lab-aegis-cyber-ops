import React, { useState } from 'react';
import { Terminal, Search, Filter, ShieldAlert, ChevronRight, Eye, AlertOctagon } from 'lucide-react';

export default function LiveAlertStream({ alerts, onInspectAlert }) {
  const [search, setSearch] = useState('');
  const [filterSource, setFilterSource] = useState('ALL');

  const sources = ['ALL', 'CLOUDTRAIL', 'GUARDDUTY', 'LINUX', 'WINDOWS'];

  const filteredAlerts = alerts.filter(a => {
    const matchesSearch = 
      a.description.toLowerCase().includes(search.toLowerCase()) ||
      a.ruleId.toString().includes(search) ||
      a.sourceIp.includes(search) ||
      a.source.toLowerCase().includes(search.toLowerCase());

    const matchesSource = 
      filterSource === 'ALL' || a.source.toUpperCase() === filterSource;

    return matchesSearch && matchesSource;
  });

  return (
    <div className="cyber-card p-4 flex flex-col h-full">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-cyan-400" />
          <h2 className="font-cyber text-sm font-bold text-white tracking-wide">
            LIVE SIEM ALERT STREAM & ANALYST QUEUE
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            {filteredAlerts.length} ALERTS MATCHED
          </span>
        </div>

        {/* Search & Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search IP, Rule ID, text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 pl-8 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 w-44"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
            {sources.map(src => (
              <button
                key={src}
                onClick={() => setFilterSource(src)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                  filterSource === src
                    ? 'bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {src}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stream List Table */}
      <div className="flex-1 overflow-y-auto max-h-[360px] space-y-2 pr-1">
        {filteredAlerts.map((alert) => {
          const isCritical = alert.level >= 12;
          const isHigh = alert.level >= 10 && alert.level < 12;

          return (
            <div
              key={alert.id}
              onClick={() => onInspectAlert(alert)}
              className={`p-3 rounded-lg border flex items-center justify-between gap-3 transition-all cursor-pointer group ${
                isCritical
                  ? 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500 hover:bg-rose-950/40'
                  : isHigh
                  ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-500 hover:bg-amber-950/40'
                  : 'bg-slate-900/40 border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900/80'
              }`}
            >
              {/* Level & Timestamp */}
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-mono font-bold border ${
                    isCritical
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : isHigh
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  }`}
                >
                  LVL {alert.level}
                </span>

                <div>
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    <span>{alert.description}</span>
                    {alert.mitre && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                        {alert.mitre}
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-3">
                    <span>Rule SID: <strong className="text-cyan-400">{alert.ruleId}</strong></span>
                    <span>•</span>
                    <span>Src: <strong className="text-slate-200">{alert.sourceIp}</strong></span>
                    <span>•</span>
                    <span>Src Log: <strong className="text-slate-300">{alert.source}</strong></span>
                  </div>
                </div>
              </div>

              {/* Right Action */}
              <div className="flex items-center gap-2 font-mono text-xs text-slate-400 group-hover:text-cyan-300">
                <span>{alert.timestamp}</span>
                <Eye className="w-4 h-4 text-slate-500 group-hover:text-cyan-400" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
