// ==================== PROGRESSION SYSTEM ====================

const ProgressionSystem = {
  milestones: {
    5: {
      title: "👂 HEARING ROOKIE",
      description: "You're getting the hang of it!",
      rewards: {
        points: 500,
        ears: 50, // Currency
        unlock: "speed_boost"
      },
      badge: "🥉",
      theme: "The Streets"
    },
    10: {
      title: "🎧 SOUND TRACKER",
      description: "Your ears are sharp!",
      rewards: {
        points: 1000,
        ears: 100,
        life: 1,
        unlock: "neon_theme"
      },
      badge: "🥈",
      theme: "Neon District"
    },
    15: {
      title: "🔊 AUDIO HUNTER",
      description: "Nothing escapes your hearing!",
      rewards: {
        points: 1500,
        ears: 150,
        unlock: "auto_collect"
      },
      badge: "🥇",
      theme: "Cyber Space"
    },
    20: {
      title: "🎵 HEARING VETERAN",
      description: "You're a true master!",
      rewards: {
        points: 2500,
        ears: 250,
        life: 1,
        unlock: "golden_ear_skin",
        multiplier: 1.15
      },
      badge: "💎",
      theme: "The Grid"
    },
    25: {
      title: "🌟 SOUND LEGEND",
      description: "Your hearing is legendary!",
      rewards: {
        points: 3500,
        ears: 350,
        life: 1,
        unlock: "time_slow_powerup"
      },
      badge: "⭐",
      theme: "The Void"
    },
    30: {
      title: "👑 MASTER OF SOUND",
      description: "You've mastered the art of hearing!",
      rewards: {
        points: 5000,
        ears: 500,
        life: 2,
        unlock: "rainbow_theme",
        multiplier: 1.25
      },
      badge: "👑",
      theme: "Neon Heaven"
    },
    40: {
      title: "🦻 HEARING DEITY",
      description: "You transcend mortal hearing!",
      rewards: {
        points: 7500,
        ears: 750,
        life: 2,
        unlock: "god_mode_theme",
        multiplier: 1.40
      },
      badge: "🔱",
      theme: "Divine Realm"
    },
    50: {
      title: "🌌 HEARING GOD",
      description: "You are the embodiment of perfect hearing!",
      rewards: {
        points: 10000,
        ears: 1000,
        life: 3,
        unlock: "prestige_mode",
        multiplier: 1.5
      },
      badge: "🌟✨",
      theme: "Transcendence"
    }
  },

  // Récupérer le prochain milestone
  getNextMilestone(currentLevel) {
    const milestoneKeys = Object.keys(this.milestones).map(Number).sort((a, b) => a - b);
    return milestoneKeys.find(level => level > currentLevel) || null;
  },

  // Récupérer le milestone actuel
  getCurrentMilestone(currentLevel) {
    const milestoneKeys = Object.keys(this.milestones).map(Number).sort((a, b) => a - b);
    let current = null;
    for (const level of milestoneKeys) {
      if (currentLevel >= level) {
        current = level;
      } else {
        break;
      }
    }
    return current;
  },

  // Calculer le progrès vers le prochain milestone
  getProgress(currentLevel) {
    const next = this.getNextMilestone(currentLevel);
    if (!next) {
      return { current: currentLevel, next: null, progress: 100, title: "MAX LEVEL" };
    }

    const current = this.getCurrentMilestone(currentLevel) || 0;
    const range = next - current;
    const completed = currentLevel - current;
    const progress = Math.min(100, (completed / range) * 100);

    return {
      current: current,
      next: next,
      progress: Math.round(progress),
      title: this.milestones[next].title
    };
  },

  // Afficher la célébration milestone
  showMilestoneCelebration(level, game) {
    const milestone = this.milestones[level];
    if (!milestone) return;

    const overlay = document.createElement('div');
    overlay.id = 'milestoneOverlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: radial-gradient(circle, rgba(255,215,0,0.2) 0%, rgba(0,0,0,0.95) 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      animation: fadeIn 0.5s;
    `;

    overlay.innerHTML = `
      <div style="text-align: center; animation: bounceIn 0.8s;">
        <!-- Badge -->
        <div style="
          font-size: clamp(100px, 15vw, 180px);
          margin-bottom: 20px;
          animation: rotatePulse 2s ease-in-out infinite;
        ">${milestone.badge}</div>
        
        <!-- Title -->
        <div style="
          font-size: clamp(40px, 7vw, 70px);
          font-family: 'Luckiest Guy', cursive;
          color: #FFD700;
          margin-bottom: 15px;
          text-shadow: 
            0 0 30px #FFD700,
            0 0 60px #FF6B00,
            4px 4px 0 #000;
          animation: titleGlow 2s ease-in-out infinite;
        ">MILESTONE REACHED!</div>

        <!-- Level & Name -->
        <div style="
          font-size: clamp(35px, 6vw, 60px);
          font-family: 'Luckiest Guy', cursive;
          color: #fff;
          margin-bottom: 30px;
          text-shadow: 0 0 20px #00ffff, 3px 3px 0 #000;
        ">LEVEL ${level}: ${milestone.title}</div>

        <!-- Description -->
        <div style="
          font-size: clamp(20px, 3.5vw, 35px);
          color: #aaa;
          margin-bottom: 40px;
          max-width: 600px;
          text-shadow: 2px 2px 0 #000;
        ">${milestone.description}</div>

        <!-- Rewards -->
        <div style="
          background: rgba(0,0,0,0.7);
          border: 3px solid #FFD700;
          border-radius: 20px;
          padding: 30px 50px;
          margin-bottom: 40px;
          box-shadow: 0 0 30px rgba(255,215,0,0.5);
        ">
          <div style="
            font-size: clamp(25px, 4vw, 40px);
            font-family: 'Luckiest Guy', cursive;
            color: #FFD700;
            margin-bottom: 20px;
            text-shadow: 0 0 15px #FFD700;
          ">🎁 REWARDS 🎁</div>
          
          <div style="
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            justify-content: center;
            font-size: clamp(18px, 3vw, 28px);
            color: #fff;
          ">
            ${milestone.rewards.points ? `<div>💎 +${milestone.rewards.points.toLocaleString()} pts</div>` : ''}
            ${milestone.rewards.ears ? `<div>👂 +${milestone.rewards.ears} ears</div>` : ''}
            ${milestone.rewards.life ? `<div>❤️ +${milestone.rewards.life} life</div>` : ''}
            ${milestone.rewards.multiplier ? `<div>⚡ ${milestone.rewards.multiplier}x multiplier</div>` : ''}
            ${milestone.rewards.unlock ? `<div>🔓 ${this.formatUnlock(milestone.rewards.unlock)}</div>` : ''}
          </div>
        </div>

        <!-- Continue Button -->
        <button id="milestoneContinue" style="
          font-size: clamp(30px, 5vw, 50px);
          padding: clamp(20px, 3vw, 30px) clamp(50px, 8vw, 80px);
          background: linear-gradient(145deg, #00ff00, #00cc00);
          color: #000;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-family: 'Luckiest Guy', cursive;
          box-shadow: 0 10px 40px rgba(0,255,0,0.8);
          transition: all 0.2s;
          animation: pulseButton 1.5s ease-in-out infinite;
        ">CONTINUE!</button>
      </div>
    `;

    document.body.appendChild(overlay);

    // Confetti
    this.createConfetti(overlay);

    // Sound
    if (typeof SoundSystem !== 'undefined') {
      SoundSystem.jackpot();
    }

    // TTS
    const utterance = new SpeechSynthesisUtterance(
      `Milestone reached! Level ${level}! ${milestone.title}!`
    );
    utterance.volume = 1.0;
    speechSynthesis.speak(utterance);

    // Appliquer les rewards
    this.applyRewards(milestone.rewards, game);

    // Continue button
    document.getElementById('milestoneContinue').addEventListener('click', () => {
      overlay.remove();
      if (typeof window.startSpawning === 'function') {
        setTimeout(() => window.startSpawning(), 100);
      }
    });
  },

  // Appliquer les rewards
  applyRewards(rewards, game) {
    if (rewards.points && game) {
      game.score += rewards.points;
    }
    if (rewards.ears) {
      MetaGame.addCurrency('ears', rewards.ears);
    }
    if (rewards.life && game && typeof window.addLife === 'function') {
      for (let i = 0; i < rewards.life; i++) {
        window.addLife();
      }
    }
    if (rewards.multiplier) {
      MetaGame.addMultiplier(rewards.multiplier);
    }
    if (rewards.unlock) {
      MetaGame.unlock(rewards.unlock);
    }
  },

  // Formatter le unlock pour affichage
  formatUnlock(unlock) {
    const names = {
      'speed_boost': 'Speed Boost',
      'neon_theme': 'Neon Theme',
      'auto_collect': 'Auto Collect',
      'golden_ear_skin': 'Golden Ear Skin',
      'time_slow_powerup': 'Time Slow Power-up',
      'rainbow_theme': 'Rainbow Theme',
      'god_mode_theme': 'God Mode Theme',
      'prestige_mode': 'Prestige Mode'
    };
    return names[unlock] || unlock;
  },

  // Créer confetti
  createConfetti(container) {
    for (let i = 0; i < 100; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.textContent = ['🎉', '💎', '🔥', '⭐', '💰', '👂', '🏆'][Math.floor(Math.random() * 7)];
        confetti.style.cssText = `
          position: fixed;
          left: ${Math.random() * 100}%;
          top: -50px;
          font-size: ${30 + Math.random() * 40}px;
          animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
          pointer-events: none;
          z-index: 100000;
        `;
        container.appendChild(confetti);
        setTimeout(() => confetti.remove(), 5000);
      }, i * 30);
    }
  },

  // Progress bar UI
  updateProgressBar(level) {
    const progress = this.getProgress(level);
    const progressBar = document.getElementById('progressBar');
    
    if (!progressBar) return;

    if (!progress.next) {
      progressBar.innerHTML = `
        <div style="
          font-size: 18px;
          color: #FFD700;
          font-family: 'Luckiest Guy', cursive;
          text-shadow: 0 0 10px #FFD700;
        ">🌟 MAX LEVEL REACHED! 🌟</div>
      `;
      return;
    }

    progressBar.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        gap: 10px;
        font-family: 'Luckiest Guy', cursive;
      ">
        <div style="font-size: 14px; color: #aaa;">Next:</div>
        <div style="
          flex: 1;
          height: 20px;
          background: rgba(0,0,0,0.5);
          border: 2px solid #FFD700;
          border-radius: 10px;
          overflow: hidden;
          position: relative;
        ">
          <div style="
            height: 100%;
            width: ${progress.progress}%;
            background: linear-gradient(90deg, #FFD700, #FF6B00);
            transition: width 0.5s ease;
            box-shadow: 0 0 10px #FFD700;
          "></div>
          <div style="
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #fff;
            text-shadow: 1px 1px 2px #000;
          ">${progress.progress}%</div>
        </div>
        <div style="font-size: 14px; color: #FFD700;">Lvl ${progress.next}</div>
      </div>
      <div style="
        font-size: 12px;
        color: #aaa;
        margin-top: 5px;
        text-align: center;
      ">${progress.title}</div>
    `;
  }
};

// Ajouter CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes confettiFall {
    0% {
      transform: translateY(0) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(100vh) rotate(720deg);
      opacity: 0;
    }
  }

  @keyframes rotatePulse {
    0%, 100% {
      transform: scale(1) rotate(0deg);
    }
    50% {
      transform: scale(1.2) rotate(180deg);
    }
  }

  @keyframes bounceIn {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.1);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

// Expose globally
window.ProgressionSystem = ProgressionSystem;
