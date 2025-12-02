// Service Worker for Edge TTS PWA
const CACHE_NAME = 'edge-tts-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/icon-192.png',
    '/icon-512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache.map(url => {
                    // Try to add each URL, but don't fail if some are missing
                    return cache.add(url).catch(err => {
                        console.log('Failed to cache:', url, err);
                    });
                }));
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip API requests - always go to network
    if (request.url.includes('/api/')) {
        event.respondWith(
            fetch(request)
                .catch(() => {
                    return new Response(
                        JSON.stringify({ error: 'Network unavailable' }),
                        {
                            status: 503,
                            headers: { 'Content-Type': 'application/json' }
                        }
                    );
                })
        );
        return;
    }

    // Cache-first strategy for static assets
    event.respondWith(
        caches.match(request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // Clone the request
                const fetchRequest = request.clone();

                return fetch(fetchRequest).then((response) => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    // Cache the new resource
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(request, responseToCache);
                        });

                    return response;
                });
            })
            .catch(() => {
                // Return offline page or error
                return new Response('Offline', {
                    status: 503,
                    statusText: 'Service Unavailable'
                });
            })
    );
});

// Background sync for offline TTS generation (future enhancement)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-tts') {
        event.waitUntil(syncTTS());
    }
});

async function syncTTS() {
    // Placeholder for future offline TTS queue functionality
    console.log('Syncing pending TTS requests...');
}

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
    const data = event.data.json();

    const options = {
        body: data.body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        vibrate: [200, 100, 200]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow('/')
    );
});
