import React, { useState, useEffect } from 'react';
import { Shield, Activity, Wifi, Clock, Volume2, VolumeX, RefreshCw, Radio, Maximize2, Mic, HelpCircle, FileText, Cpu, HardDrive, Server, Bot, Sparkles, Lightbulb } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';
import AudioVisualizer from './AudioVisualizer';

export default function Header({ 
  onTriggerReplay, 
  isStreaming, 
  setIsStreaming, 
  onOpenReport, 
  onOpenAiChat, 
  showHelp, 
  setShowHelp,
  plainEnglishMode,
  setPlainEnglishMode
}) {
  const [time, setTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    audioEngine.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleSoundToggle = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioEngine.soundEnabled = next;
    if (next) audioEngine.playClick();
  };

  const handleVoiceToggle = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    audioEngine.voiceEnabled = next;
    if (next) audioEngine.speak('J.A.R.V.I.S. voice protocol engaged, sir.');
  };

  const handleTogglePlainEnglish = () => {
    audioEngine.playClick();
    const next = !plainEnglishMode;
    setPlainEnglishMode(next);
    if (next) {
      audioEngine.speak('Plain English Executive translation enabled. Technical telemetry will now display as simple conceptual summaries, sir.');
    } else {
      audioEngine.speak('Technical Security Analyst view enabled. Displaying raw telemetry, MITRE ATT&CK codes, and kernel event IDs, sir.');
    }
  };

  return (
    <header className="cyber-card p-4 mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-red-500/20 relative z-30">
      {/* Left: Falcon Brand & Subtitle */}
      <div className="flex items-center gap-3.5 shrink-0">
        <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-rose-600/10 border border-red-500/40 text-red-500 shadow-lg shadow-red-500/15">
          <Shield className="w-7 h-7 text-red-500" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-cyber text-2xl font-extrabold tracking-tight text-white">
              A.E.G.I.S. <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-rose-400 to-amber-300">CYBER OPS</span>
            </h1>
            <span className="badge-label bg-red-950/80 border border-red-500/40 text-red-300">
              FALCON EDR v4.9
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium flex items-center gap-2 mt-0.5 font-sans">
            <span>Autonomous Cloud SIEM & Threat Defense</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              CLUSTER ONLINE (100% HEALTHY)
            </span>
          </p>
        </div>
      </div>

      {/* Center 1: Telemetry Metrics */}
      <div className="hidden xl:flex items-center gap-4">
        <AudioVisualizer isActive={voiceEnabled || isStreaming} />

        <div className="flex items-center gap-4 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
          <div className="flex items-center gap-2 text-xs font-mono">
            <Activity className="w-4 h-4 text-red-400 animate-spin" />
            <span className="text-slate-400">INGEST:</span>
            <span className="text-white font-bold">18.4 EPS</span>
          </div>
          <div className="w-px h-4 bg-slate-800"></div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">SIEM:</span>
            <span className="text-white font-bold">Wazuh 4.9</span>
          </div>
          <div className="w-px h-4 bg-slate-800"></div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
            <span className="text-slate-400">DEFCON:</span>
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold border border-red-500/40 text-[11px]">
              LEVEL 3 ELEVATED
            </span>
          </div>
        </div>
      </div>

      {/* Center 2: Cluster Hardware Gauge */}
      <div className="hidden 2xl:flex items-center gap-4 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Cpu className="w-4 h-4 text-red-400" />
          <span className="text-slate-400">CPU:</span>
          <span className="text-white font-bold">14%</span>
        </div>
        <div className="w-px h-4 bg-slate-800"></div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <HardDrive className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400">DISK:</span>
          <span className="text-amber-300 font-bold">12.4 GB</span>
        </div>
        <div className="w-px h-4 bg-slate-800"></div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <Server className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400">AGENTS:</span>
          <span className="text-emerald-300 font-bold">3 ACTIVE</span>
        </div>
      </div>

      {/* Right: Action Buttons & Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Recruiter / Plain English View Toggle */}
        <button
          onClick={handleTogglePlainEnglish}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all shadow-md active:scale-95 ${
            plainEnglishMode
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 font-bold shadow-amber-500/20'
              : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white'
          }`}
          title="Toggle Plain-English Non-Technical View for Recruiters and Executives"
        >
          <Lightbulb className={`w-4 h-4 ${plainEnglishMode ? 'text-amber-400 fill-amber-400 animate-bounce' : 'text-slate-400'}`} />
          <span>{plainEnglishMode ? 'PLAIN ENGLISH ON' : 'PLAIN ENGLISH'}</span>
        </button>

        {/* AI SOC CHAT BUTTON */}
        <button
          onClick={onOpenAiChat}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600/30 to-rose-700/30 hover:from-red-600/40 hover:to-rose-700/40 border border-red-500/40 text-red-200 text-xs font-semibold transition-all active:scale-95 shadow-md shadow-red-500/15"
          title="Open J.A.R.V.I.S. Interactive AI SOC Chatbot"
        >
          <Bot className="w-4 h-4 text-red-400 animate-bounce" />
          <span>AI SOC CHAT</span>
          <Sparkles className="w-3 h-3 text-amber-400" />
        </button>

        <button
          onClick={() => setShowHelp(!showHelp)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
            showHelp
              ? 'bg-red-500/20 border-red-500/50 text-red-300'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
          }`}
          title="Toggle Explanatory Guide Boxes"
        >
          <HelpCircle className="w-4 h-4 text-red-400" />
          <span>{showHelp ? 'GUIDE ON' : 'EASY GUIDE'}</span>
        </button>

        <button
          onClick={onOpenReport}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-all active:scale-95 shadow-md"
          title="Generate Executive Incident Audit Report"
        >
          <FileText className="w-4 h-4 text-red-400" />
          <span>EXECUTIVE REPORT</span>
        </button>

        <button
          onClick={() => {
            audioEngine.playClick();
            onTriggerReplay();
            if (voiceEnabled) audioEngine.speak('Replaying security telemetry into A.E.G.I.S. pipeline, sir.');
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 text-xs font-semibold transition-all active:scale-95 shadow-md shadow-red-500/10"
          title="Stream simulated threat attack logs"
        >
          <RefreshCw className="w-4 h-4" />
          <span>SIMULATE ATTACKS</span>
        </button>

        <button
          onClick={() => {
            audioEngine.playClick();
            setIsStreaming(!isStreaming);
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
            isStreaming
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
          <span>{isStreaming ? 'LIVE SYNC' : 'PAUSED'}</span>
        </button>

        {/* Tactical Voice Dispatcher Button */}
        <button
          onClick={handleVoiceToggle}
          className={`p-2.5 rounded-xl border transition-all ${
            voiceEnabled
              ? 'bg-red-500/20 border-red-500/40 text-red-300 shadow-md shadow-red-500/10'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
          title="Toggle J.A.R.V.I.S. AI Voice Guidance"
        >
          <Mic className="w-4.5 h-4.5" />
        </button>

        {/* Audio Sound Synth Button */}
        <button
          onClick={handleSoundToggle}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Toggle UI Sound Effects"
        >
          {soundEnabled ? <Volume2 className="w-4.5 h-4.5 text-red-400" /> : <VolumeX className="w-4.5 h-4.5 text-slate-500" />}
        </button>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Toggle Fullscreen Wallboard Mode"
        >
          <Maximize2 className="w-4.5 h-4.5" />
        </button>

        <div className="hidden sm:flex flex-col items-end font-mono text-xs pl-3 border-l border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-200 font-bold">
            <Clock className="w-3.5 h-3.5 text-red-400" />
            <span>{time.toLocaleTimeString()}</span>
          </div>
          <div className="text-[10px] text-slate-400 font-sans mt-0.5">
            {time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>
    </header>
  );
}
