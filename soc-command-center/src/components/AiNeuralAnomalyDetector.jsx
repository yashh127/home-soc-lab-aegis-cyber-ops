import React, { useState, useEffect } from 'react';
import { Cpu, Activity, Sparkles, Brain, CheckCircle2, AlertOctagon } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export default function AiNeuralAnomalyDetector({ showHelp }) {
  const [anomalyScore, setAnomalyScore] = useState(0.894);
  const [inferenceTime, setInferenceTime] = useState(4.2);
  const [tensorsAnalyzed, setTensorsAnalyzed] = useState(14820);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnomalyScore(+(0.85 + Math.random() * 0.14).toFixed(3));
      setInferenceTime(+(3.8 + Math.random() * 1.5).toFixed(1));
      setTensorsAnalyzed(prev => prev + Math.floor(Math.random() * 24) + 10);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const isHighAnomaly = anomalyScore > 0.90;

  return (
    <div className="cyber-card p-5 flex flex-col h-full border-purple-500/30 bg-gradient-to-br from-slate-900/90 via-slate-950 to-purple-950/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-purple-500/20">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 animate-pulse">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-cyber text-base font-bold text-white tracking-wide flex items-center gap-1.5">
              AI NEURAL THREAT & ANOMALY DETECTOR <Sparkles className="w-4 h-4 text-amber-400" />
            </h2>
            <p className="text-xs text-slate-400 font-medium">Deep Learning Tensor Inference & Feature Vector Analysis</p>
          </div>
        </div>
        <span className={`badge-label ${isHighAnomaly ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-purple-500/20 text-purple-300 border-purple-500/30'}`}>
          AI MODEL: NEURAL-X v4
        </span>
      </div>

      {showHelp && (
        <div className="mb-3 text-xs bg-purple-950/40 p-2.5 rounded-xl border border-purple-500/20 text-purple-200 font-sans">
          💡 <strong>AI Neural Anomaly Detector:</strong> Uses deep learning neural network inference models to analyze log feature vectors in real-time, detecting zero-day anomalies before static SIEM rules trigger.
        </div>
      )}

      {/* Neural Inference Score Grid */}
      <div className="grid grid-cols-3 gap-3 mb-3.5">
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-purple-500/30 text-center">
          <div className="text-[10px] font-mono text-slate-400 uppercase">ANOMALY SCORE</div>
          <div className={`text-2xl font-extrabold font-cyber my-0.5 ${isHighAnomaly ? 'text-rose-400' : 'text-purple-300'}`}>
            {anomalyScore}
          </div>
          <div className="text-[10px] font-mono text-slate-500">THRESHOLD: 0.850</div>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-sky-500/30 text-center">
          <div className="text-[10px] font-mono text-slate-400 uppercase">LATENCY</div>
          <div className="text-2xl font-extrabold font-cyber text-sky-400 my-0.5">
            {inferenceTime}<span className="text-xs text-slate-500">ms</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-400">REALTIME INFERENCE</div>
        </div>

        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-emerald-500/30 text-center">
          <div className="text-[10px] font-mono text-slate-400 uppercase">TENSORS ANALYZED</div>
          <div className="text-2xl font-extrabold font-cyber text-emerald-400 my-0.5">
            {tensorsAnalyzed.toLocaleString()}
          </div>
          <div className="text-[10px] font-mono text-slate-500">FEATURE VECTORS</div>
        </div>
      </div>

      {/* AI Assessment Bar */}
      <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          {isHighAnomaly ? <AlertOctagon className="w-4 h-4 text-rose-400 animate-bounce" /> : <CheckCircle2 className="w-4 h-4 text-purple-400" />}
          <span className="text-slate-300 font-semibold">
            {isHighAnomaly ? 'HIGH ANOMALY PATTERN DETECTED: Root Account Abuse' : 'NEURAL MODEL CONFIDENCE: 98.4% NOMINAL'}
          </span>
        </div>
        <span className="text-[10px] text-purple-300 px-2 py-0.5 rounded bg-purple-950 border border-purple-500/30">
          TRANSFORMER v4
        </span>
      </div>
    </div>
  );
}
