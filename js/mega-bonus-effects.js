// ==================== MEGA BONUS EFFECTS ====================

const MegaBonusEffects = {
  
  tornado(game) {
    const duration = 8000;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const radius = 200;
    
    const notif = document.createElement('div');
    notif.textContent = '🌪️ TORNADO! SPIN TO WIN! 🌪️';
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
    setTimeout(() => notif.remove(), 3000);
    
    const ears = document.querySelectorAll('.ear.active');
    const startTime = Date.now();
    
    const tornadoInterval = setInterval(() => { // 50ms
      const elapsed = Date.now() - startTime;
      const angle = (elapsed / 50) * (Math.PI / 180); // Speed of rotation
      
      ears.forEach((ear, index) => {
        const offsetAngle = angle + (index * (Math.PI * 2 / ears.length));
        const x = centerX + Math.cos(offsetAngle) * radius;
        const y = centerY + Math.sin(offsetAngle) * radius;
        
        const hole = ear.parentElement;
        hole.style.transition = 'none';
        hole.style.position = 'fixed';
        hole.style.left = x + 'px';
        hole.style.top = y + 'px';
        hole.style.transform = 'translate(-50%, -50%) rotate(' + (angle * 180 / Math.PI) + 'deg)';
      });
      
      if (elapsed >= duration) {
        clearInterval(tornadoInterval);
        ears.forEach(ear => {
          const hole = ear.parentElement;
          hole.style.position = '';
          hole.style.left = '';
          hole.style.top = '';
          hole.style.transform = '';
          hole.style.transition = '';
        });
      }
    }, 50);
  },
  
  slotMachine(game) {
    window.gamePaused = true;
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s;
    `;
    
    const slotContainer = document.createElement('div');
    slotContainer.style.cssText = `
      background: linear-gradient(135deg, #FFD700, #FFA500);
      padding: 40px;
      border-radius: 20px;
      border: 8px solid #000;
      text-align: center;
    `;
    
    slotContainer.innerHTML = `
      <div style="font-size: 50px; color: #000; font-weight: bold; font-family: 'Luckiest Guy', cursive; margin-bottom: 20px;">👂 HEARING MACHINE 👂</div>
      <div style="display: flex; gap: 20px; justify-content: center; margin-bottom: 30px;">
        <div id="slot1" style="width: 100px; height: 120px; background: #fff; border: 5px solid #000; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 60px;">?</div>
        <div id="slot2" style="width: 100px; height: 120px; background: #fff; border: 5px solid #000; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 60px;">?</div>
        <div id="slot3" style="width: 100px; height: 120px; background: #fff; border: 5px solid #000; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 60px;">?</div>
      </div>
      <div id="slotResult" style="font-size: 30px; color: #000; font-weight: bold; font-family: 'Luckiest Guy', cursive;"></div>
    `;
    
    overlay.appendChild(slotContainer);
    document.body.appendChild(overlay);
    
    const emojis = ['👂', '🦻', '👂🏻', '👂🏼', '👂🏽', '👂🏾', '👂🏿'];
    const slots = [
      document.getElementById('slot1'),
      document.getElementById('slot2'),
      document.getElementById('slot3')
    ];
    
    let spinCount = 0;
    const spinInterval = setInterval(() => {
      slots.forEach(slot => {
        slot.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      });
      
      spinCount++;
      if (spinCount >= 20) {
        clearInterval(spinInterval);
        
        const results = [
          emojis[Math.floor(Math.random() * emojis.length)],
          emojis[Math.floor(Math.random() * emojis.length)],
          emojis[Math.floor(Math.random() * emojis.length)]
        ];
        
        slots[0].textContent = results[0];
        slots[1].textContent = results[1];
        slots[2].textContent = results[2];
        
        const resultDiv = document.getElementById('slotResult');
        
        if (results[0] === results[1] && results[1] === results[2]) {
          if (game.addScore) game.addScore(5000); else if (typeof window.score !== 'undefined') window.score += 5000;
          
          if (window.addLife && typeof window.lives !== 'undefined') {
            const currentLives = window.lives || 1;
            if (currentLives < 3) {
              window.addLife();
              resultDiv.textContent = '👂💎 JACKPOT! +5000 + 1 LIFE! 👂💎';
            } else {
              resultDiv.textContent = '👂💎 JACKPOT! +5000 👂💎';
            }
          } else {
            resultDiv.textContent = '👂💎 JACKPOT! +5000 👂💎';
          }
          
          resultDiv.style.color = '#FFD700';
          
          slotContainer.style.animation = 'jackpotShake 0.5s infinite';
          
          const _scc = window.innerWidth<768?6:12; for (let i = 0; i < _scc; i++) {
            setTimeout(() => {
              const confetti = document.createElement('div');
              confetti.textContent = ['🎉', '💎', '⭐', '✨', '👂'][Math.floor(Math.random() * 5)];
              confetti.style.cssText = `
                position: fixed;
                left: ${50 + (Math.random() - 0.5) * 30}%;
                top: 50%;
                font-size: 40px;
                z-index: 10001;
                pointer-events: none;
                animation: confettiExplode ${1 + Math.random()}s ease-out forwards;
              `;
              document.body.appendChild(confetti);
              setTimeout(() => confetti.remove(), 2000);
            }, i * 20);
          }
          
          if (typeof SoundSystem !== 'undefined') {
            SoundSystem.jackpot();
          }
          
        } else if (results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) {
          if (game.addScore) game.addScore(1500); else if (typeof window.score !== 'undefined') window.score += 1500;
          resultDiv.textContent = '✨ TWO EARS! +1500 ✨';
          resultDiv.style.color = '#00ff00';
          
          if (typeof SoundSystem !== 'undefined') {
            SoundSystem.bonus();
          }
        } else {
          if (game.addScore) game.addScore(300); else if (typeof window.score !== 'undefined') window.score += 300;
          resultDiv.textContent = '🎲 BETTER LUCK! +300 🎲';
          resultDiv.style.color = '#fff';
        }
        
        game.updateUI();
        
        setTimeout(() => {
          overlay.remove();
          window.gamePaused = false; // Resume game
          
          if (window.startSpawning) {
            setTimeout(() => window.startSpawning(), 100);
          }
        }, 3000);
      }
    }, 100);
  },
  
  magnet(game) {
    const duration = 10000;
    
    const notif = document.createElement('div');
    notif.textContent = '🧲 MAGNETIC PERSONALITY! 🧲';
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
    setTimeout(() => notif.remove(), 3000);
    
    let cursorX = 0;
    let cursorY = 0;
    
    const mouseMoveHandler = (e) => {
      cursorX = e.clientX;
      cursorY = e.clientY;
    };
    document.addEventListener('mousemove', mouseMoveHandler);
    
    const magnetInterval = setInterval(() => {
      const ears = document.querySelectorAll('.ear.active');
      
      ears.forEach(ear => {
        const rect = ear.getBoundingClientRect();
        const earX = rect.left + rect.width / 2;
        const earY = rect.top + rect.height / 2;
        
        const dx = cursorX - earX;
        const dy = cursorY - earY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 300) {
          const strength = 1 - (distance / 300);
          const moveX = dx * strength * 0.1;
          const moveY = dy * strength * 0.1;
          
          const hole = ear.parentElement;
          const currentTransform = hole.style.transform || '';
          hole.style.transform = currentTransform + ` translate(${moveX}px, ${moveY}px)`;
          
          if (distance < 50) {
            game.hitEar(ear);
            if (game.addScore) game.addScore(100); else if (typeof window.score !== 'undefined') window.score += 100; // Bonus for magnet hit
          }
        }
      });
    }, 50);
    
    setTimeout(() => {
      clearInterval(magnetInterval);
      document.removeEventListener('mousemove', mouseMoveHandler);
      
      document.querySelectorAll('.hole').forEach(hole => {
        hole.style.transform = '';
      });
    }, duration);
  },
  
  portal(game) {
    const duration = 15000;
    
    const notif = document.createElement('div');
    notif.textContent = '🌀 THINKING WITH PORTALS! 🌀';
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
    setTimeout(() => notif.remove(), 3000);
    
    const portal1 = document.createElement('div');
    portal1.textContent = '🌀';
    portal1.style.cssText = `
      position: fixed;
      top: 30%;
      left: 20%;
      font-size: 80px;
      z-index: 9999;
      animation: portalSpin 2s linear infinite;
      pointer-events: none;
    `;
    
    const portal2 = document.createElement('div');
    portal2.textContent = '🌀';
    portal2.style.cssText = `
      position: fixed;
      top: 30%;
      right: 20%;
      font-size: 80px;
      z-index: 9999;
      animation: portalSpin 2s linear infinite reverse;
      pointer-events: none;
    `;
    
    document.body.appendChild(portal1);
    document.body.appendChild(portal2);
    
    const originalSpawnEar = game.spawnEar;
    
    game.spawnEar = function() {
      originalSpawnEar.call(game);
      
      if (Math.random() < 0.5) {
        setTimeout(() => {
          const ears = document.querySelectorAll('.ear.active');
          if (ears.length > 0) {
            const randomEar = ears[Math.floor(Math.random() * ears.length)];
            const holes = Array.from(document.querySelectorAll('.hole'));
            const newHole = holes[Math.floor(Math.random() * holes.length)];
            
            randomEar.style.animation = 'portalTeleport 0.5s';
            
            setTimeout(() => {
              if (newHole.querySelector('.ear').classList.contains('active')) return;
              
              const oldHole = randomEar.parentElement;
              randomEar.classList.remove('active');
              
              const newEar = newHole.querySelector('.ear');
              newEar.textContent = randomEar.textContent;
              newEar.classList.add('active');
              
              randomEar.textContent = '👂';
              randomEar.style.animation = '';
            }, 250);
          }
        }, 500);
      }
    };
    
    setTimeout(() => {
      portal1.remove();
      portal2.remove();
      game.spawnEar = originalSpawnEar;
    }, duration);
  },
  
  skullLastChance(game) {
    window.gamePaused = true;
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(50,0,0,0.95));
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeIn 0.3s;
    `;
    
    const skull = document.createElement('div');
    skull.textContent = '💀';
    skull.style.cssText = `
      font-size: 200px;
      animation: skullPulse 0.5s infinite;
      cursor: pointer;
      filter: drop-shadow(0 0 30px #ff0000);
    `;
    
    const text = document.createElement('div');
    text.style.cssText = `
      position: absolute;
      top: 30%;
      left: 50%;
      transform: translateX(-50%);
      font-size: 50px;
      color: #ff0000;
      font-weight: bold;
      text-align: center;
      font-family: 'Luckiest Guy', cursive;
      text-shadow: 0 0 20px #ff0000;
    `;
    text.innerHTML = '💀 DEATH OR GLORY! 💀<br><span style="font-size: 30px;">CLICK 10 TIMES TO SURVIVE!</span>';
    
    const counter = document.createElement('div');
    counter.style.cssText = `
      position: absolute;
      bottom: 30%;
      left: 50%;
      transform: translateX(-50%);
      font-size: 80px;
      color: #FFD700;
      font-weight: bold;
      font-family: 'Luckiest Guy', cursive;
    `;
    counter.textContent = '10';
    
    overlay.appendChild(text);
    overlay.appendChild(skull);
    overlay.appendChild(counter);
    document.body.appendChild(overlay);
    
    let clicks = 0;
    let timeLeft = 5;
    
    const timer = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(timer);
        
        if (game.setScore) {
          game.setScore(-1000);
        } else {
          game.score = -1000;
        }
        
        overlay.remove();
        window.gamePaused = false;
        game.endGame(); // Failed - die
      }
    }, 1000);
    
    skull.addEventListener('click', () => {
      if (clicks >= 10) return; // Prevent clicking after 10
      
      clicks++;
      counter.textContent = 10 - clicks;
      
      skull.style.animation = 'none';
      setTimeout(() => {
        skull.style.animation = 'skullPulse 0.5s infinite';
      }, 10);
      
      if (clicks === 10) {
        clearInterval(timer);
        
        if (timeLeft > 0) {
          text.innerHTML = '⚔️ VICTORY! ⚔️<br><span style="font-size: 30px;">+1000 POINTS + INVINCIBILITY!</span>';
          text.style.color = '#00ff00';
          
          if (game.setScore) {
            game.setScore(game.score + 1000);
          } else {
            if (game.addScore) game.addScore(1000); else if (typeof window.score !== 'undefined') { window.score += 1000; } game.updateUI();
          }
          if (game.setStreak) game.setStreak(0);
          else game.streak = 0; // Reset misses
          
          game.powerUpActive = {type: 'invincible', endTime: Date.now() + 10000};
          
          setTimeout(() => {
            overlay.remove();
            window.gamePaused = false; // Resume game
            
            if (window.startSpawning) {
              setTimeout(() => window.startSpawning(), 100);
            }
          }, 2000);
        } else {
          game.endGame();
        }
      } else if (clicks > 10) {
        clearInterval(timer);
        text.textContent = '☠️ TOO MANY! YOU DIED! ☠️';
        text.style.color = '#ff0000';
        
        setTimeout(() => {
          overlay.remove();
          window.gamePaused = false;
          game.endGame();
        }, 1500);
      }
    });
  },
  
  mimic(game) {
    const duration = 10000;
    
    const notif = document.createElement('div');
    notif.textContent = '🎭 STOP COPYING ME! 🎭';
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
    setTimeout(() => notif.remove(), 3000);
    
    const mimic = document.createElement('div');
    mimic.textContent = '👂';
    mimic.style.cssText = `
      position: fixed;
      font-size: 60px;
      z-index: 9999;
      pointer-events: none;
      filter: drop-shadow(0 0 20px #ff00ff);
      transition: all 0.05s ease-out;
    `;
    document.body.appendChild(mimic);
    
    const mouseMoveHandler = (e) => {
      mimic.style.left = e.clientX + 'px';
      mimic.style.top = e.clientY + 'px';
    };
    
    document.addEventListener('mousemove', mouseMoveHandler);
    
    setTimeout(() => {
      document.removeEventListener('mousemove', mouseMoveHandler);
      mimic.remove();
    }, duration);
  },
  
  circus(game) {
    const duration = 8000;
    
    const notif = document.createElement('div');
    notif.textContent = '🎪 WELCOME TO THE CIRCUS! 🎯';
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
    setTimeout(() => notif.remove(), 3000);
    
    const shootInterval = setInterval(() => {
      const ear = document.createElement('div');
      ear.textContent = '👂';
      
      const startX = Math.random() * window.innerWidth;
      ear.style.cssText = `
        position: fixed;
        left: ${startX}px;
        bottom: 0;
        font-size: 50px;
        z-index: 9999;
        cursor: pointer;
        animation: shootUp 2s ease-out forwards;
      `;
      
      ear.addEventListener('click', () => {
        if (game.addScore) game.addScore(100); else if (typeof window.score !== 'undefined') { window.score += 100; } game.updateUI();
        ear.remove();
      });
      
      document.body.appendChild(ear);
      setTimeout(() => { if (ear.parentNode) ear.remove(); }, 2000);
    }, 400);
    
    setTimeout(() => clearInterval(shootInterval), duration);
  },
  
  batSwarm(game) {
    // BAT CONFIG: 3 size tiers — small = hard = big reward | large = easy = small reward
    const isMobile = window.innerWidth < 768;
    const BAT_CONFIGS = isMobile ? [
      // Mobile: 2 medium + 3 large + 2 giant (no tiny, touch targets need to be reachable)
      { size: 48, pts: 250, label: '+250', color: '#ff00ff', speed: 1.0 },
      { size: 48, pts: 250, label: '+250', color: '#ff00ff', speed: 1.1 },
      { size: 65, pts: 125, label: '+125', color: '#FFD700', speed: 1.3 },
      { size: 65, pts: 125, label: '+125', color: '#FFD700', speed: 1.4 },
      { size: 65, pts: 125, label: '+125', color: '#FFD700', speed: 1.5 },
      { size: 80, pts: 60,  label: '+60',  color: '#00ffff', speed: 1.7 },
      { size: 80, pts: 60,  label: '+60',  color: '#00ffff', speed: 1.8 },
    ] : [
      // Desktop: 1 tiny + 2 small + 2 medium + 2 large + 1 giant
      { size: 44, pts: 400, label: '+400', color: '#ff00ff', speed: 0.7 },  // tiny = epic
      { size: 56, pts: 250, label: '+250', color: '#ff6600', speed: 0.9 },  // small
      { size: 56, pts: 250, label: '+250', color: '#ff6600', speed: 1.0 },  // small
      { size: 70, pts: 125, label: '+125', color: '#FFD700', speed: 1.2 },  // medium
      { size: 70, pts: 125, label: '+125', color: '#FFD700', speed: 1.3 },  // medium
      { size: 90, pts: 60,  label: '+60',  color: '#00ffff', speed: 1.6 },  // large
      { size: 90, pts: 60,  label: '+60',  color: '#00ffff', speed: 1.7 },  // large
      { size: 110, pts: 30, label: '+30',  color: '#888888', speed: 2.0 },  // giant = cheap
    ];
    const totalBats = BAT_CONFIGS.length;

    const notif = document.createElement('div');
    notif.innerHTML = `
      <div style="font-size:${isMobile?'34px':'46px'};margin-bottom:6px">🦇 BAT SWARM! 🦇</div>
      <div style="font-size:${isMobile?'16px':'20px'};color:#FFD700">Petites chauves → GROS points!</div>
      <div style="font-size:${isMobile?'14px':'17px'};color:#ff00ff;margin-top:4px">⚡ 5 clics rapides = GIGA BONUS!</div>
    `;
    notif.style.cssText = `position:fixed;top:70px;left:50%;transform:translateX(-50%);background:linear-gradient(45deg,#000,#1a0033,#000);border:4px solid #ff00ff;padding:14px 28px;font-family:'Luckiest Guy',cursive;color:#fff;text-shadow:-2px 0 #ff00ff,2px 0 #00ffff;z-index:100000;border-radius:10px;box-shadow:0 0 30px rgba(255,0,255,0.6);text-align:center;pointer-events:none;`;
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);

    let caughtBats = 0;
    let totalEarned = 0;
    let recentClicks = [];
    let gigaBonusTriggered = false;

    const counter = document.createElement('div');
    counter.textContent = `🦇 0/${totalBats}`;
    counter.style.cssText = `position:fixed;top:14px;left:50%;transform:translateX(-50%);font-size:${isMobile?'26px':'34px'};color:#FFD700;font-weight:bold;z-index:100001;text-shadow:0 0 20px #FFD700;font-family:'Luckiest Guy',cursive;pointer-events:none;`;
    document.body.appendChild(counter);

    const triggerGigaBonus = () => {
      if (gigaBonusTriggered) return;
      gigaBonusTriggered = true;
      const bonus = 2500;
      totalEarned += bonus;
      if (game.addScore) game.addScore(bonus);
      else if (typeof window.score !== 'undefined') {
        window.score += bonus;
        const el = document.getElementById('score');
        if (el) el.textContent = Math.round(window.score);
      }
      if (game.updateUI) game.updateUI();

      const giga = document.createElement('div');
      giga.innerHTML = `
        <div style="font-size:clamp(38px,9vw,65px)">🦇🦇🦇🦇🦇</div>
        <div style="font-size:clamp(26px,5.5vw,44px);color:#FFD700;margin-top:8px">GIGA BONUS! +${bonus} PTS!</div>
        <div style="font-size:clamp(16px,3vw,22px);color:#ff00ff;margin-top:6px">5 BATS EN RAFALE!</div>
      `;
      giga.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:linear-gradient(135deg,#1a0033,#330000);border:6px solid #FFD700;padding:28px 44px;font-family:'Luckiest Guy',cursive;color:#fff;z-index:100005;border-radius:20px;text-align:center;box-shadow:0 0 60px #FFD700,0 0 120px #ff00ff;animation:jackpotShake 0.3s infinite;pointer-events:none;`;
      document.body.appendChild(giga);
      setTimeout(() => giga.remove(), 2800);
    };

    BAT_CONFIGS.forEach((cfg, i) => {
      setTimeout(() => {
        const bat = document.createElement('div');
        bat.textContent = '🦇';
        bat.style.cssText = `
          position:fixed;
          left:${8 + Math.random() * 78}%;
          top:${isMobile ? 12 + Math.random() * 65 : 8 + Math.random() * 75}%;
          font-size:${cfg.size}px;
          z-index:99999;cursor:pointer;
          animation:batFly ${cfg.speed + Math.random() * 0.3}s ease-in-out infinite;
          filter:drop-shadow(0 0 ${Math.round(cfg.size / 6)}px ${cfg.color});
          transition:transform 0.15s;
          pointer-events:auto;touch-action:manipulation;
          -webkit-tap-highlight-color:transparent;user-select:none;
        `;
        bat.onmouseenter = () => bat.style.transform = 'scale(1.2)';
        bat.onmouseleave = () => bat.style.transform = 'scale(1)';

        let clicked = false;
        const catchBat = () => {
          if (clicked) return;
          clicked = true;
          caughtBats++;
          totalEarned += cfg.pts;
          bat.remove();

          if (game.addScore) game.addScore(cfg.pts);
          else if (typeof window.score !== 'undefined') {
            window.score += cfg.pts;
            const el = document.getElementById('score');
            if (el) el.textContent = Math.round(window.score);
          }
          if (game.updateUI) game.updateUI();

          counter.textContent = `🦇 ${caughtBats}/${totalBats} +${totalEarned}`;

          // Floating label
          const plus = document.createElement('div');
          plus.textContent = cfg.label;
          plus.style.cssText = `position:fixed;left:${bat.style.left};top:${bat.style.top};font-size:${Math.round(cfg.size * 0.35)}px;color:${cfg.color};font-weight:bold;z-index:100002;pointer-events:none;animation:floatUp 1s ease-out forwards;font-family:'Luckiest Guy',cursive;text-shadow:0 0 10px ${cfg.color};`;
          document.body.appendChild(plus);
          setTimeout(() => plus.remove(), 1000);

          // Particles (only 3 — perf)
          for (let j = 0; j < 3; j++) {
            const p = document.createElement('div');
            p.textContent = j % 2 === 0 ? '✨' : '🦇';
            p.style.cssText = `position:fixed;left:${bat.style.left};top:${bat.style.top};font-size:16px;z-index:100000;pointer-events:none;animation:explode${j % 5} 0.5s ease-out forwards;`;
            document.body.appendChild(p);
            setTimeout(() => p.remove(), 500);
          }

          // Giga bonus detection: 5 clicks within 450ms
          const now = Date.now();
          recentClicks.push(now);
          recentClicks = recentClicks.filter(t => now - t < 450);
          if (recentClicks.length >= 5 && !gigaBonusTriggered) triggerGigaBonus();

          // All caught
          if (caughtBats === totalBats) {
            const bonus = 600;
            totalEarned += bonus;
            if (game.addScore) game.addScore(bonus);
            else if (typeof window.score !== 'undefined') { window.score += bonus; const el = document.getElementById('score'); if (el) el.textContent = Math.round(window.score); }
            if (game.updateUI) game.updateUI();

            const msg = document.createElement('div');
            msg.innerHTML = `<div style="font-size:clamp(34px,8vw,54px)">🦇 ALL BATS CAUGHT! 🦇</div><div style="font-size:clamp(20px,4vw,32px);color:#FFD700;margin-top:6px">+${totalEarned} POINTS TOTAL!</div>`;
            msg.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#8b00ff;font-family:'Luckiest Guy',cursive;z-index:100003;text-align:center;text-shadow:0 0 30px #8b00ff;pointer-events:none;animation:fadeOut 2.5s forwards;`;
            document.body.appendChild(msg);
            setTimeout(() => msg.remove(), 2500);
          }
        };

        bat.addEventListener('click', catchBat);
        bat.addEventListener('touchstart', (e) => { e.preventDefault(); catchBat(); }, { passive: false });
        document.body.appendChild(bat);

        // Auto-escape after 4s
        setTimeout(() => {
          if (!clicked && bat.parentNode) {
            bat.style.animation = 'flyAway 0.4s ease-in forwards';
            setTimeout(() => bat.remove(), 400);
          }
        }, 4500);
      }, i * 220);
    });

    // Cleanup counter
    setTimeout(() => {
      counter.remove();
      if (totalEarned > 0 && caughtBats < totalBats) {
        const msg = document.createElement('div');
        msg.textContent = `🦇 ${caughtBats}/${totalBats} bats! +${totalEarned} pts!`;
        msg.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-size:clamp(22px,4.5vw,36px);color:#8b00ff;font-weight:bold;z-index:100001;text-align:center;text-shadow:0 0 20px #8b00ff;font-family:'Luckiest Guy',cursive;pointer-events:none;animation:fadeOut 2s forwards;`;
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 2000);
      }
    }, totalBats * 220 + 5000);
  },


  mineField(game) {
    const duration = 8000;
    
    const notif = document.createElement('div');
    notif.textContent = '💣 MINE FIELD! CAREFUL! 💣';
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
    setTimeout(() => notif.remove(), 3000);
    
    const holes = Array.from(document.querySelectorAll('.hole'));
    const bombHoles = [];
    
    for (let i = 0; i < 4; i++) {
      const randomHole = holes[Math.floor(Math.random() * holes.length)];
      if (!bombHoles.includes(randomHole)) {
        bombHoles.push(randomHole);
        
        const bomb = document.createElement('div');
        bomb.textContent = '💣';
        bomb.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 50px;
          z-index: 10;
          cursor: pointer;
          animation: bombPulse 0.5s ease-in-out infinite;
        `;
        
        bomb.addEventListener('click', () => {
          game.score = Math.max(0, game.score - 200);
          game.updateUI();
          
          if (typeof SoundSystem !== 'undefined') {
            SoundSystem.explosion();
          }
          
          const boom = document.createElement('div');
          boom.textContent = '💥 -200! 💥';
          boom.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 50px;
            color: #ff0000;
            font-weight: bold;
            z-index: 10000;
            text-shadow: 0 0 20px #ff0000;
            font-family: 'Luckiest Guy', cursive;
            animation: fadeOut 1s;
            pointer-events: none;
          `;
          document.body.appendChild(boom);
          setTimeout(() => boom.remove(), 1000);
          bomb.remove();
        });
        
        randomHole.appendChild(bomb);
        
        setTimeout(() => {
          if (bomb.parentNode) {
            bomb.style.animation = 'fadeOut 0.5s';
            setTimeout(() => bomb.remove(), 500);
          }
        }, duration);
      }
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MegaBonusEffects;
}
