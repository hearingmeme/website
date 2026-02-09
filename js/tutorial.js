// ==================== TUTORIAL SYSTEM V7 FIXED ====================

const TutorialSystem = {
  currentStep: 0,
  isActive: false,
  overlay: null,
  
  steps: [
    {
      id: "welcome",
      title: "Welcome to Hearing Things! 👂",
      text: "Let's learn the basics in 60 seconds!",
      highlight: null,
      action: null
    },
    {
      id: "click_ear",
      title: "Click the Ears! 👂",
      text: "Click on the glowing ears before they disappear! (You can also click NEXT to skip)",
      highlight: ".hole",
      action: null, // 🐛 V17 FIX: Plus d'action forcée, bouton NEXT disponible
      forceSpawn: true
    },
    {
      id: "combo",
      title: "Build Combos! 🔥",
      text: "Click multiple ears in a row to build your combo multiplier!",
      highlight: "#combo",
      action: null, // 🐛 V17 FIX: Plus d'action forcée
      forceSpawn: true
    },
    {
      id: "cabal",
      title: "Watch Out for Cabal! 🕵️‍♂️",
      text: "Some ears are TRAPS! Cabal ears (🕵️‍♂️) will give you a penalty! (An example will spawn - you can click NEXT)",
      highlight: ".hole",
      action: null, // 🐛 V17 FIX: Plus d'action forcée
      forceCabal: true
    },
    {
      id: "misses",
      title: "Don't Miss Too Many! ⚠️",
      text: "If you miss 7 ears, it's game over! Keep your streak low.",
      highlight: "#misses",
      action: null // 🐛 V17 FIX: Plus d'attente forcée
    },
    {
      id: "bonus",
      title: "Collect Bonuses! 🎁",
      text: "Special bonuses give you points and cool effects! (An example will spawn - you can click NEXT)",
      highlight: ".hole",
      action: null, // 🐛 V17 FIX: Plus d'action forcée
      forceBonus: true
    },
    {
      id: "complete",
      title: "You're Ready! 🎉",
      text: "Now go HEAR THINGS and dominate! Good luck!",
      highlight: null,
      action: null
    }
  ],
  
  init() {
    // ✅ FIX: Only initialize if we're in the GAME page
    const gameBoard = document.getElementById('gameBoard');
    if (!gameBoard) {
      console.log('Tutorial: Not in game page, skipping init');
      return;
    }
    
    console.log('Tutorial: Initialized');
    
    // Add tutorial button to header
    this.addTutorialButton();
  },
  
  addTutorialButton() {
    const header = document.querySelector('.game-header-controls');
    if (!header) return;
    
    const tutorialBtn = document.createElement('button');
    tutorialBtn.id = 'tutorialBtn';
    tutorialBtn.className = 'header-btn';
    tutorialBtn.innerHTML = '📚';
    tutorialBtn.title = 'Tutorial';
    tutorialBtn.style.cssText = `
      background: linear-gradient(145deg, #4CAF50, #45a049);
      border: 2px solid #66BB6A;
    `;
    
    tutorialBtn.addEventListener('click', () => {
      this.start();
    });
    
    header.insertBefore(tutorialBtn, header.firstChild);
  },
  
  // Called from actuallyStartGame() for first-time users
  showFirstTimePrompt() {
    const completed = localStorage.getItem('tutorial_completed');
    if (completed === 'true') return;
    
    // Wait a bit for game to be fully loaded
    setTimeout(() => {
      const prompt = document.createElement('div');
      prompt.id = 'tutorialPrompt';
      prompt.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(145deg, #1a1a2e, #2a2a4e);
        border: 4px solid #00ffff;
        border-radius: 20px;
        padding: 40px;
        z-index: 100002;
        text-align: center;
        box-shadow: 0 0 60px rgba(0, 255, 255, 0.5);
      `;
      
      prompt.innerHTML = `
        <div style="
          font-size: 48px;
          color: #FFD700;
          font-family: 'Luckiest Guy', cursive;
          margin-bottom: 20px;
          text-shadow: 0 0 20px #FFD700;
        ">👂 First Time Playing? 👂</div>
        
        <div style="
          font-size: 24px;
          color: #fff;
          font-family: 'Luckiest Guy', cursive;
          margin-bottom: 30px;
        ">Want a quick tutorial? (60 seconds)</div>
        
        <div style="display: flex; gap: 20px; justify-content: center;">
          <button id="startTutorialBtn" style="
            font-family: 'Luckiest Guy', cursive;
            font-size: 24px;
            padding: 15px 40px;
            background: linear-gradient(145deg, #00ff88, #00cc66);
            color: #000;
            border: none;
            border-radius: 12px;
            cursor: pointer;
          ">YES, TEACH ME! 📚</button>
          
          <button id="skipTutorialPrompt" style="
            font-family: 'Luckiest Guy', cursive;
            font-size: 24px;
            padding: 15px 40px;
            background: linear-gradient(145deg, #666, #444);
            color: #fff;
            border: none;
            border-radius: 12px;
            cursor: pointer;
          ">NO, I'M GOOD ✋</button>
        </div>
      `;
      
      document.body.appendChild(prompt);
      
      document.getElementById('startTutorialBtn').addEventListener('click', () => {
        prompt.remove();
        this.start();
      });
      
      document.getElementById('skipTutorialPrompt').addEventListener('click', () => {
        localStorage.setItem('tutorial_completed', 'true');
        prompt.remove();
      });
    }, 2000);
  },
  
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.currentStep = 0;
    
    // Pause game
    if (typeof window.setPaused === 'function') {
      window.setPaused(true);
    }
    window.gamePaused = true;
    
    // Create overlay
    this.createOverlay();
    this.showStep(0);
  },
  
  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'tutorialOverlay';
    this.overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.85);
      z-index: 100000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s;
    `;
    
    document.body.appendChild(this.overlay);
  },
  
  showStep(stepIndex) {
    if (stepIndex >= this.steps.length) {
      this.complete();
      return;
    }
    
    const step = this.steps[stepIndex];
    this.currentStep = stepIndex;
    
    // Clear overlay
    this.overlay.innerHTML = '';
    
    // Highlight element if specified
    if (step.highlight) {
      this.highlightElement(step.highlight);
    }
    
    // Create step UI
    const stepUI = document.createElement('div');
    stepUI.id = 'tutorialStep';
    stepUI.style.cssText = `
      background: linear-gradient(145deg, #1a1a2e, #2a2a4e);
      border: 4px solid #00ffff;
      border-radius: 20px;
      padding: 40px;
      max-width: 500px;
      text-align: center;
      box-shadow: 0 0 60px rgba(0, 255, 255, 0.5);
      animation: bounce 0.5s;
    `;
    
    stepUI.innerHTML = `
      <div style="
        font-size: clamp(32px, 6vw, 48px);
        color: #FFD700;
        font-family: 'Luckiest Guy', cursive;
        margin-bottom: 20px;
        text-shadow: 0 0 20px #FFD700, 3px 3px 0 #000;
      ">${step.title}</div>
      
      <div style="
        font-size: clamp(18px, 4vw, 24px);
        color: #fff;
        font-family: 'Luckiest Guy', cursive;
        margin-bottom: 30px;
        text-shadow: 2px 2px 0 #000;
        line-height: 1.4;
      ">${step.text}</div>
      
      <div style="
        display: flex;
        gap: 15px;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
      ">
        <div style="
          font-size: 18px;
          color: #00ffff;
          font-family: 'Luckiest Guy', cursive;
        ">Step ${stepIndex + 1} / ${this.steps.length}</div>
        
        ${step.action ? `
          <div id="tutorialAction" style="
            font-size: 16px;
            color: #ffcc00;
            font-family: 'Luckiest Guy', cursive;
            padding: 10px 20px;
            background: rgba(255, 204, 0, 0.2);
            border: 2px solid #ffcc00;
            border-radius: 10px;
          ">${this.getActionText(step.action)}</div>
        ` : `
          <button id="tutorialNextBtn" style="
            font-family: 'Luckiest Guy', cursive;
            font-size: 20px;
            padding: 15px 40px;
            background: linear-gradient(145deg, #00ff88, #00cc66);
            color: #000;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
            transition: transform 0.2s;
          ">NEXT ➡️</button>
        `}
        
        <button id="skipTutorialBtn" style="
          font-family: 'Luckiest Guy', cursive;
          font-size: 16px;
          padding: 10px 20px;
          background: rgba(255, 0, 0, 0.5);
          color: #fff;
          border: 2px solid #ff0000;
          border-radius: 10px;
          cursor: pointer;
        ">SKIP</button>
      </div>
    `;
    
    this.overlay.appendChild(stepUI);
    
    // Next button handler
    const nextBtn = document.getElementById('tutorialNextBtn');
    if (nextBtn) {
      nextBtn.onmouseenter = () => { nextBtn.style.transform = 'scale(1.1)'; };
      nextBtn.onmouseleave = () => { nextBtn.style.transform = 'scale(1)'; };
      nextBtn.addEventListener('click', () => this.nextStep());
    }
    
    // Skip button handler
    const skipBtn = document.getElementById('skipTutorialBtn');
    if (skipBtn) {
      skipBtn.addEventListener('click', () => this.skip());
    }
    
    // Handle action-based steps
    if (step.action) {
      this.waitForAction(step);
    }
  },
  
  highlightElement(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.style.position = 'relative';
      el.style.zIndex = '100001';
      el.style.boxShadow = '0 0 40px #00ffff, 0 0 80px #00ffff';
      el.style.animation = 'tutorialPulse 1s infinite';
    });
    
    if (!document.getElementById('tutorialPulseStyle')) {
      const style = document.createElement('style');
      style.id = 'tutorialPulseStyle';
      style.textContent = `
        @keyframes tutorialPulse {
          0%, 100% { box-shadow: 0 0 40px #00ffff, 0 0 80px #00ffff; }
          50% { box-shadow: 0 0 60px #00ffff, 0 0 120px #00ffff; }
        }
      `;
      document.head.appendChild(style);
    }
  },
  
  removeHighlight() {
    document.querySelectorAll('.hole, #combo, #misses').forEach(el => {
      el.style.zIndex = '';
      el.style.boxShadow = '';
      el.style.animation = '';
    });
  },
  
  getActionText(action) {
    const texts = {
      click_ear: '👉 Click an ear to continue',
      reach_combo_3: '🔥 Build a 3x combo',
      see_cabal: '👁️ Watch the Cabal ear',
      wait_3s: '⏳ Reading...',
      see_bonus: '✨ Watch the bonus'
    };
    return texts[action] || 'Complete the action';
  },
  
  waitForAction(step) {
    const checkInterval = setInterval(() => {
      let actionComplete = false;
      
      switch(step.action) {
        case 'click_ear':
          if (step.forceSpawn) {
            setTimeout(() => this.forceSpawnEar('👂'), 500);
            step.forceSpawn = false;
          }
          if (window.tutorialEarClicked) {
            actionComplete = true;
            window.tutorialEarClicked = false;
          }
          break;
          
        case 'reach_combo_3':
          if (typeof window.combo !== 'undefined' && window.combo >= 3) {
            actionComplete = true;
          }
          break;
          
        case 'see_cabal':
          if (step.forceCabal) {
            setTimeout(() => this.forceSpawnEar('🕵️‍♂️'), 500);
            step.forceCabal = false;
          }
          if (window.tutorialCabalSeen) {
            actionComplete = true;
            window.tutorialCabalSeen = false;
          }
          break;
          
        case 'wait_3s':
          setTimeout(() => {
            actionComplete = true;
          }, 3000);
          step.action = null;
          break;
          
        case 'see_bonus':
          if (step.forceBonus) {
            setTimeout(() => this.forceSpawnEar('🎁'), 500);
            step.forceBonus = false;
          }
          if (window.tutorialBonusSeen) {
            actionComplete = true;
            window.tutorialBonusSeen = false;
          }
          break;
      }
      
      if (actionComplete) {
        clearInterval(checkInterval);
        setTimeout(() => this.nextStep(), 1000);
      }
    }, 100);
  },
  
  forceSpawnEar(emoji) {
    const holes = Array.from(document.querySelectorAll('.hole'));
    const availableHoles = holes.filter(h => !h.querySelector('.ear').classList.contains('active'));
    if (availableHoles.length === 0) return;
    
    const hole = availableHoles[Math.floor(Math.random() * availableHoles.length)];
    const ear = hole.querySelector('.ear');
    
    ear.textContent = emoji;
    ear.classList.add('active');
    if (emoji === '🕵️‍♂️') ear.classList.add('cabal');
    
    ear.dataset.tutorial = 'true';
  },
  
  nextStep() {
    this.removeHighlight();
    this.showStep(this.currentStep + 1);
  },
  
  skip() {
    if (confirm('Skip tutorial? You can restart it anytime from the 📚 button.')) {
      this.complete();
    }
  },
  
  complete() {
    this.isActive = false;
    this.removeHighlight();
    
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    
    localStorage.setItem('tutorial_completed', 'true');
    
    if (typeof window.setPaused === 'function') {
      window.setPaused(false);
    }
    window.gamePaused = false;
    
    if (typeof window.startSpawning === 'function') {
      setTimeout(() => window.startSpawning(), 100);
    }
    
    this.showCompletionMessage();
  },
  
  showCompletionMessage() {
    const msg = document.createElement('div');
    msg.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(145deg, #00ff88, #00cc66);
      color: #000;
      font-family: 'Luckiest Guy', cursive;
      font-size: 32px;
      padding: 30px 60px;
      border-radius: 20px;
      z-index: 100001;
      box-shadow: 0 0 60px rgba(0, 255, 136, 0.8);
      animation: bounce 0.5s, fadeOut 0.5s 2s;
    `;
    msg.textContent = '🎉 Tutorial Complete! Good Luck! 🎉';
    document.body.appendChild(msg);
    
    setTimeout(() => msg.remove(), 2500);
  }
};

// ✅ FIX: Only initialize when we're in the GAME page
document.addEventListener('DOMContentLoaded', () => {
  const gameBoard = document.getElementById('gameBoard');
  if (gameBoard) {
    TutorialSystem.init();
  }
});

// Expose globally
window.TutorialSystem = TutorialSystem;
