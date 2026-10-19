// CherrySoft Accounts service worker v4.2
// Network-first (always fetches the newest file, bypassing HTTP cache); falls back to cache when offline.
const CACHE = "cherrysoft-4.2";
self.addEventListener("install", e => { self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (!/^https?:$/.test(url.protocol)) return;
  const sameOrigin = url.origin === self.location.origin;
  const cdn = /cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net/.test(url.hostname);
  if (!sameOrigin && !cdn) return; // Google sign-in, APIs etc. untouched
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      const res = await fetch(sameOrigin ? new Request(req, { cache: "no-store" }) : req);
      if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
      return res;
    } catch (err) {
      const hit = await cache.match(req, { ignoreSearch: true });
      if (hit) return hit;
      throw err;
    }
  })());
});
