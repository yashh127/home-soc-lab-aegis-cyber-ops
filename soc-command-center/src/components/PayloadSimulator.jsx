import React, { useState } from 'react';
import { Terminal, Play, Code, Sparkles, AlertCircle } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export default function PayloadSimulator({ onSimulateEvent, showHelp }) {
  const [selectedPreset, setSelectedPreset] = useState('cloudtrail_root');
  const [customPayload, setCustomPayload] = useState('');

  const presets = [
    {
      id: 'cloudtrail_root',
      name: '☁️ AWS Root Account Usage',
      source: 'AWS CLOUDTRAIL',
      level: 12,
      ruleId: 80200,
      mitre: 'T1078',
      desc: 'AWS CloudTrail: Root User Console Login Without MFA',
      payload: JSON.stringify({
        eventSource: 'signin.amazonaws.com',
        eventName: 'ConsoleLogin',
        userIdentity: { type: 'Root', arn: 'arn:aws:iam::123456789012:root' },
        responseElements: { ConsoleLogin: 'Success' },
        additionalEventData: { MFAUsed: 'No' }
      }, null, 2)
    },
    {
      id: 'guardduty_trojan',
      name: '🛡️ GuardDuty EC2 Trojan',
      source: 'AWS GUARDDUTY',
      level: 14,
      ruleId: 80202,
      mitre: 'T1048',
      desc: 'GuardDuty: Trojan:EC2/DNSDataExfiltration to Suspicious Domain',
      payload: JSON.stringify({
        service: { serviceName: 'guardduty', action: { actionType: 'DNS_REQUEST' } },
        severity: 8.5,
        title: 'Trojan:EC2/DNSDataExfiltration',
        resource: { instanceDetails: { instanceId: 'i-0a1b2c3d4e' } }
      }, null, 2)
    },
    {
      id: 'mimikatz_dump',
      name: '🔑 Windows Mimikatz Dump',
      source: 'WINDOWS / SYSMON',
      level: 15,
      ruleId: 91030,
      mitre: 'T1003',
      desc: 'Mimikatz lsass.exe Memory Reading Attempt Detected',
      payload: JSON.stringify({
        EventID: 10,
        TargetImage: 'C:\\Windows\\System32\\lsass.exe',
        GrantedAccess: '0x1010',
        SourceImage: 'C:\\Users\\Public\\mimikatz.exe'
      }, null, 2)
    },
    {
      id: 'suid_privesc',
      name: '🐧 Linux SUID Privilege Escalation',
      source: 'LINUX / AUDIT',
      level: 12,
      ruleId: 100103,
      mitre: 'T1548.001',
      desc: 'SUID/SGID binary created in /tmp directory',
      payload: JSON.stringify({
        type: 'PATH',
        name: '/tmp/test_suid_binary',
        mode: '0104755',
        ouid: 0,
        ogid: 0
      }, null, 2)
    }
  ];

  const currentPreset = presets.find(p => p.id === selectedPreset) || presets[0];

  const handleRunSimulation = () => {
    audioEngine.playJarvisBootChime();
    audioEngine.playCriticalAlarm();

    const simulatedEvent = {
      id: `evt-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      level: currentPreset.level,
      ruleId: currentPreset.ruleId,
      description: currentPreset.desc,
      sourceIp: '18.197.45.112',
      source: currentPreset.source,
      mitre: currentPreset.mitre,
      raw: JSON.parse(customPayload || currentPreset.payload)
    };

    onSimulateEvent(simulatedEvent);
    audioEngine.speak(`Simulated threat payload injected into A.E.G.I.S. pipeline, sir. ${currentPreset.desc}.`, { withPrefix: true });
  };

  return (
    <div className="cyber-card p-5 flex flex-col h-full border-sky-500/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-sky-500/15">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-5 h-5 text-sky-400" />
          <div>
            <h2 className="font-cyber text-base font-bold text-white tracking-wide">
              INTERACTIVE THREAT PAYLOAD SIMULATOR
            </h2>
            <p className="text-xs text-slate-400 font-medium">Select an attack payload preset or edit raw JSON to test detection rules</p>
          </div>
        </div>
        <span className="badge-label bg-sky-950/80 border border-sky-400/30 text-sky-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          LIVE RULE ENGINE
        </span>
      </div>

      {showHelp && (
        <div className="mb-3 text-xs bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/20 text-amber-200">
          💡 <strong>What does this do?</strong> Click any of the 4 attack presets below to see the exact JSON log data generated during cyber attacks. Click the blue <strong>"INJECT THREAT PAYLOAD"</strong> button to test your SIEM detection and hear J.A.R.V.I.S. announce the alert!
        </div>
      )}

      {/* Preset Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
        {presets.map(p => (
          <button
            key={p.id}
            onClick={() => {
              audioEngine.playClick();
              setSelectedPreset(p.id);
              setCustomPayload(p.payload);
            }}
            className={`p-3 rounded-xl border text-left font-sans text-xs transition-all ${
              selectedPreset === p.id
                ? 'bg-sky-500/20 border-sky-400 text-white font-bold shadow-md shadow-sky-500/10'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <div className="font-semibold text-sm mb-1 truncate">{p.name}</div>
            <div className="text-[11px] font-mono text-sky-300">LVL {p.level} • {p.mitre}</div>
          </button>
        ))}
      </div>

      {/* Code Editor Box */}
      <div className="relative mb-3.5 flex-1">
        <textarea
          value={customPayload || currentPreset.payload}
          onChange={(e) => setCustomPayload(e.target.value)}
          className="w-full h-36 bg-slate-950/90 p-3.5 rounded-xl border border-slate-800 font-mono text-xs text-sky-300 focus:outline-none focus:border-sky-500 leading-relaxed resize-none shadow-inner"
        />
        <div className="absolute top-3 right-3 text-[11px] font-mono text-slate-400 flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded border border-slate-800">
          <Code className="w-3.5 h-3.5 text-sky-400" />
          <span>JSON PAYLOAD EDITOR</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleRunSimulation}
        className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-sky-500/20 to-blue-600/30 hover:from-sky-500/30 hover:to-blue-600/40 border border-sky-400/40 text-sky-200 font-cyber font-bold text-xs flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] shadow-lg shadow-sky-500/10"
      >
        <Play className="w-4 h-4 text-sky-400 fill-sky-400" />
        <span>SIMULATE & INJECT THREAT PAYLOAD</span>
      </button>
    </div>
  );
}
