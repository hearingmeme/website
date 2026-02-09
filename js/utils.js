// ==================== UTILITY FUNCTIONS ====================

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function vibrate(pattern = [30]) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

function formatNumber(num) {
  num = Math.floor(num);
  
  if (num >= 1000000) {
    return Math.floor(num / 1000) + 'k';
  }
  if (num >= 1000) {
    return Math.floor(num / 1000) + 'k';
  }
  return num.toString();
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

async function copyToClipboard(text, successMessage = 'Copied!') {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMessage);
    return true;
  } catch (err) {
    console.error('Copy failed:', err);
    return false;
  }
}

function showToast(message, duration = 2000) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #000;
    color: #fc0;
    padding: 15px 30px;
    border: 3px solid #fc0;
    font-family: 'Luckiest Guy', cursive;
    font-size: 1.2rem;
    z-index: 99999;
    box-shadow: 6px 6px 0 #000;
    animation: slideDown 0.3s ease-out;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideUp 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function isToday(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

function isThisWeek(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return date >= weekAgo;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function animateCounter(element, target, duration = 1000) {
  const start = parseInt(element.textContent) || 0;
  const increment = (target - start) / (duration / 16);
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
      element.textContent = Math.round(target);
      clearInterval(timer);
    } else {
      element.textContent = Math.round(current);
    }
  }, 16);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    randomInt,
    vibrate,
    formatNumber,
    formatDate,
    copyToClipboard,
    showToast,
    isToday,
    isThisWeek,
    debounce,
    animateCounter
  };
}
