// NOVA PWA Service Worker - Simple Version (No Offline Caching)
const CACHE_NAME = 'nova-pwa-v1';

// Install event - just activate immediately
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

// Activate event - take control immediately
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(self.clients.claim());
});

// Fetch event - just go to network, no caching
self.addEventListener('fetch', (event) => {
  // Just fetch from network normally
  event.respondWith(fetch(event.request));
});