// ==================== PWA SERVICE WORKER ====================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
      })
      .catch(err => {
      });
  });
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  showInstallPromotion();
});

function showInstallPromotion() {
}

window.addEventListener('appinstalled', () => {
  deferredPrompt = null;
});

window.addEventListener('online', () => {
  showToast('Back online! 🟢');
});

window.addEventListener('offline', () => {
  showToast('You are offline 🔴');
});

const isIos = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

const isInStandaloneMode = () => {
  return ('standalone' in window.navigator) && (window.navigator.standalone);
};

if (isIos() && !isInStandaloneMode()) {
}
