import axios, { AxiosInstance } from 'axios'
import { CONFIG, ENDPOINTS } from './config'

// ─── API CLIENTS ─────────────────────────────────────────────

// Anime API Client (Sankavollerei)
const animeClient: AxiosInstance = axios.create({
  baseURL: CONFIG.ANIME_API,
  timeout: 15000,
  headers: {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept-Language': 'en-US,en;q=0.9,id;q=0.8',
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
