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
    <div className="cyber-card p-4 flex flex-col h-full border-blue-500/20">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2 border-b border-blue-500/20">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-500" />
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
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 pl-8 text-xs font-mono text-white focus:outline-none focus:border-blue-500 w-44"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800">
            {sources.map(src => (
              <button
                key={src}
                onClick={() => setFilterSource(src)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                  filterSource === src
                    ? 'bg-blue-500/30 border border-blue-500/50 text-blue-200 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {src}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* High-Density Stream Table */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-[380px] pr-1">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            onClick={() => onInspectAlert(alert)}
            className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-blue-500/50 hover:bg-slate-900/90 transition-all cursor-pointer flex items-center justify-between gap-3 group"
          >
            {/* Left: Severity & Meta */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex flex-col items-center justify-center shrink-0 w-9">
                <span className={`text-[11px] font-mono font-bold ${
                  alert.level >= 12 ? 'text-rose-400' : alert.level >= 10 ? 'text-amber-400' : 'text-slate-300'
                }`}>
                  LVL {alert.level}
                </span>
                <span className="text-[9px] font-mono text-slate-400">RULE {alert.ruleId}</span>
              </div>

              <div className="h-7 w-px bg-slate-800 shrink-0"></div>

              {/* Center: Description & Attribution */}
              <div className="truncate">
                <div className="text-xs font-sans font-bold text-slate-200 group-hover:text-blue-300 transition-colors truncate">
                  {alert.description}
                </div>
                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                  <span className="text-slate-300">SRC: {alert.sourceIp}</span>
                  <span>•</span>
                  <span className="text-slate-400 font-sans">{alert.source}</span>
                  <span>•</span>
                  <span className="text-blue-400 font-semibold">{alert.mitre}</span>
                </div>
              </div>
            </div>

            {/* Right: Timestamp & Inspect Button */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] font-mono text-slate-400">{alert.timestamp}</span>
              <button className="p-1.5 rounded-lg bg-slate-900 group-hover:bg-blue-500/20 text-slate-400 group-hover:text-blue-400 border border-slate-800 group-hover:border-blue-500/40 transition-all">
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
