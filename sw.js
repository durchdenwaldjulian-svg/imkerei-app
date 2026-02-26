// Imkerei Planer – Service Worker v1.0
const CACHE_NAME = 'imkerei-planer-v1';

// Dateien die gecacht werden sollen (App-Shell)
const APP_SHELL = [
  './',
  './index.html',
  './bewertung.html',
  './ernte.html',
  './assistent.html',
  './bestandsbuch.html',
  './trachtkarte.html',
  './landing.html',
  './shared-styles.css',
  './config.js',
  './icon-192.png',
  './icon-512.png',
  './manifest.json'
];

// Externe Ressourcen (Fonts, Libraries)
const EXTERNAL_CACHE = [
  'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Outfit:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'
];

// Install: Cache App-Shell
self.addEventListener('install', event => {
  console.log('[SW] Installing Imkerei Planer v1...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching App-Shell');
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
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => {
              console.log('[SW] Deleting old cache:', key);
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
            return cached || caches.match('./index.html');
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
