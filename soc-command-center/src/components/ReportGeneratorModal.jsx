import React, { useState } from 'react';
import { FileText, Download, X, Check, Printer } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export default function ReportGeneratorModal({ isOpen, onClose, stats }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const reportMarkdown = `# 🛡️ A.E.G.I.S. CYBER OPS — Executive Threat Audit Report
**Date:** ${reportDate}  
**Classification:** RESTRICTED // SOC EXECUTIVE SUMMARY  
**System Target:** HOME SOC LAB SENTINEL (127.0.0.1)

---

## 1. Executive Summary
During the operational evaluation window, **${stats.total} total telemetry security events** were ingested and analyzed by the **A.E.G.I.S. Autonomous SIEM Engine**. A total of **${stats.critical} critical severity incidents** (Level 12-15) and **${stats.high} high severity incidents** (Level 10-11) were isolated and targeted with automated containment playbooks.

---

## 2. Severity & Telemetry Distribution
- **Critical Severity (Level 12-15):** ${stats.critical} Incident(s) — Immediate Isolation Triggered
- **High Severity (Level 10-11):** ${stats.high} Incident(s) — Active Investigation
- **Medium & Low Severity (Level 0-9):** ${stats.mediumLow} Events — Baseline Monitoring
- **Ingestion Velocity:** 18.4 Events Per Second (EPS) via Syslog UDP:514

---

## 3. MITRE ATT&CK Matrix Tactic Coverage
- **Initial Access (TA0001):** T1110.001 (SSH/RDP Password Guessing) — 42 Detections
- **Execution (TA0002):** T1059.004 (Unix Shell Execution) & T1059.001 (PowerShell Encoded) — 63 Detections
- **Persistence (TA0003):** T1053.003 (Cron Modification) & T1098.004 (SSH Authorized Keys) — 75 Detections
- **Privilege Escalation (TA0004):** T1548.001 (SUID Binary Creation) — 31 Detections

---

## 4. Remediation & Action Item Checklist
- [x] Containment Playbook Executed: Attacker IP 54.210.12.89 blocked at boundary firewall.
- [x] Compromised AWS IAM credentials revoked for root user console login attempt.
- [x] Unauthorized background scripts purged from /tmp and /dev/shm.
- [x] Custom XML detection rules hot-reloaded and verified against OpenSearch Indexer.
`;

  const handleCopyReport = () => {
    audioEngine.playClick();
    navigator.clipboard.writeText(reportMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    audioEngine.playClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="cyber-card w-full max-w-3xl max-h-[90vh] flex flex-col border-cyan-500/40 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/20 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono text-slate-400">EXECUTIVE INCIDENT REPORT GENERATOR</div>
              <h2 className="text-base font-bold text-white font-cyber">A.E.G.I.S. SOC THREAT AUDIT REPORT</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Content Box */}
        <div className="p-4 overflow-y-auto font-mono text-xs text-slate-200 bg-slate-950 space-y-3">
          <pre className="whitespace-pre-wrap leading-relaxed font-mono text-[11px] text-cyan-300 bg-slate-900/60 p-4 rounded border border-slate-800">
            {reportMarkdown}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/40 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs border border-slate-700"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4 text-cyan-400" />}
              <span>{copied ? 'Copied Markdown' : 'Copy Report Markdown'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs border border-slate-700"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>Print Report</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold"
          >
            CLOSE REPORT
          </button>
        </div>
      </div>
    </div>
  );
}
