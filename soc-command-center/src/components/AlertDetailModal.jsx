import React from 'react';
import { X, ShieldAlert, Terminal, Copy, Check, ExternalLink } from 'lucide-react';

export default function AlertDetailModal({ alert, onClose }) {
  const [copied, setCopied] = React.useState(false);

  if (!alert) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(alert, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isCritical = alert.level >= 12;
  const isHigh = alert.level >= 10 && alert.level < 12;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="cyber-card w-full max-w-3xl max-h-[90vh] flex flex-col border-cyan-500/40 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/20 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isCritical ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}`}>
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono text-slate-400">ALERT DETAIL INSPECTOR</div>
              <h2 className="text-base font-bold text-white font-cyber">{alert.description}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 font-mono text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400">SEVERITY LEVEL</div>
              <div className={`text-base font-bold ${isCritical ? 'text-rose-400' : isHigh ? 'text-amber-400' : 'text-cyan-400'}`}>
                LEVEL {alert.level}
              </div>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400">RULE SID</div>
              <div className="text-base font-bold text-cyan-300">{alert.ruleId}</div>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400">SOURCE IP</div>
              <div className="text-base font-bold text-slate-200">{alert.sourceIp}</div>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
              <div className="text-[10px] text-slate-400">LOG SOURCE</div>
              <div className="text-base font-bold text-purple-300">{alert.source}</div>
            </div>
          </div>

          {/* MITRE & Recommendations */}
          <div className="bg-slate-900/60 p-3 rounded border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-cyan-300 flex items-center justify-between">
              <span>ANALYST TRIAGE RECOMMENDATIONS</span>
              {alert.mitre && (
                <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/30">
                  MITRE ATT&CK: {alert.mitre}
                </span>
              )}
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-[11px]">
              <li>Verify source IP <strong className="text-rose-300">{alert.sourceIp}</strong> against internal threat intelligence databases.</li>
              <li>Check target user account credentials and isolate affected host system.</li>
              <li>Execute automated active response containment script if risk level remains critical.</li>
            </ul>
          </div>

          {/* Raw JSON Payload */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-400 font-bold flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                RAW SIEM JSON PAYLOAD
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 p-3 rounded border border-slate-800 text-cyan-300 overflow-x-auto text-[11px] leading-relaxed">
              {JSON.stringify(alert, null, 2)}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/40 flex justify-between items-center">
          <a
            href="https://localhost/app/wz-home"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300"
          >
            <span>Open in Wazuh Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold"
          >
            CLOSE INSPECTOR
          </button>
        </div>
      </div>
    </div>
  );
}
