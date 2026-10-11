/// <reference lib="webworker" />
import {clientsClaim} from 'workbox-core';
import {cleanupOutdatedCaches, matchPrecache, precacheAndRoute, PrecacheEntry} from 'workbox-precaching';
import {registerRoute} from 'workbox-routing';

declare const self: ServiceWorkerGlobalScope & {__WB_MANIFEST: PrecacheEntry[]};

// Only build-time static assets are cached. There is no API or authentication cache.
precacheAndRoute(self.__WB_MANIFEST, {ignoreURLParametersMatching: []});
cleanupOutdatedCaches();
clientsClaim();

// Fetch real pages, including hosted login redirects, before considering the offline page.
// Never serve the SPA shell for /auth, /start, /logout, or OAuth navigation.
registerRoute(({request}) => request.mode === 'navigate', async ({request}) => {
    try {
        return await fetch(request);
    } catch {
        return await matchPrecache('/offline.html') ?? Response.error();
    }
});

// A waiting update only takes control when the user chooses Reload.
self.addEventListener('message', event => {
    if (event.data?.type === 'SKIP_WAITING') void self.skipWaiting();
});
