import React, { useState } from 'react';
import { ShieldX, Lock, UserX, Trash2, CheckCircle2, Play } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export default function IncidentResponsePanel({ showHelp }) {
  const [logs, setLogs] = useState([
    { id: 1, time: '14:30:12', msg: 'A.E.G.I.S. Active Response Engine initialized. System active.', type: 'info' }
  ]);

  const addLog = (msg, type = 'success') => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [{ id: Date.now(), time, msg, type }, ...prev]);
  };

  const handleContainment = (actionName, command, jarvisVoice) => {
    audioEngine.playContainmentSweep();
    addLog(`Initiating playbook: [${actionName}] ...`, 'info');
    audioEngine.speak(jarvisVoice, { withPrefix: true });

    setTimeout(() => {
      addLog(`✓ Action [${actionName}] completed: ${command}`, 'success');
    }, 600);
  };

  return (
    <div className="cyber-card p-5 flex flex-col h-full border-rose-500/30">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-rose-500/15">
        <div className="flex items-center gap-2.5">
          <ShieldX className="w-5 h-5 text-rose-400" />
          <div>
            <h2 className="font-cyber text-base font-bold text-white tracking-wide">
              INCIDENT RESPONSE & ACTIVE CONTAINMENT
            </h2>
            <p className="text-xs text-slate-400 font-medium">Execute 1-click automated containment playbooks</p>
          </div>
        </div>
        <span className="badge-label bg-rose-500/15 border border-rose-500/30 text-rose-300">
          PLAYBOOKS ARMED
        </span>
      </div>

      {showHelp && (
        <div className="mb-3 text-xs bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/20 text-rose-200">
          💡 <strong>How to respond:</strong> Click any of the 4 response buttons below to immediately block malicious IPs, revoke compromised AWS access keys, or terminate background malware scripts with J.A.R.V.I.S. voice feedback.
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3.5">
        <button
          onClick={() => handleContainment(
            'ISOLATE_ATTACKER_IP', 
            'iptables -A INPUT -s 54.210.12.89 -j DROP',
            'Containment playbook engaged. Attacker IP null-routed at boundary firewall.'
          )}
          className="p-3 rounded-xl bg-slate-950/80 border border-rose-500/30 hover:bg-rose-950/30 text-rose-300 text-xs font-mono flex items-center justify-between transition-all group shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-rose-400" />
            <div className="text-left font-sans">
              <div className="font-bold text-white text-xs">ISOLATE ATTACKER IP</div>
              <div className="text-[10px] text-slate-400 font-mono">Null-route 54.210.12.89</div>
            </div>
          </div>
          <Play className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-1 transition-transform fill-rose-400" />
        </button>

        <button
          onClick={() => handleContainment(
            'REVOKE_AWS_CREDENTIALS', 
            'aws iam deactivate-access-key --access-key-id AKIAIOSFODNN7EXAMPLE',
            'AWS IAM session invalidated. Compromised credentials revoked.'
          )}
          className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 hover:bg-amber-950/30 text-amber-300 text-xs font-mono flex items-center justify-between transition-all group shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <UserX className="w-4 h-4 text-amber-400" />
            <div className="text-left font-sans">
              <div className="font-bold text-white text-xs">REVOKE AWS CREDENTIALS</div>
              <div className="text-[10px] text-slate-400 font-mono">Invalidate Root IAM Token</div>
            </div>
          </div>
          <Play className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform fill-amber-400" />
        </button>

        <button
          onClick={() => handleContainment(
            'TERMINATE_TMP_PAYLOADS', 
            'pkill -f "/tmp/stage1_dropper.sh"',
            'Malware process terminated. Background scripts purged from /tmp.'
          )}
          className="p-3 rounded-xl bg-slate-950/80 border border-purple-500/30 hover:bg-purple-950/30 text-purple-300 text-xs font-mono flex items-center justify-between transition-all group shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <Trash2 className="w-4 h-4 text-purple-400" />
            <div className="text-left font-sans">
              <div className="font-bold text-white text-xs">TERMINATE /tmp PAYLOADS</div>
              <div className="text-[10px] text-slate-400 font-mono">Purge background scripts</div>
            </div>
          </div>
          <Play className="w-3.5 h-3.5 text-purple-400 group-hover:translate-x-1 transition-transform fill-purple-400" />
        </button>

        <button
          onClick={() => handleContainment(
            'RELOAD_DETECTION_RULES', 
            '/var/ossec/bin/wazuh-control restart',
            'Custom XML detection rules reloaded across Wazuh Manager.'
          )}
          className="p-3 rounded-xl bg-slate-950/80 border border-sky-500/30 hover:bg-sky-950/30 text-sky-300 text-xs font-mono flex items-center justify-between transition-all group shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
            <div className="text-left font-sans">
              <div className="font-bold text-white text-xs">RELOAD DETECTION RULES</div>
              <div className="text-[10px] text-slate-400 font-mono">Hot-apply custom XML rules</div>
            </div>
          </div>
          <Play className="w-3.5 h-3.5 text-sky-400 group-hover:translate-x-1 transition-transform fill-sky-400" />
        </button>
      </div>

      {/* Terminal Execution Log */}
      <div className="flex-1 bg-slate-950/90 rounded-xl p-3 border border-slate-800 font-mono text-[11px] max-h-[140px] overflow-y-auto space-y-1.5 shadow-inner">
        {logs.map(log => (
          <div key={log.id} className="flex items-start gap-2">
            <span className="text-slate-500">[{log.time}]</span>
            <span
              className={
                log.type === 'success'
                  ? 'text-emerald-400 font-semibold'
                  : log.type === 'error'
                  ? 'text-rose-400 font-semibold'
                  : 'text-sky-300'
              }
            >
              {log.msg}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
