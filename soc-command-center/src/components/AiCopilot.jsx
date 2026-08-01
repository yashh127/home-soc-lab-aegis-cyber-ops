import React from 'react';
import { Bot, Sparkles, Volume2, ShieldCheck, ArrowRight, ShieldAlert } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export default function AiCopilot({ latestAlert }) {
  const handleAnnounce = () => {
    audioEngine.playJarvisBootChime();
    if (!latestAlert) {
      audioEngine.speak('All systems online and functioning nominal, sir. All cluster nodes green.', { withPrefix: true });
      return;
    }
    audioEngine.speak(
      `Tactical update, sir. Level ${latestAlert.level} incident recorded. ${latestAlert.description}. Attacker IP ${latestAlert.sourceIp}.`,
      { withPrefix: true }
    );
  };

  return (
    <div className="cyber-card p-4 flex flex-col h-full border-cyan-500/40 bg-gradient-to-br from-slate-900/90 via-slate-950 to-cyan-950/40 shadow-2xl relative overflow-hidden">
      {/* Background Stark Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-cyan-500/20 z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 pulse-cyan">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-cyber text-sm font-bold text-white flex items-center gap-1.5 tracking-wider">
              J.A.R.V.I.S. <span className="text-cyan-400">AI PROTOCOL</span> <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            </h2>
            <p className="text-[10px] font-mono text-slate-400">JUST A RATHER VERY INTELLIGENT SYSTEM</p>
          </div>
        </div>

        <button
          onClick={handleAnnounce}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-mono transition-all active:scale-95"
          title="Ask J.A.R.V.I.S. to speak incident brief"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>JARVIS DISPATCH</span>
        </button>
      </div>

      {/* AI Assessment Content */}
      <div className="flex-1 flex flex-col justify-between space-y-3 font-mono text-xs z-10">
        <div className="bg-slate-950/80 p-3 rounded-lg border border-cyan-500/30 text-slate-300 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-cyan-400 font-bold">
            <span>STARK SECURITY SYNTHESIS</span>
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-mono text-[10px]">
              STATUS: NOMINAL
            </span>
          </div>

          <p className="text-slate-200 leading-relaxed text-[11px]">
            {latestAlert
              ? `Sir, I have isolated an anomaly: ${latestAlert.description}. The attack vector originates from ${latestAlert.sourceIp} against ${latestAlert.source}. Shall I deploy containment?`
              : 'Sir, I am monitoring 310 telemetry events across all cloud and host vectors. All cluster indices remain stable.'}
          </p>

          <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-800 flex items-center justify-between">
            <span>MITRE TACTIC: <strong className="text-purple-300">{latestAlert?.mitre || 'INITIAL ACCESS'}</strong></span>
            <span>COUNTERMEASURE: <strong className="text-rose-400">AUTO-CONTAIN</strong></span>
          </div>
        </div>

        {/* 1-Click J.A.R.V.I.S. Automated Countermeasure Button */}
        <button
          onClick={() => {
            audioEngine.playContainmentSweep();
            audioEngine.speak('Right away, sir. Containment countermeasure engaged. Target IP blocked and credentials revoked.', { withPrefix: false });
          }}
          className="w-full py-2.5 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-cyber font-bold text-xs flex items-center justify-between group transition-all"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>DEPLOY J.A.R.V.I.S. COUNTERMEASURES</span>
          </div>
          <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
