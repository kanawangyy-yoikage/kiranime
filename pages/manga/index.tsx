import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { BookOpen, Flame, Sparkles, TrendingUp, LayoutGrid } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'
import ComicGrid from '@/components/ComicGrid'
import Section from '@/components/Section'
import CategorySearchBar from '@/components/CategorySearchBar'
import LandscapeSlider from '@/components/LandscapeSlider'
import LandscapeSpotlight from '@/components/LandscapeSpotlight'
import MangaMenuAside from '@/components/MangaMenuAside'
import {
  fetchComicHomepage,
  fetchComicPopular,
  fetchComicLatest,
  fetchComicTrending,
  fetchComicByType,
  fetchComicByGenre,
  fetchComicAll,
  type Comic,
  type ComicGenre,
} from '@/lib/api'
import type { SpotlightItem } from '@/components/LandscapeSpotlight'

type Tab = 'all' | 'popular' | 'latest' | 'trending'
type TypeFilter = 'manga' | 'manhwa' | 'manhua' | ''

const TAB_META: Record<Tab, { labelKey: string; icon: typeof Flame }> = {
  all: { labelKey: 'manga.all', icon: BookOpen },
  popular: { labelKey: 'section.popular', icon: Flame },
  latest: { labelKey: 'manga.latest', icon: Sparkles },
  trending: { labelKey: 'manga.trending', icon: TrendingUp },
}

const TYPE_LABEL_KEY: Record<string, string> = {
  manga: 'nav.manga',
  // nav.manhwa/nav.manhua tidak ada di i18n; pakai key footer.* yang
  // tersedia di semua kamus bahasa ('Manhwa' / 'Manhua').
  manhwa: 'footer.manhwa',
  manhua: 'footer.manhua',
}

const QUICK_MENU: { labelKey: string; href: string; icon: typeof Flame }[] = [
  { labelKey: 'manga.all', href: '/manga?tab=all', icon: BookOpen },
  { labelKey: 'section.popular', href: '/manga?tab=popular', icon: Flame },
  { labelKey: 'manga.latest', href: '/manga?tab=latest', icon: Sparkles },
  { labelKey: 'manga.trending', href: '/manga?tab=trending', icon: TrendingUp },
]

interface HomeData {
  popular: Comic[]
  latest: Comic[]
  trending: Comic[]
}

const imageProxy = (url: string) => `/api/proxy?url=${encodeURIComponent(url)}`

function toSpotlight(comic: Comic): SpotlightItem {
  return {
    kind: 'comic',
    title: comic.title,
    href: `/manga/${comic.slug}`,
    image: comic.image,
    score: comic.score,
    type: comic.type,
    chapter: comic.chapter,
    genres: comic.genres,
    status: comic.status,
  }
}

const GENRES: ComicGenre[] = [
  { name: 'Academy', slug: 'academy' },
  { name: 'Action', slug: 'action' },
  { name: 'Adult', slug: 'adult' },
  { name: 'Adventure', slug: 'adventure' },
  { name: 'apocalypse', slug: 'apocalypse' },
  { name: 'Beasts', slug: 'beasts' },
  { name: 'Blacksmith', slug: 'blacksmith' },
  { name: 'Comedy', slug: 'comedy' },
  { name: 'Comic', slug: 'comic' },
  { name: 'Cooking', slug: 'cooking' },
  { name: 'Crime', slug: 'crime' },
  { name: 'Crossdressing', slug: 'crossdressing' },
  { name: 'Dark Fantasy', slug: 'dark-fantasy' },
  { name: 'Demon', slug: 'demon' },
  { name: 'Demons', slug: 'demons' },
  { name: 'Doujinshi', slug: 'doujinshi' },
  { name: 'Drama', slug: 'drama' },
  { name: 'Ecchi', slug: 'ecchi' },
  { name: 'Entertainment', slug: 'entertainment' },
  { name: 'Fantasy', slug: 'fantasy' },
  { name: 'Fight', slug: 'fight' },
  { name: 'Furry', slug: 'furry' },
  { name: 'Game', slug: 'game' },
  { name: 'Gender Bender', slug: 'gender-bender' },
  { name: 'Genderswap', slug: 'genderswap' },
  { name: 'Genius', slug: 'genius' },
  { name: 'Ghosts', slug: 'ghosts' },
  { name: "Girls' Love", slug: 'girls-love' },
  { name: 'Gore', slug: 'gore' },
  { name: 'Gyaru', slug: 'gyaru' },
  { name: 'Harem', slug: 'harem' },
  { name: 'Historical', slug: 'historical' },
  { name: 'Horror', slug: 'horror' },
  { name: 'Isekai', slug: 'isekai' },
  { name: 'Josei', slug: 'josei' },
  { name: 'Knight', slug: 'knight' },
  { name: 'Long Strip', slug: 'long-strip' },
  { name: 'Magic', slug: 'magic' },
  { name: 'Manga', slug: 'manga' },
  { name: 'Mangatoon', slug: 'mangatoon' },
  { name: 'Manhwa', slug: 'manhwa' },
  { name: 'Martial Art', slug: 'martial-art' },
  { name: 'Martial Arts', slug: 'martial-arts' },
  { name: 'Mature', slug: 'mature' },
  { name: 'MC Rebirth', slug: 'mc-rebirth' },
  { name: 'Mecha', slug: 'mecha' },
  { name: 'Medical', slug: 'medical' },
  { name: 'Military', slug: 'military' },
  { name: 'Monster', slug: 'monster' },
  { name: 'Monster girls', slug: 'monster-girls' },
  { name: 'Monsters', slug: 'monsters' },
  { name: 'Murim', slug: 'murim' },
  { name: 'Music', slug: 'music' },
  { name: 'Mystery', slug: 'mystery' },
  { name: 'Mythology', slug: 'mythology' },
  { name: 'One Shot', slug: 'one-shot' },
  { name: 'Oneshot', slug: 'oneshot' },
  { name: 'Police', slug: 'police' },
  { name: 'Psychological', slug: 'psychological' },
  { name: 'Regression', slug: 'regression' },
  { name: 'Reincarnation', slug: 'reincarnation' },
  { name: 'Revenge', slug: 'revenge' },
  { name: 'Reverse Harem', slug: 'reverse-harem' },
  { name: 'Romance', slug: 'romance' },
  { name: 'School', slug: 'school' },
  { name: 'School life', slug: 'school-life' },
  { name: 'Sci-fi', slug: 'sci-fi' },
  { name: 'Seinen', slug: 'seinen' },
  { name: 'Shoujo', slug: 'shoujo' },
  { name: 'Shoujo Ai', slug: 'shoujo-ai' },
  { name: 'Shoujo(G)', slug: 'shougo' },
  { name: 'Shounen', slug: 'shounen' },
  { name: 'Shounen Ai', slug: 'shounen-ai' },
  { name: 'Slice of Life', slug: 'slice-of-life' },
  { name: 'Slow Life', slug: 'slow-life' },
  { name: 'Smut', slug: 'smut' },
  { name: 'Sport', slug: 'sport' },
  { name: 'Sports', slug: 'sports' },
  { name: 'Strategy', slug: 'strategy' },
  { name: 'Super Power', slug: 'super-power' },
  { name: 'Supernatural', slug: 'supernatural' },
  { name: 'Survival', slug: 'survival' },
  { name: 'Sword Fight', slug: 'sword-fight' },
  { name: 'Sword Master', slug: 'sword-master' },
  { name: 'Swormanship', slug: 'swordsmanship' },
  { name: 'System', slug: 'system' },
  { name: 'Thriller', slug: 'thriller' },
  { name: 'Time Travel', slug: 'time-travel' },
  { name: 'Tragedy', slug: 'tragedy' },
  { name: 'Trauma', slug: 'trauma' },
  { name: 'Vampire', slug: 'vampire' },
  { name: 'Video Games', slug: 'video-games' },
  { name: 'Villainess', slug: 'villainess' },
  { name: 'Violence', slug: 'violence' },
  { name: 'Webtoon', slug: 'webtoon' },
  { name: 'Webtoons', slug: 'webtoons' },
  { name: 'Yuri', slug: 'yuri' },
]

export default function MangaPage() {
  const router = useRouter()
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)

  const tab: Tab =
    router.query.tab === 'popular' || router.query.tab === 'latest' || router.query.tab === 'trending'
      ? router.query.tab
      : 'all'
  const typeFilter: TypeFilter = router.query.type === 'manga' || router.query.type === 'manhwa' || router.query.type === 'manhua' ? router.query.type : ''
  const genreSlug = typeof router.query.genre === 'string' ? router.query.genre : ''
  const isListing = Boolean(router.query.tab || router.query.type || router.query.genre)

  const [home, setHome] = useState<HomeData>({ popular: [], latest: [], trending: [] })
  const [homeLoading, setHomeLoading] = useState(true)
  const [comics, setComics] = useState<Comic[]>([])
  const [genres] = useState<ComicGenre[]>(GENRES)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  // ─── INCREMENTAL RENDER ─────────────────────────────────────
  // Bikin komik "unlimited" gak nge-lag: cuma render sebagian dulu
  // (BATCH_SIZE per langkah), sisanya muncul bertahap pas user scroll.
  // Data tetap di-fetch semua, tapi DOM-nya dibatasi jumlah node-nya.
  const [visibleCount, setVisibleCount] = useState(24)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const BATCH_SIZE = 24

  useEffect(() => {
  }, [])

  useEffect(() => {
    if (isListing) return
    let cancelled = false
    setHomeLoading(true)
    fetchComicHomepage().then((data) => {
      if (cancelled) return
      setHome(data)
      setHomeLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [isListing])

  useEffect(() => {
    setVisibleCount(24)
  }, [tab, typeFilter, genreSlug])

  useEffect(() => {
    if (!sentinelRef.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, comics.length))
        }
      },
      { rootMargin: '600px 0px' }
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [comics.length, visibleCount])

  const loadPage = useCallback(async (currentTab: Tab, currentType: TypeFilter, currentGenre: string, currentPage: number) => {
    setLoading(true)
    const data =
      currentGenre
        ? await fetchComicByGenre(currentGenre, currentPage)
        : currentType
        ? await fetchComicByType(currentType, currentPage)
        : currentTab === 'trending'
        ? await fetchComicTrending(currentPage)
        : currentTab === 'latest'
        ? await fetchComicLatest(currentPage)
        : currentTab === 'popular'
        ? await fetchComicPopular(currentPage)
        : await fetchComicAll(currentPage)
    setComics(prev => (currentPage === 1 ? data : [...prev, ...data]))
    setLoading(false)
  }, [])

  useEffect(() => {
    setPage(1)
    setComics([])
  }, [tab, typeFilter, genreSlug])

  useEffect(() => {
    if (!router.isReady) return
    loadPage(tab, typeFilter, genreSlug, page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, tab, typeFilter, genreSlug, router.isReady])

  const activeGenre = genres.find((g) => g.slug === genreSlug)
  const activeLabel = activeGenre
    ? activeGenre.name
    : genreSlug
    ? genreSlug
    : typeFilter
    ? t(TYPE_LABEL_KEY[typeFilter] || 'nav.manga')
    : t(TAB_META[tab].labelKey)
  const ActiveIcon = activeGenre ? Sparkles : typeFilter ? BookOpen : TAB_META[tab].icon

  const spotlightPool = [...home.popular, ...home.latest].filter(
    (c, i, arr) => arr.findIndex((x) => x.slug === c.slug) === i
  )
  const slides = spotlightPool.slice(0, 6).map(toSpotlight)

  // ─── LISTING MODE (deep-link target: ?tab= / ?type= / ?genre=) ───
  if (isListing) {
    return (
      <>
        <Head><title>{activeLabel} Manga - KiraStream</title></Head>
        <div className="flex items-start gap-6">
          <div className="flex-1 min-w-0 space-y-12 md:space-y-16">
            {/* Header + Search */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="page-title flex items-center gap-2">
                  <ActiveIcon size={24} className="text-ocean" aria-hidden="true" /> {activeLabel}
                </h1>
                <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {t('manga.subtitle')}
                </p>
              </div>
              <CategorySearchBar type="manga" placeholder={t('search.placeholderManga')} />
            </div>

            {/* Featured landscape */}
            {!loading && page === 1 && comics.length > 0 && (
              <LandscapeSpotlight
                kind="comic"
                title={comics[0].title}
                href={`/manga/${comics[0].slug}`}
                image={comics[0].image}
                imageProxy={imageProxy}
                score={comics[0].score}
                type={comics[0].type}
                chapter={comics[0].chapter}
                genres={comics[0].genres}
                status={comics[0].status}
              />
            )}

            {/* Quick Menu (nav utama di layar kecil; aside-nya tersembunyi < xl) */}
            <div className="card p-4">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                <LayoutGrid size={16} className="text-ocean" aria-hidden="true" /> {t('common.quickMenu')}
              </h3>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {QUICK_MENU.map(({ labelKey, href, icon: Icon }) => {
                  const active = router.asPath === href
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center text-xs font-semibold transition-colors ${
                        active
                          ? 'border-primary bg-primary/10 text-primary dark:border-accent dark:bg-accent/15 dark:text-accent'
                          : 'border-pearl/10 bg-pearl/[0.03] text-[var(--color-text-muted)] hover:border-ocean/40 hover:text-primary dark:hover:text-accent'
                      }`}
                    >
                      <Icon size={18} className="text-ocean" aria-hidden="true" />
                      {t(labelKey)}
                    </Link>
                  )
                })}
              </div>
            </div>

            {loading && page === 1 ? (
              <div className="anime-grid">
                {[...Array(12)].map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}
              </div>
            ) : comics.length === 0 ? (
              <div className="card p-6 text-center" style={{ color: 'var(--color-text-muted)' }}>{t('manga.loadError')}</div>
            ) : (
              <>
                <ComicGrid comics={comics.slice(0, visibleCount)} />
                {visibleCount < comics.length && (
                  <div ref={sentinelRef} className="text-center py-4">
                    <div className="inline-block w-8 h-8 border-[3px] border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
                  </div>
                )}
                <div className="text-center">
                  <button onClick={() => setPage(p => p + 1)} disabled={loading} className="btn-secondary">
                    {loading ? t('common.loading') : t('common.loadMore')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <MangaMenuAside genres={genres} />
      </>
    )
  }

  // ─── DEFAULT BERANDA ────────────────────────────────────────
  return (
    <>
      <Head><title>{t('manga.title')}</title></Head>
      <div className="flex items-start gap-6">
        <div className="flex-1 min-w-0 space-y-12 md:space-y-16">
          {/* Header + Search */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="page-title flex items-center gap-2">
                <BookOpen size={24} className="text-ocean" aria-hidden="true" /> {t('nav.manga')}
              </h1>
              <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {t('manga.subtitle')}
              </p>
            </div>
            <CategorySearchBar type="manga" placeholder={t('search.placeholderManga')} />
          </div>

          {/* Slider geser */}
          {homeLoading ? (
            <div className="skeleton min-h-[220px] rounded-3xl" />
          ) : slides.length > 0 ? (
            <LandscapeSlider kind="comic" items={slides} imageProxy={imageProxy} />
          ) : null}

          {/* Latest */}
          <Section title={t('section.latest')} jp="新着" viewAll="/manga?tab=latest">
            {homeLoading ? (
              <div className="anime-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}</div>
            ) : (
              <ComicGrid comics={home.latest.slice(0, 8)} />
            )}
          </Section>

          {/* Popular */}
          <Section title={t('section.popular')} jp="人気" viewAll="/manga?tab=popular">
            {homeLoading ? (
              <div className="anime-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}</div>
            ) : (
              <ComicGrid comics={home.popular.slice(0, 8)} />
            )}
          </Section>

          {/* Trending */}
          <Section title={t('manga.trending')} jp="急上昇" viewAll="/manga?tab=trending">
            {homeLoading ? (
              <div className="anime-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}</div>
            ) : (
              <ComicGrid comics={home.trending.slice(0, 8)} />
            )}
          </Section>

          {/* Genres */}
          {genres.length > 0 && (
            <Section title={t('manga.genre')} jp="ジャンル">
              <div className="flex flex-wrap gap-2">
                {genres.slice(0, 24).map((g) => (
                  <Link
                    key={g.slug}
                    href={`/manga?genre=${g.slug}`}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors bg-pearl/[0.04] border border-pearl/10 text-[var(--color-text-muted)] hover:bg-ocean hover:text-white"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            </Section>
          )}
        </div>
        <MangaMenuAside genres={genres} />
      </div>
    </>
  )
}

