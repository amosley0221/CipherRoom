// Cipher Room service worker.
// Strategy:
//   - Navigation requests (HTML): network-first with cache fallback. iOS PWAs
//     cache very aggressively and a stale-while-revalidate index.html keeps
//     users one load behind for layout / meta-tag fixes.
//   - JSX modules + CDN libs + assets: stale-while-revalidate.

const VERSION = "v6";
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

  // Navigation / HTML -> network-first so layout & meta updates land on
  // the very next reload, not two reloads later. iOS PWAs are otherwise
  // famously sticky.
  const isNavigation =
    req.mode === "navigate" ||
    (req.destination === "" && req.headers.get("accept")?.includes("text/html"));
  if (isNavigation) {
    event.respondWith(networkFirst(req, SHELL_CACHE));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(req, SHELL_CACHE));
    return;
  }

  event.respondWith(staleWhileRevalidate(req, RUNTIME_CACHE));
});

async function networkFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const fresh = await fetch(req);
    if (fresh && fresh.status === 200) cache.put(req, fresh.clone());
    return fresh;
  } catch (e) {
    const cached = await cache.match(req);
    if (cached) return cached;
    // last-ditch: any cached index.html
    return (await cache.match("/index.html")) || (await cache.match("/")) || Response.error();
  }
}

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

// Allow the page to ask the SW to skip waiting (used on first install of v3).
self.addEventListener("message", (event) => {
  if (event.data === "skipWaiting") self.skipWaiting();
});
