const V = 'homeocare-v9';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png'];
const CDN = [
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap'
];
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(V);
    for (const u of CORE) { try { await c.add(u); } catch {} }
    for (const u of CDN) {
      try {
        const r = await fetch(u); await c.put(u, r.clone());
        if (/css/.test(u)) {
          const t = await r.text();
          for (const m of t.matchAll(/url\(["']?([^)"']+)["']?\)/g)) {
            if (/^data:/.test(m[1])) continue;
            try { await c.add(new URL(m[1], u).href); } catch {}
          }
        }
      } catch {}
    }
    self.skipWaiting();
  })());
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const q = e.request; if (q.method !== 'GET') return;
  if (q.mode === 'navigate') {
    e.respondWith(fetch(q).then(r => { const k = r.clone(); caches.open(V).then(c => c.put('index.html', k)); return r; })
      .catch(() => caches.match('index.html').then(r => r || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(q).then(h => h || fetch(q).then(r => {
    if (r && (r.ok || r.type === 'opaque')) { const k = r.clone(); caches.open(V).then(c => c.put(q, k)); }
    return r;
  })));
});
