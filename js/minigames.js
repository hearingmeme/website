// ==================== MINI-GAMES SYSTEM ====================

const MiniGames = {
  
  // 🔥 MOBILE: Universal hover/touch helper
  addUniversalHover(element, scaleValue = 1.1) {
    if (!element) return;
    
    const isMobile = 'ontouchstart' in window;
    
    if (isMobile) {
      element.addEventListener('touchstart', () => {
        element.style.transform = `scale(${scaleValue})`;
        if (navigator.vibrate) navigator.vibrate(10);
      }, {passive: true});
      
      element.addEventListener('touchend', () => {
        element.style.transform = 'scale(1)';
      }, {passive: true});
    } else {
      element.onmouseenter = () => {
        element.style.transform = `scale(${scaleValue})`;
      };
      element.onmouseleave = () => {
        element.style.transform = 'scale(1)';
      };
    }
  },
  
  // 🔊 TTS Helper function
  speak(text) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      utterance.volume = 1.0; // +20% (was 0.8)
      window.speechSynthesis.speak(utterance);
    }
  },
  
  lastSpawn: 0,
  minSpawnInterval: 30000, // 30 seconds minimum between spawns
  
  trySpawnMysteryBox(game) {
    const now = Date.now();
    if (now - this.lastSpawn < this.minSpawnInterval) return;
    if (Math.random() > 0.02) return; // 2% chance
    
    this.lastSpawn = now;
    this.showMysteryBox(game);
  },
  
  showMysteryBox(game) {
    window.gamePaused = true;
    
    // 🔊 TTS
    this.speak("Mystery box! Let's see what you get!");
    
    // 🐛 FIX: Clear ALL active ears to prevent deaths during mini-game
    document.querySelectorAll('.ear').forEach(ear => {
      ear.classList.remove('active', 'cabal', 'echo', 'power-up');
      ear.textContent = '';
    });
    if (typeof window.activeEarsCount !== 'undefined') {
      window.activeEarsCount = 0;
    }
    
    const box = document.createElement('div');
    box.id = 'mysteryBoxOverlay';  // FIX: Ajout ID
    box.textContent = '🎁';
    box.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 120px;
      z-index: 9999;
      cursor: pointer;
      animation: mysteryBounce 0.5s ease-in-out infinite;
      filter: drop-shadow(0 0 30px #FFD700);
    `;
    
    const label = document.createElement('div');
    label.textContent = 'CLICK 5 TIMES!';
    label.style.cssText = `
      position: fixed;
      top: 40%;
      left: 50%;
      transform: translateX(-50%);
      font-size: 30px;
      color: #FFD700;
      font-weight: bold;
      font-family: 'Luckiest Guy', cursive;
      text-shadow: 0 0 20px #FFD700;
      z-index: 99999;
      pointer-events: none;
    `;
    
    const counter = document.createElement('div');
    counter.textContent = '5';
    counter.style.cssText = `
      position: fixed;
      top: 60%;
      left: 50%;
      transform: translateX(-50%);
      font-size: 80px;
      color: #fff;
      font-weight: bold;
      font-family: 'Luckiest Guy', cursive;
      text-shadow: 0 0 20px #FFD700;
      z-index: 99999;
      pointer-events: none;
    `;
    
    document.body.appendChild(box);
    document.body.appendChild(label);
    document.body.appendChild(counter);
    
    let clicks = 0;
    let removed = false;
    
    const handleClick = () => {
      if (removed) return;
      
      clicks++;
      counter.textContent = 5 - clicks;
      box.style.animation = 'mysteryShake 0.2s';
      setTimeout(() => {
        box.style.animation = 'mysteryBounce 0.5s ease-in-out infinite';
      }, 200);
      
      if (clicks >= 5) {
        removed = true;
        this.openMysteryBox(game, box, label, counter);
      }
    };
    
    box.addEventListener('click', handleClick);
    
    setTimeout(() => {
      if (!removed) {
        removed = true;
        box.remove();
        label.remove();
        counter.remove();
        
        window.gamePaused = false;
        if (window.startSpawning) {
          setTimeout(() => window.startSpawning(), 100);
        }
      }
    }, 5000);
  },
  
  openMysteryBox(game, box, label, counter) {
    box.style.animation = 'mysteryExplode 0.5s';
    
    if (typeof SoundSystem !== 'undefined') {
      SoundSystem.explosion();
    }
    
    setTimeout(() => {
      box.remove();
      label.remove();
      counter.remove();
      
      const rewards = [
        { 
          text: '👂 +500 COINS!', 
          action: () => { /* coins not impl yet */ },
          sound: 'coin'
        },
        { 
          text: '⭐ +1000 POINTS!', 
          action: () => { game.score += 1000; },
          sound: 'bonus'
        },
        { 
          text: '❤️ EXTRA LIFE!', 
          action: () => { 
            if (window.addLife) window.addLife();
            else game.streak = Math.max(0, game.streak - 2);
          },
          sound: 'powerUp'
        },
        { 
          text: '🔥 +5 COMBO!', 
          action: () => { game.combo += 5; },
          sound: 'combo'
        },
        { 
          text: '💎 JACKPOT! +2000!', 
          action: () => { game.score += 2000; },
          sound: 'jackpot'
        }
      ];
      
      const reward = rewards[Math.floor(Math.random() * rewards.length)];
      reward.action();
      
      if (typeof SoundSystem !== 'undefined' && reward.sound) {
        SoundSystem[reward.sound]();
      }
      
      const result = document.createElement('div');
      result.textContent = reward.text;
      result.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 50px;
        color: #FFD700;
        font-weight: bold;
        z-index: 99999;
        text-shadow: 0 0 30px #FFD700;
        font-family: 'Luckiest Guy', cursive;
        animation: fadeIn 0.3s, fadeOut 0.5s 2s;
        pointer-events: none;
      `;
      document.body.appendChild(result);
      setTimeout(() => {
        result.remove();
        
        window.gamePaused = false;
        if (window.startSpawning) {
          setTimeout(() => window.startSpawning(), 100);
        }
      }, 2500);
      
      game.updateUI();
    }, 500);
  },
  
  showMemoryGame(game) {
    window.gamePaused = true;
    
    // 🎯 DIFFICULTÉ PROGRESSIVE: Calculer nombre de holes à retenir
    const currentLevel = (game && game.level) || (typeof window.level !== 'undefined' ? window.level : 1);
    const baseHoles = 5;
    const bonusHoles = Math.floor(currentLevel / 5); // +1 tous les 5 niveaux
    const sequenceLength = Math.min(baseHoles + bonusHoles, 12); // Max 12 holes
    
    // 🔊 TTS
    this.speak(`Memory game! Memorize ${sequenceLength} positions and repeat them!`);
    
    // 🐛 FIX: Clear ALL active ears to prevent deaths during mini-game
    document.querySelectorAll('.ear').forEach(ear => {
      ear.classList.remove('active', 'cabal', 'echo', 'power-up');
      ear.textContent = '';
    });
    if (typeof window.activeEarsCount !== 'undefined') {
      window.activeEarsCount = 0;
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'memoryOverlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      animation: fadeIn 0.3s;
    `;
    
    overlay.innerHTML = `
      <div style="
        font-size: clamp(50px, 8vw, 80px); 
        color: #FFD700; 
        font-family: 'Luckiest Guy', cursive; 
        margin-bottom: 30px;
        text-shadow: 
          0 0 30px #FFD700,
          0 0 60px #FF6B00,
          4px 4px 0 #000,
          8px 8px 0 rgba(0,0,0,0.7);
        animation: titleGlow 2s ease-in-out infinite;
      ">🧠 MEMORY GAME 🧠</div>
      
      <div style="
        font-size: clamp(25px, 4vw, 40px); 
        color: #00ffff; 
        margin-bottom: 15px;
        font-family: 'Luckiest Guy', cursive;
        text-shadow: 0 0 20px #00ffff, 2px 2px 0 #000;
      ">MEMORIZE ${sequenceLength} HOLE POSITION${sequenceLength > 1 ? 'S' : ''}!</div>
      
      <div style="
        font-size: clamp(20px, 3vw, 32px); 
        color: #fc0; 
        margin-bottom: 40px;
        font-family: 'Luckiest Guy', cursive;
        text-shadow: 0 0 15px #fc0, 2px 2px 0 #000;
      ">THEN CLICK THEM BACK IN ORDER!</div>
      
      <button id="memoryReadyBtn" style="
        font-size: clamp(30px, 5vw, 50px);
        padding: clamp(20px, 3vw, 30px) clamp(50px, 8vw, 80px);
        background: linear-gradient(145deg, #00ff00, #00cc00);
        color: #000;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        font-family: 'Luckiest Guy', cursive;
        box-shadow: 0 10px 40px rgba(0,255,0,0.8), 0 0 60px rgba(0,255,0,0.4);
        transition: all 0.2s;
        animation: pulseButton 1.5s ease-in-out infinite;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">START!</button>
      
      <div id="memoryInstructions" style="
        font-size: clamp(30px, 5vw, 50px); 
        color: #FFD700; 
        margin-top: 50px; 
        min-height: 60px; 
        font-family: 'Luckiest Guy', cursive;
        text-shadow: 
          0 0 25px #FFD700,
          0 0 50px #FF6B00,
          3px 3px 0 #000;
      "></div>
      
      <div id="memoryProgress" style="
        font-size: clamp(28px, 4vw, 45px); 
        color: #fff; 
        margin-top: 20px; 
        min-height: 50px; 
        font-family: 'Luckiest Guy', cursive;
        text-shadow: 
          0 0 20px #fff,
          2px 2px 0 #000;
      "></div>
    `;
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      const readyBtn = document.getElementById('memoryReadyBtn');
      if (!readyBtn) return;
      
      // 🔥 MOBILE FIX: Universal hover
      MiniGames.addUniversalHover(readyBtn, 1.1);
      
      readyBtn.addEventListener('click', () => {
        // 🐛 FIX: Rendre transparent au lieu de cacher
        overlay.style.background = 'transparent';
        overlay.style.pointerEvents = 'none';
        overlay.innerHTML = '';
        
        const floatingInstr = document.createElement('div');
        floatingInstr.textContent = '👀 WATCH CAREFULLY! 👀';
        floatingInstr.style.cssText = `
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
        document.body.appendChild(floatingInstr);
        
        const holes = Array.from(document.querySelectorAll('.hole'));
        
        // Réutiliser sequenceLength calculé plus haut
        const sequence = [];
        for (let i = 0; i < sequenceLength; i++) {
          sequence.push(holes[Math.floor(Math.random() * holes.length)]);
        }
        
        setTimeout(() => {
          let showIndex = 0;
          const showInterval = setInterval(() => {
            if (showIndex >= sequence.length) {
              clearInterval(showInterval);
              floatingInstr.remove();
              
              // 🐛 FIX: Restaurer overlay correctement
              overlay.style.background = 'rgba(0, 0, 0, 0.95)';
              overlay.style.pointerEvents = 'auto';
              overlay.style.display = 'flex';
              overlay.innerHTML = `
                <div style="font-size: 60px; color: #FFD700; font-family: 'Luckiest Guy', cursive; margin-bottom: 30px;">🧠 YOUR TURN! 🧠</div>
                <div style="font-size: 40px; color: #fff; margin-bottom: 20px;">Click the ${sequenceLength} holes in order!</div>
                <div id="memoryProgress" style="font-size: 50px; color: #00ff00; font-family: 'Luckiest Guy', cursive;">0 / ${sequenceLength}</div>
              `;
              
              MiniGames.playMemoryGame(game, sequence, overlay, sequenceLength);
              return;
            }
            
            const hole = sequence[showIndex];
            
            const number = document.createElement('div');
            number.textContent = showIndex + 1;
            number.style.cssText = `
              position: fixed;
              top: 200px;
              left: 50%;
              transform: translateX(-50%);
              font-size: 120px;
              color: #FFD700;
              font-weight: bold;
              z-index: 100002;
              text-shadow: 0 0 50px #FFD700;
              font-family: 'Luckiest Guy', cursive;
              pointer-events: none;
              animation: fadeOut 0.8s;
            `;
            document.body.appendChild(number);
            setTimeout(() => number.remove(), 800);
            
            hole.style.boxShadow = '0 0 80px #FFD700, inset 0 0 80px #FFD700';
            hole.style.transform = 'scale(1.2)';
            hole.style.zIndex = '100000';
            hole.style.filter = 'brightness(2)';
            
            setTimeout(() => {
              hole.style.boxShadow = '';
              hole.style.transform = '';
              hole.style.zIndex = '';
              hole.style.filter = '';
            }, 700);
            
            showIndex++;
          }, 1000);
        }, 800);
      });
    }, 100);
  },
  
  playMemoryGame(game, sequence, overlay, sequenceLength) {
    // 🐛 FIX: Ne PAS cacher l'overlay, juste le vider et le rendre transparent
    overlay.style.background = 'transparent';
    overlay.style.pointerEvents = 'none'; // Laisser passer les clics vers les holes
    overlay.innerHTML = ''; // Vider le contenu
    
    const floatingUI = document.createElement('div');
    floatingUI.style.cssText = `
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 100001;
      text-align: center;
      pointer-events: none;
    `;
    
    floatingUI.innerHTML = `
      <div style="font-size: 50px; color: #FFD700; font-family: 'Luckiest Guy', cursive; margin-bottom: 20px; text-shadow: 0 0 30px #FFD700;">🧠 YOUR TURN! 🧠</div>
      <div style="font-size: 35px; color: #fff; font-family: 'Luckiest Guy', cursive; margin-bottom: 15px; text-shadow: 0 0 20px #000;">Click the holes in order!</div>
      <div id="memoryProgressFloat" style="font-size: 55px; color: #00ff00; font-family: 'Luckiest Guy', cursive; text-shadow: 0 0 25px #00ff00;">0 / ${sequenceLength}</div>
    `;
    
    document.body.appendChild(floatingUI);
    
    let playerIndex = 0;
    const holes = document.querySelectorAll('.hole');
    
    const clickHandler = (e) => {
      const hole = e.currentTarget;
      if (hole === sequence[playerIndex]) {
        hole.style.boxShadow = '0 0 80px #00ff00, inset 0 0 80px #00ff00';
        hole.style.transform = 'scale(1.15)';
        
        setTimeout(() => {
          hole.style.boxShadow = '';
          hole.style.transform = '';
        }, 400);
        
        playerIndex++;
        
        const progressFloat = document.getElementById('memoryProgressFloat');
        if (progressFloat) {
          progressFloat.textContent = `${playerIndex} / ${sequenceLength}`;
          progressFloat.style.animation = 'none';
          setTimeout(() => { progressFloat.style.animation = 'pulse 0.3s'; }, 10);
        }
        
        if (playerIndex >= sequence.length) {
          holes.forEach(h => h.removeEventListener('click', clickHandler));
          floatingUI.remove();
          
          // 🐛 FIX: Restaurer l'overlay correctement
          overlay.style.background = 'rgba(0, 0, 0, 0.95)';
          overlay.style.pointerEvents = 'auto';
          
          MiniGames.memoryGameSuccess(game, overlay, sequenceLength);
        }
      } else {
        hole.style.boxShadow = '0 0 80px #ff0000, inset 0 0 80px #ff0000';
        hole.style.transform = 'scale(1.15)';
        
        setTimeout(() => {
          hole.style.boxShadow = '';
          hole.style.transform = '';
        }, 400);
        
        holes.forEach(h => h.removeEventListener('click', clickHandler));
        floatingUI.remove();
        
        // 🐛 FIX: Restaurer l'overlay correctement
        overlay.style.background = 'rgba(0, 0, 0, 0.95)';
        overlay.style.pointerEvents = 'auto';
        
        MiniGames.memoryGameFail(game, overlay);
      }
    };

    holes.forEach((hole, idx) => {
      hole.addEventListener('click', clickHandler);
      hole.style.cursor = 'pointer';
    });
  },
  
  memoryGameSuccess(game, overlay, sequenceLength = 5) {
    // 🎯 V6: Points progressifs basés sur difficulté
    // Base: 300 pts + (sequenceLength * 50)
    const basePoints = 300;
    const bonusPoints = sequenceLength * 50;
    const totalPoints = basePoints + bonusPoints;
    
    overlay.innerHTML = `
      <div style="
        font-size: clamp(60px, 10vw, 120px); 
        color: #00ff00; 
        font-family: 'Luckiest Guy', cursive; 
        margin-bottom: 30px; 
        animation: bounce 0.5s, rainbow 2s infinite;
        text-shadow: 
          0 0 40px #00ff00,
          0 0 80px #00ff00,
          4px 4px 0 #000,
          8px 8px 0 rgba(0,0,0,0.5);
      ">🧠 BIG BRAIN! 🧠</div>
      
      <div style="
        font-size: clamp(35px, 6vw, 65px); 
        color: #FFD700; 
        margin-bottom: 25px;
        text-shadow: 0 0 30px #FFD700, 3px 3px 0 #000;
        animation: pulse 1s infinite;
      ">MEMORY GOD MODE!</div>
      
      <div style="
        font-size: clamp(50px, 8vw, 90px); 
        color: #fff;
        text-shadow: 0 0 25px #fff, 3px 3px 0 #000;
        animation: jackpotShake 0.3s infinite;
      ">💎 +${totalPoints} PTS 💎</div>
      
      <div style="
        font-size: clamp(20px, 4vw, 35px); 
        color: #0ff;
        margin-top: 20px;
        text-shadow: 0 0 15px #0ff;
        animation: float 2s ease-in-out infinite;
      ">REMEMBERED ${sequenceLength} HOLES! 🏆</div>
    `;
    
    if (typeof SoundSystem !== 'undefined') {
      SoundSystem.jackpot();
    }
    
    game.score += totalPoints;
    if (game.updateUI) game.updateUI();
    
    // Confetti effect
    const _cp = window.innerWidth<768?6:10; for (let i = 0; i < _cp; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.textContent = ['🎉', '💎', '🔥', '⭐', '💰'][Math.floor(Math.random() * 5)];
        confetti.style.cssText = `
          position: fixed;
          left: ${Math.random() * 100}%;
          top: -50px;
          font-size: ${30 + Math.random() * 40}px;
          z-index: 100000;
          pointer-events: none;
          animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
        `;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 4000);
      }, i * 30);
    }
    
    setTimeout(() => {
      overlay.remove();
      window.gamePaused = false;
      
      if (window.startSpawning) {
        setTimeout(() => window.startSpawning(), 100);
      }
    }, 3000);
  },
  
  memoryGameFail(game, overlay) {
    const penalty = 200;
    const oldScore = game.score;
    game.score = Math.max(0, game.score - penalty);
    const actualPenalty = oldScore - game.score;
    
    overlay.innerHTML = `
      <div style="
        font-size: clamp(60px, 10vw, 120px); 
        color: #ff0000; 
        font-family: 'Luckiest Guy', cursive; 
        margin-bottom: 30px;
        animation: glitch 0.3s infinite;
        text-shadow: 
          0 0 40px #ff0000,
          0 0 80px #ff0000,
          4px 4px 0 #000,
          8px 8px 0 rgba(0,0,0,0.5);
      ">💀 REKT! 💀</div>
      
      <div style="
        font-size: clamp(30px, 5vw, 55px); 
        color: #fff; 
        margin-bottom: 25px;
        text-shadow: 0 0 20px #fff, 3px 3px 0 #000;
      ">GOLDFISH BRAIN DETECTED!</div>
      
      <div style="
        font-size: clamp(45px, 7vw, 80px); 
        color: #ff6600;
        text-shadow: 0 0 30px #ff6600, 3px 3px 0 #000;
        animation: shake 0.3s infinite;
      ">📉 -${actualPenalty} PTS 📉</div>
      
      <div style="
        font-size: clamp(18px, 3vw, 32px); 
        color: #aaa;
        margin-top: 20px;
        text-shadow: 2px 2px 0 #000;
        font-style: italic;
      ">NGMI... TRY HARDER NEXT TIME 🤡</div>
    `;
    
    if (typeof SoundSystem !== 'undefined') {
      SoundSystem.miss();
    }
    
    if (game.updateUI) game.updateUI();
    
    // Sad emoji rain
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const sad = document.createElement('div');
        sad.textContent = ['💀', '😭', '🤡', '📉', '💩'][Math.floor(Math.random() * 5)];
        sad.style.cssText = `
          position: fixed;
          left: ${Math.random() * 100}%;
          top: -50px;
          font-size: ${30 + Math.random() * 30}px;
          z-index: 100000;
          pointer-events: none;
          animation: confettiFall ${2 + Math.random() * 1}s linear forwards;
          opacity: 0.7;
        `;
        document.body.appendChild(sad);
        setTimeout(() => sad.remove(), 3000);
      }, i * 50);
    }
    
    setTimeout(() => {
      overlay.remove();
      window.gamePaused = false;
      
      if (window.startSpawning) {
        setTimeout(() => window.startSpawning(), 100);
      }
    }, 3000);
  },
  
  showBlackjack(game) {
    window.gamePaused = true;
    
    // 🔊 TTS
    this.speak("Blackjack! Hit or stand? Good luck!");
    
    // 🐛 FIX: Clear ALL active ears to prevent deaths during mini-game
    document.querySelectorAll('.ear').forEach(ear => {
      ear.classList.remove('active', 'cabal', 'echo', 'power-up');
      ear.textContent = '';
    });
    if (typeof window.activeEarsCount !== 'undefined') {
      window.activeEarsCount = 0;
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'blackjackOverlay';  // FIX: Ajout ID
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: linear-gradient(145deg, #0a2a0a, #001a00);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      animation: fadeIn 0.3s;
    `;
    
    let bet = 200; // Increased bet
    
    overlay.innerHTML = `
      <div style="font-size: 40px; color: #FFD700; font-family: 'Luckiest Guy', cursive; margin-bottom: 15px; text-shadow: 0 0 20px #FFD700;">🃏 BLACKJACK 🃏</div>
      <div id="betDisplay" style="font-size: 25px; color: #00ff00; margin-bottom: 15px; font-family: 'Luckiest Guy', cursive;">BET: ${bet} 👂</div>
      
      <div style="background: rgba(0,50,0,0.5); padding: 15px 25px; border-radius: 15px; border: 2px solid #FFD700; margin: 10px; max-width: 500px;">
        <div style="font-size: 18px; color: #fff; margin-bottom: 8px;">🎩 DEALER:</div>
        <div id="dealerCards" style="font-size: 50px; min-height: 60px;"></div>
        <div id="dealerTotal" style="font-size: 22px; color: #ff0000; margin-top: 8px; font-family: 'Luckiest Guy', cursive;"></div>
      </div>
      
      <div style="background: rgba(50,50,0,0.5); padding: 15px 25px; border-radius: 15px; border: 2px solid #00ff00; margin: 10px; max-width: 500px;">
        <div style="font-size: 18px; color: #fff; margin-bottom: 8px;">😎 YOU:</div>
        <div id="playerCards" style="font-size: 50px; min-height: 60px;"></div>
        <div id="playerTotal" style="font-size: 25px; color: #FFD700; margin-top: 8px; font-family: 'Luckiest Guy', cursive;"></div>
      </div>
      
      <div id="blackjackButtons" style="display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; justify-content: center;">
        <button id="hitBtn" style="padding: 12px 30px; font-size: 22px; background: #00ff00; color: #000; border: 3px solid #fff; border-radius: 10px; cursor: pointer; font-family: 'Luckiest Guy', cursive; transition: all 0.2s; box-shadow: 0 4px 15px rgba(0,255,0,0.5);">HIT ME</button>
        <button id="standBtn" style="padding: 12px 30px; font-size: 22px; background: #ff0000; color: #fff; border: 3px solid #fff; border-radius: 10px; cursor: pointer; font-family: 'Luckiest Guy', cursive; transition: all 0.2s; box-shadow: 0 4px 15px rgba(255,0,0,0.5);">STAND</button>
        <button id="doubleBtn" style="padding: 12px 30px; font-size: 22px; background: #FFD700; color: #000; border: 3px solid #fff; border-radius: 10px; cursor: pointer; font-family: 'Luckiest Guy', cursive; transition: all 0.2s; box-shadow: 0 4px 15px rgba(255,215,0,0.5);">DOUBLE!</button>
      </div>
      
      <div id="blackjackResult" style="font-size: 35px; color: #FFD700; margin-top: 25px; font-family: 'Luckiest Guy', cursive; text-shadow: 0 0 15px #FFD700;"></div>
    `;
    
    document.body.appendChild(overlay);
    
    const animateCard = (element, card) => {
      element.style.animation = 'cardDeal 0.3s ease-out';
      setTimeout(() => element.style.animation = '', 300);
      return card;
    };
    
    const cards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const cardSymbols = ['♠️', '♥️', '♣️', '♦️'];
    
    const drawCard = () => {
      const card = cards[Math.floor(Math.random() * cards.length)];
      const symbol = cardSymbols[Math.floor(Math.random() * cardSymbols.length)];
      return { card, symbol, display: card + symbol };
    };
    
    const calculateTotal = (hand) => {
      let total = 0;
      let aces = 0;
      
      hand.forEach(c => {
        if (c.card === 'A') {
          aces++;
          total += 11;
        } else if (['J', 'Q', 'K'].includes(c.card)) {
          total += 10;
        } else {
          total += parseInt(c.card);
        }
      });
      
      while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
      }
      
      return total;
    };
    
    let playerHand = [drawCard(), drawCard()];
    let dealerHand = [drawCard(), drawCard()];
    let gameOver = false;
    let canDouble = true;
    
    const updateDisplay = (hideDealer = true) => {
      const playerCardsEl = document.getElementById('playerCards');
      const dealerCardsEl = document.getElementById('dealerCards');
      const playerTotalEl = document.getElementById('playerTotal');
      const dealerTotalEl = document.getElementById('dealerTotal');
      
      playerCardsEl.textContent = playerHand.map(c => c.display).join(' ');
      const playerTotal = calculateTotal(playerHand);
      playerTotalEl.textContent = `Total: ${playerTotal}`;
      
      if (playerTotal === 21 && playerHand.length === 2) {
        playerTotalEl.textContent += ' 🎉 BLACKJACK!';
      }
      
      if (hideDealer) {
        dealerCardsEl.textContent = dealerHand[0].display + ' 🂠';
        dealerTotalEl.textContent = '???';
      } else {
        dealerCardsEl.textContent = dealerHand.map(c => c.display).join(' ');
        dealerTotalEl.textContent = `Total: ${calculateTotal(dealerHand)}`;
      }
      
      animateCard(playerCardsEl);
    };
    
    const endGame = (result, multiplier = 1) => {
      gameOver = true;
      updateDisplay(false);
      
      const resultEl = document.getElementById('blackjackResult');
      const buttonsEl = document.getElementById('blackjackButtons');
      buttonsEl.style.display = 'none';
      
      let winAmount = 0;
      let message = '';
      
      if (result === 'blackjack') {
        winAmount = Math.floor(bet * 2.5);
        message = `🎉 BLACKJACK! +${winAmount} 🎉`;
        resultEl.style.color = '#FFD700';
        
        for (let i = 0; i < 20; i++) {
          setTimeout(() => {
            const fw = document.createElement('div');
            fw.textContent = ['💥','✨','⭐','🎆','🎇'][Math.floor(Math.random() * 5)];
            fw.style.cssText = `
              position: fixed;
              left: ${Math.random() * 100}%;
              top: ${Math.random() * 100}%;
              font-size: 40px;
              z-index: 100000;
              pointer-events: none;
              animation: fadeOut 1s;
            `;
            document.body.appendChild(fw);
            setTimeout(() => fw.remove(), 1000);
          }, i * 50);
        }
      } else if (result === 'win') {
        winAmount = bet * 2 * multiplier;
        message = `🎊 YOU WIN! +${winAmount} 🎊`;
        resultEl.style.color = '#00ff00';
      } else if (result === 'push') {
        winAmount = bet;
        message = `🤝 PUSH! +${bet} 🤝`;
        resultEl.style.color = '#FFD700';
      } else {
        winAmount = 0;
        message = `💀 YOU LOSE! -${bet} 💀`;
        resultEl.style.color = '#ff0000';
        game.score -= bet;
      }
      
      if (winAmount > 0) {
        game.score += winAmount;
      }
      
      game.updateUI();
      resultEl.textContent = message;
      
      setTimeout(() => {
        overlay.remove();
        window.gamePaused = false;
        
        if (window.startSpawning) {
          setTimeout(() => window.startSpawning(), 100);
        }
      }, 3000);
    };
    
    if (calculateTotal(playerHand) === 21 && calculateTotal(dealerHand) !== 21) {
      updateDisplay(false);
      setTimeout(() => endGame('blackjack'), 500);
      return;
    }
    
    updateDisplay();
    
    document.getElementById('hitBtn').addEventListener('click', () => {
      if (gameOver) return;
      canDouble = false;
      document.getElementById('doubleBtn').style.display = 'none';
      
      playerHand.push(drawCard());
      updateDisplay();
      
      const total = calculateTotal(playerHand);
      if (total > 21) {
        setTimeout(() => endGame('bust'), 500);
      } else if (total === 21) {
        setTimeout(() => stand(), 500);
      }
    });
    
    const stand = () => {
      if (gameOver) return;
      gameOver = true;
      document.getElementById('blackjackButtons').style.display = 'none';
      
      updateDisplay(false);
      
      const dealerDraw = setInterval(() => {
        const dealerTotal = calculateTotal(dealerHand);
        
        if (dealerTotal < 17) {
          dealerHand.push(drawCard());
          updateDisplay(false);
        } else {
          clearInterval(dealerDraw);
          
          const playerTotal = calculateTotal(playerHand);
          const finalDealerTotal = calculateTotal(dealerHand);
          
          if (finalDealerTotal > 21) {
            endGame('win');
          } else if (playerTotal > finalDealerTotal) {
            endGame('win');
          } else if (playerTotal === finalDealerTotal) {
            endGame('push');
          } else {
            endGame('lose');
          }
        }
      }, 1000);
    };
    
    document.getElementById('standBtn').addEventListener('click', stand);
    
    document.getElementById('doubleBtn').addEventListener('click', () => {
      if (gameOver || !canDouble) return;
      
      bet *= 2;
      document.getElementById('betDisplay').textContent = `BET: ${bet} 👂 DOUBLED!`;
      
      playerHand.push(drawCard());
      updateDisplay();
      
      const total = calculateTotal(playerHand);
      if (total > 21) {
        setTimeout(() => endGame('bust', 2), 500);
      } else {
        setTimeout(() => stand(), 500);
      }
    });
  },
  
  showTreasureChest(game) {
    window.gamePaused = true;
    
    // 🔊 TTS
    this.speak("Hearing Chest! Pick a chest if you dare!");
    
    // 🐛 FIX: Clear ALL active ears to prevent deaths during mini-game
    document.querySelectorAll('.ear').forEach(ear => {
      ear.classList.remove('active', 'cabal', 'echo', 'power-up');
      ear.textContent = '';
    });
    if (typeof window.activeEarsCount !== 'undefined') {
      window.activeEarsCount = 0;
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'hearingChestOverlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: linear-gradient(135deg, #0a0015 0%, #1a0030 50%, #2a0050 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 100005;
      animation: fadeIn 0.3s, rainbowPulse 3s infinite;
      overflow: hidden;
    `;
    
    // Add CSS animations
    const style = document.createElement('style');
    style.id = 'hearingChestStyles';
    style.innerHTML = `
      @keyframes rainbowPulse {
        0%, 100% { background: linear-gradient(135deg, #0a0015 0%, #1a0030 50%, #2a0050 100%); }
        50% { background: linear-gradient(135deg, #1a0030 0%, #2a0050 50%, #3a0070 100%); }
      }
      @keyframes chestFloat {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
      }
      @keyframes chestGlow {
        0%, 100% { 
          text-shadow: 
            0 0 40px #FFD700,
            0 0 80px #ff00ff,
            5px 5px 0 #000;
        }
        50% { 
          text-shadow: 
            0 0 60px #FFD700,
            0 0 120px #ff00ff,
            5px 5px 0 #000;
        }
      }
      @keyframes floatParticle {
        0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.3; }
        25% { transform: translate(20px, -20px) rotate(90deg); opacity: 0.6; }
        50% { transform: translate(-20px, -40px) rotate(180deg); opacity: 0.3; }
        75% { transform: translate(-20px, 20px) rotate(270deg); opacity: 0.6; }
      }
    `;
    document.head.appendChild(style);
    
    // Particles background (réduit à 20 pour mobile)
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 8 : 14;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.textContent = ['💎', '✨', '🏴‍☠️', '👂', '🔥', '💰'][Math.floor(Math.random() * 6)];
      particle.style.cssText = `
        position: absolute;
        font-size: ${20 + Math.random() * 30}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${0.2 + Math.random() * 0.3};
        animation: floatParticle ${3 + Math.random() * 4}s ease-in-out infinite;
        animation-delay: ${Math.random() * 2}s;
        pointer-events: none;
      `;
      overlay.appendChild(particle);
    }
    
    // TITRE ULTRA DEGEN
    const title = document.createElement('div');
    title.innerHTML = '🏴‍☠️ HEARING CHEST 🏴‍☠️';
    title.style.cssText = `
      font-size: clamp(40px, 8vw, 80px);
      color: #FFD700;
      font-family: 'Luckiest Guy', cursive;
      margin-bottom: 20px;
      animation: chestGlow 2s ease-in-out infinite, shake 0.5s infinite;
    `;
    overlay.appendChild(title);
    
    // Subtitle DEGEN
    const subtitle = document.createElement('div');
    subtitle.innerHTML = '👂 PICK A CHEST... IF YOU DARE! 👂';
    subtitle.style.cssText = `
      font-size: clamp(20px, 4vw, 35px);
      color: #00ffff;
      font-family: 'Luckiest Guy', cursive;
      margin-bottom: 40px;
      text-shadow: 
        0 0 20px #00ffff,
        3px 3px 0 #000;
      animation: pulse 1.5s infinite;
    `;
    overlay.appendChild(subtitle);
    
    // Chests container
    const chestsContainer = document.createElement('div');
    chestsContainer.style.cssText = `
      display: flex;
      gap: clamp(20px, 5vw, 60px);
      margin-bottom: 30px;
      flex-wrap: wrap;
      justify-content: center;
    `;
    
    // Create 3 chests avec animations
    const chests = [];
    const hasTreasureIndex = Math.floor(Math.random() * 3);
    
    for (let i = 0; i < 3; i++) {
      const chestWrapper = document.createElement('div');
      chestWrapper.className = 'hearing-chest-wrapper';
      chestWrapper.dataset.treasure = (i === hasTreasureIndex).toString();
      chestWrapper.dataset.index = i;
      
      chestWrapper.innerHTML = '📦';
      chestWrapper.style.cssText = `
        font-size: clamp(80px, 15vw, 150px);
        cursor: pointer;
        transition: all 0.3s;
        filter: drop-shadow(0 0 20px rgba(255,215,0,0.${i === hasTreasureIndex ? '6' : '2'}));
        animation: chestFloat ${2 + i * 0.5}s ease-in-out infinite;
        animation-delay: ${i * 0.3}s;
      `;
      
      chestWrapper.addEventListener('mouseenter', () => {
        chestWrapper.style.transform = 'scale(1.2) rotate(10deg)';
        chestWrapper.style.filter = 'drop-shadow(0 0 50px rgba(255,215,0,1))';
      });
      
      chestWrapper.addEventListener('mouseleave', () => {
        chestWrapper.style.transform = '';
        chestWrapper.style.filter = '';
      });
      
      chestsContainer.appendChild(chestWrapper);
      chests.push(chestWrapper);
    }
    
    overlay.appendChild(chestsContainer);
    
    // Result display
    const result = document.createElement('div');
    result.id = 'chestResult';
    result.style.cssText = `
      font-size: clamp(35px, 7vw, 70px);
      font-family: 'Luckiest Guy', cursive;
      min-height: 80px;
      text-shadow: 3px 3px 0 #000;
    `;
    overlay.appendChild(result);
    
    document.body.appendChild(overlay);
    
    // Click handler DEGEN
    let clicked = false;
    chests.forEach((chest, idx) => {
      chest.addEventListener('click', () => {
        if (clicked) return;
        clicked = true;
        
        chests.forEach(c => {
          c.style.pointerEvents = 'none';
          c.style.cursor = 'default';
        });
        
        const hasTreasure = chest.dataset.treasure === 'true';
        
        // Reveal all chests progressively
        chests.forEach((c, i) => {
          setTimeout(() => {
            const isWinner = c.dataset.treasure === 'true';
            c.innerHTML = isWinner ? '💎👂💎' : '💩';
            c.style.animation = 'shake 0.3s';
            c.style.filter = isWinner
              ? 'drop-shadow(0 0 60px rgba(255,215,0,1))'
              : 'drop-shadow(0 0 20px rgba(139,69,19,0.5))';
          }, i * 300);
        });
        
        setTimeout(() => {
          if (hasTreasure) {
            const prize = 500 + Math.floor(Math.random() * 1000);
            
            result.innerHTML = `<span style="color: #00ff00; animation: jackpotShake 0.3s infinite;">🎉 TREASURE! +${prize} PTS! 🎉</span>`;
            
            game.score += prize;
            if (game.updateUI) game.updateUI();
            
            // Explosion de confettis (réduit sur mobile)
            const confettiCount = isMobile ? 50 : 80;
            for (let i = 0; i < confettiCount; i++) {
              setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.textContent = ['💎', '💰', '✨', '🏴‍☠️', '👂', '🔥', '⭐'][Math.floor(Math.random() * 7)];
                confetti.style.cssText = `
                  position: fixed;
                  left: ${Math.random() * 100}%;
                  top: -50px;
                  font-size: ${30 + Math.random() * 40}px;
                  z-index: 100010;
                  pointer-events: none;
                  animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
                `;
                overlay.appendChild(confetti);
                setTimeout(() => confetti.remove(), 4000);
              }, i * 25);
            }
            
            // Victory sound
            if (typeof SoundSystem !== 'undefined') {
              SoundSystem.jackpot();
            }
          } else {
            result.innerHTML = `<span style="color: #ff0000; animation: glitch 0.3s infinite;">💀 NOTHING! TRY AGAIN! 💀</span>`;
            
            if (typeof SoundSystem !== 'undefined') {
              SoundSystem.miss();
            }
          }
          
          // Close after delay
          setTimeout(() => {
            overlay.style.transition = 'opacity 0.5s';
            overlay.style.opacity = '0';
            
            setTimeout(() => {
              overlay.remove();
              style.remove();
              window.gamePaused = false;
              
              if (window.startSpawning) {
                setTimeout(() => window.startSpawning(), 100);
              }
            }, 500);
          }, 3000);
        }, 1000);
      });
    });
  },
  
  // 🚀 HEARING TRADER GAME 🚀
  showMiniTrader(game) {
    window.gamePaused = true;
    
    // 🔊 TTS
    this.speak("Hearing Trader! Buy low, sell high, or short the market!");
    
    // 🐛 FIX: Clear ALL active ears to prevent deaths during mini-game
    document.querySelectorAll('.ear').forEach(ear => {
      ear.classList.remove('active', 'cabal', 'echo', 'power-up');
      ear.textContent = '';
    });
    if (typeof window.activeEarsCount !== 'undefined') {
      window.activeEarsCount = 0;
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'traderOverlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: linear-gradient(135deg, rgba(0, 20, 0, 0.98), rgba(0, 0, 20, 0.98));
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      animation: fadeIn 0.3s;
    `;
    
    // Generate random price data
    const generatePriceData = () => {
      const data = [];
      let price = 100 + Math.random() * 50;
      for (let i = 0; i < 20; i++) {
        price += (Math.random() - 0.5) * 15;
        price = Math.max(20, Math.min(200, price));
        data.push(price);
      }
      return data;
    };
    
    const priceHistory = generatePriceData();
    const currentPrice = priceHistory[priceHistory.length - 1];
    let playerPosition = null; // 'long' or 'short' or null
    let entryPrice = 0;
    let timeLeft = 10;
    let gameEnded = false;
    
    // Determine if price will go up or down (slightly biased based on trend)
    const trend = priceHistory[priceHistory.length - 1] - priceHistory[priceHistory.length - 5];
    const willPump = Math.random() < (trend > 0 ? 0.55 : 0.45);
    const finalPrice = willPump 
      ? currentPrice * (1 + 0.1 + Math.random() * 0.3)
      : currentPrice * (1 - 0.1 - Math.random() * 0.3);
    
    overlay.innerHTML = `
      <div style="
        font-size: clamp(40px, 7vw, 70px); 
        color: #00ff00; 
        font-family: 'Luckiest Guy', cursive; 
        margin-bottom: 20px;
        text-shadow: 0 0 30px #00ff00, 0 0 60px #00ff00;
        animation: glitch 0.5s infinite;
      ">📈 HEARING TRADER 📉</div>
      
      <div style="
        font-size: clamp(18px, 3.5vw, 28px); 
        color: #FFD700; 
        margin-bottom: 10px;
        font-family: 'Luckiest Guy', cursive;
      ">$HEARING / USDT</div>
      
      <div style="
        font-size: clamp(14px, 2.5vw, 20px); 
        color: #00ffff; 
        margin-bottom: 20px;
        font-family: 'Luckiest Guy', cursive;
        text-shadow: 0 0 10px #00ffff;
        text-align: center;
        max-width: 90%;
        line-height: 1.4;
      ">🚀 LONG = BET PRICE GOES UP<br>📉 SHORT = BET PRICE GOES DOWN<br>⏰ CHOOSE BEFORE TIME RUNS OUT!</div>
      
      <div id="priceChart" style="
        width: clamp(280px, 80vw, 500px);
        height: 150px;
        background: rgba(0, 0, 0, 0.8);
        border: 3px solid #00ff00;
        border-radius: 10px;
        margin: 15px 0;
        position: relative;
        overflow: hidden;
      "></div>
      
      <div id="currentPriceDisplay" style="
        font-size: clamp(35px, 6vw, 55px);
        color: #00ff00;
        font-family: 'Luckiest Guy', cursive;
        text-shadow: 0 0 20px #00ff00;
        margin: 10px 0;
      ">$${currentPrice.toFixed(2)}</div>
      
      <div id="positionDisplay" style="
        font-size: 25px;
        color: #fff;
        font-family: 'Luckiest Guy', cursive;
        margin: 10px 0;
        min-height: 35px;
      "></div>
      
      <div id="timerDisplay" style="
        font-size: 30px;
        color: #ff0000;
        font-family: 'Luckiest Guy', cursive;
        margin: 15px 0;
      ">⏰ ${timeLeft}s</div>
      
      <div id="traderButtons" style="display: flex; gap: 20px; margin-top: 10px;">
        <button id="longBtn" style="
          font-size: clamp(22px, 4vw, 35px);
          padding: 15px 40px;
          background: linear-gradient(145deg, #00ff00, #00aa00);
          color: #000;
          border: 4px solid #fff;
          border-radius: 15px;
          cursor: pointer;
          font-family: 'Luckiest Guy', cursive;
          box-shadow: 0 5px 30px rgba(0,255,0,0.5);
          transition: all 0.2s;
        ">🚀 LONG</button>
        
        <button id="shortBtn" style="
          font-size: clamp(22px, 4vw, 35px);
          padding: 15px 40px;
          background: linear-gradient(145deg, #ff0000, #aa0000);
          color: #fff;
          border: 4px solid #fff;
          border-radius: 15px;
          cursor: pointer;
          font-family: 'Luckiest Guy', cursive;
          box-shadow: 0 5px 30px rgba(255,0,0,0.5);
          transition: all 0.2s;
        ">📉 SHORT</button>
      </div>
      
      <div id="traderResult" style="
        font-size: 45px;
        margin-top: 30px;
        font-family: 'Luckiest Guy', cursive;
        min-height: 60px;
      "></div>
    `;
    
    document.body.appendChild(overlay);
    
    // Draw the chart
    const chartEl = document.getElementById('priceChart');
    const minPrice = Math.min(...priceHistory) * 0.9;
    const maxPrice = Math.max(...priceHistory) * 1.1;
    const range = maxPrice - minPrice;
    
    let chartHTML = '<svg width="100%" height="100%" viewBox="0 0 500 150">';
    chartHTML += '<polyline fill="none" stroke="#00ff00" stroke-width="3" points="';
    priceHistory.forEach((price, i) => {
      const x = (i / (priceHistory.length - 1)) * 480 + 10;
      const y = 140 - ((price - minPrice) / range) * 130;
      chartHTML += `${x},${y} `;
    });
    chartHTML += '"/>';
    
    // Add candles effect
    for (let i = 1; i < priceHistory.length; i++) {
      const x = (i / (priceHistory.length - 1)) * 480 + 10;
      const isGreen = priceHistory[i] >= priceHistory[i-1];
      chartHTML += `<circle cx="${x}" cy="${140 - ((priceHistory[i] - minPrice) / range) * 130}" r="4" fill="${isGreen ? '#00ff00' : '#ff0000'}"/>`;
    }
    
    chartHTML += '</svg>';
    chartEl.innerHTML = chartHTML;
    
    // Button handlers
    const longBtn = document.getElementById('longBtn');
    const shortBtn = document.getElementById('shortBtn');
    const positionDisplay = document.getElementById('positionDisplay');
    const buttonsDiv = document.getElementById('traderButtons');
    
    const makePosition = (position) => {
      if (gameEnded) return;
      playerPosition = position;
      entryPrice = currentPrice;
      
      longBtn.style.opacity = position === 'long' ? '1' : '0.3';
      shortBtn.style.opacity = position === 'short' ? '1' : '0.3';
      longBtn.disabled = true;
      shortBtn.disabled = true;
      
      positionDisplay.innerHTML = position === 'long' 
        ? `<span style="color: #00ff00;">📈 LONG @ $${entryPrice.toFixed(2)}</span>`
        : `<span style="color: #ff0000;">📉 SHORT @ $${entryPrice.toFixed(2)}</span>`;
    };
    
    longBtn.onclick = () => makePosition('long');
    shortBtn.onclick = () => makePosition('short');
    
    // Timer countdown
    const timerDisplay = document.getElementById('timerDisplay');
    const timerInterval = setInterval(() => {
      timeLeft--;
      timerDisplay.textContent = `⏰ ${timeLeft}s`;
      
      if (timeLeft <= 3) {
        timerDisplay.style.animation = 'pulse 0.3s infinite';
      }
      
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        endTraderGame();
      }
    }, 1000);
    
    const endTraderGame = () => {
      if (gameEnded) return;
      gameEnded = true;
      
      buttonsDiv.style.display = 'none';
      
      // Animate price change
      const priceDisplay = document.getElementById('currentPriceDisplay');
      const resultDisplay = document.getElementById('traderResult');
      
      let animPrice = currentPrice;
      const priceStep = (finalPrice - currentPrice) / 20;
      
      const animInterval = setInterval(() => {
        animPrice += priceStep;
        
        if ((priceStep > 0 && animPrice >= finalPrice) || (priceStep < 0 && animPrice <= finalPrice)) {
          animPrice = finalPrice;
          clearInterval(animInterval);
          
          // Calculate result
          const priceDiff = finalPrice - currentPrice;
          const percentChange = ((finalPrice - currentPrice) / currentPrice * 100).toFixed(1);
          
          let won = false;
          let points = 0;
          
          if (playerPosition === 'long' && priceDiff > 0) {
            won = true;
            points = Math.floor(1000 * (priceDiff / currentPrice));
          } else if (playerPosition === 'short' && priceDiff < 0) {
            won = true;
            points = Math.floor(1000 * Math.abs(priceDiff / currentPrice));
          } else if (playerPosition === null) {
            // No position = small penalty
            points = -200;
          } else {
            // Wrong position
            points = -Math.floor(500 * Math.abs(priceDiff / currentPrice));
          }
          
          points = Math.max(-1000, Math.min(3000, points)); // Cap rewards/losses
          
          if (won) {
            resultDisplay.innerHTML = `<span style="color: #00ff00;">🚀 PROFIT! +${points} PTS 🚀</span>`;
            game.score += points;
            
            // Celebration
            for (let i = 0; i < 15; i++) {
              setTimeout(() => {
                const emoji = document.createElement('div');
                emoji.textContent = ['💰', '🤑', '💎', '🚀', '📈'][Math.floor(Math.random() * 5)];
                emoji.style.cssText = `
                  position: fixed;
                  left: ${Math.random() * 100}%;
                  top: ${Math.random() * 100}%;
                  font-size: 50px;
                  z-index: 100000;
                  pointer-events: none;
                  animation: fadeOut 1s;
                `;
                document.body.appendChild(emoji);
                setTimeout(() => emoji.remove(), 1000);
              }, i * 50);
            }
          } else if (points < 0) {
            resultDisplay.innerHTML = `<span style="color: #ff0000;">📉 REKT! ${points} PTS 📉</span>`;
            game.score = Math.max(0, game.score + points);
          } else {
            resultDisplay.innerHTML = `<span style="color: #FFD700;">😐 NO POSITION</span>`;
          }
          
          priceDisplay.innerHTML = `$${finalPrice.toFixed(2)} <span style="color: ${priceDiff > 0 ? '#00ff00' : '#ff0000'};">(${priceDiff > 0 ? '+' : ''}${percentChange}%)</span>`;
          priceDisplay.style.color = priceDiff > 0 ? '#00ff00' : '#ff0000';
          
          game.updateUI();
          
          setTimeout(() => {
            overlay.remove();
            window.gamePaused = false;
            
            if (window.startSpawning) {
              setTimeout(() => window.startSpawning(), 100);
            }
          }, 3500);
        }
        
        priceDisplay.textContent = `$${animPrice.toFixed(2)}`;
        priceDisplay.style.color = animPrice > currentPrice ? '#00ff00' : '#ff0000';
      }, 100);
    };
  },

  // ==================== HEARING HUSTLE - SHELL GAME ULTRA DEGEN ====================
  showBonneteau(game) {
    window.gamePaused = true;
    if (typeof window.setPaused === 'function') window.setPaused(true);
    
    // 🐛 FIX: Clear ALL active ears to prevent deaths during mini-game
    document.querySelectorAll('.ear').forEach(ear => {
      ear.classList.remove('active', 'cabal', 'echo', 'power-up');
      ear.textContent = '';
    });
    if (typeof window.activeEarsCount !== 'undefined') {
      window.activeEarsCount = 0;
    }
    
    // 🔊 TEXT-TO-SPEECH FEATURE
    const speak = (text) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.2; // Slightly faster
        utterance.pitch = 1.1; // Slightly higher pitch
        utterance.volume = 1.0; // +20% (was 0.8)
        window.speechSynthesis.speak(utterance);
      }
    };
    
    // Speak at game start
    speak("Find the ear! Watch carefully!");
    
    // Audio context for sounds
    let audioCtx = null;
    const initAudio = () => {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      return audioCtx;
    };
    
    // FOMO comments that appear randomly
    const fomoComments = [
      "🚨 LAST CHANCE TO WIN BIG 🚨",
      "💎 DIAMOND HANDS ONLY 💎",
      "🔥 NGMI IF U MISS THIS 🔥",
      "⚠️ DONT BE A PAPER HAND ⚠️",
      "🚀 GENERATIONAL WEALTH INCOMING 🚀",
      "😱 UR WIFE'S BF IS WATCHING 😱",
      "💀 ONE SHOT ONE KILL 💀",
      "🤑 EASY MONEY SER 🤑",
      "👀 THE EAR KNOWS ALL 👀",
      "🎯 TRUST THE PROCESS 🎯",
      "⏰ TIME IS RUNNING OUT ⏰",
      "🧠 BIG BRAIN PLAY INCOMING 🧠",
      "💸 MONEY PRINTER GO BRRR 💸",
      "🦍 APE TOGETHER STRONG 🦍",
      "📈 NUMBER GO UP 📈"
    ];
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'bonneteauOverlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: radial-gradient(ellipse at center, rgba(20,0,40,0.98) 0%, rgba(0,0,0,0.99) 100%);
      z-index: 100005;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    `;
    
    // Glitch overlay
    const glitchOverlay = document.createElement('div');
    glitchOverlay.id = 'bonneteauGlitch';
    glitchOverlay.style.cssText = `
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 100010;
    `;
    overlay.appendChild(glitchOverlay);
    
    // Title
    const title = document.createElement('div');
    title.innerHTML = '🥤 HEARING HUSTLE 🥤';
    title.style.cssText = `
      font-family: 'Luckiest Guy', cursive;
      font-size: clamp(35px, 8vw, 60px);
      color: #FFD700;
      text-shadow: 
        0 0 30px #FFD700,
        0 0 60px #ff00ff,
        4px 4px 0 #000,
        -3px 0 #ff00ff,
        3px 0 #00ffff;
      margin-bottom: 10px;
      animation: glitchText 0.3s infinite, palpitate 0.5s infinite;
      letter-spacing: 3px;
    `;
    overlay.appendChild(title);
    
    // Subtitle
    const subtitle = document.createElement('div');
    subtitle.innerHTML = '👂 FIND THE EAR OR STAY POOR 👂';
    subtitle.style.cssText = `
      font-family: 'Luckiest Guy', cursive;
      font-size: 22px;
      color: #00ffff;
      text-shadow: 0 0 20px #00ffff;
      margin-bottom: 30px;
      animation: rainbow 2s infinite;
    `;
    overlay.appendChild(subtitle);
    
    // FOMO comment display
    const fomoDisplay = document.createElement('div');
    fomoDisplay.style.cssText = `
      font-family: 'Luckiest Guy', cursive;
      font-size: 24px;
      color: #ff00ff;
      text-shadow: 0 0 20px #ff00ff, 2px 2px 0 #000;
      margin-bottom: 20px;
      min-height: 40px;
      animation: palpitate 0.3s infinite;
    `;
    fomoDisplay.textContent = fomoComments[Math.floor(Math.random() * fomoComments.length)];
    overlay.appendChild(fomoDisplay);
    
    // Cups container
    const cupsContainer = document.createElement('div');
    cupsContainer.style.cssText = `
      display: flex;
      gap: 30px;
      margin: 30px 0;
      perspective: 1000px;
    `;
    
    // Create 3 cups
    const cups = [];
    const earPosition = Math.floor(Math.random() * 3);
    
    for (let i = 0; i < 3; i++) {
      const cupWrapper = document.createElement('div');
      cupWrapper.style.cssText = `
        position: relative;
        width: 120px;
        height: 150px;
        cursor: pointer;
        transition: transform 0.3s;
      `;
      
      const cup = document.createElement('div');
      cup.className = 'bonneteau-cup';
      cup.dataset.index = i;
      cup.innerHTML = '🥤';
      cup.style.cssText = `
        font-size: 100px;
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));
        z-index: 2;
      `;
      
      const ear = document.createElement('div');
      ear.innerHTML = i === earPosition ? '👂' : '';
      ear.style.cssText = `
        font-size: 60px;
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        opacity: 0;
        transition: opacity 0.3s;
        z-index: 1;
      `;
      
      cupWrapper.appendChild(ear);
      cupWrapper.appendChild(cup);
      cups.push({ wrapper: cupWrapper, cup, ear, hasEar: i === earPosition });
      cupsContainer.appendChild(cupWrapper);
    }
    
    overlay.appendChild(cupsContainer);
    
    // Instructions
    const instructions = document.createElement('div');
    instructions.innerHTML = '👆 WATCH THE CUPS... THEN CLICK! 👆';
    instructions.style.cssText = `
      font-family: 'Luckiest Guy', cursive;
      font-size: 20px;
      color: #fff;
      margin-top: 20px;
      animation: pulse 1s infinite;
    `;
    overlay.appendChild(instructions);
    
    // Result display (hidden initially)
    const resultDisplay = document.createElement('div');
    resultDisplay.style.cssText = `
      font-family: 'Luckiest Guy', cursive;
      font-size: 40px;
      margin-top: 30px;
      min-height: 60px;
      text-shadow: 0 0 30px currentColor, 3px 3px 0 #000;
    `;
    overlay.appendChild(resultDisplay);
    
    document.body.appendChild(overlay);
    
    // Add styles
    const style = document.createElement('style');
    style.id = 'bonneteauStyles';
    style.textContent = `
      @keyframes palpitate {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
      @keyframes glitchText {
        0%, 100% { transform: translate(0); }
        20% { transform: translate(-3px, 3px); }
        40% { transform: translate(3px, -3px); }
        60% { transform: translate(-3px, -3px); }
        80% { transform: translate(3px, 3px); }
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
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      @keyframes cupHover {
        0%, 100% { transform: translateX(-50%) translateY(0); }
        50% { transform: translateX(-50%) translateY(-10px); }
      }
      @keyframes lsdTrip {
        0% { filter: hue-rotate(0deg) saturate(1) brightness(1); }
        25% { filter: hue-rotate(90deg) saturate(2) brightness(1.2); }
        50% { filter: hue-rotate(180deg) saturate(3) brightness(1.5); }
        75% { filter: hue-rotate(270deg) saturate(2) brightness(1.2); }
        100% { filter: hue-rotate(360deg) saturate(1) brightness(1); }
      }
      @keyframes confettiFall {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
      @keyframes screenShake {
        0%, 100% { transform: translate(0); }
        25% { transform: translate(-10px, 10px); }
        50% { transform: translate(10px, -10px); }
        75% { transform: translate(-10px, -10px); }
      }
      .bonneteau-cup:hover {
        animation: cupHover 0.3s ease-in-out;
      }
    `;
    document.head.appendChild(style);
    
    // Sound effects
    const playShuffleSound = () => {
      try {
        const ctx = initAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.1);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      } catch(e) {}
    };
    
    const playWinSound = () => {
      try {
        const ctx = initAudio();
        [523, 659, 784, 1047].forEach((freq, i) => {
          setTimeout(() => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = freq;
            osc.type = 'triangle';
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.2);
          }, i * 100);
        });
      } catch(e) {}
    };
    
    const playLoseSound = () => {
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
    };
    
    // Glitch effect
    let glitchInterval;
    const startGlitch = () => {
      glitchInterval = setInterval(() => {
        glitchOverlay.innerHTML = '';
        for (let i = 0; i < 3; i++) {
          const bar = document.createElement('div');
          bar.style.cssText = `
            position: absolute;
            left: 0;
            right: 0;
            top: ${Math.random() * 100}%;
            height: ${2 + Math.random() * 8}px;
            background: ${Math.random() > 0.5 ? '#ff00ff' : '#00ffff'};
            opacity: ${0.3 + Math.random() * 0.4};
            transform: translateX(${(Math.random() - 0.5) * 30}px);
          `;
          glitchOverlay.appendChild(bar);
        }
      }, 100);
    };
    
    const stopGlitch = () => {
      if (glitchInterval) clearInterval(glitchInterval);
      glitchOverlay.innerHTML = '';
    };
    
    // FOMO comments interval
    const fomoInterval = setInterval(() => {
      fomoDisplay.textContent = fomoComments[Math.floor(Math.random() * fomoComments.length)];
    }, 1500);
    
    // Show ear briefly at start
    const showPhase = () => {
      title.innerHTML = '👀 LOOK CLOSELY... 👀';
      cups.forEach(c => {
        c.cup.style.transform = 'translateX(-50%) translateY(-60px)';
        c.ear.style.opacity = '1';
      });
      
      setTimeout(() => {
        cups.forEach(c => {
          c.cup.style.transform = 'translateX(-50%) translateY(0)';
          c.ear.style.opacity = '0';
        });
        setTimeout(shufflePhase, 800);
      }, 2000);
    };
    
    // Shuffle phase
    const shufflePhase = () => {
      title.innerHTML = '🌀 SHUFFLING... 🌀';
      speak("Watch carefully! The cups are shuffling!");
      startGlitch();
      
      let shuffles = 0;
      const maxShuffles = 8 + Math.floor(Math.random() * 5);
      
      const doShuffle = () => {
        if (shuffles >= maxShuffles) {
          stopGlitch();
          guessPhase();
          return;
        }
        
        playShuffleSound();
        
        // Swap two random cups visually
        const idx1 = Math.floor(Math.random() * 3);
        let idx2 = Math.floor(Math.random() * 3);
        while (idx2 === idx1) idx2 = Math.floor(Math.random() * 3);
        
        const cup1 = cups[idx1].wrapper;
        const cup2 = cups[idx2].wrapper;
        
        const rect1 = cup1.getBoundingClientRect();
        const rect2 = cup2.getBoundingClientRect();
        const diff = rect2.left - rect1.left;
        
        cup1.style.transform = `translateX(${diff}px)`;
        cup2.style.transform = `translateX(${-diff}px)`;
        
        setTimeout(() => {
          cup1.style.transform = '';
          cup2.style.transform = '';
          
          // Actually swap in DOM
          const parent = cupsContainer;
          const children = Array.from(parent.children);
          const pos1 = children.indexOf(cup1);
          const pos2 = children.indexOf(cup2);
          
          if (pos1 < pos2) {
            parent.insertBefore(cup2, cup1);
            parent.insertBefore(cup1, children[pos2 + 1] || null);
          } else {
            parent.insertBefore(cup1, cup2);
            parent.insertBefore(cup2, children[pos1 + 1] || null);
          }
          
          // Swap in cups array
          [cups[idx1], cups[idx2]] = [cups[idx2], cups[idx1]];
          
          shuffles++;
          setTimeout(doShuffle, 300 + Math.random() * 200);
        }, 250);
      };
      
      setTimeout(doShuffle, 500);
    };
    
    // Guess phase
    const guessPhase = () => {
      title.innerHTML = '🎯 PICK ONE! 🎯';
      speak("Now! Pick the cup with the ear!");
      instructions.innerHTML = '⏰ HURRY UP DEGEN! ⏰';
      instructions.style.color = '#ff0000';
      instructions.style.animation = 'palpitate 0.2s infinite';
      
      cups.forEach((cupData, index) => {
        cupData.wrapper.onclick = () => handleGuess(cupData, index);
        cupData.wrapper.style.cursor = 'pointer';
      });
    };
    
    // Handle guess
    const handleGuess = (cupData, index) => {
      clearInterval(fomoInterval);
      cups.forEach(c => {
        c.wrapper.onclick = null;
        c.wrapper.style.cursor = 'default';
      });
      
      // Lift all cups to reveal
      cups.forEach(c => {
        c.cup.style.transform = 'translateX(-50%) translateY(-80px)';
        c.ear.style.opacity = '1';
      });
      
      setTimeout(() => {
        if (cupData.hasEar) {
          // WIN!
          const winAmount = 200 + Math.floor(Math.random() * 300);
          
          speak("You won! Nice job!");
          playWinSound();
          
          resultDisplay.innerHTML = `🎉 WINNER WINNER! +${winAmount} 🎉`;
          resultDisplay.style.color = '#00ff00';
          
          // LSD effect
          overlay.style.animation = 'lsdTrip 2s infinite';
          
          // Confetti
          const _mp = window.innerWidth<768?8:14; for (let i = 0; i < _mp; i++) {
            setTimeout(() => {
              const confetti = document.createElement('div');
              confetti.textContent = ['💰', '👂', '🎉', '✨', '🚀', '💎'][Math.floor(Math.random() * 6)];
              confetti.style.cssText = `
                position: fixed;
                left: ${Math.random() * 100}%;
                top: -50px;
                font-size: ${30 + Math.random() * 40}px;
                pointer-events: none;
                z-index: 100015;
                animation: confettiFall ${2 + Math.random() * 2}s ease-out forwards;
              `;
              overlay.appendChild(confetti);
              setTimeout(() => confetti.remove(), 4000);
            }, i * 30);
          }
          
          // Add score
          if (game.addScore) {
            game.addScore(winAmount);
          } else if (typeof game.score !== 'undefined') {
            game.score += winAmount;
            if (game.updateUI) game.updateUI();
          }
          
          // Victory message
          title.innerHTML = '🧠 BIG BRAIN PLAY! 🧠';
          title.style.animation = 'lsdTrip 1s infinite, palpitate 0.3s infinite';
          
          subtitle.innerHTML = '👂 THE EAR CHOSE YOU! 👂';
          
        } else {
          // LOSE
          speak("You lost! Try again next time!");
          playLoseSound();
          
          resultDisplay.innerHTML = '💀 REKT! NGMI! 💀';
          resultDisplay.style.color = '#ff0000';
          
          // Screen shake
          overlay.style.animation = 'screenShake 0.5s';
          
          title.innerHTML = '😭 SMOOTH BRAIN DETECTED 😭';
          subtitle.innerHTML = '💸 SHOULD HAVE FOLLOWED THE EAR 💸';
        }
        
        // Close after delay
        setTimeout(() => {
          overlay.style.transition = 'opacity 0.5s';
          overlay.style.opacity = '0';
          
          setTimeout(() => {
            overlay.remove();
            const styleEl = document.getElementById('bonneteauStyles');
            if (styleEl) styleEl.remove();
            
            // 🔥 FIX ULTRA-BANGER: Redémarrage FORCÉ et garanti
            console.log('🎪 Bonneteau closing...');
            
            // Étape 1: Force unpause MULTIPLE fois (paranoïa mode)
            window.gamePaused = false;
            window.isPaused = false;
            
            if (typeof window.setPaused === 'function') {
              window.setPaused(false);
            }
            
            // Étape 2: Clear activeEarsCount au cas où
            if (typeof window.activeEarsCount !== 'undefined') {
              window.activeEarsCount = 0;
            }
            
            // Étape 3: Attendre propagation + restart GARANTI
            setTimeout(() => {
              // Triple-check unpause
              window.gamePaused = false;
              window.isPaused = false;
              
              // Restart spawning
              if (typeof window.startSpawning === 'function') {
                window.startSpawning();
                console.log('✅ Bonneteau ended - Game resumed via startSpawning');
              } else if (typeof window.spawnEar === 'function') {
                // Fallback: spawn immédiatement + restart interval
                window.spawnEar();
                
                if (typeof window.getSpawnInterval === 'function') {
                  if (window.gameInterval) clearInterval(window.gameInterval);
                  window.gameInterval = setInterval(window.spawnEar, window.getSpawnInterval());
                  console.log('✅ Bonneteau ended - Game resumed via fallback');
                }
              }
              
              // Force spawn une ear immédiatement (emergency)
              setTimeout(() => {
                if (typeof window.activeEarsCount !== 'undefined' && window.activeEarsCount === 0) {
                  if (typeof window.spawnEar === 'function') {
                    console.log('🚨 Emergency spawn after Bonneteau');
                    window.spawnEar();
                  }
                }
              }, 500);
              
            }, 250);
          }, 500);
        }, 3500);
      }, 500);
    };
    
    // Start the game
    setTimeout(showPhase, 1000);
  },

  // ==================== HEARINKO - THE DEGEN PACHINKO ====================
  showPachinko(game) {
    window.gamePaused = true;
    if (typeof window.setPaused === 'function') window.setPaused(true);
    
    // 🔊 TTS
    this.speak("Hearinko time! Drop your balls and pray for that jackpot!");
    
    // 🐛 FIX: Clear ALL active ears to prevent deaths during mini-game
    document.querySelectorAll('.ear').forEach(ear => {
      ear.classList.remove('active', 'cabal', 'echo', 'power-up');
      ear.textContent = '';
    });
    if (typeof window.activeEarsCount !== 'undefined') {
      window.activeEarsCount = 0;
    }
    
    let currentScore = game.score || (typeof window.score !== 'undefined' ? window.score : 1000);
    const BALL_COST = 50;
    let pumpUsed = false; // Track if PUMP was used
    
    // Audio context for bounce sounds
    let audioCtx = null;
    const initAudio = () => {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      return audioCtx;
    };
    
    // Bounce sound - varies with speed
    const playBounce = (speed) => {
      try {
        const ctx = initAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 400 + Math.min(speed * 100, 800);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.06);
      } catch(e) {}
    };
    
    // Win sound
    const playWin = (big) => {
      try {
        const ctx = initAudio();
        const notes = big ? [523, 659, 784, 1047] : [400, 500];
        notes.forEach((f, i) => {
          setTimeout(() => {
            const o = ctx.createOscillator();
            const g = ctx.createGain();
            o.connect(g); g.connect(ctx.destination);
            o.frequency.value = f;
            o.type = 'triangle';
            g.gain.setValueAtTime(0.2, ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            o.start(); o.stop(ctx.currentTime + 0.15);
          }, i * 80);
        });
      } catch(e) {}
    };
    
    // 🎈 HEARINKO SLOTS - Réduit à 9 slots essentiels (lisibles sur mobile)
    const baseSlots = [
      { mult: 0,    label: '💀',    color: '#ff0000', width: 8  },  // LOSE ALL
      { mult: 0.5,  label: '.5x',   color: '#ff4400', width: 10 },  // Mauvais
      { mult: 1,    label: '1x',    color: '#ff8800', width: 12 },  // Neutre
      { mult: 2,    label: '2x',    color: '#ffcc00', width: 14 },  // Bon
      { mult: 10,   label: '👂10x', color: '#00ff88', width: 8  },  // JACKPOT
      { mult: 2,    label: '2x',    color: '#ffcc00', width: 14 },  // Bon
      { mult: 1,    label: '1x',    color: '#ff8800', width: 12 },  // Neutre
      { mult: 0.5,  label: '.5x',   color: '#ff4400', width: 10 },  // Mauvais
      { mult: 0,    label: '💀',    color: '#ff0000', width: 8  },  // LOSE ALL
    ];
    
    // 🎲 SHUFFLE pour ordre aléatoire à chaque partie
    const shuffleArray = (array) => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };
    
    const slots = shuffleArray(baseSlots);
    
    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'pachinkoOverlay';
    overlay.style.cssText = `
      position: fixed; inset: 0;
      background: linear-gradient(180deg, #0a0015, #1a0030, #0a0015);
      z-index: 100005;
      display: flex; flex-direction: column; align-items: center;
      padding: 8px; overflow: hidden;
      font-family: 'Luckiest Guy', cursive;
    `;
    
    // Title - HEARINKO
    const title = document.createElement('div');
    title.innerHTML = '👂 HEARINKO 👂';
    title.style.cssText = `
      font-size: clamp(32px, 8vw, 60px);
      color: #FFD700;
      text-shadow: 0 0 30px #FFD700, 0 0 60px #ff00ff, 4px 4px 0 #000;
      margin-bottom: 8px;
      animation: hearinkoGlow 0.5s infinite alternate;
    `;
    overlay.appendChild(title);
    
    // Add glow animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes hearinkoGlow {
        0% { text-shadow: 0 0 30px #FFD700, 0 0 60px #ff00ff, 4px 4px 0 #000; }
        100% { text-shadow: 0 0 50px #FFD700, 0 0 100px #00ffff, 4px 4px 0 #000; }
      }
    `;
    document.head.appendChild(style);
    
    // Score
    const scoreDisplay = document.createElement('div');
    scoreDisplay.style.cssText = `font-size: clamp(20px, 5vw, 32px); color: #00ff00; margin-bottom: 8px; text-shadow: 0 0 15px #00ff00;`;
    scoreDisplay.innerHTML = `💰 ${currentScore} PTS`;
    overlay.appendChild(scoreDisplay);
    
    // Ball selector
    const ballSelector = document.createElement('div');
    ballSelector.style.cssText = `display: flex; gap: 12px; margin-bottom: 10px;`;
    
    const ballOptions = [1, 3, 5, 10];
    let selectedBalls = 1;
    
    ballOptions.forEach(num => {
      const btn = document.createElement('button');
      btn.className = 'ball-opt';
      btn.dataset.balls = num;
      btn.innerHTML = `${num}👂`;
      btn.style.cssText = `
        font-family: inherit; font-size: clamp(18px, 4vw, 24px);
        padding: 12px 20px;
        background: ${num === 1 ? '#FFD700' : '#333'};
        color: ${num === 1 ? '#000' : '#fff'};
        border: 3px solid #FFD700;
        border-radius: 12px; cursor: pointer;
        transition: transform 0.2s;
      `;
      btn.onclick = () => {
        selectedBalls = num;
        document.querySelectorAll('.ball-opt').forEach(b => {
          const sel = parseInt(b.dataset.balls) === num;
          b.style.background = sel ? '#FFD700' : '#333';
          b.style.color = sel ? '#000' : '#fff';
        });
        updateBtn();
      };
      ballSelector.appendChild(btn);
    });
    overlay.appendChild(ballSelector);
    
    // Board - FULL SCREEN LIKE GAME OVER
    const boardContainer = document.createElement('div');
    boardContainer.style.cssText = `
      position: relative;
      width: min(95vw, 700px);
      height: min(70vh, 600px);
      background: rgba(0,0,0,0.95);
      border: 5px solid #FFD700;
      border-radius: 20px 20px 0 0;
      overflow: hidden;
      box-shadow: 0 0 80px rgba(255,215,0,0.5), inset 0 0 50px rgba(255,0,255,0.1);
    `;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.style.cssText = `width: 100%; height: 100%;`;
    boardContainer.appendChild(canvas);
    overlay.appendChild(boardContainer);
    
    // Slots
    const slotsContainer = document.createElement('div');
    slotsContainer.style.cssText = `
      display: flex;
      width: min(95vw, 700px);
      background: #111;
      border: 4px solid #FFD700;
      border-top: none;
      border-radius: 0 0 15px 15px;
    `;
    
    slots.forEach((slot, i) => {
      const el = document.createElement('div');
      el.className = 'pslot';
      el.dataset.idx = i;
      el.style.cssText = `
        flex: ${slot.width}; padding: 10px 2px;
        text-align: center; font-size: clamp(14px, 3vw, 20px);
        color: ${slot.color};
        border-right: 2px solid #FFD70044;
        text-shadow: 0 0 10px ${slot.color};
      `;
      el.textContent = slot.label;
      slotsContainer.appendChild(el);
    });
    overlay.appendChild(slotsContainer);
    
    // Drop button
    const dropBtn = document.createElement('button');
    dropBtn.style.cssText = `
      font-family: inherit; font-size: clamp(22px, 5vw, 32px);
      padding: 15px 50px; margin-top: 15px;
      background: linear-gradient(135deg, #ff00ff, #00ffff);
      color: #fff; border: 4px solid #FFD700;
      border-radius: 15px; cursor: pointer;
      text-shadow: 2px 2px 0 #000;
      box-shadow: 0 0 30px rgba(255,0,255,0.5);
    `;
    overlay.appendChild(dropBtn);
    
    const updateBtn = () => {
      const cost = selectedBalls * BALL_COST;
      dropBtn.innerHTML = `👂 DROP ${selectedBalls} (-${cost}) 👂`;
      dropBtn.disabled = currentScore < cost;
      dropBtn.style.opacity = currentScore >= cost ? '1' : '0.5';
    };
    updateBtn();
    
    // Result
    const resultDisplay = document.createElement('div');
    resultDisplay.style.cssText = `font-size: clamp(26px, 6vw, 40px); margin-top: 15px; min-height: 50px; text-shadow: 0 0 20px currentColor;`;
    overlay.appendChild(resultDisplay);
    
    // DUMP / PUMP buttons container (hidden initially)
    const endBtnsContainer = document.createElement('div');
    endBtnsContainer.style.cssText = `
      display: none;
      gap: 25px;
      margin-top: 15px;
    `;
    
    const dumpBtn = document.createElement('button');
    dumpBtn.innerHTML = '📉 DUMP 📉';
    dumpBtn.style.cssText = `
      font-family: inherit; font-size: clamp(20px, 4vw, 28px);
      padding: 15px 40px;
      background: linear-gradient(135deg, #ff0000, #aa0000);
      color: #fff; border: 4px solid #FFD700;
      border-radius: 15px; cursor: pointer;
      text-shadow: 2px 2px 0 #000;
      box-shadow: 0 0 20px rgba(255,0,0,0.5);
    `;
    
    const pumpBtn = document.createElement('button');
    pumpBtn.innerHTML = '📈 PUMP 📈';
    pumpBtn.style.cssText = `
      font-family: inherit; font-size: clamp(20px, 4vw, 28px);
      padding: 15px 40px;
      background: linear-gradient(135deg, #00ff00, #00aa00);
      color: #000; border: 4px solid #FFD700;
      border-radius: 15px; cursor: pointer;
      text-shadow: 1px 1px 0 rgba(255,255,255,0.5);
      box-shadow: 0 0 20px rgba(0,255,0,0.5);
    `;
    
    endBtnsContainer.appendChild(dumpBtn);
    endBtnsContainer.appendChild(pumpBtn);
    overlay.appendChild(endBtnsContainer);
    
    document.body.appendChild(overlay);
    
    // 🐛 FIX MOBILE: Calculer dimensions après append
    const isMobile = window.innerWidth <= 768;
    const rect = boardContainer.getBoundingClientRect();
    
    // 🐛 FIX: Si rect invalide (0x0), utiliser dimensions par défaut
    canvas.width = rect.width > 0 ? rect.width : (isMobile ? window.innerWidth * 0.95 : 700);
    canvas.height = rect.height > 0 ? rect.height : (isMobile ? window.innerHeight * 0.6 : 600);
    
    const W = canvas.width;
    const H = canvas.height;
    
    console.log('Hearinko canvas:', W, 'x', H, 'mobile:', isMobile);
    
    // Pegs - BIGGER for large board
    const pegs = [];
    const pegR = 8;
    for (let row = 0; row < 10; row++) {
      const offset = row % 2 === 0 ? 0 : W / 11 / 2;
      const y = 40 + row * (H - 80) / 10;
      for (let col = 0; col < 11; col++) {
        const x = offset + (col + 0.5) * (W / 11);
        if (x > 20 && x < W - 20) {
          pegs.push({ x, y });
        }
      }
    }
    
    // Physics - 🐛 FIX MOBILE: Beaucoup plus rapide
    const balls = [];
    let animId = null;
    let totalWin = 0, landed = 0, toLand = 0;
    const G = isMobile ? 4.0 : 1.5;  // 🔥 Gravité 2x plus forte mobile
    const FRICTION = isMobile ? 0.97 : 0.99;  // Moins de friction mobile
    const BOUNCE = 0.6;
    const BALLR = 12;
    
    // Draw
    const draw = () => {
      ctx.fillStyle = '#0a0015';
      ctx.fillRect(0, 0, W, H);
      
      // Pegs
      ctx.fillStyle = '#FFD700';
      pegs.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, pegR, 0, 6.28);
        ctx.fill();
      });
      
      // Balls - ear emoji style
      balls.forEach(b => {
        if (b.done) return;
        // Outer glow
        ctx.beginPath();
        ctx.arc(b.x, b.y, BALLR + 5, 0, 6.28);
        ctx.fillStyle = 'rgba(255,0,255,0.4)';
        ctx.fill();
        // Ball
        ctx.beginPath();
        ctx.arc(b.x, b.y, BALLR, 0, 6.28);
        ctx.fillStyle = '#FFaa66';
        ctx.fill();
        // Highlight
        ctx.beginPath();
        ctx.arc(b.x - 3, b.y - 3, 5, 0, 6.28);
        ctx.fillStyle = '#FFD700';
        ctx.fill();
      });
      
      // Bottom slots
      const sw = W / slots.length;
      slots.forEach((s, i) => {
        ctx.fillStyle = s.color + '33';
        ctx.fillRect(i * sw, H - 4, sw, 4);
      });
    };
    
    // Physics update
    const update = () => {
      for (let i = 0; i < balls.length; i++) {
        const b = balls[i];
        if (b.done) continue;
        
        b.vy += G;
        b.x += b.vx;
        b.y += b.vy;
        
        // 🔥 Friction (surtout mobile)
        b.vx *= FRICTION;
        b.vy *= FRICTION;
        
        // Walls
        if (b.x < BALLR) { b.x = BALLR; b.vx = -b.vx * BOUNCE; playBounce(Math.abs(b.vx)); }
        if (b.x > W - BALLR) { b.x = W - BALLR; b.vx = -b.vx * BOUNCE; playBounce(Math.abs(b.vx)); }
        
        // Pegs
        for (let j = 0; j < pegs.length; j++) {
          const p = pegs[j];
          const dx = b.x - p.x, dy = b.y - p.y;
          const d2 = dx * dx + dy * dy;
          const minD = BALLR + pegR;
          if (d2 < minD * minD) {
            const d = Math.sqrt(d2);
            const nx = dx / d, ny = dy / d;
            b.x = p.x + nx * minD;
            b.y = p.y + ny * minD;
            const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
            const dot = b.vx * nx + b.vy * ny;
            b.vx = (b.vx - 2 * dot * nx) * BOUNCE + (Math.random() - 0.5) * 2;
            b.vy = (b.vy - 2 * dot * ny) * BOUNCE;
            playBounce(speed);
          }
        }
        
        // Land
        if (b.y > H - BALLR) {
          b.done = true;
          const sw = W / slots.length;
          const si = Math.min(Math.max(Math.floor(b.x / sw), 0), slots.length - 1);
          const win = Math.floor(BALL_COST * slots[si].mult);
          totalWin += win;
          landed++;
          
          // Flash slot
          const slotEl = slotsContainer.children[si];
          if (slotEl) {
            slotEl.style.background = slots[si].color;
            slotEl.style.color = '#000';
            setTimeout(() => {
              slotEl.style.background = '';
              slotEl.style.color = slots[si].color;
            }, 150);
          }
          
          if (slots[si].mult >= 3) playWin(slots[si].mult >= 10);
          
          if (landed >= toLand) finish();
        }
      }
      
      // Cleanup
      balls.forEach((b, i) => { if (b.done && b.t && Date.now() - b.t > 200) balls.splice(i, 1); });
      balls.forEach(b => { if (b.done && !b.t) b.t = Date.now(); });
    };
    
    const closeGame = () => {
      if (animId) cancelAnimationFrame(animId);
      
      // 🐛 FIX: Unpause seulement APRÈS fermeture overlay
      overlay.style.transition = 'opacity 0.5s';
      overlay.style.opacity = '0';
      
      setTimeout(() => {
        overlay.remove();
        window.gamePaused = false;
        if (typeof window.setPaused === 'function') window.setPaused(false);
        if (typeof window.startSpawning === 'function') setTimeout(() => window.startSpawning(), 100);
      }, 500); // Attend que l'animation finisse
    };
    
    const finish = () => {
      const cost = toLand * BALL_COST;
      const profit = totalWin - cost;
      currentScore += totalWin;
      
      if (game.addScore) game.addScore(totalWin);
      else if (typeof window.score !== 'undefined') {
        window.score = currentScore;
        if (game.updateUI) game.updateUI();
      }
      
      scoreDisplay.innerHTML = `💰 ${currentScore} PTS`;
      
      if (profit > 0) {
        resultDisplay.innerHTML = `🚀 +${profit} PROFIT 🚀`;
        resultDisplay.style.color = '#00ff00';
      } else if (profit < 0) {
        resultDisplay.innerHTML = `💀 ${profit} REKT 💀`;
        resultDisplay.style.color = '#ff0000';
      } else {
        resultDisplay.innerHTML = `😐 ±0 😐`;
        resultDisplay.style.color = '#ffcc00';
      }
      
      totalWin = 0; landed = 0; toLand = 0;
      
      // Show DUMP / PUMP buttons
      dropBtn.style.display = 'none';
      ballSelector.style.display = 'none';
      endBtnsContainer.style.display = 'flex';
      
      // If PUMP was already used, only show DUMP
      if (pumpUsed) {
        pumpBtn.style.display = 'none';
        dumpBtn.innerHTML = '📉 EXIT 📉';
      }
    };
    
    // DUMP = exit
    dumpBtn.onclick = closeGame;
    
    // PUMP = one more round then exit only
    pumpBtn.onclick = () => {
      pumpUsed = true;
      pumpBtn.style.display = 'none';
      endBtnsContainer.style.display = 'none';
      dropBtn.style.display = 'block';
      ballSelector.style.display = 'flex';
      resultDisplay.innerHTML = '🔥 LAST CHANCE! 🔥';
      resultDisplay.style.color = '#ff00ff';
      updateBtn();
    };
    
    // Game loop
    const loop = () => {
      update();
      draw();
      animId = requestAnimationFrame(loop);
    };
    
    // Drop
    const drop = () => {
      const cost = selectedBalls * BALL_COST;
      if (currentScore < cost) return;
      
      currentScore -= cost;
      if (typeof window.score !== 'undefined') window.score = currentScore;
      scoreDisplay.innerHTML = `💰 ${currentScore} PTS`;
      
      dropBtn.disabled = true;
      resultDisplay.innerHTML = '';
      
      toLand = selectedBalls;
      landed = 0;
      totalWin = 0;
      
      // Spawn balls
      for (let i = 0; i < selectedBalls; i++) {
        setTimeout(() => {
          balls.push({
            x: W / 2 + (Math.random() - 0.5) * 120,
            y: 20,
            vx: (Math.random() - 0.5) * (isMobile ? 6 : 4),  // 🔥 Plus de variance mobile
            vy: isMobile ? 5 : 3,  // 🔥 Vélocité initiale plus forte mobile
            done: false
          });
        }, i * 60);
      }
    };
    
    dropBtn.onclick = drop;
    
    loop();
  },



  // ==================== 🎡 ROULETTE BONNETEAU STYLE ====================
  showRoulette(game) {
    window.gamePaused = true;
    if (typeof window.setPaused === 'function') window.setPaused(true);
    document.querySelectorAll('.ear.active').forEach(e => { e.classList.remove('active','cabal','echo','power-up'); e.textContent=''; });
    if (typeof window.activeEarsCount !== 'undefined') window.activeEarsCount = 0;

    // SCORE FIX: use addScore callback OR window.score directly
    const _getScore = () => typeof window.score !== 'undefined' ? window.score : (game.score || 0);
    const _addPts = (pts) => {
      if (typeof window.score !== 'undefined') { window.score += pts; }
      if (game.addScore) game.addScore(pts);
      if (game.updateUI) game.updateUI();
    };
    const currentScore = _getScore();
    const bet = Math.max(50, Math.round(currentScore * 0.25));
    this.speak("Place your bets! Round and round she goes!");

    const style = document.createElement('style');
    style.id = 'rlStyles';
    style.innerHTML = `
      @keyframes rlTitlePulse { 0%,100%{text-shadow:0 0 30px #FFD700,0 0 60px #ff00ff,4px 4px 0 #000}
        50%{text-shadow:0 0 60px #FFD700,0 0 120px #ff00ff,4px 4px 0 #000} }
      @keyframes rlGlitch { 0%,90%,100%{transform:none;color:#FFD700} 93%{transform:skewX(-8deg);color:#ff00ff}
        96%{transform:skewX(8deg);color:#00ffff} }
      @keyframes rlRainbow { 0%{color:#FFD700} 20%{color:#ff00ff} 40%{color:#00ffff}
        60%{color:#00ff88} 80%{color:#FF6600} 100%{color:#FFD700} }
      @keyframes rlSpinWheel { to{ transform: rotate(var(--rw-angle)); } }
      @keyframes rlBallSpin { to{ transform: rotate(var(--rb-angle)); } }
      @keyframes rlWinBounce { 0%,100%{transform:scale(1)} 25%{transform:scale(1.15) rotate(-2deg)}
        75%{transform:scale(1.15) rotate(2deg)} }
      @keyframes rlFomoFade { 0%,100%{opacity:0.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
      @keyframes rlSlideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
      @keyframes rlParticleFly { from{opacity:1;transform:translate(0,0) scale(1.2)}
        to{opacity:0;transform:translate(var(--pdx),var(--pdy)) scale(0)} }
      .rl-btn {
        font-family:'Luckiest Guy',cursive; border:3px solid #333; border-radius:12px;
        cursor:pointer; transition:all 0.15s; touch-action:manipulation;
        padding: clamp(10px,2vw,16px) clamp(14px,3vw,24px);
        font-size: clamp(14px,2.8vw,20px); min-height:50px;
        position:relative; overflow:hidden;
      }
      .rl-btn:active, .rl-btn.rl-on {
        border-color:#FFD700 !important; transform:scale(1.08) !important;
        box-shadow:0 0 25px #FFD700, 0 0 50px rgba(255,215,0,0.4) !important;
      }
      .rl-history span {
        display:inline-flex; align-items:center; justify-content:center;
        width:28px; height:28px; border-radius:50%; font-size:11px; font-weight:bold;
        font-family:'Luckiest Guy',cursive; border:2px solid rgba(255,255,255,0.3); margin:2px;
      }
    `;
    document.head.appendChild(style);

    const ov = document.createElement('div');
    ov.id = 'rlOverlay';
    ov.style.cssText = `position:fixed;inset:0;z-index:100005;overflow-y:auto;
      -webkit-overflow-scrolling:touch;
      background:radial-gradient(ellipse at center, rgba(20,0,40,0.98) 0%, rgba(0,0,0,0.99) 100%);
      display:flex;flex-direction:column;align-items:center;padding:20px 12px 30px;`;

    // 🎨 ANIMATED CASINO BACKGROUND
    const casinoBg = document.createElement('div');
    casinoBg.style.cssText = `position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:0;`;
    casinoBg.innerHTML = `
      <div style="position:absolute;bottom:0;left:0;right:0;height:50%;background:linear-gradient(0deg,rgba(120,0,0,0.5) 0%,rgba(60,0,30,0.3) 60%,transparent 100%);animation:casinoFloor 3s ease-in-out infinite alternate;"></div>
      <div style="position:absolute;top:0;left:0;right:0;height:25%;background:linear-gradient(180deg,rgba(80,0,100,0.6),transparent);"></div>
      <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#FFD700,#ff00ff,#00ffff,#FFD700);opacity:0.5;"></div>
      ${Array.from({length:16},(_,i)=>`<div style="position:absolute;font-size:${14+Math.random()*22}px;opacity:0.07;left:${Math.random()*100}%;top:${Math.random()*100}%;animation:casinoFloat ${3+Math.random()*5}s ${Math.random()*4}s ease-in-out infinite alternate;pointer-events:none;">${['🎡','🎰','⭕','🔴','⚫','💚','💰','🎲'][i%8]}</div>`).join('')}
    `;
    ov.appendChild(casinoBg);

    // 🔊 CASINO AMBIENT SOUND
    const startCasinoAmbient = () => {
      try {
        const ac = new (window.AudioContext||window.webkitAudioContext)();
        let playing = true;
        const playChip = () => {
          if (!playing || !document.getElementById('rlOverlay')) return;
          const o=ac.createOscillator(), g=ac.createGain();
          o.connect(g); g.connect(ac.destination);
          o.frequency.value=[800,1000,1200,900,1100][Math.floor(Math.random()*5)];
          o.type='sine';
          g.gain.setValueAtTime(0.04,ac.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.25);
          o.start(ac.currentTime); o.stop(ac.currentTime+0.25);
          setTimeout(playChip, 600+Math.random()*1200);
        };
        playChip();
        ov.addEventListener('remove',()=>{ playing=false; ac.close(); },{once:true});
        const obs=new MutationObserver(()=>{ if(!document.getElementById('rlOverlay')){ playing=false; try{ac.close();}catch(e){} obs.disconnect(); }});
        obs.observe(document.body,{childList:true});
      } catch(e){}
    };
    setTimeout(startCasinoAmbient, 200);

    // Inject keyframes if not present
    if(!document.getElementById('casinoAnimStyles')){
      const ks=document.createElement('style'); ks.id='casinoAnimStyles';
      ks.textContent=`
        @keyframes casinoFloor{0%{opacity:0.4}100%{opacity:0.7}}
        @keyframes casinoFloat{0%{transform:translateY(0) rotate(0deg)}100%{transform:translateY(-20px) rotate(15deg)}}
      `;
      document.head.appendChild(ks);
    }


    // Title block — Bonneteau style
    const titleEl = document.createElement('div');
    titleEl.innerHTML = '🎡 HEARING ROULETTE 🎡';
    titleEl.style.cssText = `font-family:'Luckiest Guy',cursive;font-size:clamp(32px,7vw,58px);
      color:#FFD700;animation:rlTitlePulse 2s infinite,rlGlitch 5s infinite;
      letter-spacing:3px;text-align:center;margin-bottom:8px;`;
    ov.appendChild(titleEl);

    const subtitleEl = document.createElement('div');
    subtitleEl.innerHTML = `🎯 BET: <span style="color:#FFD700;font-size:1.3em">${bet}</span> PTS — PICK & SPIN!`;
    subtitleEl.style.cssText = `font-family:'Luckiest Guy',cursive;font-size:clamp(16px,3vw,22px);
      color:#00ffff;text-shadow:0 0 20px #00ffff;text-align:center;margin-bottom:20px;
      animation:rlRainbow 3s infinite;`;
    ov.appendChild(subtitleEl);

    // Canvas wheel
    const isMobile = window.innerWidth < 768;
    const WS = Math.min(window.innerWidth * (isMobile ? 0.78 : 0.42), 290);
    const canvas = document.createElement('canvas');
    canvas.width = WS*2; canvas.height = WS*2;
    canvas.style.cssText = `width:${WS}px;height:${WS}px;display:block;margin:0 auto 20px;
      filter:drop-shadow(0 0 25px rgba(255,0,255,0.5)) drop-shadow(0 0 50px rgba(255,215,0,0.3));
      will-change:transform;`;
    ov.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const CX=WS, CY=WS, R=WS*0.90;

    const wheelOrder=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
    const redNums=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
    const N=wheelOrder.length, SA=(Math.PI*2)/N;
    let wheelAngle=0, ballAngle=0, spinning=false, animId=null, winNumber=0, winIndex=-1;

    const getColor = n => n===0?'#1a8a2a':redNums.has(n)?'#cc1a00':'#111';

    const drawWheel = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.save(); ctx.translate(CX,CY);
      // Outer glow ring
      ctx.beginPath(); ctx.arc(0,0,R+8,0,Math.PI*2);
      const rim=ctx.createLinearGradient(-R,0,R,0);
      rim.addColorStop(0,'rgba(255,0,255,0.6)'); rim.addColorStop(0.5,'rgba(255,215,0,0.8)'); rim.addColorStop(1,'rgba(0,255,255,0.6)');
      ctx.strokeStyle=rim; ctx.lineWidth=8; ctx.stroke();
      // Sectors
      for (let i=0;i<N;i++) {
        const a0=wheelAngle+i*SA-SA/2, a1=a0+SA, num=wheelOrder[i];
        ctx.beginPath(); ctx.moveTo(0,0); ctx.arc(0,0,R,a0,a1); ctx.closePath();
        ctx.fillStyle = (i===winIndex&&!spinning) ? '#FFD700' : getColor(num);
        ctx.fill();
        ctx.strokeStyle='rgba(255,215,0,0.3)'; ctx.lineWidth=1; ctx.stroke();
        const ma=a0+SA/2, tx=Math.cos(ma)*R*0.72, ty=Math.sin(ma)*R*0.72;
        ctx.save(); ctx.translate(tx,ty); ctx.rotate(ma+Math.PI/2);
        ctx.fillStyle = (i===winIndex&&!spinning)?'#000':'#fff';
        ctx.font=`bold ${Math.max(9,R/24)}px Arial`; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(num,0,0); ctx.restore();
      }
      // Center
      ctx.beginPath(); ctx.arc(0,0,R*0.16,0,Math.PI*2);
      const cg=ctx.createRadialGradient(0,0,0,0,0,R*0.16);
      cg.addColorStop(0,'#FFD700'); cg.addColorStop(1,'#ff00ff');
      ctx.fillStyle=cg; ctx.fill();
      ctx.restore();
    };

    const drawBall = () => {
      ctx.save(); ctx.translate(CX,CY);
      const bx=Math.cos(ballAngle)*R*0.93, by=Math.sin(ballAngle)*R*0.93;
      ctx.beginPath(); ctx.arc(bx,by,R*0.05,0,Math.PI*2);
      ctx.fillStyle='#fff'; ctx.fill();
      ctx.strokeStyle='#FFD700'; ctx.lineWidth=2; ctx.stroke();
      ctx.restore();
    };

    drawWheel();

    // Bet options
    const betOptions=[
      {l:'🔴 RED ×2',v:'red',bg:'linear-gradient(135deg,#8B0000,#cc2200)'},
      {l:'⚫ BLACK ×2',v:'black',bg:'linear-gradient(135deg,#111,#333)'},
      {l:'💚 ZERO ×14',v:'green',bg:'linear-gradient(135deg,#004400,#007700)'},
      {l:'1-12 ×3',v:'low',bg:'linear-gradient(135deg,#3d1a00,#6b3300)'},
      {l:'13-24 ×3',v:'mid',bg:'linear-gradient(135deg,#003d22,#006638)'},
      {l:'25-36 ×3',v:'high',bg:'linear-gradient(135deg,#001f3d,#003d6b)'},
      {l:'ODD ×2',v:'odd',bg:'linear-gradient(135deg,#2a0044,#5500aa)'},
      {l:'EVEN ×2',v:'even',bg:'linear-gradient(135deg,#003344,#007799)'},
    ];

    let selectedBet=null;
    const betsGrid=document.createElement('div');
    betsGrid.style.cssText=`display:grid;grid-template-columns:repeat(${window.innerWidth<480?2:4},1fr);gap:8px;
      width:100%;max-width:560px;margin:0 auto 20px;`;

    betOptions.forEach(opt=>{
      const btn=document.createElement('button');
      btn.className='rl-btn'; btn.textContent=opt.l;
      btn.style.cssText+=`background:${opt.bg};color:#fff;`;
      btn.onclick=()=>{
        document.querySelectorAll('.rl-btn.rl-on').forEach(b=>b.classList.remove('rl-on'));
        btn.classList.add('rl-on'); selectedBet=opt;
        spinBtn.style.display='block';
        this.speak(`${opt.l}! No more bets!`);
      };
      betsGrid.appendChild(btn);
    });
    ov.appendChild(betsGrid);

    const spinBtn=document.createElement('button');
    spinBtn.innerHTML='🎡 SPIN!';
    spinBtn.style.cssText=`display:none;padding:16px 50px;font-size:clamp(20px,4vw,28px);
      background:linear-gradient(135deg,#FFD700,#FF6600);color:#000;border:none;
      border-radius:14px;cursor:pointer;min-height:56px;width:90%;max-width:380px;
      font-family:'Luckiest Guy',cursive;text-shadow:1px 1px 0 rgba(0,0,0,0.3);
      box-shadow:0 0 30px #FFD700,0 0 60px rgba(255,215,0,0.4);margin:0 auto 16px;
      display:none;touch-action:manipulation;`;
    ov.appendChild(spinBtn);

    const resultEl=document.createElement('div');
    resultEl.style.cssText=`font-family:'Luckiest Guy',cursive;font-size:clamp(20px,4.5vw,32px);
      color:#FFD700;min-height:50px;text-align:center;animation:rlSlideUp 0.3s ease-out;`;
    ov.appendChild(resultEl);

    const historyEl=document.createElement('div');
    historyEl.className='rl-history';
    historyEl.style.cssText=`text-align:center;min-height:32px;margin-top:8px;`;
    ov.appendChild(historyEl);

    document.body.appendChild(ov);

    const spawnParticles=()=>{
      const em=['🏆','⭐','💎','🔥','✨','💰','🎉','🎡'];
      const n=window.innerWidth<768?10:16;
      for(let i=0;i<n;i++){
        const p=document.createElement('div');
        p.textContent=em[Math.floor(Math.random()*em.length)];
        const pdx=(Math.random()-0.5)*320, pdy=-(80+Math.random()*200);
        p.style.cssText=`position:fixed;font-size:${18+Math.random()*18}px;
          left:${15+Math.random()*70}%;top:45%;pointer-events:none;z-index:100010;
          --pdx:${pdx}px;--pdy:${pdy}px;animation:rlParticleFly 1s ease-out ${i*0.05}s forwards;`;
        document.body.appendChild(p); setTimeout(()=>p.remove(),1200);
      }
    };

    const closeGame=()=>{
      if(animId) cancelAnimationFrame(animId);
      setTimeout(()=>{
        ov.style.transition='opacity 0.5s'; ov.style.opacity='0';
        setTimeout(()=>{ ov.remove(); if(style&&style.parentNode) style.remove();
          // FORCE FULL RESUME
          window.gamePaused=false; window.isPaused=false;
          if(typeof window.setPaused==='function') window.setPaused(false);
          if(typeof window.activeEarsCount!=='undefined') window.activeEarsCount=0;
          // Clear any stale ear states
          document.querySelectorAll('.ear').forEach(e=>{
            if(!e.classList.contains('active')) { e.textContent=''; e.style.cssText=''; }
          });
          setTimeout(()=>{
            if(typeof window.startSpawning==='function'){
              window.startSpawning();
              // Force-spawn 2 ears immediately
              setTimeout(()=>{ if(typeof window.spawnEar==='function'){ window.spawnEar(); window.spawnEar(); }},150);
            }
          },100);
        },500);
      },2800);
    };

    let startTS=0;
    const SPIN_DURATION=3500;

    const animateSpin=(ts)=>{
      if(!startTS) startTS=ts;
      const p=Math.min((ts-startTS)/SPIN_DURATION,1);
      const ease=1-Math.pow(1-p,3);
      wheelAngle+=0.07*(1-ease*0.9);
      ballAngle-=0.10*(1-ease*0.85);
      drawWheel(); drawBall();
      if(p<1){ animId=requestAnimationFrame(animateSpin); }
      else {
        spinning=false;
        winIndex=wheelOrder.indexOf(winNumber);
        const slotAngle=wheelAngle+winIndex*SA;
        ballAngle=slotAngle;
        drawWheel(); drawBall();
        showResult();
      }
    };

    const showResult=()=>{
      const isRed=redNums.has(winNumber);
      const color=winNumber===0?'green':isRed?'red':'black';
      const emoji=winNumber===0?'💚':isRed?'🔴':'⚫';
      // History dot
      const dot=document.createElement('span');
      dot.textContent=winNumber; dot.style.background=getColor(winNumber); dot.style.color='#fff';
      dot.style.boxShadow=`0 0 8px ${winNumber===0?'#2aff44':isRed?'#ff4422':'#888'}`;
      historyEl.appendChild(dot);

      let won=false, mult=0;
      // GAMBLER multipliers — always feel rewarding
      if(selectedBet.v===color){won=true;mult=color==='green'?20:3;}
      else if(selectedBet.v==='low'&&winNumber>=1&&winNumber<=12){won=true;mult=4;}
      else if(selectedBet.v==='mid'&&winNumber>=13&&winNumber<=24){won=true;mult=4;}
      else if(selectedBet.v==='high'&&winNumber>=25&&winNumber<=36){won=true;mult=4;}
      else if(selectedBet.v==='odd'&&winNumber%2===1&&winNumber>0){won=true;mult=3;}
      else if(selectedBet.v==='even'&&winNumber%2===0&&winNumber>0){won=true;mult=3;}

      if(won){
        const w=bet*mult;
        _addPts(w);
        resultEl.innerHTML=`${emoji} <span style="font-size:1.4em">${winNumber}</span> — 🏆 +${w} pts!`;
        this.speak(`${winNumber}! Massive payout! You win ${w} points!`);
        spawnParticles();
      } else {
        // Only lose half the bet for fun/gambler feel
        const loss=Math.round(bet*0.5);
        _addPts(-loss); if(typeof window.score!=='undefined') window.score=Math.max(0,window.score);
        resultEl.innerHTML=`${emoji} <span style="font-size:1.4em">${winNumber}</span> — 💀 -${loss} pts. Near miss!`;
        this.speak(`${winNumber}! So close! Better luck next time!`);
      }
      if(typeof game.updateUI==='function') game.updateUI();
      closeGame();
    };

    spinBtn.onclick=()=>{
      if(spinning||!selectedBet) return;
      spinning=true; startTS=0;
      spinBtn.disabled=true; spinBtn.innerHTML='🌀 NO MORE BETS!';
      document.querySelectorAll('.rl-btn').forEach(b=>b.disabled=true);
      resultEl.textContent='';
      winNumber=Math.floor(Math.random()*37);
      this.speak("No more bets! Watch the wheel spin!");
      animId=requestAnimationFrame(animateSpin);
    };
  },

  // ==================== 🎲 CRAPS BONNETEAU STYLE ====================
  showCraps(game) {
    window.gamePaused = true;
    if (typeof window.setPaused === 'function') window.setPaused(true);
    document.querySelectorAll('.ear.active').forEach(e=>{ e.classList.remove('active','cabal','echo','power-up'); e.textContent=''; });
    if (typeof window.activeEarsCount !== 'undefined') window.activeEarsCount = 0;

    const _getScore = () => typeof window.score !== 'undefined' ? window.score : (game.score || 0);
    const _addPts = (pts) => {
      if (typeof window.score !== 'undefined') { window.score += pts; }
      if (game.addScore) game.addScore(pts);
      if (game.updateUI) game.updateUI();
    };
    const currentScore=_getScore();
    const bet=Math.max(50, Math.round(currentScore*0.25));
    this.speak("Craps! Roll the dice! Come on degen!");

    const style=document.createElement('style');
    style.id='crStyles';
    style.innerHTML=`
      @keyframes crTitle { 0%,100%{color:#FF6600;text-shadow:0 0 30px #FF6600,4px 4px 0 #000}
        50%{color:#FFD700;text-shadow:0 0 60px #FFD700,4px 4px 0 #000} }
      @keyframes crGlitch { 0%,92%,100%{transform:none} 94%{transform:skewX(-6deg);color:#00ffff} 97%{transform:skewX(4deg)} }
      @keyframes crRainbow { 0%{color:#ff00ff} 33%{color:#00ffff} 66%{color:#FFD700} 100%{color:#ff00ff} }
      @keyframes crTablePulse { 0%,100%{box-shadow:0 0 40px rgba(0,200,100,0.3),inset 0 0 60px rgba(0,80,40,0.2)}
        50%{box-shadow:0 0 80px rgba(0,255,136,0.5),inset 0 0 100px rgba(0,120,60,0.3)} }
      @keyframes crDieRoll { 0%{transform:rotateX(0) rotateY(0) rotateZ(0)}
        25%{transform:rotateX(180deg) rotateY(90deg) rotateZ(45deg)}
        50%{transform:rotateX(360deg) rotateY(180deg) rotateZ(90deg)}
        75%{transform:rotateX(540deg) rotateY(270deg) rotateZ(135deg)}
        100%{transform:rotateX(var(--drx)) rotateY(var(--dry)) rotateZ(0deg)} }
      @keyframes crSlideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
      @keyframes crParticle { from{opacity:1;transform:translate(0,0) scale(1.2)} to{opacity:0;transform:translate(var(--pdx),var(--pdy)) scale(0)} }
      .cr-die-wrap { perspective:600px; width:clamp(90px,18vw,120px); height:clamp(90px,18vw,120px); }
      .cr-die { width:100%;height:100%;transform-style:preserve-3d; }
      .cr-die.rolling { animation:crDieRoll 0.9s cubic-bezier(0.17,0.67,0.12,1.02) forwards; }
      .cr-face {
        position:absolute;width:100%;height:100%;
        background:linear-gradient(135deg,#f0f0f0,#d8d8d8);
        border-radius:clamp(10px,2vw,16px);
        box-shadow:inset 0 -5px 10px rgba(0,0,0,0.15),inset 0 5px 10px rgba(255,255,255,0.7),0 0 20px rgba(0,0,0,0.3);
        border:2px solid rgba(255,255,255,0.5);
        display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);
        padding:clamp(8px,1.5vw,12px);gap:3px;box-sizing:border-box;
      }
      .cr-face.cr-winner { box-shadow:0 0 30px #FFD700,0 0 60px rgba(255,215,0,0.6),inset 0 -5px 10px rgba(0,0,0,0.15);
        border-color:#FFD700; }
      .cr-dot { border-radius:50%;background:radial-gradient(circle at 35% 30%,#555,#111);
        box-shadow:inset 0 2px 3px rgba(0,0,0,0.4),0 1px 2px rgba(255,255,255,0.3); }
      .cr-dot.cr-empty { background:transparent;box-shadow:none; }
      .cr-face-front  { transform:translateZ(50%); }
      .cr-face-back   { transform:rotateY(180deg) translateZ(50%); }
      .cr-face-right  { transform:rotateY(90deg) translateZ(50%); }
      .cr-face-left   { transform:rotateY(-90deg) translateZ(50%); }
      .cr-face-top    { transform:rotateX(90deg) translateZ(50%); }
      .cr-face-bottom { transform:rotateX(-90deg) translateZ(50%); }
    `;
    document.head.appendChild(style);

    const ov=document.createElement('div');
    ov.id='crOverlay';
    ov.style.cssText=`position:fixed;inset:0;z-index:100005;overflow-y:auto;
      -webkit-overflow-scrolling:touch;
      background:radial-gradient(ellipse at center, rgba(20,0,40,0.98) 0%, rgba(0,0,0,0.99) 100%);
      display:flex;flex-direction:column;align-items:center;padding:20px 12px 30px;`;

    // 🎨 CRAPS ANIMATED TABLE BACKGROUND
    const casinoBgCr=document.createElement('div');
    casinoBgCr.style.cssText=`position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:0;`;
    casinoBgCr.innerHTML=`
      <div style="position:absolute;bottom:0;left:0;right:0;height:50%;background:linear-gradient(0deg,rgba(0,80,20,0.5) 0%,rgba(0,40,10,0.3) 60%,transparent 100%);animation:casinoFloor 2.5s ease-in-out infinite alternate;"></div>
      <div style="position:absolute;top:0;left:0;right:0;height:25%;background:linear-gradient(180deg,rgba(0,60,80,0.5),transparent);"></div>
      <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#00ff88,#FFD700,#ff6600,#00ff88);opacity:0.5;"></div>
      ${Array.from({length:14},(_,i)=>`<div style="position:absolute;font-size:${12+Math.random()*24}px;opacity:0.07;left:${Math.random()*100}%;top:${Math.random()*100}%;animation:casinoFloat ${3+Math.random()*5}s ${Math.random()*3}s ease-in-out infinite alternate;pointer-events:none;">${['🎲','⚄','⚅','⚂','⚃','💫','🎯','💥'][i%8]}</div>`).join('')}
    `;
    ov.appendChild(casinoBgCr);

    // 🔊 CRAPS AMBIENT
    const startCrapsAmbient=()=>{
      try{
        const ac=new(window.AudioContext||window.webkitAudioContext)();
        let playing=true;
        const playDiceRoll=()=>{
          if(!playing||!document.getElementById('crOverlay')) return;
          // Dice rolling rumble
          const buf=ac.createBuffer(1,ac.sampleRate*0.15,ac.sampleRate);
          const d=buf.getChannelData(0);
          for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.exp(-i/d.length*8)*0.3;
          const src=ac.createBufferSource(); src.buffer=buf;
          src.connect(ac.destination); src.start();
          setTimeout(playDiceRoll,2000+Math.random()*3000);
        };
        playDiceRoll();
        const obs=new MutationObserver(()=>{ if(!document.getElementById('crOverlay')){ playing=false; try{ac.close();}catch(e){} obs.disconnect(); }});
        obs.observe(document.body,{childList:true});
      }catch(e){}
    };
    setTimeout(startCrapsAmbient,200);

    const titleEl=document.createElement('div');
    titleEl.innerHTML='🎲 HEARING CRAPS 🎲';
    titleEl.style.cssText=`font-family:'Luckiest Guy',cursive;font-size:clamp(32px,7vw,58px);
      animation:crTitle 2s infinite,crGlitch 4s infinite;letter-spacing:3px;text-align:center;margin-bottom:8px;`;
    ov.appendChild(titleEl);

    const rulesEl=document.createElement('div');
    rulesEl.id='crRules';
    rulesEl.innerHTML=`🎯 BET: <span style="color:#FFD700;font-size:1.3em">${bet}</span> PTS — 7/11=WIN | 2/3/12=LOSE | ELSE POINT`;
    rulesEl.style.cssText=`font-family:'Luckiest Guy',cursive;font-size:clamp(13px,2.5vw,18px);
      color:#00ffff;text-shadow:0 0 15px #00ffff;text-align:center;margin-bottom:24px;
      animation:crRainbow 3s infinite;`;
    ov.appendChild(rulesEl);

    // Casino table
    const tableEl=document.createElement('div');
    tableEl.style.cssText=`background:linear-gradient(135deg,#0a2e0a,#1a4a1a,#0a2e0a);
      border-radius:24px;border:3px solid rgba(0,255,136,0.4);padding:clamp(16px,3vw,30px) clamp(12px,3vw,24px);
      animation:crTablePulse 3s infinite;width:100%;max-width:520px;box-sizing:border-box;
      display:flex;flex-direction:column;align-items:center;gap:20px;margin-bottom:20px;`;

    const diceRow=document.createElement('div');
    diceRow.style.cssText=`display:flex;gap:clamp(24px,6vw,50px);justify-content:center;align-items:center;`;

    const dots={1:[[0,0,0],[0,1,0],[0,0,0]],2:[[0,0,1],[0,0,0],[1,0,0]],3:[[0,0,1],[0,1,0],[1,0,0]],
      4:[[1,0,1],[0,0,0],[1,0,1]],5:[[1,0,1],[0,1,0],[1,0,1]],6:[[1,0,1],[1,0,1],[1,0,1]]};
    const faceV={front:1,back:6,right:2,left:5,top:3,bottom:4};
    const faceRot={1:{x:0,y:0},2:{x:0,y:-90},3:{x:90,y:0},4:{x:-90,y:0},5:{x:0,y:90},6:{x:0,y:180}};

    const makeDie=()=>{
      const w=document.createElement('div'); w.className='cr-die-wrap';
      const d=document.createElement('div'); d.className='cr-die';
      Object.entries(faceV).forEach(([fn,val])=>{
        const f=document.createElement('div'); f.className=`cr-face cr-face-${fn}`;
        dots[val].flat().forEach(filled=>{
          const dot=document.createElement('div'); dot.className=filled?'cr-dot':'cr-dot cr-empty'; f.appendChild(dot);
        }); d.appendChild(f);
      }); w.appendChild(d); return {w,d};
    };

    const die1=makeDie(), die2=makeDie();
    diceRow.appendChild(die1.w); diceRow.appendChild(die2.w);
    tableEl.appendChild(diceRow);

    const sumEl=document.createElement('div');
    sumEl.style.cssText=`font-family:'Luckiest Guy',cursive;font-size:clamp(24px,5vw,36px);
      color:#FFD700;text-align:center;min-height:44px;text-shadow:0 0 20px #FFD700;`;
    sumEl.innerHTML='Roll the dice!';
    tableEl.appendChild(sumEl);
    ov.appendChild(tableEl);

    const rollBtn=document.createElement('button');
    rollBtn.innerHTML='🎲 ROLL!';
    rollBtn.style.cssText=`padding:16px 56px;font-size:clamp(22px,4vw,30px);
      background:linear-gradient(135deg,#FF6600,#FF3300);color:#fff;border:none;
      border-radius:14px;cursor:pointer;min-height:58px;width:90%;max-width:380px;
      font-family:'Luckiest Guy',cursive;text-shadow:1px 1px 0 #000;
      box-shadow:0 0 30px #FF6600,0 0 60px rgba(255,102,0,0.4);margin-bottom:16px;
      touch-action:manipulation;transition:all 0.2s;`;
    ov.appendChild(rollBtn);

    const resultEl=document.createElement('div');
    resultEl.style.cssText=`font-family:'Luckiest Guy',cursive;font-size:clamp(20px,4.5vw,32px);
      color:#FFD700;min-height:50px;text-align:center;`;
    ov.appendChild(resultEl);

    const histEl=document.createElement('div');
    histEl.style.cssText=`font-family:'Luckiest Guy',cursive;color:#666;font-size:clamp(12px,2vw,15px);
      text-align:center;min-height:20px;margin-top:8px;`;
    ov.appendChild(histEl);

    document.body.appendChild(ov);

    let point=null, rolling=false, rollHist=[];
    const diceFaces=['⚀','⚁','⚂','⚃','⚄','⚅'];

    const glowDice=()=>{
      [die1.d, die2.d].forEach(d=>d.querySelectorAll('.cr-face').forEach(f=>f.classList.add('cr-winner')));
    };

    const spawnParticles=()=>{
      const em=['🎲','🏆','⭐','💎','🔥','✨','💰'];
      const n=window.innerWidth<768?10:16;
      for(let i=0;i<n;i++){
        const p=document.createElement('div'); p.textContent=em[Math.floor(Math.random()*em.length)];
        const pdx=(Math.random()-0.5)*300, pdy=-(80+Math.random()*200);
        p.style.cssText=`position:fixed;font-size:${18+Math.random()*18}px;
          left:${15+Math.random()*70}%;top:45%;pointer-events:none;z-index:100010;
          --pdx:${pdx}px;--pdy:${pdy}px;animation:crParticle 1s ease-out ${i*0.05}s forwards;`;
        document.body.appendChild(p); setTimeout(()=>p.remove(),1200);
      }
    };

    const closeGame=()=>{
      setTimeout(()=>{
        ov.style.transition='opacity 0.5s'; ov.style.opacity='0';
        setTimeout(()=>{ ov.remove(); if(style&&style.parentNode) style.remove();
          // FORCE FULL RESUME
          window.gamePaused=false; window.isPaused=false;
          if(typeof window.setPaused==='function') window.setPaused(false);
          if(typeof window.activeEarsCount!=='undefined') window.activeEarsCount=0;
          // Clear any stale ear states
          document.querySelectorAll('.ear').forEach(e=>{
            if(!e.classList.contains('active')) { e.textContent=''; e.style.cssText=''; }
          });
          setTimeout(()=>{
            if(typeof window.startSpawning==='function'){
              window.startSpawning();
              // Force-spawn 2 ears immediately
              setTimeout(()=>{ if(typeof window.spawnEar==='function'){ window.spawnEar(); window.spawnEar(); }},150);
            }
          },100);
        },500);
      },2800);
    };

    rollBtn.onclick=()=>{
      if(rolling) return;
      rolling=true; rollBtn.disabled=true; rollBtn.innerHTML='🌀 Rolling...';
      [die1.d,die2.d].forEach(d=>{ d.querySelectorAll('.cr-face').forEach(f=>f.classList.remove('cr-winner')); d.classList.remove('rolling'); });
      this.speak("Rolling the dice!");
      const v1=Math.floor(Math.random()*6)+1, v2=Math.floor(Math.random()*6)+1, sum=v1+v2;
      const rx1=faceRot[v1].x+Math.floor(Math.random()*3+3)*360;
      const ry1=faceRot[v1].y+Math.floor(Math.random()*3+3)*360;
      const rx2=faceRot[v2].x+Math.floor(Math.random()*3+3)*360;
      const ry2=faceRot[v2].y+Math.floor(Math.random()*3+3)*360;
      die1.d.style.setProperty('--drx',`${rx1}deg`); die1.d.style.setProperty('--dry',`${ry1}deg`);
      die2.d.style.setProperty('--drx',`${rx2}deg`); die2.d.style.setProperty('--dry',`${ry2}deg`);
      void die1.d.offsetWidth; void die2.d.offsetWidth;
      die1.d.classList.add('rolling'); die2.d.classList.add('rolling');

      setTimeout(()=>{
        rolling=false; rollHist.push(sum);
        histEl.textContent=`Rolls: ${rollHist.join(' → ')}`;
        sumEl.innerHTML=`${diceFaces[v1-1]} ${diceFaces[v2-1]} <span style="color:#ff00ff">= ${sum}</span>`;
        glowDice();

        if(!point){
          if(sum===7||sum===11){
            const crWin=bet*3; // 3x for natural!
            _addPts(crWin);
            resultEl.innerHTML=`🎉 NATURAL ${sum}! TRIPLE PAY! +${crWin} pts!`;
            rollBtn.style.display='none';
            this.speak(`Natural ${sum}! You win triple! Insane!`);
            spawnParticles(); closeGame();
          } else if(sum===2||sum===3||sum===12){
            const crLoss=Math.round(bet*0.3); // Only lose 30%
            _addPts(-crLoss); if(typeof window.score!=='undefined') window.score=Math.max(0,window.score);
            resultEl.innerHTML=`💀 CRAPS ${sum}! -${crLoss} pts. Near miss!`;
            rollBtn.style.display='none';
            this.speak(`Craps ${sum}! Almost had it!`);
            closeGame();
          } else {
            point=sum;
            document.getElementById('crRules').innerHTML=`<b style="color:#FF6600;font-size:1.3em">🎯 POINT: ${sum}</b> — Roll ${sum} to WIN | Roll 7 to LOSE`;
            resultEl.innerHTML=`⭐ POINT SET: ${sum} — Keep rolling!`;
            rollBtn.innerHTML='🎲 ROLL AGAIN!'; rollBtn.disabled=false;
            this.speak(`Point set at ${sum}! Roll it again!`);
          }
        } else {
          if(sum===point){
            const crWin=bet*2; // 2x for hitting point
            _addPts(crWin);
            resultEl.innerHTML=`🏆 POINT ${sum} HIT! DOUBLE PAY! +${crWin} pts!`;
            rollBtn.style.display='none';
            this.speak(`Point hit! ${sum}! Double pay! You win!`);
            spawnParticles(); closeGame();
          } else if(sum===7){
            const crLoss=Math.round(bet*0.4); // Only lose 40%
            _addPts(-crLoss); if(typeof window.score!=='undefined') window.score=Math.max(0,window.score);
            resultEl.innerHTML=`💀 SEVEN OUT! -${crLoss} pts. So close!`;
            rollBtn.style.display='none';
            this.speak("Seven out! You almost made it!");
            closeGame();
          } else {
            resultEl.innerHTML=`${sum} — Keep rolling for ${point}...`;
            rollBtn.innerHTML='🎲 ROLL AGAIN!'; rollBtn.disabled=false;
          }
        }
      },950);
    };
  },

  // ==================== 🃏 POKER BONNETEAU STYLE ====================
  showCasinoPoker(game) {
    window.gamePaused = true;
    if (typeof window.setPaused === 'function') window.setPaused(true);
    document.querySelectorAll('.ear.active').forEach(e=>{ e.classList.remove('active','cabal','echo','power-up'); e.textContent=''; });
    if (typeof window.activeEarsCount !== 'undefined') window.activeEarsCount = 0;

    const _getScore = () => typeof window.score !== 'undefined' ? window.score : (game.score || 0);
    const _addPts = (pts) => {
      if (typeof window.score !== 'undefined') { window.score += pts; }
      if (game.addScore) game.addScore(pts);
      if (game.updateUI) game.updateUI();
    };
    const currentScore=_getScore();
    const bet=Math.max(50, Math.round(currentScore*0.25));
    this.speak("Poker time! All in! Five card draw degen style!");

    const style=document.createElement('style');
    style.id='pkStyles';
    style.innerHTML=`
      @keyframes pkTitle { 0%,100%{color:#00ff88;text-shadow:0 0 30px #00ff88,0 0 60px #ff00ff,4px 4px 0 #000}
        50%{color:#FFD700;text-shadow:0 0 60px #FFD700,4px 4px 0 #000} }
      @keyframes pkGlitch { 0%,91%,100%{transform:none} 94%{transform:skewX(-6deg);color:#ff00ff} 97%{transform:skewX(4deg);color:#00ffff} }
      @keyframes pkRainbow { 0%{color:#00ffff} 33%{color:#ff00ff} 66%{color:#FFD700} 100%{color:#00ffff} }
      @keyframes pkCardIn { from{transform:translateY(-80px) rotateY(90deg);opacity:0}
        to{transform:translateY(0) rotateY(0);opacity:1} }
      @keyframes pkHold { 0%,100%{box-shadow:0 0 18px #FFD700,0 0 35px rgba(255,215,0,0.5)}
        50%{box-shadow:0 0 35px #FFD700,0 0 70px rgba(255,215,0,0.8)} }
      @keyframes pkJackpot { 0%,100%{transform:translateY(0) scale(1)} 25%{transform:translateY(-16px) scale(1.12) rotate(-3deg)}
        75%{transform:translateY(-12px) scale(1.12) rotate(3deg)} }
      @keyframes pkSlideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
      @keyframes pkParticle { from{opacity:1;transform:translate(0,0) scale(1.3)} to{opacity:0;transform:translate(var(--pdx),var(--pdy)) scale(0)} }
      .pk-wrap {
        perspective:900px; cursor:pointer; touch-action:manipulation;
        width:clamp(58px,12vw,80px); height:clamp(82px,17vw,114px); position:relative;
      }
      .pk-inner { width:100%;height:100%;transform-style:preserve-3d; transition:transform 0.45s cubic-bezier(0.4,0,0.2,1); }
      .pk-wrap.pk-held .pk-inner { transform:translateY(-18px); }
      .pk-front, .pk-back {
        position:absolute;inset:0;border-radius:10px;backface-visibility:hidden;-webkit-backface-visibility:hidden;
        border:3px solid rgba(255,255,255,0.25);display:flex;flex-direction:column;
        align-items:center;justify-content:space-between;padding:4px;box-sizing:border-box;
      }
      .pk-front { background:linear-gradient(135deg,#fefefe,#efefef); font-weight:bold;
        box-shadow:0 6px 20px rgba(0,0,0,0.4); }
      .pk-back { background:repeating-linear-gradient(45deg,#1a0033 0,#1a0033 4px,#330055 4px,#330055 8px);
        transform:rotateY(180deg); }
      .pk-wrap.pk-held .pk-front {
        border-color:#FFD700; animation:pkHold 1.2s infinite;
        box-shadow:0 0 25px #FFD700,0 0 50px rgba(255,215,0,0.5);
      }
      .pk-wrap.pk-jackpot { animation:pkJackpot 0.6s ease-in-out; }
      .pk-hold-tag { position:absolute;top:-26px;left:50%;transform:translateX(-50%);
        background:linear-gradient(135deg,#FFD700,#FF6600);color:#000;font-size:11px;
        font-weight:bold;padding:3px 8px;border-radius:5px;font-family:'Luckiest Guy',cursive;
        white-space:nowrap;box-shadow:0 0 12px #FFD700; }
      .pk-rank { font-size:clamp(10px,2.3vw,15px); line-height:1; }
      .pk-suit-center { font-size:clamp(18px,4vw,26px); }
      .pk-s { color:#111; } .pk-h { color:#cc0000; } .pk-d { color:#cc0000; } .pk-c { color:#111; }
    `;
    document.head.appendChild(style);

    const ov=document.createElement('div');
    ov.id='pkOverlay';
    ov.style.cssText=`position:fixed;inset:0;z-index:100005;overflow-y:auto;
      -webkit-overflow-scrolling:touch;
      background:radial-gradient(ellipse at center, rgba(0,30,20,0.98) 0%, rgba(0,0,0,0.99) 100%);
      display:flex;flex-direction:column;align-items:center;padding:20px 12px 30px;`;

    // 🎨 POKER ANIMATED FELT BACKGROUND
    const casinoBgPk=document.createElement('div');
    casinoBgPk.style.cssText=`position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:0;`;
    casinoBgPk.innerHTML=`
      <div style="position:absolute;bottom:0;left:0;right:0;height:50%;background:linear-gradient(0deg,rgba(0,100,30,0.45) 0%,rgba(0,50,15,0.3) 60%,transparent 100%);animation:casinoFloor 4s ease-in-out infinite alternate;"></div>
      <div style="position:absolute;top:0;left:0;right:0;height:25%;background:linear-gradient(180deg,rgba(0,40,20,0.5),transparent);"></div>
      <div style="position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#00ff44,#00ffff,#00ff44);opacity:0.4;"></div>
      ${Array.from({length:14},(_,i)=>`<div style="position:absolute;font-size:${12+Math.random()*24}px;opacity:0.07;left:${Math.random()*100}%;top:${Math.random()*100}%;animation:casinoFloat ${4+Math.random()*4}s ${Math.random()*3}s ease-in-out infinite alternate;pointer-events:none;">${['🃏','♠️','♥️','♦️','♣️','🎴','💎','👑'][i%8]}</div>`).join('')}
    `;
    ov.appendChild(casinoBgPk);

    // 🔊 POKER AMBIENT
    const startPokerAmbient=()=>{
      try{
        const ac=new(window.AudioContext||window.webkitAudioContext)();
        let playing=true;
        const playCard=()=>{
          if(!playing||!document.getElementById('pkOverlay')) return;
          const o=ac.createOscillator(),g=ac.createGain();
          o.connect(g); g.connect(ac.destination);
          o.frequency.value=400+Math.random()*200; o.type='sine';
          g.gain.setValueAtTime(0.03,ac.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+0.1);
          o.start(ac.currentTime); o.stop(ac.currentTime+0.1);
          setTimeout(playCard,1500+Math.random()*2500);
        };
        playCard();
        const obs=new MutationObserver(()=>{ if(!document.getElementById('pkOverlay')){ playing=false; try{ac.close();}catch(e){} obs.disconnect(); }});
        obs.observe(document.body,{childList:true});
      }catch(e){}
    };
    setTimeout(startPokerAmbient,200);

    const titleEl=document.createElement('div');
    titleEl.innerHTML='🃏 HEARING POKER 🃏';
    titleEl.style.cssText=`font-family:'Luckiest Guy',cursive;font-size:clamp(32px,7vw,58px);
      animation:pkTitle 2s infinite,pkGlitch 4.5s infinite;letter-spacing:3px;text-align:center;margin-bottom:8px;`;
    ov.appendChild(titleEl);

    const betInfoEl=document.createElement('div');
    betInfoEl.id='pkBetInfo';
    betInfoEl.innerHTML=`🃏 BET: <span style="color:#FFD700;font-size:1.3em">${bet}</span> PTS — TAP CARDS TO HOLD`;
    betInfoEl.style.cssText=`font-family:'Luckiest Guy',cursive;font-size:clamp(14px,2.8vw,20px);
      color:#00ffff;text-shadow:0 0 15px #00ffff;text-align:center;margin-bottom:20px;
      animation:pkRainbow 3s infinite;`;
    ov.appendChild(betInfoEl);

    // Card table
    const tableEl=document.createElement('div');
    tableEl.style.cssText=`background:linear-gradient(135deg,#0a2318,#0d3020,#0a2318);
      border-radius:24px;border:3px solid rgba(0,255,136,0.35);padding:28px 20px;
      width:100%;max-width:560px;box-sizing:border-box;
      box-shadow:0 0 50px rgba(0,255,136,0.15),inset 0 0 60px rgba(0,0,0,0.4);
      display:flex;flex-direction:column;align-items:center;gap:16px;margin-bottom:20px;`;

    const cardsRow=document.createElement('div');
    cardsRow.style.cssText=`display:flex;gap:clamp(7px,2vw,14px);justify-content:center;align-items:flex-end;`;
    tableEl.appendChild(cardsRow);

    const handResultEl=document.createElement('div');
    handResultEl.style.cssText=`font-family:'Luckiest Guy',cursive;font-size:clamp(17px,3.5vw,26px);
      color:#00ff88;min-height:36px;text-align:center;text-shadow:0 0 15px #00ff88;`;
    tableEl.appendChild(handResultEl);
    ov.appendChild(tableEl);

    const actionBtn=document.createElement('button');
    actionBtn.innerHTML='🃏 DEAL';
    actionBtn.style.cssText=`padding:16px 50px;font-size:clamp(22px,4vw,30px);
      background:linear-gradient(135deg,#00cc66,#008844);color:#fff;border:none;
      border-radius:14px;cursor:pointer;min-height:58px;width:90%;max-width:380px;
      font-family:'Luckiest Guy',cursive;text-shadow:1px 1px 0 rgba(0,0,0,0.4);
      box-shadow:0 0 30px rgba(0,255,136,0.5),0 0 60px rgba(0,255,136,0.2);margin-bottom:12px;
      touch-action:manipulation;transition:all 0.2s;`;
    ov.appendChild(actionBtn);

    const payEl=document.createElement('div');
    payEl.innerHTML=`<span style="color:#FFD700">RF/SF</span>×20 &nbsp; <span style="color:#ff00ff">4K</span>×8 &nbsp; FH×6 &nbsp; Flush×5 &nbsp; Str×4 &nbsp; 3K×3 &nbsp; 2P×2 &nbsp; JJ+×1.5`;
    payEl.style.cssText=`color:#555;font-size:clamp(10px,2vw,13px);text-align:center;
      font-family:'Luckiest Guy',cursive;padding:0 8px;`;
    ov.appendChild(payEl);
    document.body.appendChild(ov);

    const suits=[{s:'♠',c:'pk-s'},{s:'♥',c:'pk-h'},{s:'♦',c:'pk-d'},{s:'♣',c:'pk-c'}];
    const ranks=['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
    const makeDeck=()=>{
      const d=[];
      for(const su of suits) for(const r of ranks) d.push({r,s:su.s,c:su.c,v:ranks.indexOf(r)});
      return d.sort(()=>Math.random()-0.5);
    };
    const evalHand=(cards)=>{
      const vs=cards.map(c=>c.v).sort((a,b)=>a-b);
      const ss=cards.map(c=>c.s);
      const isFlush=ss.every(s=>s===ss[0]);
      const isStraight=(vs[4]-vs[0]===4&&new Set(vs).size===5)||(vs[0]===0&&vs[1]===9&&vs[2]===10&&vs[3]===11&&vs[4]===12);
      const cnt={};vs.forEach(v=>cnt[v]=(cnt[v]||0)+1);
      const f=Object.values(cnt).sort((a,b)=>b-a);
      if(isFlush&&isStraight&&vs[0]===8) return['🔥 ROYAL FLUSH!',50,'jackpot'];
      if(isFlush&&isStraight) return['⚡ STRAIGHT FLUSH!',30,'jackpot'];
      if(f[0]===4) return['💎 FOUR OF A KIND!',15,'big'];
      if(f[0]===3&&f[1]===2) return['🏠 FULL HOUSE!',10,'big'];
      if(isFlush) return['🌊 FLUSH!',7,'good'];
      if(isStraight) return['📈 STRAIGHT!',5,'good'];
      if(f[0]===3) return['🎯 THREE OF A KIND!',4,'good'];
      if(f[0]===2&&f[1]===2) return['👥 TWO PAIR!',2.5,'ok'];
      const pairs=Object.entries(cnt).filter(([v,c])=>c>=2).map(([v])=>parseInt(v));
      if(pairs.some(v=>v>=9||v===0)) return['💪 JACKS OR BETTER!',1.5,'ok'];
      return['🤏 SMALL HAND — CONSOLATION!',0.3,'none']; // Always give a tiny payout
    };

    let deck=[],hand=[],held=[],phase='deal';
    const cardEls=[];

    const buildCard=(card,idx)=>{
      const w=document.createElement('div'); w.className='pk-wrap';
      w.style.animationDelay=`${idx*0.09}s`;
      const inner=document.createElement('div'); inner.className='pk-inner';
      // Front
      const front=document.createElement('div'); front.className='pk-front';
      const tl=document.createElement('div'); tl.className=`pk-rank ${card.c}`; tl.innerHTML=`${card.r}<br>${card.s}`;
      const mid=document.createElement('div'); mid.className=`pk-suit-center ${card.c}`; mid.textContent=card.s;
      const br=document.createElement('div'); br.className=`pk-rank ${card.c}`; br.style.transform='rotate(180deg)'; br.innerHTML=`${card.r}<br>${card.s}`;
      front.appendChild(tl); front.appendChild(mid); front.appendChild(br);
      // Back
      const back=document.createElement('div'); back.className='pk-back';
      back.innerHTML=`<div style="font-size:clamp(18px,4vw,26px);align-self:center">🃏</div>`;
      inner.appendChild(front); inner.appendChild(back); w.appendChild(inner);
      return w;
    };

    const spawnParticles=()=>{
      const em=['🃏','🏆','⭐','♠️','♥️','💰','🎉','✨'];
      const n=window.innerWidth<768?10:18;
      for(let i=0;i<n;i++){
        const p=document.createElement('div'); p.textContent=em[Math.floor(Math.random()*em.length)];
        const pdx=(Math.random()-0.5)*320, pdy=-(80+Math.random()*200);
        p.style.cssText=`position:fixed;font-size:${18+Math.random()*18}px;
          left:${15+Math.random()*70}%;top:45%;pointer-events:none;z-index:100010;
          --pdx:${pdx}px;--pdy:${pdy}px;animation:pkParticle 1s ease-out ${i*0.04}s forwards;`;
        document.body.appendChild(p); setTimeout(()=>p.remove(),1200);
      }
    };

    const renderCards=(isNew=false)=>{
      cardsRow.innerHTML=''; cardEls.length=0;
      hand.forEach((card,i)=>{
        const w=buildCard(card,i);
        if(held[i]) {
          w.classList.add('pk-held');
          const tag=document.createElement('div'); tag.className='pk-hold-tag'; tag.textContent='HOLD'; w.appendChild(tag);
        }
        if(isNew) w.style.animation=`pkCardIn 0.4s ease-out ${i*0.09}s both`;
        w.onclick=()=>{
          if(phase!=='draw') return;
          held[i]=!held[i]; renderCards();
          handResultEl.textContent=evalHand(hand)[0];
        };
        cardEls.push(w); cardsRow.appendChild(w);
      });
    };

    const closeGame=()=>{
      setTimeout(()=>{
        ov.style.transition='opacity 0.5s'; ov.style.opacity='0';
        setTimeout(()=>{ ov.remove(); if(style&&style.parentNode) style.remove();
          window.gamePaused=false; window.isPaused=false;
          if(typeof window.setPaused==='function') window.setPaused(false);
          if(typeof window.activeEarsCount!=='undefined') window.activeEarsCount=0;
          document.querySelectorAll('.ear').forEach(e=>{
            if(!e.classList.contains('active')){ e.textContent=''; e.style.cssText=''; }
          });
          setTimeout(()=>{
            if(typeof window.startSpawning==='function'){
              window.startSpawning();
              setTimeout(()=>{ if(typeof window.spawnEar==='function'){ window.spawnEar(); window.spawnEar(); }},150);
            }
          },100);
        },500);
      },3000);
    };

    actionBtn.onclick=()=>{
      if(phase==='deal'){
        deck=makeDeck(); hand=deck.splice(0,5); held=[false,false,false,false,false];
        phase='draw'; renderCards(true);
        handResultEl.textContent=evalHand(hand)[0];
        actionBtn.innerHTML='🔄 DRAW';
        actionBtn.style.background='linear-gradient(135deg,#cc6600,#993300)';
        actionBtn.style.boxShadow='0 0 30px rgba(255,102,0,0.5)';
        this.speak("Cards dealt! Choose what to hold!");
      } else if(phase==='draw'){
        hand=hand.map((c,i)=>held[i]?c:deck.shift());
        held=[false,false,false,false,false]; phase='result';
        renderCards(true);
        const [name,mult,tier]=evalHand(hand);
        handResultEl.textContent=name;
        actionBtn.disabled=true; actionBtn.innerHTML='✅';
        setTimeout(()=>{
          if(tier==='jackpot'||tier==='big') { cardEls.forEach(c=>c.classList.add('pk-jackpot')); spawnParticles(); }
          const w=Math.round(bet*mult);
          if(w>0){
            _addPts(w);
            document.getElementById('pkBetInfo').innerHTML=`<span style="color:#00ff88;font-size:1.1em">🏆 ${name} → +${w} pts!</span>`;
            this.speak(`${name.replace(/[^\w ]/g,'').trim()}! ${mult>=10?'INSANE WIN!':'Nice win!'} ${w} points!`);
            if(mult>=5) spawnParticles();
          } else {
            // Consolation: lose only 20% for gambler feel
            const loss=Math.round(bet*0.2);
            _addPts(-loss); if(typeof window.score!=='undefined') window.score=Math.max(0,window.score);
            document.getElementById('pkBetInfo').innerHTML=`<span style="color:#ff9944">🤏 Bad luck — -${loss} pts. Almost!`;
            this.speak("So close! Bad luck this time, try again!");
          }
          if(typeof game.updateUI==='function') game.updateUI();
          closeGame();
        },500);
      }
    };
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MiniGames;
}
