// Cipher Room service worker.
// Strategy: cache-first for app shell + JSX modules, network-first for everything else
// (so CDN React/Three updates aren't pinned by stale caches when online).

const VERSION = "v1";
const SHELL_CACHE = `cipher-shell-${VERSION}`;
const RUNTIME_CACHE = `cipher-runtime-${VERSION}`;

const SHELL_ASSETS = [
  "/",
  "/index.html",
  "/app.jsx",
  "/audio.jsx",
  "/game.jsx",
  "/interactive-puzzles.jsx",
  "/landing.jsx",
  "/pageflip.jsx",
  "/puzzles.jsx",
  "/puzzles-extra.jsx",
  "/scene3d.jsx",
  "/tweaks-panel.jsx",
  "/manifest.webmanifest",
  "/icons/icon.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      cache.addAll(SHELL_ASSETS).catch((err) => {
        console.warn("[sw] precache partial fail", err);
      })
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Same-origin shell + JSX -> cache-first with background revalidate
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(req, SHELL_CACHE));
    return;
  }

  // Cross-origin (CDN libs, fonts) -> cache-first with long-lived runtime cache
  event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
});

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (res && res.status === 200 && (res.type === "basic" || res.type === "cors")) {
        cache.put(req, res.clone());
      }
      return res;
    })
    .catch(() => cached);
  return cached || network;
}
