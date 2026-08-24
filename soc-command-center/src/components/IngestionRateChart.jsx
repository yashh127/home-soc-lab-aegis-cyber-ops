import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Zap } from 'lucide-react';

export default function IngestionRateChart({ showHelp }) {
  const [data, setData] = useState([
    { time: '14:50', eps: 14.2 },
    { time: '14:51', eps: 18.5 },
    { time: '14:52', eps: 22.1 },
    { time: '14:53', eps: 16.8 },
    { time: '14:54', eps: 19.4 },
    { time: '14:55', eps: 25.6 },
    { time: '14:56', eps: 18.5 }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const nextEps = +(14 + Math.random() * 12).toFixed(1);
      setData(prev => [...prev.slice(1), { time: nowStr, eps: nextEps }]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const latestEps = data[data.length - 1].eps;
  const maxEps = Math.max(...data.map(d => d.eps));

  return (
    <div className="cyber-card p-5 flex flex-col h-full border-sky-500/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-sky-500/15">
        <div className="flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
          <div>
            <h2 className="font-cyber text-base font-bold text-white tracking-wide">
              REAL-TIME SIEM INGESTION VELOCITY
            </h2>
            <p className="text-xs text-slate-400 font-medium">Live Events Per Second (EPS) Throughput Stream</p>
          </div>
        </div>
        <span className="badge-label bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          {latestEps} EPS
        </span>
      </div>

      {showHelp && (
        <div className="mb-3 text-xs bg-sky-950/40 p-2.5 rounded-xl border border-sky-500/20 text-sky-200 font-sans">
          💡 <strong>SIEM Ingestion Velocity Graph:</strong> Tracks the real-time speed at which security logs (events per second) are decoded by Wazuh and indexed into OpenSearch.
        </div>
      )}

      {/* Real-time SVG Sparkline Graph */}
      <div className="relative w-full h-[120px] bg-slate-950/90 rounded-xl p-3 border border-slate-800 flex flex-col justify-between shadow-inner">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 z-10">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <TrendingUp className="w-3.5 h-3.5" /> PEAK: {maxEps} EPS
          </span>
          <span className="text-slate-500">SYS_PORT: UDP 514</span>
        </div>

        {/* SVG Sparkline Curve */}
        <svg className="w-full h-16 overflow-visible">
          <defs>
            <linearGradient id="epsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <polyline
            fill="url(#epsGrad)"
            stroke="#10b981"
            strokeWidth="2.5"
            points={data.map((d, i) => {
              const x = (i / (data.length - 1)) * 300;
              const y = 60 - ((d.eps - 10) / 20) * 50;
              return `${x},${y}`;
            }).join(' ')}
          />
        </svg>

        <div className="flex justify-between text-[10px] font-mono text-slate-500 border-t border-slate-900 pt-1">
          {data.map((d, i) => (
            <span key={i}>{d.time}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
