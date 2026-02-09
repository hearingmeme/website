// ==================== META GAME SYSTEM ====================

const MetaGame = {
  // Data structure
  data: {
    currencies: {
      ears: 0,      // Earned from playing (1 ear = 100 points)
      gems: 0       // Premium currency (achievements, milestones)
    },
    
    stats: {
      totalGamesPlayed: 0,
      totalPlaytime: 0,
      totalPointsEarned: 0,
      highestLevel: 0,
      highestScore: 0,
      longestCombo: 0,
      
      totalEarsClicked: 0,
      totalBonusesCollected: 0,
      totalMinigamesPlayed: 0,
      totalMinigamesWon: 0,
      
      accuracy: 0,
      averageReactionTime: 0,
      fastestClick: 999
    },
    
    unlocks: [],
    
    achievements: {},
    
    multipliers: {
      permanent: 1.0
    },
    
    settings: {
      tutorialCompleted: false,
      soundEnabled: true,
      ttsEnabled: true,
      particlesQuality: 'high'
    }
  },

  // Initialize
  init() {
    this.loadFromLocalStorage();
    this.setupAchievements();
    this.createMetaGameButton(); // 🔥 V17 FIX: Créer le bouton 💎
  },
  
  // ==================== UI ====================
  
  createMetaGameButton() {
    // Attendre que le DOM soit chargé
    setTimeout(() => {
      const header = document.querySelector('.game-header-controls');
      if (!header) {
        console.log('Header not found, retrying...');
        setTimeout(() => this.createMetaGameButton(), 500);
        return;
      }
      
      // Vérifier si le bouton existe déjà
      if (document.getElementById('metaGameBtn')) return;
      
      const metaBtn = document.createElement('button');
      metaBtn.id = 'metaGameBtn';
      metaBtn.className = 'header-btn';
      metaBtn.innerHTML = '💎';
      metaBtn.title = 'Achievements & Meta Game';
      metaBtn.style.cssText = `
        background: linear-gradient(145deg, #9C27B0, #7B1FA2);
        border: 2px solid #BA68C8;
        position: relative;
      `;
      
      // Badge pour afficher les Ears
      const badge = document.createElement('div');
      badge.id = 'earsBadge';
      badge.style.cssText = `
        position: absolute;
        top: -8px;
        right: -8px;
        background: #FFD700;
        color: #000;
        font-family: 'Luckiest Guy', cursive;
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 10px;
        border: 1px solid #FFA000;
        box-shadow: 0 0 10px rgba(255, 215, 0, 0.6);
        pointer-events: none;
      `;
      badge.textContent = this.getCurrency('ears');
      metaBtn.appendChild(badge);
      
      metaBtn.addEventListener('click', () => this.openMetaGameMenu());
      
      // Insérer après le bouton tutorial (ou au début)
      const tutorialBtn = document.getElementById('tutorialBtn');
      if (tutorialBtn) {
        header.insertBefore(metaBtn, tutorialBtn.nextSibling);
      } else {
        header.insertBefore(metaBtn, header.children[1]);
      }
      
      console.log('✅ Meta Game button created!');
    }, 100);
  },
  
  updateEarsBadge() {
    const badge = document.getElementById('earsBadge');
    if (badge) {
      badge.textContent = this.getCurrency('ears');
    }
  },
  
  openMetaGameMenu() {
    const menu = document.createElement('div');
    menu.id = 'metaGameMenu';
    menu.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.95);
      z-index: 100020;
      overflow-y: auto;
      padding: 20px;
      animation: fadeIn 0.3s;
    `;
    
    menu.innerHTML = `
      <div style="max-width: 1200px; margin: 0 auto;">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
        ">
          <div style="
            font-size: clamp(36px, 6vw, 54px);
            color: #FFD700;
            font-family: 'Luckiest Guy', cursive;
            text-shadow: 0 0 30px #FFD700, 3px 3px 0 #000;
          ">💎 ACHIEVEMENTS 💎</div>
          
          <button id="closeMetaGame" style="
            font-size: 32px;
            background: #ff0000;
            color: #fff;
            border: none;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            cursor: pointer;
            font-family: 'Luckiest Guy', cursive;
          ">✖</button>
        </div>
        
        <!-- Currency Display -->
        <div style="
          display: flex;
          gap: 30px;
          justify-content: center;
          margin-bottom: 40px;
        ">
          <div style="
            background: linear-gradient(145deg, rgba(255, 215, 0, 0.2), rgba(255, 160, 0, 0.2));
            border: 3px solid #FFD700;
            border-radius: 15px;
            padding: 20px 40px;
            text-align: center;
          ">
            <div style="font-size: 48px;">👂</div>
            <div style="
              font-family: 'Luckiest Guy', cursive;
              font-size: 36px;
              color: #FFD700;
              text-shadow: 0 0 20px #FFD700;
            ">${this.getCurrency('ears')}</div>
            <div style="
              font-family: 'Luckiest Guy', cursive;
              font-size: 18px;
              color: #fff;
            ">EARS</div>
          </div>
          
          <div style="
            background: linear-gradient(145deg, rgba(156, 39, 176, 0.2), rgba(123, 31, 162, 0.2));
            border: 3px solid #BA68C8;
            border-radius: 15px;
            padding: 20px 40px;
            text-align: center;
          ">
            <div style="font-size: 48px;">💎</div>
            <div style="
              font-family: 'Luckiest Guy', cursive;
              font-size: 36px;
              color: #BA68C8;
              text-shadow: 0 0 20px #BA68C8;
            ">${this.getCurrency('gems')}</div>
            <div style="
              font-family: 'Luckiest Guy', cursive;
              font-size: 18px;
              color: #fff;
            ">GEMS</div>
          </div>
        </div>
        
        <!-- Achievements Grid -->
        <div id="achievementsGrid"></div>
      </div>
    `;
    
    document.body.appendChild(menu);
    
    // Close button
    document.getElementById('closeMetaGame').addEventListener('click', () => menu.remove());
    
    // Load achievements
    this.showAchievements();
  },
  
  showAchievements() {
    const grid = document.getElementById('achievementsGrid');
    if (!grid) return;
    
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    `;
    
    let html = '';
    
    Object.values(this.achievementsList || {}).forEach(ach => {
      const isUnlocked = this.data.achievements[ach.id]?.unlocked || false;
      const progress = this.data.achievements[ach.id]?.progress || 0;
      const progressPercent = Math.min((progress / ach.target) * 100, 100);
      
      html += `
        <div style="
          background: ${isUnlocked ? 'linear-gradient(145deg, rgba(0, 255, 136, 0.2), rgba(0, 204, 102, 0.2))' : 'rgba(255, 255, 255, 0.05)'};
          border: 3px solid ${isUnlocked ? '#00ff88' : '#444'};
          border-radius: 15px;
          padding: 20px;
          position: relative;
          ${isUnlocked ? 'box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);' : ''}
        ">
          <div style="font-size: 48px; text-align: center; margin-bottom: 10px;">
            ${isUnlocked ? '✅' : '🔒'} ${ach.icon}
          </div>
          
          <div style="
            font-family: 'Luckiest Guy', cursive;
            font-size: 20px;
            color: ${isUnlocked ? '#00ff88' : '#fff'};
            text-align: center;
            margin-bottom: 8px;
          ">${ach.name}</div>
          
          <div style="
            font-family: 'Luckiest Guy', cursive;
            font-size: 14px;
            color: #aaa;
            text-align: center;
            margin-bottom: 15px;
          ">${ach.desc}</div>
          
          ${!isUnlocked ? `
            <div style="
              width: 100%;
              height: 8px;
              background: rgba(0, 0, 0, 0.5);
              border-radius: 5px;
              overflow: hidden;
              margin-bottom: 8px;
            ">
              <div style="
                height: 100%;
                width: ${progressPercent}%;
                background: linear-gradient(90deg, #00ffff, #00ff88);
                transition: width 0.5s;
              "></div>
            </div>
            <div style="
              font-family: 'Luckiest Guy', cursive;
              font-size: 12px;
              color: #00ffff;
              text-align: center;
            ">${progress} / ${ach.target}</div>
          ` : `
            <div style="
              font-family: 'Luckiest Guy', cursive;
              font-size: 16px;
              color: #FFD700;
              text-align: center;
            ">Reward: ${ach.reward.ears}👂 ${ach.reward.gems}💎</div>
          `}
        </div>
      `;
    });
    
    grid.innerHTML = html;
  },

  // ==================== CURRENCY ====================
  
  addCurrency(type, amount) {
    this.data.currencies[type] = (this.data.currencies[type] || 0) + amount;
    this.save();
    this.showCurrencyNotification(type, amount);
    
    // 🔥 V17 FIX: Mettre à jour le badge
    if (type === 'ears') {
      this.updateEarsBadge();
    }
  },

  spendCurrency(type, amount) {
    if (this.data.currencies[type] >= amount) {
      this.data.currencies[type] -= amount;
      this.save();
      return true;
    }
    return false;
  },

  getCurrency(type) {
    return this.data.currencies[type] || 0;
  },

  showCurrencyNotification(type, amount) {
    const icon = type === 'ears' ? '👂' : '💎';
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: rgba(0,255,0,0.9);
      color: #000;
      padding: 15px 25px;
      border-radius: 10px;
      font-family: 'Luckiest Guy', cursive;
      font-size: 24px;
      z-index: 10000;
      animation: slideInRight 0.5s, fadeOut 0.5s 2s forwards;
      box-shadow: 0 0 20px rgba(0,255,0,0.8);
    `;
    notification.textContent = `${icon} +${amount} ${type}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2500);
  },

  // ==================== ACHIEVEMENTS ====================

  setupAchievements() {
    this.achievementsList = {
      // Skill-based
      perfect_game: {
        id: 'perfect_game',
        name: 'Perfect Hearing',
        description: 'Complete level 5 without missing',
        icon: '🎯',
        reward: { ears: 100 },
        check: (stats) => stats.levelCompleted >= 5 && stats.levelMisses === 0,
        unlocked: false
      },
      
      combo_master: {
        id: 'combo_master',
        name: 'Combo God',
        description: 'Reach 100x combo',
        icon: '🔥',
        reward: { ears: 200 },
        check: (stats) => stats.currentCombo >= 100,
        unlocked: false
      },

      speed_demon: {
        id: 'speed_demon',
        name: 'Lightning Reflexes',
        description: 'Click 50 ears in 30 seconds',
        icon: '⚡',
        reward: { ears: 150 },
        check: (stats) => stats.earsIn30s >= 50,
        unlocked: false
      },

      // Survival
      survivor: {
        id: 'survivor',
        name: 'Last Stand',
        description: 'Win with 1 life remaining',
        icon: '❤️',
        reward: { ears: 200 },
        check: (stats) => stats.wonWith1Life,
        unlocked: false
      },

      immortal: {
        id: 'immortal',
        name: 'Immortal',
        description: 'Reach level 20 without using a life',
        icon: '💚',
        reward: { ears: 500 },
        check: (stats) => stats.levelReached >= 20 && stats.livesUsed === 0,
        unlocked: false
      },

      // Mini-games
      memory_genius: {
        id: 'memory_genius',
        name: 'Photographic Memory',
        description: 'Win Memory Game at 12 holes',
        icon: '🧠',
        reward: { ears: 300 },
        check: (stats) => stats.memoryGameHoles >= 12 && stats.memoryGameWon,
        unlocked: false
      },

      blackjack_pro: {
        id: 'blackjack_pro',
        name: 'Blackjack Pro',
        description: 'Win 5 Blackjack games in a row',
        icon: '🃏',
        reward: { ears: 250 },
        check: (stats) => stats.blackjackStreak >= 5,
        unlocked: false
      },

      hearinko_lucky: {
        id: 'hearinko_lucky',
        name: 'Lucky 10x',
        description: 'Hit 10x on Hearinko',
        icon: '🎈',
        reward: { ears: 400 },
        check: (stats) => stats.hearinkoMax >= 10,
        unlocked: false
      },

      // Collection
      bonus_collector: {
        id: 'bonus_collector',
        name: 'Gotta Catch Em All',
        description: 'Collect all 34 different bonuses',
        icon: '💎',
        reward: { ears: 1000, gems: 10 },
        check: (stats) => stats.uniqueBonuses >= 34,
        unlocked: false
      },

      minigame_master: {
        id: 'minigame_master',
        name: 'Mini-game Master',
        description: 'Win all 9 different mini-games',
        icon: '🎮',
        reward: { ears: 800, gems: 5 },
        check: (stats) => stats.uniqueMinigamesWon >= 9,
        unlocked: false
      },

      // Progression
      level_10: {
        id: 'level_10',
        name: 'Getting Started',
        description: 'Reach level 10',
        icon: '🥉',
        reward: { ears: 100 },
        check: (stats) => stats.levelReached >= 10,
        unlocked: false
      },

      level_25: {
        id: 'level_25',
        name: 'Halfway There',
        description: 'Reach level 25',
        icon: '🥈',
        reward: { ears: 250 },
        check: (stats) => stats.levelReached >= 25,
        unlocked: false
      },

      level_50: {
        id: 'level_50',
        name: 'Hearing God',
        description: 'Reach level 50',
        icon: '🥇',
        reward: { ears: 1000, gems: 20 },
        check: (stats) => stats.levelReached >= 50,
        unlocked: false
      },

      // Score
      score_10k: {
        id: 'score_10k',
        name: 'Point Hunter',
        description: 'Score 10,000 points in one game',
        icon: '💯',
        reward: { ears: 150 },
        check: (stats) => stats.currentScore >= 10000,
        unlocked: false
      },

      score_100k: {
        id: 'score_100k',
        name: 'Point Master',
        description: 'Score 100,000 points in one game',
        icon: '💰',
        reward: { ears: 500, gems: 5 },
        check: (stats) => stats.currentScore >= 100000,
        unlocked: false
      }
    };

    // Load unlocked status
    if (this.data.achievements) {
      Object.keys(this.data.achievements).forEach(key => {
        if (this.achievementsList[key]) {
          this.achievementsList[key].unlocked = this.data.achievements[key];
        }
      });
    }
  },

  checkAchievements(gameStats) {
    Object.values(this.achievementsList).forEach(achievement => {
      if (!achievement.unlocked && achievement.check(gameStats)) {
        this.unlockAchievement(achievement);
      }
    });
  },

  unlockAchievement(achievement) {
    achievement.unlocked = true;
    this.data.achievements[achievement.id] = true;
    
    // Give rewards
    if (achievement.reward.ears) {
      this.addCurrency('ears', achievement.reward.ears);
    }
    if (achievement.reward.gems) {
      this.addCurrency('gems', achievement.reward.gems);
    }

    // Show notification
    this.showAchievementUnlock(achievement);
    
    this.save();
  },

  showAchievementUnlock(achievement) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(145deg, #1a1a2e, #000);
      border: 4px solid #FFD700;
      padding: 40px;
      border-radius: 20px;
      z-index: 99999;
      text-align: center;
      box-shadow: 0 0 50px rgba(255,215,0,0.8);
      animation: bounceIn 0.5s;
    `;

    notification.innerHTML = `
      <div style="
        font-size: 80px;
        margin-bottom: 20px;
        animation: rotatePulse 2s ease-in-out infinite;
      ">${achievement.icon}</div>
      
      <div style="
        font-size: 40px;
        font-family: 'Luckiest Guy', cursive;
        color: #FFD700;
        margin-bottom: 10px;
        text-shadow: 0 0 20px #FFD700;
      ">ACHIEVEMENT UNLOCKED!</div>
      
      <div style="
        font-size: 30px;
        color: #fff;
        margin-bottom: 15px;
        font-family: 'Luckiest Guy', cursive;
      ">${achievement.name}</div>
      
      <div style="
        font-size: 18px;
        color: #aaa;
        margin-bottom: 25px;
      ">${achievement.description}</div>
      
      <div style="
        font-size: 24px;
        color: #00ff00;
        font-family: 'Luckiest Guy', cursive;
      ">
        ${achievement.reward.ears ? `👂 +${achievement.reward.ears} ears` : ''}
        ${achievement.reward.gems ? ` 💎 +${achievement.reward.gems} gems` : ''}
      </div>
    `;

    document.body.appendChild(notification);

    // TTS
    const utterance = new SpeechSynthesisUtterance(
      `Achievement unlocked! ${achievement.name}!`
    );
    utterance.volume = 1.0;
    speechSynthesis.speak(utterance);

    // Sound
    if (typeof SoundSystem !== 'undefined') {
      SoundSystem.jackpot();
    }

    setTimeout(() => notification.remove(), 4000);
  },

  // ==================== STATS ====================

  updateStats(gameStats) {
    // Update global stats
    this.data.stats.totalGamesPlayed++;
    this.data.stats.totalPointsEarned += gameStats.score || 0;
    
    if (gameStats.level > this.data.stats.highestLevel) {
      this.data.stats.highestLevel = gameStats.level;
    }
    
    if (gameStats.score > this.data.stats.highestScore) {
      this.data.stats.highestScore = gameStats.score;
    }
    
    if (gameStats.combo > this.data.stats.longestCombo) {
      this.data.stats.longestCombo = gameStats.combo;
    }

    this.data.stats.totalEarsClicked += gameStats.totalClicks || 0;
    this.data.stats.totalBonusesCollected += gameStats.bonusesCollected || 0;
    this.data.stats.totalMinigamesPlayed += gameStats.minigamesPlayed || 0;
    this.data.stats.totalMinigamesWon += gameStats.minigamesWon || 0;

    // Calculate accuracy
    if (gameStats.totalClicks > 0) {
      const accuracy = (gameStats.successfulClicks / gameStats.totalClicks) * 100;
      this.data.stats.accuracy = Math.round(
        (this.data.stats.accuracy + accuracy) / 2
      );
    }

    this.save();
    
    // Check achievements after updating stats
    this.checkAchievements(gameStats);
    
    // Convert points to ears (1 ear = 100 points)
    const earnedEars = Math.floor(gameStats.score / 100);
    if (earnedEars > 0) {
      this.addCurrency('ears', earnedEars);
    }
  },

  // ==================== UNLOCKS ====================

  unlock(item) {
    if (!this.data.unlocks.includes(item)) {
      this.data.unlocks.push(item);
      this.save();
      
      // Show notification
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 120px;
        right: 20px;
        background: rgba(255,215,0,0.9);
        color: #000;
        padding: 20px 30px;
        border-radius: 10px;
        font-family: 'Luckiest Guy', cursive;
        font-size: 20px;
        z-index: 10000;
        animation: slideInRight 0.5s, fadeOut 0.5s 3s forwards;
        box-shadow: 0 0 30px rgba(255,215,0,0.8);
      `;
      notification.innerHTML = `🔓 UNLOCKED: ${this.formatUnlock(item)}`;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3500);
    }
  },

  isUnlocked(item) {
    return this.data.unlocks.includes(item);
  },

  formatUnlock(unlock) {
    const names = {
      'speed_boost': 'Speed Boost',
      'neon_theme': 'Neon Theme',
      'auto_collect': 'Auto Collect',
      'golden_ear_skin': 'Golden Ear Skin',
      'time_slow_powerup': 'Time Slow',
      'rainbow_theme': 'Rainbow Theme',
      'god_mode_theme': 'God Mode Theme',
      'prestige_mode': 'Prestige Mode'
    };
    return names[unlock] || unlock;
  },

  // ==================== MULTIPLIERS ====================

  addMultiplier(amount) {
    this.data.multipliers.permanent *= amount;
    this.save();
  },

  getMultiplier() {
    return this.data.multipliers.permanent;
  },

  // ==================== PERSISTENCE ====================

  save() {
    try {
      localStorage.setItem('hearingThings_metaGame', JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to save meta game:', e);
    }
  },

  loadFromLocalStorage() {
    try {
      const saved = localStorage.setItem('hearingThings_metaGame');
      if (saved) {
        const data = JSON.parse(saved);
        this.data = { ...this.data, ...data };
      }
    } catch (e) {
      console.error('Failed to load meta game:', e);
    }
  },

  // ==================== UI ====================

  showStatsPanel() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      animation: fadeIn 0.3s;
      overflow-y: auto;
    `;

    const stats = this.data.stats;

    overlay.innerHTML = `
      <div style="
        background: linear-gradient(145deg, #1a1a2e, #000);
        border: 4px solid #00ffff;
        padding: 40px;
        border-radius: 20px;
        max-width: 800px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
      ">
        <div style="
          font-size: 50px;
          font-family: 'Luckiest Guy', cursive;
          color: #00ffff;
          text-align: center;
          margin-bottom: 30px;
          text-shadow: 0 0 20px #00ffff;
        ">📊 YOUR STATS</div>

        <div style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        ">
          <div class="stat-card">
            <div class="stat-label">Total Games</div>
            <div class="stat-value">${stats.totalGamesPlayed}</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-label">Highest Level</div>
            <div class="stat-value">${stats.highestLevel}</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-label">Highest Score</div>
            <div class="stat-value">${stats.highestScore.toLocaleString()}</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-label">Longest Combo</div>
            <div class="stat-value">${stats.longestCombo}x</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-label">Total Points Earned</div>
            <div class="stat-value">${stats.totalPointsEarned.toLocaleString()}</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-label">Ears Clicked</div>
            <div class="stat-value">${stats.totalEarsClicked}</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-label">Bonuses Collected</div>
            <div class="stat-value">${stats.totalBonusesCollected}</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-label">Mini-games Won</div>
            <div class="stat-value">${stats.totalMinigamesWon}/${stats.totalMinigamesPlayed}</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-label">Accuracy</div>
            <div class="stat-value">${stats.accuracy}%</div>
          </div>
        </div>

        <button id="closeStats" style="
          width: 100%;
          padding: 20px;
          font-size: 30px;
          font-family: 'Luckiest Guy', cursive;
          background: linear-gradient(145deg, #ff0000, #cc0000);
          color: #fff;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 5px 20px rgba(255,0,0,0.5);
        ">CLOSE</button>
      </div>
    `;

    // Add CSS
    const style = document.createElement('style');
    style.textContent = `
      .stat-card {
        background: rgba(0,255,255,0.1);
        border: 2px solid #00ffff;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
      }
      .stat-label {
        font-size: 16px;
        color: #aaa;
        margin-bottom: 10px;
      }
      .stat-value {
        font-size: 32px;
        font-family: 'Luckiest Guy', cursive;
        color: #00ffff;
        text-shadow: 0 0 10px #00ffff;
      }
    `;
    document.head.appendChild(style);

    document.body.appendChild(overlay);

    document.getElementById('closeStats').addEventListener('click', () => {
      overlay.remove();
    });
  },

  showAchievementsPanel() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      animation: fadeIn 0.3s;
      overflow-y: auto;
    `;

    const totalAchievements = Object.keys(this.achievementsList).length;
    const unlockedCount = Object.values(this.achievementsList).filter(a => a.unlocked).length;
    const percentage = Math.round((unlockedCount / totalAchievements) * 100);

    let achievementsHTML = '';
    Object.values(this.achievementsList).forEach(achievement => {
      const locked = !achievement.unlocked;
      achievementsHTML += `
        <div style="
          background: ${locked ? 'rgba(50,50,50,0.3)' : 'rgba(255,215,0,0.1)'};
          border: 2px solid ${locked ? '#555' : '#FFD700'};
          padding: 20px;
          border-radius: 10px;
          opacity: ${locked ? 0.5 : 1};
          filter: ${locked ? 'grayscale(1)' : 'none'};
        ">
          <div style="font-size: 50px; text-align: center; margin-bottom: 10px;">
            ${achievement.icon}
          </div>
          <div style="
            font-size: 20px;
            font-family: 'Luckiest Guy', cursive;
            color: ${locked ? '#888' : '#FFD700'};
            text-align: center;
            margin-bottom: 5px;
          ">${achievement.name}</div>
          <div style="
            font-size: 14px;
            color: #aaa;
            text-align: center;
            margin-bottom: 10px;
          ">${achievement.description}</div>
          <div style="
            font-size: 16px;
            color: #00ff00;
            text-align: center;
            font-family: 'Luckiest Guy', cursive;
          ">
            ${achievement.reward.ears ? `👂 ${achievement.reward.ears}` : ''}
            ${achievement.reward.gems ? ` 💎 ${achievement.reward.gems}` : ''}
          </div>
        </div>
      `;
    });

    overlay.innerHTML = `
      <div style="
        background: linear-gradient(145deg, #1a1a2e, #000);
        border: 4px solid #FFD700;
        padding: 40px;
        border-radius: 20px;
        max-width: 1000px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
      ">
        <div style="
          font-size: 50px;
          font-family: 'Luckiest Guy', cursive;
          color: #FFD700;
          text-align: center;
          margin-bottom: 20px;
          text-shadow: 0 0 20px #FFD700;
        ">🏆 ACHIEVEMENTS</div>

        <div style="
          text-align: center;
          margin-bottom: 30px;
          font-size: 24px;
          color: #fff;
        ">
          ${unlockedCount} / ${totalAchievements} (${percentage}%)
        </div>

        <div style="
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        ">
          ${achievementsHTML}
        </div>

        <button id="closeAchievements" style="
          width: 100%;
          padding: 20px;
          font-size: 30px;
          font-family: 'Luckiest Guy', cursive;
          background: linear-gradient(145deg, #ff0000, #cc0000);
          color: #fff;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 5px 20px rgba(255,0,0,0.5);
        ">CLOSE</button>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('closeAchievements').addEventListener('click', () => {
      overlay.remove();
    });
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  MetaGame.init();
});

// Expose globally with both names for compatibility
window.MetaGame = MetaGame;
window.MetaGameSystem = MetaGame; // 🔥 V17 FIX: Alias pour compatibilité avec game.js

// 🔥 V17 FIX: Fonction globale pour convertir score en ears
window.convertScoreToEars = function(score) {
  const ears = Math.floor(score / 100); // 1 ear = 100 points
  if (ears > 0 && MetaGame) {
    MetaGame.addCurrency('ears', ears);
  }
  return ears;
};
