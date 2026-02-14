// Hearing Things — Service Worker — Omega Build
const CACHE_NAME = 'hearing-things-v1';
const CORE_ASSETS = [
  '/',
  '/home.html',
  '/css/deploy.css',
  '/js/sound-system.js',
  '/js/minigames.js',
  '/js/game.js',
  '/js/metagame.js',
  '/js/mega-bonus-effects.js',
  '/js/hearing-machine-degen.js',
  '/js/visual-effects.js',
  '/js/performance-boost.js',
  '/js/main.js',
  '/favicon.png',
  'https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS.filter(u => !u.startsWith('http'))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response && response.status === 200 && e.request.url.startsWith(self.location.origin)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return response;
      }).catch(() => cached || new Response('Offline', { status: 503 }));
    })
  );
});
