const CACHE_NAME = 'haishin-box-cache-v2'

const INDEX_URL = new URL(
  'index.html',
  self.registration.scope,
).toString()

const STATIC_PATHS = [
  './',
  'manifest.webmanifest',
  'app-icon.svg',
  'apple-touch-icon.png',
  'favicon-64x64.png',
  'maskable-icon-512x512.png',
  'pwa-192x192.png',
  'pwa-512x512.png',
]

function createScopedUrl(path) {
  return new URL(path, self.registration.scope).toString()
}

async function precacheAppShell() {
  const cache = await caches.open(CACHE_NAME)

  const indexResponse = await fetch(INDEX_URL, {
    cache: 'reload',
  })

  if (!indexResponse.ok) {
    throw new Error('index.html을 불러올 수 없습니다.')
  }

  const indexHtml = await indexResponse.clone().text()

  const discoveredAssetUrls = [
    ...indexHtml.matchAll(/(?:src|href)="([^"]+)"/g),
  ]
    .map((match) => new URL(match[1], INDEX_URL))
    .filter((url) => url.origin === self.location.origin)
    .map((url) => url.toString())

  const urlsToCache = new Set([
    ...STATIC_PATHS.map(createScopedUrl),
    ...discoveredAssetUrls,
  ])

  await cache.put(INDEX_URL, indexResponse)

  urlsToCache.delete(INDEX_URL)

  await cache.addAll([...urlsToCache])
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      await precacheAppShell()
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys()

      await Promise.all(
        cacheNames
          .filter(
            (cacheName) =>
              cacheName.startsWith('haishin-box-cache-') &&
              cacheName !== CACHE_NAME,
          )
          .map((cacheName) => caches.delete(cacheName)),
      )

      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request

  if (request.method !== 'GET') {
    return
  }

  const requestUrl = new URL(request.url)

  if (requestUrl.origin !== self.location.origin) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request))
    return
  }

  event.respondWith(handleAssetRequest(request))
})

async function handleNavigationRequest(request) {
  const cache = await caches.open(CACHE_NAME)

  try {
    const networkResponse = await fetch(request, {
      cache: 'reload',
    })

    if (networkResponse.ok) {
      await cache.put(
        INDEX_URL,
        networkResponse.clone(),
      )
    }

    return networkResponse
  } catch {
    const cachedPage =
      (await cache.match(request)) ??
      (await cache.match(INDEX_URL))

    return cachedPage ?? Response.error()
  }
}

async function handleAssetRequest(request) {
  const cache = await caches.open(CACHE_NAME)
  const cachedResponse = await cache.match(request)

  if (cachedResponse !== undefined) {
    return cachedResponse
  }

  try {
    const networkResponse = await fetch(request)

    if (networkResponse.ok) {
      await cache.put(
        request,
        networkResponse.clone(),
      )
    }

    return networkResponse
  } catch {
    return Response.error()
  }
}