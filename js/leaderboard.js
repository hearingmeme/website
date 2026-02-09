
let currentFilter = 'all';

function initLeaderboard() {
  const leaderboardBtn = document.getElementById('leaderboardBtn');
  const leaderboardModal = document.getElementById('leaderboardModal');
  const closeLeaderboard = document.getElementById('closeLeaderboard');
  const clearBtn = document.getElementById('clearLeaderboardBtn');
  const filterBtns = document.querySelectorAll('.filter-btn');

  leaderboardBtn?.addEventListener('click', () => {
    leaderboardModal.style.display = 'flex';
    loadLeaderboard(currentFilter);
  });

  closeLeaderboard?.addEventListener('click', () => {
    leaderboardModal.style.display = 'none';
  });

  clearBtn?.addEventListener('click', async () => {
    if (confirm('⚠️ Are you sure you want to clear the entire leaderboard? This cannot be undone!')) {
      await clearLeaderboard();
    }
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      loadLeaderboard(currentFilter);
    });
  });

  leaderboardModal?.addEventListener('click', (e) => {
    if (e.target === leaderboardModal) {
      leaderboardModal.style.display = 'none';
    }
  });
}

async function saveScore(playerName, score, twitterHandle) {
  if (!playerName || !score) {
    console.error('Invalid score data');
    return false;
  }

  try {
    const cleanName = playerName.trim().substring(0, 20);
    const scoreData = {
      nom: cleanName,
      score: parseInt(score),
      date: firebase.firestore.FieldValue.serverTimestamp(),
      timestamp: Date.now() // Fallback for local sorting
    };
    
    // Add twitter handle if provided
    if (twitterHandle) {
      scoreData.twitter = twitterHandle.trim().replace(/^@/, '');
    }
    
    await db.collection('scores').add(scoreData);
    return true;
  } catch (error) {
    console.error('❌ Error saving score:', error);
    
    saveScoreLocal(playerName, score, twitterHandle);
    return false;
  }
}

function saveScoreLocal(playerName, score, twitterHandle) {
  try {
    const scores = JSON.parse(localStorage.getItem('gameScores') || '[]');
    const scoreData = {
      nom: playerName.trim().substring(0, 20),
      score: parseInt(score),
      date: new Date().toISOString(),
      timestamp: Date.now()
    };
    
    // Add twitter handle if provided
    if (twitterHandle) {
      scoreData.twitter = twitterHandle.trim().replace(/^@/, '');
    }
    
    scores.push(scoreData);
    
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem('gameScores', JSON.stringify(scores.slice(0, 100)));
    
    console.log('💾 Score saved locally (Firebase unavailable)');
  } catch (error) {
    console.error('Error saving locally:', error);
  }
}

async function loadLeaderboard(filter = 'all') {
  const leaderboardList = document.getElementById('leaderboardList');
  
  if (!leaderboardList) return;
  
  leaderboardList.innerHTML = '<div class="loading">Loading scores...</div>';

  try {
    let query = db.collection('scores').orderBy('score', 'desc').limit(100);
    
    if (filter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query = query.where('date', '>=', firebase.firestore.Timestamp.fromDate(today));
    } else if (filter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      query = query.where('date', '>=', firebase.firestore.Timestamp.fromDate(weekAgo));
    }

    const snapshot = await query.get();
    
    if (snapshot.empty) {
      leaderboardList.innerHTML = `
        <div class="no-scores">
          <p>🏆 No scores yet!</p>
          <p>Be the first to make it on the leaderboard!</p>
        </div>
      `;
      return;
    }

    let html = '<div class="leaderboard-entries">';
    let rank = 1;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
      const dateStr = data.date ? formatDate(data.date.toDate()) : 'Recently';
      
      // Add Twitter link if available
      let playerNameHtml = escapeHtml(data.nom);
      if (data.twitter) {
        playerNameHtml = `<a href="https://x.com/${escapeHtml(data.twitter)}" target="_blank" rel="noopener" style="color: #1DA1F2; text-decoration: none; font-weight: bold;">${escapeHtml(data.nom)} 𝕏</a>`;
      }
      
      html += `
        <div class="leaderboard-entry ${rank <= 3 ? 'top-three' : ''}">
          <span class="rank">${medal}</span>
          <span class="player-name">${playerNameHtml}</span>
          <span class="player-score">${formatNumber(data.score)}</span>
          <span class="player-date">${dateStr}</span>
        </div>
      `;
      rank++;
    });
    
    html += '</div>';
    leaderboardList.innerHTML = html;
    
  } catch (error) {
    console.error('❌ Error loading leaderboard:', error);
    
    loadLeaderboardLocal(filter);
  }
}

function loadLeaderboardLocal(filter = 'all') {
  const leaderboardList = document.getElementById('leaderboardList');
  
  try {
    let scores = JSON.parse(localStorage.getItem('gameScores') || '[]');
    
    if (filter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      scores = scores.filter(s => new Date(s.date) >= today);
    } else if (filter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      scores = scores.filter(s => new Date(s.date) >= weekAgo);
    }
    
    scores.sort((a, b) => b.score - a.score);
    
    if (scores.length === 0) {
      leaderboardList.innerHTML = `
        <div class="no-scores">
          <p>🏆 No local scores found!</p>
          <p>Firebase connection needed for global leaderboard.</p>
        </div>
      `;
      return;
    }
    
    let html = '<div class="leaderboard-entries"><div class="local-warning">📱 Showing local scores only</div>';
    
    scores.slice(0, 10).forEach((score, index) => {
      const rank = index + 1;
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
      const dateStr = formatDate(new Date(score.date));
      
      // Add Twitter link if available
      let playerNameHtml = escapeHtml(score.nom);
      if (score.twitter) {
        playerNameHtml = `<a href="https://x.com/${escapeHtml(score.twitter)}" target="_blank" rel="noopener" style="color: #1DA1F2; text-decoration: none; font-weight: bold;">${escapeHtml(score.nom)} 𝕏</a>`;
      }
      
      html += `
        <div class="leaderboard-entry ${rank <= 3 ? 'top-three' : ''}">
          <span class="rank">${medal}</span>
          <span class="player-name">${playerNameHtml}</span>
          <span class="player-score">${formatNumber(score.score)}</span>
          <span class="player-date">${dateStr}</span>
        </div>
      `;
    });
    
    html += '</div>';
    leaderboardList.innerHTML = html;
    
  } catch (error) {
    console.error('Error loading local scores:', error);
    leaderboardList.innerHTML = '<div class="error">Error loading scores</div>';
  }
}

async function clearLeaderboard() {
  try {
    const snapshot = await db.collection('scores').get();
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    loadLeaderboard(currentFilter);
  } catch (error) {
    console.error('❌ Error clearing leaderboard:', error);
    alert('Failed to clear leaderboard. Check console for details.');
  }
}

function formatDate(date) {
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

window.saveScore = saveScore;
window.loadLeaderboard = loadLeaderboard;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLeaderboard);
} else {
  initLeaderboard();
}
