// ==================== POWER-UPS SYSTEM - DEGEN MODE ====================

const PowerUps = {
  active: null,
  
  types: {
    RAINBOW: {
      emoji: '🌈',
      name: 'RAINBOW MODE',
      duration: 10000,
      effect: (game) => {
        VisualEffects.activateRainbowMode(10000);
        VisualEffects.comboPopup('🌈 RAINBOW MODE! 🌈', window.innerWidth / 2, 200, 50);
        game.pointMultiplier = 3;
        setTimeout(() => { game.pointMultiplier = 1; }, 10000);
      }
    },
    
    SLOWMO: {
      emoji: '⏰',
      name: 'SLOW MOTION',
      duration: 5000,
      effect: (game) => {
        VisualEffects.activateSlowMo(5000);
        VisualEffects.comboPopup('⏰ SLOW-MO! ⏰', window.innerWidth / 2, 200, 50);
        game.earLifetime *= 2;
        game.spawnInterval *= 1.5;
        setTimeout(() => {
          game.earLifetime /= 2;
          game.spawnInterval /= 1.5;
        }, 5000);
      }
    },
    
    MAGNET: {
      emoji: '🧲',
      name: 'MAGNET MODE',
      duration: 8000,
      effect: (game) => {
        VisualEffects.comboPopup('🧲 MAGNET! 🧲', window.innerWidth / 2, 200, 50);
        game.magnetMode = true;
        setTimeout(() => { game.magnetMode = false; }, 8000);
      }
    },
    
    GHOST: {
      emoji: '👻',
      name: 'GHOST MODE',
      duration: 7000,
      effect: (game) => {
        VisualEffects.comboPopup('👻 GHOST MODE! 👻', window.innerWidth / 2, 200, 50);
        document.querySelectorAll('.ear').forEach(ear => {
          ear.style.opacity = '0.3';
        });
        setTimeout(() => {
          document.querySelectorAll('.ear').forEach(ear => {
            ear.style.opacity = '1';
          });
        }, 7000);
      }
    },
    
    CLOWN_FIESTA: {
      emoji: '🎪',
      name: 'CLOWN FIESTA',
      duration: 3000,
      effect: (game) => {
        VisualEffects.screenShake(15, 3000);
        VisualEffects.comboPopup('🎪 CLOWN FIESTA! 🎪', window.innerWidth / 2, 200, 50);
        
        for (let i = 0; i < 20; i++) {
          setTimeout(() => {
            game.spawnEar();
          }, i * 100);
        }
      }
    },
    
    PILL_TIME: {
      emoji: '💊',
      name: 'PILL TIME',
      duration: 8000,
      effect: (game) => {
        VisualEffects.comboPopup('💊 PILL TIME! 💊', window.innerWidth / 2, 200, 50);
        const style = document.createElement('style');
        style.id = 'pill-mode';
        style.textContent = `
          @keyframes psychedelic {
            0% { filter: hue-rotate(0deg) saturate(3) contrast(1.5); }
            25% { filter: hue-rotate(90deg) saturate(3) contrast(1.5) brightness(1.2); }
            50% { filter: hue-rotate(180deg) saturate(3) contrast(1.5); }
            75% { filter: hue-rotate(270deg) saturate(3) contrast(1.5) brightness(1.2); }
            100% { filter: hue-rotate(360deg) saturate(3) contrast(1.5); }
          }
          .game-board {
            animation: psychedelic 2s linear infinite !important;
            transform: perspective(1000px) rotateY(0deg) !important;
          }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
          document.getElementById('pill-mode')?.remove();
        }, 8000);
      }
    },
    
    RETRO: {
      emoji: '📺',
      name: 'RETRO MODE',
      duration: 5000,
      effect: (game) => {
        VisualEffects.comboPopup('📺 RETRO! 📺', window.innerWidth / 2, 200, 50);
        const gameBoard = document.querySelector('.game-board');
        gameBoard.style.filter = 'contrast(1.5) saturate(0.5)';
        gameBoard.style.imageRendering = 'pixelated';
        
        setTimeout(() => {
          gameBoard.style.filter = '';
          gameBoard.style.imageRendering = '';
        }, 5000);
      }
    },
    
    INVINCIBLE: {
      emoji: '🛡️',
      name: 'SHIELD',
      duration: 10000,
      effect: (game) => {
        VisualEffects.comboPopup('🛡️ INVINCIBLE! 🛡️', window.innerWidth / 2, 200, 50);
        game.invincible = true;
        
        const shield = document.createElement('div');
        shield.id = 'shield-indicator';
        shield.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          font-size: 60px;
          z-index: 10000;
          animation: pulse 1s ease-in-out infinite;
        `;
        shield.textContent = '🛡️';
        document.body.appendChild(shield);
        
        setTimeout(() => {
          game.invincible = false;
          document.getElementById('shield-indicator')?.remove();
        }, 10000);
      }
    },
    
    DOUBLE_POINTS: {
      emoji: '💰',
      name: 'DOUBLE POINTS',
      duration: 8000,
      effect: (game) => {
        VisualEffects.comboPopup('💰 x2 POINTS! 💰', window.innerWidth / 2, 200, 50);
        game.pointMultiplier = 2;
        setTimeout(() => { game.pointMultiplier = 1; }, 8000);
      }
    },
    
    TIME_FREEZE: {
      emoji: '❄️',
      name: 'TIME FREEZE',
      duration: 4000,
      effect: (game) => {
        VisualEffects.comboPopup('❄️ TIME FREEZE! ❄️', window.innerWidth / 2, 200, 50);
        
        document.querySelectorAll('.ear.active').forEach(ear => {
          ear.dataset.frozen = 'true';
          ear.style.animation = 'none';
        });
        
        const style = document.createElement('style');
        style.id = 'freeze-effect';
        style.textContent = `
          .game-board { filter: brightness(0.5) hue-rotate(180deg); }
        `;
        document.head.appendChild(style);
        
        setTimeout(() => {
          document.querySelectorAll('.ear.active').forEach(ear => {
            if (ear.dataset.frozen === 'true') {
              delete ear.dataset.frozen;
              ear.style.animation = '';
            }
          });
          document.getElementById('freeze-effect')?.remove();
        }, 4000);
      }
    },
    
    NUKE: {
      emoji: '💣',
      name: 'NUKE',
      duration: 100,
      effect: (game) => {
        VisualEffects.flashScreen('#fff', 500);
        VisualEffects.screenShake(20, 1000);
        VisualEffects.comboPopup('💣 NUKE! 💣', window.innerWidth / 2, 200, 80);
        
        const activeEars = document.querySelectorAll('.ear.active');
        let totalPoints = 0;
        
        activeEars.forEach((ear, index) => {
          setTimeout(() => {
            const points = parseInt(ear.dataset.points) || 10;
            totalPoints += points;
            
            const rect = ear.getBoundingClientRect();
            VisualEffects.particleExplosion(
              rect.left + rect.width / 2,
              rect.top + rect.height / 2,
              30,
              '#ff6600'
            );
            
            ear.classList.remove('active');
            ear.style.animation = 'none';
          }, index * 50);
        });
        
        setTimeout(() => {
          if (totalPoints > 0) {
            game.addScore(totalPoints);
            VisualEffects.comboPopup(`+${totalPoints}!`, window.innerWidth / 2, window.innerHeight / 2, 60);
          }
        }, activeEars.length * 50 + 100);
      }
    }
  },
  
  spawn(game) {
    const types = Object.keys(this.types);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const powerUp = this.types[randomType];
    
    const holes = document.querySelectorAll('.hole');
    const randomHole = holes[Math.floor(Math.random() * holes.length)];
    const ear = randomHole.querySelector('.ear');
    
    if (!ear.classList.contains('active')) {
      ear.textContent = powerUp.emoji;
      ear.classList.add('active', 'power-up');
      ear.dataset.powerup = randomType;
      ear.dataset.points = '0';
      
      ear.style.animation = 'popUpPowerUp 2.5s ease-out';
      
      setTimeout(() => {
        ear.classList.remove('active', 'power-up');
        ear.textContent = '👂';
        delete ear.dataset.powerup;
      }, 2500);
    }
  },
  
  activate(type, game) {
    const powerUp = this.types[type];
    if (!powerUp) return;
    
    this.active = type;
    
    powerUp.effect(game);
    
    const notification = document.createElement('div');
    notification.style.cssText = `
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
    notification.textContent = `${powerUp.emoji} ${powerUp.name}`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
      this.active = null;
    }, powerUp.duration);
  }
};

const powerUpStyle = document.createElement('style');
powerUpStyle.textContent = `
@keyframes popUpPowerUp {
  0% { transform: translateY(100px) scale(0); opacity: 0; }
  20% { transform: translateY(0) scale(1.2); opacity: 1; }
  80% { transform: translateY(0) scale(1); opacity: 1; }
  100% { transform: translateY(-100px) scale(0); opacity: 0; }
}

.ear.power-up {
  font-size: 3rem !important;
  filter: drop-shadow(0 0 20px rgba(255, 0, 255, 0.8)) !important;
  animation: popUpPowerUp 2.5s ease-out !important;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
`;
document.head.appendChild(powerUpStyle);

window.PowerUps = PowerUps;
