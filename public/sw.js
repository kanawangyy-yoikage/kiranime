// KiraNime Service Worker
// Strategi:
// - Navigasi (HTML): network-first, fallback ke halaman /offline saat gagal
// - Aset statis Next.js (_next/static, gambar ikon, dsb): stale-while-revalidate
// - Gambar dari luar (poster, thumbnail): cache-first dengan limit umur
// - API (/api/*) & endpoint eksternal: network-only (data harus selalu segar)

const VERSION = 'v1'
const SHELL_CACHE = `kiranime-shell-${VERSION}`
const STATIC_CACHE = `kiranime-static-${VERSION}`
const IMAGE_CACHE = `kiranime-images-${VERSION}`

const OFFLINE_URL = '/offline'

const SHELL_ASSETS = [
  OFFLINE_URL,
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => ![SHELL_CACHE, STATIC_CACHE, IMAGE_CACHE].includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

function isApiRequest(url) {
  return url.pathname.startsWith('/api/')
}

function isImageRequest(request, url) {
  return request.destination === 'image' || /\.(png|jpe?g|webp|gif|svg|avif)$/i.test(url.pathname)
}

function isNextStaticAsset(url) {
  return url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/icons/')
}

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request)
    const cache = await caches.open(SHELL_CACHE)
    cache.put(request, response.clone())
    return response
  } catch (err) {
    const cache = await caches.open(SHELL_CACHE)
    const cached = await cache.match(request)
    return cached || (await cache.match(OFFLINE_URL))
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => cached)
  return cached || fetchPromise
}

async function cacheFirstImage(request) {
  const cache = await caches.open(IMAGE_CACHE)
  const cached = await cache.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response && response.status === 200) {
      cache.put(request, response.clone())
    }
    return response
  } catch (err) {
    return cached
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Hanya tangani origin sendiri untuk navigasi & aset Next; gambar eksternal tetap boleh di-cache
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request))
    return
  }

  if (url.origin === self.location.origin && isApiRequest(url)) {
    // Biarkan lewat langsung ke network, data anime harus selalu terbaru
    return
  }

  if (url.origin === self.location.origin && isNextStaticAsset(url)) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE))
    return
  }

  if (isImageRequest(request, url)) {
    event.respondWith(cacheFirstImage(request))
    return
  }
})
