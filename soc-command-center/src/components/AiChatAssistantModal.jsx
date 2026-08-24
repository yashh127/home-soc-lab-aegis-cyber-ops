import React, { useState } from 'react';
import { Bot, Send, X, Sparkles, User, ShieldCheck, Volume2 } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export default function AiChatAssistantModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello, sir. I am J.A.R.V.I.S., your autonomous AI SOC Analyst. How may I assist you with threat reasoning or incident response?' }
  ]);
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  const quickPrompts = [
    'Analyze current critical threat status',
    'What is the attacker IP 18.197.45.112 status?',
    'Recommend AWS CloudTrail containment steps',
    'Explain MITRE T1003 Mimikatz detection'
  ];

  const handleSend = (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    audioEngine.playClick();
    const userMsg = { sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Generate AI J.A.R.V.I.S. response
    setTimeout(() => {
      let aiResponse = "Sir, telemetry analysis confirms elevated threat vectors. All SIEM indices remain updated.";
      const lower = textToSend.toLowerCase();

      if (lower.includes('critical') || lower.includes('threat')) {
        aiResponse = "Sir, we have 42 critical events logged. Primary vector: Root account login without MFA from IP 18.197.45.112. I recommend immediate IAM session revocation.";
      } else if (lower.includes('18.197.45.112') || lower.includes('ip')) {
        aiResponse = "Attacker IP 18.197.45.112 originates from Frankfurt (EU-Central). AbuseIPDB confidence score is 98%. Veronica containment protocol is ready to execute.";
      } else if (lower.includes('aws') || lower.includes('containment')) {
        aiResponse = "For AWS CloudTrail incidents, execute House Party Protocol to deactivate compromised IAM access keys and enforce S3 bucket private policies.";
      } else if (lower.includes('mimikatz') || lower.includes('t1003')) {
        aiResponse = "MITRE T1003 detects memory dumping of lsass.exe process via Windows Sysmon Event ID 10. Rule ID 91030 triggers automatically.";
      }

      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
      audioEngine.speak(aiResponse, { withPrefix: true });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="cyber-card w-full max-w-2xl h-[580px] flex flex-col border-cyan-500/40 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/20 bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-bounce">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <span>J.A.R.V.I.S. AI SOC CHAT ASSISTANT</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <h2 className="text-base font-bold text-white font-cyber">AUTONOMOUS THREAT REASONING CHATBOT</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompt Pills */}
        <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-mono text-slate-400 shrink-0">QUICK PROMPTS:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 rounded-full bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono shrink-0 transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Message Box */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-950/95 font-sans">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 h-fit border border-cyan-500/30">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] p-3 rounded-xl text-xs font-mono leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-purple-600/30 border border-purple-500/40 text-purple-200'
                    : 'bg-slate-900 border border-cyan-500/30 text-cyan-200'
                }`}
              >
                {msg.text}
              </div>
              {msg.sender === 'user' && (
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 h-fit border border-purple-500/30">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask J.A.R.V.I.S. about threat vectors, rules, or containment..."
            className="flex-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => handleSend()}
            className="px-4 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>SEND</span>
          </button>
        </div>
      </div>
    </div>
  );
}
