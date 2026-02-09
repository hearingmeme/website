// 🎰💀🔥 HEARING SLOTS ULTRA DEGEN V3 - CASINO EDITION 🔥💀🎰
console.log('🎰 Loading HEARING SLOTS ULTRA DEGEN V3...');

let machineActive = false;
let machineInterval = null;
let casinoAmbiance = null;
let suspenseSound = null;

const symbols = ['👂', '💀', '🔥', '💎', '⚡', '🎮', '💰', '🎯', '🚀', '🤑'];

// Audio Context for casino sounds
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

// Casino coin insert sound
function playCoinInsertSound() {
  try {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
    osc.type = 'sine';
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
    
    // Second clink
    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.frequency.setValueAtTime(1800, ctx.currentTime);
      osc2.type = 'sine';
      gain2.gain.setValueAtTime(0.2, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.15);
    }, 100);
  } catch(e) {}
}

// Casino ambiance loop
function startCasinoAmbiance() {
  try {
    const ctx = initAudio();
    
    // Create looping casino bells/chimes
    const playChime = () => {
      if (!machineActive) return;
      
      const freq = [800, 1000, 1200, 1500][Math.floor(Math.random() * 4)];
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
      
      setTimeout(playChime, 500 + Math.random() * 1500);
    };
    
    playChime();
  } catch(e) {}
}

// Suspense sound for spinning
function playSuspenseSound(duration = 3000) {
  try {
    const ctx = initAudio();
    
    // Rising tension oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + duration/1000);
    
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + duration/1000);
    
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime + duration/1000 - 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration/1000);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration/1000);
    
    // Tick tick tick
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      if (tickCount > duration / 100) {
        clearInterval(tickInterval);
        return;
      }
      const tickOsc = ctx.createOscillator();
      const tickGain = ctx.createGain();
      tickOsc.connect(tickGain);
      tickGain.connect(ctx.destination);
      tickOsc.frequency.value = 600 + tickCount * 10;
      tickOsc.type = 'square';
      tickGain.gain.setValueAtTime(0.1, ctx.currentTime);
      tickGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      tickOsc.start(ctx.currentTime);
      tickOsc.stop(ctx.currentTime + 0.05);
      tickCount++;
    }, 100);
    
    return tickInterval;
  } catch(e) {}
}

// Jackpot fanfare
function playJackpotSound() {
  try {
    const ctx = initAudio();
    const melody = [523, 659, 784, 1047, 1319, 1568, 2093];
    
    melody.forEach((freq, i) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      }, i * 100);
    });
  } catch(e) {}
}

// Win sound
function playWinSound() {
  try {
    const ctx = initAudio();
    [800, 1000, 1200].forEach((freq, i) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'square';
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      }, i * 80);
    });
  } catch(e) {}
}

// Lose sound
function playLoseSound() {
  try {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
    osc.type = 'sawtooth';
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch(e) {}
}

function createHearingMachine() {
  if (machineActive) return;
  
  // 🔊 TTS
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance("Hearing Slots! Spin to win big!");
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    window.speechSynthesis.speak(utterance);
  }
  
  // Pause game
  if (typeof window.setPaused === 'function') window.setPaused(true);
  window.gamePaused = true;
  
  // 🐛 FIX: Clear ALL active ears to prevent deaths during mini-game
  document.querySelectorAll('.ear.active').forEach(ear => {
    ear.classList.remove('active', 'cabal', 'echo', 'power-up');
    ear.textContent = '';
  });
  if (typeof window.activeEarsCount !== 'undefined') {
    window.activeEarsCount = 0;
  }
  
  const overlay = document.createElement('div');
  overlay.id = 'hearingMachineOverlay';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: radial-gradient(ellipse at center, rgba(20,0,40,0.98) 0%, rgba(0,0,0,0.99) 100%);
    z-index: 100005;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s;
    overflow: hidden;
  `;
  
  // Add glitch overlay
  const glitchOverlay = document.createElement('div');
  glitchOverlay.id = 'machineGlitchOverlay';
  glitchOverlay.style.cssText = `
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 100010;
    opacity: 0;
  `;
  overlay.appendChild(glitchOverlay);
  
  // Body images container (will be filled when spinning)
  const bodyContainer = document.createElement('div');
  bodyContainer.id = 'bodyImagesContainer';
  bodyContainer.style.cssText = `
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 100004;
    overflow: hidden;
  `;
  overlay.appendChild(bodyContainer);
  
  const machine = document.createElement('div');
  machine.id = 'hearingMachine';
  machine.style.cssText = `
    position: relative;
    background: 
      linear-gradient(135deg, rgba(255,0,255,0.1), rgba(0,255,255,0.1)),
      linear-gradient(180deg, #1a0a2e 0%, #0d0015 50%, #1a0a2e 100%);
    border: 8px solid;
    border-image: linear-gradient(135deg, #FFD700, #ff00ff, #00ffff, #FFD700) 1;
    border-radius: 30px;
    padding: 30px;
    min-width: 400px;
    max-width: 90vw;
    text-align: center;
    box-shadow: 
      0 0 100px rgba(255,0,255,0.8),
      0 0 200px rgba(255,215,0,0.5),
      inset 0 0 100px rgba(255,0,255,0.3);
    animation: machinePopIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
    z-index: 100006;
  `;
  
  machine.innerHTML = `
    <!-- Neon lights top -->
    <div style="
      position: absolute;
      top: -20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 10px;
    ">
      ${[...Array(7)].map((_, i) => `
        <div style="
          width: 15px;
          height: 15px;
          background: ${['#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#ff0000'][i]};
          border-radius: 50%;
          animation: neonBlink ${0.3 + i * 0.1}s infinite alternate;
          box-shadow: 0 0 20px ${['#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#ff00ff', '#ff0000'][i]};
        "></div>
      `).join('')}
    </div>
    
    <!-- Title -->
    <div style="
      font-family: 'Luckiest Guy', cursive;
      font-size: clamp(28px, 6vw, 45px);
      color: #FFD700;
      margin-bottom: 5px;
      text-shadow: 
        0 0 30px #FFD700,
        0 0 60px #ff00ff,
        4px 4px 0 #000,
        -2px 0 #ff00ff,
        2px 0 #00ffff;
      animation: glitchText 0.5s infinite, neonPulse 1.5s infinite;
      letter-spacing: 3px;
    ">🎰 HEARING SLOTS 🎰</div>
    
    <div style="
      font-family: 'Luckiest Guy', cursive;
      font-size: 16px;
      color: #00ffff;
      margin-bottom: 20px;
      text-shadow: 0 0 15px #00ffff;
      animation: rainbow 2s infinite;
    ">💰 SPIN 2 WIN SER! NO RUGS ONLY HUGS 💰</div>
    
    <!-- Slot machine display -->
    <div style="
      background: linear-gradient(180deg, #000, #1a0a1a);
      border: 6px solid #FFD700;
      border-radius: 20px;
      padding: 20px;
      margin: 15px 0;
      box-shadow: 
        inset 0 0 50px rgba(255,0,255,0.3),
        0 0 30px rgba(255,215,0,0.5);
      position: relative;
    ">
      <!-- Win line indicator -->
      <div style="
        position: absolute;
        left: 0;
        right: 0;
        top: 50%;
        height: 4px;
        background: linear-gradient(90deg, transparent, #ff00ff, #FFD700, #ff00ff, transparent);
        z-index: 10;
        box-shadow: 0 0 20px #ff00ff;
      "></div>
      
      <div style="display: flex; gap: 15px; justify-content: center;">
        ${[0, 1, 2].map(i => `
          <div class="slot-reel" data-reel="${i}" style="
            width: 90px;
            height: 100px;
            background: 
              linear-gradient(180deg, rgba(0,0,0,0.9), rgba(255,215,0,0.1), rgba(0,0,0,0.9));
            border: 4px solid #FFD700;
            border-radius: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 55px;
            overflow: hidden;
            position: relative;
            box-shadow: 
              inset 0 -30px 30px rgba(0,0,0,0.8),
              inset 0 30px 30px rgba(0,0,0,0.8),
              0 0 30px rgba(255,215,0,0.5);
            animation: reelGlow 2s infinite ${i * 0.2}s;
          ">👂</div>
        `).join('')}
      </div>
    </div>
    
    <!-- Lever container -->
    <div style="
      position: absolute;
      right: -60px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
    ">
      <div style="
        width: 20px;
        height: 80px;
        background: linear-gradient(90deg, #666, #999, #666);
        border-radius: 5px;
        box-shadow: inset -3px 0 5px rgba(0,0,0,0.5);
      "></div>
      <div id="machineLever" style="
        width: 60px;
        height: 60px;
        background: radial-gradient(circle at 30% 30%, #ff0000, #aa0000);
        border-radius: 50%;
        border: 4px solid #FFD700;
        cursor: pointer;
        transform-origin: top center;
        transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        box-shadow: 
          0 0 20px rgba(255,0,0,0.8),
          inset 0 -10px 20px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 30px;
        margin-top: -10px;
      ">🕹️</div>
    </div>
    
    <!-- Or click to spin -->
    <button id="spinMachineBtn" style="
      font-family: 'Luckiest Guy', cursive;
      font-size: clamp(20px, 4vw, 28px);
      padding: 15px 50px;
      background: linear-gradient(135deg, #FFD700, #ff9900, #FFD700);
      background-size: 200% 200%;
      color: #000;
      border: 5px solid #fff;
      border-radius: 20px;
      cursor: pointer;
      box-shadow: 
        0 0 40px rgba(255,215,0,1),
        0 10px 30px rgba(0,0,0,0.5);
      transition: all 0.3s;
      animation: buttonPulse 1.5s infinite, gradientShift 2s infinite;
      text-shadow: 2px 2px 0 rgba(255,255,255,0.5);
      letter-spacing: 2px;
      margin-top: 15px;
    ">🎰 PULL THE LEVER OR CLICK! 🎰</button>
    
    <!-- Result display -->
    <div id="machineResult" style="
      font-family: 'Luckiest Guy', cursive;
      font-size: 24px;
      color: #00ff00;
      margin-top: 20px;
      min-height: 80px;
      text-shadow: 0 0 20px currentColor, 3px 3px 0 #000;
    "></div>
    
    <!-- Double or nothing button (hidden initially) -->
    <div id="doubleOrNothingContainer" style="display: none; margin-top: 15px;">
      <button id="doubleOrNothingBtn" style="
        font-family: 'Luckiest Guy', cursive;
        font-size: 22px;
        padding: 12px 30px;
        background: linear-gradient(135deg, #ff00ff, #00ffff);
        color: #fff;
        border: 4px solid #FFD700;
        border-radius: 15px;
        cursor: pointer;
        animation: pulseGlow 0.5s infinite alternate;
        text-shadow: 2px 2px 0 #000;
      ">🎲 YOLO DOUBLE OR NOTHIN SER? 🎲</button>
      <button id="cashOutBtn" style="
        font-family: 'Luckiest Guy', cursive;
        font-size: 18px;
        padding: 10px 25px;
        background: linear-gradient(135deg, #00ff00, #00aa00);
        color: #000;
        border: 3px solid #fff;
        border-radius: 12px;
        cursor: pointer;
        margin-left: 15px;
      ">💰 NAH IM GOOD FAM 💰</button>
    </div>
    
    <!-- Close button -->
    <button id="closeMachineBtn" style="
      position: absolute;
      top: 15px;
      right: 15px;
      background: linear-gradient(135deg, #ff0000, #aa0000);
      color: #fff;
      border: 3px solid #FFD700;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 24px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 0 20px rgba(255,0,0,0.8);
      transition: all 0.3s;
    ">✕</button>
  `;
  
  overlay.appendChild(machine);
  document.body.appendChild(overlay);
  machineActive = true;
  
  // Start casino ambiance
  startCasinoAmbiance();
  
  // Add CSS for this machine
  addMachineStyles();
  
  // Setup event listeners
  const lever = document.getElementById('machineLever');
  const spinBtn = document.getElementById('spinMachineBtn');
  const closeBtn = document.getElementById('closeMachineBtn');
  
  const triggerSpin = () => {
    // Pull lever animation
    if (lever) {
      lever.style.transform = 'rotate(45deg)';
      playCoinInsertSound();
      
      setTimeout(() => {
        lever.style.transform = 'rotate(0deg)';
      }, 500);
    }
    
    setTimeout(() => spinReels(), 300);
  };
  
  if (lever) {
    lever.addEventListener('click', triggerSpin);
    lever.addEventListener('mouseenter', () => {
      lever.style.boxShadow = '0 0 40px rgba(255,0,0,1), inset 0 -10px 20px rgba(0,0,0,0.5)';
    });
    lever.addEventListener('mouseleave', () => {
      lever.style.boxShadow = '0 0 20px rgba(255,0,0,0.8), inset 0 -10px 20px rgba(0,0,0,0.5)';
    });
  }
  
  if (spinBtn) {
    spinBtn.addEventListener('click', triggerSpin);
  }
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeMachine);
  }
  
  // Auto close after 30 seconds
  setTimeout(() => {
    if (machineActive) closeMachine();
  }, 30000);
}

let currentWinAmount = 0;

function spinReels() {
  const spinBtn = document.getElementById('spinMachineBtn');
  const lever = document.getElementById('machineLever');
  const doubleContainer = document.getElementById('doubleOrNothingContainer');
  
  if (!spinBtn || spinBtn.disabled) return;
  
  spinBtn.disabled = true;
  spinBtn.style.opacity = '0.5';
  spinBtn.textContent = '🎰 SPINNING SER... 🎰';
  if (doubleContainer) doubleContainer.style.display = 'none';
  
  // Start glitch effects
  startGlitchEffects();
  
  // Start body images shaking
  startBodyImagesEffect();
  
  // Play suspense sound
  const suspenseInterval = playSuspenseSound(3500);
  
  const reels = document.querySelectorAll('.slot-reel');
  const results = [];
  
  reels.forEach((reel, index) => {
    let spins = 0;
    const maxSpins = 30 + (index * 12);
    reel.style.animation = 'reelSpin 0.08s linear infinite';
    
    const spinInterval = setInterval(() => {
      reel.textContent = symbols[Math.floor(Math.random() * symbols.length)];
      spins++;
      
      // Slow down near end
      if (spins > maxSpins - 10) {
        clearInterval(spinInterval);
        const slowInterval = setInterval(() => {
          reel.textContent = symbols[Math.floor(Math.random() * symbols.length)];
          spins++;
          
          if (spins >= maxSpins) {
            clearInterval(slowInterval);
            reel.style.animation = 'reelGlow 2s infinite, reelLand 0.5s ease-out';
            const finalSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            reel.textContent = finalSymbol;
            results[index] = finalSymbol;
            
            // Play land sound
            try {
              const ctx = initAudio();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.frequency.value = 200 + index * 100;
              osc.type = 'square';
              gain.gain.setValueAtTime(0.2, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
              osc.start(ctx.currentTime);
              osc.stop(ctx.currentTime + 0.1);
            } catch(e) {}
            
            if (results.filter(r => r).length === 3) {
              clearInterval(suspenseInterval);
              stopGlitchEffects();
              stopBodyImagesEffect();
              setTimeout(() => checkWin(results), 500);
            }
          }
        }, 150);
      }
    }, 60);
  });
}

function startGlitchEffects() {
  const glitchOverlay = document.getElementById('machineGlitchOverlay');
  if (!glitchOverlay) return;
  
  glitchOverlay.style.opacity = '1';
  
  const glitchInterval = setInterval(() => {
    if (!machineActive) {
      clearInterval(glitchInterval);
      return;
    }
    
    glitchOverlay.innerHTML = '';
    
    // Random glitch bars
    for (let i = 0; i < 5; i++) {
      const bar = document.createElement('div');
      bar.style.cssText = `
        position: absolute;
        left: 0;
        right: 0;
        top: ${Math.random() * 100}%;
        height: ${2 + Math.random() * 10}px;
        background: ${Math.random() > 0.5 ? '#ff00ff' : '#00ffff'};
        opacity: ${0.3 + Math.random() * 0.5};
        transform: translateX(${(Math.random() - 0.5) * 20}px);
      `;
      glitchOverlay.appendChild(bar);
    }
    
    // RGB shift effect on machine
    const machine = document.getElementById('hearingMachine');
    if (machine) {
      machine.style.filter = `hue-rotate(${Math.random() * 30}deg)`;
      setTimeout(() => {
        if (machine) machine.style.filter = 'none';
      }, 50);
    }
  }, 100);
  
  window.glitchInterval = glitchInterval;
}

function stopGlitchEffects() {
  if (window.glitchInterval) {
    clearInterval(window.glitchInterval);
  }
  const glitchOverlay = document.getElementById('machineGlitchOverlay');
  if (glitchOverlay) {
    glitchOverlay.style.opacity = '0';
    glitchOverlay.innerHTML = '';
  }
  const machine = document.getElementById('hearingMachine');
  if (machine) machine.style.filter = 'none';
}

function startBodyImagesEffect() {
  const container = document.getElementById('bodyImagesContainer');
  if (!container) return;
  
  let imageCount = 0;
  const maxImages = 20;
  
  const addImageInterval = setInterval(() => {
    if (!machineActive || imageCount >= maxImages) {
      clearInterval(addImageInterval);
      return;
    }
    
    const img = document.createElement('img');
    img.src = 'images/body.png';
    img.style.cssText = `
      position: absolute;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      width: ${50 + Math.random() * 100}px;
      opacity: ${0.1 + imageCount * 0.03};
      transform: translate(-50%, -50%) rotate(${Math.random() * 360}deg);
      animation: bodyShake ${0.1 + Math.random() * 0.2}s infinite;
      pointer-events: none;
    `;
    img.onerror = () => img.remove();
    container.appendChild(img);
    imageCount++;
  }, 150);
  
  window.bodyImageInterval = addImageInterval;
}

function stopBodyImagesEffect() {
  if (window.bodyImageInterval) {
    clearInterval(window.bodyImageInterval);
  }
  const container = document.getElementById('bodyImagesContainer');
  if (container) {
    container.innerHTML = '';
  }
}

function checkWin(results) {
  const resultDiv = document.getElementById('machineResult');
  const spinBtn = document.getElementById('spinMachineBtn');
  const doubleContainer = document.getElementById('doubleOrNothingContainer');
  const doubleBtn = document.getElementById('doubleOrNothingBtn');
  const cashOutBtn = document.getElementById('cashOutBtn');
  
  if (!resultDiv) return;
  
  let winAmount = 0;
  let isJackpot = false;
  let isWin = false;
  
  if (results[0] === results[1] && results[1] === results[2]) {
    // JACKPOT!
    isJackpot = true;
    isWin = true;
    
    // Special jackpots
    if (results[0] === '👂') {
      winAmount = 2000; // 🔥 V17: Doublé! (était 1000)
      resultDiv.innerHTML = `
        <div style="font-size: 35px; animation: rainbow 0.5s infinite;">🎰💎 LEGENDARY EARS JACKPOT! 💎🎰</div>
        <div style="font-size: 28px; color: #FFD700; margin-top: 10px;">+${winAmount} POINTS SER!</div>
        <div style="font-size: 16px; color: #ff00ff;">ABSOLUTELY BASED AND EARPILLED!</div>
      `;
    } else if (results[0] === '💰') {
      winAmount = 1500; // 🔥 V17: Presque doublé! (était 777)
      resultDiv.innerHTML = `
        <div style="font-size: 35px; animation: rainbow 0.5s infinite;">🎰💰 MONEY PRINTER GO BRRR! 💰🎰</div>
        <div style="font-size: 28px; color: #FFD700; margin-top: 10px;">+${winAmount} POINTS SER!</div>
        <div style="font-size: 16px; color: #00ff00;">WE'RE ALL GONNA MAKE IT!</div>
      `;
    } else {
      winAmount = 1000; // 🔥 V17: Doublé! (était 500)
      resultDiv.innerHTML = `
        <div style="font-size: 35px; animation: rainbow 0.5s infinite;">🎰🔥 JACKPOT DEGEN! 🔥🎰</div>
        <div style="font-size: 28px; color: #FFD700; margin-top: 10px;">+${winAmount} POINTS SER!</div>
        <div style="font-size: 16px; color: #ff00ff;">LFG!!! 🚀🚀🚀</div>
      `;
    }
    
    playJackpotSound();
    createJackpotCelebration();
    
  } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
    // Small win
    isWin = true;
    winAmount = 300; // 🔥 V17: Doublé! (était 150)
    resultDiv.innerHTML = `
      <div style="font-size: 28px; color: #00ff00;">👂✨ SMOL WIN BUT STILL WINNING! ✨👂</div>
      <div style="font-size: 22px; color: #FFD700; margin-top: 10px;">+${winAmount} POINTS!</div>
      <div style="font-size: 14px; color: #00ffff;">NGMI? NAH U GMI SER!</div>
    `;
    
    playWinSound();
    createSmallWinEffect();
    
  } else {
    // Loss
    resultDiv.innerHTML = `
      <div style="font-size: 30px; color: #ff0000; animation: textShake 0.5s;">💀 REKT! 💀</div>
      <div style="font-size: 18px; color: #ff6666; margin-top: 10px;">NGMI... JK TRY AGAIN FREN!</div>
      <div style="font-size: 14px; color: #888;">Down bad but never out! 🫡</div>
    `;
    
    playLoseSound();
  }
  
  // Apply win to score
  if (winAmount > 0) {
    currentWinAmount = winAmount;
    
    if (typeof window.score !== 'undefined') {
      window.score += winAmount;
    }
    
    // Update UI
    const scoreEl = document.getElementById('score');
    if (scoreEl && typeof window.score !== 'undefined') {
      scoreEl.textContent = Math.round(window.score);
    }
    
    // Show double or nothing option
    if (doubleContainer && !isJackpot) {
      setTimeout(() => {
        doubleContainer.style.display = 'block';
        
        if (doubleBtn) {
          doubleBtn.onclick = () => {
            doubleContainer.style.display = 'none';
            playDoubleOrNothing();
          };
        }
        
        if (cashOutBtn) {
          cashOutBtn.onclick = () => {
            doubleContainer.style.display = 'none';
            resultDiv.innerHTML += `<div style="color: #00ff00; margin-top: 10px;">💰 SMART MOVE SER! CASHED OUT! 💰</div>`;
            enableSpinAgain();
          };
        }
      }, 1500);
    } else {
      enableSpinAgain();
    }
  } else {
    enableSpinAgain();
  }
}

function playDoubleOrNothing() {
  const resultDiv = document.getElementById('machineResult');
  if (!resultDiv) return;
  
  resultDiv.innerHTML = `
    <div style="font-size: 30px; color: #ff00ff; animation: pulse 0.3s infinite;">🎲 DOUBLE OR NOTHING! 🎲</div>
    <div style="font-size: 50px; margin: 20px 0; animation: coinFlip3D 1s ease-out;">🪙</div>
  `;
  
  playSuspenseSound(1500);
  
  setTimeout(() => {
    const won = Math.random() < 0.5;
    
    if (won) {
      currentWinAmount *= 2;
      
      if (typeof window.score !== 'undefined') {
        window.score += currentWinAmount / 2; // Add the extra half
      }
      
      resultDiv.innerHTML = `
        <div style="font-size: 35px; color: #00ff00; animation: pulse 0.5s infinite;">🚀 DOUBLED! 🚀</div>
        <div style="font-size: 28px; color: #FFD700; margin-top: 10px;">NOW +${currentWinAmount} POINTS!</div>
        <div style="font-size: 16px; color: #ff00ff;">ABSOLUTE DEGEN ENERGY!</div>
      `;
      
      playWinSound();
      
      // Offer another double
      setTimeout(() => {
        const doubleContainer = document.getElementById('doubleOrNothingContainer');
        if (doubleContainer) {
          doubleContainer.style.display = 'block';
        }
      }, 1000);
      
    } else {
      // 🔥 V17 FIX: Plus de malus ! Donne au moins 50% des points au lieu de tout perdre
      const minBonus = Math.floor(currentWinAmount * 0.5);
      if (typeof window.score !== 'undefined') {
        window.score += minBonus; // Bonus minimum au lieu de malus!
      }
      
      resultDiv.innerHTML = `
        <div style="font-size: 35px; color: #ffa500; animation: textShake 0.5s;">😅 CLOSE CALL! 😅</div>
        <div style="font-size: 22px; color: #ffcc66; margin-top: 10px;">Didn't double but kept ${minBonus} points!</div>
        <div style="font-size: 16px; color: #888;">Better luck next time! 🎰</div>
      `;
      
      playLoseSound();
      currentWinAmount = minBonus; // Garde au moins ce qu'on a gagné
    }
    
    // Update UI
    const scoreEl = document.getElementById('score');
    if (scoreEl && typeof window.score !== 'undefined') {
      scoreEl.textContent = Math.round(window.score);
    }
    
    enableSpinAgain();
  }, 1500);
}

function enableSpinAgain() {
  const spinBtn = document.getElementById('spinMachineBtn');
  if (spinBtn) {
    setTimeout(() => {
      spinBtn.textContent = '🎰 SPIN AGAIN SER! 🎰';
      spinBtn.disabled = false;
      spinBtn.style.opacity = '1';
    }, 2000);
  }
}

function createJackpotCelebration() {
  const overlay = document.getElementById('hearingMachineOverlay');
  if (!overlay) return;
  
  // Screen flash
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(255,215,0,0.8);
    z-index: 100020;
    animation: flashOut 0.5s ease-out forwards;
    pointer-events: none;
  `;
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 500);
  
  // Massive confetti
  for (let i = 0; i < 150; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.textContent = ['💰', '💎', '🎰', '⚡', '🏆', '👂', '🚀', '🤑', '✨'][Math.floor(Math.random() * 9)];
      confetti.style.cssText = `
        position: fixed;
        left: ${Math.random() * 100}%;
        top: -50px;
        font-size: ${30 + Math.random() * 50}px;
        pointer-events: none;
        z-index: 100015;
        animation: confettiFall ${2 + Math.random() * 3}s ease-out forwards;
        transform: rotate(${Math.random() * 360}deg);
      `;
      overlay.appendChild(confetti);
      setTimeout(() => confetti.remove(), 5000);
    }, i * 15);
  }
}

function createSmallWinEffect() {
  const overlay = document.getElementById('hearingMachineOverlay');
  if (!overlay) return;
  
  for (let i = 0; i < 40; i++) {
    setTimeout(() => {
      const sparkle = document.createElement('div');
      sparkle.textContent = ['✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 4)];
      sparkle.style.cssText = `
        position: fixed;
        left: ${Math.random() * 100}%;
        top: -30px;
        font-size: ${20 + Math.random() * 25}px;
        pointer-events: none;
        z-index: 100015;
        animation: confettiFall ${1.5 + Math.random()}s ease-out forwards;
      `;
      overlay.appendChild(sparkle);
      setTimeout(() => sparkle.remove(), 3000);
    }, i * 30);
  }
}

function closeMachine() {
  const overlay = document.getElementById('hearingMachineOverlay');
  const machine = document.getElementById('hearingMachine');
  
  stopGlitchEffects();
  stopBodyImagesEffect();
  
  if (machine) {
    machine.style.animation = 'machinePopOut 0.4s ease-in forwards';
  }
  
  setTimeout(() => {
    if (overlay) overlay.remove();
    machineActive = false;
    
    // 🐛 V17 FIX CRITIQUE: Utiliser fonction globale de reprise
    if (typeof window.resumeGameAfterMinigame === 'function') {
      window.resumeGameAfterMinigame();
    } else {
      // Fallback
      if (typeof window.setPaused === 'function') window.setPaused(false);
      window.gamePaused = false;
      if (typeof window.startSpawning === 'function') {
        setTimeout(() => window.startSpawning(), 100);
      }
    }
  }, 400);
}

function addMachineStyles() {
  if (document.getElementById('hearingMachineStyles')) return;
  
  const style = document.createElement('style');
  style.id = 'hearingMachineStyles';
  style.textContent = `
    @keyframes machinePopIn {
      0% { transform: scale(0) rotate(-180deg); opacity: 0; }
      60% { transform: scale(1.1) rotate(10deg); }
      80% { transform: scale(0.95) rotate(-5deg); }
      100% { transform: scale(1) rotate(0deg); opacity: 1; }
    }
    
    @keyframes machinePopOut {
      0% { transform: scale(1) rotate(0deg); opacity: 1; }
      100% { transform: scale(0) rotate(180deg); opacity: 0; }
    }
    
    @keyframes reelSpin {
      0% { transform: translateY(-50px) rotateX(-30deg); }
      100% { transform: translateY(50px) rotateX(30deg); }
    }
    
    @keyframes reelGlow {
      0%, 100% { box-shadow: inset 0 -30px 30px rgba(0,0,0,0.8), inset 0 30px 30px rgba(0,0,0,0.8), 0 0 30px rgba(255,215,0,0.5); }
      50% { box-shadow: inset 0 -30px 30px rgba(0,0,0,0.8), inset 0 30px 30px rgba(0,0,0,0.8), 0 0 50px rgba(255,215,0,0.8), 0 0 80px rgba(255,0,255,0.5); }
    }
    
    @keyframes reelLand {
      0% { transform: translateY(-20px); }
      40% { transform: translateY(10px); }
      70% { transform: translateY(-5px); }
      100% { transform: translateY(0); }
    }
    
    @keyframes neonBlink {
      0% { opacity: 0.5; transform: scale(0.9); }
      100% { opacity: 1; transform: scale(1.1); }
    }
    
    @keyframes buttonPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    @keyframes neonPulse {
      0%, 100% { text-shadow: 0 0 30px #FFD700, 0 0 60px #ff00ff, 4px 4px 0 #000; }
      50% { text-shadow: 0 0 50px #FFD700, 0 0 100px #ff00ff, 0 0 150px #00ffff, 4px 4px 0 #000; }
    }
    
    @keyframes glitchText {
      0%, 100% { transform: translate(0); }
      20% { transform: translate(-2px, 2px); }
      40% { transform: translate(2px, -2px); }
      60% { transform: translate(-2px, -2px); }
      80% { transform: translate(2px, 2px); }
    }
    
    @keyframes rainbow {
      0% { color: #ff0000; }
      16% { color: #ff9900; }
      33% { color: #ffff00; }
      50% { color: #00ff00; }
      66% { color: #00ffff; }
      83% { color: #ff00ff; }
      100% { color: #ff0000; }
    }
    
    @keyframes textShake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-15px) rotate(-5deg); }
      75% { transform: translateX(15px) rotate(5deg); }
    }
    
    @keyframes confettiFall {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
    
    @keyframes flashOut {
      0% { opacity: 1; }
      100% { opacity: 0; }
    }
    
    @keyframes bodyShake {
      0%, 100% { transform: translate(-50%, -50%) rotate(var(--rot, 0deg)) scale(1); }
      25% { transform: translate(calc(-50% + 5px), calc(-50% - 5px)) rotate(calc(var(--rot, 0deg) + 5deg)) scale(1.05); }
      75% { transform: translate(calc(-50% - 5px), calc(-50% + 5px)) rotate(calc(var(--rot, 0deg) - 5deg)) scale(0.95); }
    }
    
    @keyframes pulseGlow {
      0% { box-shadow: 0 0 20px #ff00ff, 0 0 40px #00ffff; }
      100% { box-shadow: 0 0 40px #ff00ff, 0 0 80px #00ffff, 0 0 120px #FFD700; }
    }
    
    @keyframes coinFlip3D {
      0% { transform: rotateY(0deg); }
      100% { transform: rotateY(1080deg); }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
  `;
  document.head.appendChild(style);
}

// Expose globally
window.triggerHearingMachine = createHearingMachine;
window.hearingMachineActive = () => machineActive;

console.log('🎰 HEARING SLOTS ULTRA DEGEN V3 ready!');
