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
  let nextLevelScore = 600; // Absolute per-level targets
  let gameInterval = null;
  let activeEarsCount = 0;
  let powerUpActive = null;
  let _particleCount = 0; // 🏎️ Global particle limiter
  const MAX_PARTICLES = window.innerWidth < 768 ? 12 : 20;
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
  const maxLevels = 75;
  const maxSimultaneousEars = 4;

  let pointMultiplier = 1;
  let magnetMode = false;
  let invincibleMode = false;

  // 🎯 SYSTÈME 2-TIERS POUR BONUS (V6)
  const regularBonuses = [
    '🐶', '🚀', '💎', '🤑', '🔥', '💀', '🕵️‍♂️', '🤡', '⚡', '💊', 
    '❄️', '🌙', '☄️', '🎯', '🎲', '🍀', '⭐', '🦻', '📺',
    '💩', '💉', '🥫', '🛡️'  // Crypto troll | Syringe life | Pause can | Shield
  ];
  
  const megaBonuses = [
    '🌪️', '🎰', '🧲', '🔮', '🎭', '🎪', '🦇',
    '🦄'  // UniSwap LSD overlay
  ];
  
  const minigameBonuses = [
    '🥤', '🧠', '🎈'
  ];
  
  const rareBonuses = [
    '🏴‍☠️', '🪙', '🎡', '🎲', '🃏', '📈'  // Treasure Chest + Coin Flip + Casino + Trader
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
    // 1-10: Learning
    "NO SIGNAL", "STATIC", "LOW VOLUME", "FIRST PING", "MISS HEARD",
    "AUDIO LAG", "ECHO", "RUMOR SEED", "SIGNAL DRIFT", "NOISE",
    // 11-20: Warming up
    "FALSE PATTERN", "DATA COPE", "LOOPED", "OVERHEARD", "HEARING CHECK",
    "MENTAL LAG", "FOCUS MODE", "PATTERNED", "BRAIN HEAT", "RUMOR CORE",
    // 21-30: Getting dangerous
    "BONK REFLEX", "DEGEN MODE", "HYPER FOCUS", "SOUND COLLAPSE", "DEATH ZONE",
    "SIGNAL BREAK", "HEARING RUSH", "PERCEPTION", "RUMOR GOD", "CHAOS STATE",
    // 31-40: Deep end
    "TOTAL NOISE", "MATRIX", "ENLIGHTENED", "TRANSCENDED", "OMNISCIENT",
    "BEYOND", "QUANTUM", "SINGULARITY", "INFINITE", "COSMIC",
    // 41-50: Legendary tier
    "GODLIKE", "ETHEREAL", "LEGENDARY", "MYTHICAL", "DIVINE",
    "ULTIMATE", "ASCENDED", "WARLORD", "APEX PREDATOR", "HEAR DEATH",
    // 51-60: Nightmare tier
    "TINNITUS", "SCHIZO MODE", "TERMINAL", "CORRUPTED", "VOID WALKER",
    "NULL POINTER", "STACK OVERFLOW", "KERNEL PANIC", "SYSTEM FAILURE", "404 SANITY",
    // 61-70: God tier
    "BASILISK", "EIGENGRAU", "COGNITOHAZARD", "BASILISK II", "MEMETIC KILL",
    "INFOHAZARD", "ROKO WAKER", "MIND BREAKER", "TRUTH SEEKER", "FINAL HEARING",
    // 71-75: The End
    "OMEGA", "OMEGA II", "OMEGA III", "OMEGA IV", "OMEGA FINAL"
  ];

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getSpawnInterval() {
    // Ultra-hard tiers
    if (level >= 60) return Math.max(500, 1000 - (level - 60) * 20); // 500ms at 75
    if (level >= 50) return Math.max(600, 1100 - (level - 50) * 10); // 600ms at 60
    if (level >= 40) return Math.max(700, 1200 - (level - 40) * 10); // 700ms at 50
    if (level >= 30) return Math.max(750, 1300 - (level - 30) * 10); // 750ms at 40
    if (level <= 5) {
      return Math.max(1800 - level * 80, 1200);
    }
    if (level <= 15) {
      return Math.max(1200 - level * 40, 600);
    }
    // Level 16-20: keep playable
    if (level <= 20) {
      return Math.max(900 - level * 15, 650);
    }
    // Level 21+: gentle curve, floor at 700ms for comfort
    let base = Math.max(1200 - level * 10, 700);
    if (powerUpActive && powerUpActive.type === 'speed') {
      base = Math.max(400, base * 0.6);
    }
    return base;
  }

  function getEarUpTime() {
    // High-level tiers — gets harder from 30+
    if (level >= 65) return Math.max(700, 1100 - (level - 65) * 15) + randomInt(0, 150);
    if (level >= 55) return Math.max(800, 1400 - (level - 55) * 30) + randomInt(0, 200);
    if (level >= 45) return Math.max(900, 1700 - (level - 45) * 30) + randomInt(0, 200);
    if (level >= 35) return Math.max(1000, 2000 - (level - 35) * 30) + randomInt(0, 250);
    if (level <= 5) {
      return Math.max(3000 - level * 80, 2200) + randomInt(0, 500);
    }
    if (level <= 15) {
      return Math.max(2200 - level * 60, 1200) + randomInt(0, 400);
    }
    if (level <= 20) {
      return Math.max(1800 - level * 30, 1200) + randomInt(0, 300);
    }
    // Level 21-35
    return Math.max(1400, 2400 - level * 20) + randomInt(0, 400);
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
    // Track games for achievements
    if (typeof MetaGame !== 'undefined') {
      MetaGame.data.stats.totalGamesPlayed = (MetaGame.data.stats.totalGamesPlayed || 0) + 1;
      MetaGame.checkAchievement('three_games', MetaGame.data.stats);
    }
    lives = 1; // Reset to 1 life
    permanentComboBonus = 0;
    starsThisLevel = 1;
    nextLevelScore = 600;
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
    if (isNaN(score)) score = 0; // 🐛 NaN guard
    const prevScore = parseInt(scoreEl.textContent) || 0;
    window.score = score;        // 🐛 Keep window.score in sync
    scoreEl.textContent = Math.round(score);
    // Convert score to 👂 meta-currency every 250 pts milestone (silently)
    if (typeof MetaGame !== 'undefined') {
      const milestone = Math.floor(score / 250);
      const prevMilestone = Math.floor(prevScore / 250);
      if (milestone > prevMilestone && score > 0) {
        const earGain = window._doubleEars ? 2 : 1;
        MetaGame.data.currencies.ears = (MetaGame.data.currencies.ears || 0) + earGain;
        MetaGame.updateEarsBadge();
        MetaGame.save();
      }
    }
    // Flash score on increase so early levels feel alive
    if (Math.round(score) > prevScore) {
      scoreEl.style.transform = 'scale(1.3)';
      scoreEl.style.color = '#00ff88';
      scoreEl.style.transition = 'transform 0.15s,color 0.15s';
      setTimeout(() => {
        scoreEl.style.transform = '';
        scoreEl.style.color = '';
      }, 150);
    }
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
    
    const rainCount = window.innerWidth < 768 ? 8 : 15;
    for (let i = 0; i < rainCount; i++) {
      const e = document.createElement('div');
      e.textContent = emojis[randomInt(0, emojis.length-1)];
      e.style.cssText = `position:fixed;left:${randomInt(10,90)}%;top:-10%;
        font-size:${1.5+Math.random()*2}rem;pointer-events:none;z-index:10002;
        will-change:transform;animation:rainFall ${1.2+Math.random()*1.5}s linear forwards;`;
      document.body.appendChild(e);
      setTimeout(() => e.remove(), 2800);
    }
  }

  function spiralConfetti() {
    const emojis = ['👂','💀','🚀','💲','✨','🔥','⚡','🐶'];
    const count = window.innerWidth < 768 ? 8 : 12;
    for (let i = 0; i < count; i++) {
      const e = document.createElement('div');
      e.textContent = emojis[randomInt(0, emojis.length-1)];
      e.style.cssText = `position:fixed;left:50%;top:50%;
        font-size:${2+Math.random()*2.5}rem;pointer-events:none;z-index:10001;
        will-change:transform;transform:translate(-50%,-50%);
        animation:spiralOut ${1.5+Math.random()*0.8}s cubic-bezier(0.22,0.61,0.36,1) forwards;`;
      e.style.setProperty('--angle', `${randomInt(-720,720)}deg`);
      document.body.appendChild(e);
      setTimeout(() => e.remove(), 2500);
    }
  }

  function triggerMiniBoss(bossLevel) {
    window.gamePaused = true; setPaused(true); clearInterval(gameInterval);
    if (typeof SoundSystem !== 'undefined') SoundSystem.boss();
    
    const bossData = {
      10: { name: 'RUMOR SPREADER', emoji: '🗣️', hp: 8,  reward: 500,   color: '#ff6600' },  // Easy intro
      20: { name: 'ECHO DEMON',     emoji: '👻', hp: 14, reward: 1000,  color: '#00ffff' },  // Getting real
      30: { name: 'SIGNAL GHOST',   emoji: '📡', hp: 22, reward: 2000,  color: '#ff00ff' },  // Tight time
      40: { name: 'NOISE LORD',     emoji: '📢', hp: 30, reward: 3500,  color: '#FFD700' },  // Fast fingers needed
      50: { name: 'TINNITUS KING',  emoji: '🔊', hp: 40, reward: 5000,  color: '#ff0000' },  // Intense
      60: { name: 'VOID HERALD',    emoji: '🌑', hp: 55, reward: 8000,  color: '#9400d3' },  // Brutal
      70: { name: 'OMEGA HERALD',   emoji: '👁️', hp: 75, reward: 15000, color: '#00ff88' },  // Final test
    };
    const boss = bossData[bossLevel] || { name: 'BOSS', emoji: '💀', hp: 20, reward: 2000, color: '#ff0000' };
    
    let bossHp = boss.hp;
    const overlay = document.createElement('div');
    overlay.id = 'bossOverlay';
    overlay.style.cssText = `position:fixed;inset:0;background:radial-gradient(ellipse at center,rgba(40,0,0,0.97),rgba(0,0,0,0.99));
      z-index:100010;display:flex;flex-direction:column;align-items:center;justify-content:center;
      font-family:'Luckiest Guy',cursive;text-align:center;animation:fadeIn 0.3s;`;
    
    const updateBossUI = () => {
      const pct = Math.max(0, bossHp / boss.hp * 100);
      overlay.querySelector('#bossHpBar').style.width = pct + '%';
      overlay.querySelector('#bossHpBar').style.background = pct > 50 ? boss.color : pct > 25 ? '#ff8800' : '#ff0000';
      overlay.querySelector('#bossHpText').textContent = bossHp + ' / ' + boss.hp;
      overlay.querySelector('#bossEmoji').textContent = bossHp <= 0 ? '💥' : boss.emoji;
    };
    
    // Boss scales: faster time + more HP each tier
    const bossTier = Math.floor(bossLevel / 10); // 1-7
    const bossTimeLimit = Math.max(8, 28 - bossTier * 3); // 25s → 8s
    let bossTimeLeft = bossTimeLimit;
    let bossTimerInterval; // Declared early for cross-reference

    overlay.innerHTML = `
      <div style="font-size:clamp(18px,4vw,26px);color:#ff0000;letter-spacing:3px;margin-bottom:6px;animation:pulse 0.5s ease-in-out infinite">⚠️ MINI BOSS ⚠️</div>
      <div id="bossEmoji" style="font-size:clamp(60px,15vw,100px);margin:6px 0;filter:drop-shadow(0 0 30px ${boss.color})">${boss.emoji}</div>
      <div style="font-size:clamp(20px,4.5vw,36px);color:${boss.color};text-shadow:0 0 30px ${boss.color},3px 3px 0 #000;margin-bottom:10px">${boss.name}</div>
      
      <!-- HP Bar -->
      <div style="width:min(320px,82vw);height:18px;background:#111;border:2px solid ${boss.color};border-radius:9px;overflow:hidden;margin-bottom:4px">
        <div id="bossHpBar" style="height:100%;width:100%;background:${boss.color};border-radius:7px;transition:width 0.15s,background 0.2s"></div>
      </div>
      <div id="bossHpText" style="font-size:clamp(13px,2.5vw,16px);color:#aaa;margin-bottom:10px">${boss.hp} HP</div>
      
      <!-- Timer Bar -->
      <div style="width:min(320px,82vw);height:10px;background:#111;border:2px solid #ff4444;border-radius:5px;overflow:hidden;margin-bottom:4px">
        <div id="bossTimerBar" style="height:100%;width:100%;background:linear-gradient(90deg,#ff0000,#ff8800);border-radius:3px;transition:width 0.1s linear"></div>
      </div>
      <div id="bossTimerText" style="font-size:clamp(14px,3vw,20px);color:#ff4444;font-family:'Luckiest Guy',cursive;margin-bottom:12px">⏱ ${bossTimeLimit}s</div>
      
      <div style="font-size:clamp(14px,3vw,20px);color:#fff;margin-bottom:10px">TAP FAST TO DEFEAT!</div>
      <div id="bossTarget" style="font-size:clamp(70px,18vw,120px);cursor:pointer;
        filter:drop-shadow(0 0 20px ${boss.color});transition:transform 0.1s;
        animation:bossBounce 0.6s ease-in-out infinite;user-select:none">${boss.emoji}</div>
      <div style="font-size:clamp(11px,2.5vw,15px);color:#555;margin-top:10px">REWARD: +${boss.reward} 👂 — FAIL: -1 LIFE</div>
    `;
    
    // Boss bounce animation
    const style = document.createElement('style');
    style.textContent = '@keyframes bossBounce{0%,100%{transform:scale(1) rotate(-3deg)}50%{transform:scale(1.1) rotate(3deg)}}';
    document.head.appendChild(style);
    document.body.appendChild(overlay);
    
    const bossTarget = overlay.querySelector('#bossTarget');
    bossTarget.addEventListener('click', () => {
      bossHp -= 1;
      bossTarget.style.transform = 'scale(0.85)';
      setTimeout(() => bossTarget.style.transform = '', 100);
      if (typeof SoundSystem !== 'undefined') SoundSystem.hit(bossHp % 5);
      updateBossUI();
      if (bossHp <= 0) {
        score += boss.reward;
        clearInterval(bossTimerInterval); // Stop timer on boss defeat
        overlay.querySelector('#bossTarget').style.display = 'none';
        setTimeout(() => {
          overlay.remove(); if (style.parentNode) style.remove();
          window.gamePaused = false; setPaused(false); startSpawning();
          const win = document.createElement('div');
          win.innerHTML = `💥 BOSS DEFEATED! +${boss.reward} 👂!`;
          win.style.cssText = `position:fixed;top:20%;left:50%;transform:translateX(-50%);
            font-family:'Luckiest Guy',cursive;font-size:clamp(22px,5vw,36px);
            color:#FFD700;text-shadow:0 0 30px #FFD700,3px 3px 0 #000;z-index:100020;pointer-events:none;`;
          document.body.appendChild(win);
          setTimeout(() => win.remove(), 3000);
          updateUI(); rainEmojis('special');
          // Continue normal level-up flow
          if (levelHits >= 35) starsThisLevel++;
          if (levelMisses === 0) starsThisLevel = Math.min(3, starsThisLevel + 1);
          if (starsThisLevel === 3) { permanentComboBonus += 0.15; score += 500; }
          nextLevelScore = getLevelScoreTarget(level + 1);
          if (typeof MetaGameSystem !== 'undefined') { MetaGameSystem.checkAchievement('level_10', level); MetaGameSystem.checkAchievement('level_25', level); }
          levelHits = 0; levelMisses = 0; starsThisLevel = 1;
        }, 800);
      }
    });
    
    // Touch support for mobile
    bossTarget.addEventListener('touchstart', (e) => { e.preventDefault(); bossTarget.click(); }, { passive: false });
    
    // Boss timer countdown
    bossTimerInterval = setInterval(() => {
      if (!document.getElementById('bossOverlay')) { clearInterval(bossTimerInterval); return; }
      bossTimeLeft--;
      const pct = (bossTimeLeft / bossTimeLimit) * 100;
      const timerBar = document.getElementById('bossTimerBar');
      const timerText = document.getElementById('bossTimerText');
      if (timerBar) {
        timerBar.style.width = pct + '%';
        timerBar.style.background = pct > 50
          ? 'linear-gradient(90deg,#ff0000,#ff8800)'
          : pct > 25 ? 'linear-gradient(90deg,#ff0000,#ff4400)' : '#ff0000';
      }
      if (timerText) timerText.textContent = `⏱ ${Math.max(0, bossTimeLeft)}s`;
      
      if (bossTimeLeft <= 5 && typeof SoundSystem !== 'undefined') {
        SoundSystem._play(880, 0.08, 'square', 0.3); // Urgent beep
      }
      
      if (bossTimeLeft <= 0) {
        clearInterval(bossTimerInterval);
        // BOSS WINS — player loses a life
        overlay.remove(); if (style.parentNode) style.remove();
        lives = Math.max(0, lives - 1);
        window.gamePaused = false; setPaused(false);
        if (typeof SoundSystem !== 'undefined') SoundSystem.miss();
        const failMsg = document.createElement('div');
        failMsg.innerHTML = `${boss.emoji} BOSS ESCAPED! -1 LIFE!`;
        failMsg.style.cssText = `position:fixed;top:25%;left:50%;transform:translateX(-50%);
          font-family:'Luckiest Guy',cursive;font-size:clamp(20px,4.5vw,36px);
          color:#ff0000;text-shadow:0 0 25px #ff0000,3px 3px 0 #000;z-index:100020;pointer-events:none;`;
        document.body.appendChild(failMsg);
        setTimeout(() => failMsg.remove(), 2000);
        updateUI();
        if (lives <= 0) { setTimeout(() => actuallyEndGame(), 500); return; }
        // Still do level progression even on boss fail
        if (levelHits >= 35) starsThisLevel++;
        nextLevelScore = getLevelScoreTarget(level + 1);
        levelHits = 0; levelMisses = 0; starsThisLevel = 1;
        startSpawning();
      }
    }, 1000);
    
    // Timer is cleared directly in the bossHp <= 0 branch above
  }

  function showVictoryScreen() {
    window.gamePaused = true; setPaused(true); clearInterval(gameInterval);
    if (typeof SoundSystem !== 'undefined') SoundSystem.victory();
    const v = document.createElement('div');
    v.style.cssText = `position:fixed;inset:0;background:radial-gradient(ellipse at center,#1a0040,#000);
      z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;
      font-family:'Luckiest Guy',cursive;text-align:center;animation:fadeIn 0.5s;`;
    v.innerHTML = `
      <div style="font-size:clamp(60px,15vw,120px);animation:spin 2s linear infinite;line-height:1">👂</div>
      <div style="font-size:clamp(32px,7vw,64px);color:#FFD700;text-shadow:0 0 40px #FFD700,4px 4px 0 #000;margin:16px 0;animation:pulse 1s ease-in-out infinite">
        OMEGA ACHIEVED!
      </div>
      <div style="font-size:clamp(16px,3.5vw,24px);color:#00ff88;margin-bottom:8px">
        YOU BEAT ALL 75 LEVELS
      </div>
      <div style="font-size:clamp(14px,3vw,20px);color:#aaa;margin-bottom:24px">
        Score: ${Math.round(score).toLocaleString()} 👂
      </div>
      <div style="font-size:clamp(20px,4vw,32px);color:#ff00ff;text-shadow:0 0 20px #ff00ff;margin-bottom:20px">
        YOU ARE THE HEARING THINGS
      </div>
      <button id="victoryPrestige" style="font-family:'Luckiest Guy',cursive;font-size:clamp(16px,3.5vw,22px);
        background:linear-gradient(135deg,#9400d3,#ff00ff);color:#fff;border:none;border-radius:16px;
        padding:14px 32px;cursor:pointer;margin:6px;box-shadow:0 0 30px rgba(180,0,255,0.5)">
        ⭐ PRESTIGE NOW
      </button>
      <button id="victoryKeepPlaying" style="font-family:'Luckiest Guy',cursive;font-size:clamp(16px,3.5vw,22px);
        background:linear-gradient(135deg,#FF8C00,#FFD700);color:#000;border:none;border-radius:16px;
        padding:14px 32px;cursor:pointer;margin:6px">
        🔥 KEEP GRINDING
      </button>
    `;
    document.body.appendChild(v);
    // Rain confetti
    if (typeof rainEmojis !== 'undefined') { rainEmojis('special'); setTimeout(() => rainEmojis('special'), 800); }
    document.getElementById('victoryKeepPlaying').onclick = () => {
      v.remove(); window.gamePaused = false; setPaused(false); startSpawning();
    };
    document.getElementById('victoryPrestige').onclick = () => {
      v.remove();
      if (typeof MetaGame !== 'undefined') MetaGame.show();
      window.gamePaused = false; setPaused(false);
    };
  }

  function showLevelUp() {
    // Perfect level achievement (no misses this level)
    if (levelMisses === 0 && level > 1 && typeof MetaGameSystem !== 'undefined') MetaGameSystem.checkAchievement('perfect_game', level);
    // Hot start: reach level 5 with under 3 misses total
    if (level === 5 && streak < 3 && typeof MetaGameSystem !== 'undefined') MetaGameSystem.checkAchievement('hot_start', level);
    // Survivor: cleared a level with exactly 1 life
    if (lives === 1 && typeof MetaGame !== 'undefined') {
      MetaGame.data.stats = MetaGame.data.stats || {};
      MetaGame.data.stats.wonWith1Life = true;
      try { MetaGame.checkAchievements({...MetaGame.data.stats, levelReached: level, currentScore: Math.round(score)}); } catch(e) {}
    }
    // Immortal: reached level 20 with no lives lost
    if (level >= 20 && typeof MetaGame !== 'undefined') {
      MetaGame.data.stats = MetaGame.data.stats || {};
      const livesLost = MetaGame.data.stats.livesUsed || 0;
      if (livesLost === 0) try { MetaGame.checkAchievements({levelReached: level, livesUsed: 0, currentScore: Math.round(score)}); } catch(e) {}
    }
    levelMisses = 0; levelHits = 0;
    if (isPaused) return;
    setPaused(true);
    window.gamePaused = true; // CRITICAL: Prevent spawning during overlay
    clearInterval(gameInterval);
    
    if (typeof SoundSystem !== 'undefined') {
      SoundSystem.levelUp();
    }
    
    // Mini-boss every 10 levels - fires even if level is skipped
    const expectedBossTier = Math.floor(level / 10);
    const lastBossTier = Math.floor(lastBossLevelTriggered / 10);
    if (expectedBossTier > lastBossTier && level >= 10 && level < maxLevels) {
      const bossLvl = expectedBossTier * 10; // e.g. 10, 20, 30...
      lastBossLevelTriggered = bossLvl;
      setTimeout(() => triggerMiniBoss(bossLvl), 600);
      return; // Mini-boss handles resume
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
    // Progressive difficulty visual cues
    if (level >= 35) {
      // Flicker effect increases
      document.documentElement.style.setProperty('--glitch-intensity', Math.min(1, (level - 35) / 20) + '');
    }

    // 🏆 Achievement checks on level up
    if (typeof MetaGameSystem !== 'undefined') {
      MetaGameSystem.checkAchievement('level_10', level);
      MetaGameSystem.checkAchievement('level_25', level);
      MetaGameSystem.checkAchievement('level_50', level);
    }
    // Score milestones
    if (score >= 500 && typeof MetaGameSystem !== 'undefined') MetaGameSystem.checkAchievement('score_500', score);
    if (score >= 10000 && typeof MetaGameSystem !== 'undefined') MetaGameSystem.checkAchievement('score_10k', score);
    if (score >= 100000 && typeof MetaGameSystem !== 'undefined') MetaGameSystem.checkAchievement('score_100k', score);
    // Speed demon: level 5 in under 3 minutes
    if (level >= 5 && window._hotStartMs && !window._speedDemonDone) {
      window._speedDemonDone = true;
      if (Date.now() - window._hotStartMs < 180000) {
        if (typeof MetaGameSystem !== 'undefined') MetaGameSystem.checkAchievement('speed_demon', level);
      }
    }
    
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
    
    const pCount = window.innerWidth < 768 ? 4 : 8;
    for (let i = 0; i < pCount; i++) {
      const particle = document.createElement('div');
      particle.textContent = ['⭐','🎉','💫','✨','🔥'][Math.floor(Math.random()*5)];
      particle.style.cssText = `position:fixed;font-size:${18+Math.random()*22}px;
        left:${Math.random()*100}%;top:-50px;z-index:10001;pointer-events:none;
        will-change:transform;animation:confettiFall ${2+Math.random()*1.5}s linear forwards;`;
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
      // Absolute score table - no compounding
      nextLevelScore = getLevelScoreTarget(level + 1);
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
      
      // 📈 HEARING TRADER — triggered by 📈 ear click (see handleBonus)
      
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
        // Level 3: spawn one 🦄 ear so player can test uniswap
        if (level === 3 && !window._unicornSpawned) {
          window._unicornSpawned = true;
          setTimeout(() => {
            const holes = Array.from(document.querySelectorAll('.hole'));
            const free = holes.filter(h => !h.querySelector('.ear').classList.contains('active'));
            if (free.length > 0) {
              const ear = free[0].querySelector('.ear');
              ear.textContent = '🦄';
              ear.classList.add('active');
              activeEarsCount++;
            }
          }, 600);
        }
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
    // Update daily streak
    if (typeof MetaGame !== 'undefined' && MetaGame.checkAndUpdateStreak) {
      MetaGame.checkAndUpdateStreak();
    }
    // Apply prestige multiplier
    if (typeof MetaGame !== 'undefined' && MetaGame.data && MetaGame.data.prestige && MetaGame.data.prestige.multiplier > 1) {
      pointMultiplier = MetaGame.data.prestige.multiplier;
    }
    // Shop perks applied in actuallyStartGame() after variable reset
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
          animation: titleGlowGame 2s ease-in-out infinite;
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
          <span style="display:inline-block;animation: earPop 1s ease-in-out infinite;">👂</span>
          <span style="display:inline-block;animation: earPop 1s ease-in-out infinite; animation-delay: 0.2s;">🦻</span>
          <span style="display:inline-block;animation: earPop 1s ease-in-out infinite; animation-delay: 0.4s;">👂</span>
          <span style="display:inline-block;animation: earPop 1s ease-in-out infinite; animation-delay: 0.6s;">🦻</span>
          <span style="display:inline-block;animation: earPop 1s ease-in-out infinite; animation-delay: 0.8s;">👂</span>
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
  

  // Absolute score targets per level (no compounding = no blocking)
  function getLevelScoreTarget(lvl) {
    const table = [
      0,       // 0 (unused)
      600,     // 1
      900,     // 2
      1300,    // 3
      1800,    // 4
      2400,    // 5
      3200,    // 6
      4200,    // 7
      5500,    // 8
      7000,    // 9
      9000,    // 10
      11500,   // 11
      14500,   // 12
      18000,   // 13
      22000,   // 14
      27000,   // 15
      33000,   // 16
      40000,   // 17
      48000,   // 18
      57000,   // 19
      68000,   // 20
      80000,   // 21
      95000,   // 22
      112000,  // 23
      132000,  // 24
      155000,  // 25
      180000,  // 26
      210000,  // 27
      245000,  // 28
      285000,  // 29
      330000,  // 30
    ];
    if (lvl <= 30) return table[Math.max(1, lvl)] || 330000;
    // Levels 31-75: geometric from 330k × 1.18/level
    let val = 330000;
    for (let i = 31; i <= lvl; i++) val = Math.round(val * 1.18);
    return val;
  }

  function actuallyStartGame() {
    score = 0;
    combo = 1;
    streak = 0;
    level = 1;
    lives = 1; // Reset to 1 life
    nextLevelScore = getLevelScoreTarget(1);
    permanentComboBonus = 0;
    starsThisLevel = 1;
    levelHits = 0;
    levelMisses = 0;
    isPaused = false;
    powerUpActive = null;
    window.score = 0; // 🐛 FIX NaN: always initialize so minigames don't get undefined+n=NaN
    window._missShield = false;
    window._doubleEars = false;

    // Apply shop perks NOW (after reset so they aren't overwritten)
    if (typeof MetaGame !== 'undefined' && MetaGame.data && MetaGame.data.shop) {
      const p = [...(MetaGame.data.shop.purchased || [])];
      if (p.includes('extra_life')) {
        lives = 2; // 1 + 1 bonus
        MetaGame.data.shop.purchased = MetaGame.data.shop.purchased.filter(x => x !== 'extra_life');
        MetaGame.save();
      }
      if (p.includes('shield')) { window._missShield = true; }
      if (p.includes('hot_start')) { combo = 2; }
      if (p.includes('double_ears')) { window._doubleEars = true; }
    }
    // Apply prestige score multiplier
    if (typeof MetaGame !== 'undefined' && MetaGame.data && MetaGame.data.prestige && MetaGame.data.prestige.multiplier > 1) {
      pointMultiplier = MetaGame.data.prestige.multiplier;
    }

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

    // 🛡️ SPAWN WATCHDOG: every 3s, if game is running but no ears visible, force spawn
    // This catches ANY edge case where spawn gets stuck after minigames/overlays
    const spawnWatchdog = setInterval(() => {
      const anyOverlay =
        document.getElementById('rlOverlay') || document.getElementById('crOverlay') ||
        document.getElementById('pkOverlay') || document.getElementById('bonneteauOverlay') ||
        document.getElementById('coinFlipOverlay') || document.getElementById('fortuneTellerOverlay') ||
        document.getElementById('grandpaOverlay') || document.getElementById('pachinkoOverlay') ||
        document.getElementById('blackjackOverlay') || document.getElementById('unicornSwapOv') ||
        document.getElementById('canPauseOv') || document.getElementById('trollTweetContainer') ||
        document.getElementById('hearingMachineOverlay') || document.getElementById('gameIntroOverlay') ||
        document.getElementById('traderOverlay') || document.getElementById('mysteryBoxOverlay') ||
        document.querySelector('.level-up-celebration');
      if (anyOverlay) return; // minigame running, leave it
      if (isPaused || window.gamePaused) return; // intentionally paused
      if (gameOverScreen && gameOverScreen.style.display === 'flex') return; // game over
      if (startBtn && startBtn.style.display !== 'none') return; // not started

      const activeEars = document.querySelectorAll('.ear.active').length;
      if (activeEars === 0) {
        // Game is running, no overlay, no pause, but ZERO ears → STUCK
        activeEarsCount = 0;
        startSpawning();
        setTimeout(() => { spawnEar(); }, 50);
      }
    }, 3000);
    window.gameIntervals.spawnWatchdog = spawnWatchdog;
  }

  function startSpawning() {
    if (gameInterval) clearInterval(gameInterval);
    
    // 🐛 FIX CRITIQUE: Forcer le redémarrage même si déjà en cours
    isPaused = false;
    window.gamePaused = false;
    // 🐛 FIX CRITIQUE #2: Sync activeEarsCount with actual DOM
    // (minigames clear ears but can't reset this local var directly)
    activeEarsCount = document.querySelectorAll('.ear.active').length;
    
    function adjustInterval() {
      clearInterval(gameInterval);
      startSpawning();
    }
    window.adjustInterval = adjustInterval;
    window.startSpawning = startSpawning; // Expose globally for mini-games

  // 🛡️ WATCHDOG: ensure spawning never gets stuck after any minigame
  // Global safety: auto-cleanup ONLY true stuck states (not mystery box which has its own timer)
setInterval(() => {
  // Only clean up non-mystery stuck overlays (mystery box manages itself)
  if (window.gamePaused) {
    const stuckSince = window._gamePausedSince || 0;
    if (!window._gamePausedSince) return;
    if (Date.now() - stuckSince > 12000) {
      // Game stuck for 12s with no mystery box = force resume
      const mb = document.getElementById('mysteryBoxOverlay');
      if (!mb && typeof window.ensureGameRunning === 'function') {
        window.ensureGameRunning();
        window._gamePausedSince = 0;
      }
    }
  } else {
    window._gamePausedSince = 0;
  }
}, 2000);

window.ensureGameRunning = function() {
    isPaused = false;
    window.gamePaused = false;
    if (typeof window.setPaused === 'function') window.setPaused(false);
    // Reset LOCAL activeEarsCount (critical - can't be set from outside closure)
    activeEarsCount = 0;
    if (typeof window.activeEarsCount !== 'undefined') window.activeEarsCount = 0;
    // Clean ALL ears - both active and stale
    document.querySelectorAll('.ear').forEach(e => {
      e.classList.remove('active', 'cabal', 'echo', 'power-up', 'burning');
      e.textContent = ''; e.style.cssText = '';
    });
    startSpawning();
    setTimeout(() => { spawnEar(); spawnEar(); }, 150);
    // 2s safety net
    setTimeout(() => {
      if (!isPaused && !window.gamePaused && activeEarsCount === 0) {
        activeEarsCount = 0;
        startSpawning();
        spawnEar(); spawnEar(); spawnEar();
      }
    }, 2000);
  };
  // Export spawnEar globally for emergency use
  window.spawnEar = spawnEar;

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
    
    // SKULL spam increases dramatically from level 25+
    const skullChance = level >= 50 ? 0.18 : level >= 40 ? 0.14 : level >= 35 ? 0.10 :
                        level >= 30 ? 0.07 : level >= 25 ? 0.05 : 0;
    // CURSED ears from level 30+ (worth less points, move faster)
    const cursedChance = level >= 45 ? 0.12 : level >= 35 ? 0.08 : level >= 30 ? 0.04 : 0;

    if (skullChance > 0 && Math.random() < skullChance) {
      emoji = '💀';
    } else if (cursedChance > 0 && Math.random() < cursedChance) {
      emoji = '☠️'; // CURSED - instant death if not clicked in time
    } else if (level >= 10 && Math.random() < 0.08) {
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
    } else if (level >= 10 && Math.random() < 0.035) {
      emoji = '🎡'; // Roulette
    } else if (level >= 8 && Math.random() < 0.035) {
      emoji = '🎲'; // Craps
    } else if (level >= 12 && Math.random() < 0.05) {
      emoji = '🃏'; // Poker - increased from 0.02
    } else if (level >= 14 && Math.random() < 0.025) {
      emoji = '📈'; // Hearing Trader - dedicated spawn
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
    if (emoji === '☠️') ear.dataset.cursed = '1';
    else delete ear.dataset.cursed;
    
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
      
      // CURSED EAR missed = lose a life!
      if (symbol === '☠️' && !isPaused && !window.gamePaused) {
        ear.classList.remove("active", "cabal", "echo");
        activeEarsCount--;
        lives = Math.max(0, lives - 1);
        const cursedMsg = document.createElement('div');
        cursedMsg.innerHTML = '☠️ CURSED MISSED! -1 LIFE!';
        cursedMsg.style.cssText = `position:fixed;top:30%;left:50%;transform:translateX(-50%);
          font-family:'Luckiest Guy',cursive;font-size:clamp(20px,4vw,32px);
          color:#ff0000;text-shadow:0 0 20px #ff0000,2px 2px 0 #000;z-index:100020;pointer-events:none;`;
        document.body.appendChild(cursedMsg);
        setTimeout(() => cursedMsg.remove(), 1500);
        if (typeof SoundSystem !== 'undefined') SoundSystem.miss();
        if (lives <= 0) { updateUI(); setTimeout(() => actuallyEndGame(), 300); return; }
        updateUI();
        return; // Don't count as regular miss
      }

      // MAINTENANT on peut modifier l'ear
      ear.classList.remove("active", "cabal", "echo");
      delete ear.dataset.cursed;
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
        document.getElementById('coinFlipOverlay') ||
        document.getElementById('rlOverlay') ||      // Roulette
        document.getElementById('crOverlay') ||      // Craps
        document.getElementById('pkOverlay') ||      // Poker
        document.getElementById('hearingMachineOverlay') || // Slots
        document.getElementById('unicornSwapOv') ||  // Unicorn
        document.getElementById('canPauseOv') ||     // Can pause
        document.getElementById('trollTweetContainer'); // Poop tweets
      
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
    // Perf: fewer particles on mobile, also limit DOM particle count
    const existingParticles = document.querySelectorAll('.particle').length;
    const count = existingParticles > 20 ? 2 : (window.innerWidth < 768 ? 4 : 8);
    
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
      
      // Scale base points with level so high levels don't take 3 hours
      const lvlBase = level >= 50 ? 60 : level >= 35 ? 45 : level >= 20 ? 35 : 25;
      const basePoints = (window.ghostMode || window.grandpaDouble) ? lvlBase * 2 : lvlBase;
      const earnedPoints = Math.round(basePoints * (combo + permanentComboBonus) * scoreMultiplier * perfectBonus * fireMultiplier);
      score += earnedPoints;

      // 🎰 HUSTLE SYSTEM: rare "hot streak" double + very rare "bust" small deduct
      // Makes every click feel exciting
      const hustleRoll = Math.random();
      if (hustleRoll < 0.04 && combo > 2) { // 4% chance: DOUBLE when on combo
        const bonus = earnedPoints;
        score += bonus;
        const hMsg = document.createElement('div');
        hMsg.textContent = `🔥 HUSTLE DOUBLE! +${bonus}`;
        hMsg.style.cssText = `position:fixed;top:28%;left:50%;transform:translateX(-50%);font-size:clamp(22px,4vw,34px);color:#ff6600;font-family:'Luckiest Guy',cursive;font-weight:bold;z-index:10001;pointer-events:none;text-shadow:0 0 15px #ff6600;animation:messagePulse 0.4s ease-out;`;
        document.body.appendChild(hMsg);
        setTimeout(() => hMsg.remove(), 700);
      } else if (hustleRoll > 0.97 && score > 500 && combo < 2) { // 3% when no combo: small penalty
        const penalty = Math.round(earnedPoints * 0.4);
        score = Math.max(0, score - penalty);
        const hMsg = document.createElement('div');
        hMsg.textContent = `😬 FUMBLE -${penalty}`;
        hMsg.style.cssText = `position:fixed;top:28%;left:50%;transform:translateX(-50%);font-size:clamp(18px,3vw,26px);color:#ff4444;font-family:'Luckiest Guy',cursive;z-index:10001;pointer-events:none;animation:messagePulse 0.4s ease-out;`;
        document.body.appendChild(hMsg);
        setTimeout(() => hMsg.remove(), 600);
      }
      
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
    // Track for achievements
    if (typeof MetaGame !== 'undefined') {
      MetaGame.data.stats.totalEarsClicked = (MetaGame.data.stats.totalEarsClicked || 0) + 1;
      if (combo > (MetaGame.data.stats.longestCombo || 0)) MetaGame.data.stats.longestCombo = combo;
      MetaGame.checkAchievement('first_click', MetaGame.data.stats);
      MetaGame.checkAchievement('combo_5', MetaGame.data.stats);
    }
      
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

    if (typeof MiniGames !== 'undefined' && score < nextLevelScore - 30) {
      MiniGames.trySpawnMysteryBox({
        score, updateUI, streak, combo,
        addScore: (pts) => { score = Math.max(0, score + (isNaN(pts)?0:pts)); updateUI(); }
      });
    }

    if (score >= nextLevelScore && level < maxLevels) {
      level++;
      if (level >= maxLevels) {
        // FINAL LEVEL REACHED - special celebration but game continues
        setTimeout(() => showVictoryScreen(), 1500);
      } else {
        showLevelUp();
      }
    }
  }

  let lastBonusSymbol = null;
  let lastBossLevelTriggered = 0; // Track last boss level fired
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
        
        const gameContainer = document.querySelector('.holes-grid') || document.querySelector('.game-grid') || document.querySelector('.holes');
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
          top: unset;
          bottom: 15%;;
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
        rumorBubble.textContent = "🚀 TO THE MOON! LAUNCHING! 🌙";
        if (typeof SoundSystem !== 'undefined') SoundSystem.rocket();
        vibrate([100, 50, 150, 50, 200]);
        
        // Launch animation: rocket flies up from clicked position
        const rocket = document.createElement('div');
        rocket.textContent = '🚀';
        const ears = document.querySelectorAll('.ear.active');
        const randomEar = ears[Math.floor(Math.random() * ears.length)];
        const startX = randomEar ? randomEar.getBoundingClientRect().left + 20 : window.innerWidth / 2;
        const startY = randomEar ? randomEar.getBoundingClientRect().top : window.innerHeight / 2;
        rocket.style.cssText = `position:fixed;left:${startX}px;top:${startY}px;font-size:48px;
          z-index:100020;pointer-events:none;transition:all 2s cubic-bezier(0.2,0,0.8,-0.5);
          filter:drop-shadow(0 0 20px #FF8C00);`;
        document.body.appendChild(rocket);
        setTimeout(() => {
          rocket.style.top = '-200px';
          rocket.style.left = `${startX + (Math.random()-0.5)*200}px`;
          rocket.style.fontSize = '80px';
          rocket.style.opacity = '0';
        }, 50);
        setTimeout(() => rocket.remove(), 2100);
        
        // Moon landing bonus text
        const moonMsg = document.createElement('div');
        moonMsg.innerHTML = `🌙 +${200 * Math.round(combo)} pts! TO THE MOON!`;
        moonMsg.style.cssText = `position:fixed;top:20%;left:50%;transform:translateX(-50%);
          font-family:'Luckiest Guy',cursive;font-size:clamp(20px,4vw,30px);
          color:#FF8C00;text-shadow:0 0 20px #FF8C00;z-index:100021;pointer-events:none;
          animation:messagePulse 0.4s ease-out;`;
        document.body.appendChild(moonMsg);
        setTimeout(() => moonMsg.remove(), 2000);
        
        rainEmojis('rocket');
        updateUI();
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
        const gameContainer = document.querySelector('.holes-grid') || document.querySelector('.game-grid') || document.querySelector('.holes');
        
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
        
        const gameContainer = document.querySelector('.holes-grid') || document.querySelector('.game-grid') || document.querySelector('.holes');
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

        // 🔥 SIDE FIRE OVERLAYS — CSS-only, perf-safe
        if (!document.getElementById('fireOverlayL')) {
          const fireKeyframes = `@keyframes fireSide{0%,100%{opacity:0.55;transform:scaleY(1)}30%{opacity:0.8;transform:scaleY(1.05)}70%{opacity:0.4;transform:scaleY(0.97)}}@keyframes fireParticle{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-80px) scale(0.5);opacity:0}}`;
          const fks = document.createElement('style'); fks.id='fireKF'; fks.textContent=fireKeyframes; document.head.appendChild(fks);
          
          ['L','R'].forEach((side, idx) => {
            const el = document.createElement('div');
            el.id = 'fireOverlay'+side;
            el.style.cssText = `position:fixed;${idx===0?'left':'right'}:0;top:0;bottom:0;width:clamp(28px,6vw,60px);pointer-events:none;z-index:9996;overflow:hidden;will-change:opacity;`;
            const isMob = window.innerWidth < 768;
            for (let i = 0; i < (isMob ? 5 : 9); i++) {
              const flame = document.createElement('div');
              flame.textContent = ['🔥','🟠','🟡'][i%3];
              flame.style.cssText = `position:absolute;font-size:${20+Math.random()*18}px;left:${Math.random()*60}%;bottom:${Math.random()*100}%;animation:fireSide ${0.7+Math.random()*0.8}s ${Math.random()*0.5}s ease-in-out infinite,fireParticle ${1.5+Math.random()}s ${Math.random()*0.5}s ease-out infinite;`;
              el.appendChild(flame);
            }
            document.body.appendChild(el);
          });

          setTimeout(() => {
            ['fireOverlayL','fireOverlayR','fireKF'].forEach(id => { const e=document.getElementById(id); if(e) e.remove(); });
          }, 3000);
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
        
        const gameContainer = document.querySelector('.holes-grid') || document.querySelector('.game-grid') || document.querySelector('.holes');
        if (gameContainer) {
          gameContainer.style.background = 'linear-gradient(145deg, #3d0000, #1a0000)';
        }
        
        const burningEars = new Set();
        const startEar = activeEars[Math.floor(Math.random() * activeEars.length)];
        
        const setOnFire = (ear) => {
          if (!ear || burningEars.has(ear)) return;
          ear.classList.add('burning');
          ear.style.filter = 'brightness(1.5)'; // drop-shadow removed for mobile perf
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
        // INSTANT DEATH - no mercy!
        rumorBubble.textContent = "💀 THE REAPER GOT YOU! 💀";
        vibrate([300, 100, 300, 100, 500]);
        if (typeof VisualEffects !== 'undefined') {
          VisualEffects.flashScreen('#ff0000', 500);
          VisualEffects.screenShake(20, 600);
        }
        // Dramatic skull screen
        const skullScreen = document.createElement('div');
        skullScreen.style.cssText = `position:fixed;inset:0;background:#000;z-index:999999;
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          animation:fadeIn 0.3s;`;
        skullScreen.innerHTML = `
          <div style="font-size:clamp(80px,20vw,160px);animation:shake 0.3s infinite;line-height:1">💀</div>
          <div style="font-family:'Luckiest Guy',cursive;font-size:clamp(32px,7vw,60px);
            color:#ff0000;text-shadow:0 0 40px #ff0000,3px 3px 0 #000;margin-top:16px">INSTANT DEATH</div>
          <div style="font-family:'Luckiest Guy',cursive;font-size:clamp(16px,3vw,24px);color:#888;margin-top:8px">no rugpull escapes...</div>
        `;
        document.body.appendChild(skullScreen);
        setTimeout(() => { skullScreen.remove(); actuallyEndGame(); }, 1800);
      },

      '💊': () => {
        streak = 0; // KEEP streak reset
        combo += 0.5;
        rumorBubble.textContent = "COPING HARD! 💊🌈";
        vibrate([80, 40, 120]);
        
        // Animate ONLY the holes grid, not the whole container (avoids right-side menu shift)
        const holesGrid = document.querySelector('.holes-grid') || document.querySelector('.game-grid') || document.querySelector('.holes');
        const pillTarget = holesGrid || document.querySelector('.hole')?.parentElement;
        if (pillTarget) {
          pillTarget.style.filter = 'hue-rotate(0deg) saturate(2)';
          
          let hue = 0;
          const hueInterval = setInterval(() => {
            hue += 10;
            pillTarget.style.filter = `hue-rotate(${hue}deg) saturate(2)`;
            if (hue >= 360) {
              clearInterval(hueInterval);
              pillTarget.style.filter = '';
            }
          }, 80);
          
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
        rumorBubble.textContent = "❄️ HEARING FREEZE! TIME STOPS! CLICK ALL! ❄️";
        if (typeof SoundSystem !== 'undefined') SoundSystem.ghost();
        if (typeof VisualEffects !== 'undefined') VisualEffects.flashScreen('#00ffff', 300);
        vibrate([100, 50, 100]);
        
        const duration = 6000; // 6 seconds
        // Freeze ALL currently visible ears (they can't expire)
        const activeEars = document.querySelectorAll('.ear.active');
        const frozenTimers = [];
        
        // Visual: blue tint overlay
        const frozenBg = document.createElement('div');
        frozenBg.style.cssText = `position:fixed;inset:0;background:rgba(0,200,255,0.08);
          pointer-events:none;z-index:9999;border:4px solid rgba(0,200,255,0.5);
          box-sizing:border-box;animation:pulse 0.5s ease-in-out infinite;`;
        document.body.appendChild(frozenBg);
        
        // Freeze timer display
        const timerEl = document.createElement('div');
        let timeLeft = duration / 1000;
        timerEl.textContent = `❄️ FROZEN ${timeLeft}s`;
        timerEl.style.cssText = `position:fixed;top:10px;left:50%;transform:translateX(-50%);
          font-family:'Luckiest Guy',cursive;font-size:clamp(18px,4vw,26px);
          color:#00ffff;text-shadow:0 0 15px #00ffff;z-index:100020;pointer-events:none;`;
        document.body.appendChild(timerEl);
        const timerInterval = setInterval(() => {
          timeLeft--;
          timerEl.textContent = timeLeft > 0 ? `❄️ FROZEN ${timeLeft}s` : '❄️ THAWING!';
        }, 1000);
        
        activeEars.forEach(ear => {
          ear.style.filter = 'brightness(1.5) hue-rotate(180deg) drop-shadow(0 0 15px #00ffff)';
          ear.style.animation = 'iceCrystal 0.8s ease-in-out infinite';
          ear.style.transform = 'scale(1.2)';
          // Clicking frozen ears gives 2x points
          ear.dataset.frozenBonus = '1';
        });
        
        // Pause spawning during freeze
        const prevPaused = window.gamePaused;
        // Don't full pause - just slow spawning via interval multiplier
        clearInterval(gameInterval);
        gameInterval = setInterval(spawnEar, 2500); // Very slow during freeze
        
        setTimeout(() => {
          clearInterval(timerInterval);
          document.querySelectorAll('.ear.active').forEach(ear => {
            ear.style.filter = '';
            ear.style.animation = '';
            ear.style.transform = '';
            delete ear.dataset.frozenBonus;
          });
          frozenBg.remove();
          timerEl.remove();
          // Resume normal speed
          clearInterval(gameInterval);
          startSpawning();
        }, duration);
        updateUI();
      },

      '🌙': () => {
        rumorBubble.textContent = "👻 HEARING GHOSTS! CATCH THE GHOSTS! 👻";
        
        if (typeof SoundSystem !== 'undefined') {
          SoundSystem.ghost();
        }
        
        const duration = 8000;
        const moonGrid = document.querySelector('.holes-grid') || document.querySelector('.game-grid') || document.querySelector('.holes');
        if (moonGrid) {
          moonGrid.style.background = 'linear-gradient(180deg, #0a0a1a, #1a1a2e)';
          moonGrid.style.filter = 'contrast(1.3)';
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
          const moonGridClean = document.querySelector('.holes-grid') || document.querySelector('.game-grid');
          if (moonGridClean) { moonGridClean.style.background = ''; moonGridClean.style.filter = ''; }
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
        // 🦻 HEARING GRANDPA V3 — ULTRA DEGEN EDITION
        rumorBubble.textContent = "🦻 GRANDPA HEARD SOMETHING! 🦻";

        const wasGamePaused = isPaused;
        window.gamePaused = true; isPaused = true;
        document.querySelectorAll('.ear').forEach(ear => {
          ear.classList.remove('active', 'cabal', 'echo', 'power-up'); ear.textContent = '';
        });
        if (typeof window.activeEarsCount !== 'undefined') window.activeEarsCount = 0;

        // Inject grandpa styles
        if (!document.getElementById('grandpaStyles')) {
          const gs = document.createElement('style'); gs.id = 'grandpaStyles';
          gs.textContent = `
            @keyframes gpScan{0%{background-position:0 -100%}100%{background-position:0 200%}}
            @keyframes gpShake{0%,100%{transform:translate(0,0) rotate(0deg)}20%{transform:translate(-4px,2px) rotate(-1deg)}40%{transform:translate(4px,-2px) rotate(1deg)}60%{transform:translate(-3px,3px) rotate(-0.5deg)}80%{transform:translate(3px,-1px) rotate(0.5deg)}}
            @keyframes gpFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-12px) scale(1.05)}}
            @keyframes gpHearingAid{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.6;transform:scale(0.92)}}
            @keyframes gpCRT{0%{opacity:0.05}50%{opacity:0.12}100%{opacity:0.05}}
          `;
          document.head.appendChild(gs);
        }

        const GRANDPA_PHRASES = [
          "WHAT'S THAT NOISE?!", "I CAN'T HEAR YOU SER!", "IS THIS THE INTERNET?",
          "SPEAK INTO MY HEARING AID!", "IN MY DAY WE HAD REAL EARS!",
          "GET OFF MY LAWN!", "HOLD ON LET ME ADJUST MY DEVICE...",
          "WHAT DID YOU SAY?!", "CAN YOU REPEAT THAT?",
          "THIS IS WORSE THAN MY TINNITUS!", "NGMI LIKE MY HEARING!",
          "BACK IN 1929...", "I PUT ALL MY SAVINGS INTO THIS?!",
          "THE NURSE SAID NOT TO PLAY THIS GAME!", "BINGO? NO? BINGO?",
          "💊 WHERE ARE MY PILLS?!", "ONE MORE SPIN... JUST ONE MORE..."
        ];
        const GRANDPA_EMOJIS = ['🦻','👴','🧓','📢','📣','🔊','👂','💊','🏥','📺','🎰'];

        const gOv = document.createElement('div');
        gOv.id = 'grandpaOverlay';
        gOv.style.cssText = `position:fixed;inset:0;z-index:100010;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;
          background:linear-gradient(160deg,#0a0600 0%,#1a0e00 50%,#0a0600 100%);`;

        // CRT scanline effect
        const crt = document.createElement('div');
        crt.style.cssText = `position:absolute;inset:0;pointer-events:none;z-index:100;
          background:repeating-linear-gradient(0deg,rgba(0,0,0,0.12) 0px,rgba(0,0,0,0.12) 1px,transparent 1px,transparent 4px);
          animation:gpCRT 3s ease-in-out infinite;`;
        gOv.appendChild(crt);

        // Scan line
        const scan = document.createElement('div');
        scan.style.cssText = `position:absolute;left:0;right:0;height:3px;z-index:101;pointer-events:none;
          background:linear-gradient(90deg,transparent,rgba(180,130,0,0.4),transparent);
          animation:gpScan 3s linear infinite;background-size:100% 300%;`;
        gOv.appendChild(scan);

        // Floating emojis background
        const floatBg = document.createElement('div');
        floatBg.style.cssText = `position:absolute;inset:0;pointer-events:none;overflow:hidden;`;
        for (let i = 0; i < 12; i++) {
          const fe = document.createElement('div');
          fe.textContent = GRANDPA_EMOJIS[i % GRANDPA_EMOJIS.length];
          fe.style.cssText = `position:absolute;font-size:${20+Math.random()*30}px;opacity:0.06;
            left:${Math.random()*90+5}%;top:${Math.random()*90+5}%;
            animation:gpFloat ${4+Math.random()*4}s ${Math.random()*3}s ease-in-out infinite;`;
          floatBg.appendChild(fe);
        }
        gOv.appendChild(floatBg);

        // Main content box
        const gBox = document.createElement('div');
        gBox.style.cssText = `position:relative;z-index:10;text-align:center;padding:clamp(20px,5vw,40px);max-width:420px;width:92%;`;

        // Giant grandpa emoji (shaking)
        const gEmoji = document.createElement('div');
        gEmoji.textContent = '👴';
        gEmoji.style.cssText = `font-size:clamp(80px,20vw,140px);animation:gpShake 0.3s infinite;
          display:block;line-height:1;margin-bottom:16px;filter:drop-shadow(0 0 30px rgba(255,180,0,0.5));`;
        gBox.appendChild(gEmoji);

        // Title
        const gTitle = document.createElement('div');
        gTitle.innerHTML = '🦴 GRANDPA 🦴';
        gTitle.style.cssText = `font-family:'Luckiest Guy',cursive;font-size:clamp(22px,5vw,40px);white-space:nowrap;
          color:#FF8C00;text-shadow:0 0 30px #FF8C00,0 0 60px rgba(255,140,0,0.4),3px 3px 0 #000;
          margin-bottom:8px;letter-spacing:1px;animation:gpShake 0.5s infinite;`;
        gBox.appendChild(gTitle);

        // Hearing aid meter
        const meterWrap = document.createElement('div');
        meterWrap.style.cssText = `background:rgba(0,0,0,0.5);border:2px solid rgba(255,140,0,0.4);
          border-radius:20px;padding:8px 20px;margin:10px auto;max-width:280px;`;
        meterWrap.innerHTML = `
          <div style="font-family:'Luckiest Guy',cursive;font-size:12px;color:#888;letter-spacing:2px;margin-bottom:4px">HEARING AID SIGNAL</div>
          <div style="display:flex;gap:3px;justify-content:center" id="gpMeter">
            ${Array.from({length:8},(_,i)=>`<div style="width:14px;height:${8+i*3}px;border-radius:3px;background:${i<3?'#ff4444':i<6?'#FF8C00':'#00ff88'};opacity:0.3;animation:gpHearingAid ${0.5+i*0.1}s ${i*0.05}s ease-in-out infinite" id="gpm${i}"></div>`).join('')}
          </div>
        `;
        gBox.appendChild(meterWrap);

        // Speech bubble
        const gBubble = document.createElement('div');
        gBubble.style.cssText = `background:rgba(255,140,0,0.1);border:3px solid rgba(255,140,0,0.5);
          border-radius:16px;padding:12px 20px;margin:12px 0;
          font-family:'Luckiest Guy',cursive;font-size:clamp(16px,4vw,24px);
          color:#FFD700;text-shadow:2px 2px 0 #000;min-height:48px;
          animation:gpShake 0.8s infinite;`;
        gBubble.textContent = GRANDPA_PHRASES[0];
        gBox.appendChild(gBubble);

        // Goodus display
        const gBonus = document.createElement('div');
        gBonus.style.cssText = `font-family:'Luckiest Guy',cursive;font-size:clamp(20px,5vw,32px);
          color:#00ff88;text-shadow:0 0 20px #00ff88,2px 2px 0 #000;margin-top:12px;`;
        // Grandpa bonus variety
        const grandpaBonuses = [
          { icon:'👂', text:'+500 SCORE', action: () => { score += 500; } },
          { icon:'❤️', text:'+1 EXTRA LIFE', action: () => { lives++; } },
          { icon:'⚡', text:'COMBO BOOST! +5x', action: () => { combo = Math.min(combo + 5, 50); } },
          { icon:'💎', text:'+1000 SCORE', action: () => { score += 1000; } },
          { icon:'🌀', text:'2× POINTS 5s', action: () => { window.grandpaDouble = true; setTimeout(() => { window.grandpaDouble = false; }, 5000); } },
          { icon:'💊', text:'ALL LIVES RESTORED', action: () => { lives = Math.max(lives, 3); } },
          { icon:'🎰', text:'RANDOM: +200 to +2000', action: () => { const r = (Math.floor(Math.random()*10)+1)*200; score += r; gBonus.textContent = `🎰 JACKPOT +${r}!`; } },
          { icon:'⭐', text:'PERMANENT +0.2 COMBO', action: () => { permanentComboBonus += 0.2; } },
        ];
        const gPick = grandpaBonuses[Math.floor(Math.random() * grandpaBonuses.length)];
        gPick.action();
        updateUI();
        gBonus.textContent = `${gPick.icon} ${gPick.text} ${gPick.icon}`;
        gBox.appendChild(gBonus);

        gOv.appendChild(gBox);
        document.body.appendChild(gOv);

        // Animate hearing aid meter
        let meterTick = 0;
        const meterInterval = setInterval(() => {
          meterTick++;
          const bars = document.querySelectorAll('[id^="gpm"]');
          const activeCount = Math.floor(Math.random() * 8) + 1;
          bars.forEach((b, i) => { b.style.opacity = i < activeCount ? '1' : '0.15'; });
        }, 150);

        // Cycle phrases
        let phraseIdx = 0;
        const phraseInterval = setInterval(() => {
          phraseIdx = (phraseIdx + 1) % GRANDPA_PHRASES.length;
          gBubble.textContent = GRANDPA_PHRASES[phraseIdx];
        }, 800);

        // TTS
        if ('speechSynthesis' in window) {
          const ttsInterval = setInterval(() => {
            const utt = new SpeechSynthesisUtterance(GRANDPA_PHRASES[Math.floor(Math.random()*GRANDPA_PHRASES.length)]);
            utt.rate = 0.65; utt.pitch = 0.6; utt.volume = 0.7;
            window.speechSynthesis.speak(utt);
          }, 2200);
          setTimeout(() => clearInterval(ttsInterval), 8000);
        }

        score += 300; updateUI();

        // Cleanup after 6s
        setTimeout(() => {
          clearInterval(meterInterval); clearInterval(phraseInterval);
          window.speechSynthesis?.cancel();

          gBubble.textContent = '👋 GRANDPA WENT HOME!';
          gEmoji.textContent = '🏠';
          gEmoji.style.animation = 'none';
          gTitle.style.animation = 'none';

          setTimeout(() => {
            gOv.style.transition = 'opacity 0.6s'; gOv.style.opacity = '0';
            setTimeout(() => {
              gOv.remove();
              if (typeof window.ensureGameRunning === 'function') window.ensureGameRunning();
              else { isPaused = false; window.gamePaused = false; activeEarsCount = 0; startSpawning(); }
            }, 600);
            rumorBubble.textContent = "GRANDPA LEFT! 300 BONUS EARS! 🦻";
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
          utterance.rate = 1.1; utterance.pitch = 1.0; utterance.volume = 1.0;
          window.speechSynthesis.speak(utterance);
        }
        
        const wasPaused = isPaused;
        isPaused = true;
        window.gamePaused = true; // FIX: prevent watchdog from restarting spawns during flip
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
        const _bp = window.innerWidth < 768 ? 6 : 10;
        for (let i = 0; i < _bp; i++) {
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
        subtitle.innerHTML = `👂 YOUR SCORE: <span style="color: #00ff00;">${Math.round(score)}</span> 👂`;
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
          box-shadow: inset 0 0 20px rgba(0,0,0,0.3);
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
              const _rainCount = window.innerWidth < 768 ? 5 : 12;
              for (let i = 0; i < _rainCount; i++) {
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
              for (let i = 0; i < 5; i++) {
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
              const _maxSparkle = window.innerWidth < 768 ? 4 : 6;
              for (let i = 0; i < _maxSparkle; i++) {
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
              if (typeof window.ensureGameRunning === 'function') {
                window.ensureGameRunning();
              } else {
                isPaused = false;
                window.gamePaused = false;
                activeEarsCount = 0;
                startSpawning();
              }
            }, isEdge ? 5000 : 3000);
            
          }, 4200);
        };
        
        headsBtn.addEventListener('click', () => handleChoice('HEADS'));
        tailsBtn.addEventListener('click', () => handleChoice('TAILS'));
      },
      
      '🔮': () => {
        // 🔮 FORTUNE TELLER — Simple & Fun
        // Shows 3-5 holes → countdown 3-2-1 → ears spawn exactly there!
        if (typeof SoundSystem !== 'undefined') SoundSystem.bonus();
        rumorBubble.textContent = '🔮 THE CRYSTAL REVEALS ALL!';

        isPaused = true; window.gamePaused = true;
        document.querySelectorAll('.ear').forEach(e => {
          e.classList.remove('active','cabal','echo','power-up'); e.textContent = '';
        });
        activeEarsCount = 0;

        // Pick 3-5 random holes
        const allHoles = Array.from(document.querySelectorAll('.hole'));
        const pickCount = Math.min(3 + Math.floor(level / 10), 5, allHoles.length);
        const picked = [...allHoles].sort(() => Math.random()-0.5).slice(0, pickCount);

        // Inject CSS once
        if (!document.getElementById('ftStyle')) {
          const s = document.createElement('style'); s.id = 'ftStyle';
          s.textContent = `
            @keyframes ftPulse{0%,100%{box-shadow:0 0 0 4px #c77dff,0 0 20px #9d4edd}50%{box-shadow:0 0 0 8px #e0aaff,0 0 40px #c77dff}}
            @keyframes ftIn{from{opacity:0;transform:translate(-50%,-50%) scale(0.6)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
            @keyframes ftCountdown{0%{transform:translate(-50%,-50%) scale(0.5);opacity:0.3}50%{transform:translate(-50%,-50%) scale(1.2)}100%{transform:translate(-50%,-50%) scale(1);opacity:1}}
          `;
          document.head.appendChild(s);
        }

        // Big crystal ball banner
        const banner = document.createElement('div');
        banner.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
          font-family:'Luckiest Guy',cursive;text-align:center;
          background:rgba(0,0,0,0.95);border:4px solid #c77dff;border-radius:24px;
          padding:24px 40px;z-index:100020;animation:ftIn 0.35s ease-out;`;
        
        const updateBanner = (html) => { banner.innerHTML = html; };
        updateBanner(`<div style="font-size:70px;line-height:1">🔮</div>
          <div style="font-size:clamp(22px,5vw,38px);color:#fff;text-shadow:0 0 20px #c77dff,3px 3px 0 #000">
            WATCH THESE ${pickCount} HOLES!</div>
          <div style="font-size:clamp(12px,2.5vw,18px);color:#c77dff;margin-top:8px">
            EARS SPAWN THERE IN...</div>`);
        document.body.appendChild(banner);

        // Glow the chosen holes immediately
        picked.forEach((hole, i) => {
          hole.style.animation = 'ftPulse 0.6s ease-in-out infinite';
          hole.style.outline = '4px solid #c77dff';
          const badge = document.createElement('div');
          badge.className = 'ft-badge';
          badge.textContent = i + 1;
          badge.style.cssText = `position:absolute;top:-10px;right:-10px;background:#9d4edd;
            color:#fff;font-family:'Luckiest Guy',cursive;font-size:15px;
            width:26px;height:26px;border-radius:50%;display:flex;align-items:center;
            justify-content:center;z-index:5;box-shadow:0 0 10px #9d4edd;pointer-events:none;`;
          hole.style.position = 'relative';
          hole.appendChild(badge);
        });

        // Countdown 3-2-1
        let cd = 3;
        const tick = setInterval(() => {
          if (typeof SoundSystem !== 'undefined') SoundSystem.miss();
          updateBanner(`<div style="font-size:clamp(60px,15vw,120px);color:#FFD700;
            font-family:'Luckiest Guy',cursive;text-shadow:0 0 40px #FFD700,4px 4px 0 #000;
            animation:ftCountdown 0.7s ease-out;line-height:1">${cd}</div>
            <div style="font-size:clamp(14px,3vw,22px);color:#c77dff;margin-top:8px">GET READY!</div>`);
          cd--;
          if (cd < 0) {
            clearInterval(tick);
            updateBanner(`<div style="font-size:clamp(30px,7vw,60px);color:#00ff88;
              font-family:'Luckiest Guy',cursive;text-shadow:0 0 30px #00ff88,3px 3px 0 #000;
              animation:ftCountdown 0.4s ease-out">👂 GO GO GO! 👂</div>`);
            banner.style.borderColor = '#00ff88';
            if (typeof SoundSystem !== 'undefined') SoundSystem.levelUp();
            setTimeout(() => banner.remove(), 700);

            // Clean badges, keep glow briefly
            picked.forEach(h => {
              h.querySelector('.ft-badge')?.remove();
              setTimeout(() => { h.style.animation = ''; h.style.outline = ''; }, 2000);
            });

            // Spawn ears in predicted holes
            isPaused = false; window.gamePaused = false;
            picked.forEach((hole, i) => {
              setTimeout(() => {
                const ear = hole.querySelector('.ear');
                if (!ear || ear.classList.contains('active')) return;
                ear.classList.add('active');
                ear.textContent = '👂';
                ear.style.filter = 'drop-shadow(0 0 12px #e0aaff)';
                activeEarsCount++;

                const spawnTime = Date.now();
                ear.dataset.spawnTime = spawnTime;
                const lifeMs = Math.max(getEarUpTime(), 4500);

                setTimeout(() => {
                  ear.style.filter = '';
                  if (ear.classList.contains('active') &&
                      parseInt(ear.dataset.spawnTime) === spawnTime &&
                      !window.gamePaused && !isPaused) {
                    ear.classList.remove('active');
                    ear.textContent = '';
                    activeEarsCount = Math.max(0, activeEarsCount - 1);
                    streak++;
                    if (streak >= maxStreak) endGame();
                  }
                }, lifeMs);
              }, i * 350);
            });

            // Resume normal spawning after all fortune ears are planted
            setTimeout(() => startSpawning(), pickCount * 350 + 600);
          }
        }, 1000);
      },

      
            '🌪️': () => {
        try { if(typeof SoundSystem!=='undefined') SoundSystem.lightning(); } catch(e) {}
        rumorBubble.textContent='🌪️ TORNADO! ULTRA SPAWNING 4s!';
        document.querySelectorAll('.hole').forEach((h,i)=>{ h.style.transition='transform 0.3s'; h.style.transform='rotate(720deg) scale(0.8)'; setTimeout(()=>{ h.style.transform=''; h.style.transition=''; },700+i*80); });
        if(!document.getElementById('tornadoStyle')){const ts=document.createElement('style');ts.id='tornadoStyle';ts.textContent='@keyframes tornadoSpin{from{transform:translate(-50%,-50%)rotate(0)}to{transform:translate(-50%,-50%)rotate(360deg)}}';document.head.appendChild(ts);}
        const tMsg=document.createElement('div'); tMsg.textContent='🌪️';
        tMsg.style.cssText='position:fixed;top:50%;left:50%;font-size:120px;z-index:100015;pointer-events:none;animation:tornadoSpin 0.5s linear infinite;';
        document.body.appendChild(tMsg);
        clearInterval(gameInterval);
        const ti=setInterval(()=>{ if(!isPaused&&!window.gamePaused&&typeof spawnEar==='function') try{spawnEar();}catch(e){} },300);
        setTimeout(()=>{ clearInterval(ti); tMsg.remove(); score+=800; updateUI(); startSpawning(); },4000);
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
          MegaBonusEffects.magnet({hitEar, score, updateUI, addScore: (pts) => { score += pts; updateUI(); }});
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
          MegaBonusEffects.mimic({score, updateUI, addScore: (pts) => { score += pts; updateUI(); }});
        }
      },
      
      '🎪': () => {
        if (typeof MegaBonusEffects !== 'undefined') {
          MegaBonusEffects.circus({score, updateUI, addScore: (pts) => { score += pts; updateUI(); }});
        }
      },
      
      '🦇': () => {
        if (typeof MegaBonusEffects !== 'undefined') {
          MegaBonusEffects.batSwarm({score, updateUI, addScore: (pts) => { score += pts; updateUI(); }});
        }
      },
      
      '💣': () => {
        if (typeof MegaBonusEffects !== 'undefined') {
          MegaBonusEffects.mineField({score, updateUI, addScore: (pts) => { score += pts; updateUI(); }});
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
      },

      // ================== 🦄 EARSWAP LSD — Swap vie ↔ points ==================
      '🦄': () => {
        rumorBubble.textContent = "🦄 EARSWAP LSD! SWAP YOUR STATS! WEN MOON? 🌈";
        vibrate([50, 30, 80, 30, 120]);
        window.gamePaused = true; setPaused(true);
        // Clear ears so pending timeouts don't fire miss penalties or remove holes
        document.querySelectorAll('.ear').forEach(e => {
          e.classList.remove('active','cabal','echo','power-up');
          e.textContent = '';
        });
        activeEarsCount = 0;

        const ov = document.createElement('div');
        ov.id = 'unicornSwapOv';
        ov.style.cssText = `position:fixed;inset:0;z-index:100010;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse at center,rgba(255,0,200,0.97),rgba(100,0,180,0.99));overflow-y:auto;overflow-x:hidden;`;

        // Glitter background
        const glitter = document.createElement('div');
        glitter.style.cssText = `position:absolute;inset:0;pointer-events:none;`;
        glitter.innerHTML = Array.from({length: 20}, () =>
          `<div style="position:absolute;font-size:${16+Math.random()*20}px;left:${Math.random()*100}%;top:${Math.random()*100}%;opacity:0.4;animation:casinoFloat ${2+Math.random()*3}s ${Math.random()*2}s ease-in-out infinite alternate;pointer-events:none;">${['✨','💜','🌈','💫','🦄','⭐'][Math.floor(Math.random()*6)]}</div>`
        ).join('');
        ov.appendChild(glitter);

        const box = document.createElement('div');
        box.style.cssText = `position:relative;background:linear-gradient(135deg,#ff69b4,#9400d3,#ff1493);border:4px solid #fff;border-radius:24px;padding:clamp(16px,4vw,30px) clamp(18px,5vw,36px);text-align:center;font-family:'Luckiest Guy',cursive;color:#fff;max-width:340px;width:92%;box-shadow:0 0 40px #ff00ff;max-height:92vh;overflow-y:auto;`;

        const metaEars = typeof MetaGame !== 'undefined' ? MetaGame.getCurrency('ears') : 0;
        const lifeToPoints = Math.min(lives - 1, 1) > 0 ? 750 : 0;
        const pointsToLife = score >= 500 ? 500 : 0;
        const earShopCost = 200; // spend 200 meta 👂 for +1 life
        const canBuyLife = metaEars >= earShopCost;

        box.innerHTML = `
          <div style="font-size:clamp(36px,9vw,54px);margin-bottom:4px;line-height:1">🦄 EARSWAP</div>
          <div style="font-size:clamp(11px,2.5vw,14px);color:#ffe0ff;margin-bottom:12px;opacity:0.8">SWAP YOUR STATS — NGMI IF YOU SKIP</div>
          <div style="background:rgba(255,255,255,0.1);border-radius:10px;padding:8px 16px;margin-bottom:14px;font-size:clamp(14px,3vw,18px);color:#FFD700;display:flex;justify-content:space-between;align-items:center">
            <span>💰 Score</span><span style="color:#00ff88">${Math.round(score)} pts</span>
          </div>
          <div style="background:rgba(255,215,0,0.15);border:2px solid rgba(255,215,0,0.4);border-radius:10px;padding:8px 16px;margin-bottom:18px;font-size:clamp(14px,3vw,18px);color:#FFD700;display:flex;justify-content:space-between;align-items:center">
            <span>👂 Ear Bank</span><span style="color:#FFD700;font-weight:bold">${metaEars} 👂</span>
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:16px">
            ${lifeToPoints > 0 ? `<button id="swapL2P" style="background:linear-gradient(90deg,#ff0080,#ff00ff);border:2px solid #fff;border-radius:12px;padding:10px;font-family:'Luckiest Guy',cursive;font-size:clamp(14px,3vw,18px);color:#fff;cursor:pointer;touch-action:manipulation">❤️ → +${lifeToPoints} pts  <span style="font-size:0.8em;opacity:0.8">(lose 1 life)</span></button>` : `<div style="background:rgba(255,255,255,0.08);border-radius:12px;padding:8px;font-size:13px;color:#aaa">❤️ Need 2+ lives to sell</div>`}
            ${pointsToLife > 0 ? `<button id="swapP2L" style="background:linear-gradient(90deg,#9400d3,#6a0dad);border:2px solid #fff;border-radius:12px;padding:10px;font-family:'Luckiest Guy',cursive;font-size:clamp(14px,3vw,18px);color:#fff;cursor:pointer;touch-action:manipulation">−${pointsToLife} pts → ❤️ +1 life</button>` : `<div style="background:rgba(255,255,255,0.08);border-radius:12px;padding:8px;font-size:13px;color:#aaa">Need ${500-score} more pts for a life</div>`}
            ${canBuyLife ? `<button id="swapEarLife" style="background:linear-gradient(90deg,#ff8c00,#FFD700);border:2px solid #fff;border-radius:12px;padding:10px;font-family:'Luckiest Guy',cursive;font-size:clamp(14px,3vw,18px);color:#000;cursor:pointer;touch-action:manipulation">−${earShopCost} 👂 → ❤️ +1 life</button>` : `<div style="background:rgba(255,215,0,0.08);border-radius:12px;padding:8px;font-size:13px;color:#aaa">Need ${earShopCost} 👂 to buy a life</div>`}
            <button id="swapBonus" style="background:linear-gradient(90deg,#00cc44,#00ff88);border:2px solid #fff;border-radius:12px;padding:10px;font-family:'Luckiest Guy',cursive;font-size:clamp(14px,3vw,18px);color:#000;cursor:pointer;touch-action:manipulation">🌈 FREE +500 pts BONUS!</button>
          </div>
          <button id="swapSkip" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.3);border-radius:8px;padding:6px 20px;font-family:'Luckiest Guy',cursive;font-size:14px;color:#ffe0ff;cursor:pointer;touch-action:manipulation">SKIP (closes in 8s)</button>
        `;
        ov.appendChild(box);
        document.body.appendChild(ov);

        if (typeof this !== 'undefined' && this.speak) this.speak("EARSWAP! Trade your stats! LFG!");

        const closeUni = () => {
          ov.style.opacity = '0'; ov.style.transition = 'opacity 0.4s';
          setTimeout(() => { ov.remove(); window.gamePaused=false; setPaused(false); startSpawning(); }, 400);
        };

        const l2pBtn = document.getElementById('swapL2P');
        if (l2pBtn) l2pBtn.onclick = () => { lives = Math.max(1, lives - 1); score += lifeToPoints; updateUI(); closeUni(); };
        const p2lBtn = document.getElementById('swapP2L');
        if (p2lBtn) p2lBtn.onclick = () => { score = Math.max(0, score - pointsToLife); lives++; updateUI(); closeUni(); };
        // Buy life with meta 👂
        const earLifeBtn = document.getElementById('swapEarLife');
        if (earLifeBtn) earLifeBtn.onclick = () => {
          if (typeof MetaGame !== 'undefined' && MetaGame.spendCurrency('ears', earShopCost)) {
            lives++; updateUI();
            if (typeof MetaGame !== 'undefined') MetaGame.updateEarsBadge();
          }
          closeUni();
        };
        document.getElementById('swapBonus').onclick = () => { score += 500; updateUI(); closeUni(); };
        document.getElementById('swapSkip').onclick = closeUni;
        setTimeout(closeUni, 8000);
      },

      // ================== 💩 CRYPTO TROLL TWEETS ==================
      '💩': () => {
        rumorBubble.textContent = "💩 CRYPTO SCAM ALERT! CLOSE THE FUD! 💩";
        vibrate([200, 100, 200]);
        window.gamePaused = true; setPaused(true);

        const FAKE_TWEETS = [
          { handle: '@CryptoGuru99', text: 'NGL fam my EARS bag just 100x\'d overnight 👂🚀 wen lambo ser??', pts: 150 },
          { handle: '@EarWhale666', text: 'Just aped $500k into $EARS. This is NOT financial advice but DO IT NOW', pts: 200 },
          { handle: '@DeFiLegend', text: 'My cousin works at the hearing lab. BIG announcement incoming 🤫 Not saying anything but... 👂👂👂', pts: 175 },
          { handle: '@TrustMeBro', text: 'EARS token is the new BTC. Change my mind. Already up 40000%', pts: 150 },
          { handle: '@NFTKing2024', text: 'Bought an Ear NFT for 50 ETH. My friends think I\'m crazy. My ears think I\'m based.', pts: 125 },
          { handle: '@AlwaysRightBTC', text: 'Breaking: Elon just DMed me about $EARS. Can\'t say more. Buy the dip.', pts: 250 },
          { handle: '@HearingThingsVC', text: 'We\'re incubating the next 1000x ear project. Whitelist closes in 3 MINUTES', pts: 200 },
          { handle: '@FUDkiller', text: 'Haters said ears were useless. Now look at them. Cope harder. 👂👂', pts: 125 },
        ];

        const container = document.createElement('div');
        container.id = 'trollTweetContainer';
        container.style.cssText = `position:fixed;inset:0;z-index:100010;pointer-events:none;overflow:hidden;`;
        document.body.appendChild(container);

        let closed = 0;
        const total = window.innerWidth < 768 ? 3 : 5;
        const used = FAKE_TWEETS.sort(() => Math.random()-0.5).slice(0, total);
        let totalPts = 0;

        const scoreBar = document.createElement('div');
        scoreBar.style.cssText = `position:fixed;top:16px;left:50%;transform:translateX(-50%) translateZ(0);font-size:clamp(16px,3.5vw,22px);color:#FFD700;font-family:'Luckiest Guy',cursive;z-index:100015;pointer-events:none;text-shadow:0 0 10px #FFD700;background:rgba(0,0,0,0.7);padding:4px 12px;border-radius:8px;`;
        scoreBar.textContent = `💩 0/${total} FUD killed — +0 pts`;
        document.body.appendChild(scoreBar);

        const autoEnd = setTimeout(() => {
          container.remove(); scoreBar.remove();
          window.gamePaused=false; setPaused(false); startSpawning();
        }, 10000);

        used.forEach((tweet, i) => {
          setTimeout(() => {
            if (!document.getElementById('trollTweetContainer')) return;
            const card = document.createElement('div');
            const isMob = window.innerWidth < 768;
            const left = isMob ? 5 + Math.random()*30 : 10 + Math.random()*60;
            const top = isMob ? 15 + (i*18) : 10 + Math.random()*65;
            card.style.cssText = `position:fixed;left:${left}%;top:${top}%;background:#15202b;border:2px solid #1d9bf0;border-radius:16px;padding:14px 16px;max-width:${isMob?'85vw':'320px'};font-family:Arial,sans-serif;z-index:100011;pointer-events:auto;cursor:pointer;box-shadow:0 4px 24px rgba(29,155,240,0.4);animation:slideInDown 0.3s ease-out;transform:rotate(${(Math.random()-0.5)*4}deg);`;
            card.innerHTML = `
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                <div style="width:36px;height:36px;background:linear-gradient(135deg,#1d9bf0,#0052cc);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;">👤</div>
                <div style="color:#e7e9ea;font-weight:bold;font-size:14px">${tweet.handle}</div>
                <div style="background:#1d9bf0;color:#fff;font-size:10px;padding:2px 6px;border-radius:4px;">✓ Verified Degen</div>
              </div>
              <div style="color:#e7e9ea;font-size:${isMob?13:15}px;line-height:1.4;margin-bottom:10px">${tweet.text}</div>
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div style="color:#71767b;font-size:12px">🔁 4.2K ❤️ 12.8K</div>
                <div style="background:#ff4444;color:#fff;border-radius:8px;padding:4px 12px;font-size:13px;font-weight:bold;">🗑️ +${tweet.pts}pts</div>
              </div>
            `;
            card.onclick = () => {
              closed++;
              totalPts += tweet.pts;
              score += tweet.pts;
              updateUI();
              scoreBar.textContent = `💩 ${closed}/${total} FUD killed — +${totalPts} pts`;
              card.style.animation = 'fadeOut 0.3s forwards';
              setTimeout(() => card.remove(), 300);
              if (closed >= total) {
                clearTimeout(autoEnd);
                setTimeout(() => {
                  container.remove(); scoreBar.remove();
                  window.gamePaused=false; setPaused(false); startSpawning();
                }, 500);
              }
            };
            container.appendChild(card);
            container.style.pointerEvents = 'auto';
          }, i * 800);
        });
      },

      // ================== 💉 SYRINGE — +1 VIE ==================
      '💉': () => {
        // Max 1x per 8 levels
        const lastLifeLevel = parseInt(localStorage.getItem('lastSyringeLevel') || '0');
        if (level - lastLifeLevel < 8 && lastLifeLevel > 0) {
          // Too soon - consolation prize
          const pts = 250;
          score += pts;
          if (typeof MetaGame !== 'undefined') MetaGame.data.currencies.ears = (MetaGame.data.currencies.ears||0)+2;
          MetaGame?.save?.();
          updateUI();
          const msg = document.createElement('div');
          msg.innerHTML = `💉 Too soon! +${pts} pts & +2 👂 instead.`;
          msg.style.cssText = `position:fixed;top:30%;left:50%;transform:translateX(-50%);
            font-size:clamp(18px,3.5vw,26px);color:#ff9900;font-family:'Luckiest Guy',cursive;
            z-index:100010;pointer-events:none;text-shadow:0 0 15px #ff9900;`;
          document.body.appendChild(msg);
          setTimeout(() => msg.remove(), 2000);
          return;
        }
        localStorage.setItem('lastSyringeLevel', level);
        
        // Random reward from pool!
        const rewardPool = [
          { type: 'life', chance: 0.40, apply: () => { lives++; return '❤️ +1 LIFE!'; } },
          { type: 'ears', chance: 0.25, apply: () => { const n=50+Math.floor(Math.random()*100); if(typeof MetaGame!=='undefined'){MetaGame.data.currencies.ears=(MetaGame.data.currencies.ears||0)+n;MetaGame.save();} return `👂 +${n} EARS!`; } },
          { type: 'gems', chance: 0.10, apply: () => { if(typeof MetaGame!=='undefined'){MetaGame.data.currencies.gems=(MetaGame.data.currencies.gems||0)+1;MetaGame.save();} return '💎 +1 GEM!'; } },
          { type: 'score', chance: 0.20, apply: () => { const n=500+Math.floor(score*0.1); score+=n; return `⭐ +${n} POINTS!`; } },
          { type: 'wild', chance: 0.05, apply: () => { lives++; score+=300; const n=20; if(typeof MetaGame!=='undefined'){MetaGame.data.currencies.ears=(MetaGame.data.currencies.ears||0)+n;MetaGame.save();} return '🎉 WILD SHOT! EVERYTHING!'; } },
        ];
        
        const roll = Math.random();
        let cumulative = 0;
        let reward = rewardPool[0];
        for (const r of rewardPool) { cumulative += r.chance; if (roll <= cumulative) { reward = r; break; } }
        const rewardText = reward.apply();
        updateUI();
        
        // Dramatic syringe animation
        const msg = document.createElement('div');
        msg.innerHTML = `<span style="font-size:0.7em;display:block;letter-spacing:2px;color:#aaa;margin-bottom:4px">💉 SYRINGE REWARD</span>${rewardText}`;
        msg.style.cssText = `position:fixed;top:25%;left:50%;transform:translateX(-50%) scale(0);
          font-family:'Luckiest Guy',cursive;font-size:clamp(22px,4.5vw,38px);
          color:#00ff88;
          background:rgba(0,0,0,0.85);
          border:3px solid #00ff88;
          border-radius:16px;
          box-shadow:0 0 30px rgba(0,255,136,0.4),inset 0 0 20px rgba(0,255,136,0.05);
          padding:16px 28px;
          text-align:center;
          text-shadow:0 0 20px #00ff88,2px 2px 0 #000;
          z-index:100010;pointer-events:none;
          transition:transform 0.3s cubic-bezier(0.68,-0.55,0.27,1.55);`;
        document.body.appendChild(msg);
        setTimeout(() => { msg.style.transform = 'translateX(-50%) scale(1)'; }, 50);
        setTimeout(() => msg.remove(), 3000);
        
        if (typeof SoundSystem !== 'undefined') SoundSystem.powerUp();
        rainEmojis('special');
      },

      '🥫': () => {
        if (window.gamePaused || isPaused) return; // Don't double-pause
        window.gamePaused = true; setPaused(true);
        rumorBubble.textContent = "🥫 TEN SECOND TIMEOUT! BREATHE, DEGEN! 🥫";

        const ov = document.createElement('div');
        ov.id = 'canPauseOv';
        ov.style.cssText = `position:fixed;inset:0;z-index:100010;background:rgba(0,0,0,0.92);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;`;

        let timeLeft = 10;
        const box = document.createElement('div');
        box.style.cssText = `background:linear-gradient(135deg,#0a0a0a,#1a1a2a);border:4px solid #FFD700;border-radius:20px;padding:clamp(16px,4vw,28px) clamp(18px,5vw,36px);text-align:center;font-family:'Luckiest Guy',cursive;color:#fff;max-width:360px;width:92%;box-shadow:0 0 40px rgba(255,215,0,0.4);max-height:92vh;overflow-y:auto;`;

        const render = () => {
          const h = document.querySelector('#canPauseOv .can-header');
          const s = document.querySelector('#canPauseOv .can-stats');
          if (!h) return;
          h.innerHTML = `🥫 CANNED <span style="color:#00ff88;font-size:0.85em">${timeLeft}s</span>`;
          s.innerHTML = `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0">
              <div style="background:rgba(255,215,0,0.12);border:2px solid rgba(255,215,0,0.3);border-radius:12px;padding:10px 6px">
                <div style="font-size:clamp(22px,5vw,30px)">👂</div>
                <div style="font-size:clamp(18px,4vw,26px);color:#FFD700;font-family:'Luckiest Guy',cursive">${Math.round(score)}</div>
                <div style="font-size:11px;color:#aaa;letter-spacing:1px">EARS</div>
              </div>
              <div style="background:rgba(255,60,60,0.12);border:2px solid rgba(255,60,60,0.3);border-radius:12px;padding:10px 6px">
                <div style="font-size:clamp(22px,5vw,30px)">❤️</div>
                <div style="font-size:clamp(18px,4vw,26px);color:#ff6666;font-family:'Luckiest Guy',cursive">${lives}</div>
                <div style="font-size:11px;color:#aaa;letter-spacing:1px">LIVES</div>
              </div>
              <div style="background:rgba(255,100,0,0.12);border:2px solid rgba(255,100,0,0.3);border-radius:12px;padding:10px 6px">
                <div style="font-size:clamp(22px,5vw,30px)">🔥</div>
                <div style="font-size:clamp(18px,4vw,26px);color:#ff6600;font-family:'Luckiest Guy',cursive">${(combo+permanentComboBonus).toFixed(1)}x</div>
                <div style="font-size:11px;color:#aaa;letter-spacing:1px">COMBO</div>
              </div>
              <div style="background:rgba(0,255,136,0.12);border:2px solid rgba(0,255,136,0.3);border-radius:12px;padding:10px 6px">
                <div style="font-size:clamp(22px,5vw,30px)">📡</div>
                <div style="font-size:clamp(18px,4vw,26px);color:#00ff88;font-family:'Luckiest Guy',cursive">LVL ${level}</div>
                <div style="font-size:11px;color:#aaa;letter-spacing:1px">LEVEL</div>
              </div>
            </div>
            <div style="font-size:clamp(11px,2vw,13px);color:#888;margin-top:4px">HIGH SCORE: <span style="color:#FFD700">${formatNumber(highScore)}</span> 👂</div>`;
        };

        box.innerHTML = `
          <div class="can-header" style="font-size:clamp(24px,5.5vw,36px);color:#FFD700;margin-bottom:4px;font-family:'Luckiest Guy',cursive;text-shadow:0 0 20px #FFD700,2px 2px 0 #000">🥫 CANNED <span style="color:#00ff88;font-size:0.85em">${timeLeft}s</span></div>
          <div style="font-size:clamp(12px,2.5vw,15px);color:#aaa;margin-bottom:8px">breathe degen, you got this</div>
          <div class="can-stats"></div>
          <button id="canResume" style="background:linear-gradient(135deg,#00ff88,#00cc44);border:3px solid #fff;border-radius:14px;padding:14px 36px;font-family:'Luckiest Guy',cursive;font-size:clamp(18px,4vw,24px);color:#000;cursor:pointer;margin-top:12px;box-shadow:0 0 25px #00ff88,0 4px 0 #009944;text-shadow:none;touch-action:manipulation;">▶️ KEEP HUSTIN'</button>
        `;
        ov.appendChild(box);
        document.body.appendChild(ov);

        render();

        const countdownInterval = setInterval(() => {
          timeLeft--;
          const h = document.querySelector('#canPauseOv .can-header');
          if (h) h.textContent = `🥫 CANNED — ${timeLeft}s`;
          if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            closeCan();
          }
        }, 1000);

        const closeCan = () => {
          clearInterval(countdownInterval);
          const o = document.getElementById('canPauseOv');
          if (o) { o.style.opacity='0'; o.style.transition='opacity 0.3s'; setTimeout(() => o.remove(), 300); }
          window.gamePaused = false; setPaused(false); startSpawning();
        };

        document.getElementById('canResume').onclick = closeCan;

        // TTS summary
        if (typeof SoundSystem !== 'undefined' && SoundSystem.speak) {
          setTimeout(() => SoundSystem.speak(`Ten seconds! You have ${lives} lives and ${Math.round(score)} points! Level ${level}! LFG!`), 300);
        } else if (window.speechSynthesis) {
          const utt = new SpeechSynthesisUtterance(`Ten seconds! Level ${level}. Score ${Math.round(score)}. ${lives} lives. LFG!`);
          utt.rate = 1.1; window.speechSynthesis.speak(utt);
        }
      },

            '🛡️': () => {
        try { if(typeof SoundSystem!=='undefined') SoundSystem.powerUp(); } catch(e) {}
        invincibleMode=true; window.shieldActive=true;
        rumorBubble.textContent='🛡️ SHIELD! 10s INVINCIBILITY!';
        if(!document.getElementById('shieldStyle')){const ss=document.createElement('style');ss.id='shieldStyle';ss.textContent='@keyframes shieldPulse{0%,100%{box-shadow:inset 0 0 60px rgba(0,200,255,0.15),0 0 40px rgba(0,200,255,0.3)}50%{box-shadow:inset 0 0 100px rgba(0,200,255,0.3),0 0 80px rgba(0,200,255,0.6)}}@keyframes shieldBreak{0%{opacity:1}100%{opacity:0;transform:scale(1.3)}}';document.head.appendChild(ss);}
        const ring=document.createElement('div'); ring.id='shieldRing';
        ring.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:100;border:4px solid rgba(0,200,255,0.6);box-shadow:inset 0 0 60px rgba(0,200,255,0.15),0 0 40px rgba(0,200,255,0.3);border-radius:8px;animation:shieldPulse 1s ease-in-out infinite;';
        const timer=document.createElement('div'); timer.id='shieldTimer';
        timer.style.cssText='position:fixed;top:14%;left:50%;transform:translateX(-50%);font-family:"Luckiest Guy",cursive;font-size:clamp(14px,3vw,20px);color:#00c8ff;text-shadow:0 0 15px #00c8ff;z-index:200;pointer-events:none;';
        timer.textContent='🛡️ 10s'; document.body.appendChild(ring); document.body.appendChild(timer);
        let s=10; const si=setInterval(()=>{ s--; if(timer) timer.textContent=`🛡️ ${s}s`;
          if(s<=0){ clearInterval(si); invincibleMode=false; window.shieldActive=false;
            ring.style.animation='shieldBreak 0.4s ease-out forwards';
            setTimeout(()=>{ ring.remove(); timer.remove(); },400);
            rumorBubble.textContent='🛡️ SHIELD BROKEN!';
            try { if(typeof SoundSystem!=='undefined') SoundSystem.miss(); } catch(e) {}
          }},1000);
        updateUI();
      },
      // Previously missing handlers
            '👻': () => {
        try { if(typeof SoundSystem!=='undefined') SoundSystem.ghost(); } catch(e) {}
        combo=Math.min(combo+2,50); rumorBubble.textContent='👻 GHOST MODE! 2× POINTS 4s!';
        document.querySelectorAll('.ear.active').forEach(e=>{
          const o=e.style.filter; e.style.filter='drop-shadow(0 0 20px #c77dff) brightness(1.5)'; e.style.transform='scale(1.2)';
          setTimeout(()=>{ e.style.filter=o; e.style.transform=''; },800);
        });
        window.ghostMode=true;
        const msg=document.createElement('div'); msg.innerHTML='👻 GHOST MODE! 2× POINTS 👻';
        msg.style.cssText='position:fixed;top:15%;left:50%;transform:translateX(-50%);font-family:"Luckiest Guy",cursive;font-size:clamp(18px,4vw,28px);color:#c77dff;text-shadow:0 0 25px #c77dff,3px 3px 0 #000;z-index:100020;pointer-events:none;';
        document.body.appendChild(msg); setTimeout(()=>{ window.ghostMode=false; msg.remove(); },4000); updateUI();
      },
            '☠️': () => {
        score+=400*combo; rumorBubble.textContent='☠️ DEFUSED! +'+Math.round(400*combo)+'!';
        try { if(typeof SoundSystem!=='undefined') SoundSystem.diamond(); } catch(e) {}
        if(typeof VisualEffects!=='undefined') VisualEffects.flashScreen('#9400d3',200);
        const msg=document.createElement('div'); msg.innerHTML=`☠️ DEFUSED! +${Math.round(400*combo)}`;
        msg.style.cssText='position:fixed;top:25%;left:50%;transform:translateX(-50%);font-family:"Luckiest Guy",cursive;font-size:clamp(22px,5vw,38px);color:#9400d3;text-shadow:0 0 25px #9400d3,3px 3px 0 #000;z-index:100020;pointer-events:none;';
        document.body.appendChild(msg); setTimeout(()=>msg.remove(),1500); updateUI();
      },
      '🕵️‍♂️': () => {
        // CABAL BOOSTER: skip ahead levels
        const levelsToSkip = Math.floor(Math.random() * 2) + 1; // 1-2 levels
        const oldLevel = level;
        level = Math.min(level + levelsToSkip, maxLevels - 1);
        // Proper score target for new level
        nextLevelScore = getLevelScoreTarget(level + 1);
        score = nextLevelScore - 1; // Just below next threshold
        rumorBubble.textContent = `🕵️ CABAL ACTIVATED! SKIPPING ${levelsToSkip} LEVELS! 🕵️`;
        if (typeof SoundSystem !== 'undefined') SoundSystem.levelUp();
        if (typeof VisualEffects !== 'undefined') {
          VisualEffects.flashScreen('#9400d3', 400);
          VisualEffects.screenShake(12, 400);
        }
        // Dramatic notification
        const cabalMsg = document.createElement('div');
        cabalMsg.innerHTML = `🕵️ CABAL! +${level - oldLevel} LEVELS!`;
        cabalMsg.style.cssText = `position:fixed;top:20%;left:50%;transform:translateX(-50%);
          font-family:'Luckiest Guy',cursive;font-size:clamp(26px,5vw,44px);
          color:#9400d3;text-shadow:0 0 30px #9400d3,0 0 60px #ff00ff,3px 3px 0 #000;
          z-index:100020;pointer-events:none;animation:messagePulse 0.5s ease-out;`;
        document.body.appendChild(cabalMsg);
        setTimeout(() => cabalMsg.remove(), 2500);
        updateUI();
        setTimeout(() => showLevelUp(), 800);
      },
            '🤡': () => {
        try { if (typeof SoundSystem!=='undefined') SoundSystem.bark(); } catch(e) {}
        const allEars=Array.from(document.querySelectorAll('.ear'));
        const prevTxt=allEars.map(e=>e.textContent), prevAct=allEars.map(e=>e.classList.contains('active'));
        allEars.forEach(e=>{ e.textContent='😂'; e.classList.add('active'); e.style.animation='earPop 0.3s ease-in-out infinite'; });
        document.querySelectorAll('.hole').forEach(h=>{ h.style.filter='hue-rotate(120deg) saturate(3)'; });
        const fx=[
          {txt:'🤡 HONK HONK! +1500!',col:'#FF6600',fn:()=>{score+=1500;updateUI();}},
          {txt:'🤡 STOLE A LIFE!',col:'#ff0000',fn:()=>{lives=Math.max(1,lives-1);updateUI();}},
          {txt:'🤡 MEGA COMBO +3!',col:'#FFD700',fn:()=>{combo+=3;updateUI();}},
          {txt:'🤡 CHAOS -500!',col:'#ff4444',fn:()=>{score=Math.max(0,score-500);updateUI();}},
          {txt:'🤡 TRIPLE HONK +2500!',col:'#00ff88',fn:()=>{score+=2500;updateUI();}},
        ];
        const p=fx[Math.floor(Math.random()*fx.length)]; p.fn();
        if(!document.getElementById('clownStyle')){const s=document.createElement('style');s.id='clownStyle';s.textContent='@keyframes clownBounce{0%,100%{transform:scale(1)rotate(-8deg)}50%{transform:scale(1.15)rotate(8deg)}}';document.head.appendChild(s);}
        const ov=document.createElement('div');
        ov.style.cssText='position:fixed;inset:0;display:flex;align-items:center;justify-content:center;flex-direction:column;z-index:100015;pointer-events:none;background:radial-gradient(ellipse,rgba(255,80,0,0.15) 0%,transparent 70%);';
        ov.innerHTML=`<div style="font-size:clamp(100px,25vw,160px);animation:clownBounce 0.4s ease-in-out infinite">🤡</div><div style="font-family:'Luckiest Guy',cursive;font-size:clamp(18px,4vw,32px);color:${p.col};text-shadow:0 0 20px ${p.col},4px 4px 0 #000;text-align:center;padding:0 16px">${p.txt}</div>`;
        document.body.appendChild(ov); rumorBubble.textContent=p.txt;
        setTimeout(()=>{ allEars.forEach((e,i)=>{ e.textContent=prevTxt[i]||''; e.style.animation=''; if(!prevAct[i]) e.classList.remove('active'); }); document.querySelectorAll('.hole').forEach(h=>h.style.filter=''); ov.remove(); },2000);
      },

      '📈': () => {
        rumorBubble.textContent = '📈 HEARING TRADER! DEGEN MODE ACTIVATED!';
        if (typeof SoundSystem !== 'undefined') try { SoundSystem.bonus(); } catch(e) {}
        if (typeof MiniGames !== 'undefined' && MiniGames.showMiniTrader) {
          const game = { score, updateUI, addScore: (pts) => { score += pts; updateUI(); }, level };
          setTimeout(() => MiniGames.showMiniTrader(game), 400);
        }
      },

    }; // close bonusActions



    // Export trigger for external use (level events)
    window.triggerBonusSymbol = (sym) => {
      const act = bonusActions[sym];
      if (act) { act(); rumorBubble.classList.add("show"); setTimeout(() => rumorBubble.classList.remove("show"), 1800); }
    };

    const action = bonusActions[symbol];
    if (action) {
      action();
      rumorBubble.classList.add("show");
      setTimeout(() => rumorBubble.classList.remove("show"), 1800);
      vibrate([100, 50, 150]);
      // Track unique bonuses for bonus_collector achievement
      if (typeof MetaGame !== 'undefined') {
        MetaGame.data.stats = MetaGame.data.stats || {};
        MetaGame.data.stats.uniqueBonusSet = MetaGame.data.stats.uniqueBonusSet || {};
        MetaGame.data.stats.uniqueBonusSet[symbol] = true;
        MetaGame.data.stats.uniqueBonusCount = Object.keys(MetaGame.data.stats.uniqueBonusSet).length;
        if (MetaGame.data.stats.uniqueBonusCount >= 34) {
          try { MetaGame.checkAchievements({...MetaGame.data.stats, uniqueBonuses: MetaGame.data.stats.uniqueBonusCount}); } catch(e) {}
        }
      }
    }

    if (Math.random() < 0.03 && symbol !== '💀') {
      setTimeout(triggerRugPull, 800);
    }
  }

  function endGame() {
    // 🛡️ Miss Shield shop perk: absorb first miss
    if (window._missShield) {
      window._missShield = false;
      const shieldNotif = document.createElement('div');
      shieldNotif.textContent = '🛡️ SHIELD ABSORBED!';
      shieldNotif.style.cssText = `position:fixed;top:40%;left:50%;transform:translate(-50%,-50%);
        font-family:'Luckiest Guy',cursive;font-size:clamp(24px,5vw,36px);color:#00ffff;
        text-shadow:0 0 20px #00ffff;z-index:100020;pointer-events:none;animation:fadeOut 1.5s forwards`;
      document.body.appendChild(shieldNotif);
      setTimeout(() => shieldNotif.remove(), 1500);
      return; // Block the miss entirely
    }
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
      clearInterval(window.gameIntervals.spawnWatchdog);
      window.gameIntervals = null;
    }
    
    finalScoreEl.textContent = Math.round(score);
    finalHighScoreEl.textContent = formatNumber(highScore);
    finalComboEl.textContent = `x${(combo + permanentComboBonus).toFixed(1)}`;
    finalMissesEl.textContent = `${streak}/${maxStreak}`;
    
    // Store the level at game over for accurate display
    gameOverLevel = level;
    if (finalLevelEl) finalLevelEl.textContent = `Level ${level}`; // Use level directly
    
    // 🔥 CRITICAL: Afficher le game over screen AVANT tout le reste
    gameOverScreen.style.display = "flex";
    
    const nameInputSection = document.getElementById('nameInputSection');
    const submitScoreBtn = document.getElementById('submitScoreBtn');
    const playerNameInput = document.getElementById('playerNameInput');
    
    nameInputSection.style.display = 'block';
    
    // 💎 Convert score to 👂 meta-currency at game over
    try {
      if (typeof MetaGame !== 'undefined') {
        const earnedEars = Math.floor(score / 100);
        if (earnedEars > 0) {
          MetaGame.data.currencies.ears = (MetaGame.data.currencies.ears||0) + earnedEars;
          MetaGame.updateEarsBadge(); MetaGame.save();
          MetaGame.checkAchievements({
            currentScore: Math.round(score), levelReached: level, currentCombo: Math.floor(combo),
            wonWith1Life: lives <= 1, livesUsed: (MetaGame.data.stats && MetaGame.data.stats.livesUsed) || 0,
            uniqueBonuses: (MetaGame.data.stats && MetaGame.data.stats.uniqueBonusCount) || 0,
            uniqueMiniGames: (MetaGame.data.stats && MetaGame.data.stats.uniqueMiniGamesCount) || 0
          });
          const n = document.createElement('div');
          n.style.cssText = `position:fixed;top:20px;right:20px;background:linear-gradient(145deg,#FFD700,#FFA000);color:#000;font-family:'Luckiest Guy',cursive;font-size:20px;padding:14px 22px;border-radius:12px;z-index:100001;box-shadow:0 0 25px rgba(255,215,0,0.6)`;
          n.textContent = `+${earnedEars} 👂 EARNED!`;
          document.body.appendChild(n); setTimeout(() => n.remove(), 3000);
        }
      }
    } catch(e2) {}
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
    const shareLevel = gameOverLevel || level; // Fallback to live level
    const messages = [
      `Just whacked ${Math.round(score)} RUMORS! 👂💀🔥\n\nLevel ${shareLevel} | Combo x${(combo + permanentComboBonus).toFixed(1)}\n\n@hearingmeme game is TOO ADDICTIVE!\n\nBeat my score:\nhttps://hearingthings.meme/\n\n#HEARING #Solana`,
      
      `Absolutely DEMOLISHED ${Math.round(score)} rumors! 💎⚡\n\nLevel ${shareLevel} (${levelNames[gameOverLevel-1] || 'ULTIMATE'})\n\n@hearingmeme is pure chaos! 🔥\n\nYour turn:\nhttps://hearingthings.meme/\n\n#HEARING #DegenGaming`,
      
      `BIG IF TRUE: Just scored ${Math.round(score)} on @hearingmeme! 👂🚀\n\nLevel ${shareLevel} | High Score: ${formatNumber(highScore)}\n\nCan you beat me?\nhttps://hearingthings.meme/\n\n#HEARING #Solana #Crypto`,
      
      `I've been HEARING THINGS... 👂💀\n\nAnd whacking them into oblivion!\n\nScore: ${Math.round(score)} | Level ${shareLevel}\n\n@hearingmeme\nhttps://hearingthings.meme/\n\n#HEARING #MemeGaming`,
      
      `SAW IT ON BIZ: @hearingmeme's game is INSANE! 🎮💥\n\nJust hit ${Math.round(score)} points, level ${shareLevel}!\n\nPlay now:\nhttps://hearingthings.meme/\n\n#HEARING #Solana #Degen`
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

  let _lastMagnetFrame = 0;
  function updateMagnetMode(ts) {
    if (!magnetMode) return;
    // Throttle to ~30fps max for magnet (was running at full 60-120fps)
    if (ts - _lastMagnetFrame < 33) {
      requestAnimationFrame(updateMagnetMode); return;
    }
    _lastMagnetFrame = ts;
    const ears = document.querySelectorAll('.ear.active');
    ears.forEach(ear => {
      const rect = ear.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = window.mouseX - cx;
      const dy = window.mouseY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        const force = (200 - dist) / 200;
        ear.style.transform = `translate(${dx * force * 0.3}px, ${dy * force * 0.3}px) scale(${1 + force * 0.2})`;
      } else {
        ear.style.transform = '';
      }
    });
    if (magnetMode) requestAnimationFrame(updateMagnetMode);
  }

  window.mouseX = 0;
  window.mouseY = 0;
  let _mouseMoveThrottle = 0;
  document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - _mouseMoveThrottle < 16) return; // max 60fps
    _mouseMoveThrottle = now;
    window.mouseX = e.clientX;
    window.mouseY = e.clientY;
  }, { passive: true });

  // Export startGame function globally for retry button
  window.startGame = startGame;

  highScoreEl.textContent = formatNumber(highScore);
  if (currentLevelEl) currentLevelEl.textContent = ` ${level}`;
});