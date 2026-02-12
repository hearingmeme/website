// ==================== GAME MANAGER ====================

document.addEventListener("DOMContentLoaded", () => {
  const gameOverlay = document.getElementById("gameOverlay");
  const startBtn = document.getElementById("startBtn");
  const gameBoard = document.getElementById("gameBoard");
  const rumorBubble = document.getElementById("rumorBubble");
  const gameContainer = document.querySelector(".game-container");
  const levelNameDisplay = document.getElementById("levelNameDisplay");

  const scoreEl = document.getElementById("score");
  const comboEl = document.getElementById("combo");
  const missesEl = document.getElementById("misses");
  const highScoreEl = document.getElementById("highScore");
  const currentLevelEl = document.getElementById("currentLevel");

  const gameOverScreen = document.getElementById("gameOverScreen");
  const finalScoreEl = document.getElementById("finalScore");
  const finalHighScoreEl = document.getElementById("finalHighScore");
  const finalComboEl = document.getElementById("finalCombo");
  const finalMissesEl = document.getElementById("finalMisses");
  const finalLevelEl = document.getElementById("finalLevel");

  const tryAgainBtn = document.getElementById("tryAgainBtn");
  const exitGameBtn = document.getElementById("exitGameBtn");
  const shareBtn = document.getElementById("shareXBtn");
  const closeGameBtn = document.getElementById("closeGameBtn");
  const gameTrigger = document.getElementById("gameTrigger");
  const muteBtn = document.getElementById("muteMusicBtn");

  const howToPlayBtn = document.getElementById("howToPlayBtn");
  const howToPlayModal = document.getElementById("howToPlayModal");
  const closeHowToPlay = document.getElementById("closeHowToPlay");

  let soundtrack = null;
  let isMuted = false;
  
  try {
    soundtrack = new Audio('audio/soundtrack.mp3');
    soundtrack.loop = true;
    soundtrack.volume = 0.4;
  } catch (e) {
  }

  let score = 0;
  let combo = 1;
  let streak = 0;
  let level = 1;
  let lives = 1; // Start with 1 life, others earned
  let highScore = StorageManager.getHighScore();
  let nextLevelScore = 800; // Increased from 600 for better early game duration
  let gameInterval = null;
  let activeEarsCount = 0;
  let powerUpActive = null;
  let isPaused = false;
  
  function setPaused(value) {
    isPaused = value;
    window.isPaused = value;
  }
  
  window.isPaused = isPaused; // Initial expose
  window.setPaused = setPaused; // Expose helper globally
  
  window.addLife = () => {
    lives++;
    updateUI();
  };
  
  let levelHits = 0;
  let levelMisses = 0;
  let permanentComboBonus = 0;
  let starsThisLevel = 1;
  let gameOverLevel = 1; // Store level at game over for display

  let maxStreak = 7; // 7 misses for levels 1-10 (was 5)
  const maxLevels = 45;
  const maxSimultaneousEars = 4;

  let pointMultiplier = 1;
  let magnetMode = false;
  let invincibleMode = false;

  // 🎯 SYSTÈME 2-TIERS POUR BONUS (V6)
  const regularBonuses = [
    '🐶', '🚀', '💎', '🤑', '🔥', '💀', '🕵️‍♂️', '🤡', '⚡', '💊', 
    '❄️', '🌙', '☄️', '🎯', '🎲', '🍀', '⭐', '🦻', '📺'
  ];
  
  const megaBonuses = [
    '🌪️', '🎰', '🧲', '🔮', '🎭', '🎪', '🦇'
  ];
  
  const minigameBonuses = [
    '🥤', '🧠', '🎈'
  ];
  
  const rareBonuses = [
    '🏴‍☠️', '🪙', '🎡', '🎲', '🃏'  // Treasure Chest + Coin Flip + Casino
  ];
  
  // Ancienne array pour compatibilité (pas utilisée maintenant)
  const bonusEmojis = [
    ...regularBonuses,
    ...megaBonuses,
    ...minigameBonuses,
    ...rareBonuses
  ];

  const gamePhrases = [
    "JUST HEARD A RUMOR", "THEY'RE TOAST", "NO NAMES", "HEARING THINGS", 
    "SAW IT ON BIZ", "RUMOR ALERT", "INCOMING FUD", "COPE DETECTED"
  ];

  const tauntPhrases = [
    "PAPER HANDS DETECTED", "WEAK BONK", "RUMORS OWN YOU", 
    "FOMO MISSED", "REKT SOON", "BAGHOLDER VIBES", "TOUCH GRASS"
  ];

  const levelNames = [
    "NO SIGNAL", "STATIC", "LOW VOLUME", "FIRST PING", "MISS HEARD", "AUDIO LAG",
    "ECHO", "RUMOR SEED", "SIGNAL DRIFT", "NOISE", "FALSE PATTERN", "DATA COPE",
    "LOOPED", "OVERHEARD", "HEARING CHECK", "MENTAL LAG", "FOCUS MODE", "PATTERNED",
    "BRAIN HEAT", "RUMOR CORE", "BONK REFLEX", "DEGEN MODE", "HYPER FOCUS",
    "SOUND COLLAPSE", "SIGNAL BREAK", "HEARING RUSH", "PERCEPTION", "RUMOR GOD",
    "CHAOS STATE", "TOTAL NOISE", "MATRIX", "ENLIGHTENED", "TRANSCENDED",
    "OMNISCIENT", "BEYOND", "QUANTUM", "SINGULARITY", "INFINITE", "COSMIC",
    "GODLIKE", "ETHEREAL", "LEGENDARY", "MYTHICAL", "DIVINE", "ULTIMATE"
  ];

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getSpawnInterval() {
    // Difficulté progressive plus douce
    if (level <= 5) {
      return Math.max(1800 - level * 80, 1200); // Débute plus lent
    }
    if (level <= 15) {
      return Math.max(1200 - level * 40, 600); // Progression medium
    }
    // Après niveau 15, ça devient vraiment intense
    let base = Math.max(800 - level * 20, 200);
    if (powerUpActive && powerUpActive.type === 'speed') {
      base = Math.max(300, base * 0.5);
    }
    return base;
  }

  function getEarUpTime() {
    // Temps d'affichage plus long au début
    if (level <= 5) {
      return Math.max(3000 - level * 80, 2200) + randomInt(0, 500);
    }
    if (level <= 15) {
      return Math.max(2200 - level * 60, 1200) + randomInt(0, 400);
    }
    // Après niveau 15, très rapide
    return Math.max(1200 - level * 30, 400) + randomInt(0, 300);
  }

  function getEarLifetime() {
    return getEarUpTime();
  }

  function getMaxEars() {
    if (level <= 3) return 1; // 1 seul au début
    if (level <= 8) return 2;
    if (level <= 15) return 3;
    if (level <= 25) return 4;
    return 5; // Max 5 à haut niveau
  }

  function getBonusChance() {
    // Augmenté pour plus de fun et variété
    const baseChance = 0.32; // De 0.28 à 0.32
    const levelBonus = level * 0.005; // De 0.004 à 0.005
    return Math.min(baseChance + levelBonus, 0.65); // Cap à 65%
  }

  function updateBackground() {
    const intensity = Math.min(level / maxLevels, 1);
    const red = Math.floor(10 + intensity * 100);
    const purple = Math.floor(intensity * 150);
    gameContainer.style.background = `linear-gradient(145deg, #050505, rgb(${red},0,${purple}))`;
  }

  function openGameOverlay() {
    gameOverlay.classList.add("active");
    startBtn.style.display = "none";
    showGameIntro();
  }

  function closeGameOverlay() {
    gameOverlay.classList.remove("active");
    
    if (gameOverScreen) gameOverScreen.style.display = "none";
    
    clearInterval(gameInterval);
    resetBoard();
    
    score = 0;
    combo = 1;
    streak = 0;
    level = 1;
    lives = 1; // Reset to 1 life
    permanentComboBonus = 0;
    starsThisLevel = 1;
    nextLevelScore = 800;
    updateUI();
    
    const bossElements = document.querySelectorAll('#boss-ear, #boss-hp-text, #boss-hp');
    bossElements.forEach(el => {
      if (el && el.parentNode) el.parentNode.removeChild(el);
    });
    if (typeof BossFights !== 'undefined') {
      BossFights.active = false;
    }
    
    if (soundtrack) {
      soundtrack.pause();
      soundtrack.currentTime = 0;
    }
  }

  function updateUI() {
    scoreEl.textContent = Math.round(score);
    comboEl.textContent = `x${(combo + permanentComboBonus).toFixed(1)}`;
    missesEl.textContent = `${streak}/${maxStreak}`;
    highScoreEl.textContent = formatNumber(highScore);
    if (currentLevelEl) currentLevelEl.textContent = ` ${level}`;
    
    const livesEl = document.getElementById('lives');
    if (livesEl) livesEl.textContent = lives;
    
    if (score < 0 && !isPaused) {
      endGame();
    }
  }

  function resetBoard() {
    document.querySelectorAll(".ear").forEach(e => {
      e.classList.remove("active", "cabal", "echo", "power-up");
      e.textContent = '👂';
    });
    document.querySelectorAll(".hole").forEach(h => h.classList.remove("popped"));
    clearInterval(gameInterval);
    activeEarsCount = 0;
    powerUpActive = null;
    gameContainer.style.background = 'linear-gradient(145deg, #050505 0%, #0f0f0f 100%)';
  }

  function triggerLSDPsycho() {
    gameOverlay.classList.add("lsd-psycho");
    vibrate([80, 40, 120, 40, 160]);
    setTimeout(() => gameOverlay.classList.remove("lsd-psycho"), 2200);
  }

  function triggerRugPull() {
    gameOverlay.classList.add("rug-pull");
    const loss = Math.round(score * 0.35);
    score = Math.max(0, score - loss);
    combo *= 2.5;
    rumorBubble.textContent = `RUG PULLED! -${loss} PTS but REVENGE x${combo.toFixed(1)}!`;
    rumorBubble.classList.add("show");
    setTimeout(() => rumorBubble.classList.remove("show"), 2200);
    updateUI();
  }

  function rainEmojis(type = 'money') {
    const emojis = type === 'money' ? ['💲','💰','🤑','💵'] :
                   type === 'rocket' ? ['🚀','🔥','💥','✨'] :
                   ['🎉','⭐','🌟','⚡','👑'];
    
    for (let i = 0; i < 50; i++) {
      const e = document.createElement('div');
      e.innerHTML = emojis[randomInt(0, emojis.length-1)];
      e.style.cssText = `
        position: fixed;
        left: ${randomInt(10, 90)}%;
        top: -10%;
        font-size: ${1.5 + Math.random()*3}rem;
        pointer-events: none;
        z-index: 10002;
        opacity: 0.9;
        animation: rainFall ${1.2 + Math.random()*1.5}s linear forwards;
      `;
      document.body.appendChild(e);
      setTimeout(() => e.remove(), 3000);
    }
  }

  function spiralConfetti() {
    const emojis = ['👂','💀','🚀','💲','✨','🔥','⚡','🐶','❄️'];
    for (let i = 0; i < 40; i++) {
      const e = document.createElement('div');
      e.innerHTML = emojis[randomInt(0, emojis.length-1)];
      e.style.cssText = `
        position: fixed;
        left: 50%;
        top: 50%;
        font-size: ${2 + Math.random()*3.5}rem;
        pointer-events: none;
        z-index: 10001;
        transform: translate(-50%, -50%);
        animation: spiralOut ${1.5 + Math.random()*1}s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
      `;
      e.style.setProperty('--angle', `${randomInt(-720, 720)}deg`);
      document.body.appendChild(e);
      setTimeout(() => e.remove(), 2500);
    }
  }

  function showLevelUp() {
    if (isPaused) return;
    setPaused(true);
    window.gamePaused = true; // CRITICAL: Prevent spawning during overlay
    clearInterval(gameInterval);
    
    if (typeof SoundSystem !== 'undefined') {
      SoundSystem.levelUp();
    }

    if (levelHits >= 35) starsThisLevel++;
    if (levelMisses === 0) starsThisLevel = Math.min(3, starsThisLevel + 1);
    if (starsThisLevel === 3) {
      permanentComboBonus += 0.15;
      score += 500;
      rainEmojis('special');
    }

    updateBackground();
    spiralConfetti();
    
    if (typeof ProgressiveEffects !== 'undefined') {
      ProgressiveEffects.init(level);
      ProgressiveEffects.screenShake(level);
    }
    
    const levelName = levelNames[Math.min(level - 1, maxLevels - 1)];
    if (levelNameDisplay) {
      levelNameDisplay.textContent = `🔥 ${levelName.toUpperCase()} 🔥`;
      levelNameDisplay.style.animation = 'none';
      setTimeout(() => {
        levelNameDisplay.style.animation = 'levelPulse 0.8s ease-out';
      }, 10);
    }
    
    const celebration = document.createElement('div');
    celebration.className = 'level-up-celebration';
    celebration.style.cssText = `
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      animation: fadeIn 0.3s;
      pointer-events: none;
    `;
    
    const content = document.createElement('div');
    content.className = 'level-up-content';
    content.innerHTML = `
      <h1 style="font-size: 80px; margin: 0; background: linear-gradient(135deg, #FFD700, #FFA500); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: 0 0 30px rgba(255, 215, 0, 0.8); animation: textGlow 1s ease-in-out infinite; font-family: 'Luckiest Guy', cursive;">LEVEL ${level}!</h1>
      <div style="font-size: 40px; color: #fff; margin-top: 20px; text-shadow: 0 0 20px #ff00ff; font-family: 'Luckiest Guy', cursive;">🔥 ${levelName} 🔥</div>
    `;
    
    content.style.cssText = `
      text-align: center;
      font-family: 'Luckiest Guy', cursive;
      animation: levelUpBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    `;
    
    celebration.appendChild(content);
    document.body.appendChild(celebration);
    
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.textContent = ['⭐', '🎉', '💫', '✨', '🔥'][Math.floor(Math.random() * 5)];
      particle.style.cssText = `
        position: fixed;
        font-size: ${20 + Math.random() * 30}px;
        left: ${Math.random() * 100}%;
        top: -50px;
        z-index: 10001;
        pointer-events: none;
        animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
      `;
      celebration.appendChild(particle);
    }
    
    setTimeout(() => {
      celebration.style.animation = 'fadeOut 0.5s';
      setTimeout(() => celebration.remove(), 500);
    }, 2000);
    
    rumorBubble.textContent = `LEVEL ${level} - ${levelName}`;
    rumorBubble.classList.add("show");

    if (typeof VisualEffects !== 'undefined') {
      VisualEffects.flashScreen('#00ff00', 200);
      VisualEffects.screenShake(6, 300);
    }
    
    setTimeout(() => {
      rumorBubble.classList.remove("show");
      if (level < 10) {
        nextLevelScore = Math.round(nextLevelScore * 1.3);
      } else {
        nextLevelScore = Math.round(nextLevelScore * 1.5);
      }
      levelHits = 0;
      levelMisses = 0;
      starsThisLevel = 1;
      setPaused(false);
      window.gamePaused = false; // CRITICAL: Resume game
      
      let hasMinigame = false;
      
      // LEVEL 2: HEARINKO - DÉSACTIVÉ (test seulement)
      /*
      if (level === 2) {
        hasMinigame = true;
        setTimeout(() => {
          const pachinkoNotif = document.createElement('div');
          pachinkoNotif.innerHTML = '🎈 HEARINKO TIME! 🎈';
          pachinkoNotif.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 50px;
            color: #ff00ff;
            font-family: 'Luckiest Guy', cursive;
            text-shadow: 0 0 30px #ff00ff, 0 0 60px #00ffff;
            z-index: 100000;
            animation: fadeIn 0.3s, fadeOut 0.5s 1.5s;
            pointer-events: none;
          `;
          document.body.appendChild(pachinkoNotif);
          
          setTimeout(() => {
            pachinkoNotif.remove();
            if (typeof MiniGames !== 'undefined' && MiniGames.showPachinko) {
              MiniGames.showPachinko({score, updateUI, addScore: (pts) => { score += pts; updateUI(); }});
            }
          }, 2000);
        }, 1000);
      }
      */
      
      // LEVEL 5: HEARING FLIP - DÉSACTIVÉ (test seulement)
      /*
      if (level === 5) {
        hasMinigame = true;
        setTimeout(() => {
          const coinFlipNotif = document.createElement('div');
          coinFlipNotif.innerHTML = '🪙 HEARING FLIP TIME! 🪙';
          coinFlipNotif.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 50px;
            color: #FFD700;
            font-family: 'Luckiest Guy', cursive;
            text-shadow: 0 0 30px #FFD700;
            z-index: 100000;
            animation: fadeIn 0.3s, fadeOut 0.5s 1s;
            pointer-events: none;
          `;
          document.body.appendChild(coinFlipNotif);
          
          setTimeout(() => {
            coinFlipNotif.remove();
            const holes = Array.from(document.querySelectorAll(".hole:not(.popped)"));
            if (holes.length > 0) {
              const hole = holes[Math.floor(Math.random() * holes.length)];
              const ear = hole.querySelector(".ear");
              if (ear) {
                ear.textContent = '🪙';
                ear.classList.add("active", "power-up");
                hole.classList.add("popped");
                activeEarsCount++;
                
                setTimeout(() => {
                  if (ear.classList.contains("active")) {
                    ear.classList.remove("active", "power-up");
                    ear.textContent = '👂';
                    hole.classList.remove("popped");
                    activeEarsCount = Math.max(0, activeEarsCount - 1);
                    startSpawning();
                  }
                }, 8000);
              }
            }
          }, 1500);
        }, 1000);
      }
      */
      
      // LEVEL 8: MEMORY GAME - DÉSACTIVÉ (test seulement)
      /*
      if (level === 8) {
        hasMinigame = true;
        if (typeof MiniGames !== 'undefined') {
          setTimeout(() => MiniGames.showMemoryGame({score, updateUI}), 1000);
        }
      }
      */
      
      // LEVEL 10: HEARING TRADER - DÉSACTIVÉ (test seulement)
      /*
      if (level === 10) {
        hasMinigame = true;
        if (typeof MiniGames !== 'undefined') {
          setTimeout(() => MiniGames.showMiniTrader({score, updateUI}), 1000);
        }
      }
      */
      
      // LEVEL 12: HEARING SLOTS - DÉSACTIVÉ (test seulement)
      /*
      if (level === 12) {
        hasMinigame = true;
        setTimeout(() => {
          const machineNotif = document.createElement('div');
          machineNotif.innerHTML = '🎰 HEARING SLOTS TIME! 🎰';
          machineNotif.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 50px;
            color: #FFD700;
            font-family: 'Luckiest Guy', cursive;
            text-shadow: 0 0 30px #FFD700, 0 0 60px #ff00ff;
            z-index: 100000;
            animation: fadeIn 0.3s, fadeOut 0.5s 1.5s;
            pointer-events: none;
          `;
          document.body.appendChild(machineNotif);
          
          setTimeout(() => {
            machineNotif.remove();
            if (typeof window.triggerHearingMachine === 'function') {
              window.triggerHearingMachine();
            }
          }, 2000);
        }, 1000);
      }
      */
      
      // LEVEL 21: BLACKJACK (SEUL mini-jeu auto activé)
      if (level === 21) {
        hasMinigame = true;
        if (typeof MiniGames !== 'undefined') {
          setTimeout(() => MiniGames.showBlackjack({score, updateUI}), 1000);
        }
      }
      
      // Award extra life at certain levels
      if (level === 3 || level === 15 || level === 25) {
        lives++;
        updateUI();
        const lifeNotif = document.createElement('div');
        lifeNotif.innerHTML = '❤️ +1 LIFE!';
        lifeNotif.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 60px;
          color: #ff0000;
          font-family: 'Luckiest Guy', cursive;
          text-shadow: 0 0 30px #ff0000, 0 0 60px #ff0000;
          z-index: 100000;
          animation: fadeIn 0.3s, fadeOut 0.5s 1.5s;
          pointer-events: none;
        `;
        document.body.appendChild(lifeNotif);
        setTimeout(() => lifeNotif.remove(), 2000);
      }
      
      if (!hasMinigame) {
        startSpawning();
      }

      if (typeof BossFights !== 'undefined') {
        BossFights.checkSpawn(level, {
          addScore: (points) => { 
            score += points; 
            updateUI(); 
          },
          spawnEar: spawnEar
        });
      }
    }, 2500);
  }

  function startGame() {
    startBtn.style.display = "none";
    gameOverScreen.style.display = "none";
    
    showGameIntro();
  }
  
  function showGameIntro() {
    const gameContainer = document.querySelector('.game-container');
    if (!gameContainer) {
      actuallyStartGame();
      return;
    }
    
    const introOverlay = document.createElement('div');
    introOverlay.id = 'gameIntroOverlay';
    introOverlay.style.cssText = `
      position: absolute;
      inset: 0;
      background: linear-gradient(145deg, #050505, #1a0030);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.5s;
      overflow: hidden;
    `;
    
    introOverlay.innerHTML = `
      <button id="closeIntroBtn" style="
        position: absolute;
        top: 20px;
        right: 20px;
        background: none;
        border: none;
        color: #fff;
        font-size: 40px;
        cursor: pointer;
        z-index: 10001;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      ">✕</button>
      
      <div style="position: absolute; inset: 0; z-index: 1; pointer-events: none;">
        <div style="position: absolute; left: 10%; top: 20%; font-size: clamp(20px, 3vw, 35px); opacity: 0.6; animation: floatParticle 3s ease-in-out infinite;">👂</div>
        <div style="position: absolute; left: 85%; top: 15%; font-size: clamp(20px, 3vw, 35px); opacity: 0.6; animation: floatParticle 3s ease-in-out infinite; animation-delay: 0.5s;">💎</div>
        <div style="position: absolute; left: 15%; top: 75%; font-size: clamp(20px, 3vw, 35px); opacity: 0.6; animation: floatParticle 3s ease-in-out infinite; animation-delay: 1s;">🔥</div>
        <div style="position: absolute; left: 80%; top: 70%; font-size: clamp(20px, 3vw, 35px); opacity: 0.6; animation: floatParticle 3s ease-in-out infinite; animation-delay: 1.5s;">⚡</div>
        <div style="position: absolute; left: 50%; top: 10%; font-size: clamp(20px, 3vw, 35px); opacity: 0.6; animation: floatParticle 3s ease-in-out infinite; animation-delay: 2s;">⭐</div>
        <div style="position: absolute; left: 50%; top: 85%; font-size: clamp(20px, 3vw, 35px); opacity: 0.6; animation: floatParticle 3s ease-in-out infinite; animation-delay: 2.5s;">💀</div>
      </div>
      
      <div style="
        text-align: center; 
        position: relative; 
        z-index: 2; 
        padding: 15px;
        max-width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      ">
        <h1 style="
          font-size: clamp(35px, 7vw, 70px);
          color: #FFD700;
          text-shadow: 0 0 20px #FFD700, 0 0 40px #FF6B00, 3px 3px 0 #000, 6px 6px 0 rgba(0,0,0,0.5);
          margin: 0 0 10px 0;
          letter-spacing: -2px;
          font-family: 'Luckiest Guy', cursive;
          animation: titleGlow 2s ease-in-out infinite;
          line-height: 0.85;
        ">WHACK<br>THE RUMORS</h1>
        
        <div style="
          font-size: clamp(18px, 3.5vw, 32px);
          color: #fff;
          text-shadow: 0 0 15px #00ffff, 2px 2px 0 #000;
          margin: 10px 0;
          font-family: 'Luckiest Guy', cursive;
        ">🔊 HEARING THINGS? 🔊</div>
        
        <div style="
          font-size: clamp(30px, 5vw, 50px);
          margin: 15px 0;
          display: flex;
          gap: clamp(8px, 1.5vw, 15px);
          justify-content: center;
          flex-wrap: wrap;
        ">
          <span style="animation: bounceEar 1s ease-in-out infinite;">👂</span>
          <span style="animation: bounceEar 1s ease-in-out infinite; animation-delay: 0.2s;">🦻</span>
          <span style="animation: bounceEar 1s ease-in-out infinite; animation-delay: 0.4s;">👂</span>
          <span style="animation: bounceEar 1s ease-in-out infinite; animation-delay: 0.6s;">🦻</span>
          <span style="animation: bounceEar 1s ease-in-out infinite; animation-delay: 0.8s;">👂</span>
        </div>
        
        <div style="
          font-size: clamp(16px, 3vw, 28px);
          color: #fc0;
          text-shadow: 2px 2px 0 #000;
          margin: 10px 0 15px 0;
          font-family: 'Luckiest Guy', cursive;
        ">TAP TO SILENCE THE NOISE!</div>
        
        <button id="introPlayBtn" style="
          font-size: clamp(20px, 3.5vw, 35px);
          padding: clamp(12px, 2vw, 20px) clamp(30px, 5vw, 50px);
          background: #00ff00;
          color: #000;
          border: none;
          border-radius: 15px;
          cursor: pointer;
          font-family: 'Luckiest Guy', cursive;
          margin-top: 10px;
          box-shadow: 0 8px 30px rgba(0, 255, 0, 0.6);
          transition: all 0.3s;
          animation: pulseButton 1.5s ease-in-out infinite;
        ">START PLAYING</button>
      </div>
    `;
    
    gameContainer.appendChild(introOverlay);
    const closeBtn = document.getElementById('closeIntroBtn');
    if (closeBtn) {
      closeBtn.onmouseenter = () => { closeBtn.style.transform = 'scale(1.2) rotate(90deg)'; };
      closeBtn.onmouseleave = () => { closeBtn.style.transform = 'scale(1) rotate(0)'; };
      closeBtn.addEventListener('click', () => {
        introOverlay.style.animation = 'fadeOut 0.3s';
        setTimeout(() => {
          introOverlay.remove();
          closeGameOverlay();
        }, 300);
      });
    }
    
    setTimeout(() => {
      const playBtn = document.getElementById('introPlayBtn');
      if (playBtn) {
        playBtn.onmouseenter = () => { playBtn.style.transform = 'scale(1.1)'; };
        playBtn.onmouseleave = () => { playBtn.style.transform = 'scale(1)'; };
        
        const launchGame = () => {
          introOverlay.style.animation = 'fadeOut 0.3s';
          introOverlay.style.pointerEvents = 'none';
          
          setTimeout(() => {
            introOverlay.remove();
            actuallyStartGame();
          }, 300);
        };
        
        playBtn.addEventListener('click', launchGame);
        
        introOverlay.addEventListener('click', (e) => {
          if (e.target !== playBtn && !playBtn.contains(e.target)) {
            launchGame();
          }
        });
      }
    }, 100);
  }
  
  function actuallyStartGame() {
    score = 0;
    combo = 1;
    streak = 0;
    level = 1;
    lives = 1; // Reset to 1 life
    nextLevelScore = 800;
    permanentComboBonus = 0;
    starsThisLevel = 1;
    levelHits = 0;
    levelMisses = 0;
    isPaused = false;
    powerUpActive = null;

    if (typeof ProgressiveEffects !== 'undefined') {
      ProgressiveEffects.init(1);
    }

    if (levelNameDisplay) {
      levelNameDisplay.textContent = `🔥 ${levelNames[0].toUpperCase()} 🔥`;
    }

    gameOverScreen.style.display = "none";
    resetBoard();
    updateUI();
    startSpawning();

    if (soundtrack && !isMuted) {
      soundtrack.play().catch(() => {});
    }

    const powerUpInterval = setInterval(() => {
      if (!isPaused && typeof PowerUps !== 'undefined' && Math.random() < 0.4) {
        PowerUps.spawn({
          spawnEar: spawnEar
        });
      }
    }, 12000);

    const eventsInterval = setInterval(() => {
      if (!isPaused && typeof RandomEvents !== 'undefined' && typeof BossFights !== 'undefined' && !BossFights.active) {
        RandomEvents.trigger({
          spawnEar: spawnEar,
          spawnInterval: getSpawnInterval(),
          earLifetime: getEarLifetime(),
          addScore: (points) => { 
            score += points; 
            updateUI(); 
          }
        });
      }
    }, 8000);

    window.gameIntervals = { powerUpInterval, eventsInterval };
  }

  function startSpawning() {
    if (gameInterval) clearInterval(gameInterval);
    
    // 🐛 FIX CRITIQUE: Forcer le redémarrage même si déjà en cours
    isPaused = false;
    window.gamePaused = false;
    
    function adjustInterval() {
      clearInterval(gameInterval);
      startSpawning();
    }
    window.adjustInterval = adjustInterval;
    window.startSpawning = startSpawning; // Expose globally for mini-games

    gameInterval = setInterval(spawnEar, getSpawnInterval());
    
    // 🐛 FIX: S'assurer qu'au moins une oreille spawne immédiatement
    setTimeout(() => {
      if (!isPaused && !window.gamePaused && activeEarsCount < getMaxEars()) {
        spawnEar();
      }
    }, 100);
  }

  function spawnEar() {
    if (isPaused || window.gamePaused) return;
    if (activeEarsCount >= getMaxEars()) return;

    const holes = Array.from(document.querySelectorAll(".hole"));
    const availableHoles = holes.filter(h => !h.querySelector(".ear").classList.contains("active"));
    
    if (availableHoles.length === 0) return;

    const hole = availableHoles[randomInt(0, availableHoles.length - 1)];
    const ear = hole.querySelector(".ear");
    
    let emoji = '👂';
    let isCabal = false;
    let isEcho = false;
    
    if (level >= 10 && Math.random() < 0.08) {
      isCabal = true;
      emoji = '🕵️‍♂️';
    } else if (level >= 15 && Math.random() < 0.10) {
      isEcho = true;
      emoji = '👻';
    } else if (level >= 2 && Math.random() < 0.03) {
      // Pachinko spawn chance after level 2
      emoji = '🎈';
    } else if (level >= 3 && level <= 8 && Math.random() < 0.05) {
      // Hearing Hustle spawn chance ONLY between level 3 and 8
      emoji = '🥤';
    } else if (level >= 5 && Math.random() < 0.04) {
      // Hearing Flip spawn chance after level 5
      emoji = '🪙';
    } else if (level >= 8 && Math.random() < 0.03) {
      // Memory game spawn chance after level 8
      emoji = '🧠';
    } else if (level >= 12 && Math.random() < 0.03) {
      // Hearing Slots spawn chance after level 12
      emoji = '🎰';
    } else if (level >= 10 && Math.random() < 0.025) {
      emoji = '🎡'; // Roulette
    } else if (level >= 8 && Math.random() < 0.025) {
      emoji = '🎲'; // Craps
    } else if (level >= 12 && Math.random() < 0.02) {
      emoji = '🃏'; // Poker
    } else if (Math.random() < getBonusChance()) {
      // 🎯 SYSTÈME 2-TIERS (V6) - Distribution intelligente
      const roll = Math.random();
      
      if (roll < 0.60) {
        // 60% : Regular bonus (🐶🚀💎 etc.)
        emoji = regularBonuses[randomInt(0, regularBonuses.length - 1)];
      } else if (roll < 0.90) {
        // 30% : MEGA bonus (🌪️🎰🧲🔮🎭🎪🦇)
        emoji = megaBonuses[randomInt(0, megaBonuses.length - 1)];
      } else if (roll < 0.98) {
        // 8% : Mini-game bonus (🥤🧠🎈)
        emoji = minigameBonuses[randomInt(0, minigameBonuses.length - 1)];
      } else {
        // 2% : Rare bonus (🏴‍☠️🪙)
        emoji = rareBonuses[randomInt(0, rareBonuses.length - 1)];
      }
    }
    
    ear.textContent = emoji;
    ear.classList.add("active");
    if (isCabal) ear.classList.add("cabal");
    if (isEcho) ear.classList.add("echo");
    
    const upTime = getEarUpTime();
    const spawnTime = Date.now();
    ear.dataset.spawnTime = spawnTime;
    ear.dataset.lifetime = upTime;
    
    activeEarsCount++;
    setTimeout(() => {
      // 🐛 FIX #1: Si l'ear a été nettoyé par un mini-jeu
      if (!ear.textContent || ear.textContent === '') {
        return;
      }
      
      // 🐛 FIX #2: Vérifier que c'est toujours le MÊME ear
      const currentSpawnTime = parseInt(ear.dataset.spawnTime);
      if (currentSpawnTime !== spawnTime) {
        return;
      }
      
      // 🐛 FIX #3: Vérifier classList.contains('active')
      if (!ear.classList.contains("active") || ear.classList.contains("power-up")) {
        return;
      }
      
      const symbol = ear.textContent;
      const isRegularEar = symbol === '👂';
      
      // 🐛 FIX #4: DERNIÈRE vérification textContent
      if (!ear.textContent || ear.textContent === '') {
        return;
      }
      
      // MAINTENANT on peut modifier l'ear
      ear.classList.remove("active", "cabal", "echo");
      activeEarsCount--;
      
      // 🐛 FIX #5: RE-vérifier gamePaused ET textContent JUSTE AVANT de compter miss
      // + vérifier qu'AUCUN mini-jeu n'est actif
      const wasGamePaused = window.gamePaused || isPaused;
      
      // Check si un overlay de mini-jeu existe
      const anyMiniGameActive = 
        document.getElementById('pachinkoOverlay') || 
        document.getElementById('mysteryBoxOverlay') ||
        document.getElementById('blackjackOverlay') ||
        document.getElementById('bonneteauOverlay') ||
        document.getElementById('memoryOverlay') ||
        document.getElementById('hearingChestOverlay') ||  // FIX: bon nom !
        document.getElementById('traderOverlay') ||
        document.getElementById('grandpaOverlay') ||
        document.getElementById('fortuneTellerOverlay') ||
        document.getElementById('coinFlipOverlay');
      
      if (!ear.textContent || ear.textContent === '') {
        return; // Mini-jeu a démarré pendant l'exécution
      }
      
      // Compter le miss seulement si pas en pause ET aucun mini-jeu actif
      if (isRegularEar && !wasGamePaused && !anyMiniGameActive && !invincibleMode && !(powerUpActive && powerUpActive.type === 'invincible' && Date.now() < powerUpActive.endTime)) {
        streak++;
        combo = 1;
        levelMisses++;
          
        if (level > 5 && Math.random() < 0.15) {
          const taunt = tauntPhrases[randomInt(0, tauntPhrases.length - 1)];
          rumorBubble.textContent = taunt;
          rumorBubble.classList.add("show");
          setTimeout(() => rumorBubble.classList.remove("show"), 1200);
        }
        
        if (streak >= maxStreak) {
          endGame();
        }
      }
      
      updateUI();
    }, upTime);
  }

  function updateComboVisuals() {
    const ears = document.querySelectorAll('.ear.active');
    ears.forEach(ear => {
      ear.classList.remove('combo-yellow', 'combo-orange', 'combo-red', 'combo-purple', 'combo-rainbow');
      
      if (combo >= 51) {
        ear.classList.add('combo-rainbow');
        ear.style.filter = 'drop-shadow(0 0 20px #ff00ff) drop-shadow(0 0 20px #00ffff) drop-shadow(0 0 20px #ffff00)';
        ear.style.animation = 'rainbowPulse 0.5s infinite, earFloat 1s ease-in-out infinite';
      } else if (combo >= 31) {
        ear.classList.add('combo-purple');
        ear.style.filter = 'drop-shadow(0 0 15px #ff00ff) drop-shadow(0 0 10px #8b00ff)';
        ear.style.animation = 'purplePulse 0.8s infinite';
      } else if (combo >= 21) {
        ear.classList.add('combo-red');
        ear.style.filter = 'drop-shadow(0 0 12px #ff0000) drop-shadow(0 0 8px #ff4500)';
        ear.style.animation = 'firePulse 0.6s infinite';
      } else if (combo >= 11) {
        ear.classList.add('combo-orange');
        ear.style.filter = 'drop-shadow(0 0 10px #ff6600) drop-shadow(0 0 6px #ffa500)';
      } else if (combo >= 6) {
        ear.classList.add('combo-yellow');
        ear.style.filter = 'drop-shadow(0 0 8px #FFD700) drop-shadow(0 0 4px #ffea00)';
      } else {
        ear.style.filter = '';
        ear.style.animation = '';
      }
    });
    
    if (combo >= 51) {
      document.body.style.animation = 'rainbowFlash 0.5s';
      setTimeout(() => document.body.style.animation = '', 500);
    } else if (combo >= 31) {
      if (typeof VisualEffects !== 'undefined') {
        VisualEffects.screenShake(3, 100);
      }
    }
  }

  function hitEar(ear) {
    if (!ear || isPaused) return;
    if (!ear.classList.contains("active")) return;
    
    // 🔥 MOBILE: Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10); // 10ms subtle vibration
    }

    const isPowerUp = ear.classList.contains('power-up');
    const powerUpType = ear.dataset.powerup;
    
    if (isPowerUp && powerUpType && typeof PowerUps !== 'undefined') {
      PowerUps.activate(powerUpType, {
        pointMultiplier: pointMultiplier,
        earLifetime: getEarLifetime(),
        spawnInterval: getSpawnInterval(),
        magnetMode: magnetMode,
        invincible: invincibleMode,
        spawnEar: spawnEar,
        addScore: (points) => { 
          score += points; 
          updateUI(); 
        }
      });
      
      ear.classList.remove('active', 'power-up');
      ear.textContent = '👂';
      delete ear.dataset.powerup;
      activeEarsCount--;
      return;
    }

    ear.classList.remove("active", "cabal", "echo");
    const hole = ear.parentElement;
    hole.classList.add("popped");
    
    const isOnFire = ear.dataset.firebonus === 'true';
    const fireMultiplier = isOnFire ? 3 : 1;
    
    if (isOnFire) {
      const bigFire = document.createElement('div');
      bigFire.textContent = '🔥💥';
      bigFire.style.cssText = `
        position: fixed;
        left: ${ear.getBoundingClientRect().left}px;
        top: ${ear.getBoundingClientRect().top}px;
        font-size: 50px;
        z-index: 10000;
        pointer-events: none;
        animation: fadeOut 0.5s;
      `;
      document.body.appendChild(bigFire);
      setTimeout(() => bigFire.remove(), 500);
      
      delete ear.dataset.firebonus;
      ear.classList.remove('burning');
    }
    
    if (typeof SoundSystem !== 'undefined') {
      SoundSystem.hit(Math.floor(Math.random() * 5));
    }
    
    const rect = ear.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const particles = ['✨', '💫', '⭐', '🌟', '💥'];
    const count = 8;
    
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.textContent = particles[Math.floor(Math.random() * particles.length)];
      
      const angle = (i / count) * Math.PI * 2;
      const distance = 50 + Math.random() * 30;
      const tx = Math.cos(angle) * distance;
      const ty = Math.sin(angle) * distance;
      
      particle.style.cssText = `
        left: ${x}px;
        top: ${y}px;
        --tx: ${tx}px;
        --ty: ${ty}px;
      `;
      
      document.body.appendChild(particle);
      setTimeout(() => particle.remove(), 800);
    }
    
    setTimeout(() => hole.classList.remove("popped"), 300);
    
    activeEarsCount--;
    const symbol = ear.textContent;
    
    let scoreMultiplier = pointMultiplier;
    if (powerUpActive && powerUpActive.type === 'speed') {
      scoreMultiplier *= 1.5;
    }

    if (symbol !== '👂') {
      handleBonus(symbol, ear);
    } else {
      let perfectBonus = 1;
      if (ear.dataset.spawnTime && ear.dataset.lifetime) {
        const now = Date.now();
        const spawnTime = parseInt(ear.dataset.spawnTime);
        const lifetime = parseInt(ear.dataset.lifetime);
        const elapsed = now - spawnTime;
        const sweetSpotStart = lifetime * 0.35;
        const sweetSpotEnd = lifetime * 0.65;
        
        if (elapsed >= sweetSpotStart && elapsed <= sweetSpotEnd) {
          perfectBonus = 1.5;
          
          const perfect = document.createElement('div');
          perfect.textContent = 'PERFECT!';
          
          if (typeof SoundSystem !== 'undefined') {
            SoundSystem.perfect();
          }
          perfect.style.cssText = `
            position: fixed;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 50px;
            color: #FFD700;
            font-weight: bold;
            z-index: 9999;
            text-shadow: 0 0 20px #FFD700, 3px 3px 6px #000;
            animation: perfectPop 0.6s ease-out;
            pointer-events: none;
            font-family: 'Luckiest Guy', cursive;
          `;
          document.body.appendChild(perfect);
          setTimeout(() => perfect.remove(), 600);
        }
      }
      
      const basePoints = 25;
      const earnedPoints = Math.round(basePoints * (combo + permanentComboBonus) * scoreMultiplier * perfectBonus * fireMultiplier);
      score += earnedPoints;
      
      if (isOnFire) {
        const fireText = document.createElement('div');
        fireText.textContent = `🔥 3X FIRE! +${earnedPoints} 🔥`;
        fireText.style.cssText = `
          position: fixed;
          top: 35%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 40px;
          color: #ff4500;
          font-weight: bold;
          z-index: 10000;
          text-shadow: 0 0 20px #ff0000;
          font-family: 'Luckiest Guy', cursive;
          pointer-events: none;
          animation: fadeOut 1s;
        `;
        document.body.appendChild(fireText);
        setTimeout(() => fireText.remove(), 1000);
      }
      
      combo += 0.5;
      levelHits++;
      
      // 💎 Track achievements with MetaGameSystem
      if (typeof MetaGameSystem !== 'undefined') {
        // Track combo achievement
        MetaGameSystem.checkAchievement('combo_master', Math.floor(combo));
        
        // Tutorial: Mark ear as clicked
        if (symbol === '👂') {
          window.tutorialEarClicked = true;
        }
        // Tutorial: Mark cabal as seen
        if (ear.classList.contains('cabal')) {
          window.tutorialCabalSeen = true;
        }
      }
      
      updateComboVisuals();

      if (typeof VisualEffects !== 'undefined') {
        VisualEffects.hitFeedback(ear, earnedPoints);
        VisualEffects.updateComboVisual(combo);
      }

      if (combo >= 5 && combo < 6) {
        score += 100;
        if (typeof SoundSystem !== 'undefined') SoundSystem.combo(1);
        if (typeof VisualEffects !== 'undefined') {
          VisualEffects.flashScreen('#00ff00', 100);
          VisualEffects.screenShake(3, 150);
          VisualEffects.comboPopup('NICE! 🔥', window.innerWidth/2, 300, 50);
        }
        rumorBubble.textContent = "COMBO x5! NICE 🔥";
        rumorBubble.classList.add("show");
        setTimeout(() => rumorBubble.classList.remove("show"), 1500);
      } else if (combo >= 10 && combo < 11) {
        score += 300;
        if (typeof SoundSystem !== 'undefined') SoundSystem.combo(2);
        if (typeof VisualEffects !== 'undefined') {
          VisualEffects.flashScreen('#ffff00', 100);
          VisualEffects.screenShake(5, 200);
          VisualEffects.comboPopup('INSANE! 🎆', window.innerWidth/2, 300, 55);
        }
        rumorBubble.textContent = "COMBO x10! INSANE 🎆";
        rumorBubble.classList.add("show");
        setTimeout(() => rumorBubble.classList.remove("show"), 1500);
      } else if (combo >= 15 && combo < 16) {
        score += 1000;
        if (typeof SoundSystem !== 'undefined') SoundSystem.combo(3);
        if (typeof VisualEffects !== 'undefined') {
          VisualEffects.flashScreen('#ff6600', 150);
          VisualEffects.screenShake(8, 250);
          VisualEffects.comboPopup('GODLIKE! 💎', window.innerWidth/2, 300, 60);
        }
        powerUpActive = {type: 'invincible', endTime: Date.now() + 5000};
        rumorBubble.textContent = "COMBO x15+! GOD MODE 🤑";
        rumorBubble.classList.add("show");
        setTimeout(() => rumorBubble.classList.remove("show"), 1500);
      } else if (combo >= 20 && combo < 21) {
        score += 2000;
        if (typeof SoundSystem !== 'undefined') SoundSystem.combo(4);
        if (typeof VisualEffects !== 'undefined') {
          VisualEffects.flashScreen('#ff00ff', 200);
          VisualEffects.invertScreen(2000);
          VisualEffects.screenShake(10, 300);
          VisualEffects.comboPopup('LEGENDARY! 👑', window.innerWidth/2, 300, 70);
        }
      } else if (combo >= 30 && combo < 31) {
        score += 5000;
        if (typeof SoundSystem !== 'undefined') SoundSystem.combo(5);
        if (typeof VisualEffects !== 'undefined') {
          VisualEffects.flashScreen('#00ffff', 250);
          VisualEffects.glitchEffect(3000);
          VisualEffects.screenShake(15, 400);
          VisualEffects.comboPopup('🔥 UNSTOPPABLE! 🔥', window.innerWidth/2, 300, 80);
        }
      }

      if (levelHits >= 10 && levelHits % 10 === 0) {
        permanentComboBonus += 0.1;
        rumorBubble.textContent = "HOT STREAK! +0.1 COMBO!";
        rumorBubble.classList.add("show");
        setTimeout(() => rumorBubble.classList.remove("show"), 1500);
      }

      vibrate(35);
    }

    if (powerUpActive && Date.now() > powerUpActive.endTime) {
      powerUpActive = null;
      if (window.adjustInterval) window.adjustInterval();
    }

    if (score > highScore) {
      highScore = Math.round(score);
      StorageManager.setHighScore(highScore);
    }

    updateUI();

    if (typeof MiniGames !== 'undefined') {
      MiniGames.trySpawnMysteryBox({score, updateUI, streak, combo});
    }

    if (score >= nextLevelScore && level < maxLevels) {
      level++;
      showLevelUp();
    }
  }

  let lastBonusSymbol = null;
  let lastBonusTime = 0;
  let recentBonuses = [];
  
  function checkBonusCombo(symbol) {
    const now = Date.now();
    const timeDiff = now - lastBonusTime;
    
    if (timeDiff < 5000 && lastBonusSymbol && lastBonusSymbol !== symbol) {
      const combo = [lastBonusSymbol, symbol].sort().join('+');
      
      const combos = {
        '🌈+🔮': 'RAINBOW FUTURE',
        '💎+❄️': 'FROZEN DIAMOND', 
        '🔥+🚀': 'FIRE ROCKET',
        '👻+🤡': 'SPOOKY CLOWN',
        '⚡+💣': 'SPEED BOMBS'
      };
      
      if (combos[combo]) {
        const notif = document.createElement('div');
        notif.textContent = `⭐ BONUS COMBO: ${combos[combo]}! ⭐`;
        notif.style.cssText = `
      position: fixed;
      top: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(45deg, #000, #1a0033, #000);
      border: 4px solid #ff00ff;
      padding: 20px 40px;
      font-size: 30px;
      font-family: 'Luckiest Guy', cursive;
      color: #fff;
      text-shadow: -2px 0 #ff00ff, 2px 0 #00ffff;
      z-index: 10001;
      border-radius: 10px;
      box-shadow: 0 0 30px rgba(255, 0, 255, 0.6);
    `;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 2000);
        
        score += 1000; // Combo bonus
        updateUI();
      }
    }
    
    lastBonusSymbol = symbol;
    lastBonusTime = now;
  }

  function handleBonus(symbol, ear) {
    checkBonusCombo(symbol);
    
    if (typeof SoundSystem !== 'undefined') {
      SoundSystem.bonus();
    }
    
    const bonusActions = {
      '🐶': () => {
        score += 50 * combo;
        rumorBubble.textContent = "🐶 HEARING HOUNDS! CATCH THE DOGS! 🐶";
        
        if (typeof SoundSystem !== 'undefined') {
          SoundSystem.bark();
        }
        
        const duration = 5000;
        const ears = document.querySelectorAll('.ear.active');
        const originalEmojis = [];
        
        ears.forEach(ear => {
          originalEmojis.push(ear.textContent);
          ear.textContent = '🐶';
          ear.style.filter = 'drop-shadow(0 0 15px #FFD700) brightness(1.3)';
          ear.style.animation = 'dogBounce 0.5s ease-in-out infinite';
        });
        
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
          gameContainer.style.filter = 'sepia(0.4) saturate(1.8) hue-rotate(10deg)';
          gameContainer.style.background = 'linear-gradient(145deg, #2a1810, #3d2415)';
        }
        
        const instruction = document.createElement('div');
        instruction.innerHTML = `
          <div style="font-size: 40px;">🐶 CATCH DOGS FOR TREATS! 🦴</div>
          <div style="font-size: 25px; color: #FFD700;">50-200 POINTS EACH!</div>
        `;
        instruction.style.cssText = `
          position: fixed;
          top: 80px;
          left: 50%;
          transform: translateX(-50%);
          color: #fff;
          font-weight: bold;
          z-index: 10000;
          text-align: center;
          text-shadow: 0 0 20px #FFD700;
          font-family: 'Luckiest Guy', cursive;
          pointer-events: none;
        `;
        document.body.appendChild(instruction);
        setTimeout(() => instruction.remove(), 3000);
        
        let caughtDogs = 0;
        const totalDogs = 10;
        
        const counter = document.createElement('div');
        counter.textContent = `🐶 0/${totalDogs}`;
        counter.style.cssText = `
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 35px;
          color: #FFD700;
          font-weight: bold;
          z-index: 10001;
          text-shadow: 0 0 15px #FFD700;
          font-family: 'Luckiest Guy', cursive;
          pointer-events: none;
        `;
        document.body.appendChild(counter);
        
        const bonuses = [50, 75, 100, 150, 200];
        
        for (let i = 0; i < totalDogs; i++) {
          setTimeout(() => {
            const dog = document.createElement('div');
            dog.textContent = '🐶';
            const bonus = bonuses[Math.floor(Math.random() * bonuses.length)];
            
            dog.style.cssText = `
              position: fixed;
              left: ${Math.random() * 90 + 5}%;
              top: ${Math.random() * 80 + 10}%;
              font-size: 45px;
              z-index: 9999;
              cursor: pointer;
              animation: dogBounce 0.5s ease-in-out infinite;
              filter: drop-shadow(0 0 10px #FFD700);
              transition: transform 0.2s;
            `;
            
            dog.onmouseenter = () => { dog.style.transform = 'scale(1.4)'; };
            dog.onmouseleave = () => { dog.style.transform = 'scale(1)'; };
            
            let clicked = false;
            dog.addEventListener('click', () => {
              if (!clicked) {
                clicked = true;
                caughtDogs++;
                score += bonus;
                updateUI();
                
                if (typeof SoundSystem !== 'undefined') {
                  SoundSystem.bark();
                }
                
                counter.textContent = `🐶 ${caughtDogs}/${totalDogs}`;
                counter.style.animation = 'none';
                setTimeout(() => { counter.style.animation = 'pulse 0.3s'; }, 10);
                
                const plus = document.createElement('div');
                plus.textContent = `+${bonus} 🦴`;
                plus.style.cssText = `
                  position: fixed;
                  left: ${dog.style.left};
                  top: ${dog.style.top};
                  font-size: 28px;
                  color: #FFD700;
                  font-weight: bold;
                  z-index: 10002;
                  pointer-events: none;
                  animation: floatUp 1s ease-out;
                  font-family: 'Luckiest Guy', cursive;
                `;
                document.body.appendChild(plus);
                setTimeout(() => plus.remove(), 1000);
                
                for (let j = 0; j < 4; j++) {
                  const particle = document.createElement('div');
                  particle.textContent = ['🦴', '💛', '✨', '⭐'][j];
                  particle.style.cssText = `
                    position: fixed;
                    left: ${dog.style.left};
                    top: ${dog.style.top};
                    font-size: 20px;
                    z-index: 10000;
                    pointer-events: none;
                    animation: explode${j} 0.6s ease-out;
                  `;
                  document.body.appendChild(particle);
                  setTimeout(() => particle.remove(), 600);
                }
                
                dog.remove();
                
                if (caughtDogs === totalDogs) {
                  const perfectMsg = document.createElement('div');
                  perfectMsg.innerHTML = `
                    <div style="font-size: 50px;">🎉 GOOD BOY! 🎉</div>
                    <div style="font-size: 35px;">ALL DOGS CAUGHT!</div>
                  `;
                  perfectMsg.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: #FFD700;
                    font-weight: bold;
                    z-index: 10003;
                    text-align: center;
                    text-shadow: 0 0 30px #FFD700;
                    font-family: 'Luckiest Guy', cursive;
                    pointer-events: none;
                    animation: fadeOut 2s;
                  `;
                  document.body.appendChild(perfectMsg);
                  setTimeout(() => perfectMsg.remove(), 2000);
                }
              }
            });
            
            document.body.appendChild(dog);
            
            if (i % 3 === 0 && typeof SoundSystem !== 'undefined') {
              setTimeout(() => SoundSystem.bark(), Math.random() * 500);
            }
            
            setTimeout(() => { 
              if (dog.parentNode && !clicked) {
                dog.style.animation = 'flyAway 0.5s ease-in forwards';
                setTimeout(() => dog.remove(), 500);
              }
            }, 4000);
          }, i * 300);
        }
        
        setTimeout(() => {
          ears.forEach((ear, i) => {
            if (ear.classList.contains('active')) {
              ear.textContent = originalEmojis[i] || '👂';
              ear.style.filter = '';
              ear.style.animation = '';
            }
          });
          if (gameContainer) {
            gameContainer.style.filter = '';
            gameContainer.style.background = '';
          }
          counter.remove();
        }, duration);
      },
      '🚀': () => {
        score += 200 * combo;
        rumorBubble.textContent = "TO THE MOON! 🚀🌙";
        
        if (typeof SoundSystem !== 'undefined') {
          SoundSystem.rocket();
        }
        rainEmojis('rocket');
        vibrate([100, 50, 150, 50, 200]);
        
        const ears = document.querySelectorAll('.ear.active');
        ears.forEach(ear => {
          const hole = ear.parentElement;
          hole.style.transition = 'transform 2s ease-out';
          hole.style.transform = 'translateY(-500px) rotate(360deg)';
          
          ear.style.filter = 'drop-shadow(0 10px 20px #ff4500) drop-shadow(0 20px 30px #ff6600)';
          
          setTimeout(() => {
            hole.style.transition = '';
            hole.style.transform = '';
            ear.style.filter = '';
          }, 2000);
        });
      },
      '💎': () => {
        score += 100 * combo;
        permanentComboBonus += 0.2;
        rumorBubble.textContent = "DIAMOND HANDS! +100 💎";
        
        if (typeof SoundSystem !== 'undefined') {
          SoundSystem.diamond();
        }
      },
      '📺': () => {
        score += 150;
        rumorBubble.textContent = "📺 HEARING ZAPPER! ZAP ZAP! 📺";
        
        const duration = 5000;
        const gameContainer = document.querySelector('.game-container');
        
        if (gameContainer) {
          let switchCount = 0;
          const channels = [
            'saturate(0) brightness(1.5)', // B&W
            'hue-rotate(180deg) saturate(2)', // Inverted
            'sepia(1) hue-rotate(50deg)', // Old TV
            'contrast(2) brightness(1.3)', // High contrast
          ];
          
          const channelInterval = setInterval(() => {
            gameContainer.style.filter = channels[switchCount % channels.length];
            gameContainer.style.animation = 'glitch 0.1s infinite';
            switchCount++;
            
            if (Math.random() < 0.3) {
              gameContainer.style.opacity = 0.8 + Math.random() * 0.2;
            }
          }, 150);
          
          const ears = document.querySelectorAll('.ear.active');
          const emojiChannels = ['👀', '👁️', '📡', '📻', '🎙️', '📞', '🔊'];
          
          ears.forEach(ear => {
            let channelIndex = 0;
            const earInterval = setInterval(() => {
              ear.textContent = emojiChannels[channelIndex % emojiChannels.length];
              channelIndex++;
            }, 200);
            
            setTimeout(() => {
              clearInterval(earInterval);
              ear.textContent = '👂';
            }, duration);
          });
          
          setTimeout(() => {
            clearInterval(channelInterval);
            gameContainer.style.filter = '';
            gameContainer.style.animation = '';
            gameContainer.style.opacity = '1';
          }, duration);
        }
      },
      '🤑': () => {
        score += 250;
        rumorBubble.textContent = "MONEY PRINTER GO BRRRRR! 🤑💵";
        rainEmojis('money');
        
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
          gameContainer.style.background = 'linear-gradient(145deg, #001a00, #003300)';
        }
        
        for (let i = 0; i < 15; i++) {
          setTimeout(() => {
            const money = document.createElement('div');
            money.textContent = ['💵', '💰', '💸'][Math.floor(Math.random() * 3)];
            money.style.cssText = `
              position: fixed;
              left: ${Math.random() * 100}%;
              top: -50px;
              font-size: 40px;
              z-index: 9999;
              cursor: pointer;
              animation: moneyFall ${3 + Math.random() * 2}s linear forwards;
            `;
            
            money.addEventListener('click', () => {
              score += 50;
              updateUI();
              if (typeof SoundSystem !== 'undefined') {
                SoundSystem.coin();
              }
              money.style.animation = 'collectMoney 0.3s';
              setTimeout(() => money.remove(), 300);
            });
            
            document.body.appendChild(money);
            setTimeout(() => money.remove(), 5000);
          }, i * 200);
        }
        
        setTimeout(() => {
          if (gameContainer) {
            gameContainer.style.background = '';
          }
        }, 5000);
      },
      '🔥': () => {
        rumorBubble.textContent = "🔥 HEARING INFERNO! BURNING EARS = 3X POINTS! 🔥";
        
        if (typeof SoundSystem !== 'undefined') {
          SoundSystem.fire();
        }
        
        const instruction = document.createElement('div');
        instruction.textContent = '🔥 CLICK BURNING EARS FOR 3X POINTS! 🔥';
        instruction.style.cssText = `
          position: fixed;
          top: 20%;
          left: 50%;
          transform: translateX(-50%);
          font-size: 35px;
          color: #ff4500;
          font-family: 'Luckiest Guy', cursive;
          z-index: 10000;
          text-shadow: 0 0 20px #000;
          animation: pulse 1s infinite;
          pointer-events: none;
        `;
        document.body.appendChild(instruction);
        setTimeout(() => instruction.remove(), 3000);
        
        const duration = 8000;
        const activeEars = Array.from(document.querySelectorAll('.ear.active'));
        
        if (activeEars.length === 0) {
          combo += 2;
          return;
        }
        
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
          gameContainer.style.background = 'linear-gradient(145deg, #3d0000, #1a0000)';
        }
        
        const burningEars = new Set();
        const startEar = activeEars[Math.floor(Math.random() * activeEars.length)];
        
        const setOnFire = (ear) => {
          if (!ear || burningEars.has(ear)) return;
          ear.classList.add('burning');
          ear.style.filter = 'brightness(2) drop-shadow(0 0 20px #ff0000)';
          ear.dataset.firebonus = 'true';
          burningEars.add(ear);
        };
        
        setOnFire(startEar);
        
        const spreadInterval = setInterval(() => {
          Array.from(burningEars).forEach(burningEar => {
            activeEars.forEach(otherEar => {
              if (burningEars.has(otherEar)) return;
              const distance = Math.hypot(
                burningEar.getBoundingClientRect().left - otherEar.getBoundingClientRect().left,
                burningEar.getBoundingClientRect().top - otherEar.getBoundingClientRect().top
              );
              if (distance < 200 && Math.random() < 0.6) setOnFire(otherEar);
            });
          });
        }, 800);
        
        setTimeout(() => {
          clearInterval(spreadInterval);
          burningEars.forEach(ear => {
            ear.classList.remove('burning');
            ear.style.filter = '';
            delete ear.dataset.firebonus;
          });
          if (gameContainer) gameContainer.style.background = '';
        }, duration);
      },
      '💀': () => {
        rumorBubble.textContent = "💀 HEARING REAPER! DEATH OR GLORY! 💀⚔️";
        vibrate([200, 100, 200, 100, 200]);
        
        if (typeof MegaBonusEffects !== 'undefined') {
          MegaBonusEffects.skullLastChance({
            endGame: actuallyEndGame, 
            score, 
            streak,
            powerUpActive,
            updateUI,
            setScore: (val) => { score = val; updateUI(); },
            setStreak: (val) => { streak = val; }
          });
        } else {
          score -= 500;
          updateUI();
        }
      },
      '🕵️‍♂️': () => {
        level = Math.min(level + 2, maxLevels);
        score += 400 * level;
        nextLevelScore = Math.round(nextLevelScore * 2.0);
        triggerLSDPsycho();
        spiralConfetti();
        rumorBubble.textContent = "🕵️‍♂️ HEARING DETECTIVE! THE TRUTH IS OUT THERE! 🕵️‍♂️👁️";
        
        if (typeof SoundSystem !== 'undefined') {
          SoundSystem.powerUp();
        }
        
        const ears = document.querySelectorAll('.ear.active');
        const originalEmojis = [];
        
        ears.forEach(ear => {
          originalEmojis.push(ear.textContent);
          ear.textContent = '👁️';
          ear.style.animation = 'eyeFollow 2s ease-in-out infinite';
        });
        
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
          gameContainer.style.filter = 'hue-rotate(120deg) contrast(1.2)';
          gameContainer.style.background = 'linear-gradient(180deg, #000 0%, #001a00 100%)';
          
          const matrix = document.createElement('div');
          matrix.style.cssText = `
            position: fixed;
            inset: 0;
            background: repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 255, 0, 0.05) 2px,
              rgba(0, 255, 0, 0.05) 4px
            );
            pointer-events: none;
            z-index: 1;
            animation: matrixScroll 0.5s linear infinite;
          `;
          gameContainer.appendChild(matrix);
          
          for (let i = 0; i < 10; i++) {
            const column = document.createElement('div');
            column.textContent = '01010101';
            column.style.cssText = `
              position: fixed;
              left: ${i * 10}%;
              top: -100%;
              color: #0f0;
              font-family: monospace;
              font-size: 14px;
              opacity: 0.3;
              pointer-events: none;
              z-index: 2;
              animation: matrixFall ${2 + Math.random() * 2}s linear infinite;
              animation-delay: ${Math.random() * 2}s;
            `;
            gameContainer.appendChild(column);
            setTimeout(() => column.remove(), 4000);
          }
          
          setTimeout(() => {
            matrix.remove();
            gameContainer.style.filter = '';
            gameContainer.style.background = '';
            ears.forEach((ear, i) => {
              if (ear.classList.contains('active')) {
                ear.textContent = originalEmojis[i] || '👂';
        if (typeof SoundSystem !== 'undefined') {
          SoundSystem.clownHonk();
        }

                ear.style.animation = '';
              }
            });
          }, 4000);
        }
        
        showLevelUp();
        vibrate([200, 100, 300]);
      },
      '🤡': () => {
        rumorBubble.textContent = "🤡 HEARING CLOWN! YOU GOT PRANKED! 🤡";
        
        if (typeof SoundSystem !== 'undefined') {
          SoundSystem.clownHonk();
        }
        
        const penalties = [
          {
            name: 'SCORE DIVIDED BY 2!',
            action: () => {
              score = Math.floor(score / 2);
              updateUI();
            }
          },
          {
            name: 'COMBO RESET TO 1!',
            action: () => {
              combo = 1;
              permanentComboBonus = 0;
              updateUI();
            }
          },
          {
            name: 'LEVEL DOWN!',
            action: () => {
              if (level > 1) level--;
              updateUI();
            }
          },
          {
            name: 'ALL POINTS TO CLOWN!',
            action: () => {
              const stolen = score;
              score = 0;
              updateUI();
              
              const clownThief = document.createElement('div');
              clownThief.innerHTML = `🤡<br>+${stolen}`;
              clownThief.style.cssText = `
                position: fixed;
                bottom: 50%;
                left: 50%;
                transform: translateX(-50%);
                font-size: 60px;
                z-index: 10000;
                font-family: 'Luckiest Guy', cursive;
                color: #ff0000;
                text-align: center;
                pointer-events: none;
                animation: clownFlyAway 3s ease-out forwards;
              `;
              document.body.appendChild(clownThief);
              setTimeout(() => clownThief.remove(), 3000);
            }
          }
        ];
        
        const penalty = penalties[Math.floor(Math.random() * penalties.length)];
        penalty.action();
        
        const clown = document.createElement('div');
        clown.textContent = '🤡';
        clown.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 200px;
          z-index: 9999;
          animation: clownLaugh 2s ease-in-out;
          pointer-events: none;
          filter: drop-shadow(0 0 30px #ff00ff);
        `;
        document.body.appendChild(clown);
        
        const penaltyMsg = document.createElement('div');
        penaltyMsg.textContent = penalty.name;
        penaltyMsg.style.cssText = `
          position: fixed;
          top: 30%;
          left: 50%;
          transform: translateX(-50%);
          font-size: 50px;
          color: #ff0000;
          font-family: 'Luckiest Guy', cursive;
          z-index: 10000;
          text-shadow: 0 0 20px #000;
          animation: fadeOut 2s;
          pointer-events: none;
        `;
        document.body.appendChild(penaltyMsg);
        
        setTimeout(() => {
          clown.remove();
          penaltyMsg.remove();
        }, 2000);
        
        vibrate([100, 50, 100, 50, 300]);
      },
      '⚡': () => {
        rumorBubble.textContent = "⚡ HEARING BOLT! LIGHTNING SPEED! 3X POINTS! ⚡";
        
        if (typeof SoundSystem !== 'undefined') {
          SoundSystem.lightning();
        }
        
        const wasPaused = isPaused;
        isPaused = true;
        window.gamePaused = true;
        
        // 🐛 FIX: Clear ALL ears to prevent deaths during Lightning Speed
        document.querySelectorAll('.ear').forEach(ear => {
          ear.classList.remove('active', 'cabal', 'echo', 'power-up');
          ear.textContent = '';
        });
        if (typeof window.activeEarsCount !== 'undefined') {
          window.activeEarsCount = 0;
        }
        
        const instructionOverlay = document.createElement('div');
        instructionOverlay.style.cssText = `
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.9);
          z-index: 10000;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        `;
        
        instructionOverlay.innerHTML = `
          <div style="font-size: 70px; color: #FFD700; font-family: 'Luckiest Guy', cursive; margin-bottom: 30px; text-shadow: 0 0 40px #FFD700;">⚡ LIGHTNING SPEED! ⚡</div>
          <div style="font-size: 45px; color: #fff; font-family: 'Luckiest Guy', cursive; margin-bottom: 20px;">3X POINTS FOR 10 SECONDS!</div>
          <div style="font-size: 35px; color: #00ff00; font-family: 'Luckiest Guy', cursive;">CLICK EVERYTHING AS FAST AS YOU CAN!</div>
          <div id="lightningCountdown" style="font-size: 120px; color: #ff0000; font-family: 'Luckiest Guy', cursive; margin-top: 40px; text-shadow: 0 0 50px #ff0000;">3</div>
        `;
        
        document.body.appendChild(instructionOverlay);
        
        let readyCount = 3;
        const countdownEl = document.getElementById('lightningCountdown');
        
        const readyInterval = setInterval(() => {
          readyCount--;
          if (readyCount > 0) {
            countdownEl.textContent = readyCount;
          } else {
            countdownEl.textContent = 'GO!';
            countdownEl.style.color = '#00ff00';
            clearInterval(readyInterval);
            
            setTimeout(() => {
              instructionOverlay.remove();
              startLightningGame();
            }, 1000);
          }
        }, 1000);
        
        function startLightningGame() {
          isPaused = false;
          window.gamePaused = false;
          
          const wasInvincible = invincibleMode;
          invincibleMode = true;
          
          const overlay = document.createElement('div');
          overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 165, 0, 0.15));
            z-index: 9999;
            pointer-events: none;
            animation: lightningPulse 0.3s infinite;
          `;
          document.body.appendChild(overlay);
          
          let hitsGot = 0;
          const counter = document.createElement('div');
          counter.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            font-size: 100px;
            color: #FFD700;
            font-weight: bold;
            z-index: 10000;
            pointer-events: none;
            font-family: 'Luckiest Guy', cursive;
            text-shadow: 0 0 40px #FFD700;
          `;
          counter.textContent = `HITS: 0`;
          document.body.appendChild(counter);
          
          let timeLeft = 10;
          const timer = document.createElement('div');
          timer.style.cssText = `
            position: fixed;
            top: 75%;
            left: 50%;
            transform: translateX(-50%);
            font-size: 120px;
            color: #ff0000;
            font-weight: bold;
            z-index: 10000;
            pointer-events: none;
            font-family: 'Luckiest Guy', cursive;
            text-shadow: 0 0 40px #ff0000;
          `;
          timer.textContent = timeLeft;
          document.body.appendChild(timer);
          
          const countdownInterval = setInterval(() => {
            timeLeft--;
            timer.textContent = timeLeft;
            if (timeLeft <= 0) {
              clearInterval(countdownInterval);
            }
          }, 1000);
          
          const originalHitEar = hitEar;
          let bulletHitEar = function(ear) {
            if (ear && ear.classList.contains('active')) {
              hitsGot++;
              counter.textContent = `HITS: ${hitsGot}`;
              counter.style.animation = 'none';
              setTimeout(() => { counter.style.animation = 'bulletTimePulse 0.3s'; }, 10);
            }
            originalHitEar.call(this, ear);
          };
          
          const tempHitEar = hitEar;
          hitEar = bulletHitEar;
          
          const spawnInterval = setInterval(() => {
            if (!isPaused && !window.gamePaused) {
              spawnEar();
            }
          }, 300); // Every 300ms
          
          setTimeout(() => {
            clearInterval(spawnInterval);
            clearInterval(countdownInterval);
            hitEar = tempHitEar;
            
            overlay.remove();
            counter.remove();
            timer.remove();
            
            const bonus = hitsGot * 50; // 50 points per hit
            score += bonus;
            updateUI();
            
            const resultNotif = document.createElement('div');
            resultNotif.textContent = `⚡ ${hitsGot} HITS! +${bonus} POINTS! ⚡`;
            resultNotif.style.cssText = `
      position: fixed;
      top: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(45deg, #000, #1a0033, #000);
      border: 4px solid #ff00ff;
      padding: 20px 40px;
      font-size: 30px;
      font-family: 'Luckiest Guy', cursive;
      color: #fff;
      text-shadow: -2px 0 #ff00ff, 2px 0 #00ffff;
      z-index: 10001;
      border-radius: 10px;
      box-shadow: 0 0 30px rgba(255, 0, 255, 0.6);
    `;
            document.body.appendChild(resultNotif);
            setTimeout(() => resultNotif.remove(), 2000);
            
            invincibleMode = wasInvincible;
            
            if (!wasPaused) isPaused = false;
          }, 10000); // 10 seconds
        }
      },
      '💊': () => {
        streak = 0; // KEEP streak reset
        combo += 0.5;
        rumorBubble.textContent = "COPING HARD! 💊🌈";
        vibrate([80, 40, 120]);
        
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
          gameContainer.style.animation = 'psychedelicWave 5s ease-in-out';
          gameContainer.style.filter = 'hue-rotate(0deg) saturate(2)';
          
          let hue = 0;
          const hueInterval = setInterval(() => {
            hue += 10;
            gameContainer.style.filter = `hue-rotate(${hue}deg) saturate(2)`;
            if (hue >= 360) {
              clearInterval(hueInterval);
              gameContainer.style.filter = '';
              gameContainer.style.animation = '';
            }
          }, 50);
          
          const ears = document.querySelectorAll('.ear');
          ears.forEach((ear, i) => {
            ear.style.animation = `waveFloat 2s ease-in-out infinite ${i * 0.1}s`;
        if (typeof SoundSystem !== 'undefined') {
          SoundSystem.freezeWhoosh();
        }

          });
          
          setTimeout(() => {
            ears.forEach(ear => {
              ear.style.animation = '';
            });
          }, 5000);
        }
      },
      '❄️': () => {
        rumorBubble.textContent = "❄️ HEARING FREEZE! BREAK THEM ALL! ❄️";
        
        if (typeof SoundSystem !== 'undefined') {
          SoundSystem.ghost(); // Using ghost sound for freeze effect
        }
        
        const duration = 5000;
        const ears = document.querySelectorAll('.ear.active');
        const frozenEars = [];
        
        ears.forEach(ear => {
          ear.classList.add('frozen');
          ear.style.filter = 'brightness(1.5) hue-rotate(180deg) drop-shadow(0 0 20px #00ffff)';
          ear.style.animation = 'iceCrystal 1s ease-in-out infinite';
          ear.style.cursor = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'%3E%3Ctext y=\'28\' font-size=\'28\'%3E🔨%3C/text%3E%3C/svg%3E") 16 16, auto';
          frozenEars.push(ear);
        });
        
        document.body.style.cursor = 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'32\' height=\'32\' viewBox=\'0 0 32 32\'%3E%3Ctext y=\'28\' font-size=\'28\'%3E🔨%3C/text%3E%3C/svg%3E") 16 16, auto';
        
        let brokenCount = 0;
        const totalEars = frozenEars.length;
        
        const originalHitEar = hitEar;
        hitEar = function(ear) {
          if (ear && ear.classList.contains('frozen')) {
            brokenCount++;
            score += 100; // Bonus for ice break
            
            if (typeof SoundSystem !== 'undefined') {
              SoundSystem.iceBreak();
            }
            
            const iceBreak = document.createElement('div');
            iceBreak.textContent = '💎';
            iceBreak.style.cssText = `
              position: fixed;
              left: ${Math.random() * 100}%;
              top: ${Math.random() * 100}%;
              font-size: 30px;
              z-index: 9999;
              pointer-events: none;
              animation: iceShatter 0.5s ease-out;
            `;
            document.body.appendChild(iceBreak);
            setTimeout(() => iceBreak.remove(), 500);
            
            ear.classList.remove('frozen');
          }
          originalHitEar.call(this, ear);
        };
        
        setTimeout(() => {
          hitEar = originalHitEar;
          
          document.querySelectorAll('.ear.frozen').forEach(ear => {
            ear.classList.remove('frozen');
            ear.style.filter = '';
            ear.style.animation = '';
            ear.style.cursor = '';
          });
          
          document.body.style.cursor = '';
          
          if (brokenCount >= totalEars && totalEars > 0) {
            score += 1000;
            const bonus = document.createElement('div');
            bonus.textContent = '❄️ PERFECT BREAK! +1000 ❄️';
            bonus.style.cssText = `
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              font-size: 50px;
              color: #00ffff;
              font-weight: bold;
              z-index: 10000;
              text-shadow: 0 0 30px #00ffff;
              font-family: 'Luckiest Guy', cursive;
              animation: fadeIn 0.3s, fadeOut 0.5s 2s;
              pointer-events: none;
            `;
            document.body.appendChild(bonus);
            setTimeout(() => bonus.remove(), 2500);
          }
          
          updateUI();
        }, duration);
        
        streak = 0; // Reset misses
      },
      '🌙': () => {
        rumorBubble.textContent = "👻 HEARING GHOSTS! CATCH THE GHOSTS! 👻";
        
        if (typeof SoundSystem !== 'undefined') {
          SoundSystem.ghost();
        }
        
        const duration = 8000;
        const gameContainer = document.querySelector('.game-container');
        
        if (gameContainer) {
          gameContainer.style.background = 'linear-gradient(180deg, #0a0a1a, #1a1a2e)';
          gameContainer.style.filter = 'contrast(1.3)';
        }
        
        const ears = document.querySelectorAll('.ear.active');
        const ghostEars = new Set(ears);
        
        ears.forEach(ear => {
          ear.textContent = '👻';
          ear.style.transition = 'opacity 0.3s';
          ear.dataset.ghostMode = 'true';
          
          const phaseInterval = setInterval(() => {
            if (ear.classList.contains('active')) {
              const isVisible = ear.style.opacity !== '0';
              ear.style.opacity = isVisible ? '0' : '1';
              ear.style.pointerEvents = isVisible ? 'none' : 'auto';
              
              if (!isVisible) {
                ear.style.filter = 'drop-shadow(0 0 20px #8b00ff) brightness(1.3)';
              } else {
                ear.style.filter = 'grayscale(100%) opacity(0.3)';
              }
            }
          }, 800 + Math.random() * 400); // Random timing per ear
          
          setTimeout(() => {
            clearInterval(phaseInterval);
            ear.style.opacity = '1';
            ear.style.filter = '';
            ear.style.pointerEvents = '';
            ear.style.transition = '';
            delete ear.dataset.ghostMode;
            if (ear.classList.contains('active')) {
              ear.textContent = '👂';
            }
          }, duration);
        });
        
        for (let i = 0; i < 8; i++) {
          setTimeout(() => {
            const ghost = document.createElement('div');
            ghost.textContent = '👻';
            ghost.style.cssText = `
              position: fixed;
              left: ${Math.random() * 80 + 10}%;
              top: ${Math.random() * 60 + 10}%;
              font-size: 50px;
              cursor: pointer;
              z-index: 100;
              animation: ghostFloat 2s ease-in-out infinite;
              filter: drop-shadow(0 0 15px #8b00ff);
            `;
            
            ghost.addEventListener('click', () => {
              score += 100;
              updateUI();
              
              const bonus = document.createElement('div');
              bonus.textContent = '+100 👻';
              bonus.style.cssText = `
                position: fixed;
                left: ${ghost.style.left};
                top: ${ghost.style.top};
                font-size: 40px;
                color: #8b00ff;
                font-weight: bold;
                z-index: 10000;
                pointer-events: none;
                animation: fadeOut 1s;
              `;
              document.body.appendChild(bonus);
              setTimeout(() => bonus.remove(), 1000);
              
              ghost.remove();
            });
            
            document.body.appendChild(ghost);
            setTimeout(() => ghost.remove(), duration - (i * 400));
          }, i * 400);
        }
        
        setTimeout(() => {
          if (gameContainer) {
            gameContainer.style.background = '';
            gameContainer.style.filter = '';
          }
          document.querySelectorAll('[data-ghost-mode]').forEach(ear => {
            ear.style.opacity = '1';
            ear.style.filter = '';
          });
        }, duration);
        
        score += 150;
        combo += 1;
      },
      '☄️': () => {
        score += 300;
        rumorBubble.textContent = "☄️ HEARING METEOR! STRIKE! ☄️";
        triggerLSDPsycho();
      },
      '🎯': () => {
        score += 500;
        rumorBubble.textContent = "🎯 HEARING SNIPE! BULLSEYE! +500 🎯";
      },
      '🎲': () => {
        const diceDisplay = document.createElement('div');
        diceDisplay.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 150px;
          color: #FFD700;
          font-weight: bold;
          font-family: 'Luckiest Guy', cursive;
          z-index: 10000;
          animation: diceRoll 0.5s ease-in-out;
          pointer-events: none;
          text-shadow: 0 0 30px #FFD700, 3px 3px 10px #000;
        `;
        
        let rollCount = 0;
        const rollInterval = setInterval(() => {
          diceDisplay.textContent = randomInt(1, 6);
          rollCount++;
          if (rollCount >= 10) {
            clearInterval(rollInterval);
            const finalRoll = randomInt(1, 6);
            diceDisplay.textContent = finalRoll;
            diceDisplay.style.fontSize = '200px';
            diceDisplay.style.animation = 'diceStop 0.3s ease-out';
            
            score += finalRoll * 100;
            rumorBubble.textContent = `🎲 HEARING DICE! ROLLED ${finalRoll}! +${finalRoll * 100} 🎲`;
            updateUI();
            
            setTimeout(() => diceDisplay.remove(), 1000);
          }
        }, 50);
        
        document.body.appendChild(diceDisplay);
      },
      '🍀': () => {
        const luck = randomInt(200, 800);
        score += luck;
        rumorBubble.textContent = `🍀 HEARING LUCK! +${luck} 🍀`;
      },
      '⭐': () => {
        permanentComboBonus += 0.3;
        rumorBubble.textContent = "⭐ HEARING STAR! +0.3 COMBO ⭐";
        rainEmojis('special');
      },
      '🦻': () => {
        // HEARING GRANDPA V2 - ULTRA DÉBILE avec OVERLAY COMPLET
        rumorBubble.textContent = "🦻 HEARING GRANDPA! WHAT?! HUH?! 🦻";
        
        // 🐛 FIX: Pauser le jeu et nettoyer les ears
        const wasGamePaused = isPaused;
        window.gamePaused = true;
        isPaused = true;
        
        // 🐛 FIX: Clear ALL ears to prevent deaths during Grandpa
        document.querySelectorAll('.ear').forEach(ear => {
          ear.classList.remove('active', 'cabal', 'echo', 'power-up');
          ear.textContent = '';
        });
        if (typeof window.activeEarsCount !== 'undefined') {
          window.activeEarsCount = 0;
        }
        
        // 🎭 OVERLAY COMPLET pour cacher le fond
        const grandpaOverlay = document.createElement('div');
        grandpaOverlay.id = 'grandpaOverlay';
        grandpaOverlay.style.cssText = `
          position: fixed;
          inset: 0;
          background: linear-gradient(45deg, #8B4513 0%, #D2691E 25%, #8B4513 50%, #D2691E 75%, #8B4513 100%);
          background-size: 400% 400%;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          animation: vintageBackground 5s ease infinite;
          filter: sepia(0.8) contrast(1.2);
        `;
        
        // Titre GRANDPA
        const title = document.createElement('div');
        title.textContent = '🦻 HEARING GRANDPA 🦻';
        title.style.cssText = `
          font-family: 'Luckiest Guy', cursive;
          font-size: clamp(40px, 8vw, 80px);
          color: #FFD700;
          text-shadow: 
            0 0 40px #FFD700,
            5px 5px 0 #000,
            10px 10px 0 rgba(0,0,0,0.5);
          margin-bottom: 30px;
          animation: shake 0.5s infinite;
        `;
        
        // Message vintage
        const message = document.createElement('div');
        message.textContent = 'SPEAK UP SONNY!';
        message.style.cssText = `
          font-family: 'Luckiest Guy', cursive;
          font-size: clamp(30px, 6vw, 60px);
          color: #fff;
          text-shadow: 3px 3px 0 #000;
          margin-bottom: 40px;
          animation: pulse 1s infinite;
        `;
        
        // Container pour les popups
        const popupContainer = document.createElement('div');
        popupContainer.style.cssText = `
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        `;
        
        grandpaOverlay.appendChild(title);
        grandpaOverlay.appendChild(message);
        grandpaOverlay.appendChild(popupContainer);
        document.body.appendChild(grandpaOverlay);
        
        // Ajouter animation vintage au CSS inline
        const style = document.createElement('style');
        style.textContent = `
          @keyframes vintageBackground {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes slowShake {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            25% { transform: translate(-3px, 3px) rotate(-1deg); }
            50% { transform: translate(3px, -3px) rotate(1deg); }
            75% { transform: translate(-3px, -3px) rotate(-1deg); }
          }
        `;
        document.head.appendChild(style);
        
        // 🔊 TEXT-TO-SPEECH débile
        if ('speechSynthesis' in window) {
          const phrases = [
            "What's that you say?",
            "Speak up sonny!",
            "I can't hear you!",
            "My hearing aid is broken!",
            "Back in my day...",
            "Huh? What?!"
          ];
          
          let phraseIndex = 0;
          const speakInterval = setInterval(() => {
            const utterance = new SpeechSynthesisUtterance(phrases[phraseIndex]);
            utterance.rate = 0.7; // Très lent
            utterance.pitch = 0.7; // Voix grave
            utterance.volume = 0.8;
            window.speechSynthesis.speak(utterance);
            
            phraseIndex = (phraseIndex + 1) % phrases.length;
          }, 2000);
          
          setTimeout(() => clearInterval(speakInterval), 10000);
        }
        
        // 💬 Popups aléatoires DÉBILES
        const whatPhrases = [
          'WHAT?!', 'HUH?!', 'EH?!', 'SPEAK UP!', 
          'CANT HEAR!', 'MY EARS!', 'TOO LOUD!', 'TOO QUIET!',
          'BACK IN MY DAY...', 'WHIPPERSNAPPER!', 
          'GET OFF MY LAWN!', 'WHERE ARE MY GLASSES?!',
          '🦻', '👴', '🧓', '📢'
        ];
        
        let whatCount = 0;
        const whatInterval = setInterval(() => {
          const whatPopup = document.createElement('div');
          whatPopup.textContent = whatPhrases[Math.floor(Math.random() * whatPhrases.length)];
          whatPopup.style.cssText = `
            position: fixed;
            left: ${Math.random() * 90 + 5}%;
            top: ${Math.random() * 90 + 5}%;
            font-size: ${30 + Math.random() * 50}px;
            color: ${['#FFD700', '#fff', '#FF6B00', '#00ffff'][Math.floor(Math.random() * 4)]};
            font-family: 'Luckiest Guy', cursive;
            text-shadow: 3px 3px 0 #000;
            z-index: 100000;
            pointer-events: none;
            animation: fadeOut 2s forwards, slowShake 0.5s infinite;
            transform-origin: center;
          `;
          popupContainer.appendChild(whatPopup);
          
          setTimeout(() => whatPopup.remove(), 2000);
          
          whatCount++;
          if (whatCount >= 20) clearInterval(whatInterval);
        }, 600);
        
        // 🎵 Musique vintage (optionnel)
        const playVintageSound = () => {
          try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.frequency.value = 220; // A3
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
            
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 1);
          } catch(e) {}
        };
        
        playVintageSound();
        
        // 💰 Bonus points
        score += 300;
        
        // 🔙 Retour normal après 5 secondes (réduit de 10s)
        setTimeout(() => {
          // Ending screen propre
          grandpaOverlay.innerHTML = '';
          grandpaOverlay.style.animation = 'none';
          grandpaOverlay.style.filter = 'none';
          grandpaOverlay.style.background = 'rgba(0,0,0,0.95)';
          grandpaOverlay.style.flexDirection = 'column';
          grandpaOverlay.style.alignItems = 'center';
          grandpaOverlay.style.justifyContent = 'center';
          
          const endTitle = document.createElement('div');
          endTitle.textContent = '👴 GRANDPA WENT HOME! 👴';
          endTitle.style.cssText = `
            font-family: 'Luckiest Guy', cursive;
            font-size: clamp(30px, 7vw, 60px);
            color: #FFD700;
            text-shadow: 3px 3px 0 #000, 0 0 30px #FFD700;
            margin-bottom: 20px;
            text-align: center;
          `;
          
          const endBonus = document.createElement('div');
          endBonus.textContent = '💰 +300 BONUS POINTS! 💰';
          endBonus.style.cssText = `
            font-family: 'Luckiest Guy', cursive;
            font-size: clamp(22px, 5vw, 40px);
            color: #00ff00;
            text-shadow: 0 0 20px #00ff00, 2px 2px 0 #000;
            margin-bottom: 15px;
            text-align: center;
            animation: pulse 0.5s ease-in-out infinite;
          `;
          
          const endScore = document.createElement('div');
          endScore.textContent = `🎯 SCORE: ${Math.round(score)}`;
          endScore.style.cssText = `
            font-family: 'Luckiest Guy', cursive;
            font-size: clamp(18px, 4vw, 30px);
            color: #fff;
            text-shadow: 2px 2px 0 #000;
            text-align: center;
          `;
          
          grandpaOverlay.appendChild(endTitle);
          grandpaOverlay.appendChild(endBonus);
          grandpaOverlay.appendChild(endScore);
          
          updateUI();
          
          // Disparaître après 2s
          setTimeout(() => {
            grandpaOverlay.style.transition = 'opacity 0.8s';
            grandpaOverlay.style.opacity = '0';
            
            setTimeout(() => {
              grandpaOverlay.remove();
              style.remove();
              
              // 🐛 FIX: Reprendre le jeu
              if (!wasGamePaused) {
                isPaused = false;
                window.gamePaused = false;
                if (typeof window.startSpawning === 'function') window.startSpawning();
              }
            }, 800);
            
            rumorBubble.textContent = "GRANDPA LEFT! BACK TO NORMAL! 🎯";
            rumorBubble.classList.add("show");
            setTimeout(() => rumorBubble.classList.remove("show"), 1500);
          }, 2000);
          
        }, 5000); // 5s au lieu de 10s
      },
      '🥤': () => {
        rumorBubble.textContent = "🥤 HEARING HUSTLE! FIND THE EAR! 🥤";
        if (typeof MiniGames !== 'undefined' && MiniGames.showBonneteau) {
          setTimeout(() => MiniGames.showBonneteau({score, updateUI, addScore: (pts) => { score += pts; updateUI(); }}), 500);
        }
      },
      '🧠': () => {
        rumorBubble.textContent = "🧠 MEMORY GAME! FOCUS UP! 🧠";
        if (typeof MiniGames !== 'undefined' && MiniGames.showMemoryGame) {
          setTimeout(() => MiniGames.showMemoryGame({score, updateUI}), 500);
        }
      },
      '🎈': () => {
        rumorBubble.textContent = "🎈 HEARINKO TIME! BALLS DEEP! 🎈";
        if (typeof MiniGames !== 'undefined' && MiniGames.showPachinko) {
          setTimeout(() => MiniGames.showPachinko({score, updateUI, addScore: (pts) => { score += pts; updateUI(); }}), 500);
        }
      },
      '🪙': () => {
        score += 75;
        rumorBubble.textContent = "🪙 HEARING FLIP! DOUBLE OR NOTHING! 🪙";
        
        // 🔊 TTS
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance("Hearing Flip! Double or nothing! Choose wisely!");
          utterance.rate = 1.1;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          window.speechSynthesis.speak(utterance);
        }
        
        const wasPaused = isPaused;
        isPaused = true;
        clearInterval(gameInterval);
        
        // 🐛 FIX: Clear ALL ears (pas juste .active) to prevent deaths during mini-game
        document.querySelectorAll('.ear').forEach(ear => {
          ear.classList.remove('active', 'cabal', 'echo', 'power-up');
          ear.textContent = '';
        });
        activeEarsCount = 0;
        
        // Create epic overlay
        const overlay = document.createElement('div');
        overlay.id = 'coinFlipOverlay';
        overlay.style.cssText = `
          position: fixed;
          inset: 0;
          background: radial-gradient(ellipse at center, rgba(40,0,60,0.98) 0%, rgba(0,0,0,0.99) 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 100000;
          animation: fadeIn 0.3s;
          overflow: hidden;
        `;
        
        // Add animated background particles
        for (let i = 0; i < 30; i++) {
          const particle = document.createElement('div');
          particle.textContent = ['✨', '💫', '⭐', '🪙'][Math.floor(Math.random() * 4)];
          particle.style.cssText = `
            position: absolute;
            font-size: ${15 + Math.random() * 25}px;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: 0.3;
            animation: floatParticle ${3 + Math.random() * 4}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
            pointer-events: none;
          `;
          overlay.appendChild(particle);
        }
        
        // Title
        const title = document.createElement('div');
        title.innerHTML = '🪙 HEARING FLIP 🪙';
        title.style.cssText = `
          font-size: clamp(40px, 8vw, 70px);
          color: #FFD700;
          font-family: 'Luckiest Guy', cursive;
          text-shadow: 0 0 30px #FFD700, 0 0 60px #ff00ff, 4px 4px 0 #000;
          margin-bottom: 10px;
          animation: titlePulse 1s ease-in-out infinite;
          z-index: 10;
        `;
        
        // Subtitle with current score
        const subtitle = document.createElement('div');
        subtitle.innerHTML = `💰 YOUR SCORE: <span style="color: #00ff00;">${Math.round(score)}</span> 💰`;
        subtitle.style.cssText = `
          font-size: clamp(18px, 4vw, 28px);
          color: #fff;
          font-family: 'Luckiest Guy', cursive;
          margin-bottom: 20px;
          text-shadow: 2px 2px 0 #000;
          z-index: 10;
        `;
        
        // 🔧 STAKE SELECTOR - Choisir la mise
        let stakePercent = 0.5; // défaut 50%
        let stakeAmount = Math.round(score * stakePercent);
        
        const stakeLabel = document.createElement('div');
        stakeLabel.style.cssText = `
          font-size: clamp(16px, 3.5vw, 24px);
          color: #00ffff;
          font-family: 'Luckiest Guy', cursive;
          margin-bottom: 12px;
          text-shadow: 0 0 15px #00ffff;
          z-index: 10;
        `;
        const updateStakeLabel = () => {
          stakeAmount = Math.round(score * stakePercent);
          stakeLabel.innerHTML = `🎲 STAKE: <span style="color:#FFD700">${stakeAmount} PTS</span> — WIN: <span style="color:#00ff00">+${stakeAmount}</span> / LOSE: <span style="color:#ff4444">-${stakeAmount}</span>`;
        };
        updateStakeLabel();
        
        const stakeButtons = document.createElement('div');
        stakeButtons.style.cssText = `display: flex; gap: 12px; z-index: 10; margin-bottom: 20px; flex-wrap: wrap; justify-content: center;`;
        
        [0.25, 0.5, 0.75, 1.0].forEach(pct => {
          const sb = document.createElement('button');
          sb.textContent = `${pct * 100}%`;
          sb.style.cssText = `
            padding: 10px 22px;
            font-size: clamp(16px, 3.5vw, 22px);
            background: ${pct === 0.5 ? 'linear-gradient(135deg,#FFD700,#ff6600)' : '#222'};
            color: ${pct === 0.5 ? '#000' : '#fff'};
            border: 3px solid #FFD700;
            border-radius: 12px;
            cursor: pointer;
            font-family: 'Luckiest Guy', cursive;
            transition: all 0.15s;
            touch-action: manipulation;
          `;
          sb.onclick = () => {
            stakePercent = pct;
            stakeButtons.querySelectorAll('button').forEach(b => {
              b.style.background = '#222';
              b.style.color = '#fff';
              b.style.transform = 'scale(1)';
            });
            sb.style.background = 'linear-gradient(135deg,#FFD700,#ff6600)';
            sb.style.color = '#000';
            sb.style.transform = 'scale(1.1)';
            updateStakeLabel();
          };
          stakeButtons.appendChild(sb);
        });
        
        // Coin container with 3D perspective
        const coinContainer = document.createElement('div');
        coinContainer.style.cssText = `
          perspective: 1000px;
          width: 180px;
          height: 180px;
          margin: 20px 0;
          z-index: 10;
        `;
        
        // 3D Coin
        const coin = document.createElement('div');
        coin.id = 'flipCoin';
        coin.style.cssText = `
          width: 180px;
          height: 180px;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.1s;
          cursor: pointer;
        `;
        
        // Coin front (HEADS)
        const coinFront = document.createElement('div');
        coinFront.innerHTML = '👑';
        coinFront.style.cssText = `
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          background: radial-gradient(ellipse at 30% 30%, #FFD700 0%, #B8860B 50%, #8B6914 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 100px;
          border: 8px solid #DAA520;
          box-shadow: inset 0 0 30px rgba(0,0,0,0.3), 0 0 40px rgba(255,215,0,0.8);
        `;
        
        // Coin back (TAILS)
        const coinBack = document.createElement('div');
        coinBack.innerHTML = '🦅';
        coinBack.style.cssText = `
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          background: radial-gradient(ellipse at 30% 30%, #C0C0C0 0%, #A0A0A0 50%, #808080 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 100px;
          border: 8px solid #909090;
          box-shadow: inset 0 0 30px rgba(0,0,0,0.3), 0 0 40px rgba(192,192,192,0.8);
          transform: rotateY(180deg);
        `;
        
        coin.appendChild(coinFront);
        coin.appendChild(coinBack);
        coinContainer.appendChild(coin);
        
        // Instruction text
        const instruction = document.createElement('div');
        instruction.innerHTML = '👇 CHOOSE YOUR FATE 👇';
        instruction.style.cssText = `
          font-size: clamp(20px, 4vw, 30px);
          color: #00ffff;
          font-family: 'Luckiest Guy', cursive;
          margin: 20px 0;
          text-shadow: 0 0 20px #00ffff;
          animation: pulse 1s ease-in-out infinite;
          z-index: 10;
        `;
        
        // Buttons container
        const buttons = document.createElement('div');
        buttons.style.cssText = 'display: flex; gap: 30px; z-index: 10;';
        
        // HEADS button
        const headsBtn = document.createElement('button');
        headsBtn.innerHTML = '👑<br>HEADS';
        headsBtn.style.cssText = `
          padding: 20px 40px;
          font-size: clamp(22px, 4vw, 32px);
          background: linear-gradient(145deg, #FFD700, #B8860B);
          color: #000;
          border: 5px solid #fff;
          border-radius: 20px;
          cursor: pointer;
          font-family: 'Luckiest Guy', cursive;
          box-shadow: 0 10px 30px rgba(255,215,0,0.6), 0 0 50px rgba(255,215,0,0.3);
          transition: all 0.2s;
          text-shadow: 1px 1px 0 #fff;
        `;
        headsBtn.onmouseenter = () => { headsBtn.style.transform = 'scale(1.1) rotate(-3deg)'; };
        headsBtn.onmouseleave = () => { headsBtn.style.transform = 'scale(1)'; };
        
        // TAILS button
        const tailsBtn = document.createElement('button');
        tailsBtn.innerHTML = '🦅<br>TAILS';
        tailsBtn.style.cssText = `
          padding: 20px 40px;
          font-size: clamp(22px, 4vw, 32px);
          background: linear-gradient(145deg, #C0C0C0, #808080);
          color: #000;
          border: 5px solid #fff;
          border-radius: 20px;
          cursor: pointer;
          font-family: 'Luckiest Guy', cursive;
          box-shadow: 0 10px 30px rgba(192,192,192,0.6), 0 0 50px rgba(192,192,192,0.3);
          transition: all 0.2s;
          text-shadow: 1px 1px 0 #fff;
        `;
        tailsBtn.onmouseenter = () => { tailsBtn.style.transform = 'scale(1.1) rotate(3deg)'; };
        tailsBtn.onmouseleave = () => { tailsBtn.style.transform = 'scale(1)'; };
        
        buttons.appendChild(headsBtn);
        buttons.appendChild(tailsBtn);
        
        // Result container (hidden initially)
        const resultContainer = document.createElement('div');
        resultContainer.id = 'coinResult';
        resultContainer.style.cssText = `
          position: absolute;
          bottom: 15%;
          left: 50%;
          transform: translateX(-50%);
          text-align: center;
          z-index: 10;
        `;
        
        overlay.appendChild(title);
        overlay.appendChild(subtitle);
        overlay.appendChild(stakeLabel);
        overlay.appendChild(stakeButtons);
        overlay.appendChild(coinContainer);
        overlay.appendChild(instruction);
        overlay.appendChild(buttons);
        overlay.appendChild(resultContainer);
        document.body.appendChild(overlay);
        
        // Add CSS animations
        const style = document.createElement('style');
        style.id = 'coinFlipStyles';
        style.textContent = `
          @keyframes floatParticle {
            0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
            50% { transform: translateY(-30px) rotate(180deg); opacity: 0.6; }
          }
          @keyframes titlePulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          @keyframes coinSpin {
            0% { transform: rotateY(0deg) rotateX(10deg); }
            100% { transform: rotateY(3600deg) rotateX(10deg); }
          }
          @keyframes coinSlowDown {
            0% { transform: rotateY(var(--start-rotation)) rotateX(10deg); }
            100% { transform: rotateY(var(--end-rotation)) rotateX(0deg); }
          }
          @keyframes coinFall {
            0% { transform: rotateY(var(--final-rotation)) rotateX(0deg) translateY(0); }
            30% { transform: rotateY(var(--final-rotation)) rotateX(0deg) translateY(20px); }
            50% { transform: rotateY(var(--final-rotation)) rotateX(0deg) translateY(0); }
            70% { transform: rotateY(var(--final-rotation)) rotateX(0deg) translateY(10px); }
            100% { transform: rotateY(var(--final-rotation)) rotateX(0deg) translateY(0); }
          }
          @keyframes coinEdge {
            0% { transform: rotateY(90deg) rotateX(0deg) rotateZ(0deg); }
            25% { transform: rotateY(90deg) rotateX(0deg) rotateZ(5deg); }
            50% { transform: rotateY(90deg) rotateX(0deg) rotateZ(-5deg); }
            75% { transform: rotateY(90deg) rotateX(0deg) rotateZ(3deg); }
            100% { transform: rotateY(90deg) rotateX(0deg) rotateZ(0deg); }
          }
          @keyframes thumbsUp {
            0% { transform: scale(0) rotate(-30deg); }
            50% { transform: scale(1.3) rotate(10deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          @keyframes thumbsDown {
            0% { transform: scale(0) rotate(30deg); }
            50% { transform: scale(1.3) rotate(-10deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          @keyframes rainCoin {
            0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0.5; }
          }
          @keyframes jackpotPulse {
            0%, 100% { transform: scale(1); filter: brightness(1); }
            50% { transform: scale(1.1); filter: brightness(1.5); }
          }
        `;
        document.head.appendChild(style);
        
        // Determine result (with small chance of EDGE!)
        const randomValue = Math.random();
        let result;
        let isEdge = false;
        
        if (randomValue < 0.03) { // 3% chance of landing on edge!
          result = 'EDGE';
          isEdge = true;
        } else if (randomValue < 0.515) {
          result = 'HEADS';
        } else {
          result = 'TAILS';
        }
        
        // Play coin sound function
        const playCoinSound = () => {
          if (typeof SoundSystem !== 'undefined' && SoundSystem.coin) {
            SoundSystem.coin();
          }
          // Create oscillator for coin flip sound
          try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(2000, audioCtx.currentTime + 0.1);
            oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.3);
          } catch(e) {}
        };
        
        // Text to speech function
        const speak = (text) => {
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            utterance.pitch = 1.2;
            utterance.volume = 0.8;
            speechSynthesis.speak(utterance);
          }
        };
        
        // Handle choice
        const handleChoice = (choice) => {
          buttons.style.display = 'none';
          instruction.style.display = 'none';
          
          // Play coin flip sound
          playCoinSound();
          vibrate([50, 30, 50, 30, 50]);
          
          // Phase 1: Fast spinning
          coin.style.animation = 'coinSpin 2s ease-out forwards';
          
          // Phase 2: Slow down
          setTimeout(() => {
            playCoinSound();
            
            let finalRotation;
            if (isEdge) {
              finalRotation = 90; // Edge position
            } else if (result === 'HEADS') {
              finalRotation = 3600; // Heads facing
            } else {
              finalRotation = 3780; // Tails facing (180 deg offset)
            }
            
            coin.style.setProperty('--start-rotation', '3600deg');
            coin.style.setProperty('--end-rotation', finalRotation + 'deg');
            coin.style.animation = 'coinSlowDown 1.5s ease-out forwards';
            
          }, 2000);
          
          // Phase 3: Fall/settle
          setTimeout(() => {
            let finalRotation;
            if (isEdge) {
              coin.style.animation = 'coinEdge 0.5s ease-in-out infinite';
              finalRotation = 90;
            } else if (result === 'HEADS') {
              finalRotation = 0;
            } else {
              finalRotation = 180;
            }
            
            if (!isEdge) {
              coin.style.setProperty('--final-rotation', finalRotation + 'deg');
              coin.style.animation = 'coinFall 0.5s ease-out forwards';
            }
            
            // Thud sound
            vibrate([100, 50, 100]);
            
          }, 3500);
          
          // Phase 4: Show result
          setTimeout(() => {
            // Determine outcome
            let won = false;
            let message = '';
            let thumbEmoji = '';
            let color = '';
            
            if (isEdge) {
              // JACKPOT! Edge landing!
              won = true;
              score += stakeAmount * 4; // 5x la mise sur EDGE!
              message = '🤯 IMPOSSIBLE! IT LANDED ON THE EDGE! 🤯';
              thumbEmoji = '🙌';
              color = '#ff00ff';
              
              speak('OH MY GOD! IT LANDED ON THE EDGE! JACKPOT!');
              
              // Rain coins and celebration
              for (let i = 0; i < 100; i++) {
                setTimeout(() => {
                  const rainCoin = document.createElement('div');
                  rainCoin.textContent = ['🪙', '💰', '💎', '✨'][Math.floor(Math.random() * 4)];
                  rainCoin.style.cssText = `
                    position: fixed;
                    left: ${Math.random() * 100}%;
                    top: -50px;
                    font-size: ${30 + Math.random() * 40}px;
                    z-index: 100001;
                    pointer-events: none;
                    animation: rainCoin ${2 + Math.random() * 2}s linear forwards;
                  `;
                  overlay.appendChild(rainCoin);
                  setTimeout(() => rainCoin.remove(), 4000);
                }, i * 30);
              }
              
              // Celebration emojis
              for (let i = 0; i < 20; i++) {
                setTimeout(() => {
                  const celebEmoji = document.createElement('div');
                  celebEmoji.textContent = ['🙌', '🎉', '🎊', '🤑', '👐'][Math.floor(Math.random() * 5)];
                  celebEmoji.style.cssText = `
                    position: fixed;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    font-size: 80px;
                    z-index: 100002;
                    pointer-events: none;
                    animation: jackpotPulse 0.5s ease-in-out infinite;
                  `;
                  overlay.appendChild(celebEmoji);
                  setTimeout(() => celebEmoji.remove(), 3000);
                }, i * 100);
              }
              
            } else if (choice === result) {
              won = true;
              score += stakeAmount; // Gagner = +stakeAmount (mise doublée)
              message = `${result}! YOU WIN! +${stakeAmount} PTS!`;
              thumbEmoji = '👍';
              color = '#00ff00';
              speak('Winner! Your stake has been doubled!');
              
              // Win celebration
              for (let i = 0; i < 30; i++) {
                setTimeout(() => {
                  const sparkle = document.createElement('div');
                  sparkle.textContent = ['✨', '⭐', '💫', '🌟'][Math.floor(Math.random() * 4)];
                  sparkle.style.cssText = `
                    position: fixed;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    font-size: 40px;
                    z-index: 100001;
                    pointer-events: none;
                    animation: fadeOut 1s forwards;
                  `;
                  overlay.appendChild(sparkle);
                  setTimeout(() => sparkle.remove(), 1000);
                }, i * 50);
              }
              
            } else {
              won = false;
              score = Math.max(0, score - stakeAmount); // Perdre = -stakeAmount
              message = `${result}! YOU LOSE! -${stakeAmount} PTS!`;
              thumbEmoji = '👎';
              color = '#ff0000';
              speak('Oh no! You lost your stake!');
              
              // Lose effect
              overlay.style.animation = 'shake 0.5s';
            }
            
            // Show result UI
            resultContainer.innerHTML = `
              <div style="
                font-size: 120px;
                animation: ${won ? 'thumbsUp' : 'thumbsDown'} 0.5s ease-out forwards;
                margin-bottom: 20px;
              ">${thumbEmoji}</div>
              <div style="
                font-size: clamp(25px, 5vw, 45px);
                color: ${color};
                font-family: 'Luckiest Guy', cursive;
                text-shadow: 0 0 30px ${color}, 3px 3px 0 #000;
                animation: pulse 0.5s ease-in-out infinite;
              ">${message}</div>
              <div style="
                font-size: clamp(30px, 6vw, 50px);
                color: #FFD700;
                font-family: 'Luckiest Guy', cursive;
                margin-top: 20px;
                text-shadow: 0 0 20px #FFD700;
              ">NEW SCORE: ${Math.round(score)}</div>
            `;
            
            updateUI();
            
            // Victory/Loss sound
            if (won) {
              if (typeof SoundSystem !== 'undefined') {
                if (isEdge && SoundSystem.jackpot) SoundSystem.jackpot();
                else if (SoundSystem.bonus) SoundSystem.bonus();
              }
            } else {
              if (typeof SoundSystem !== 'undefined' && SoundSystem.miss) {
                SoundSystem.miss();
              }
            }
            
            // Clean up and resume game
            setTimeout(() => {
              overlay.remove();
              const styleEl = document.getElementById('coinFlipStyles');
              if (styleEl) styleEl.remove();
              
              if (!wasPaused) {
                isPaused = false;
                startSpawning();
              }
            }, isEdge ? 5000 : 3000);
            
          }, 4200);
        };
        
        headsBtn.addEventListener('click', () => handleChoice('HEADS'));
        tailsBtn.addEventListener('click', () => handleChoice('TAILS'));
      },
      
      '🔮': () => {
        // 🔮 FORTUNE TELLER V2 - ULTRA MYSTIQUE ET DEGEN
        rumorBubble.textContent = "🔮✨ THE CRYSTAL REVEALS YOUR DESTINY ✨🔮";
        
        const wasPaused = isPaused;
        isPaused = true;
        window.gamePaused = true;
        
        // 🐛 FIX: Clear ALL ears to prevent deaths during Fortune Teller
        document.querySelectorAll('.ear').forEach(ear => {
          ear.classList.remove('active', 'cabal', 'echo', 'power-up');
          ear.textContent = '';
        });
        if (typeof window.activeEarsCount !== 'undefined') {
          window.activeEarsCount = 0;
        }
        
        // Overlay mystique complet
        const overlay = document.createElement('div');
        overlay.id = 'fortuneTellerOverlay';
        overlay.style.cssText = `
          position: fixed;
          inset: 0;
          background: linear-gradient(135deg, #1a0033 0%, #330066 50%, #1a0033 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100005;
          animation: fadeIn 0.3s, mysticPulse 3s infinite;
          overflow: hidden;
        `;
        
        // Ajouter CSS animations
        const style = document.createElement('style');
        style.id = 'fortuneTellerStyles';
        style.innerHTML = `
          @keyframes mysticPulse {
            0%, 100% { background: linear-gradient(135deg, #1a0033 0%, #330066 50%, #1a0033 100%); }
            50% { background: linear-gradient(135deg, #330066 0%, #660099 50%, #330066 100%); }
          }
          @keyframes mysticFloat {
            0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
            50% { transform: translateY(-30px) rotate(180deg); opacity: 1; }
          }
          @keyframes crystalGlow {
            0%, 100% { 
              text-shadow: 0 0 40px #9d4edd, 0 0 80px #c77dff, 0 0 120px #e0aaff, 5px 5px 0 #000;
              transform: scale(1);
            }
            50% { 
              text-shadow: 0 0 60px #9d4edd, 0 0 120px #c77dff, 0 0 180px #e0aaff, 5px 5px 0 #000;
              transform: scale(1.05);
            }
          }
          @keyframes countdownSpin {
            0% { transform: scale(1) rotate(0deg); opacity: 1; }
            50% { transform: scale(1.5) rotate(180deg); opacity: 0.8; }
            100% { transform: scale(1) rotate(360deg); opacity: 1; }
          }
          @keyframes holePrediction {
            0%, 100% {
              box-shadow: 0 0 30px #9d4edd, inset 0 0 30px #c77dff !important;
              border-color: #e0aaff !important;
            }
            50% {
              box-shadow: 0 0 60px #9d4edd, inset 0 0 60px #c77dff, 0 0 90px #e0aaff !important;
              border-color: #9d4edd !important;
            }
          }
        `;
        document.head.appendChild(style);
        
        // Particules mystiques (réduit sur mobile)
        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 15 : 30;
        
        for (let i = 0; i < particleCount; i++) {
          const particle = document.createElement('div');
          particle.textContent = ['🔮', '✨', '🌟', '💫', '⭐', '🌙'][Math.floor(Math.random() * 6)];
          particle.style.cssText = `
            position: absolute;
            font-size: ${20 + Math.random() * 40}px;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: mysticFloat ${3 + Math.random() * 4}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
            pointer-events: none;
            opacity: 0.6;
          `;
          overlay.appendChild(particle);
        }
        
        // Container central
        const container = document.createElement('div');
        container.style.cssText = `
          background: rgba(0, 0, 0, 0.9);
          padding: 50px;
          border-radius: 30px;
          border: 5px solid #9d4edd;
          box-shadow: 0 0 60px #9d4edd, inset 0 0 40px rgba(157, 78, 221, 0.3);
          text-align: center;
          max-width: 90vw;
        `;
        
        // Titre mystique
        const title = document.createElement('div');
        title.innerHTML = '🔮 FORTUNE TELLER 🔮';
        title.style.cssText = `
          font-size: clamp(40px, 8vw, 70px);
          color: #e0aaff;
          font-family: 'Luckiest Guy', cursive;
          margin-bottom: 20px;
          animation: crystalGlow 2s ease-in-out infinite;
        `;
        container.appendChild(title);
        
        // Message mystique
        const message = document.createElement('div');
        message.innerHTML = '✨ THE CRYSTAL REVEALS 5 FUTURE SPAWNS ✨';
        message.style.cssText = `
          font-size: clamp(18px, 4vw, 28px);
          color: #c77dff;
          font-family: 'Luckiest Guy', cursive;
          margin-bottom: 30px;
          text-shadow: 0 0 20px #c77dff, 3px 3px 0 #000;
        `;
        container.appendChild(message);
        
        // Countdown crystal ball
        const countdown = document.createElement('div');
        countdown.id = 'fortuneCountdown';
        countdown.textContent = '3';
        countdown.style.cssText = `
          font-size: clamp(80px, 15vw, 140px);
          color: #FFD700;
          font-family: 'Luckiest Guy', cursive;
          margin: 30px 0;
          text-shadow: 
            0 0 40px #FFD700,
            0 0 80px #9d4edd,
            5px 5px 0 #000;
          animation: countdownSpin 1s ease-in-out;
        `;
        container.appendChild(countdown);
        
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        
        // Sélectionner et illuminer les trous
        const holes = Array.from(document.querySelectorAll('.hole'));
        const predictedHoles = [];
        
        // Sélectionner 5 trous aléatoires uniques
        const availableHoles = [...holes];
        for (let i = 0; i < 5 && availableHoles.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * availableHoles.length);
          const randomHole = availableHoles[randomIndex];
          availableHoles.splice(randomIndex, 1); // Éviter les doublons
          
          predictedHoles.push(randomHole);
          randomHole.style.animation = 'holePrediction 1s ease-in-out infinite';
          randomHole.style.border = '5px solid #e0aaff';
          randomHole.style.boxShadow = '0 0 30px #9d4edd, inset 0 0 30px #c77dff';
          
          // Numéro dans le trou
          const number = document.createElement('div');
          number.textContent = i + 1;
          number.className = 'fortune-number';
          number.style.cssText = `
            position: absolute;
            top: 5px;
            left: 5px;
            background: #9d4edd;
            color: #fff;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            font-weight: bold;
            font-family: 'Luckiest Guy', cursive;
            z-index: 10;
            box-shadow: 0 0 15px #9d4edd;
          `;
          randomHole.appendChild(number);
        }
        
        // Son mystique (Web Audio API)
        const playMysticSound = () => {
          try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            [523, 659, 784].forEach((freq, i) => {
              setTimeout(() => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.frequency.value = freq;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.8);
                osc.start(audioCtx.currentTime);
                osc.stop(audioCtx.currentTime + 0.8);
              }, i * 200);
            });
          } catch(e) {}
        };
        
        playMysticSound();
        
        // Countdown
        let count = 3;
        const countdownEl = document.getElementById('fortuneCountdown');
        
        const countInterval = setInterval(() => {
          count--;
          
          if (countdownEl) {
            if (count > 0) {
              countdownEl.textContent = count;
              countdownEl.style.animation = 'none';
              setTimeout(() => countdownEl.style.animation = 'countdownSpin 1s ease-in-out', 10);
              playMysticSound();
            } else {
              countdownEl.textContent = '🔮';
              countdownEl.style.animation = 'crystalGlow 0.5s ease-in-out infinite';
            }
          }
          
          if (count <= 0) {
            clearInterval(countInterval);
            
            // Disparition overlay
            setTimeout(() => {
              overlay.style.transition = 'opacity 0.5s';
              overlay.style.opacity = '0';
              
              setTimeout(() => {
                overlay.remove();
                style.remove();
                
                if (!wasPaused) {
                  isPaused = false;
                  window.gamePaused = false;
                }
                
                // 🔮 FINALITÉ: Redémarrer le spawning normal
                if (typeof window.startSpawning === 'function') {
                  setTimeout(() => window.startSpawning(), 100);
                }
                
                // Réinitialiser les trous après un court délai
                setTimeout(() => {
                  predictedHoles.forEach(hole => {
                    hole.style.animation = '';
                    hole.style.boxShadow = '';
                    hole.style.border = '';
                    const fortuneNum = hole.querySelector('.fortune-number');
                    if (fortuneNum) fortuneNum.remove();
                  });
                }, 200);
                
                // Spawner les oreilles prédites
                predictedHoles.forEach((hole, i) => {
                  setTimeout(() => {
                    const ear = hole.querySelector('.ear');
                    if (!ear.classList.contains('active')) {
                      ear.classList.add('active');
                      ear.textContent = '👂';
                      
                      // Flash prediction glow
                      hole.style.animation = 'holePrediction 0.3s ease-in-out 3';
                      setTimeout(() => hole.style.animation = '', 900);
                      
                      activeEarsCount++;
                      
                      // 🐛 FIX: Sauvegarder le spawnTime pour vérification
                      const fortuneSpawnTime = Date.now();
                      ear.dataset.spawnTime = fortuneSpawnTime;
                      ear.dataset.lifetime = getEarUpTime();
                      
                      setTimeout(() => {
                        // 🐛 FIX #1: Vérifier si nettoyé par mini-jeu
                        if (!ear.textContent || ear.textContent === '') {
                          return;
                        }
                        
                        // 🐛 FIX #2: Vérifier que c'est le même ear
                        const currentSpawnTime = parseInt(ear.dataset.spawnTime);
                        if (currentSpawnTime !== fortuneSpawnTime) {
                          return;
                        }
                        
                        // 🐛 FIX #3: Vérifier classList
                        if (!ear.classList.contains('active') || ear.classList.contains('power-up')) {
                          return;
                        }
                        
                        const symbol = ear.textContent;
                        
                        // 🐛 FIX #4: Re-vérifier textContent
                        if (!ear.textContent || ear.textContent === '') {
                          return;
                        }
                        
                        // Modifier l'ear
                        ear.classList.remove('active');
                        activeEarsCount--;
                        
                        // 🐛 FIX #5: Re-vérifier gamePaused + textContent + overlays
                        const wasGamePaused = window.gamePaused || isPaused;
                        
                        // Check si un overlay de mini-jeu existe
                        const anyMiniGameActive = 
                          document.getElementById('pachinkoOverlay') || 
                          document.getElementById('mysteryBoxOverlay') ||
                          document.getElementById('blackjackOverlay') ||
                          document.getElementById('bonneteauOverlay') ||
                          document.getElementById('memoryOverlay') ||
                          document.getElementById('hearingChestOverlay') ||  // FIX: bon nom !
                          document.getElementById('traderOverlay') ||
                          document.getElementById('grandpaOverlay') ||
                          document.getElementById('fortuneTellerOverlay') ||
                          document.getElementById('coinFlipOverlay');
                        
                        if (!ear.textContent || ear.textContent === '') {
                          return;
                        }
                        
                        // Compter miss seulement si pas en pause ET aucun mini-jeu
                        if (!wasGamePaused && !anyMiniGameActive && !invincibleMode && !(powerUpActive && powerUpActive.type === 'invincible' && Date.now() < powerUpActive.endTime)) {
                          streak++;
                          if (streak >= maxStreak) endGame();
                        }
                      }, getEarUpTime());
                    }
                  }, i * 2000);
                });
              }, 500);
            }, 500);
          }
        }, 1000);
      },
      
      '🌪️': () => {
        if (typeof MegaBonusEffects !== 'undefined') {
          MegaBonusEffects.tornado({score, level, updateUI, hitEar: hitEar.bind(this)});
        }
      },
      
      '🎰': () => {
        rumorBubble.textContent = "🎰 HEARING SLOTS! 🎰";
        if (typeof window.triggerHearingMachine === 'function') {
          setTimeout(() => window.triggerHearingMachine(), 500);
        } else if (typeof MegaBonusEffects !== 'undefined') {
          MegaBonusEffects.slotMachine({score, updateUI, addScore: (pts) => { score += pts; updateUI(); }});
        }
      },
      
      '🧲': () => {
        if (typeof MegaBonusEffects !== 'undefined') {
          MegaBonusEffects.magnet({hitEar, score, updateUI});
        }
      },
      
      /*
      '🌀': () => {
        if (typeof MegaBonusEffects !== 'undefined') {
          MegaBonusEffects.portal({spawnEar});
        }
      },
      */
      
      '🎭': () => {
        if (typeof MegaBonusEffects !== 'undefined') {
          MegaBonusEffects.mimic({score, updateUI});
        }
      },
      
      '🎪': () => {
        if (typeof MegaBonusEffects !== 'undefined') {
          MegaBonusEffects.circus({score, updateUI});
        }
      },
      
      '🦇': () => {
        if (typeof MegaBonusEffects !== 'undefined') {
          MegaBonusEffects.batSwarm({score, updateUI});
        }
      },
      
      '💣': () => {
        if (typeof MegaBonusEffects !== 'undefined') {
          MegaBonusEffects.mineField({score, updateUI});
        }
      },
      '🏴‍☠️': () => {
        rumorBubble.textContent = "🏴‍☠️ PIRATE TREASURE! 🏴‍☠️";
        vibrate([100, 50, 100, 50, 200]);
        if (typeof MiniGames !== 'undefined') {
          setTimeout(() => MiniGames.showTreasureChest({score, updateUI}), 500);
        } else { score += 200; updateUI(); }
      },

      '🎡': () => {
        rumorBubble.textContent = "🎡 ROULETTE! PLACE YOUR BETS! 🎡";
        vibrate([100, 50, 200]);
        if (typeof MiniGames !== 'undefined' && MiniGames.showRoulette) {
          setTimeout(() => MiniGames.showRoulette({score, updateUI, addScore: (pts) => { score += pts; updateUI(); }}), 500);
        } else { score += 100; updateUI(); }
      },

      '🎲': () => {
        rumorBubble.textContent = "🎲 CRAPS! ROLL THE DICE! 🎲";
        vibrate([100, 50, 150]);
        if (typeof MiniGames !== 'undefined' && MiniGames.showCraps) {
          setTimeout(() => MiniGames.showCraps({score, updateUI, addScore: (pts) => { score += pts; updateUI(); }}), 500);
        } else { score += 100; updateUI(); }
      },

      '🃏': () => {
        rumorBubble.textContent = "🃏 POKER! FIVE CARD DRAW! 🃏";
        vibrate([100, 50, 100, 50, 100]);
        if (typeof MiniGames !== 'undefined' && MiniGames.showCasinoPoker) {
          setTimeout(() => MiniGames.showCasinoPoker({score, updateUI, addScore: (pts) => { score += pts; updateUI(); }}), 500);
        } else { score += 100; updateUI(); }
      }
    };

    const action = bonusActions[symbol];
    if (action) {
      action();
      rumorBubble.classList.add("show");
      setTimeout(() => rumorBubble.classList.remove("show"), 1800);
      vibrate([100, 50, 150]);
    }

    if (Math.random() < 0.03 && symbol !== '💀') {
      setTimeout(triggerRugPull, 800);
    }
  }

  function endGame() {
    if (lives > 1) {
      lives--;
      
      clearInterval(gameInterval);
      isPaused = true;
      
      const continueOverlay = document.createElement('div');
      continueOverlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 99999;
      `;
      
      continueOverlay.innerHTML = `
        <div style="font-size: 60px; color: #ff0000; font-family: 'Luckiest Guy', cursive; margin-bottom: 20px;">☠️ YOU DIED! ☠️</div>
        <div style="font-size: 40px; color: #FFD700; margin-bottom: 30px;">❤️ ${lives} ${lives === 1 ? 'LIFE' : 'LIVES'} LEFT</div>
        <button id="continueBtn" style="
          font-size: 30px;
          padding: 20px 50px;
          background: #00ff00;
          color: #000;
          border: 5px solid #fff;
          border-radius: 15px;
          cursor: pointer;
          font-family: 'Luckiest Guy', cursive;
          margin: 10px;
          outline: none;
        ">✅ CONTINUE</button>
        <button id="giveUpBtn" style="
          font-size: 25px;
          padding: 15px 40px;
          background: #ff0000;
          color: #fff;
          border: 3px solid #fff;
          border-radius: 10px;
          cursor: pointer;
          font-family: 'Luckiest Guy', cursive;
          margin: 10px;
        ">❌ GIVE UP</button>
      `;
      
      document.body.appendChild(continueOverlay);
      
      setTimeout(() => {
        const continueBtn = document.getElementById('continueBtn');
        const giveUpBtn = document.getElementById('giveUpBtn');
        
        if (continueBtn) {
          continueBtn.addEventListener('click', () => {
            continueOverlay.remove();
            
            streak = 0;
            isPaused = false;
            updateUI();
            startSpawning();
          });
        }
        
        if (giveUpBtn) {
          giveUpBtn.addEventListener('click', () => {
            continueOverlay.remove();
            actuallyEndGame();
          });
        }
      }, 100);
      
      return; // Don't actually end game yet
    }
    
    actuallyEndGame();
  }
  
  function actuallyEndGame() {
    clearInterval(gameInterval);
    isPaused = true;
    
    if (typeof SoundSystem !== 'undefined') {
      SoundSystem.gameOver();
    }

    if (window.gameIntervals) {
      clearInterval(window.gameIntervals.powerUpInterval);
      clearInterval(window.gameIntervals.eventsInterval);
      window.gameIntervals = null;
    }
    
    finalScoreEl.textContent = Math.round(score);
    finalHighScoreEl.textContent = formatNumber(highScore);
    finalComboEl.textContent = `x${(combo + permanentComboBonus).toFixed(1)}`;
    finalMissesEl.textContent = `${streak}/${maxStreak}`;
    
    // Store the level at game over for accurate display
    gameOverLevel = level;
    finalLevelEl.textContent = `LEVEL ${gameOverLevel}`;
    
    // 🔥 CRITICAL: Afficher le game over screen AVANT tout le reste
    gameOverScreen.style.display = "flex";
    
    const nameInputSection = document.getElementById('nameInputSection');
    const submitScoreBtn = document.getElementById('submitScoreBtn');
    const playerNameInput = document.getElementById('playerNameInput');
    
    nameInputSection.style.display = 'block';
    
    // 💎 V7: Convert score to ears currency (APRÈS game over display)
    try {
      if (typeof MetaGameSystem !== 'undefined' && window.convertScoreToEars) {
        const earnedEars = window.convertScoreToEars(score);
        
        // Show notification
        if (earnedEars > 0) {
          const earNotif = document.createElement('div');
          earNotif.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(145deg, #FFD700, #FFA000);
            color: #000;
            font-family: 'Luckiest Guy', cursive;
            font-size: 24px;
            padding: 20px 30px;
            border-radius: 15px;
            z-index: 100001;
            box-shadow: 0 0 40px rgba(255, 215, 0, 0.6);
            animation: slideInRight 0.5s, slideOutRight 0.5s 3s;
          `;
          earNotif.textContent = `+${earnedEars} 👂 EARS EARNED!`;
          document.body.appendChild(earNotif);
          setTimeout(() => earNotif.remove(), 3500);
        }
      }
      
      // 📊 V7: Track session stats
      if (typeof MetaGameSystem !== 'undefined') {
        const gamesPlayed = parseInt(localStorage.getItem('stats_games_played') || 0) + 1;
        const highestLevel = Math.max(parseInt(localStorage.getItem('stats_highest_level') || 1), level);
        const longestCombo = Math.max(parseInt(localStorage.getItem('stats_longest_combo') || 1), Math.floor(combo));
        const totalEars = (parseInt(localStorage.getItem('stats_total_ears') || 0)) + 1;
        const totalPoints = (parseInt(localStorage.getItem('stats_total_points') || 0)) + Math.round(score);
        
        localStorage.setItem('stats_games_played', gamesPlayed);
        localStorage.setItem('stats_highest_level', highestLevel);
        localStorage.setItem('stats_longest_combo', longestCombo);
        localStorage.setItem('stats_total_ears', totalEars);
        localStorage.setItem('stats_total_points', totalPoints);
        
        // Check score achievements
        MetaGameSystem.checkAchievement('big_earner', Math.round(score));
        MetaGameSystem.checkAchievement('millionaire', Math.round(score));
      }
    } catch (error) {
      console.error('MetaGameSystem error:', error);
      // Game over screen already displayed, so this is non-critical
    }
    
    submitScoreBtn.onclick = async () => {
      const playerName = playerNameInput.value.trim();
      
      if (!playerName) {
        alert('Please enter your name!');
        return;
      }
      
      submitScoreBtn.disabled = true;
      submitScoreBtn.textContent = 'SAVING... ⏳';
      
      const success = await saveScore(playerName, Math.round(score));
      
      if (success) {
        submitScoreBtn.textContent = 'SAVED! ✅';
        setTimeout(() => {
          nameInputSection.style.display = 'none';
        }, 1500);
      } else {
        submitScoreBtn.textContent = 'SAVE SCORE 💾';
        submitScoreBtn.disabled = false;
        alert('Error saving score. Please try again.');
      }
    };
    
    if (soundtrack) {
      soundtrack.pause();
      soundtrack.currentTime = 0;
    }
  }

  document.querySelectorAll(".hole").forEach(hole => {
    hole.addEventListener("click", () => {
      // 🐛 FIX: Vérifier AUSSI gamePaused (pas juste isPaused)
      if (isPaused || window.gamePaused) return;
      
      if (powerUpActive && powerUpActive.type === 'reverse' && Date.now() < powerUpActive.endTime) {
        const ear = hole.querySelector(".ear");
        if (ear && ear.classList.contains("active")) {
          streak++;
          combo = 1;
          rumorBubble.textContent = "REVERSE MISS! 🤡";
          rumorBubble.classList.add("show");
          setTimeout(() => rumorBubble.classList.remove("show"), 1000);
          if (streak >= maxStreak) endGame();
        } else {
          const activeEars = Array.from(document.querySelectorAll(".ear.active"));
          if (activeEars.length > 0) {
            const randomEar = activeEars[randomInt(0, activeEars.length - 1)];
            hitEar(randomEar);
            rumorBubble.textContent = "REVERSE HIT! 🤡";
            rumorBubble.classList.add("show");
            setTimeout(() => rumorBubble.classList.remove("show"), 1000);
          }
        }
      } else {
        hitEar(hole.querySelector(".ear"));
      }
    });
  });

  startBtn.addEventListener("click", startGame);
  tryAgainBtn.addEventListener("click", startGame);
  closeGameBtn.addEventListener("click", closeGameOverlay);
  gameTrigger.addEventListener("click", openGameOverlay);
  
  if (exitGameBtn) {
    exitGameBtn.addEventListener("click", () => {
      gameOverScreen.style.display = "none";
      closeGameOverlay();
    });
  }

  shareBtn.addEventListener("click", () => {
    const messages = [
      `Just whacked ${Math.round(score)} RUMORS! 👂💀🔥\n\nLevel ${gameOverLevel} | Combo x${(combo + permanentComboBonus).toFixed(1)}\n\n@hearingmeme game is TOO ADDICTIVE!\n\nBeat my score:\nhttps://hearingthings.meme/\n\n#HEARING #Solana`,
      
      `Absolutely DEMOLISHED ${Math.round(score)} rumors! 💎⚡\n\nLevel ${gameOverLevel} (${levelNames[gameOverLevel-1] || 'ULTIMATE'})\n\n@hearingmeme is pure chaos! 🔥\n\nYour turn:\nhttps://hearingthings.meme/\n\n#HEARING #DegenGaming`,
      
      `BIG IF TRUE: Just scored ${Math.round(score)} on @hearingmeme! 👂🚀\n\nLevel ${gameOverLevel} | High Score: ${formatNumber(highScore)}\n\nCan you beat me?\nhttps://hearingthings.meme/\n\n#HEARING #Solana #Crypto`,
      
      `I've been HEARING THINGS... 👂💀\n\nAnd whacking them into oblivion!\n\nScore: ${Math.round(score)} | Level ${gameOverLevel}\n\n@hearingmeme\nhttps://hearingthings.meme/\n\n#HEARING #MemeGaming`,
      
      `SAW IT ON BIZ: @hearingmeme's game is INSANE! 🎮💥\n\nJust hit ${Math.round(score)} points, level ${gameOverLevel}!\n\nPlay now:\nhttps://hearingthings.meme/\n\n#HEARING #Solana #Degen`
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(randomMessage)}`, "_blank");
  });

  if (muteBtn) {
    muteBtn.addEventListener("click", () => {
      isMuted = !isMuted;
      if (isMuted) {
        if (soundtrack) soundtrack.pause();
        muteBtn.textContent = "🔇";
      } else {
        if (soundtrack && gameOverScreen.style.display !== "flex" && startBtn.style.display === "none") {
          soundtrack.play().catch(() => {});
        }
        muteBtn.textContent = "🔊";
      }
    });
  }

  if (howToPlayBtn) {
    howToPlayBtn.addEventListener("click", () => {
      howToPlayModal.classList.add("active");
    });
  }

  if (closeHowToPlay) {
    closeHowToPlay.addEventListener("click", () => {
      howToPlayModal.classList.remove("active");
    });
  }

  if (howToPlayModal) {
    howToPlayModal.addEventListener("click", (e) => {
      if (e.target === howToPlayModal) {
        howToPlayModal.classList.remove("active");
      }
    });
  }

  function updateMagnetMode() {
    if (!magnetMode) return;
    
    const ears = document.querySelectorAll('.ear.active');
    ears.forEach(ear => {
      const rect = ear.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const dx = window.mouseX - centerX;
      const dy = window.mouseY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 200) {
        const force = (200 - distance) / 200;
        ear.style.transform = `translate(${dx * force * 0.3}px, ${dy * force * 0.3}px) scale(${1 + force * 0.2})`;
      } else {
        ear.style.transform = '';
      }
    });
    
    if (magnetMode) {
      requestAnimationFrame(updateMagnetMode);
    }
  }

  window.mouseX = 0;
  window.mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    window.mouseX = e.clientX;
    window.mouseY = e.clientY;
  });

  // Export startGame function globally for retry button
  window.startGame = startGame;

  highScoreEl.textContent = formatNumber(highScore);
  if (currentLevelEl) currentLevelEl.textContent = ` ${level}`;
});