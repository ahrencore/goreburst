/* Gore Burst — conservative update worker, v2026.11.08.1.
   This worker intentionally DOES NOT cache code, player data, or images.
   Requires internet. Update worker version when changing its behavior. */
self.addEventListener('install', () => { /* Wait for existing app sessions. */ });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
self.addEventListener('message', event => {
  if(event.data && event.data.type === 'GB_ACTIVATE_UPDATE') self.skipWaiting();
});
