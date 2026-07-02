import axios, { AxiosInstance } from 'axios'
import { CONFIG, ENDPOINTS } from './config'

// ─── API CLIENTS ─────────────────────────────────────────────

// Anime API Client (Sankavollerei)
const animeClient: AxiosInstance = axios.create({
  baseURL: CONFIG.ANIME_API,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
  },
})

// Jikan API Client (MAL Alternative - Free)
const jikanClient: AxiosInstance = axios.create({
  baseURL: CONFIG.JIKAN_API,
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
  },
})

// ─── TYPES ───────────────────────────────────────────────────

export interface Anime {
  title: string
  slug: string
  image: string
  score?: string
  episode?: string
  type?: string
  status?: string
  genres?: string[]
  release?: string
}

export interface AnimeDetail {
  title: string
  image: string
  description: string
  info: {
    japanese?: string
    type?: string
    status?: string
    total_episode?: string | number
    score?: string
    duration?: string
    season?: string
    released?: string
    producer?: string
    studio?: string
    genre?: string
  }
  genres: string[]
  episodes: Episode[]
  batchSlug?: string
}

export interface Episode {
  title: string
  slug: string
  date?: string
}

export interface StreamData {
  title: string
  streams: { server: string; url: string }[]
  downloads: DownloadLink[]
}

export interface DownloadLink {
  resolution: string
  format: string
  links: { host: string; url: string }[]
}

export interface MALAnime {
  mal_id: number
  title: string
  images: { jpg: { image_url: string; large_image_url: string } }
  score?: number
  scored_by?: number
  rank?: number
  popularity?: number
  episodes?: number
  status?: string
  synopsis?: string
  genres?: { mal_id: number; name: string }[]
  studios?: { mal_id: number; name: string }[]
}

// ─── ANIME API FUNCTIONS ─────────────────────────────────────

export async function fetchHome(page = 1): Promise<Anime[]> {
  try {
    const { data } = await animeClient.get(ENDPOINTS.HOME(page))
    return extractAnimes(data)
  } catch {
    return []
  }
}

export async function fetchLatest(page = 1): Promise<Anime[]> {
  try {
    const { data } = await animeClient.get(ENDPOINTS.LATEST(page))
    return extractAnimes(data)
  } catch {
    return []
  }
}

export async function fetchPopular(page = 1): Promise<Anime[]> {
  try {
    const { data } = await animeClient.get(ENDPOINTS.POPULAR(page))
    return extractAnimes(data)
  } catch {
    return []
  }
}

export async function fetchMovies(page = 1): Promise<Anime[]> {
  try {
    const { data } = await animeClient.get(ENDPOINTS.MOVIES(page))
    return extractAnimes(data)
  } catch {
    return []
  }
}

export async function fetchOngoing(page = 1): Promise<Anime[]> {
  try {
    const { data } = await animeClient.get(ENDPOINTS.ONGOING(page))
    return extractAnimes(data)
  } catch {
    return []
  }
}

export async function fetchCompleted(page = 1): Promise<Anime[]> {
  try {
    const { data } = await animeClient.get(ENDPOINTS.COMPLETED(page))
    return extractAnimes(data)
  } catch {
    return []
  }
}

export async function searchAnime(keyword: string, page = 1): Promise<Anime[]> {
  if (!keyword.trim()) return []
  try {
    const { data } = await animeClient.get(ENDPOINTS.SEARCH(keyword, page))
    return extractAnimes(data)
  } catch {
    return []
  }
}

export async function fetchGenres(): Promise<{ name: string; slug: string }[]> {
  try {
    const { data } = await animeClient.get(ENDPOINTS.GENRES)
    const list = Array.isArray(data) ? data : (data.data || data.genres || [])
    return list.map((g: any) => ({
      name: g.name || g.genre || g.title || g.slug || '',
      slug: g.slug || (g.name || '').toLowerCase().replace(/\s+/g, '-'),
    })).filter((g: any) => g.name)
  } catch {
    return []
  }
}

export async function fetchByGenre(slug: string, page = 1): Promise<Anime[]> {
  try {
    const { data } = await animeClient.get(ENDPOINTS.GENRE(slug, page))
    return extractAnimes(data)
  } catch {
    return []
  }
}

export async function fetchAnimeList(letter: string, page = 1): Promise<Anime[]> {
  try {
    const { data } = await animeClient.get(ENDPOINTS.ANIMELIST(letter, page))
    return extractAnimes(data)
  } catch {
    return []
  }
}

export async function fetchSchedule(): Promise<Record<string, Anime[]>> {
  try {
    const { data } = await animeClient.get(ENDPOINTS.SCHEDULE)
    return data.schedule || data.data || {}
  } catch {
    return {}
  }
}

export async function fetchDetail(slug: string): Promise<AnimeDetail | null> {
  try {
    const { data } = await animeClient.get(ENDPOINTS.DETAIL(slug))
    const d = data.detail || data.data || data
    
    const episodes = (d.episodes || []).map((ep: any) => ({
      title: ep.name || ep.title || '',
      slug: ep.slug || cleanSlug(ep.href || ep.url || ''),
      date: ep.date || '',
    }))
    
    const genres = (d.genres || []).map((g: any) =>
      typeof g === 'object' ? g.name || '' : g
    ).filter(Boolean)
    
    return {
      title: d.title || '',
      image: d.poster || d.image || '',
      description: d.synopsis || d.description || '',
      info: {
        japanese: d.synonym || d.japanese || '',
        type: d.type || 'TV',
        status: d.status || 'Ongoing',
        total_episode: d.totalEpisode || episodes.length || '?',
        score: d.score || d.rating || 'N/A',
        duration: d.duration || '?',
        season: d.season || '',
        released: d.aired || d.releaseDate || '',
        producer: d.author || d.producer || '',
        studio: d.studio || '',
        genre: genres.join(', '),
      },
      genres,
      episodes,
      batchSlug: d.batch?.slug || cleanSlug(d.batch?.href || ''),
    }
  } catch {
    return null
  }
}

export async function fetchEpisode(slug: string): Promise<StreamData | null> {
  try {
    const { data } = await animeClient.get(ENDPOINTS.EPISODE(slug))
    const d = data.data || data
    
    const streams = (d.streams || []).map((s: any) => ({
      server: s.name || s.server || 'Server',
      url: s.url || s.embedUrl || '',
    })).filter((s: any) => s.url)
    
    const downloads: DownloadLink[] = []
    const dlRaw = d.downloadUrl || d.downloads || []
    
    if (Array.isArray(dlRaw)) {
      dlRaw.forEach((group: any) => {
        (group.qualities || []).forEach((q: any) => {
          downloads.push({
            resolution: q.title || q.resolution || '',
            format: group.title || '',
            links: (q.urls || []).map((l: any) => ({
              host: l.title || '',
              url: l.url || '',
            })),
          })
        })
      })
    }
    
    return {
      title: d.title || data.title || '',
      streams,
      downloads,
    }
  } catch {
    return null
  }
}

// ─── JIKAN API FUNCTIONS (MAL Alternative) ───────────────────

export async function fetchMALSeason(year?: number, season?: string): Promise<MALAnime[]> {
  const now = new Date()
  const y = year || now.getFullYear()
  const m = now.getMonth() + 1
  const s = season || (m >= 10 ? 'fall' : m >= 7 ? 'summer' : m >= 4 ? 'spring' : 'winter')
  
  try {
    const { data } = await jikanClient.get(ENDPOINTS.JIKAN_SEASON(y, s))
    return (data.data || []).slice(0, 25)
  } catch {
    return []
  }
}

export async function fetchMALTop(filter = 'airing'): Promise<MALAnime[]> {
  try {
    const { data } = await jikanClient.get(ENDPOINTS.JIKAN_TOP(filter))
    return (data.data || []).slice(0, 20)
  } catch {
    return []
  }
}

export async function fetchMALDetail(malId: number): Promise<MALAnime | null> {
  try {
    const { data } = await jikanClient.get(ENDPOINTS.JIKAN_DETAIL(malId))
    return data.data || null
  } catch {
    return null
  }
}

export async function searchMAL(query: string): Promise<MALAnime[]> {
  if (!query.trim()) return []
  try {
    const { data } = await jikanClient.get(ENDPOINTS.JIKAN_SEARCH(query))
    return data.data || []
  } catch {
    return []
  }
}

// ─── HELPERS ─────────────────────────────────────────────────

// ─── COMIC / MANGA TYPES ─────────────────────────────────────

export interface Comic {
  title: string
  slug: string
  image: string
  chapter?: string
  score?: string
  type?: string
  status?: string
}

export interface ComicDetail {
  title: string
  image: string
  description: string
  status?: string
  author?: string
  artist?: string
  released?: string
  type?: string
  genres: string[]
  chapters: ComicChapter[]
}

export interface ComicChapter {
  title: string
  slug: string
  date?: string
}

export interface ChapterPages {
  title: string
  pages: string[]
}

// ─── COMIC / MANGA API FUNCTIONS ─────────────────────────────

const comicClient: AxiosInstance = axios.create({
  baseURL: 'https://www.sankavollerei.web.id',
  timeout: 15000,
  headers: { 'Accept': 'application/json' },
})

function extractComics(raw: any): Comic[] {
  const arr =
    raw?.komikList ||
    raw?.komiklist ||
    raw?.results ||
    raw?.comics ||
    raw?.data?.komikList ||
    raw?.data?.comics ||
    raw?.data ||
    (Array.isArray(raw) ? raw : [])
  if (!Array.isArray(arr)) return []
  return arr.map((item: any) => ({
    title: item.title || item.name || '',
    slug: item.slug || cleanSlug(item.link || item.href || item.url || ''),
    image: item.poster || item.image || item.thumbnail || item.cover || '',
    chapter: item.chapter || item.latestChapter || '',
    score: item.score || item.rating || '',
    type: item.type || 'Manga',
    status: item.status || '',
  }))
}

export async function fetchComicLatest(page = 1): Promise<Comic[]> {
  try {
    const { data } = await comicClient.get(ENDPOINTS.COMIC_LATEST(page))
    return extractComics(data)
  } catch { return [] }
}

export async function fetchComicPopular(page = 1): Promise<Comic[]> {
  try {
    const { data } = await comicClient.get(ENDPOINTS.COMIC_POPULAR(page))
    return extractComics(data)
  } catch { return [] }
}

export async function fetchComicAll(page = 1): Promise<Comic[]> {
  try {
    const { data } = await comicClient.get(ENDPOINTS.COMIC_UNLIMITED(page))
    return extractComics(data)
  } catch { return [] }
}

export async function searchComic(keyword: string, page = 1): Promise<Comic[]> {
  if (!keyword.trim()) return []
  try {
    const { data } = await comicClient.get(ENDPOINTS.COMIC_SEARCH(keyword, page))
    return extractComics(data)
  } catch { return [] }
}

export async function fetchComicDetail(slug: string): Promise<ComicDetail | null> {
  try {
    const { data } = await comicClient.get(ENDPOINTS.COMIC_DETAIL(slug))
    const d = data.detail || data.data || data
    const chapters = (d.chapters || d.chapterList || []).map((ch: any) => ({
      title: ch.title || ch.name || ch.chapter || '',
      slug: ch.slug || cleanSlug(ch.href || ch.url || ''),
      date: ch.date || ch.updatedAt || '',
    }))
    return {
      title: d.title || '',
      image: d.poster || d.image || d.thumbnail || '',
      description: d.synopsis || d.description || '',
      status: d.status || '',
      author: d.author || '',
      artist: d.artist || '',
      released: d.released || d.year || '',
      type: d.type || 'Manga',
      genres: (d.genres || d.genreList || []).map((g: any) => typeof g === 'object' ? g.name || '' : g).filter(Boolean),
      chapters,
    }
  } catch { return null }
}

export async function fetchChapterPages(chapterSlug: string): Promise<ChapterPages | null> {
  try {
    const { data } = await comicClient.get(ENDPOINTS.COMIC_CHAPTER(chapterSlug))
    const d = data.data || data
    const rawPages = d.images || d.pages || d.imagesUrl || (Array.isArray(d) ? d : [])
    // Beberapa response ngasih array of object ({url, src, image}) bukan array of string
    const pages: string[] = (Array.isArray(rawPages) ? rawPages : [])
      .map((p: any) => (typeof p === 'string' ? p : p?.url || p?.src || p?.image || ''))
      .filter(Boolean)
    return {
      title: d.title || d.chapter || '',
      pages,
    }
  } catch { return null }
}

// ─── HELPERS ─────────────────────────────────────────────────

function extractAnimes(raw: any): Anime[] {
  const arr = raw.animes || raw.animeList || raw.data?.animes || raw.data?.animeList || raw.data || (Array.isArray(raw) ? raw : [])
  
  if (!Array.isArray(arr)) return []
  
  return arr.map((item: any) => ({
    title: item.title || '',
    slug: item.slug || cleanSlug(item.href || item.url || ''),
    image: item.poster || item.image || '',
    score: item.score || item.rating || '',
    episode: item.episode != null ? String(item.episode) : '',
    type: item.type || '',
    status: item.status || '',
    genres: Array.isArray(item.genres) ? item.genres : [],
    release: item.release_day || item.releaseDay || '',
  }))
}

function cleanSlug(raw = ''): string {
  return String(raw)
    .replace(/^https?:\/\/[^/]+/, '')
    .replace(/\/$/, '')
    .split('/')
    .filter(Boolean)
    .pop() || String(raw)
}

// ─── FIRESTORE REST API (Base64 Trick for Free Tier) ─────────

const FIRESTORE_BASE = `https://firestore.googleapis.com/v1/projects/${CONFIG.FIREBASE.projectId}/databases/(default)/documents`

// Encode URL to Firestore document key (base64 trick)
export function urlToKey(url: string): string {
  return encodeURIComponent(url).replace(/\./g, '%2E')
}

// Firestore REST helpers
export async function fsGet(collection: string, id: string): Promise<any> {
  if (!CONFIG.FIREBASE.projectId) return null
  try {
    const { data } = await axios.get(`${FIRESTORE_BASE}/${collection}/${id}?key=${CONFIG.FIREBASE.apiKey}`)
    return fromFirestoreDoc(data)
  } catch {
    return null
  }
}

export async function fsSet(collection: string, id: string, docData: any): Promise<boolean> {
  if (!CONFIG.FIREBASE.projectId) return false
  try {
    await axios.patch(
      `${FIRESTORE_BASE}/${collection}/${id}?key=${CONFIG.FIREBASE.apiKey}`,
      { fields: toFirestoreFields(docData) }
    )
    return true
  } catch {
    return false
  }
}

export async function fsDelete(collection: string, id: string): Promise<boolean> {
  if (!CONFIG.FIREBASE.projectId) return false
  try {
    await axios.delete(`${FIRESTORE_BASE}/${collection}/${id}?key=${CONFIG.FIREBASE.apiKey}`)
    return true
  } catch {
    return false
  }
}

// Firestore value converters
function toFirestoreFields(data: any): any {
  const fields: any = {}
  for (const [k, v] of Object.entries(data)) {
    fields[k] = toFirestoreValue(v)
  }
  return { fields }
}

function toFirestoreValue(val: any): any {
  if (val === null || val === undefined) return { nullValue: null }
  if (typeof val === 'boolean') return { booleanValue: val }
  if (Number.isInteger(val)) return { integerValue: String(val) }
  if (typeof val === 'number') return { doubleValue: val }
  if (Array.isArray(val)) return { arrayValue: { values: val.map(toFirestoreValue) } }
  if (typeof val === 'object') {
    const fields: any = {}
    for (const [k, v] of Object.entries(val)) fields[k] = toFirestoreValue(v)
    return { mapValue: { fields } }
  }
  return { stringValue: String(val) }
}

function fromFirestoreDoc(doc: any): any {
  const name = doc.name || ''
  const id = name.split('/').pop()
  const fields = doc.fields || {}
  const result: any = { id }
  for (const [key, fval] of Object.entries(fields)) {
    result[key] = fromFirestoreValue(fval)
  }
  return result
}

function fromFirestoreValue(fval: any): any {
  if ('stringValue' in fval) return fval.stringValue
  if ('integerValue' in fval) return parseInt(fval.integerValue, 10)
  if ('doubleValue' in fval) return fval.doubleValue
  if ('booleanValue' in fval) return fval.booleanValue
  if ('nullValue' in fval) return null
  if ('timestampValue' in fval) return fval.timestampValue
  if ('arrayValue' in fval) return (fval.arrayValue.values || []).map(fromFirestoreValue)
  if ('mapValue' in fval) {
    const obj: any = {}
    for (const [k, v] of Object.entries(fval.mapValue.fields || {})) obj[k] = fromFirestoreValue(v)
    return obj
  }
  return null
}
