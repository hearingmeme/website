// ==================== STORAGE MANAGER ====================

const StorageManager = {
  KEYS: {
    HIGH_SCORE: 'hearing_high_score',
    LEADERBOARD: 'hearing_leaderboard',
    SETTINGS: 'hearing_settings'
  },

  getHighScore() {
    return parseInt(localStorage.getItem(this.KEYS.HIGH_SCORE) || '0');
  },

  setHighScore(score) {
    localStorage.setItem(this.KEYS.HIGH_SCORE, score.toString());
  },

  getLeaderboard() {
    try {
      const data = localStorage.getItem(this.KEYS.LEADERBOARD);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.error('Error loading leaderboard:', err);
      return [];
    }
  },

  addScore(playerName, score, level, combo, misses) {
    const leaderboard = this.getLeaderboard();
    
    const entry = {
      id: Date.now() + Math.random(), // Unique ID
      name: playerName.trim() || 'Anonymous',
      score: Math.round(score),
      level: level,
      combo: combo,
      misses: misses,
      timestamp: Date.now(),
      date: new Date().toISOString()
    };

    leaderboard.push(entry);
    
    leaderboard.sort((a, b) => b.score - a.score);
    
    const trimmed = leaderboard.slice(0, 100);
    
    localStorage.setItem(this.KEYS.LEADERBOARD, JSON.stringify(trimmed));
    
    return entry;
  },

  clearLeaderboard() {
    localStorage.removeItem(this.KEYS.LEADERBOARD);
  },

  getFilteredLeaderboard(filter = 'all') {
    const leaderboard = this.getLeaderboard();
    
    if (filter === 'today') {
      return leaderboard.filter(entry => isToday(entry.timestamp));
    }
    
    if (filter === 'week') {
      return leaderboard.filter(entry => isThisWeek(entry.timestamp));
    }
    
    return leaderboard;
  },

  getUserRank(score) {
    const leaderboard = this.getLeaderboard();
    const rank = leaderboard.filter(entry => entry.score > score).length + 1;
    return { rank, total: leaderboard.length };
  },

  getSettings() {
    try {
      const data = localStorage.getItem(this.KEYS.SETTINGS);
      return data ? JSON.parse(data) : {
        musicEnabled: true,
        sfxEnabled: true,
        vibrationEnabled: true
      };
    } catch (err) {
      return {
        musicEnabled: true,
        sfxEnabled: true,
        vibrationEnabled: true
      };
    }
  },

  saveSettings(settings) {
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
  },

  exportData() {
    return {
      highScore: this.getHighScore(),
      leaderboard: this.getLeaderboard(),
      settings: this.getSettings(),
      exportDate: new Date().toISOString()
    };
  },

  importData(data) {
    try {
      if (data.highScore) {
        this.setHighScore(data.highScore);
      }
      if (data.leaderboard) {
        localStorage.setItem(this.KEYS.LEADERBOARD, JSON.stringify(data.leaderboard));
      }
      if (data.settings) {
        this.saveSettings(data.settings);
      }
      return true;
    } catch (err) {
      console.error('Import failed:', err);
      return false;
    }
  },

  clearAll() {
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}
