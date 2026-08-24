import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import KpiMetrics from './components/KpiMetrics';
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
import ReportGeneratorModal from './components/ReportGeneratorModal';
import AlertDetailModal from './components/AlertDetailModal';
import { initialAlerts, generateSampleEvent } from './components/MockDataGenerator';
import { audioEngine } from './utils/audioEngine';

export default function App() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isStreaming, setIsStreaming] = useState(true);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

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

  return (
    <div className="min-h-screen p-4 md:p-6 flex flex-col max-w-[1700px] mx-auto space-y-5">
      {/* Header */}
      <Header
        onTriggerReplay={handleTriggerReplay}
        isStreaming={isStreaming}
        setIsStreaming={setIsStreaming}
        onOpenReport={() => setIsReportOpen(true)}
        showHelp={showHelp}
        setShowHelp={setShowHelp}
      />

      {/* KPI Stat Cards */}
      <KpiMetrics stats={stats} showHelp={showHelp} />

      {/* Main Grid: Row 1 - Upper Left: System Advisory Radar, Upper Right: Global Threat Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5">
          <SystemAdvisoryWidget showHelp={showHelp} />
        </div>
        <div className="lg:col-span-7">
          <ThreatMap activeAttacks={alerts} showHelp={showHelp} />
        </div>
      </div>

      {/* Main Grid: Row 2 - Threat Intel IOC Feed & SIEM Ingestion Velocity Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6">
          <ThreatIntelFeed showHelp={showHelp} />
        </div>
        <div className="lg:col-span-6">
          <IngestionRateChart showHelp={showHelp} />
        </div>
      </div>

      {/* Main Grid: Row 3 - MITRE ATT&CK Matrix & Interactive Payload Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6">
          <MitreMatrix showHelp={showHelp} />
        </div>
        <div className="lg:col-span-6">
          <PayloadSimulator onSimulateEvent={handleSimulateEvent} showHelp={showHelp} />
        </div>
      </div>

      {/* Main Grid: Row 4 - AI Copilot & Network Topology */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5">
          <AiCopilot latestAlert={latestAlert} showHelp={showHelp} />
        </div>
        <div className="lg:col-span-7">
          <NetworkTopology showHelp={showHelp} />
        </div>
      </div>

      {/* Main Grid: Row 5 - Active Response Panel & Live Stream Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5">
          <IncidentResponsePanel showHelp={showHelp} />
        </div>
        <div className="lg:col-span-7">
          <LiveAlertStream
            alerts={alerts}
            onInspectAlert={(alert) => {
              audioEngine.playClick();
              setSelectedAlert(alert);
            }}
            showHelp={showHelp}
          />
        </div>
      </div>

      {/* Alert Detail Inspector Modal */}
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          onClose={() => {
            audioEngine.playClick();
            setSelectedAlert(null);
          }}
        />
      )}

      {/* Executive Report Generator Modal */}
      <ReportGeneratorModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        stats={stats}
      />
    </div>
  );
}
