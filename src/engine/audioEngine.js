/**
 * Solfeggio Harmonic Audio Resonator
 * Web Audio API synthesizer supporting 432 Hz (Grounding), 528 Hz (Cellular Transformation),
 * 639 Hz (Interpersonal Balance), and sub-bass theta drone washes.
 */

export class AudioResonator {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.oscillator = null;
    this.subBassOsc = null;
    this.isInitialized = false;
    this.frequencies = { grounding: 432, clarity: 528, harmony: 639 };
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.15;
      this.masterGain.connect(this.ctx.destination);
      this.isInitialized = true;
    } catch (e) {
      console.warn("AudioContext init error:", e);
    }
  }

  playTone(freqKey = 'grounding', velocity = 0.5) {
    if (!this.isInitialized) this.init();
    if (!this.ctx) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    const baseFreq = typeof freqKey === 'number' ? freqKey : (this.frequencies[freqKey] || 432);
    const targetFreq = baseFreq + (velocity * 48 - 24);

    if (this.oscillator) {
      try { this.oscillator.stop(); } catch (e) {}
    }

    try {
      this.oscillator = this.ctx.createOscillator();
      this.oscillator.type = 'sine';
      this.oscillator.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      this.oscillator.frequency.exponentialRampToValueAtTime(targetFreq, this.ctx.currentTime + 0.3);

      const toneGain = this.ctx.createGain();
      toneGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      toneGain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.1);
      toneGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

      this.oscillator.connect(toneGain);
      toneGain.connect(this.masterGain);

      this.oscillator.start();
      this.oscillator.stop(this.ctx.currentTime + 1.2);
    } catch (e) {}
  }

  startSubBassWash(stressLevel = 0.5) {
    if (!this.isInitialized) this.init();
    if (!this.ctx || this.subBassOsc) return;

    try {
      this.subBassOsc = this.ctx.createOscillator();
      this.subBassOsc.type = 'triangle';
      this.subBassOsc.frequency.value = 55; // Sub-bass low tone

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      subGain.gain.linearRampToValueAtTime(stressLevel * 0.25, this.ctx.currentTime + 1.0);

      this.subBassOsc.connect(subGain);
      subGain.connect(this.masterGain);
      this.subBassOsc.start();
    } catch (e) {}
  }

  stopSubBassWash() {
    if (this.subBassOsc) {
      try {
        this.subBassOsc.stop();
        this.subBassOsc.disconnect();
      } catch (e) {}
      this.subBassOsc = null;
    }
  }

  stopAll() {
    if (this.oscillator) {
      try { this.oscillator.stop(); } catch (e) {}
    }
    this.stopSubBassWash();
  }
}

export default AudioResonator;
