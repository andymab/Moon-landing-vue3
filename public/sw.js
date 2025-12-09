self.addEventListener('install', (e) => {
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  clients.claim();
});
self.addEventListener('fetch', (e) => {
  // very small, permissive SW — let vite-plugin-pwa handle production SW
  // This minimal handler will try network then fallback to cache if available.
});
