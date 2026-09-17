import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import KpiMetrics from './components/KpiMetrics';
import KillChainVisualizer from './components/KillChainVisualizer';
import CloudZeroTrustPosture from './components/CloudZeroTrustPosture';
import ThreatMap from './components/ThreatMap';
import MitreMatrix from './components/MitreMatrix';
import LiveAlertStream from './components/LiveAlertStream';
import IncidentResponsePanel from './components/IncidentResponsePanel';
import NetworkTopology from './components/NetworkTopology';
import AiCopilot from './components/AiCopilot';
import PayloadSimulator from './components/PayloadSimulator';
import SystemAdvisoryWidget from './components/SystemAdvisoryWidget';
import ThreatIntelFeed from './components/ThreatIntelFeed';
import IngestionRateChart from './components/IngestionRateChart';
import AiNeuralAnomalyDetector from './components/AiNeuralAnomalyDetector';
import AiChatAssistantModal from './components/AiChatAssistantModal';
import ReportGeneratorModal from './components/ReportGeneratorModal';
import AlertDetailModal from './components/AlertDetailModal';
import { initialAlerts, generateSampleEvent } from './components/MockDataGenerator';
import { audioEngine } from './utils/audioEngine';
import { Shield, Play, Brain, Layers } from 'lucide-react';

export default function App() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isStreaming, setIsStreaming] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [plainEnglishMode, setPlainEnglishMode] = useState(false);
  
  // Navigation Tabs: 'operations' | 'simulation' | 'intel'
  const [activeTab, setActiveTab] = useState('operations');

  // Live polling & tactical voice dispatch
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const newEvent = generateSampleEvent();
      setAlerts(prev => [newEvent, ...prev.slice(0, 49)]);

      // Audio synth feedback
      if (newEvent.level >= 14) {
        audioEngine.playCriticalAlarm();
        audioEngine.speak(`Warning: Critical threat detected. ${newEvent.description}`);
      } else {
        audioEngine.playClick();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Compute live KPI metrics
  const stats = {
    total: alerts.length * 6 + 310,
    critical: alerts.filter(a => a.level >= 12).length + 42,
    high: alerts.filter(a => a.level >= 10 && a.level < 12).length + 84,
    mediumLow: alerts.filter(a => a.level < 10).length + 184,
    activeAgents: 3
  };

  const handleTriggerReplay = () => {
    const burst = Array.from({ length: 5 }, () => generateSampleEvent());
    setAlerts(prev => [...burst, ...prev]);
    audioEngine.speak('Telemetry burst initiated. 5 threat events loaded into stream.');
  };

  const handleSimulateEvent = (newEvent) => {
    setAlerts(prev => [newEvent, ...prev]);
  };

  const latestAlert = alerts[0];

  const handleTabChange = (tabId, label) => {
    audioEngine.playClick();
    setActiveTab(tabId);
    audioEngine.speak(`Switched workspace to ${label}, sir.`);
  };

  return (
    <div className="min-h-screen p-4 md:p-6 flex flex-col max-w-[1700px] mx-auto space-y-5">
      {/* Top Header Bar */}
      <Header
        onTriggerReplay={handleTriggerReplay}
        isStreaming={isStreaming}
        setIsStreaming={setIsStreaming}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenAiChat={() => setIsAiChatOpen(true)}
        showHelp={showHelp}
        setShowHelp={setShowHelp}
        plainEnglishMode={plainEnglishMode}
        setPlainEnglishMode={setPlainEnglishMode}
      />

      {/* Clean Tabbed Workspace Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md">
        <div className="flex items-center gap-2">
          {/* Tab 1: Live Operations */}
          <button
            onClick={() => handleTabChange('operations', 'Live Operations')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-cyber text-xs font-bold transition-all ${
              activeTab === 'operations'
                ? 'bg-gradient-to-r from-purple-600/30 to-indigo-700/30 border border-purple-500 text-purple-200 shadow-lg shadow-purple-500/20'
                : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <Shield className={`w-4 h-4 ${activeTab === 'operations' ? 'text-purple-400' : 'text-slate-500'}`} />
            <span>1. LIVE OPERATIONS</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
              ● REALTIME
            </span>
          </button>

          {/* Tab 2: Attack Simulation */}
          <button
            onClick={() => handleTabChange('simulation', 'Attack Simulation and Kill Chain')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-cyber text-xs font-bold transition-all ${
              activeTab === 'simulation'
                ? 'bg-gradient-to-r from-purple-600/30 to-fuchsia-600/30 border border-purple-400 text-purple-200 shadow-lg shadow-purple-500/20'
                : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <Play className={`w-4 h-4 ${activeTab === 'simulation' ? 'text-purple-400' : 'text-slate-500'}`} />
            <span>2. ATTACK SIMULATION</span>
            <span className="px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono">
              DEMO MODE
            </span>
          </button>

          {/* Tab 3: AI & Threat Intel */}
          <button
            onClick={() => handleTabChange('intel', 'AI Copilot and Threat Intelligence')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-cyber text-xs font-bold transition-all ${
              activeTab === 'intel'
                ? 'bg-gradient-to-r from-fuchsia-600/30 to-indigo-700/30 border border-fuchsia-400 text-fuchsia-200 shadow-lg shadow-fuchsia-500/20'
                : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <Brain className={`w-4 h-4 ${activeTab === 'intel' ? 'text-fuchsia-400' : 'text-slate-500'}`} />
            <span>3. AI & THREAT INTEL</span>
            <span className="px-1.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-[10px] font-mono">
              GENAI
            </span>
          </button>
        </div>

        {/* Tab Context Helper Badge */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-400 px-3">
          <Layers className="w-3.5 h-3.5 text-purple-400" />
          <span>
            {activeTab === 'operations' && 'Viewing Live Telemetry, World Map & Active Threat Queue'}
            {activeTab === 'simulation' && 'Interactive Lockheed Martin Kill-Chain & Payload Ingestion Terminal'}
            {activeTab === 'intel' && 'Autonomous J.A.R.V.I.S. Copilot, Zero-Trust Posture & IOC Feeds'}
          </span>
        </div>
      </div>

      {/* ==================== TAB 1: LIVE OPERATIONS ==================== */}
      {activeTab === 'operations' && (
        <div className="space-y-5 animate-fadeIn">
          {/* KPI Summary Cards */}
          <KpiMetrics stats={stats} showHelp={showHelp} plainEnglishMode={plainEnglishMode} />

          {/* Core Grid: System Advisory Radar + Global Threat Map */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5">
              <SystemAdvisoryWidget showHelp={showHelp} plainEnglishMode={plainEnglishMode} />
            </div>
            <div className="lg:col-span-7">
              <ThreatMap activeAttacks={alerts} showHelp={showHelp} plainEnglishMode={plainEnglishMode} />
            </div>
          </div>

          {/* Operational Response Grid: 1-Click Containment + Live SIEM Alert Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5">
              <IncidentResponsePanel showHelp={showHelp} plainEnglishMode={plainEnglishMode} />
            </div>
            <div className="lg:col-span-7">
              <LiveAlertStream
                alerts={alerts}
                onInspectAlert={(alert) => {
                  audioEngine.playClick();
                  setSelectedAlert(alert);
                }}
                showHelp={showHelp}
                plainEnglishMode={plainEnglishMode}
              />
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 2: ATTACK SIMULATION ==================== */}
      {activeTab === 'simulation' && (
        <div className="space-y-5 animate-fadeIn">
          {/* Hero Feature: Autonomous Cyber Kill Chain & SOAR Engine */}
          <KillChainVisualizer 
            onSimulateEvent={handleSimulateEvent} 
            showHelp={showHelp} 
            plainEnglishMode={plainEnglishMode} 
          />

          {/* Interactive Simulation Grid: MITRE ATT&CK Matrix + Raw Payload Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6">
              <MitreMatrix showHelp={showHelp} plainEnglishMode={plainEnglishMode} />
            </div>
            <div className="lg:col-span-6">
              <PayloadSimulator onSimulateEvent={handleSimulateEvent} showHelp={showHelp} plainEnglishMode={plainEnglishMode} />
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 3: AI & THREAT INTEL ==================== */}
      {activeTab === 'intel' && (
        <div className="space-y-5 animate-fadeIn">
          {/* AI Reasoning Row: J.A.R.V.I.S. Copilot + Deep Learning Tensor Anomaly Detector */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6">
              <AiCopilot latestAlert={latestAlert} showHelp={showHelp} plainEnglishMode={plainEnglishMode} />
            </div>
            <div className="lg:col-span-6">
              <AiNeuralAnomalyDetector showHelp={showHelp} plainEnglishMode={plainEnglishMode} />
            </div>
          </div>

          {/* Posture & Intel Row: Zero-Trust CSPM + Real-time IOC Feeds */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6">
              <CloudZeroTrustPosture showHelp={showHelp} plainEnglishMode={plainEnglishMode} />
            </div>
            <div className="lg:col-span-6">
              <ThreatIntelFeed showHelp={showHelp} plainEnglishMode={plainEnglishMode} />
            </div>
          </div>

          {/* Topology & Ingestion Velocity Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-6">
              <IngestionRateChart showHelp={showHelp} plainEnglishMode={plainEnglishMode} />
            </div>
            <div className="lg:col-span-6">
              <NetworkTopology showHelp={showHelp} plainEnglishMode={plainEnglishMode} />
            </div>
          </div>
        </div>
      )}

      {/* Alert Detail Inspector Modal */}
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          onClose={() => {
            audioEngine.playClick();
            setSelectedAlert(null);
          }}
          plainEnglishMode={plainEnglishMode}
        />
      )}

      {/* Interactive AI SOC Analyst Chatbot Modal */}
      <AiChatAssistantModal
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        plainEnglishMode={plainEnglishMode}
      />

      {/* Executive Report Generator Modal */}
      <ReportGeneratorModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        stats={stats}
      />
    </div>
  );
}
