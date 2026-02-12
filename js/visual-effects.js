// ==================== VISUAL EFFECTS SYSTEM - JUICE ====================

const VisualEffects = {
  screenShake(intensity = 5, duration = 200) {
    const gameContainer = document.querySelector('.game-container');
    let elapsed = 0;
    const interval = 16;
    
    const shake = setInterval(() => {
      elapsed += interval;
      const progress = elapsed / duration;
      const currentIntensity = intensity * (1 - progress);
      
      const x = (Math.random() - 0.5) * currentIntensity * 2;
      const y = (Math.random() - 0.5) * currentIntensity * 2;
      const rot = (Math.random() - 0.5) * currentIntensity * 0.5;
      
      gameContainer.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`;
      
      if (elapsed >= duration) {
        clearInterval(shake);
        gameContainer.style.transform = '';
      }
    }, interval);
  },

  flashScreen(color = '#ff00ff', duration = 100) {
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed;
      inset: 0;
      background: ${color};
      opacity: 0.6;
      z-index: 9998;
      pointer-events: none;
      animation: flashFade ${duration}ms ease-out;
    `;
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), duration);
  },

  particleExplosion(x, y, count = 20, color = '#fff') {
    const container = document.querySelector('.game-overlay');
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      const angle = (Math.PI * 2 * i) / count;
      const velocity = 100 + Math.random() * 100;
      const size = 4 + Math.random() * 8;
      
      particle.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        box-shadow: 0 0 10px ${color};
      `;
      
      container.appendChild(particle);
      
      const dx = Math.cos(angle) * velocity;
      const dy = Math.sin(angle) * velocity;
      
      particle.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(0)`, opacity: 0 }
      ], {
        duration: 500 + Math.random() * 500,
        easing: 'cubic-bezier(0, 0.5, 0.5, 1)'
      }).onfinish = () => particle.remove();
    }
  },

  comboPopup(text, x, y, size = 40) {
    const popup = document.createElement('div');
    popup.textContent = text;
    popup.style.cssText = `
      position: absolute;
      left: ${x}px;
      top: ${y}px;
      font-size: ${size}px;
      font-family: 'Luckiest Guy', cursive;
      color: #fff;
      text-shadow: 
        -2px 0 #ff00ff,
        2px 0 #00ffff,
        0 0 20px #fff;
      pointer-events: none;
      z-index: 9999;
      font-weight: bold;
      transform: translate(-50%, -50%);
    `;
    
    document.querySelector('.game-overlay').appendChild(popup);
    
    popup.animate([
      { transform: 'translate(-50%, -50%) scale(0)', opacity: 0 },
      { transform: 'translate(-50%, -50%) scale(1.5)', opacity: 1, offset: 0.3 },
      { transform: 'translate(-50%, -100%) scale(1)', opacity: 0 }
    ], {
      duration: 1000,
      easing: 'cubic-bezier(0, 0.5, 0.5, 1)'
    }).onfinish = () => popup.remove();
  },

  activateRainbowMode(duration = 10000) {
    const style = document.createElement('style');
    style.id = 'rainbow-mode';
    style.textContent = `
      @keyframes rainbow {
        0% { filter: hue-rotate(0deg) saturate(2); }
        100% { filter: hue-rotate(360deg) saturate(2); }
      }
      .game-board { animation: rainbow 2s linear infinite !important; }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
      document.getElementById('rainbow-mode')?.remove();
    }, duration);
  },

  activateSlowMo(duration = 5000) {
    const gameBoard = document.querySelector('.game-board');
    gameBoard.style.filter = 'blur(0px) brightness(0.7)';
    
    setTimeout(() => {
      gameBoard.style.filter = '';
    }, duration);
  },

  invertScreen(duration = 3000) {
    document.body.style.filter = 'invert(1) hue-rotate(180deg)';
    setTimeout(() => {
      document.body.style.filter = '';
    }, duration);
  },

  glitchEffect(duration = 2000) {
    const style = document.createElement('style');
    style.id = 'glitch-effect';
    style.textContent = `
      @keyframes glitch {
        0%, 100% { transform: translate(0); }
        20% { transform: translate(-5px, 5px); }
        40% { transform: translate(5px, -5px); }
        60% { transform: translate(-5px, -5px); }
        80% { transform: translate(5px, 5px); }
      }
      .game-container {
        animation: glitch 0.1s infinite !important;
        filter: contrast(1.5) brightness(1.2);
      }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
      document.getElementById('glitch-effect')?.remove();
    }, duration);
  },

  updateComboVisual(combo) {
    const comboEl = document.getElementById('combo');
    if (!comboEl) return;
    
    let color = '#fff';
    let shadow = '';
    
    if (combo >= 30) {
      color = '#ff00ff';
      shadow = '0 0 30px #ff00ff, 0 0 60px #ff00ff';
      this.screenShake(8, 100);
    } else if (combo >= 20) {
      color = '#00ffff';
      shadow = '0 0 20px #00ffff';
      this.screenShake(5, 100);
    } else if (combo >= 15) {
      color = '#ffff00';
      shadow = '0 0 15px #ffff00';
    } else if (combo >= 10) {
      color = '#ff6600';
      shadow = '0 0 10px #ff6600';
    } else if (combo >= 5) {
      color = '#00ff00';
    }
    
    comboEl.style.color = color;
    comboEl.style.textShadow = shadow;
    comboEl.style.transform = `scale(${1 + combo * 0.01})`;
  },

  hitFeedback(element, points) {
    const rect = element.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    let color = '#fff';
    if (points >= 100) color = '#ff00ff';
    else if (points >= 50) color = '#00ffff';
    else if (points >= 25) color = '#ffff00';
    
    this.particleExplosion(x, y, 15, color);
    
    const popup = document.createElement('div');
    popup.textContent = `+${points}`;
    popup.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      font-size: clamp(22px, 5vw, 34px);
      font-family: 'Luckiest Guy', cursive;
      color: ${color};
      text-shadow: 0 0 10px ${color}, 2px 2px 0 #000;
      pointer-events: none;
      z-index: 99999;
      font-weight: bold;
    `;
    
    document.body.appendChild(popup);
    
    popup.animate([
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 1 },
      { transform: 'translate(-50%, -150px) scale(1.5)', opacity: 0 }
    ], {
      duration: 800,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    }).onfinish = () => popup.remove();
  }
};

const style = document.createElement('style');
style.textContent = `
@keyframes flashFade {
  0% { opacity: 0.8; }
  100% { opacity: 0; }
}
`;
document.head.appendChild(style);

window.VisualEffects = VisualEffects;
