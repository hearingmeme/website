// ==================== MILESTONES & PROGRESSION SYSTEM ====================

const MilestoneSystem = {
  milestones: {
    5: {
      level: 5,
      title: "🥉 FIRST STEPS",
      subtitle: "Getting the Hang of It!",
      rewards: {
        points: 500,
        ears: 50, // Currency
        unlock: null
      },
      badge: "🥉"
    },
    10: {
      level: 10,
      title: "🥈 ROOKIE EARS",
      subtitle: "You're Learning Fast!",
      rewards: {
        points: 1000,
        ears: 100,
        unlock: "speed_boost_powerup"
      },
      badge: "🥈"
    },
    15: {
      level: 15,
      title: "🏅 SKILLED LISTENER",
      subtitle: "Above Average!",
      rewards: {
        points: 1500,
        ears: 150,
        life: 1,
        unlock: null
      },
      badge: "🏅"
    },
    20: {
      level: 20,
      title: "🥇 HEARING VETERAN",
      subtitle: "You're Really Good!",
      rewards: {
        points: 2500,
        ears: 200,
        unlock: "auto_click_powerup"
      },
      badge: "🥇"
    },
    25: {
      level: 25,
      title: "💎 DIAMOND EARS",
      subtitle: "Elite Status!",
      rewards: {
        points: 3500,
        ears: 300,
        life: 1,
        multiplier: 1.1, // Permanent 10% bonus
        unlock: "golden_ear_skin"
      },
      badge: "💎"
    },
    30: {
      level: 30,
      title: "⭐ MASTER OF SOUND",
      subtitle: "Legendary Skills!",
      rewards: {
        points: 5000,
        ears: 500,
        multiplier: 1.15,
        unlock: "time_attack_mode"
      },
      badge: "⭐"
    },
    40: {
      level: 40,
      title: "👑 HEARING LEGEND",
      subtitle: "Few Reach This Far!",
      rewards: {
        points: 7500,
        ears: 750,
        life: 1,
        multiplier: 1.25,
        unlock: "chaos_mode"
      },
      badge: "👑"
    },
    50: {
      level: 50,
      title: "🔥 HEARING GOD 🔥",
      subtitle: "You Are Unstoppable!",
      rewards: {
        points: 10000,
        ears: 1000,
        multiplier: 1.5,
        unlock: "prestige_system"
      },
      badge: "🔥"
    }
  },
  
  achieved: new Set(),
  
  init() {
    // Load achieved milestones from storage
    const saved = localStorage.getItem('milestones_achieved');
    if (saved) {
      this.achieved = new Set(JSON.parse(saved));
    }
    
    // Add progress bar to header
    this.createProgressBar();
  },
  
  createProgressBar() {
    const header = document.querySelector('.game-stats');
    if (!header) return;
    
    const progressContainer = document.createElement('div');
    progressContainer.id = 'milestoneProgress';
    progressContainer.style.cssText = `
      margin-top: 10px;
      width: 100%;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    `;
    
    progressContainer.innerHTML = `
      <div style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;
      ">
        <div id="milestoneLabel" style="
          font-family: 'Luckiest Guy', cursive;
          font-size: clamp(14px, 3vw, 18px);
          color: #00ffff;
          text-shadow: 2px 2px 0 #000;
        ">Next: Level 5</div>
        
        <div id="milestoneBadge" style="
          font-size: clamp(18px, 4vw, 24px);
        ">🥉</div>
      </div>
      
      <div style="
        width: 100%;
        height: 12px;
        background: rgba(0, 0, 0, 0.5);
        border: 2px solid #00ffff;
        border-radius: 10px;
        overflow: hidden;
        position: relative;
      ">
        <div id="milestoneProgressBar" style="
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, #00ffff, #00ff88);
          transition: width 0.5s ease;
          box-shadow: 0 0 10px #00ffff;
        "></div>
      </div>
    `;
    
    header.appendChild(progressContainer);
  },
  
  updateProgressBar(currentLevel) {
    const next = this.getNextMilestone(currentLevel);
    if (!next) {
      // All milestones achieved!
      const label = document.getElementById('milestoneLabel');
      const badge = document.getElementById('milestoneBadge');
      if (label) label.textContent = 'All Milestones Unlocked!';
      if (badge) badge.textContent = '🏆';
      
      const bar = document.getElementById('milestoneProgressBar');
      if (bar) bar.style.width = '100%';
      return;
    }
    
    const previous = this.getPreviousMilestone(currentLevel);
    const prevLevel = previous ? previous.level : 0;
    const progress = ((currentLevel - prevLevel) / (next.level - prevLevel)) * 100;
    
    const label = document.getElementById('milestoneLabel');
    const badge = document.getElementById('milestoneBadge');
    const bar = document.getElementById('milestoneProgressBar');
    
    if (label) {
      label.textContent = `Next: ${next.title}`;
    }
    
    if (badge) {
      badge.textContent = next.badge;
    }
    
    if (bar) {
      bar.style.width = Math.min(progress, 100) + '%';
    }
  },
  
  getNextMilestone(currentLevel) {
    const levels = Object.keys(this.milestones).map(Number).sort((a, b) => a - b);
    for (const level of levels) {
      if (level > currentLevel) {
        return this.milestones[level];
      }
    }
    return null;
  },
  
  getPreviousMilestone(currentLevel) {
    const levels = Object.keys(this.milestones).map(Number).sort((a, b) => b - a);
    for (const level of levels) {
      if (level <= currentLevel) {
        return this.milestones[level];
      }
    }
    return null;
  },
  
  checkMilestone(level) {
    if (this.milestones[level] && !this.achieved.has(level)) {
      this.celebrate(level);
      this.achieved.add(level);
      this.save();
      return true;
    }
    return false;
  },
  
  celebrate(level) {
    const milestone = this.milestones[level];
    
    // Pause game
    const wasPaused = window.gamePaused || false;
    if (typeof window.setPaused === 'function') {
      window.setPaused(true);
    }
    window.gamePaused = true;
    
    // Create celebration overlay
    const overlay = document.createElement('div');
    overlay.id = 'milestoneOverlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: linear-gradient(145deg, rgba(26, 0, 51, 0.95), rgba(51, 0, 102, 0.95));
      z-index: 100010;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.5s;
    `;
    
    overlay.innerHTML = `
      <div style="
        font-size: clamp(80px, 15vw, 150px);
        margin-bottom: 20px;
        animation: bounce 1s infinite;
      ">${milestone.badge}</div>
      
      <div style="
        font-size: clamp(48px, 8vw, 80px);
        color: #FFD700;
        font-family: 'Luckiest Guy', cursive;
        text-shadow: 0 0 40px #FFD700, 0 0 80px #FF6B00, 4px 4px 0 #000;
        margin-bottom: 10px;
        animation: titleGlow 2s infinite;
      ">${milestone.title}</div>
      
      <div style="
        font-size: clamp(28px, 5vw, 42px);
        color: #00ffff;
        font-family: 'Luckiest Guy', cursive;
        text-shadow: 0 0 20px #00ffff, 2px 2px 0 #000;
        margin-bottom: 40px;
      ">${milestone.subtitle}</div>
      
      <div style="
        background: rgba(0, 0, 0, 0.6);
        border: 3px solid #FFD700;
        border-radius: 15px;
        padding: 30px;
        max-width: 500px;
      ">
        <div style="
          font-size: clamp(28px, 5vw, 36px);
          color: #FFD700;
          font-family: 'Luckiest Guy', cursive;
          margin-bottom: 20px;
          text-shadow: 0 0 20px #FFD700;
        ">🎁 REWARDS 🎁</div>
        
        <div id="milestoneRewards" style="
          display: flex;
          flex-direction: column;
          gap: 12px;
          font-family: 'Luckiest Guy', cursive;
          font-size: clamp(20px, 4vw, 28px);
        ">
          ${this.getRewardsHTML(milestone.rewards)}
        </div>
      </div>
      
      <button id="claimMilestoneBtn" style="
        font-family: 'Luckiest Guy', cursive;
        font-size: clamp(24px, 5vw, 36px);
        padding: 20px 60px;
        background: linear-gradient(145deg, #00ff88, #00cc66);
        color: #000;
        border: none;
        border-radius: 15px;
        cursor: pointer;
        margin-top: 40px;
        box-shadow: 0 0 40px rgba(0, 255, 136, 0.6);
        transition: transform 0.2s;
      ">CLAIM REWARDS! 🎉</button>
    `;
    
    document.body.appendChild(overlay);
    
    // Confetti
    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.textContent = ['🎉', '✨', '💎', '⭐', '🔥', milestone.badge][Math.floor(Math.random() * 6)];
        confetti.style.cssText = `
          position: fixed;
          left: ${Math.random() * 100}vw;
          top: -50px;
          font-size: ${30 + Math.random() * 40}px;
          z-index: 100011;
          animation: confettiFall ${2 + Math.random() * 2}s linear;
          pointer-events: none;
        `;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 4000);
      }, i * 30);
    }
    
    // Sound
    if (typeof SoundSystem !== 'undefined') {
      SoundSystem.jackpot();
    }
    
    // Claim button
    const claimBtn = document.getElementById('claimMilestoneBtn');
    claimBtn.onmouseenter = () => { claimBtn.style.transform = 'scale(1.1)'; };
    claimBtn.onmouseleave = () => { claimBtn.style.transform = 'scale(1)'; };
    claimBtn.addEventListener('click', () => {
      this.claimRewards(milestone.rewards);
      overlay.remove();
      
      // Resume if wasn't paused before
      if (!wasPaused) {
        if (typeof window.setPaused === 'function') {
          window.setPaused(false);
        }
        window.gamePaused = false;
        
        if (typeof window.startSpawning === 'function') {
          setTimeout(() => window.startSpawning(), 100);
        }
      }
    });
  },
  
  getRewardsHTML(rewards) {
    const items = [];
    
    if (rewards.points) {
      items.push(`<div style="color: #00ff88;">💰 +${rewards.points.toLocaleString()} Points</div>`);
    }
    
    if (rewards.ears) {
      items.push(`<div style="color: #FFD700;">👂 +${rewards.ears} Ears (Currency)</div>`);
    }
    
    if (rewards.life) {
      items.push(`<div style="color: #ff6b9d;">❤️ +${rewards.life} Extra Life</div>`);
    }
    
    if (rewards.multiplier) {
      const bonus = ((rewards.multiplier - 1) * 100).toFixed(0);
      items.push(`<div style="color: #ff00ff;">🔥 +${bonus}% Score Multiplier (Permanent!)</div>`);
    }
    
    if (rewards.unlock) {
      const unlockNames = {
        speed_boost_powerup: '⚡ Speed Boost Power-Up',
        auto_click_powerup: '🤖 Auto-Click Power-Up',
        golden_ear_skin: '✨ Golden Ear Skin',
        time_attack_mode: '⏱️ Time Attack Mode',
        chaos_mode: '🌀 Chaos Mode',
        prestige_system: '⭐ Prestige System'
      };
      items.push(`<div style="color: #00ffff;">🔓 ${unlockNames[rewards.unlock] || 'Special Unlock'}</div>`);
    }
    
    return items.join('');
  },
  
  claimRewards(rewards) {
    // Add points
    if (rewards.points && typeof window.score !== 'undefined') {
      window.score += rewards.points;
      if (typeof window.updateUI === 'function') {
        window.updateUI();
      }
    }
    
    // Add currency
    if (rewards.ears) {
      const currency = window.CurrencySystem || window.MetaGameSystem;
      if (currency && currency.addEars) {
        currency.addEars(rewards.ears);
      }
    }
    
    // Add life
    if (rewards.life && typeof window.addLife === 'function') {
      window.addLife();
    }
    
    // Apply multiplier
    if (rewards.multiplier) {
      const meta = window.MetaGameSystem;
      if (meta) {
        meta.applyPermanentMultiplier(rewards.multiplier);
      }
    }
    
    // Unlock content
    if (rewards.unlock) {
      const meta = window.MetaGameSystem;
      if (meta) {
        meta.unlock(rewards.unlock);
      }
    }
  },
  
  save() {
    localStorage.setItem('milestones_achieved', JSON.stringify([...this.achieved]));
  },
  
  reset() {
    this.achieved.clear();
    this.save();
  }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  MilestoneSystem.init();
});

// Expose globally
window.MilestoneSystem = MilestoneSystem;
