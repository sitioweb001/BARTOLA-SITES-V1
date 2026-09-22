// Service Worker de "Deseos de Bartolita"
// Solo cachea el "cascarón" de la app (HTML, manifest, iconos) para que
// instale correctamente y abra aunque no haya conexión.
// Los datos (Google Apps Script) SIEMPRE se piden a internet, nunca se cachean,
// para que veas la información más reciente.

const CACHE_NAME = "bartolita-cache-v1";
const ARCHIVOS_CASCARON = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-512-maskable.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARCHIVOS_CASCARON))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(
        nombres
          .filter((nombre) => nombre !== CACHE_NAME)
          .map((nombre) => caches.delete(nombre))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Nunca interceptar llamadas a la API (Google Apps Script) ni a fuentes externas:
  // siempre deben ir a la red para traer datos frescos.
  if (
    event.request.method !== "GET" ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // Estrategia "cache primero, con respaldo de red" solo para el cascarón local.
  event.respondWith(
    caches.match(event.request).then((respuestaCache) => {
      if (respuestaCache) return respuestaCache;
      return fetch(event.request)
        .then((respuestaRed) => {
          const copia = respuestaRed.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
          return respuestaRed;
        })
        .catch(() => caches.match("./index.html"));
    })
  );
});
