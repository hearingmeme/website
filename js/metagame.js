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
      fastestClick: 999,
      // Minigame-specific tracking
      pokerPlayed: 0,
      pokerRoyalFlush: 0,
      hearinkoPlayed: 0,
      hearinkoJackpot: 0,
      crapsNatural: 0,
      traderDegenWin: 0
    },

    prestige: {
      count: 0,           // Number of prestiges
      multiplier: 1.0,    // Score multiplier from prestige
      totalEarsEver: 0    // Lifetime 👂 earned (resets on prestige but tracked)
    },

    streak: {
      current: 0,         // Days in a row
      best: 0,
      lastPlayDate: null  // ISO date string
    },

    shop: {
      purchased: []       // Array of item IDs
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
      
      // Check si le bouton existe déjà
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
    
    const ears = this.getCurrency('ears');
    const gems = this.getCurrency('gems');
    const prestige = this.data.prestige || {count:0,multiplier:1.0};
    const streak = this.data.streak || {current:0,best:0};
    const isMob = window.innerWidth < 768;

    menu.innerHTML = `
      <div style="max-width:900px;margin:0 auto;font-family:'Luckiest Guy',cursive;">
        <!-- Header -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div style="font-size:clamp(28px,6vw,48px);color:#FFD700;
            text-shadow:0 0 30px #FFD700,3px 3px 0 #000;">🏦 HEARING BANK</div>
          <button id="closeMetaGame" style="background:#ff3333;color:#fff;border:none;width:44px;height:44px;
            border-radius:50%;cursor:pointer;font-size:22px;font-family:'Luckiest Guy',cursive;">✕</button>
        </div>

        <!-- 💾 localStorage notice -->
        <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);border-radius:10px;
          padding:8px 14px;font-size:clamp(10px,2vw,12px);color:#666;margin-bottom:14px;line-height:1.4">
          💾 Your 👂 ears, achievements, prestige and streak are saved in your browser's local storage.
          Clearing site data or using a different browser will reset your progress.
        </div>

        <!-- Currency row -->
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px;">
          <div style="background:rgba(255,215,0,0.1);border:2px solid rgba(255,215,0,0.35);border-radius:14px;padding:10px 6px;text-align:center;">
            <div style="font-size:clamp(22px,5vw,32px)">👂</div>
            <div style="font-size:clamp(16px,4vw,24px);color:#FFD700">${ears}</div>
            <div style="font-size:11px;color:#888">EARS</div>
          </div>
          <div style="background:rgba(156,39,176,0.1);border:2px solid rgba(156,39,176,0.3);border-radius:14px;padding:10px 6px;text-align:center;">
            <div style="font-size:clamp(22px,5vw,32px)">💎</div>
            <div style="font-size:clamp(16px,4vw,24px);color:#BA68C8">${gems}</div>
            <div style="font-size:11px;color:#888">GEMS</div>
          </div>
          <div style="background:rgba(255,100,0,0.1);border:2px solid rgba(255,100,0,0.3);border-radius:14px;padding:10px 6px;text-align:center;">
            <div style="font-size:clamp(22px,5vw,32px)">🔥</div>
            <div style="font-size:clamp(16px,4vw,24px);color:#ff6600">${streak.current}d</div>
            <div style="font-size:11px;color:#888">STREAK</div>
          </div>
          <div style="background:rgba(0,255,136,0.08);border:2px solid rgba(0,255,136,0.25);border-radius:14px;padding:10px 6px;text-align:center;">
            <div style="font-size:clamp(22px,5vw,32px)">⭐</div>
            <div style="font-size:clamp(16px,4vw,24px);color:#00ff88">×${prestige.multiplier.toFixed(1)}</div>
            <div style="font-size:11px;color:#888">PRESTIGE</div>
          </div>
        </div>

        <!-- Tabs -->
        <div style="display:flex;gap:6px;margin-bottom:16px;flex-wrap:wrap;">
          ${['🏆 ACHIEVEMENTS','🛒 SHOP','⭐ PRESTIGE','🔥 STREAK'].map((t,i)=>`
            <button class="mg-tab" data-tab="${i}" style="flex:1;min-width:80px;padding:8px 4px;
              background:${i===0?'rgba(255,215,0,0.2)':'rgba(255,255,255,0.05)'};
              border:2px solid ${i===0?'#FFD700':'rgba(255,255,255,0.15)'};
              border-radius:10px;cursor:pointer;font-family:'Luckiest Guy',cursive;
              font-size:clamp(11px,2.5vw,15px);color:${i===0?'#FFD700':'#888'};
              touch-action:manipulation;">${t}</button>
          `).join('')}
        </div>

        <!-- Tab content panels -->
        <div id="mgPanel0"><div id="achievementsGrid"></div></div>
        <div id="mgPanel1" style="display:none"></div>
        <div id="mgPanel2" style="display:none"></div>
        <div id="mgPanel3" style="display:none"></div>
      </div>
    `;
    
    document.body.appendChild(menu);
    
    document.getElementById('closeMetaGame').addEventListener('click', () => menu.remove());
    
    // Tab switching
    menu.querySelectorAll('.mg-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = parseInt(btn.dataset.tab);
        menu.querySelectorAll('.mg-tab').forEach((b,i) => {
          b.style.background = i===tab?'rgba(255,215,0,0.2)':'rgba(255,255,255,0.05)';
          b.style.borderColor = i===tab?'#FFD700':'rgba(255,255,255,0.15)';
          b.style.color = i===tab?'#FFD700':'#888';
        });
        [0,1,2,3].forEach(i => {
          const p = document.getElementById(`mgPanel${i}`);
          if (p) p.style.display = i===tab?'block':'none';
        });
        if (tab===1) this.renderShop();
        if (tab===2) this.renderPrestige();
        if (tab===3) this.renderStreak();
      });
    });

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
      const isUnlocked = this.data.achievements[ach.id] === true || this.data.achievements[ach.id]?.unlocked === true || ach.unlocked === true;
      // progress tracking removed - check() based achievements
      
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
          ">${ach.description || ''}</div>
          
          ${isUnlocked ? `
            <div style="font-family:'Luckiest Guy',cursive;font-size:14px;color:#FFD700;text-align:center;margin-top:6px">
              ${ach.reward.ears ? `+${ach.reward.ears} 👂` : ''} ${ach.reward.gems ? `+${ach.reward.gems} 💎` : ''}
            </div>
          ` : `
            <div style="font-family:'Luckiest Guy',cursive;font-size:12px;color:#555;text-align:center;margin-top:6px">🔒 LOCKED</div>
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
        description: 'Collect 20 different bonuses',
        icon: '💎',
        reward: { ears: 1000, gems: 10 },
        check: (stats) => stats.uniqueBonuses >= 20,
        unlocked: false
      },

      minigame_master: {
        id: 'minigame_master',
        name: 'Mini-game Master',
        description: 'Win all 9 different mini-games',
        icon: '🎮',
        reward: { ears: 800, gems: 5 },
        check: (stats) => (stats.uniqueMiniGames >= 5 || stats.uniqueMinigamesWon >= 5),
        unlocked: false
      },

      // Easy starter achievements
      first_click: {
        id: 'first_click', icon: '👆', name: 'FIRST RUMOR',
        description: 'Click your very first ear',
        reward: { ears: 10, gems: 0 },
        check: (s) => (s.totalEarsClicked || 0) >= 1
      },
      three_games: {
        id: 'three_games', icon: '🎮', name: 'GETTING HOOKED',
        description: 'Play 3 games',
        reward: { ears: 50, gems: 0 },
        check: (s) => (s.totalGamesPlayed || 0) >= 3
      },
      score_500: {
        id: 'score_500', icon: '💪', name: 'FIVE HUNDRED',
        description: 'Score 500 points in one game',
        reward: { ears: 20, gems: 0 },
        check: (s) => (s.highestScore || 0) >= 500
      },
      combo_5: {
        id: 'combo_5', icon: '⚡', name: 'COMBO STARTER',
        description: 'Reach a 5x combo',
        reward: { ears: 30, gems: 0 },
        check: (s) => (s.longestCombo || 0) >= 5
      },
      // Minigame firsts
      poker_played: {
        id: 'poker_played', icon: '🃏', name: 'POKER FACE',
        description: 'Play Hearing Poker for the first time',
        reward: { ears: 30, gems: 0 },
        check: (s) => (s.pokerPlayed || 0) >= 1
      },
      poker_royal: {
        id: 'poker_royal', icon: '👑', name: 'ROYAL EARS',
        description: 'Hit a Royal Flush in Hearing Poker',
        reward: { ears: 500, gems: 2 },
        check: (s) => (s.pokerRoyalFlush || 0) >= 1
      },
      hearinko_played: {
        id: 'hearinko_played', icon: '🎈', name: 'BALL DROP',
        description: 'Play Hearinko for the first time',
        reward: { ears: 30, gems: 0 },
        check: (s) => (s.hearinkoPlayed || 0) >= 1
      },
      hearinko_jackpot: {
        id: 'hearinko_jackpot', icon: '🎰', name: 'JACKPOT!',
        description: 'Hit the 10x jackpot in Hearinko',
        reward: { ears: 200, gems: 1 },
        check: (s) => (s.hearinkoJackpot || 0) >= 1
      },
      craps_natural: {
        id: 'craps_natural', icon: '🎲', name: 'NATURAL BORN ROLLER',
        description: 'Roll a natural 7 or 11 in Hearing Craps',
        reward: { ears: 100, gems: 0 },
        check: (s) => (s.crapsNatural || 0) >= 1
      },
      trader_degen: {
        id: 'trader_degen', icon: '📈', name: 'DEGEN TRADER',
        description: 'Win a 10x leverage trade in Hearing Trader',
        reward: { ears: 300, gems: 1 },
        check: (s) => (s.traderDegenWin || 0) >= 1
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
        icon: '👂',
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

  // Called from game.js with specific id + value
  checkAchievement(id, value) {
    if (!this.achievementsList) return;
    const ach = this.achievementsList[id];
    if (!ach || ach.unlocked) return;
    // If value is a full stats object, use it directly; otherwise wrap scalar
    const stats = (value && typeof value === 'object' && !Array.isArray(value))
      ? { ...value, currentCombo: value.longestCombo||value, currentScore: value.highestScore||value, levelReached: value.highestLevel||value }
      : { currentCombo: value, currentScore: value, levelReached: value };
    if (ach.check(stats)) this.unlockAchievement(ach);
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
    // NON-BLOCKING toast — corner, pointer-events:none, auto-dismiss 3.5s
    const toast = document.createElement('div');
    const rewardText = [
      achievement.reward.ears ? `+${achievement.reward.ears} 👂` : '',
      achievement.reward.gems ? `+${achievement.reward.gems} 💎` : ''
    ].filter(Boolean).join('  ');

    toast.style.cssText = `
      position: fixed;
      top: 80px;
      right: 14px;
      max-width: min(300px, 88vw);
      background: linear-gradient(135deg, #0d0d1a, #1a1a2e);
      border: 3px solid #FFD700;
      border-radius: 16px;
      padding: 14px 18px;
      z-index: 100030;
      pointer-events: none;
      box-shadow: 0 0 30px rgba(255,215,0,0.5), 0 4px 20px rgba(0,0,0,0.8);
      font-family: 'Luckiest Guy', cursive;
      text-align: center;
      transform: translateX(120%);
      transition: transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
      will-change: transform;
    `;

    toast.innerHTML = `
      <div style="font-size:clamp(10px,2vw,12px);color:#FFD700;letter-spacing:2px;margin-bottom:4px">🏆 ACHIEVEMENT UNLOCKED!</div>
      <div style="font-size:clamp(28px,6vw,40px);line-height:1;margin:4px 0">${achievement.icon}</div>
      <div style="font-size:clamp(14px,3vw,18px);color:#fff;margin:4px 0">${achievement.name}</div>
      <div style="font-size:clamp(10px,2vw,12px);color:#aaa;margin-bottom:6px">${achievement.description}</div>
      ${rewardText ? `<div style="font-size:clamp(13px,3vw,16px);color:#00ff88">${rewardText}</div>` : ''}
    `;

    document.body.appendChild(toast);

    // Slide in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });
    });

    // Sound (bonus jingle, not jackpot which doesn't exist)
    if (typeof SoundSystem !== 'undefined') {
      try { SoundSystem.bonus(); } catch(e) {}
    }

    // Auto-dismiss after 3s
    setTimeout(() => {
      toast.style.transition = 'transform 0.35s ease-in, opacity 0.35s ease-in';
      toast.style.transform = 'translateX(120%)';
      toast.style.opacity = '0';
      setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
    }, 3000);
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
      const saved = localStorage.getItem('hearingThings_metaGame');
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
  },

  // ==================== SHOP ====================
  renderShop() {
    const panel = document.getElementById('mgPanel1');
    if (!panel) return;
    const ears = this.getCurrency('ears');
    const purchased = (this.data.shop && this.data.shop.purchased) || [];

    const items = [
      { id:'extra_life', icon:'❤️', name:'EXTRA LIFE', desc:'Start next game with +1 life', cost:500, type:'ears' },
      { id:'hot_start', icon:'🔥', name:'HOT START', desc:'Start with 2x combo multiplier', cost:300, type:'ears' },
      { id:'shield', icon:'🛡️', name:'MISS SHIELD', desc:'First miss of the game is free', cost:400, type:'ears' },
      { id:'double_ears', icon:'👂', name:'DOUBLE EARS', desc:'+100% 👂 earned this session', cost:250, type:'ears' },
      { id:'bonk_skin', icon:'🐕', name:'BONK SKIN', desc:'Ears glow orange — cosmetic', cost:150, type:'ears' },
      { id:'lucky_gem', icon:'💎', name:'LUCKY GEM', desc:'Gem drops more frequently', cost:5, type:'gems' },
    ];

    panel.innerHTML = `
      <div style="font-family:'Luckiest Guy',cursive;margin-bottom:14px;">
        <div style="font-size:clamp(22px,5vw,34px);color:#FFD700;margin-bottom:4px">🛒 EAR SHOP — HEARING BANK</div>
        <div style="font-size:11px;color:#555;letter-spacing:1px">SPEND 👂 TO GET PERKS — APPLIES TO NEXT GAME</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px;">
        ${items.map(item => {
          const own = purchased.includes(item.id);
          const canAfford = item.type==='ears' ? ears >= item.cost : this.getCurrency('gems') >= item.cost;
          return `<div style="background:${own?'rgba(0,255,136,0.1)':'rgba(255,255,255,0.04)'};
            border:2px solid ${own?'#00ff88':'rgba(255,255,255,0.1)'};border-radius:14px;padding:14px;text-align:center;">
            <div style="font-size:34px;margin-bottom:6px">${item.icon}</div>
            <div style="font-size:13px;color:${own?'#00ff88':'#FFD700'};margin-bottom:4px">${item.name}</div>
            <div style="font-size:11px;color:#777;margin-bottom:10px;min-height:28px;line-height:1.3">${item.desc}</div>
            ${own
              ? '<div style="color:#00ff88;font-size:12px">✅ OWNED</div>'
              : `<button data-shop="${item.id}" data-cost="${item.cost}" data-type="${item.type}"
                  style="background:${canAfford?'linear-gradient(135deg,#FF8C00,#FF4400)':'rgba(80,80,80,0.2)'};
                  color:${canAfford?'#fff':'#555'};border:none;border-radius:10px;padding:7px 14px;
                  font-family:'Luckiest Guy',cursive;font-size:12px;cursor:${canAfford?'pointer':'not-allowed'};
                  touch-action:manipulation;width:100%">
                  ${item.cost} ${item.type==='ears'?'👂':'💎'}
                </button>`
            }
          </div>`;
        }).join('')}
      </div>
      <div style="font-family:'Luckiest Guy',cursive;font-size:11px;color:#444;margin-top:16px;line-height:1.5;text-align:center">
        💾 Purchases saved in browser local storage. Clearing site data will remove them.
        Perks marked "next game" apply on your next play session start.
      </div>
    `;
    panel.querySelectorAll('[data-shop]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.shop, cost = parseInt(btn.dataset.cost), type = btn.dataset.type;
        if (this.spendCurrency(type, cost)) {
          if (!this.data.shop) this.data.shop = { purchased:[] };
          if (!this.data.shop.purchased.includes(id)) this.data.shop.purchased.push(id);
          this.save(); this.renderShop();
        }
      });
    });
  },

  // ==================== PRESTIGE ====================
  renderPrestige() {
    const panel = document.getElementById('mgPanel2');
    if (!panel) return;
    if (!this.data.prestige) this.data.prestige = { count:0, multiplier:1.0, totalEarsEver:0 };
    const p = this.data.prestige;
    const ears = this.getCurrency('ears');
    const prestigeCosts = [5000, 25000, 100000, 400000, 1500000];
    const prestigeGemCosts = [0, 5, 15, 30, 50]; // Optional gem bypass
    const prestigeCost = prestigeCosts[p.count] || 9999999;
    const gemCost = prestigeGemCosts[p.count] || 999;
    const canPrestige = p.count < 5 && ears >= prestigeCost;
    const gamesPlayed = this.data.stats?.totalGamesPlayed || 0;
    const gamesRequired = [3, 10, 25, 50, 100][p.count] || 100;
    const hasEnoughGames = gamesPlayed >= gamesRequired;
    const canPrestigeActual = canPrestige && hasEnoughGames;
    const nextMult = (1 + (p.count+1) * 0.25).toFixed(2);
    const tierNames = ['Bronze','Silver','Gold','Platinum','Diamond'];
    const tierColors = ['#CD7F32','#C0C0C0','#FFD700','#00BFFF','#FF69B4'];

    panel.innerHTML = `
      <div style="font-family:'Luckiest Guy',cursive;text-align:center;padding:10px 0;">
        <div style="font-size:clamp(24px,6vw,40px);color:#00ff88;margin-bottom:6px">⭐ PRESTIGE</div>
        <div style="font-size:11px;color:#555;letter-spacing:1px;margin-bottom:16px">RESET 👂 BANK — GAIN PERMANENT SCORE POWER</div>
        <div style="display:flex;gap:8px;justify-content:center;margin-bottom:14px;flex-wrap:wrap">
          <div style="background:rgba(255,215,0,0.1);border:2px solid rgba(255,215,0,0.3);border-radius:10px;padding:6px 14px;font-family:'Luckiest Guy',cursive;font-size:clamp(11px,2.5vw,14px);color:#FFD700;text-align:center">
            🎮 ${gamesPlayed} / ${gamesRequired} games
          </div>
          <div style="background:rgba(148,0,211,${hasEnoughGames?'0.2':'0.05'});border:2px solid rgba(148,0,211,${hasEnoughGames?'0.5':'0.2'});border-radius:10px;padding:6px 14px;font-family:'Luckiest Guy',cursive;font-size:clamp(11px,2.5vw,14px);color:${hasEnoughGames?'#c77dff':'#666'};text-align:center">
            ${hasEnoughGames?'✅ Unlocked':'⏳ Play more'}
          </div>
        </div>

        ${p.count > 0 ? `
          <div style="background:rgba(0,255,136,0.08);border:2px solid rgba(0,255,136,0.25);border-radius:14px;
            padding:14px;margin-bottom:14px;display:inline-block;min-width:200px;">
            <div style="font-size:clamp(28px,6vw,44px)">⭐×${p.count}</div>
            <div style="color:${tierColors[p.count-1]||'#FFD700'};font-size:16px;margin:4px 0">${tierNames[p.count-1]||'Legend'}</div>
            <div style="color:#00ff88;font-size:20px">×${p.multiplier.toFixed(2)} score</div>
          </div>
        ` : `<div style="color:#555;font-size:13px;margin-bottom:14px">No prestige yet — first gives ×1.25</div>`}

        <div style="background:rgba(255,255,255,0.03);border-radius:14px;padding:14px;margin-bottom:16px;max-width:340px;margin-left:auto;margin-right:auto">
          <div style="font-size:13px;color:#aaa;margin-bottom:8px">${p.count<5?`PRESTIGE ${p.count+1} — ${tierNames[p.count]||'Max'}`:'MAX PRESTIGE'}</div>
          ${p.count < 5 ? `
            <div style="font-size:12px;color:#ff4444;margin-bottom:4px">COSTS: ${prestigeCost.toLocaleString()} 👂 (you have ${ears.toLocaleString()})</div>
            <div style="font-size:12px;color:#00ff88;margin-bottom:10px">GAIN: ×${nextMult} score multiplier FOREVER</div>
            <div style="display:flex;gap:8px;flex-direction:column;align-items:center;width:100%">
            <button id="btnPrestige" style="background:${canPrestigeActual?'linear-gradient(135deg,#9400d3,#ff00ff)':'rgba(80,80,80,0.2)'};
              color:${canPrestigeActual?'#fff':'#555'};border:none;border-radius:12px;padding:12px 28px;
              font-family:'Luckiest Guy',cursive;font-size:clamp(14px,3.5vw,20px);
              cursor:${canPrestigeActual?'pointer':'not-allowed'};touch-action:manipulation;
              ${canPrestigeActual?'box-shadow:0 0 25px rgba(180,0,255,0.4)':''};width:100%">
              ${canPrestige?`⭐ PRESTIGE (${prestigeCost.toLocaleString()} 👂)`:(!hasEnoughGames?`Need ${gamesRequired-gamesPlayed} more games (${gamesPlayed}/${gamesRequired})`:`Need ${(prestigeCost-ears).toLocaleString()} more 👂`)}
            </button>
            ${p.count>0&&this.getCurrency('gems')>=gemCost?`
            <button id="btnPrestigeGem" style="background:linear-gradient(135deg,#9400d3,#BA68C8);color:#fff;border:none;border-radius:10px;
              padding:8px 20px;font-family:'Luckiest Guy',cursive;font-size:13px;cursor:pointer;touch-action:manipulation;
              box-shadow:0 0 15px rgba(180,0,255,0.3);width:100%">
              💎 PRESTIGE WITH GEMS (${gemCost} 💎)
            </button>`:``}
          </div>
          ` : '<div style="color:#FFD700;font-size:16px">🌟 MAX PRESTIGE!</div>'}
        </div>

        <div style="font-size:11px;color:#444;max-width:340px;margin:0 auto;line-height:1.5">
          Prestige resets your 👂 bank to 0 but permanently boosts ALL scores.
          Your achievements and 💎 gems are kept. Stored in browser local storage.
        </div>
      </div>
    `;
    const doPrestige = (useGems) => {
      if (!canPrestigeActual && !useGems) { alert('You need more games played!'); return; }
      this.data.prestige.totalEarsEver = (this.data.prestige.totalEarsEver||0) + ears;
      if (!useGems) this.data.currencies.ears = 0;
      else this.spendCurrency('gems', gemCost);
      this.data.prestige.count++;
      this.data.prestige.multiplier = parseFloat((1 + this.data.prestige.count * 0.25).toFixed(2));
      if (typeof window.pointMultiplier !== 'undefined') window.pointMultiplier = this.data.prestige.multiplier;
      this.save(); this.updateEarsBadge(); this.renderPrestige();
    };
    document.getElementById('btnPrestige')?.addEventListener('click', () => {
      if (!canPrestigeActual) return;
      if (!confirm(`Prestige? Lose ${ears.toLocaleString()} 👂 → gain ×${nextMult} forever?`)) return;
      doPrestige(false);
    });
    document.getElementById('btnPrestigeGem')?.addEventListener('click', () => {
      if (!confirm(`Prestige with ${gemCost} 💎? Keep your 👂 but spend gems.`)) return;
      doPrestige(true);
    });
  },

  // ==================== STREAK ====================
  checkAndUpdateStreak() {
    if (!this.data.streak) this.data.streak = { current:0, best:0, lastPlayDate:null };
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now()-86400000).toDateString();
    const s = this.data.streak;
    if (s.lastPlayDate === today) return; // Already counted today
    if (s.lastPlayDate === yesterday) {
      s.current++; // Extend streak
    } else if (s.lastPlayDate !== today) {
      s.current = 1; // Reset or start
    }
    s.best = Math.max(s.best, s.current);
    s.lastPlayDate = today;
    this.save();
    // Streak milestone rewards
    const rewards = { 3:50, 7:200, 14:500, 30:2000 };
    const gemRewards = { 7:1, 14:2, 30:5 };
    if (rewards[s.current]) {
      this.addCurrency('ears', rewards[s.current]);
      if (gemRewards[s.current]) this.addCurrency('gems', gemRewards[s.current]);
      const n = document.createElement('div');
      n.style.cssText = `position:fixed;top:60px;left:50%;transform:translateX(-50%);
        background:linear-gradient(135deg,#ff6600,#FF8C00);color:#000;font-family:'Luckiest Guy',cursive;
        font-size:18px;padding:12px 24px;border-radius:12px;z-index:100020;
        box-shadow:0 0 25px rgba(255,140,0,0.6);text-align:center;`;
      n.innerHTML = `🔥 ${s.current}-DAY STREAK!<br>+${rewards[s.current]} 👂${gemRewards[s.current]?` +${gemRewards[s.current]} 💎`:''}`;
      document.body.appendChild(n); setTimeout(() => n.remove(), 3500);
    }
  },

  renderStreak() {
    const panel = document.getElementById('mgPanel3');
    if (!panel) return;
    const s = this.data.streak || { current:0, best:0, lastPlayDate:null };
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now()-86400000).toDateString();
    const isActiveToday = s.lastPlayDate === today;
    const isActiveYesterday = s.lastPlayDate === yesterday;
    const streakAlive = isActiveToday || isActiveYesterday;

    const milestones = [
      { days:3, reward:'+50 👂', icon:'🌡️' },
      { days:7, reward:'+200 👂 +1 💎', icon:'🔥' },
      { days:14, reward:'+500 👂 +2 💎', icon:'⚡' },
      { days:30, reward:'+2000 👂 +5 💎', icon:'💎' },
      { days:100, reward:'👑 LEGEND', icon:'👑' },
    ];

    panel.innerHTML = `
      <div style="font-family:'Luckiest Guy',cursive;text-align:center;padding:10px 0;">
        <div style="font-size:clamp(24px,6vw,40px);color:#ff6600;margin-bottom:4px">🔥 DAILY STREAK</div>
        <div style="font-size:11px;color:#555;letter-spacing:1px;margin-bottom:16px">PLAY EVERY DAY — EARN BONUS 👂</div>

        <div style="display:inline-block;background:rgba(255,100,0,0.1);border:3px solid rgba(255,100,0,0.35);
          border-radius:20px;padding:18px 32px;margin-bottom:16px;">
          <div style="font-size:clamp(56px,14vw,80px);line-height:1">${streakAlive?'🔥':'💀'}</div>
          <div style="font-size:clamp(36px,9vw,56px);color:${streakAlive?'#ff6600':'#555'}">${s.current}</div>
          <div style="font-size:12px;color:#888">${streakAlive?'DAYS ACTIVE':'STREAK BROKEN'}</div>
          ${s.best>0?`<div style="font-size:11px;color:#555;margin-top:4px">BEST: ${s.best}d</div>`:''}
        </div>

        ${!isActiveToday ? `<div style="background:rgba(255,100,0,0.08);border:2px solid rgba(255,100,0,0.2);border-radius:12px;
          padding:10px;margin-bottom:14px;font-size:13px;color:#ff6600;">
          ${isActiveYesterday ? '⚠️ Play today to keep your streak!' : '💀 Streak lost — play to restart.'}
        </div>` : '<div style="color:#00ff88;font-size:13px;margin-bottom:14px">✅ Played today!</div>'}

        <div style="display:flex;flex-direction:column;gap:6px;max-width:300px;margin:0 auto 16px;">
          ${milestones.map(m => {
            const reached = s.best >= m.days;
            return `<div style="display:flex;align-items:center;gap:10px;
              background:${reached?'rgba(0,255,136,0.08)':'rgba(255,255,255,0.03)'};
              border:1px solid ${reached?'rgba(0,255,136,0.2)':'rgba(255,255,255,0.07)'};
              border-radius:10px;padding:8px 12px">
              <span style="font-size:18px">${m.icon}</span>
              <span style="color:#888;font-size:12px">${m.days} days</span>
              <span style="color:${reached?'#00ff88':'#555'};font-size:12px;margin-left:auto">${m.reward}</span>
              ${reached?'<span style="font-size:12px">✅</span>':''}
            </div>`;
          }).join('')}
        </div>

        <div style="font-size:11px;color:#444;max-width:320px;margin:0 auto;line-height:1.5">
          Tracked by calendar day in your browser. Any completed game counts.
          Rewards paid automatically. Streak data saved in local storage.
        </div>
      </div>
    `;
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
