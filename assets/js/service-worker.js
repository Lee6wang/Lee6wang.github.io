---
permalink: /sw.min.js
---
/* Locale-scoped replacement for Chirpy's origin-wide cache cleanup. */
'use strict';
importScripts('./assets/js/data/swconf.js');

const cachePrefix = 'haitao-{{ site.locale }}-';
const cacheName = cachePrefix + (swconf.cacheName || 'disabled');
const scope = new URL(self.registration.scope);

function canCache(request) {
  const url = new URL(request.url);
  return !swconf.purge && request.method === 'GET' &&
    url.origin === scope.origin && url.pathname.startsWith(scope.pathname) &&
    !(scope.pathname === '/' && url.pathname.startsWith('/zh/')) &&
    !swconf.interceptor.paths.some((path) => url.pathname.startsWith(path)) &&
    !swconf.interceptor.urlPrefixes.some((prefix) => url.href.startsWith(prefix));
}

self.addEventListener('install', (event) => {
  if (!swconf.purge) {
    event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(swconf.resources)));
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((names) => Promise.all(names.map((name) => {
    const obsolete = name.startsWith(cachePrefix) && (swconf.purge || name !== cacheName);
    const legacy = scope.pathname === '/' && /^chirpy-\d+$/.test(name);
    return obsolete || legacy ? caches.delete(name) : Promise.resolve(false);
  }))));
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  if (event.request.headers.has('range') || !canCache(event.request)) return;
  event.respondWith(caches.open(cacheName).then(async (cache) => {
    const cached = await cache.match(event.request);
    if (cached) return cached;
    const response = await fetch(event.request);
    if (response.ok) {
      event.waitUntil(cache.put(event.request, response.clone()));
    }
    return response;
  }));
});
