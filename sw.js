// cache-first so the app works offline once opened
const C = "wsc-review-run2";
const FILES = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "icons/favicon-32.png"];
const M = "wsc-music-1"; // songs survive app updates
const V = "wsc-voice-1"; // recorded Q&A, cached as heard
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(C).then(c => c.addAll(FILES))); });
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C && k !== M && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (e.request.url.indexOf("/voice/") >= 0) { e.respondWith(caches.open(V).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.status === 200) c.put(e.request, r.clone()); return r; })))); return; }
  if (e.request.url.indexOf("/music/") >= 0) { e.respondWith(caches.open(M).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; })))); return; }
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(C).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request, {ignoreSearch: true})));
});
