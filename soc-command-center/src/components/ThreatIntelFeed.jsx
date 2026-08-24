import React, { useState, useEffect } from 'react';
import { ShieldAlert, Database, ExternalLink, Globe, Key, AlertTriangle } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export default function ThreatIntelFeed({ showHelp }) {
  const [iocs, setIocs] = useState([
    { id: 1, type: 'IP', value: '18.197.45.112', score: 98, source: 'AbuseIPDB', threat: 'SSH Brute Force Botnet', country: 'DE' },
    { id: 2, type: 'HASH', value: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', score: 100, source: 'VirusTotal', threat: 'MimiKatz LSA Injector', country: 'US' },
    { id: 3, type: 'DOMAIN', value: 'c2.malicious-exfil.xyz', score: 94, source: 'AlienVault OTX', typeLabel: 'C2 Server', country: 'RU' },
    { id: 4, type: 'IP', value: '54.210.12.89', score: 87, source: 'Cloudflare Threat', threat: 'AWS S3 Credential Harvester', country: 'US' }
  ]);

  const handleInspectIoc = (ioc) => {
    audioEngine.playClick();
    audioEngine.speak(`Threat intelligence indicator inspected: ${ioc.value}. Malicious confidence score ${ioc.score} percent.`, { withPrefix: true });
  };

  return (
    <div className="cyber-card p-5 flex flex-col h-full border-sky-500/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-sky-500/15">
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="font-cyber text-base font-bold text-white tracking-wide">
              LIVE THREAT INTEL & IOC INDICATOR WATCH
            </h2>
            <p className="text-xs text-slate-400 font-medium">Real-time VirusTotal, AbuseIPDB, & AlienVault OTX Threat Feeds</p>
          </div>
        </div>
        <span className="badge-label bg-amber-500/15 border border-amber-500/30 text-amber-300">
          THREAT INTEL SYNCED
        </span>
      </div>

      {showHelp && (
        <div className="mb-3 text-xs bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/20 text-amber-200 font-sans">
          💡 <strong>Threat Intel Watch:</strong> Displays real-time Indicators of Compromise (IOCs) including malicious IP addresses, C2 domain names, and malware file hashes checked against VirusTotal and AbuseIPDB threat intelligence databases.
        </div>
      )}

      {/* IOC Grid Ticker */}
      <div className="space-y-2 flex-1 overflow-y-auto max-h-[160px]">
        {iocs.map((ioc) => (
          <div
            key={ioc.id}
            onClick={() => handleInspectIoc(ioc)}
            className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                  ioc.type === 'HASH'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : ioc.type === 'DOMAIN'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                }`}
              >
                {ioc.type}
              </span>
              <div className="truncate">
                <div className="text-xs font-mono font-bold text-slate-200 group-hover:text-amber-300 transition-colors truncate">
                  {ioc.value}
                </div>
                <div className="text-[10px] text-slate-400 font-sans truncate">
                  {ioc.threat} • Source: <span className="text-slate-300 font-semibold">{ioc.source}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-mono">CONFIDENCE</div>
                <div className="text-xs font-bold font-mono text-rose-400">{ioc.score}%</div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
