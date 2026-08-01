// ─── KIRA API CONFIG ─────────────────────────────────────────
// Sumber: sankavollerei.web.id/anime/animasu

export const CONFIG = {
  // Anime API (Sankavollerei)
  ANIME_API: 'https://www.sankavollerei.web.id/anime/animasu',
  
  // MAL API (MyAnimeList)
  MAL_API: 'https://api.myanimelist.net/v2',
  MAL_CLIENT_ID: process.env.NEXT_PUBLIC_MAL_CLIENT_ID || '',
  
  // Jikan API (Alternative MAL)
  JIKAN_API: 'https://api.jikan.moe/v4',
  
  // Firebase Config
  FIREBASE: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || '',
  },
} as const

// API Endpoints
export const ENDPOINTS = {
  // Anime
  HOME: (page = 1) => `/home?page=${page}`,
  POPULAR: (page = 1) => `/popular?page=${page}`,
  MOVIES: (page = 1) => `/movies?page=${page}`,
  ONGOING: (page = 1) => `/ongoing?page=${page}`,
  COMPLETED: (page = 1) => `/completed?page=${page}`,
  LATEST: (page = 1) => `/latest?page=${page}`,
  SEARCH: (keyword: string, page = 1) => `/search/${encodeURIComponent(keyword)}?page=${page}`,
  ANIMELIST: (letter: string, page = 1) => `/animelist?letter=${letter}&page=${page}`,
  ADV_SEARCH: (params: Record<string, string>) => `/advanced-search?${new URLSearchParams(params)}`,
  GENRES: '/genres',
  GENRE: (slug: string, page = 1) => `/genre/${slug}?page=${page}`,
  CHARACTERS: '/characters',
  CHARACTER: (slug: string, page = 1) => `/character/${slug}?page=${page}`,
  SCHEDULE: '/schedule',
  DETAIL: (slug: string) => `/detail/${slug}`,
  EPISODE: (slug: string) => `/episode/${slug}`,
  
  // Jikan (MAL Alternative - Free, No Auth)
  JIKAN_SEASON: (year: number, season: string) => `/seasons/${year}/${season}`,
  JIKAN_TOP: (filter = 'airing') => `/top/anime?filter=${filter}`,
  JIKAN_SEARCH: (query: string) => `/anime?q=${encodeURIComponent(query)}&limit=10`,
  JIKAN_DETAIL: (malId: number) => `/anime/${malId}/full`,

  // Comic / Manga (animasu-api — scraper Komiku.org, lihat "Available Endpoints Comic")
  COMIC_LATEST: (page = 1) => `/comic/terbaru?page=${page}`,
  COMIC_POPULAR: (page = 1) => `/comic/populer?page=${page}`,
  COMIC_TRENDING: (page = 1) => `/comic/trending?page=${page}`,
  COMIC_SEARCH: (q: string, page = 1) => `/comic/search?q=${encodeURIComponent(q)}&page=${page}`,
  COMIC_DETAIL: (slug: string) => `/comic/comic/${encodeURIComponent(slug)}`,
  COMIC_CHAPTER: (slug: string) => `/comic/chapter/${encodeURIComponent(slug)}`,
  COMIC_CHAPTER_NAV: (slug: string) => `/comic/chapter/${encodeURIComponent(slug)}/navigation`,
  COMIC_GENRES: '/comic/genres',
  COMIC_GENRE: (slug: string, page = 1) => `/comic/genre/${encodeURIComponent(slug)}?page=${page}`,
  COMIC_TYPE: (type: string, page = 1) => `/comic/type/${encodeURIComponent(type)}?page=${page}`,
  COMIC_UNLIMITED: (page = 1) => `/comic/unlimited?page=${page}`,
  COMIC_HOMEPAGE: '/comic/homepage',
  COMIC_RANDOM: '/comic/random',
  COMIC_RECOMMENDATIONS: (page = 1) => `/comic/recommendations?page=${page}`,
  COMIC_BROWSE: (params: Record<string, string>) => `/comic/browse?${new URLSearchParams(params)}`,
  COMIC_SCROLL: (offset = 0) => `/comic/scroll?offset=${offset}`,
  COMIC_INFINITE: (page = 1, type = 'latest') => `/comic/infinite?page=${page}&type=${type}`,
  COMIC_ADVANCED_SEARCH: (params: Record<string, string>) => `/comic/advanced-search?${new URLSearchParams(params)}`,
  COMIC_COLORED: (page = 1) => `/comic/berwarna/${page}`,
  COMIC_LIBRARY: (page = 1) => `/comic/pustaka/${page}`,

  // Novel (Sankavollerei — lihat dokumentasi sankavollerei.web.id/comic bagian "Novel")
  // Novel (Sankavollerei — sumber SakuraNovel, lihat dokumentasi sankavollerei.web.id/novel/sakuranovel)
  // Novel (Sankavollerei — versi awal, novelId based, lihat dokumentasi sankavollerei.web.id/comic bagian "Novel")
  // Novel (SakuraNovel lewat Sankavollerei — sumber konten/katalog utama)
  NOVEL_HOME: (page = 1) => `/novel/sakuranovel/home${page > 1 ? `?page=${page}` : ''}`,
  NOVEL_SEARCH: (q: string, page = 1) => `/novel/sakuranovel/search?q=${encodeURIComponent(q)}${page > 1 ? `&page=${page}` : ''}`,
  NOVEL_DETAIL: (slug: string) => `/novel/sakuranovel/detail/${encodeURIComponent(slug)}`,
  NOVEL_READ: (slug: string) => `/novel/sakuranovel/read/${encodeURIComponent(slug)}`,
  NOVEL_GENRES: '/novel/sakuranovel/genres',
  NOVEL_GENRE: (slug: string, page = 1) => `/novel/sakuranovel/genre/${encodeURIComponent(slug)}${page > 1 ? `?page=${page}` : ''}`,
  NOVEL_TAGS: '/novel/sakuranovel/tags',
  NOVEL_TAG: (slug: string, page = 1) => `/novel/sakuranovel/tag/${encodeURIComponent(slug)}${page > 1 ? `?page=${page}` : ''}`,
  NOVEL_DAFTAR: '/novel/sakuranovel/daftar-novel',
  NOVEL_ADVANCED_SEARCH: (params: Record<string, string>) => `/novel/sakuranovel/advanced-search?${new URLSearchParams(params)}`,

  // Novel (Sankavollerei versi lama, novelId based — DIPAKE KHUSUS buat nyari cover gambar
  // dari nacdn.novelhubapp.com berdasarkan judul, karena poster SakuraNovel keblokir)
  NOVEL_COVER_SEARCH: (title: string) => `/novel/search?q=${encodeURIComponent(title)}`,
} as const
