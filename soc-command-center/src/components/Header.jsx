import React, { useState, useEffect } from 'react';
import { Shield, Activity, Wifi, Clock, Volume2, VolumeX, RefreshCw, Radio, Maximize2, Mic, HelpCircle, FileText, Cpu, HardDrive, Server, Bot, Sparkles, Play, Lightbulb, Palette, ChevronDown } from 'lucide-react';
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
  setPlainEnglishMode,
  onRunAptDemo
}) {
  const [time, setTime] = useState(new Date());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');

  const themes = [
    { id: 'default', name: 'Cyber Cyan', label: '🩵 Cyber Cyan', class: '' },
    { id: 'obsidian', name: 'Stealth Obsidian', label: '🖤 Stealth Obsidian', class: 'theme-obsidian' },
    { id: 'matrix', name: 'Matrix Emerald', label: '💚 Matrix Emerald', class: 'theme-matrix' },
    { id: 'crimson', name: 'Crimson War-Room', label: '❤️ Crimson War-Room', class: 'theme-crimson' },
    { id: 'navy', name: 'Sapphire Navy', label: '💙 Sapphire Navy', class: 'theme-navy' }
  ];

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectTheme = (theme) => {
    audioEngine.playClick();
    setCurrentTheme(theme.id);
    setThemeOpen(false);
    document.body.className = theme.class;
    audioEngine.speak(`Theme updated to ${theme.name}, sir.`);
  };

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
    <header className="cyber-card p-4 mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-sky-500/20 relative z-30">
      {/* Left 1: Brand & Subtitle */}
      <div className="flex items-center gap-3.5 shrink-0">
        <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-400/30 text-cyan-400 pulse-cyan shadow-lg shadow-cyan-500/10">
          <Shield className="w-7 h-7 text-cyan-400" />
        </div>
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-cyber text-2xl font-extrabold tracking-tight text-white">
              A.E.G.I.S. <span className="text-cyan-400 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-amber-300">CYBER OPS</span>
            </h1>
            <span className="badge-label bg-cyan-950/80 border border-cyan-400/30 text-cyan-300">
              NEXT-GEN AI SOC
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium flex items-center gap-2 mt-0.5 font-sans">
            <span>Autonomous SIEM & Multi-Cloud SOAR Platform</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 flex items-center gap-1.5 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              CLUSTER HEALTHY (100% UPTIME)
            </span>
          </p>
        </div>
      </div>

      {/* Center 1: Audio Waveform & Ingestion Metrics */}
      <div className="hidden xl:flex items-center gap-4">
        <AudioVisualizer isActive={voiceEnabled || isStreaming} />

        <div className="flex items-center gap-4 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 shadow-inner">
          <div className="flex items-center gap-2 text-xs font-mono">
            <Activity className="w-4 h-4 text-cyan-400 animate-spin" />
            <span className="text-slate-400">SPEED:</span>
            <span className="text-emerald-400 font-bold">18.4 EPS</span>
          </div>
          <div className="w-px h-4 bg-slate-800"></div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">SIEM ENGINE:</span>
            <span className="text-white font-bold">Wazuh 4.9 Online</span>
          </div>
          <div className="w-px h-4 bg-slate-800"></div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
            <span className="text-slate-400">DEFCON:</span>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 text-[11px]">
              LEVEL 3 ELEVATED
            </span>
          </div>
        </div>
      </div>

      {/* Center 2: Cluster Hardware & Asset Telemetry Gauge */}
      <div className="hidden 2xl:flex items-center gap-4 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Cpu className="w-4 h-4 text-purple-400" />
          <span className="text-slate-400">CPU LOAD:</span>
          <span className="text-purple-300 font-bold">14%</span>
        </div>
        <div className="w-px h-4 bg-slate-800"></div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <HardDrive className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400">INDEX DISK:</span>
          <span className="text-amber-300 font-bold">12.4 GB</span>
        </div>
        <div className="w-px h-4 bg-slate-800"></div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <Server className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400">AGENTS:</span>
          <span className="text-emerald-300 font-bold">3 MONITORED</span>
        </div>
      </div>

      {/* Right: Action Buttons & Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Dynamic Theme Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setThemeOpen(!themeOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-all shadow-md active:scale-95"
            title="Switch Dashboard Color Theme"
          >
            <Palette className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">THEME</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {themeOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-1.5 z-50 animate-fadeIn">
              <div className="text-[10px] font-mono text-slate-400 px-2.5 py-1 uppercase border-b border-slate-800 mb-1">
                Select Theme
              </div>
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTheme(t)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between transition-all ${
                    currentTheme === t.id
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span>{t.label}</span>
                  {currentTheme === t.id && <span className="text-cyan-400">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recruiter / Plain English View Toggle */}
        <button
          onClick={handleTogglePlainEnglish}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all shadow-md active:scale-95 ${
            plainEnglishMode
              ? 'bg-gradient-to-r from-amber-500/30 to-amber-600/30 border-amber-400/60 text-amber-200 font-bold shadow-amber-500/20'
              : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white'
          }`}
          title="Toggle Plain-English / Non-Technical View for Recruiters and Executives"
        >
          <Lightbulb className={`w-4 h-4 ${plainEnglishMode ? 'text-amber-400 fill-amber-400 animate-bounce' : 'text-slate-400'}`} />
          <span>{plainEnglishMode ? 'PLAIN ENGLISH ON' : 'PLAIN ENGLISH'}</span>
        </button>

        {/* AI SOC CHAT BUTTON */}
        <button
          onClick={onOpenAiChat}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/30 hover:from-cyan-500/30 hover:to-blue-600/40 border border-cyan-400/40 text-cyan-300 text-xs font-semibold transition-all active:scale-95 shadow-md shadow-cyan-500/10"
          title="Open J.A.R.V.I.S. Interactive AI SOC Chatbot"
        >
          <Bot className="w-4 h-4 text-cyan-400 animate-bounce" />
          <span>AI SOC CHAT</span>
          <Sparkles className="w-3 h-3 text-amber-400" />
        </button>

        <button
          onClick={() => setShowHelp(!showHelp)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
            showHelp
              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
          }`}
          title="Toggle Explanatory Guide Boxes"
        >
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>{showHelp ? 'GUIDE ON' : 'EASY GUIDE'}</span>
        </button>

        <button
          onClick={onOpenReport}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-xs font-semibold transition-all active:scale-95 shadow-md shadow-purple-500/5"
          title="Generate Executive Incident Audit Report"
        >
          <FileText className="w-4 h-4" />
          <span>EXECUTIVE REPORT</span>
        </button>

        <button
          onClick={() => {
            audioEngine.playClick();
            onTriggerReplay();
            if (voiceEnabled) audioEngine.speak('Replaying security telemetry into A.E.G.I.S. pipeline, sir.');
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/40 text-sky-300 text-xs font-semibold transition-all active:scale-95 shadow-md shadow-sky-500/10"
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
              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-500/10'
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
          {soundEnabled ? <Volume2 className="w-4.5 h-4.5 text-cyan-400" /> : <VolumeX className="w-4.5 h-4.5 text-slate-500" />}
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
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
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
