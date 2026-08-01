// J.A.R.V.I.S. (Just A Rather Very Intelligent System) Audio & Speech Engine

class JarvisAudioEngine {
  constructor() {
    this.ctx = null;
    this.soundEnabled = true;
    this.voiceEnabled = true;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.selectedVoice = null;
    
    if (this.synth) {
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Search for British Male voice (Paul Bettany / J.A.R.V.I.S. style)
    this.selectedVoice = 
      voices.find(v => (v.lang === 'en-GB' || v.lang === 'en_GB') && (v.name.includes('Daniel') || v.name.includes('Oliver') || v.name.includes('Arthur') || v.name.includes('Male') || v.name.includes('Google'))) ||
      voices.find(v => v.lang.startsWith('en-GB')) ||
      voices.find(v => v.name.includes('Daniel') || v.name.includes('Alex') || v.name.includes('Google UK English Male')) ||
      voices.find(v => v.lang.startsWith('en')) ||
      voices[0];
  }

  initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // J.A.R.V.I.S. Voice Dispatcher
  speak(text, options = {}) {
    if (!this.voiceEnabled || !this.synth) return;

    try {
      this.synth.cancel(); // Stop prior speech

      // Prepend polite J.A.R.V.I.S. phrasing if requested
      const jarvisPrefixes = [
        "Right away, sir.",
        "Allow me to assist, sir.",
        "Security telemetry updated, sir.",
        "Analyzing perimeter threat vectors, sir.",
        "Protocol engaged, sir."
      ];
      
      const prefix = options.withPrefix ? jarvisPrefixes[Math.floor(Math.random() * jarvisPrefixes.length)] + " " : "";
      const fullText = `${prefix}${text}`;

      const utterance = new SpeechSynthesisUtterance(fullText);
      
      // J.A.R.V.I.S. Voice Tuning: Measured British cadence, slightly deeper pitch
      utterance.rate = 0.94; // Calm, articulate speed
      utterance.pitch = 0.88; // Resonant tone
      utterance.volume = 1.0;

      if (!this.selectedVoice) this.loadVoices();
      if (this.selectedVoice) {
        utterance.voice = this.selectedVoice;
      }

      this.synth.speak(utterance);
    } catch (e) {
      console.warn('J.A.R.V.I.S. speech synthesis error:', e);
    }
  }

  // Stark HUD Chime Sound (Web Audio API)
  playJarvisBootChime() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      // Harmonic fifth (E5 & B5) Stark HUD sound
      osc1.frequency.setValueAtTime(659.25, now);
      osc2.frequency.setValueAtTime(987.77, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.5);
      osc2.stop(now + 0.5);
    } catch (e) {}
  }

  playClick() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1050, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(500, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch (e) {}
  }

  playCriticalAlarm() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(784, now);
      osc.frequency.setValueAtTime(523.25, now + 0.15);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {}
  }

  playContainmentSweep() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.35);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {}
  }
}

export const audioEngine = new JarvisAudioEngine();
