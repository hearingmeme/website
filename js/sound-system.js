// ==================== 8-BIT SOUND SYSTEM ====================

const SoundSystem = {
  audioContext: null,
  enabled: true,
  masterVolume: 0.3,
  
  init() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.enabled = false;
    }
  },
  
  beep(frequency, duration, type = 'square') {
    if (!this.enabled || !this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(this.masterVolume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  },
  
  hit(variation = 0) {
    const frequencies = [523, 587, 659, 698, 784]; // C5, D5, E5, F5, G5
    const freq = frequencies[variation % frequencies.length];
    this.beep(freq, 0.1, 'square');
  },
  
  miss() {
    this.beep(150, 0.3, 'sawtooth');
  },
  
  bonus() {
    this.beep(800, 0.05, 'square');
    setTimeout(() => this.beep(1000, 0.05, 'square'), 50);
    setTimeout(() => this.beep(1200, 0.1, 'square'), 100);
  },
  
  rocket() {
    const duration = 0.8;
    if (!this.enabled || !this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + duration);
    oscillator.type = 'sawtooth';
    
    gainNode.gain.setValueAtTime(this.masterVolume * 0.4, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  },
  
  diamond() {
    const notes = [1047, 1319, 1568, 2093]; // High sparkly notes
    notes.forEach((freq, i) => {
      setTimeout(() => this.beep(freq, 0.08, 'sine'), i * 40);
    });
  },
  
  clownHonk() {
    this.beep(400, 0.15, 'square');
    setTimeout(() => this.beep(300, 0.15, 'square'), 150);
  },
  
  freezeWhoosh() {
    const duration = 0.6;
    if (!this.enabled || !this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(1500, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + duration);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  },
  
  levelUp() {
    const notes = [523, 659, 784, 1047]; // C, E, G, C (octave up)
    notes.forEach((freq, i) => {
      setTimeout(() => this.beep(freq, 0.15, 'triangle'), i * 100);
    });
  },
  
  gameOver() {
    const notes = [392, 370, 349, 330];
    notes.forEach((freq, i) => {
      setTimeout(() => this.beep(freq, 0.3, 'sawtooth'), i * 200);
    });
  },
  
  combo(level) {
    const baseFreq = 600 + (level * 50);
    this.beep(baseFreq, 0.05, 'square');
    setTimeout(() => this.beep(baseFreq * 1.5, 0.1, 'square'), 50);
  },
  
  perfect() {
    this.beep(1200, 0.05, 'sine');
    setTimeout(() => this.beep(1400, 0.05, 'sine'), 40);
    setTimeout(() => this.beep(1600, 0.1, 'sine'), 80);
  },
  
  powerUp() {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        this.beep(400 + (i * 100), 0.05, 'square');
      }, i * 30);
    }
  },
  
  coin() {
    this.beep(988, 0.05, 'square');
    setTimeout(() => this.beep(1319, 0.15, 'square'), 60);
  },
  
  explosion() {
    const duration = 0.4;
    if (!this.enabled || !this.audioContext) return;
    
    const noise = this.audioContext.createBufferSource();
    const buffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    noise.buffer = buffer;
    
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    gainNode.gain.setValueAtTime(this.masterVolume * 0.8, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    noise.start();
    noise.stop(this.audioContext.currentTime + duration);
  },
  
  bark() {
    const duration = 0.2;
    if (!this.enabled || !this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + duration);
    
    gainNode.gain.setValueAtTime(this.masterVolume * 0.6, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  },
  
  jackpot() {
    const melody = [1047, 1175, 1319, 1568, 1760, 1976, 2093];
    melody.forEach((freq, i) => {
      setTimeout(() => this.beep(freq, 0.1, 'triangle'), i * 80);
    });
  },
  
  iceBreak() {
    const notes = [2400, 2000, 1600, 1200, 900];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        const duration = 0.08 - (i * 0.01); // Faster as it goes
        gainNode.gain.setValueAtTime(this.masterVolume * 0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + duration);
      }, i * 25);
    });
  },
  
  fire() {
    const duration = 0.15;
    if (!this.enabled || !this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    const filter = this.audioContext.createBiquadFilter();
    
    oscillator.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    const baseFreq = 150 + Math.random() * 200;
    oscillator.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(baseFreq * 0.5, this.audioContext.currentTime + duration);
    oscillator.type = 'sawtooth';
    
    filter.type = 'highpass';
    filter.frequency.value = 100 + Math.random() * 100;
    
    gainNode.gain.setValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration);
  },
  
  ghost() {
    const startFreq = 400;
    const endFreq = 200;
    const duration = 0.5;
    
    if (!this.enabled || !this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.setValueAtTime(startFreq, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(endFreq, this.audioContext.currentTime + duration);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(this.masterVolume * 0.5, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + duration);
  },
  
  lightning() {
    this.beep(3000, 0.02, 'sawtooth');
    setTimeout(() => this.beep(2500, 0.03, 'sawtooth'), 20);
    setTimeout(() => this.beep(2000, 0.05, 'sawtooth'), 40);
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
  window.addEventListener('load', () => {
    SoundSystem.init();
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SoundSystem;
}
