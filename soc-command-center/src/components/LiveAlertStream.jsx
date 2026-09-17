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
    <div className="cyber-card p-4 flex flex-col h-full border-zinc-700/80">
      {/* Header & Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 pb-2 border-b border-zinc-700/80">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-white" />
          <h2 className="font-cyber text-sm font-bold text-white tracking-wide">
            LIVE SIEM ALERT STREAM & ANALYST QUEUE
          </h2>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-100 font-bold border border-zinc-600">
            {filteredAlerts.length} ALERTS MATCHED
          </span>
        </div>

        {/* Search & Filter Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-300 absolute left-2.5 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search IP, Rule ID, text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 pl-8 text-xs font-mono text-white focus:outline-none focus:border-white w-44"
            />
          </div>

          <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded border border-zinc-700">
            {sources.map(src => (
              <button
                key={src}
                onClick={() => setFilterSource(src)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                  filterSource === src
                    ? 'bg-zinc-750 border border-zinc-500 text-white font-bold shadow-sm'
                    : 'text-zinc-300 hover:text-white'
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
            className="p-3 rounded-xl bg-zinc-850/90 border border-zinc-750 hover:border-zinc-500 hover:bg-zinc-800 transition-all cursor-pointer flex items-center justify-between gap-3 group"
          >
            {/* Left: Severity & Meta */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex flex-col items-center justify-center shrink-0 w-9">
                <span className={`text-[11px] font-mono font-bold ${
                  alert.level >= 12 ? 'text-rose-400' : alert.level >= 10 ? 'text-amber-400' : 'text-zinc-200'
                }`}>
                  LVL {alert.level}
                </span>
                <span className="text-[9px] font-mono text-zinc-300 font-semibold">RULE {alert.ruleId}</span>
              </div>

              <div className="h-7 w-px bg-zinc-700 shrink-0"></div>

              {/* Center: Description & Attribution */}
              <div className="truncate">
                <div className="text-xs font-sans font-bold text-white group-hover:text-zinc-100 transition-colors truncate">
                  {alert.description}
                </div>
                <div className="text-[10px] font-mono text-zinc-300 flex items-center gap-2 mt-0.5">
                  <span className="text-zinc-200 font-medium">SRC: {alert.sourceIp}</span>
                  <span>•</span>
                  <span className="text-zinc-300 font-sans">{alert.source}</span>
                  <span>•</span>
                  <span className="text-white font-bold">{alert.mitre}</span>
                </div>
              </div>
            </div>

            {/* Right: Timestamp & Inspect Button */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] font-mono text-zinc-300">{alert.timestamp}</span>
              <button className="p-1.5 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 text-white border border-zinc-600 transition-all">
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
