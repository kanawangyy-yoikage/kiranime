import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { Search, PlayCircle, BookOpen, ScrollText, BookMarked, Star, Frown, ImageOff } from 'lucide-react'
import AnimeGrid from '@/components/AnimeGrid'
import ComicGrid from '@/components/ComicGrid'
import NovelGrid from '@/components/NovelGrid'
import Section from '@/components/Section'
import { searchAnime, searchComic, searchNovel, enrichNovelCovers, searchMAL, type Anime, type Comic, type Novel, type MALAnime } from '@/lib/api'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'

type SearchType = 'anime' | 'manga' | 'webtoon' | 'novel'

interface WebtoonResult {
  title: string
  thumbnail: string
  url: string
}

const TABS: { key: SearchType; labelKey: string; icon: typeof PlayCircle; placeholderKey: string }[] = [
  { key: 'anime', labelKey: 'nav.anime', icon: PlayCircle, placeholderKey: 'search.placeholderAnime' },
  { key: 'manga', labelKey: 'nav.manga', icon: BookOpen, placeholderKey: 'search.placeholderManga' },
  { key: 'webtoon', labelKey: 'nav.webtoon', icon: ScrollText, placeholderKey: 'search.placeholderWebtoon' },
  { key: 'novel', labelKey: 'nav.novel', icon: BookMarked, placeholderKey: 'search.placeholderNovel' },
]

export default function SearchPage() {
  const router = useRouter()
  const { q, type } = router.query
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)

  const activeType: SearchType = type === 'manga' || type === 'webtoon' || type === 'novel' ? type : 'anime'

  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)

  const [animeResults, setAnimeResults] = useState<Anime[]>([])
  const [malResults, setMalResults] = useState<MALAnime[]>([])
  const [mangaResults, setMangaResults] = useState<Comic[]>([])
  const [webtoonResults, setWebtoonResults] = useState<WebtoonResult[]>([])
  const [novelResults, setNovelResults] = useState<Novel[]>([])

  const imageProxy = (url: string) => `/api/proxy?url=${encodeURIComponent(url)}`

  const performSearch = useCallback(async (query: string, searchType: SearchType) => {
    if (!query.trim()) return
    setLoading(true)
    try {
      if (searchType === 'anime') {
        const [anime, mal] = await Promise.all([searchAnime(query), searchMAL(query)])
        setAnimeResults(anime)
        setMalResults(mal)
      } else if (searchType === 'manga') {
        const results = await searchComic(query)
        setMangaResults(results)
      } else if (searchType === 'novel') {
        const results = await searchNovel(query)
        setNovelResults(results)
        enrichNovelCovers(results).then(setNovelResults)
      } else {
        const res = await fetch(`/api/webtoon?action=search&query=${encodeURIComponent(query)}`)
        const data = await res.json()
        setWebtoonResults(data.items || [])
      }
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (q && typeof q === 'string') {
      setSearchQuery(q)
      performSearch(q, activeType)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, activeType])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&type=${activeType}`)
    }
  }

  const switchTab = (nextType: SearchType) => {
    if (nextType === activeType) return
    const nextQuery: Record<string, string> = { type: nextType }
    if (q && typeof q === 'string') nextQuery.q = q
    router.push({ pathname: '/search', query: nextQuery })
  }

  const currentTab = TABS.find((tb) => tb.key === activeType)!

  const hasResults =
    activeType === 'anime' ? animeResults.length > 0 :
    activeType === 'manga' ? mangaResults.length > 0 :
    activeType === 'novel' ? novelResults.length > 0 :
    webtoonResults.length > 0

  return (
    <>
      <Head>
        <title>{t('search.pageTitle').replace('{label}', t(currentTab.labelKey))} - KiraStream</title>
      </Head>

      <div className="space-y-8">
        {/* Search Bar */}
        <div className="card p-6 space-y-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(currentTab.placeholderKey)}
              className="input-field pr-12"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary dark:bg-accent hover:opacity-90 text-white dark:text-noir rounded-lg transition-colors"
              aria-label={t('search.submit')}
            >
              <Search size={18} aria-hidden="true" />
            </button>
          </form>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {TABS.map(({ key, labelKey, icon: Icon }) => (
              <button
                key={key}
                onClick={() => switchTab(key)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border shrink-0 ${
                  activeType === key
                    ? 'border-primary bg-primary/10 text-primary dark:border-accent dark:bg-accent/15 dark:text-accent'
                    : 'border-pearl/10 bg-pearl/[0.03] text-text-light/70 dark:text-text-dark/70 hover:border-ocean/40 hover:text-primary dark:hover:text-accent'
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                {t(labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-[3px] border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[var(--color-text-muted)]">{t('search.searching').replace('{label}', t(currentTab.labelKey).toLowerCase())}</p>
          </div>
        )}

        {/* Results */}
        {!loading && q && (
          <>
            {hasResults ? (
              <>
                {activeType === 'anime' && (
                  <Section title={t('search.results').replace('{q}', String(q)).replace('{n}', String(animeResults.length))}>
                    <AnimeGrid animes={animeResults} />
                  </Section>
                )}

                {activeType === 'manga' && (
                  <Section title={t('search.results').replace('{q}', String(q)).replace('{n}', String(mangaResults.length))}>
                    <ComicGrid comics={mangaResults} />
                  </Section>
                )}

                {activeType === 'novel' && (
                  <Section title={t('search.results').replace('{q}', String(q)).replace('{n}', String(novelResults.length))}>
                    <NovelGrid novels={novelResults} />
                  </Section>
                )}

                {activeType === 'webtoon' && (
                  <Section title={t('search.results').replace('{q}', String(q)).replace('{n}', String(webtoonResults.length))}>
                    <div className="anime-grid">
                      {webtoonResults.map((item, i) => (
                        <Link key={i} href={`/webtoon/${encodeURIComponent(item.url)}`} className="anime-card group">
                          <div className="relative aspect-[3/4] bg-[var(--color-surface-alt)]">
                            {item.thumbnail ? (
                              <Image
                                src={imageProxy(item.thumbnail)}
                                alt={item.title}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[var(--color-text-muted)]">
                                <ImageOff size={20} />
                              </div>
                            )}
                          </div>
                          <div className="p-2.5">
                            <h3 className="line-clamp-2 text-xs font-semibold sm:text-sm text-[var(--color-text)]">{item.title}</h3>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </Section>
                )}
              </>
            ) : (
              <div className="text-center py-12 card p-6">
                <Frown className="mx-auto mb-3 text-[var(--color-text-muted)]" size={36} />
                <p className="text-[var(--color-text)]">{t('search.notFound').replace('{q}', String(q))}</p>
                <p className="text-sm text-[var(--color-text-muted)] mt-2">{t('search.notFoundHint')}</p>
              </div>
            )}

            {/* MAL Results (only for anime tab) */}
            {activeType === 'anime' && malResults.length > 0 && (
              <Section title={t('search.malResults')}>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {malResults.slice(0, 6).map((anime) => (
                    <a
                      key={anime.mal_id}
                      href={`https://myanimelist.net/anime/${anime.mal_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card group hover:scale-105 transition-transform"
                    >
                      <div className="relative aspect-[3/4]">
                        <img
                          src={anime.images.jpg.image_url}
                          alt={anime.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-primary/90 dark:bg-accent/90 text-white dark:text-noir text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                          <Star size={12} className="fill-current" aria-hidden="true" /> {anime.score?.toFixed(1) || 'N/A'}
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-[var(--color-text)] text-sm truncate">
                          {anime.title}
                        </h3>
                      </div>
                    </a>
                  ))}
                </div>
              </Section>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !q && (
          <div className="text-center py-12 card p-6">
            <Search className="mx-auto mb-4" style={{ color: 'var(--color-primary)' }} size={40} />
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">{t('search.emptyTitle').replace('{label}', t(currentTab.labelKey))}</h2>
            <p className="text-[var(--color-text-muted)]">{t('search.emptyDesc').replace('{label}', t(currentTab.labelKey).toLowerCase())}</p>
          </div>
        )}
      </div>
    </>
  )
}
