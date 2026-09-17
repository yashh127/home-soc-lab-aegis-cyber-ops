import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Play, ArrowRight, Zap, RefreshCw, Cpu, Activity, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export default function KillChainVisualizer({ onSimulateEvent, showHelp, plainEnglishMode }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunningScenario, setIsRunningScenario] = useState(false);
  const [soarMode, setSoarMode] = useState(true); // Autonomous SOAR Auto-Remediation

  const killChainStages = [
    {
      id: 'recon',
      name: '1. Reconnaissance',
      technique: 'T1595 (Active Scanning)',
      plainDesc: 'Attacker scans your public ports to discover open doorways.',
      techDesc: 'TCP SYN flood & port probes detected on boundary firewall.',
      target: 'Firewall (10.0.0.1)',
      severity: 'LOW',
      soarAction: 'Rate-limit IP',
      color: 'slate'
    },
    {
      id: 'initial_access',
      name: '2. Initial Access',
      technique: 'T1078 (Valid Accounts / S3 Leak)',
      plainDesc: 'Attacker uses leaked credentials to break into AWS cloud storage.',
      techDesc: 'AWS CloudTrail: ConsoleLogin without MFA & S3 policy modification.',
      target: 'AWS S3 (prod-assets)',
      severity: 'HIGH',
      soarAction: 'Revoke AWS IAM Session',
      color: 'amber'
    },
    {
      id: 'execution',
      name: '3. Execution',
      technique: 'T1059 (Unix Shell Script)',
      plainDesc: 'Attacker runs a hidden malicious script inside a temp folder.',
      techDesc: 'Linux auditd: Execution of stage1_dropper.sh from /tmp directory.',
      target: 'Linux Host (192.168.1.15)',
      severity: 'HIGH',
      soarAction: 'Process Terminate (pkill)',
      color: 'amber'
    },
    {
      id: 'persistence',
      name: '4. Persistence',
      technique: 'T1053 (Cronjob Injection)',
      plainDesc: 'Attacker schedules the malware to restart automatically if rebooted.',
      techDesc: 'Crontab edit: Hourly backdoor callback injected into /etc/cron.d.',
      target: 'Cron Daemon',
      severity: 'HIGH',
      soarAction: 'Rollback Crontab Hash',
      color: 'amber'
    },
    {
      id: 'priv_esc',
      name: '5. Privilege Escalation',
      technique: 'T1548.001 (SUID Binary)',
      plainDesc: 'Attacker elevates their privileges to become root/administrator.',
      techDesc: 'Creation of SUID 0104755 binary in /tmp granting root shell.',
      target: 'Root Kernel',
      severity: 'CRITICAL',
      soarAction: 'Remove SUID Bit (chmod 0755)',
      color: 'rose'
    },
    {
      id: 'cred_access',
      name: '6. Credential Access',
      technique: 'T1003 (MimiKatz LSASS Dump)',
      plainDesc: 'Attacker tries to steal passwords stored in system memory.',
      techDesc: 'Sysmon EventID 10: LSASS.exe process memory read by mimikatz.exe.',
      target: 'LSASS Process Memory',
      severity: 'CRITICAL',
      soarAction: 'Memory Sandbox Quarantine',
      color: 'rose'
    },
    {
      id: 'exfiltration',
      name: '7. Exfiltration',
      technique: 'T1048 (DNS Data Tunneling)',
      plainDesc: 'Attacker attempts to smuggle stolen data out via DNS queries.',
      techDesc: 'GuardDuty: Trojan:EC2/DNSDataExfiltration to suspicious domain.',
      target: 'DNS Gateway',
      severity: 'CRITICAL',
      soarAction: 'Null-Route Attacker IP (iptables)',
      color: 'rose'
    }
  ];

  // Execute full autonomous multi-stage attack simulation
  const handleRunFullScenario = () => {
    if (isRunningScenario) return;
    setIsRunningScenario(true);
    setCurrentStep(0);

    audioEngine.playJarvisBootChime();
    audioEngine.speak(
      "Autonomous Multi-Stage APT Attack Simulation engaged, sir. Simulating Lockheed Martin Cyber Kill Chain against enterprise perimeter.",
      { withPrefix: true }
    );

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < killChainStages.length) {
        setCurrentStep(step);
        const stage = killChainStages[step];

        // Trigger SIEM alert into live event stream
        const simulatedEvent = {
          id: `apt-${Date.now()}-${step}`,
          timestamp: new Date().toLocaleTimeString(),
          level: stage.severity === 'CRITICAL' ? 15 : stage.severity === 'HIGH' ? 11 : 7,
          ruleId: 90000 + step,
          description: stage.techDesc,
          sourceIp: '18.197.45.112',
          source: stage.target,
          mitre: stage.technique.split(' ')[0],
          raw: { stage: stage.name, technique: stage.technique, soar_remediation: stage.soarAction }
        };
        onSimulateEvent(simulatedEvent);

        if (soarMode) {
          audioEngine.playContainmentSweep();
          audioEngine.speak(`Kill chain phase ${step + 1} blocked: ${stage.name}. Automated SOAR countermeasure deployed: ${stage.soarAction}.`, { withPrefix: false });
        } else {
          audioEngine.playCriticalAlarm();
        }
      } else {
        clearInterval(interval);
        setIsRunningScenario(false);
        audioEngine.speak("APT Attack Simulation neutralized. All kill-chain stages mitigated with zero data loss, sir.", { withPrefix: true });
      }
    }, 2800);
  };

  return (
    <div className="cyber-card p-5 flex flex-col h-full border-zinc-800 bg-zinc-950/90">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-zinc-900 text-zinc-300 border border-zinc-700 animate-pulse">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-cyber text-base font-bold text-white tracking-wide">
                AUTONOMOUS CYBER KILL CHAIN & SOAR ENGINE
              </h2>
              <span className="badge-label bg-zinc-900 text-zinc-200 border border-zinc-700 text-[10px]">
                TITANIUM SOAR v4.9
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium">
              Real-time MITRE ATT&CK kill-chain progression & zero-touch automated remediation
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Autonomous SOAR Mode Toggle */}
          <button
            onClick={() => {
              audioEngine.playClick();
              setSoarMode(!soarMode);
              if (!soarMode) {
                audioEngine.speak("Autonomous SOAR self-healing mode engaged. Active playbooks will auto-neutralize threats in under one second.", { withPrefix: true });
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
              soarMode
                ? 'bg-zinc-800 border-zinc-500 text-white shadow-md'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400'
            }`}
            title="Toggle autonomous self-healing containment"
          >
            <ShieldCheck className={`w-4 h-4 ${soarMode ? 'text-zinc-100' : 'text-zinc-500'}`} />
            <span>SOAR DEFENSE: {soarMode ? 'ACTIVE (0.6s MTTR)' : 'MANUAL'}</span>
          </button>

          {/* 1-Click Interactive Attack Demo Button */}
          <button
            onClick={handleRunFullScenario}
            disabled={isRunningScenario}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-cyber font-bold transition-all shadow-md active:scale-95 ${
              isRunningScenario
                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 animate-pulse cursor-not-allowed'
                : 'bg-white hover:bg-zinc-200 text-zinc-950 border border-white shadow-white/10'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isRunningScenario ? 'animate-spin text-amber-400' : 'text-zinc-950 fill-zinc-950'}`} />
            <span>{isRunningScenario ? `ATTACK IN PROGRESS (PHASE ${currentStep + 1}/7)...` : '🎬 SIMULATE FULL-CHAIN APT ATTACK'}</span>
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="mb-3.5 text-xs bg-zinc-900/80 p-3 rounded-xl border border-zinc-700 text-zinc-300 font-sans leading-relaxed">
          💡 <strong>What Recruiters & Managers Love About This:</strong> This module visualizes how an attacker tries to progress through all 7 stages of an intrusion (Reconnaissance to Exfiltration). Clicking <strong>"SIMULATE FULL-CHAIN APT ATTACK"</strong> fires a realistic cyber attack in real-time, proving how your autonomous SOAR rules immediately catch and isolate each phase before damage occurs!
        </div>
      )}

      {/* SOAR Velocity Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-zinc-950/90 p-3 rounded-xl border border-zinc-800 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-zinc-400 uppercase">MEAN TIME TO DETECT (MTTD)</div>
          <div className="text-xl font-cyber font-extrabold text-white my-0.5">1.2 SEC</div>
          <div className="text-[10px] font-mono text-emerald-400">99.4% REAL-TIME INGESTION</div>
        </div>
        <div className="bg-zinc-950/90 p-3 rounded-xl border border-zinc-800 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-zinc-400 uppercase">MEAN TIME TO RESPOND (MTTR)</div>
          <div className="text-xl font-cyber font-extrabold text-white my-0.5">0.6 SEC</div>
          <div className="text-[10px] font-mono text-zinc-400">AUTONOMOUS CONTAINMENT</div>
        </div>
        <div className="bg-zinc-950/90 p-3 rounded-xl border border-zinc-800 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-zinc-400 uppercase">CONTAINMENT RATE</div>
          <div className="text-xl font-cyber font-extrabold text-white my-0.5">100%</div>
          <div className="text-[10px] font-mono text-zinc-300">ZERO LATERAL ESCAPE</div>
        </div>
        <div className="bg-zinc-950/90 p-3 rounded-xl border border-zinc-800 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-zinc-400 uppercase">FRAMEWORK ALIGNMENT</div>
          <div className="text-xl font-cyber font-extrabold text-amber-400 my-0.5">MITRE v15</div>
          <div className="text-[10px] font-mono text-zinc-400">7/7 STAGES CORRELATED</div>
        </div>
      </div>

      {/* Horizontal Kill Chain Stage Progression Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2.5 flex-1">
        {killChainStages.map((stage, idx) => {
          const isActive = idx === currentStep && isRunningScenario;
          const isPassed = idx < currentStep && isRunningScenario;

          return (
            <div
              key={stage.id}
              onClick={() => {
                audioEngine.playClick();
                setCurrentStep(idx);
                audioEngine.speak(`Inspecting ${stage.name}. Technique: ${stage.technique}. Recommended SOAR action: ${stage.soarAction}.`);
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between relative group ${
                isActive
                  ? 'bg-zinc-800/90 border-white shadow-lg shadow-white/10 scale-[1.03]'
                  : isPassed
                  ? 'bg-emerald-950/40 border-emerald-500/50'
                  : 'bg-zinc-950/70 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {/* Active Pulse Glow Indicator */}
              {isActive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white animate-ping"></div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono font-bold ${
                    stage.severity === 'CRITICAL' ? 'text-rose-400' : stage.severity === 'HIGH' ? 'text-amber-400' : 'text-zinc-300'
                  }`}>
                    {stage.severity}
                  </span>
                  {isPassed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <span className="text-[9px] font-mono text-zinc-500">#{idx + 1}</span>
                  )}
                </div>

                <div className="text-xs font-cyber font-bold text-white mb-1 group-hover:text-zinc-200 transition-colors">
                  {stage.name}
                </div>

                <div className="text-[10px] font-mono text-zinc-400 mb-1.5 truncate">
                  {stage.technique}
                </div>

                <div className="text-[11px] text-zinc-300 font-sans leading-snug">
                  {plainEnglishMode ? stage.plainDesc : stage.techDesc}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-zinc-800/80">
                <div className="text-[9px] font-mono text-zinc-400 uppercase">SOAR REMEDIATION</div>
                <div className="text-[10px] font-mono font-bold text-zinc-200 truncate">
                  ⚡ {stage.soarAction}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
