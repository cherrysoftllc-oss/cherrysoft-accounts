/* CherrySoft offline helper. Online: always fetches the newest page first.
   Offline or on a weak signal: serves the last saved copy. Never touches Google Drive/sign-in calls. */
const V = "cherrysoft-sw-v2";
const LIBS = [
  "https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.1.11"
];
const key = u => { const x = new URL(u, self.location); return x.origin + x.pathname; };
self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil((async () => {
    const c = await caches.open(V);
    await Promise.allSettled([
      fetch("./", { cache: "reload" }).then(r => { if (r.ok) return c.put(key("./"), r); }),
      ...LIBS.map(u => fetch(u, { mode: "cors" }).then(r => { if (r.ok) return c.put(u, r); }))
    ]);
  })());
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== V).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  const h = u.hostname;
  if (h.endsWith("googleapis.com") || h.endsWith("google.com") || h.endsWith("gstatic.com") || h.endsWith("googleusercontent.com")) return;
  if (u.origin === self.location.origin) {
    e.respondWith((async () => {
      const c = await caches.open(V);
      const k = key(r.url);
      const fromCache = async () => (await c.match(k)) || (r.mode === "navigate" ? (await c.match(key("./"))) : undefined);
      try {
        const net = await Promise.race([
          fetch(r),
          new Promise((_, rej) => setTimeout(() => rej(new Error("slow")), 6000))
        ]);
        if (net && net.ok && !u.search) c.put(k, net.clone());
        else if (net && net.ok && r.mode === "navigate") c.put(k, net.clone());
        return net;
      } catch (err) {
        const hit = await fromCache();
        if (hit) return hit;
        return fetch(r);
      }
    })());
  } else if (h === "cdnjs.cloudflare.com" || h === "cdn.jsdelivr.net" || h === "fonts.googleapis.com") {
    e.respondWith((async () => {
      const c = await caches.open(V);
      const hit = await c.match(r.url);
      if (hit) return hit;
      const net = await fetch(r);
      if (net && (net.ok || net.type === "opaque")) c.put(r.url, net.clone());
      return net;
    })());
  }
});
