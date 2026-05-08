// Service Worker for OraaSlayer v300
const CACHE_NAME = 'oraaslaver-v300';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/api/anilist.js',
  '/api/firebase.js',
  '/api/auth.js',
  '/pages/home.js',
  '/pages/login.js',
  '/pages/register.js',
  '/pages/profile.js',
  '/pages/anime.js',
  '/pages/favorites.js',
  '/pages/servers.js',
  '/pages/watch.js',
  '/pages/chat.js',
  '/pages/redeem_cd.js',
  '/pages/verification.js',
  '/pages/about.js',
  '/pages/policy.js',
  '/pages/store.js',
  '/pages/settings.js',
  '/pages/download.js',
  // Add more critical files
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          // Cache API responses
          if (event.request.url.includes('/api/')) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        });
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});