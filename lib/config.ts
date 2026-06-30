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

  // Comic / Manga (Sankavollerei)
  COMIC_LATEST: (page = 1) => `/comic/terbaru?page=${page}`,
  COMIC_POPULAR: (page = 1) => `/comic/populer?page=${page}`,
  COMIC_SEARCH: (q: string, page = 1) => `/comic/search?q=${encodeURIComponent(q)}&page=${page}`,
  COMIC_DETAIL: (slug: string) => `/comic/comic/${slug}`,
  COMIC_CHAPTER: (slug: string) => `/comic/chapter/${slug}`,
  COMIC_UNLIMITED: (page = 1) => `/comic/unlimited?page=${page}`,
} as const
