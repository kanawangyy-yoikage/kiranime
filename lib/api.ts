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

export interface AnimeCharacterType {
  name: string
  slug: string
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

export async function fetchAdvancedSearch(params: Record<string, string>): Promise<Anime[]> {
  try {
    const { data } = await animeClient.get(ENDPOINTS.ADV_SEARCH(params))
    return extractAnimes(data)
  } catch {
    return []
  }
}

export async function fetchCharacters(): Promise<AnimeCharacterType[]> {
  try {
    const { data } = await animeClient.get(ENDPOINTS.CHARACTERS)
    const list = Array.isArray(data) ? data : (data.characters || data.data || [])
    return list
      .map((c: any) => ({
        name: c.name || c.title || c.slug || '',
        slug: c.slug || (c.name || '').toLowerCase().replace(/\s+/g, '-'),
      }))
      .filter((c: AnimeCharacterType) => c.name)
  } catch {
    return []
  }
}

export async function fetchByCharacter(slug: string, page = 1): Promise<Anime[]> {
  try {
    const { data } = await animeClient.get(ENDPOINTS.CHARACTER(slug, page))
    return extractAnimes(data)
  } catch {
    return []
  }
}

export async function fetchSchedule(): Promise<Record<string, Anime[]>> {
  try {
    const { data } = await animeClient.get(ENDPOINTS.SCHEDULE)
    const raw = data.schedule || data.data || data || {}
    // Sebelumnya raw item per hari langsung di-cast ke tipe Anime tanpa normalisasi,
    // padahal field mentahnya beda nama (poster/href dll) — makanya anime.image selalu
    // kosong dan proxy gambar selalu gagal (400 "URL missing"). Disamain pakai extractAnimes
    // biar konsisten sama endpoint lain (latest/popular/dst).
    const result: Record<string, Anime[]> = {}
    for (const day of Object.keys(raw)) {
      result[day] = extractAnimes(raw[day])
    }
    return result
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
    
    const result: AnimeDetail = {
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

    // Deskripsi selalu disinkronkan dari MAL (bahasa Inggris) biar konsisten.
    try {
      const malId = d.mal_id || d.malId || d.malID
      let malSynopsis = ''
      if (malId) {
        const mal = await fetchMALDetail(Number(malId))
        malSynopsis = mal?.synopsis || ''
      } else if (result.title) {
        const hits = await searchMAL(result.title)
        const best = hits[0]
        if (best?.mal_id) {
          const mal = await fetchMALDetail(best.mal_id)
          malSynopsis = mal?.synopsis || best.synopsis || ''
        }
      }
      if (malSynopsis) result.description = malSynopsis
    } catch {
      // tetap pakai sinopsis bawaan kalau MAL gagal
    }

    return result
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
  genres?: string[]
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

export interface ChapterNav {
  prevSlug?: string
  nextSlug?: string
}

export interface ComicGenre {
  name: string
  slug: string
}

// ─── COMIC / MANGA API FUNCTIONS (animasu-api / Komiku.org) ──

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
    raw?.data?.results ||
    raw?.data ||
    (Array.isArray(raw) ? raw : [])
  if (!Array.isArray(arr)) return []
  const chapterOf = (c: any): string =>
    typeof c === 'string' ? c : (c?.title || '')
  return arr.map((item: any) => ({
    title: item.title || item.name || '',
    slug: item.slug || cleanSlug(item.detailUrl || item.link || item.href || item.url || ''),
    image: item.poster || item.image || item.thumbnail || item.cover || '',
    chapter: chapterOf(item.chapter) || chapterOf(item.latestChapter) || chapterOf(item.firstChapter) || '',
    genres: Array.isArray(item.genres || item.genreList)
      ? (item.genres || item.genreList).map((g: any) => (typeof g === 'object' ? g.name || '' : g)).filter(Boolean)
      : (typeof item.genre === 'string' && item.genre ? [item.genre] : []),
    score: item.score || item.rating || item.stats || '',
    type: item.type || 'Manga',
    status: item.status || '',
  }))
}

function extractGenres(raw: any): ComicGenre[] {
  const arr = raw?.genres || raw?.genreList || raw?.data?.genres || raw?.data || (Array.isArray(raw) ? raw : [])
  if (!Array.isArray(arr)) return []
  return arr
    .map((g: any) => (typeof g === 'string' ? { name: g, slug: cleanSlug(g) } : { name: g.name || g.title || '', slug: g.slug || cleanSlug(g.href || g.url || g.name || '') }))
    .filter((g: ComicGenre) => g.name)
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

export async function fetchComicTrending(page = 1): Promise<Comic[]> {
  try {
    const { data } = await comicClient.get(ENDPOINTS.COMIC_TRENDING(page))
    return extractComics(data)
  } catch { return [] }
}

export async function fetchComicAll(page = 1): Promise<Comic[]> {
  try {
    const { data } = await comicClient.get(ENDPOINTS.COMIC_UNLIMITED(page))
    return extractComics(data)
  } catch { return [] }
}

// Filter by type: 'manga' | 'manhwa' | 'manhua'
export async function fetchComicByType(type: string, page = 1): Promise<Comic[]> {
  try {
    const { data } = await comicClient.get(ENDPOINTS.COMIC_TYPE(type, page))
    return extractComics(data)
  } catch { return [] }
}

export async function fetchComicGenres(): Promise<ComicGenre[]> {
  try {
    const { data } = await comicClient.get(ENDPOINTS.COMIC_GENRES)
    return extractGenres(data)
  } catch { return [] }
}

export async function fetchComicByGenre(genreSlug: string, page = 1): Promise<Comic[]> {
  try {
    const { data } = await comicClient.get(ENDPOINTS.COMIC_GENRE(genreSlug, page))
    return extractComics(data)
  } catch { return [] }
}

export async function fetchComicHomepage(): Promise<{ popular: Comic[]; latest: Comic[]; trending: Comic[] }> {
  try {
    const { data } = await comicClient.get(ENDPOINTS.COMIC_HOMEPAGE)
    const d = data.data || data
    return {
      popular: extractComics(d.popular || d.populer || []),
      latest: extractComics(d.latest || d.terbaru || []),
      trending: extractComics(d.trending || []),
    }
  } catch { return { popular: [], latest: [], trending: [] } }
}

export async function fetchComicRandom(): Promise<Comic[]> {
  try {
    const { data } = await comicClient.get(ENDPOINTS.COMIC_RANDOM)
    return extractComics(data)
  } catch { return [] }
}

export async function fetchComicRecommendations(page = 1): Promise<Comic[]> {
  try {
    const { data } = await comicClient.get(ENDPOINTS.COMIC_RECOMMENDATIONS(page))
    return extractComics(data)
  } catch { return [] }
}

// Browse dengan kombinasi filter: type, order (latest/popular/title), genre
export async function fetchComicBrowse(filters: { type?: string; order?: string; genre?: string; page?: number }): Promise<Comic[]> {
  try {
    const params: Record<string, string> = {}
    if (filters.type) params.type = filters.type
    if (filters.order) params.order = filters.order
    if (filters.genre) params.genre = filters.genre
    if (filters.page) params.page = String(filters.page)
    const { data } = await comicClient.get(ENDPOINTS.COMIC_BROWSE(params))
    return extractComics(data)
  } catch { return [] }
}

// Simulasi infinite scroll dengan offset pagination
export async function fetchComicScroll(offset = 0): Promise<Comic[]> {
  try {
    const { data } = await comicClient.get(ENDPOINTS.COMIC_SCROLL(offset))
    return extractComics(data)
  } catch { return [] }
}

// Infinite scroll dengan pagination (default type latest)
export async function fetchComicInfinite(page = 1, type = 'latest'): Promise<Comic[]> {
  try {
    const { data } = await comicClient.get(ENDPOINTS.COMIC_INFINITE(page, type))
    return extractComics(data)
  } catch { return [] }
}

// Pencarian dengan multiple filter (q wajib, plus type/status/genre/year/sort)
export async function fetchComicAdvancedSearch(params: { q: string; type?: string; status?: string; genre?: string; year?: string; sort?: string; page?: number }): Promise<Comic[]> {
  if (!params.q?.trim()) return []
  try {
    const query: Record<string, string> = { q: params.q }
    if (params.type) query.type = params.type
    if (params.status) query.status = params.status
    if (params.genre) query.genre = params.genre
    if (params.year) query.year = params.year
    if (params.sort) query.sort = params.sort
    if (params.page) query.page = String(params.page)
    const { data } = await comicClient.get(ENDPOINTS.COMIC_ADVANCED_SEARCH(query))
    return extractComics(data)
  } catch { return [] }
}

// Daftar komik berwarna (paginasi per halaman)
export async function fetchComicColored(page = 1): Promise<Comic[]> {
  try {
    const { data } = await comicClient.get(ENDPOINTS.COMIC_COLORED(page))
    return extractComics(data)
  } catch { return [] }
}

// Perpustakaan komik (paginasi per halaman)
export async function fetchComicLibrary(page = 1): Promise<Comic[]> {
  try {
    const { data } = await comicClient.get(ENDPOINTS.COMIC_LIBRARY(page))
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
    const chapters = (d.chapters || d.chapterList || []).map((ch: any, idx: number) => {
      const rawTitle =
        ch.title || ch.name || ch.chapter || ch.chapter_title || ch.chapterTitle ||
        ch.judul || ch.label || ch.text ||
        (ch.number ?? ch.chapterNumber ?? ch.chapter_number ?? ch.nomor ?? ch.no)
      return {
        title: rawTitle ? String(rawTitle) : `Chapter ${(d.chapters || d.chapterList).length - idx}`,
        slug: ch.slug || cleanSlug(ch.href || ch.url || ''),
        date: ch.date || ch.updatedAt || ch.releaseDate || ch.uploaded || '',
      }
    })
    return {
      title: d.title || '',
      image: d.poster || d.image || d.thumbnail || d.cover || '',
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

export async function fetchChapterNavigation(chapterSlug: string): Promise<ChapterNav | null> {
  try {
    const { data } = await comicClient.get(ENDPOINTS.COMIC_CHAPTER_NAV(chapterSlug))
    const d = data.data || data
    return {
      prevSlug: d.prev || d.prevChapter || d.previous || d.prevSlug || '',
      nextSlug: d.next || d.nextChapter || d.nextSlug || '',
    }
  } catch { return null }
}

// ─── NOVEL TYPES ─────────────────────────────────────────────

export interface Novel {
  novelId: string
  title: string
  slug: string
  image: string
  type?: string
  latestChapter?: string
  rating?: string
  status?: string
  summary?: string
  genres?: string[]
  tags?: string[]
  totalViews?: string
  totalWords?: string
  language?: string
  novelStatus?: number
}

export interface NovelGenreTag {
  id: string
  name: string
  slug?: string
  count?: string
  cover?: string
}

export interface NovelSection {
  title: string
  novels: Novel[]
}

export interface NovelHomeData {
  sections: NovelSection[]
  genres: NovelGenreTag[]
}

export interface NovelChapterItem {
  chapterId: string
  title: string
  slug: string
  date?: string
}

export interface NovelChaptersData {
  novel: Novel
  chapters: NovelChapterItem[]
}

// ─── NOVEL API FUNCTIONS ──────────────────────────────────────
// REST API novel Sankavollerei (novelId based, konten NovelHub). Cover sudah disertakan
// langsung di response (nacdn.novelhubapp.com), jadi nggak perlu proxy/enrich lagi.

const novelClient: AxiosInstance = axios.create({
  baseURL: 'https://www.sankavollerei.web.id',
  timeout: 15000,
  headers: { 'Accept': 'application/json' },
  // novelId di API ini angkanya > Number.MAX_SAFE_INTEGER (19 digit), kalau di-parse
  // pakai JSON.parse biasa presisinya kepotong. Regex ini nge-ubah nilai numeriknya jadi
  // string biar aman, dan cuma nyentuh key "novelId".
  transformResponse: [(data: any) => {
    if (typeof data !== 'string') return data
    const safe = data.replace(/"novelId":\s*(\d+)/g, '"novelId":"$1"')
    try { return JSON.parse(safe) } catch { return data }
  }],
})

function mapNovel(item: any): Novel {
  const novelId = String(item.novelId ?? '')
  return {
    novelId,
    title: item.title || '',
    slug: novelId,
    image: item.cover?.url || item.thumbnail || item.poster || '',
    type: item.novelStatusDesc || item.type || 'Novel',
    latestChapter: item.totalChapters ? `${item.totalChapters} Chapters` : '',
    rating: item.score || item.rating || '',
    status: item.novelStatusDesc || item.status || '',
    summary: item.summary || item.synopsis || item.description || '',
    genres: Array.isArray(item.genres) ? item.genres.map((g: any) => String(g)) : [],
    tags: Array.isArray(item.tags) ? item.tags.map((g: any) => String(g)) : [],
    totalViews: item.totalViews || '',
    totalWords: item.totalWordsFormat || (item.totalWords ? String(item.totalWords) : ''),
    language: item.language || '',
    novelStatus: item.novelStatus,
  }
}

export async function fetchNovelHome(): Promise<NovelHomeData> {
  try {
    const { data } = await novelClient.get(ENDPOINTS.NOVEL_HOME)
    const items = data?.result?.items
    const sections: NovelSection[] = []
    const genres: NovelGenreTag[] = []
    if (Array.isArray(items)) {
      for (const item of items) {
        if (item?.type === 'GenreList') {
          for (const g of (item.genres || [])) {
            const id = String(g.genreId ?? '')
            if (id) genres.push({ id, name: g.name || '', slug: id, cover: g.cover?.url || '' })
          }
        } else if (Array.isArray(item?.contents)) {
          sections.push({ title: item.title || '', novels: item.contents.map(mapNovel) })
        }
      }
    }
    return { sections, genres }
  } catch { return { sections: [], genres: [] } }
}

export async function fetchNovelHotSearch(): Promise<Novel[]> {
  try {
    const { data } = await novelClient.get(ENDPOINTS.NOVEL_HOT_SEARCH)
    const items = data?.result?.items
    return Array.isArray(items) ? items.map(mapNovel) : []
  } catch { return [] }
}

export async function searchNovel(keyword: string): Promise<Novel[]> {
  if (!keyword.trim()) return []
  try {
    const { data } = await novelClient.get(ENDPOINTS.NOVEL_SEARCH(keyword.trim()))
    const items = data?.result?.items
    return Array.isArray(items) ? items.map(mapNovel) : []
  } catch { return [] }
}

export async function fetchNovelByGenre(genreId: string): Promise<{ genres: NovelGenreTag[]; novels: Novel[] }> {
  try {
    const { data } = await novelClient.get(ENDPOINTS.NOVEL_GENRE(genreId))
    const result = data?.result
    const genres: NovelGenreTag[] = Array.isArray(result?.genres)
      ? result.genres.map((g: any): NovelGenreTag => {
          const id = String(g.genreId ?? '')
          return { id, name: g.name || '', slug: id }
        })
      : []
    const novels: Novel[] = Array.isArray(result?.items) ? result.items.map(mapNovel) : []
    return { genres, novels }
  } catch { return { genres: [], novels: [] } }
}

export async function fetchNovelChapters(novelId: string): Promise<NovelChaptersData | null> {
  try {
    const { data } = await novelClient.get(ENDPOINTS.NOVEL_CHAPTERS(novelId))
    if (data?.success !== true || !data?.result) return null
    const result = data.result
    const detail = result.novel || result.detail || result.data || result
    const chaptersRaw = result.chapters || result.chapterList || result.list || []
    if (!Array.isArray(chaptersRaw)) return null
    const chapters: NovelChapterItem[] = chaptersRaw.map((c: any, idx: number) => {
      const rawTitle = c.title || c.name || c.chapterName || c.chapter_title || c.chapterTitle
      return {
        chapterId: String(c.chapterId ?? c.id ?? idx),
        title: rawTitle ? String(rawTitle) : `Chapter ${idx + 1}`,
        slug: String(c.chapterId ?? c.id ?? idx),
        date: c.date || c.updatedAt || c.releaseDate || '',
      }
    })
    return { novel: mapNovel(detail), chapters }
  } catch { return null }
}

export async function fetchNovelByTitle(title: string): Promise<Novel | null> {
  const key = title.trim().toLowerCase()
  if (!key) return null
  const results = await searchNovel(title)
  return results.find((n) => n.title.trim().toLowerCase() === key) || results[0] || null
}

export async function fetchNovelGenresMap(): Promise<NovelGenreTag[]> {
  const { genres } = await fetchNovelByGenre('1001')
  if (genres.length > 0) return genres
  return (await fetchNovelHome()).genres
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
    status: item.status || item.status_or_day || item.statusOrDay || '',
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
