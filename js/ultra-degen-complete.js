// 🔥💀 ULTRA DEGEN GAME OVER - COMPLETE EDITION 💀🔥
console.log('🔥 Loading ULTRA DEGEN Complete...');

// Global state
let skullClickCount = 0;
let ultraDegenModeActivated = false;
let achievements = [];
let followingMouse = false;
let rageCounter = 0;
let totalDeaths = 0;

// Get level names
function getLevelName(levelNum) {
  const levelNames = {
    1: "OVERHEARD",
    2: "EAVESDROPPING", 
    3: "WIRETAPPED",
    4: "BUGGED",
    5: "INTERCEPTED",
    6: "TAPPED IN",
    7: "DECODED",
    8: "FREQUENCY FOUND",
    9: "SIGNAL HIJACKED",
    10: "FULL SPECTRUM"
  };
  return levelNames[levelNum] || "OVERHEARD";
}

// Text-to-speech
function speak(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.2;
    utterance.pitch = 0.8;
    utterance.volume = 0.7;
    speechSynthesis.speak(utterance);
  }
}

// Confetti
function launchConfetti() {
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.textContent = ['🎉', '🎊', '✨', '🌟', '💫', '🏆'][Math.floor(Math.random() * 6)];
      confetti.style.cssText = `
        position: fixed;
        left: ${Math.random() * 100}%;
        top: -50px;
        font-size: ${20 + Math.random() * 30}px;
        pointer-events: none;
        z-index: 100001;
        animation: confettiFall ${2 + Math.random() * 2}s ease-out forwards;
      `;
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 4000);
    }, i * 50);
  }
}

// Slot machine
function slotMachineNumber(element, finalValue, duration = 1000) {
  const startTime = Date.now();
  const interval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    if (elapsed >= duration) {
      clearInterval(interval);
      element.textContent = finalValue;
    } else {
      const numericValue = parseInt(String(finalValue).replace(/[^0-9]/g, ''));
      if (!isNaN(numericValue)) {
        element.textContent = Math.floor(Math.random() * numericValue * 2);
      }
    }
  }, 50);
}

// Fake loading bar
function showFakeLoadingBar(callback) {
  const loadingOverlay = document.createElement('div');
  loadingOverlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.95);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 100010;
    gap: 20px;
  `;
  
  const loadingTexts = [
    'Calculating your failure... 📊',
    'Loading disappointment... 😢',
    'Generating roasts... 🔥',
    'Contacting skill issue database... 💀',
    'Downloading copium... 💊',
    'Installing git_gud.exe... 🎮'
  ];
  
  const text = document.createElement('div');
  text.textContent = loadingTexts[0];
  text.style.cssText = `
    color: #FFD700;
    font-family: 'Luckiest Guy', cursive;
    font-size: clamp(16px, 3vw, 24px);
    animation: glitchText 0.5s infinite;
  `;
  
  const barContainer = document.createElement('div');
  barContainer.style.cssText = `
    width: 80%;
    max-width: 500px;
    height: 30px;
    background: rgba(255,215,0,0.2);
    border: 3px solid #FFD700;
    border-radius: 15px;
    overflow: hidden;
    position: relative;
  `;
  
  const bar = document.createElement('div');
  bar.style.cssText = `
    width: 0%;
    height: 100%;
    background: linear-gradient(90deg, #FFD700, #FFA500);
    transition: width 0.1s linear;
  `;
  
  const percent = document.createElement('div');
  percent.textContent = '0%';
  percent.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #000;
    font-family: 'Luckiest Guy', cursive;
    font-size: 16px;
    font-weight: bold;
  `;
  
  barContainer.appendChild(bar);
  barContainer.appendChild(percent);
  loadingOverlay.appendChild(text);
  loadingOverlay.appendChild(barContainer);
  document.body.appendChild(loadingOverlay);
  
  let progress = 0;
  let textIndex = 0;
  const interval = setInterval(() => {
    if (Math.random() < 0.3) {
      progress += Math.random() * 30;
    } else {
      progress += Math.random() * 10;
    }
    
    if (Math.random() < 0.1 && progress > 20) {
      progress -= Math.random() * 15;
    }
    
    progress = Math.min(progress, 100);
    bar.style.width = progress + '%';
    percent.textContent = Math.floor(progress) + '%';
    
    if (Math.random() < 0.2) {
      textIndex = (textIndex + 1) % loadingTexts.length;
      text.textContent = loadingTexts[textIndex];
    }
    
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        loadingOverlay.remove();
        if (callback) callback();
      }, 500);
    }
  }, 100);
}

// Achievement popup
function showAchievement(title, description) {
  const popup = document.createElement('div');
  popup.style.cssText = `
    position: fixed;
    top: 20px;
    right: -400px;
    background: linear-gradient(135deg, #FFD700, #FFA500);
    color: #000;
    padding: 15px 20px;
    border-radius: 10px;
    font-family: 'Luckiest Guy', cursive;
    font-size: 16px;
    box-shadow: 0 0 20px rgba(255,215,0,0.8);
    z-index: 100012;
    animation: slideInRight 0.5s forwards;
    max-width: 350px;
  `;
  popup.innerHTML = `
    <div style="font-size: 20px; margin-bottom: 5px;">🏆 ${title}</div>
    <div style="font-size: 14px; opacity: 0.9;">${description}</div>
  `;
  document.body.appendChild(popup);
  speak(`Achievement unlocked: ${title}`);
  setTimeout(() => {
    popup.style.animation = 'slideOutRight 0.5s forwards';
    setTimeout(() => popup.remove(), 500);
  }, 3000);
}

// Rage popup
function showRagePopup() {
  const rageMessages = [
    'Still trying? 😂',
    'Definition of insanity fr',
    'Maybe take a break? 🤔',
    'Skill issue confirmed ✓',
    'Try easy mode (lol jk) 🤡',
    'Your rage sustains me 🔥',
    'NGMI energy detected 📉',
    'Copium levels: CRITICAL ⚠️'
  ];
  
  const popup = document.createElement('div');
  popup.textContent = rageMessages[Math.floor(Math.random() * rageMessages.length)];
  popup.style.cssText = `
    position: fixed;
    left: 50%;
    top: 30%;
    transform: translate(-50%, -50%) scale(0);
    font-family: 'Comic Sans MS', cursive;
    font-size: clamp(24px, 5vw, 48px);
    color: #ff0000;
    text-shadow: 0 0 20px #ff0000, 3px 3px 0 #000;
    z-index: 100011;
    pointer-events: none;
    animation: popBounce 1s ease-out forwards;
    font-weight: bold;
  `;
  document.body.appendChild(popup);
  speak(popup.textContent);
  setTimeout(() => popup.remove(), 2000);
}

// Check achievements
function checkAchievements(score) {
  totalDeaths++;
  
  if (score === 0 && !achievements.includes('zero')) {
    achievements.push('zero');
    showAchievement('Literal Zero', 'Did you even try? Seriously?');
  }
  if (score < 50 && !achievements.includes('tragic')) {
    achievements.push('tragic');
    showAchievement('Tragically Bad', 'This is actually impressive... in a bad way');
  }
  if (score >= 10000 && !achievements.includes('decent')) {
    achievements.push('decent');
    showAchievement('Actually Decent', 'Not bad for once!');
  }
  if (score >= 50000 && !achievements.includes('chad')) {
    achievements.push('chad');
    showAchievement('Gigachad Status', 'Built different fr fr');
  }
  if (rageCounter >= 3 && !achievements.includes('rage3')) {
    achievements.push('rage3');
    showAchievement('Rage Mode Activated', 'Lost 3 times in a row!');
  }
  if (rageCounter >= 5 && !achievements.includes('rage5')) {
    achievements.push('rage5');
    showAchievement('Copium Overdose', '5 losses straight... seek help');
  }
  if (rageCounter >= 10 && !achievements.includes('rage10')) {
    achievements.push('rage10');
    showAchievement('Unbreakable Spirit', '10 losses... or unbreakable stupidity?');
  }
  if (totalDeaths >= 10 && !achievements.includes('deaths10')) {
    achievements.push('deaths10');
    showAchievement('Persistent Failure', '10 deaths this session!');
  }
  if (totalDeaths >= 25 && !achievements.includes('deaths25')) {
    achievements.push('deaths25');
    showAchievement('Death Collector', '25 deaths... impressive dedication');
  }
  if (skullClickCount >= 10 && !ultraDegenModeActivated) {
    ultraDegenModeActivated = true;
    showAchievement('Secret Unlocked!', 'ULTRA DEGEN MODE ACTIVATED');
    activateUltraDegenMode();
  }
}

// Ultra Degen Mode
function activateUltraDegenMode() {
  speak('ULTRA DEGEN MODE! LETS GO!');
  
  const overlay = document.getElementById('ultraDegenOverlay');
  if (overlay) {
    overlay.style.animation = 'screenShake 0.5s infinite, raveColors 0.2s infinite';
    
    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        const skull = document.createElement('div');
        skull.textContent = ['💀', '🔥', '💥', '⚡', '✨'][Math.floor(Math.random() * 5)];
        const randomX = -500 + Math.random() * 1000;
        const randomY = -500 + Math.random() * 1000;
        const randomRotate = Math.random() * 720;
        skull.style.cssText = `
          position: fixed;
          left: 50%;
          top: 50%;
          font-size: ${30 + Math.random() * 60}px;
          pointer-events: none;
          z-index: 100003;
          transform: translate(-50%, -50%) scale(0);
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
          @keyframes explodeOut${i} {
            0% {
              transform: translate(-50%, -50%) scale(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translate(calc(-50% + ${randomX}px), calc(-50% + ${randomY}px)) scale(2) rotate(${randomRotate}deg);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(styleSheet);
        skull.style.animation = `explodeOut${i} 1s ease-out forwards`;
        document.body.appendChild(skull);
        
        setTimeout(() => {
          skull.remove();
          styleSheet.remove();
        }, 2000);
      }, i * 30);
    }
    
    const mainSkull = document.getElementById('mainSkull');
    if (mainSkull) {
      mainSkull.style.animation = 'megaGrow 2s ease-out forwards, spin 0.5s linear infinite';
    }
    
    const raveMessages = [
      '🔥 LETS GOOOO 🔥',
      '💀 SKULL GANG 💀',
      '⚡ BUILT DIFFERENT ⚡',
      '🎮 GAMER MODE 🎮',
      '🤡 ABSOLUTE CHAOS 🤡',
      '💥 MEGA DEGEN 💥',
      '🚀 TO THE MOON 🚀',
      '😎 TOO COOL 😎'
    ];
    
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const text = document.createElement('div');
        text.textContent = raveMessages[Math.floor(Math.random() * raveMessages.length)];
        text.style.cssText = `
          position: fixed;
          left: ${Math.random() * 80 + 10}%;
          top: ${Math.random() * 80 + 10}%;
          font-size: ${20 + Math.random() * 40}px;
          font-family: 'Comic Sans MS', cursive;
          font-weight: bold;
          color: hsl(${Math.random() * 360}, 100%, 50%);
          text-shadow: 0 0 20px currentColor, 2px 2px 0 #000;
          pointer-events: none;
          z-index: 100002;
          animation: textPulse 0.3s infinite, float 2s ease-in-out infinite;
        `;
        document.body.appendChild(text);
        setTimeout(() => text.remove(), 3000);
      }, i * 200);
    }
    
    const airhorn = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAAD/////');
    airhorn.volume = 0.5;
    airhorn.loop = true;
    airhorn.play().catch(() => {});
    
    setTimeout(() => {
      airhorn.pause();
      if (overlay) {
        overlay.style.animation = '';
      }
    }, 5000);
  }
}

// DOM ready
window.addEventListener('load', function() {
  console.log('🎮 Ultra Degen Complete ready...');
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes confettiFall {
      to { transform: translateY(100vh) rotate(720deg); opacity: 0; }
    }
    @keyframes slideInRight {
      to { right: 20px; }
    }
    @keyframes slideOutRight {
      to { right: -400px; }
    }
    @keyframes screenShake {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      10% { transform: translate(-5px, 5px) rotate(1deg); }
      20% { transform: translate(5px, -5px) rotate(-1deg); }
      30% { transform: translate(-5px, -5px) rotate(1deg); }
      40% { transform: translate(5px, 5px) rotate(-1deg); }
      50% { transform: translate(-5px, 5px) rotate(1deg); }
      60% { transform: translate(5px, -5px) rotate(-1deg); }
      70% { transform: translate(-5px, -5px) rotate(1deg); }
      80% { transform: translate(5px, 5px) rotate(-1deg); }
      90% { transform: translate(-5px, 5px) rotate(1deg); }
    }
    @keyframes raveColors {
      0% { filter: hue-rotate(0deg) saturate(150%); }
      25% { filter: hue-rotate(90deg) saturate(200%); }
      50% { filter: hue-rotate(180deg) saturate(150%); }
      75% { filter: hue-rotate(270deg) saturate(200%); }
      100% { filter: hue-rotate(360deg) saturate(150%); }
    }
    @keyframes megaGrow {
      0% { transform: scale(1); }
      50% { transform: scale(5); }
      100% { transform: scale(3) rotate(360deg); }
    }
    @keyframes textPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    @keyframes glitchText {
      0%, 100% { transform: translate(0); text-shadow: 2px 0 #ff0000, -2px 0 #00ff00; }
      25% { transform: translate(-2px, 2px); text-shadow: -2px 0 #ff0000, 2px 0 #00ff00; }
      50% { transform: translate(2px, -2px); text-shadow: 2px 0 #00ff00, -2px 0 #ff0000; }
      75% { transform: translate(-2px, -2px); text-shadow: -2px 0 #00ff00, 2px 0 #ff0000; }
    }
    @keyframes popBounce {
      0% { transform: translate(-50%, -50%) scale(0); }
      50% { transform: translate(-50%, -50%) scale(1.2); }
      100% { transform: translate(-50%, -50%) scale(1); }
    }
    .glitch {
      animation: glitchText 0.3s infinite;
    }
  `;
  document.head.appendChild(style);
  
  const oldScreen = document.getElementById('gameOverScreen');
  if (oldScreen) {
    oldScreen.style.display = 'none !important';
  }
  
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const target = mutation.target;
        if (target.id === 'gameOverScreen' && target.style.display !== 'none') {
          target.style.display = 'none';
          rageCounter++;
          showFakeLoadingBar(() => setTimeout(showUltraDegenGameOver, 100));
        }
      }
    });
  });
  
  if (oldScreen) {
    observer.observe(oldScreen, {
      attributes: true,
      attributeFilter: ['style']
    });
  }
});

function showUltraDegenGameOver() {
  console.log('💀 ULTRA DEGEN GAME OVER!');
  
  if (document.getElementById('ultraDegenOverlay')) return;
  
  const scoreEl = document.getElementById('score');
  const highScoreEl = document.getElementById('highScore');
  const comboEl = document.getElementById('combo');
  const streakEl = document.getElementById('streak');
  const levelEl = document.getElementById('level');
  
  const score = scoreEl ? parseInt(scoreEl.textContent) || 0 : 0;
  const highScore = highScoreEl ? parseInt(highScoreEl.textContent.replace(/,/g, '')) || 0 : 0;
  const comboText = comboEl ? comboEl.textContent : 'x1.0';
  const streakText = streakEl ? streakEl.textContent : '0/7';
  const levelText = levelEl ? levelEl.textContent : 'LEVEL 1';
  const levelNum = parseInt(levelText.match(/\d+/)?.[0] || '1');
  const levelName = getLevelName(levelNum);
  
  const isNewHighScore = score > highScore;
  
  checkAchievements(score);
  
  if (rageCounter >= 3) {
    showRagePopup();
  }
  
  const hour = new Date().getHours();
  let timeRoast = '';
  if (hour >= 0 && hour < 6) timeRoast = "It's " + hour + "AM? Go to bed ffs";
  else if (hour >= 6 && hour < 12) timeRoast = "Morning gaming sesh = L";
  else if (hour >= 12 && hour < 18) timeRoast = "Afternoon grind detected";
  else timeRoast = "Night owl? More like night fail";
  
  let scoreRoasts = [];
  if (score < 100) {
    scoreRoasts = ["DID U EVEN TRY?", "MY GRANDMA > U", "R U OK BRO?", "NGMI ENERGY"];
  } else if (score < 1000) {
    scoreRoasts = ["MID AF NGL", "COPIUM OVERDOSE", "SKILL ISSUE DETECTED"];
  } else if (score < 10000) {
    scoreRoasts = ["NOT BAD 4 A NOOB", "RESPECTABLE I GUESS", "COULD BE WORSE"];
  } else {
    scoreRoasts = ["OK CHAD ENERGY", "BUILT DIFFERENT", "UNFATHOMABLE BASED"];
  }
  
  const sadTrombone = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgA');
  sadTrombone.volume = 0.3;
  sadTrombone.play().catch(() => {});
  
  const randomRoast = scoreRoasts[Math.floor(Math.random() * scoreRoasts.length)];
  speak(randomRoast);
  
  if (isNewHighScore) {
    launchConfetti();
    speak("New high score! Gigachad moment!");
    rageCounter = 0;
  }
  
  const overlay = document.createElement('div');
  overlay.id = 'ultraDegenOverlay';
  overlay.style.cssText = `
    position: fixed;
    inset: 0;
    background: linear-gradient(135deg, #000, #1a1a00, #000);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    padding: 10px;
    overflow: hidden;
  `;
  
  for (let i = 0; i < 20; i++) {
    const skull = document.createElement('div');
    skull.textContent = '💀';
    skull.style.cssText = `
      position: absolute;
      font-size: ${20 + Math.random() * 40}px;
      left: ${Math.random() * 100}%;
      top: -50px;
      opacity: 0.3;
      pointer-events: none;
      animation: confettiFall ${3 + Math.random() * 3}s linear infinite;
      animation-delay: ${Math.random() * 2}s;
    `;
    overlay.appendChild(skull);
  }
  
  const box = document.createElement('div');
  box.style.cssText = `
    background: linear-gradient(135deg, #000, #1a1a00, #000);
    border: 5px solid #FFD700;
    border-radius: 20px;
    padding: 10px 15px;
    max-width: 550px;
    width: 90%;
    text-align: center;
    box-shadow: 0 0 60px rgba(255,215,0,0.9), inset 0 0 40px rgba(255,215,0,0.2);
    margin: auto;
    position: relative;
    z-index: 100000;
    max-height: 95vh;
    overflow: hidden;
  `;
  
  let titleText = "GAEM OVUR";
  
  box.innerHTML = `
    ${isNewHighScore ? `
      <div style="
        font-size: clamp(24px, 5vw, 42px);
        color: #FFD700;
        font-family: 'Luckiest Guy', cursive;
        margin-bottom: 10px;
        text-shadow: 0 0 30px #FFD700;
        animation: rainbow 2s infinite, pulse 1s infinite;
      ">🏆 GIGACHAD MOMENT 🏆</div>
    ` : ''}
    
    ${rageCounter >= 2 ? `
      <div style="
        font-size: clamp(14px, 3vw, 18px);
        color: #ff4444;
        font-family: 'Comic Sans MS', cursive;
        margin-bottom: 8px;
        animation: textPulse 0.5s infinite;
      ">🔥 RAGE METER: ${rageCounter}/10 🔥</div>
    ` : ''}
    
    <div id="mainSkull" class="main-skull" style="
      font-size: clamp(50px, 10vw, 70px);
      margin: -10px 0 -5px 0;
      animation: spin 4s linear infinite;
      cursor: pointer;
      transition: all 0.3s;
      filter: drop-shadow(0 0 20px #FFD700);
      position: relative;
    " title="Click me 10 times!">💀</div>
    
    <div class="title-text glitch" style="
      font-size: clamp(28px, 6vw, 42px);
      color: #ff0000;
      font-family: 'Luckiest Guy', cursive;
      margin-bottom: 5px;
      letter-spacing: 2px;
    ">${titleText}</div>
    
    <div style="
      font-size: clamp(12px, 2.5vw, 18px);
      color: #00ff00;
      font-family: 'Comic Sans MS', cursive;
      margin-bottom: 5px;
      text-shadow: 2px 2px 0 #000;
      animation: rainbow 3s infinite;
      font-weight: bold;
    ">${randomRoast}</div>
    
    <div style="
      font-size: clamp(10px, 2vw, 14px);
      color: #FFD700;
      margin-bottom: 10px;
      opacity: 0.8;
    ">${timeRoast}</div>
    
    <div style="
      background: rgba(255,215,0,0.15);
      border: 3px solid #FFD700;
      border-radius: 15px;
      padding: 10px;
      margin: 10px 0;
      box-shadow: 0 0 25px rgba(255,215,0,0.4);
    ">
      <div id="scoreDisplay" style="
        font-size: clamp(40px, 8vw, 60px);
        background: linear-gradient(135deg, #FFD700, #FFA500);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-family: 'Luckiest Guy', cursive;
        margin-bottom: 5px;
        filter: drop-shadow(3px 3px 0 #000);
        animation: pulse 1.5s infinite;
      ">??? PTS</div>
      
      <div style="
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 8px;
        font-size: clamp(11px, 2vw, 14px);
        color: #fff;
        font-family: 'Luckiest Guy', cursive;
        margin-top: 8px;
      ">
        <div class="stat-slot" data-final="${highScore.toLocaleString()}" data-detail="High Score: ${highScore.toLocaleString()} points" style="
          background: rgba(255,215,0,0.2);
          padding: 8px;
          border-radius: 8px;
          border: 2px solid rgba(255,215,0,0.5);
          transition: all 0.3s;
          cursor: help;
          position: relative;
        ">🏆 ???</div>
        <div class="stat-slot" data-final="${comboText}" data-detail="Combo Multiplier: ${comboText}" style="
          background: rgba(255,100,0,0.2);
          padding: 8px;
          border-radius: 8px;
          border: 2px solid rgba(255,100,0,0.5);
          transition: all 0.3s;
          cursor: help;
          position: relative;
        ">🔥 ???</div>
        <div class="stat-slot" data-final="${streakText}" data-detail="Streak: ${streakText}" style="
          background: rgba(255,255,0,0.2);
          padding: 8px;
          border-radius: 8px;
          border: 2px solid rgba(255,255,0,0.5);
          transition: all 0.3s;
          cursor: help;
          position: relative;
        ">⚡ ???</div>
        <div class="stat-slot" data-final="${levelNum}" data-detail="Level ${levelNum}" style="
          background: rgba(255,215,0,0.2);
          padding: 8px;
          border-radius: 8px;
          border: 2px solid rgba(255,215,0,0.5);
          transition: all 0.3s;
          cursor: help;
          position: relative;
        ">📈 ???</div>
      </div>
    </div>
    
    <div style="
      font-size: clamp(16px, 3.5vw, 22px);
      background: linear-gradient(135deg, #FFD700, #FFA500);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin: 8px 0 3px 0;
      font-family: 'Luckiest Guy', cursive;
      animation: rainbow 3s infinite;
    ">👂 LEVEL ${levelNum} - ${levelName}</div>
    
    <div style="
      font-size: clamp(10px, 1.8vw, 12px);
      color: #ff8800;
      margin-bottom: 10px;
      opacity: 0.7;
    ">OVERHEARD</div>
    
    <div style="position: relative; display: inline-block; width: 85%; max-width: 350px; margin-bottom: 8px;">
      <input type="text" id="degenPlayerName" placeholder="YOUR X (or cope if anon)" maxlength="20" style="
        font-size: clamp(13px, 2.5vw, 16px);
        padding: 8px 12px;
        background: rgba(0,0,0,0.7);
        border: 3px solid #FFD700;
        border-radius: 10px;
        color: #fff;
        font-family: 'Luckiest Guy', cursive;
        text-align: center;
        width: 100%;
        box-shadow: 0 0 20px rgba(255,215,0,0.4);
        transition: all 0.3s;
      ">
    </div>
    
    <button id="submitBtn" style="
      font-size: clamp(16px, 3vw, 20px);
      padding: 8px 20px;
      background: linear-gradient(135deg, #FFD700, #FFA500);
      color: #000;
      border: 3px solid #fff;
      border-radius: 10px;
      cursor: pointer;
      font-family: 'Luckiest Guy', cursive;
      margin: 5px;
      box-shadow: 0 0 25px rgba(255,215,0,0.7);
      transition: all 0.2s;
    ">💾 SAVE (cope harder)</button>
    
    <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-top: 8px;">
      <button id="retryBtn" style="
        font-size: clamp(13px, 2.5vw, 16px);
        padding: 8px 16px;
        background: linear-gradient(135deg, #00ff00, #00aa00);
        color: #000;
        border: 3px solid #FFD700;
        border-radius: 10px;
        cursor: pointer;
        font-family: 'Luckiest Guy', cursive;
        box-shadow: 0 0 20px rgba(0,255,0,0.6);
        transition: all 0.2s;
      ">🎮 RUN IT BACK</button>
      
      <button id="shareBtn" style="
        font-size: clamp(12px, 2.3vw, 14px);
        padding: 8px 16px;
        background: linear-gradient(135deg, #1DA1F2, #0d8bd9);
        color: #fff;
        border: 3px solid #FFD700;
        border-radius: 10px;
        cursor: pointer;
        font-family: 'Luckiest Guy', cursive;
        box-shadow: 0 0 20px rgba(29,161,242,0.6);
        transition: all 0.2s;
      ">𝕏 FLEX</button>
      
      <button id="rageQuitBtn" style="
        font-size: clamp(12px, 2.3vw, 14px);
        padding: 8px 16px;
        background: linear-gradient(135deg, #ff0000, #aa0000);
        color: #fff;
        border: 3px solid #FFD700;
        border-radius: 10px;
        cursor: pointer;
        font-family: 'Luckiest Guy', cursive;
        box-shadow: 0 0 20px rgba(255,0,0,0.6);
        transition: all 0.2s;
      ">✕ RAGE QUIT</button>
    </div>
    
    <div style="
      margin-top: 10px;
      font-size: clamp(14px, 3vw, 18px);
      color: #FFD700;
      font-family: 'Comic Sans MS', cursive;
      font-weight: bold;
      text-shadow: 2px 2px 0 #000, 0 0 10px #FFD700;
      animation: pulse 2s infinite;
    ">git gud scrub 🤡</div>
  `;
  
  overlay.appendChild(box);
  document.body.appendChild(overlay);
  
  setTimeout(() => {
    const titleEl = box.querySelector('.title-text');
    if (titleEl) {
      titleEl.textContent = "GAME OVR";
      setTimeout(() => titleEl.textContent = "GAME OVER", 500);
    }
  }, 500);
  
  setTimeout(() => {
    const scoreDisplay = document.getElementById('scoreDisplay');
    if (scoreDisplay) {
      slotMachineNumber(scoreDisplay, score + ' PTS', 1500);
    }
    
    const statSlots = document.querySelectorAll('.stat-slot');
    statSlots.forEach((slot, index) => {
      setTimeout(() => {
        const finalValue = slot.getAttribute('data-final');
        const emoji = slot.textContent.split(' ')[0];
        slotMachineNumber(slot, emoji + ' ' + finalValue, 1000);
      }, index * 200);
    });
  }, 500);
  
  setTimeout(function() {
    const mainSkull = document.getElementById('mainSkull');
    if (mainSkull) {
      mainSkull.addEventListener('click', function() {
        skullClickCount++;
        mainSkull.style.animation = 'none';
        setTimeout(() => mainSkull.style.animation = 'spin 4s linear infinite', 10);
        
        if (skullClickCount === 10) {
          checkAchievements(score);
        }
        
        const roast = scoreRoasts[skullClickCount % scoreRoasts.length];
        speak(roast);
      });
      
      document.addEventListener('mousemove', function(e) {
        if (followingMouse) {
          const rect = mainSkull.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          mainSkull.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px) rotate(${x * 0.05}deg)`;
        }
      });
      
      mainSkull.addEventListener('mouseenter', () => followingMouse = true);
      mainSkull.addEventListener('mouseleave', () => followingMouse = false);
    }
    
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
      let countdown = 3;
      const originalText = retryBtn.textContent;
      
      const countInterval = setInterval(() => {
        retryBtn.textContent = `🎮 RETRY IN ${countdown}...`;
        retryBtn.disabled = true;
        retryBtn.style.opacity = '0.6';
        countdown--;
        
        if (countdown === 1 && rageCounter >= 2 && Math.random() < 0.5) {
          showRagePopup();
        }
        
        if (countdown < 0) {
          clearInterval(countInterval);
          retryBtn.textContent = originalText;
          retryBtn.disabled = false;
          retryBtn.style.opacity = '1';
        }
      }, 1000);
      
      retryBtn.addEventListener('click', () => {
        if (!retryBtn.disabled) {
          // Close overlay
          overlay.remove();
          // Restart the game by calling startGame function from game.js
          if (typeof window.startGame === 'function') {
            window.startGame();
          } else {
            // Fallback: reload if startGame not available
            window.location.reload(true);
          }
        }
      });
    }
    
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const nameInput = document.getElementById('degenPlayerName');
        const playerName = nameInput ? nameInput.value.trim() : '';
        const userHandle = playerName.startsWith('@') ? playerName : '';
        
        const scoreFormatted = score.toLocaleString();
        
        // Level emojis
        const emojiMap = {
          'OVERHEARD': '👂',
          'EAVESDROPPING': '🎧',
          'WIRETAPPED': '📞',
          'BUGGED': '🐛',
          'INTERCEPTED': '📡',
          'TAPPED IN': '🔌',
          'DECODED': '🔓',
          'FREQUENCY FOUND': '📻',
          'SIGNAL HIJACKED': '📶',
          'FULL SPECTRUM': '🌈'
        };
        const levelEmoji = emojiMap[levelName] || '👂';
        
        // Fun phrases based on score
        const phrases = {
          tragic: [
            'My ears are broken 💀',
            'Hearing aid needed ASAP 🦻',
            'What did you say? 🤷',
            'Sound system: offline 🔇'
          ],
          low: [
            'Barely heard anything 😅',
            'Ears on training mode 🎯',
            'Getting warmed up 🔥',
            'Just vibing fr 😎'
          ],
          mid: [
            'Ears are tingling! 👂✨',
            'Hearing things loud and clear 📢',
            'Sound detection: activated 🎵',
            'Audio senses on point 🎯'
          ],
          high: [
            'ULTRA HEARING ACTIVATED 🚀',
            'Ears went SUPERSONIC 💥',
            'Built different fr fr 😤',
            'Absolutely COOKED 🔥🔥🔥'
          ],
          godlike: [
            'HEARING GOD MODE 👑',
            'Transcended reality itself 🌌',
            'My ears are HAX 🤯',
            'UNREAL hearing skills 💎'
          ]
        };
        
        let category = 'tragic';
        if (score >= 50000) category = 'godlike';
        else if (score >= 10000) category = 'high';
        else if (score >= 1000) category = 'mid';
        else if (score >= 100) category = 'low';
        
        const funPhrase = phrases[category][Math.floor(Math.random() * phrases[category].length)];
        
        // Build stylized tweet
        let text = `👂 HEARING THINGS - WHACK THE RUMORS 👂\n\n`;
        text += `📊 Score: ${scoreFormatted} pts\n`;
        text += `🎮 Level ${levelNum}: ${levelName}\n`;
        text += `💬 ${funPhrase}\n\n`;
        
        if (userHandle) {
          text += `Can you beat ${userHandle}? 👀\n\n`;
        } else {
          text += `Think you got better ears? 👀\n\n`;
        }
        
        text += `Play now → hearingthings.meme 🎧\n\n`;
        text += `@hearingmeme`;
        
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
      });
    }
    
    const rageQuitBtn = document.getElementById('rageQuitBtn');
    if (rageQuitBtn) {
      rageQuitBtn.addEventListener('click', () => {
        speak('Rage quitting? Weak.');
        showAchievement('Rage Quit', 'Could not handle the pressure');
        setTimeout(() => {
          overlay.remove();
          window.location.href = 'home.html';
        }, 1500);
      });
    }
    
    const submitBtn = document.getElementById('submitBtn');
    const nameInput = document.getElementById('degenPlayerName');
    if (submitBtn && nameInput) {
      submitBtn.addEventListener('click', async function() {
        const name = nameInput.value.trim();
        if (!name) {
          nameInput.placeholder = 'NICE TRY BUDDY 🤡';
          speak('Enter your name, genius');
          return;
        }
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'SAVING...';
        
        // Extract Twitter handle if present
        let playerName = name;
        let twitterHandle = null;
        
        if (name.startsWith('@')) {
          twitterHandle = name.substring(1); // Remove @
          playerName = name; // Keep @ in display name
        } else if (name.includes('@')) {
          const parts = name.split('@');
          playerName = parts[0].trim() || name;
          twitterHandle = parts[1].trim();
        }
        
        if (typeof window.saveScore === 'function') {
          const success = await window.saveScore(playerName, score, twitterHandle);
          if (success) {
            submitBtn.textContent = 'GG WP ✅';
            speak('Score saved!');
            rageCounter = 0;
          } else {
            submitBtn.textContent = '💾 SAVE (cope harder)';
            submitBtn.disabled = false;
          }
        } else {
          submitBtn.textContent = 'SAVED! ✅';
          speak('Score saved!');
        }
      });
      
      nameInput.addEventListener('focus', function() {
        nameInput.style.borderColor = '#FFA500';
        nameInput.style.boxShadow = '0 0 30px rgba(255,165,0,0.8)';
        nameInput.style.transform = 'scale(1.02)';
        
        const tooltip = document.createElement('div');
        tooltip.className = 'name-tooltip';
        tooltip.innerHTML = `
          <div style="margin-bottom: 5px; font-size: 14px;">💡 Pro tip:</div>
          <div style="font-size: 12px;">Add <strong>@handle</strong> to link your X profile in leaderboard & tweets!</div>
        `;
        tooltip.style.cssText = `
          position: absolute;
          bottom: 110%;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #FFD700, #FFA500);
          color: #000;
          padding: 10px 15px;
          border-radius: 10px;
          font-family: 'Luckiest Guy', cursive;
          box-shadow: 0 0 20px rgba(255,215,0,0.8);
          z-index: 100003;
          pointer-events: none;
          animation: fadeIn 0.3s;
          text-align: center;
          white-space: nowrap;
          max-width: 300px;
        `;
        nameInput.parentElement.appendChild(tooltip);
      });
      
      nameInput.addEventListener('blur', function() {
        nameInput.style.borderColor = '#FFD700';
        nameInput.style.boxShadow = '0 0 20px rgba(255,215,0,0.4)';
        nameInput.style.transform = 'scale(1)';
        const tooltip = nameInput.parentElement.querySelector('.name-tooltip');
        if (tooltip) tooltip.remove();
      });
    }
    
    const statBoxes = document.querySelectorAll('.stat-slot');
    statBoxes.forEach(function(box) {
      box.addEventListener('mouseenter', function() {
        box.style.transform = 'scale(1.1)';
        box.style.boxShadow = '0 0 25px rgba(255,215,0,0.8)';
        
        const detail = box.getAttribute('data-detail');
        const tooltip = document.createElement('div');
        tooltip.className = 'stat-tooltip';
        tooltip.textContent = detail;
        tooltip.style.cssText = `
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #000, #1a1a00);
          color: #FFD700;
          padding: 8px 15px;
          border-radius: 8px;
          font-size: 12px;
          white-space: nowrap;
          margin-bottom: 5px;
          border: 2px solid #FFD700;
          box-shadow: 0 0 15px rgba(255,215,0,0.6);
          animation: fadeIn 0.2s;
          z-index: 100002;
          pointer-events: none;
        `;
        box.appendChild(tooltip);
      });
      box.addEventListener('mouseleave', function() {
        box.style.transform = 'scale(1)';
        box.style.boxShadow = 'none';
        const tooltip = box.querySelector('.stat-tooltip');
        if (tooltip) tooltip.remove();
      });
    });
  }, 100);
}
