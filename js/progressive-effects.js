// ==================== PROGRESSIVE EFFECTS SYSTEM ====================

const ProgressiveEffects = {
  currentLevel: 1,
  
  init(levelNumber) {
    this.currentLevel = levelNumber;
    this.updateGameContainerLevel(levelNumber);
    this.applyLevelEffects(levelNumber);
  },
  
  updateGameContainerLevel(level) {
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer) {
      gameContainer.setAttribute('data-level', level);
    }
  },
  
  applyLevelEffects(level) {
    if (level >= 1 && level <= 5) {
      this.applyBasicEffects();
    } else if (level >= 6 && level <= 10) {
      this.applyModerateEffects();
    } else if (level >= 11 && level <= 20) {
      this.applyStrongEffects();
    } else if (level >= 21 && level <= 30) {
      this.applyExtremeEffects();
    } else if (level >= 31) {
      this.applyChaosEffects();
    }
  },
  
  applyBasicEffects() {
    this.addSideGlitch(0.2);
    this.setScanlineIntensity(0.2);
  },
  
  applyModerateEffects() {
    this.addSideGlitch(0.4);
    this.setScanlineIntensity(0.4);
    this.addRandomFlash(5000);
  },
  
  applyStrongEffects() {
    this.addSideGlitch(0.6);
    this.setScanlineIntensity(0.6);
    this.addRandomFlash(3000);
    this.addColorShift();
  },
  
  applyExtremeEffects() {
    this.addSideGlitch(0.8);
    this.setScanlineIntensity(0.8);
    this.addRandomFlash(2000);
    this.addColorShift();
    this.addScreenDistortion();
  },
  
  applyChaosEffects() {
    this.addSideGlitch(1);
    this.setScanlineIntensity(1);
    this.addRandomFlash(1000);
    this.addColorShift();
    this.addScreenDistortion();
    this.addChaosParticles();
  },
  
  addSideGlitch(intensity) {
    const overlay = document.querySelector('.game-overlay');
    if (overlay) {
      overlay.style.setProperty('--effect-intensity', intensity);
    }
  },
  
  setScanlineIntensity(intensity) {
    const gameBoard = document.querySelector('.game-board');
    if (gameBoard) {
      gameBoard.style.setProperty('--effect-intensity', intensity);
    }
  },
  
  addRandomFlash(interval) {
    if (this.flashInterval) clearInterval(this.flashInterval);
    
    this.flashInterval = setInterval(() => {
      const gameContainer = document.querySelector('.game-container');
      if (gameContainer && Math.random() < 0.3) {
        const colors = ['#ff0000', '#00ffff', '#ffff00', '#ff00ff'];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        gameContainer.style.filter = `drop-shadow(0 0 20px ${color})`;
        setTimeout(() => {
          gameContainer.style.filter = 'none';
        }, 100);
      }
    }, interval);
  },
  
  addColorShift() {
    const gameBoard = document.querySelector('.game-board');
    if (gameBoard) {
      gameBoard.style.animation = 'color-shift 3s ease-in-out infinite';
    }
  },
  
  addScreenDistortion() {
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer && Math.random() < 0.2) {
      gameContainer.style.transform = 'skewX(2deg)';
      setTimeout(() => {
        gameContainer.style.transform = 'skewX(0deg)';
      }, 150);
      
      setTimeout(() => {
        gameContainer.style.transform = 'skewX(-2deg)';
        setTimeout(() => {
          gameContainer.style.transform = 'skewX(0deg)';
        }, 150);
      }, 300);
    }
  },
  
  addChaosParticles() {
    const particles = ['⚡', '🔥', '💀', '👁️', '🌀', '💥'];
    
    setInterval(() => {
      if (Math.random() < 0.3) {
        const particle = document.createElement('div');
        particle.textContent = particles[Math.floor(Math.random() * particles.length)];
        particle.className = 'chaos-particle';
        particle.style.cssText = `
          position: fixed;
          left: ${Math.random() < 0.5 ? '-50px' : 'calc(100% + 50px)'};
          top: ${Math.random() * 100}%;
          font-size: ${2 + Math.random() * 3}rem;
          pointer-events: none;
          z-index: 10;
          opacity: 0.6;
          animation: chaos-float ${2 + Math.random() * 2}s linear forwards;
        `;
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 4000);
      }
    }, 500);
  },
  
  getBonusMultiplier(level) {
    if (level <= 5) return 1;
    if (level <= 10) return 1.2;
    if (level <= 20) return 1.5;
    if (level <= 30) return 2;
    return 3;
  },
  
  getSpawnFrequency(level) {
    const baseFrequency = 1100;
    const reduction = level * 25;
    const minFrequency = 150;
    return Math.max(minFrequency, baseFrequency - reduction);
  },
  
  getBonusChance(level) {
    const baseChance = 0.15;
    const levelBonus = level * 0.005;
    const maxChance = 0.45;
    return Math.min(maxChance, baseChance + levelBonus);
  },
  
  screenShake(level) {
    const gameContainer = document.querySelector('.game-container');
    if (!gameContainer) return;
    
    gameContainer.classList.remove('shake-light', 'shake-medium', 'shake-heavy');
    
    if (level <= 10) {
      gameContainer.classList.add('shake-light');
    } else if (level <= 25) {
      gameContainer.classList.add('shake-medium');
    } else {
      gameContainer.classList.add('shake-heavy');
    }
    
    setTimeout(() => {
      gameContainer.classList.remove('shake-light', 'shake-medium', 'shake-heavy');
    }, 500);
  },
  
  createBonusParticle(emoji, x, y, level) {
    const particle = document.createElement('div');
    particle.className = 'bonus-particle';
    particle.textContent = emoji;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    
    const sizeMultiplier = 1 + (level / 45);
    particle.style.fontSize = `${1.5 * sizeMultiplier}rem`;
    
    if (level > 20) {
      particle.style.filter = `drop-shadow(0 0 ${level}px currentColor)`;
    }
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, 2000);
  },
  
  updateColorScheme(level) {
    const gameContainer = document.querySelector('.game-container');
    if (!gameContainer) return;
    
    const intensity = Math.min(level / 45, 1);
    const hue = level * 8; // Rotate through color spectrum
    
    gameContainer.style.filter = `hue-rotate(${hue}deg) saturate(${1 + intensity})`;
  },
  
  cleanup() {
    if (this.flashInterval) {
      clearInterval(this.flashInterval);
      this.flashInterval = null;
    }
  }
};

const style = document.createElement('style');
style.textContent = `
@keyframes chaos-float {
  0% {
    transform: translateX(0) rotate(0deg);
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    transform: translateX(${Math.random() < 0.5 ? '-' : ''}150vw) rotate(${360 * (Math.random() < 0.5 ? -1 : 1)}deg);
    opacity: 0;
  }
}

@keyframes color-shift {
  0%, 100% { filter: hue-rotate(0deg); }
  25% { filter: hue-rotate(90deg); }
  50% { filter: hue-rotate(180deg); }
  75% { filter: hue-rotate(270deg); }
}
`;
document.head.appendChild(style);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProgressiveEffects;
}
