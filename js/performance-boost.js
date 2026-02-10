/* ==================== OPTIMISATIONS PERFORMANCE ANTI-LAG ==================== */

// Désactiver les animations gourmandes sur mobile
if (window.innerWidth <= 768) {
  document.documentElement.style.setProperty('--reduce-motion', '1');
  
  // Réduire SEULEMENT les effets lourds, pas tout
  const style = document.createElement('style');
  style.textContent = `
    /* Désactiver seulement les particules et effets lourds */
    .particle,
    .bonus-particle,
    .dollar,
    .money-rain,
    [class*="animation"],
    [class*="pulse"],
    [class*="glow"],
    [class*="float"] {
      animation: none !important;
      display: none !important;
    }
    
    /* Garder les transitions normales pour les boutons */
    .header-btn,
    .menu-btn,
    button {
      transition-duration: 0.3s !important;
    }
  `;
  document.head.appendChild(style);
}

// Throttle pour les events scroll/resize
function throttle(func, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

// Debounce pour optimiser
function debounce(func, delay) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

// RequestAnimationFrame optimisé
let rafId = null;
function optimizedRAF(callback) {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(callback);
}

// Limiter les particules
const MAX_PARTICLES = window.innerWidth <= 768 ? 10 : 30;
let particleCount = 0;

// Override createParticle pour limiter
const originalCreateParticle = window.createParticle;
if (originalCreateParticle) {
  window.createParticle = function(...args) {
    if (particleCount >= MAX_PARTICLES) return;
    particleCount++;
    setTimeout(() => particleCount--, 1000);
    return originalCreateParticle.apply(this, args);
  };
}

// Nettoyer les DOM nodes périodiquement
setInterval(() => {
  // Supprimer les particules cachées
  const particles = document.querySelectorAll('.particle, .bonus-particle, .dollar');
  particles.forEach(p => {
    if (p.style.opacity === '0' || p.offsetParent === null) {
      p.remove();
    }
  });
}, 5000);

// Optimiser les shadows
if (window.innerWidth <= 768) {
  const shadows = document.querySelectorAll('[style*="box-shadow"]');
  shadows.forEach(el => {
    el.style.boxShadow = 'none';
  });
}

// Désactiver blur sur mobile
if (window.innerWidth <= 768) {
  const blurs = document.querySelectorAll('[style*="blur"]');
  blurs.forEach(el => {
    el.style.backdropFilter = 'none';
    el.style.webkitBackdropFilter = 'none';
  });
}

// Limiter requestAnimationFrame
let lastFrameTime = 0;
const FPS_LIMIT = 60;
const frameInterval = 1000 / FPS_LIMIT;

const originalRAF = window.requestAnimationFrame;
window.requestAnimationFrame = function(callback) {
  return originalRAF(function(time) {
    if (time - lastFrameTime >= frameInterval) {
      lastFrameTime = time;
      callback(time);
    }
  });
};

// Passive event listeners
const addEventListenerOriginal = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function(type, listener, options) {
  if (type === 'scroll' || type === 'touchmove' || type === 'wheel') {
    if (typeof options === 'object') {
      options.passive = true;
    } else {
      options = { passive: true };
    }
  }
  return addEventListenerOriginal.call(this, type, listener, options);
};

// Log performance
console.log('🚀 Performance optimizations loaded');
console.log('📱 Mobile:', window.innerWidth <= 768);
console.log('🎨 Max particles:', MAX_PARTICLES);
