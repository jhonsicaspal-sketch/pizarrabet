// Service worker básico de PizarraBet.
// Su función principal aquí es cumplir el requisito técnico para que el
// navegador ofrezca "Instalar app". También cachea lo esencial para que
// la app cargue más rápido en visitas repetidas.

const CACHE_NAME = 'pizarrabet-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/logopb.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Estrategia simple: intenta la red primero (para que los datos de Supabase
// y el HTML se mantengan actualizados); si falla (sin internet), usa la
// copia guardada en caché como respaldo.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
