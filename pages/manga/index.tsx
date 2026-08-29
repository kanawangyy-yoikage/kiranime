import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { BookOpen, Flame, Sparkles, TrendingUp, LayoutGrid, Clapperboard, ScrollText, BookMarked } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'
import { motionTokens, adaptiveDuration } from '@/lib/motionTokens'
import ComicGrid from '@/components/ComicGrid'
import Section from '@/components/Section'
import CategorySearchBar from '@/components/CategorySearchBar'
import LandscapeSpotlight from '@/components/LandscapeSpotlight'
import {
  fetchComicHomepage,
  fetchComicPopular,
  fetchComicLatest,
  fetchComicTrending,
  fetchComicByType,
  fetchComicByGenre,
  fetchComicAll,
  fetchComicGenres,
  type Comic,
  type ComicGenre,
} from '@/lib/api'

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
  manhwa: 'nav.manhwa',
  manhua: 'nav.manhua',
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

function textStyle(muted = false) {
  return { color: muted ? 'var(--color-text-muted)' : 'var(--color-text)' }
}

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
  const [genres, setGenres] = useState<ComicGenre[]>([])
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
    fetchComicGenres().then(setGenres)
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

  const reduce = useReducedMotion()
  const heroStagger = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : 0.09,
        delayChildren: reduce ? 0 : 0.1,
      },
    },
  }
  const heroItem = {
    hidden: { opacity: 0, y: reduce ? 0 : motionTokens.distance.md },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: adaptiveDuration(motionTokens.duration.normal), ease: motionTokens.easing.smooth },
    },
  }

  const quickLinks = [
    { href: '/anime', label: t('nav.anime'), Icon: Clapperboard },
    { href: '/manga', label: t('nav.manga'), Icon: BookOpen },
    { href: '/webtoon', label: t('nav.webtoon'), Icon: ScrollText },
    { href: '/novel', label: t('nav.novel'), Icon: BookMarked },
  ]

  // ─── LISTING MODE (deep-link target: ?tab= / ?type= / ?genre=) ───
  if (isListing) {
    return (
      <>
        <Head><title>{activeLabel} Manga - KiraStream</title></Head>
        <div className="space-y-8">
          {/* Header + Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="page-title flex items-center gap-2">
                <ActiveIcon size={22} className="text-ocean" aria-hidden="true" /> {activeLabel}
              </h1>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">{t('manga.subtitle')}</p>
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
              imageProxy={(url) => `/api/proxy?url=${encodeURIComponent(url)}`}
              score={comics[0].score}
              type={comics[0].type}
              chapter={comics[0].chapter}
              genres={comics[0].genres}
              status={comics[0].status}
            />
          )}

          {/* Quick Menu */}
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

          {/* Genre chips */}
          {genres.length > 0 && (
            <div className="card p-4">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-ocean" aria-hidden="true" /> {t('manga.genre')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {genres.slice(0, 18).map((g) => (
                  <Link
                    key={g.slug}
                    href={`/manga?genre=${g.slug}`}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors bg-pearl/[0.04] border border-pearl/10 text-[var(--color-text-muted)] hover:bg-ocean hover:text-white"
                  >
                    {g.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

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
      </>
    )
  }

  // ─── DEFAULT BERANDA ────────────────────────────────────────
  return (
    <>
      <Head><title>{t('manga.title')}</title></Head>
      <div className="space-y-12 md:space-y-16">
        {/* Hero / Landing */}
        <section className="hero-panel relative overflow-hidden rounded-3xl border px-6 py-16 md:px-10 md:py-24">
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute inset-0 bg-gradient-to-br from-ocean/10 via-transparent to-accent/10 dark:from-ocean/15 dark:via-transparent dark:to-accent/15" />
            <div className="absolute inset-0 bg-gradient-to-b from-surface/80 via-surface/60 to-surface dark:from-noir/70 dark:via-noir/50 dark:to-noir" />
          </div>

          <motion.div
            className="relative z-10 flex flex-col items-center text-center"
            variants={heroStagger}
            initial={reduce ? false : 'hidden'}
            animate="visible"
          >
            <motion.span variants={heroItem} className="badge mb-5">{t('hero.badge')}</motion.span>

            <motion.h1
              variants={heroItem}
              className="text-5xl font-extrabold tracking-tighter md:text-7xl text-primary dark:text-[var(--color-text)]"
            >
              Kira<span className="text-ocean dark:text-accent">{t('nav.manga')}</span>
            </motion.h1>

            <motion.p variants={heroItem} className="mt-5 max-w-2xl text-sm leading-7 md:text-base" style={textStyle(true)}>
              {t('manga.subtitle')}
            </motion.p>

            {/* Search */}
            <motion.div variants={heroItem} className="mt-9 w-full max-w-xl">
              <CategorySearchBar type="manga" placeholder={t('search.placeholderManga')} className="!w-full" />
            </motion.div>

            {/* Quick category links */}
            <motion.div variants={heroItem} className="mt-9 grid w-full max-w-2xl grid-cols-2 gap-2.5 sm:grid-cols-4">
              {quickLinks.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-surface px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] dark:bg-surface-dark transition-colors hover:border-ocean hover:text-ocean dark:hover:border-accent dark:hover:text-accent"
                >
                  <Icon size={16} className="text-ocean dark:text-accent" aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </motion.div>
          </motion.div>
        </section>

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
            <div className="skeleton min-h-[200px] rounded-3xl" />
          ) : home.popular.length > 0 ? (
            <LandscapeSpotlight
              kind="comic"
              title={home.popular[0].title}
              href={`/manga/${home.popular[0].slug}`}
              image={home.popular[0].image}
              imageProxy={(url) => `/api/proxy?url=${encodeURIComponent(url)}`}
              score={home.popular[0].score}
              type={home.popular[0].type}
              chapter={home.popular[0].chapter}
              genres={home.popular[0].genres}
              status={home.popular[0].status}
            />
          ) : (
            <div className="card p-5 text-sm" style={textStyle(true)}>{t('manga.loadError')}</div>
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
          <Section title={t('manga.genre')}>
            <div className="flex flex-wrap gap-2">
              {genres.slice(0, 18).map((g) => (
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
    </>
  )
}