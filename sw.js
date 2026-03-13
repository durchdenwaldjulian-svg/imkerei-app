// Imkerei Planer – Service Worker v1.0
const CACHE_NAME = 'imkerei-planer-v7';

// Dateien die gecacht werden sollen (App-Shell)
const APP_SHELL = [
  './',
  './app.html',
  './voelker.html',
  './ernte.html',
  './assistent.html',
  './bestandsbuch.html',
  './trachtkarte.html',
  './index.html',
  './voelker.css',
  './voelker-core.js',
  './voelker-standorte.js',
  './voelker-voelker.js',
  './voelker-durchsicht.js',
  './voelker-koenigin.js',
  './voelker-ranking.js',
  './voelker-scanner.js',
  './voelker-sprache.js',
  './theme.js',
  './nav.js',
  './shared-styles.css',
  './config.js',
  './icon-192.png',
  './icon-512.png',
  './manifest.json'
];

// Lokale Vendor-Bibliotheken
const EXTERNAL_CACHE = [
  'vendor/leaflet.min.css',
  'vendor/leaflet.min.js',
  'vendor/supabase.min.js',
  'vendor/qrcode.min.js'
];

// Install: Cache App-Shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache local files
      return cache.addAll(APP_SHELL).catch(err => {
        console.warn('[SW] Some app-shell files failed to cache:', err);
      });
    })
  );
  // Sofort aktivieren ohne auf alte Tabs zu warten
  self.skipWaiting();
});

// Activate: Alte Caches löschen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => {
              return caches.delete(key);
            })
      );
    })
  );
  // Sofort alle Clients übernehmen
  self.clients.claim();
});

// Fetch: Network first, Cache fallback
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Supabase API-Calls NICHT cachen
  if (url.hostname.includes('supabase')) {
    return; // Browser default (network only)
  }
  
  // Open-Meteo API nicht cachen
  if (url.hostname.includes('open-meteo') || url.hostname.includes('geocoding-api')) {
    return;
  }

  // Für HTML-Seiten: Network first, cache fallback
  if (event.request.mode === 'navigate' || event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Erfolgreiche Antwort auch cachen
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          // Offline → aus Cache laden
          return caches.match(event.request).then(cached => {
            return cached || caches.match('./app.html');
          });
        })
    );
    return;
  }

  // Für alles andere: Cache first, network fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      
      return fetch(event.request).then(response => {
        // Nur erfolgreiche Antworten cachen
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline und nicht im Cache
        console.warn('[SW] Offline, not cached:', event.request.url);
      });
    })
  );
});
