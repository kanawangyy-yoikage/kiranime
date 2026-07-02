import axios from 'axios'
import * as cheerio from 'cheerio'

const BASE = 'https://www.webtoons.com'
const PROXY = 'https://cors.siputzx.my.id/'

const fetchHtml = async (path: string) => {
  const url = `${PROXY}${path.startsWith('http') ? path : `${BASE}${path}`}`
  const { data, status } = await axios.get(url, {
    timeout: 25000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'id-ID,id;q=0.9,en;q=0.8',
    },
    validateStatus: () => true,
  })
  if (status !== 200 || typeof data !== 'string') throw new Error(`HTTP ${status}`)
  return data
}

const titleNoFromUrl = (url: string) => {
  const m = String(url).match(/[?&]title_no=(\d+)/)
  return m ? Number(m[1]) : null
}

export interface WebtoonItem {
  titleNo: number
  title: string
  author: string | null
  thumbnail: string | null
  genre: string | null
  section: 'originals' | 'canvas'
  url: string
}

export interface WebtoonDetail {
  titleNo: number | null
  title: string | null
  author: string | null
  synopsis: string | null
  genre: string | null
  day: string | null
  status: 'ONGOING' | 'COMPLETED' | null
  rating: number | null
  subscribers: string | null
  thumbnail: string | null
  url: string
}

export interface WebtoonEpisode {
  episodeNo: number | null
  title: string
  thumbnail: string | null
  date: string | null
  likes: string | null
  url: string
}

export const searchWebtoons = async (query: string, limit = 20) => {
  const html = await fetchHtml(`/id/search?keyword=${encodeURIComponent(query)}`)
  const $ = cheerio.load(html)
  const items: WebtoonItem[] = []

  $("a[href*='/list?title_no=']").each((_, el) => {
    if (items.length >= limit) return false
    const $a = $(el)
    const href = $a.attr('href') ?? ''
    if (!href) return
    const absUrl = href.startsWith('http') ? href : `${BASE}${href}`
    const titleNo = titleNoFromUrl(absUrl)
    if (!titleNo) return
    const title = $a.find('strong.title, .info_text .title, p.subj, .subj').first().text().trim() || $a.attr('title')?.trim() || ''
    const author = $a.find('.info_text .author, div.author, .author, .by').first().text().trim() || null
    const thumb = $a.find('img').first().attr('src') ?? null
    const isCanvas = absUrl.includes('/canvas/')
    const genreMatch = absUrl.match(/\/id\/([^/]+)\/[^/]+\/list/)
    const genre = !isCanvas && genreMatch ? genreMatch[1] : null
    items.push({ titleNo, title, author, thumbnail: thumb, genre, section: isCanvas ? 'canvas' : 'originals', url: absUrl.split('&webtoon-platform-redirect')[0] })
  })

  return items.filter((v, i, a) => a.findIndex(x => x.titleNo === v.titleNo && x.section === v.section) === i)
}

export const getWebtoonDetail = async (url: string): Promise<WebtoonDetail> => {
  const html = await fetchHtml(url)
  const $ = cheerio.load(html)
  const title = $('h1.subj, h3.subj, .info .subj').first().text().trim() || $('meta[property="og:title"]').attr('content') || null
  const author = $('.author_area, .ly_creator_in .author, .author').first().text().trim() || null
  const synopsis = $('p.summary, .detail_body .summary').first().text().trim() || $('meta[property="og:description"]').attr('content') || null
  const genre = $('h2.genre, p.genre').first().text().trim() || null
  const day = $('p.day_info, .day_info').first().text().replace(/\s+/g, ' ').trim() || null
  const status = /completed|tamat|selesai/i.test(day ?? '') ? 'COMPLETED' : /(every|setiap|UP)/i.test(day ?? '') ? 'ONGOING' : null
  const ratingText = $('em#_starScoreAverage, .grade_area .grade_num').first().text().trim() || null
  const rating = ratingText ? parseFloat(ratingText) || null : null
  const subscribers = $('.grade_area em.cnt, .subscribe em.cnt').first().text().trim() || null
  const thumbnail = $('.detail_header .thmb img, .detail_bg img').first().attr('src') || $('meta[property="og:image"]').attr('content') || null

  return { titleNo: titleNoFromUrl(url), title, author, synopsis, genre, day, status, rating, subscribers, thumbnail, url }
}

export const getWebtoonEpisodes = async (url: string, page = 1) => {
  const sep = url.includes('?') ? '&' : '?'
  const html = await fetchHtml(`${url}${sep}page=${page}`)
  const $ = cheerio.load(html)
  const list: WebtoonEpisode[] = []

  $('#_listUl > li, ul#_listUl > li').each((_, el) => {
    const $li = $(el)
    const $a = $li.find('a').first()
    const href = $a.attr('href') ?? ''
    if (!href) return
    const epUrl = href.startsWith('http') ? href : `${BASE}${href}`
    const epNo = Number($li.attr('data-episode-no')) || Number(epUrl.match(/episode_no=(\d+)/)?.[1]) || null
    const epTitle = $a.find('.subj span, .subj').first().text().trim() || $a.attr('title')?.trim() || ''
    const thumb = $a.find('.thmb img').first().attr('src') ?? null
    const date = $a.find('.date').first().text().trim() || null
    const likes = $li.find('em._likeitNumViewArea, .like_area em').first().text().trim() || null
    list.push({ episodeNo: epNo, title: epTitle, thumbnail: thumb, date, likes, url: epUrl })
  })

  let totalPages = page
  $('div.paginate a, .paginate a').each((_, el) => {
    const t = Number($(el).text().trim())
    if (Number.isFinite(t) && t > totalPages) totalPages = t
  })

  const meta = await getWebtoonDetail(url)
  return { ...meta, page, totalPages, hasNext: page < totalPages, count: list.length, episodesList: list }
}

export const getWebtoonPages = async (url: string) => {
  const html = await fetchHtml(url)
  const $ = cheerio.load(html)
  const images: string[] = []
  $('#_imageList img').each((_, el) => {
    const src = $(el).attr('data-url') || $(el).attr('src')
    if (src) images.push(src)
  })
  return images
}

export const getTrendingWebtoons = async (day = 'trending') => {
  const d = (day || 'daily').toLowerCase()
  const path = d === 'daily' || d === 'trending' ? '/id/dailySchedule' : d === 'completed' ? '/id/originals/completed' : `/id/originals/${d}`
  const html = await fetchHtml(path)
  const $ = cheerio.load(html)
  const items: WebtoonItem[] = []

  $("a[href*='/list?title_no=']").each((_, el) => {
    const $a = $(el)
    const href = $a.attr('href') ?? ''
    if (!href) return
    const absUrl = href.startsWith('http') ? href : `${BASE}${href}`
    const titleNo = titleNoFromUrl(absUrl)
    if (!titleNo) return
    const title = $a.find('.subj, p.subj').first().text().trim() || $a.attr('title')?.trim() || ''
    const thumb = $a.find('img').first().attr('src') ?? null
    const genreMatch = absUrl.match(/\/id\/([^/]+)\/[^/]+\/list/)
    const genre = genreMatch && genreMatch[1] !== 'canvas' ? genreMatch[1] : null
    items.push({ titleNo, title, thumbnail: thumb, genre, author: null, section: 'originals', url: absUrl.split('&webtoon-platform-redirect')[0] })
  })

  return items.filter((v, i, a) => a.findIndex(x => x.titleNo === v.titleNo) === i)
}
