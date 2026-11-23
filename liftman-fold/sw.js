// Service worker: gjør at appen åpner og kan fylles ut uten nett.
// Øk VERSION når appen endres, så telefonene henter den nye versjonen.
const VERSION = 'lmf-service-v1';
const SHELL = ['./', 'index.html', 'app.js', 'config.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];
const LIBS = [
  'https://cdn.jsdelivr.net/npm/@azure/msal-browser@2.38.3/lib/msal-browser.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL.concat(LIBS))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Innlogging og SharePoint skal alltid gå direkte på nett
  if (/login\.microsoftonline\.com|graph\.microsoft\.com/.test(url.host)) return;
  const isLib = LIBS.includes(req.url);
  if (url.origin !== location.origin && !isLib) return;
  if (isLib) {
    e.respondWith(caches.match(req).then(r => r || fetch(req)));
    return;
  }
  // Egne filer: prøv nett først (ny versjon), ellers lagret kopi
  e.respondWith(
    fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('index.html')))
  );
});
