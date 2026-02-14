// ==================== SOUND SYSTEM — OMEGA EDITION ====================
// Rich, layered audio design with Web Audio API

const SoundSystem = {
  audioContext: null,
  enabled: true,
  masterVolume: 0.35,
  
  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.enabled = false;
    }
  },
  
  _ctx() {
    if (!this.enabled) return null;
    if (!this.audioContext) this.init();
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  },
  
  // Core tone builder
  _play(freq, dur, type = 'square', vol = 1, startDelay = 0) {
    const ctx = this._ctx(); if (!ctx) return;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = freq;
    o.type = type;
    const t = ctx.currentTime + startDelay;
    g.gain.setValueAtTime(this.masterVolume * vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.start(t); o.stop(t + dur);
    return { o, g };
  },
  
  // Chord builder
  _chord(freqs, dur, type = 'triangle', vol = 0.5) {
    freqs.forEach((f, i) => this._play(f, dur, type, vol, i * 0.02));
  },
  
  // ============ GAMEPLAY SOUNDS ============
  
  hit(variation = 0) {
    // Rich click - pentatonic scale, gets higher with combos
    const scales = [
      [523, 659, 784],    // C-E-G major
      [587, 740, 880],    // D-F#-A
      [659, 830, 988],    // E-G#-B
      [784, 988, 1175],   // G-B-D
      [1047, 1319, 1568], // High C-E-G
    ];
    const scale = scales[Math.min(variation, scales.length - 1)];
    this._play(scale[0], 0.08, 'square', 0.5);
    setTimeout(() => this._play(scale[1], 0.06, 'triangle', 0.3), 30);
    setTimeout(() => this._play(scale[2], 0.05, 'sine', 0.2), 55);
  },
  
  miss() {
    // Dramatic miss - descending dissonance
    const ctx = this._ctx(); if (!ctx) return;
    this._play(200, 0.08, 'sawtooth', 0.6);
    setTimeout(() => this._play(150, 0.12, 'sawtooth', 0.5), 60);
    setTimeout(() => this._play(100, 0.2, 'sawtooth', 0.4), 130);
    // Low rumble
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine'; o.frequency.setValueAtTime(80, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);
    g.gain.setValueAtTime(this.masterVolume * 0.4, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.start(); o.stop(ctx.currentTime + 0.4);
  },
  
  bonus() {
    // Uplifting 3-note fanfare
    this._play(660, 0.08, 'square', 0.5);
    setTimeout(() => this._play(880, 0.08, 'square', 0.5), 70);
    setTimeout(() => this._play(1320, 0.15, 'square', 0.4), 140);
  },
  
  levelUp() {
    // Rising arpeggio + triumphant chord
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((f, i) => {
      setTimeout(() => this._play(f, 0.12, 'square', 0.45), i * 60);
    });
    setTimeout(() => this._chord([1047, 1319, 1568], 0.4, 'triangle', 0.4), 380);
  },
  
  comboHigh() {
    // Siren-like combo reward for 10x+
    const ctx = this._ctx(); if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'square';
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.linearRampToValueAtTime(1760, ctx.currentTime + 0.15);
    o.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.3);
    g.gain.setValueAtTime(this.masterVolume * 0.3, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    o.start(); o.stop(ctx.currentTime + 0.35);
  },
  
  // ============ SPECIAL SOUNDS ============
  
  rocket() {
    const ctx = this._ctx(); if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(80, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.8);
    g.gain.setValueAtTime(this.masterVolume * 0.5, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.9);
    o.start(); o.stop(ctx.currentTime + 0.9);
    // Sparkle on top
    setTimeout(() => this._chord([1568, 1976, 2637], 0.1, 'sine', 0.2), 700);
  },
  
  diamond() {
    // Crystalline sparkle
    [2093, 2637, 3136, 4186].forEach((f, i) => {
      setTimeout(() => this._play(f, 0.1, 'sine', 0.35), i * 35);
    });
  },
  
  skull() {
    // Ominous descend
    this._play(300, 0.05, 'sawtooth', 0.7);
    setTimeout(() => this._play(200, 0.08, 'sawtooth', 0.6), 50);
    setTimeout(() => this._play(100, 0.3, 'sawtooth', 0.5), 110);
    setTimeout(() => this._play(50, 0.4, 'sine', 0.3), 200);
  },
  
  freeze() {
    // Ice shard - descending shimmer
    const ctx = this._ctx(); if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(2000, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.5);
    g.gain.setValueAtTime(this.masterVolume * 0.4, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    o.start(); o.stop(ctx.currentTime + 0.5);
    // Crystal tinkle
    [2637, 3136, 2093].forEach((f, i) => setTimeout(() => this._play(f, 0.06, 'sine', 0.2), i * 80));
  },
  
  fire() {
    // Crackling roar
    const ctx = this._ctx(); if (!ctx) return;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
        o.connect(f); f.connect(g); g.connect(ctx.destination);
        f.type = 'bandpass'; f.frequency.value = 200 + Math.random() * 400;
        o.type = 'sawtooth'; o.frequency.value = 80 + Math.random() * 120;
        g.gain.setValueAtTime(this.masterVolume * 0.25, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        o.start(); o.stop(ctx.currentTime + 0.15);
      }, i * 50);
    }
  },
  
  ghost() {
    // Eerie wail
    const ctx = this._ctx(); if (!ctx) return;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(300, ctx.currentTime);
    o.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.2);
    o.frequency.linearRampToValueAtTime(280, ctx.currentTime + 0.5);
    g.gain.setValueAtTime(this.masterVolume * 0.4, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    o.start(); o.stop(ctx.currentTime + 0.5);
  },
  
  lightning() {
    // Zap burst
    [4000, 3000, 2000, 1200].forEach((f, i) => setTimeout(() => this._play(f, 0.04, 'sawtooth', 0.5), i * 18));
  },
  
  bark() {
    // Dog bark approximation
    this._play(250, 0.05, 'square', 0.5);
    setTimeout(() => this._play(200, 0.08, 'square', 0.4), 60);
  },
  
  powerUp() {
    // Power-up chime
    [523, 784, 1047, 1568].forEach((f, i) => setTimeout(() => this._play(f, 0.1, 'triangle', 0.4), i * 50));
  },
  
  boss() {
    // Boss appear - dramatic low hits
    this._play(60, 0.3, 'sawtooth', 0.8);
    setTimeout(() => this._play(50, 0.4, 'sawtooth', 0.7), 300);
    setTimeout(() => this._play(80, 0.2, 'square', 0.5), 600);
    setTimeout(() => {
      [200, 250, 300].forEach((f, i) => setTimeout(() => this._play(f, 0.15, 'square', 0.4), i * 40));
    }, 800);
  },
  
  gameOver() {
    // Descending failure sequence
    [523, 415, 330, 262, 196].forEach((f, i) => setTimeout(() => this._play(f, 0.25, 'sawtooth', 0.5), i * 120));
    // Low rumble underneath
    setTimeout(() => {
      const ctx = this._ctx(); if (!ctx) return;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = 'sine'; o.frequency.value = 55;
      g.gain.setValueAtTime(this.masterVolume * 0.3, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      o.start(); o.stop(ctx.currentTime + 1.5);
    }, 200);
  },
  
  victory() {
    // Epic victory fanfare - full arpeggio + chord resolution
    const melody = [523, 587, 659, 784, 880, 1047, 1319, 1568];
    melody.forEach((f, i) => setTimeout(() => {
      this._play(f, 0.15, 'square', 0.4);
      if (i % 2 === 0) this._play(f * 0.75, 0.15, 'triangle', 0.2);
    }, i * 80));
    // Final chord
    setTimeout(() => this._chord([523, 659, 784, 1047], 0.8, 'triangle', 0.4), 720);
    setTimeout(() => this._chord([1047, 1319, 1568, 2093], 1.0, 'sine', 0.3), 900);
  },

  // Aliases for minigames
  explosion() { 
    // Dramatic explosion: falling pitch + rumble
    try {
      const c = this._ctx(); if (!c) return;
      [800,600,400,200,80].forEach((f,i) => {
        const o = c.createOscillator(), g = c.createGain();
        o.connect(g); g.connect(c.destination);
        o.type = 'sawtooth'; o.frequency.value = f;
        g.gain.setValueAtTime(0.25, c.currentTime + i*0.05);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i*0.05 + 0.4);
        o.start(c.currentTime + i*0.05); o.stop(c.currentTime + i*0.05 + 0.4);
      });
    } catch(e) {}
  },
  coin() { this.bonus(); },     // alias
  combo() { this.hit(); },      // alias
  jackpot() { this.victory(); }, // alias

  clownHonk() {
    try {
      const c = this._ctx(); if (!c) return;
      [400, 300, 500, 250].forEach((f, i) => {
        const o = c.createOscillator(), g = c.createGain();
        o.connect(g); g.connect(c.destination);
        o.type = 'sawtooth'; o.frequency.value = f;
        const t = c.currentTime + i * 0.12;
        g.gain.setValueAtTime(0.2, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        o.start(t); o.stop(t + 0.1);
      });
    } catch(e) {}
  },
  perfect() { this.levelUp(); },
  freezeWhoosh() { this.freeze(); },

  speak(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 1.1; u.pitch = 1.0; u.volume = 0.8;
      window.speechSynthesis.speak(u);
    } catch(e) {}
  },
  
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  },
  
  setVolume(vol) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('load', () => SoundSystem.init());
  // Re-init on first interaction (for browsers that need it)
  const initOnInteraction = () => {
    if (SoundSystem.audioContext && SoundSystem.audioContext.state === 'suspended') {
      SoundSystem.audioContext.resume();
    } else if (!SoundSystem.audioContext) {
      SoundSystem.init();
    }
    document.removeEventListener('click', initOnInteraction);
    document.removeEventListener('touchstart', initOnInteraction);
  };
  document.addEventListener('click', initOnInteraction);
  document.addEventListener('touchstart', initOnInteraction);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SoundSystem;
}
