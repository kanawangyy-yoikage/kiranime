import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { BookOpen, Flame, Sparkles, TrendingUp, LayoutGrid } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'
import ComicGrid from '@/components/ComicGrid'
import CategorySearchBar from '@/components/CategorySearchBar'
import LandscapeSpotlight from '@/components/LandscapeSpotlight'
import {
  fetchComicPopular,
  fetchComicLatest,
  fetchComicTrending,
  fetchComicByType,
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
  { labelKey: 'manga.all', href: '/manga', icon: BookOpen },
  { labelKey: 'section.popular', href: '/manga?tab=popular', icon: Flame },
  { labelKey: 'manga.latest', href: '/manga?tab=latest', icon: Sparkles },
  { labelKey: 'manga.trending', href: '/manga?tab=trending', icon: TrendingUp },
  { labelKey: 'nav.manga', href: '/manga?type=manga', icon: BookOpen },
  { labelKey: 'nav.manhwa', href: '/manga?type=manhwa', icon: BookOpen },
  { labelKey: 'nav.manhua', href: '/manga?type=manhua', icon: BookOpen },
]

export default function MangaListPage() {
  const router = useRouter()
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)

  const tab: Tab =
    router.query.tab === 'popular' || router.query.tab === 'latest' || router.query.tab === 'trending'
      ? router.query.tab
      : 'all'
  const typeFilter: TypeFilter = router.query.type === 'manga' || router.query.type === 'manhwa' || router.query.type === 'manhua' ? router.query.type : ''

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
    setVisibleCount(24)
  }, [tab, typeFilter])

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

  const loadPage = useCallback(async (currentTab: Tab, currentType: TypeFilter, currentPage: number) => {
    setLoading(true)
    const data =
      currentType
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
  }, [tab, typeFilter])

  useEffect(() => {
    if (!router.isReady) return
    loadPage(tab, typeFilter, page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, tab, typeFilter, router.isReady])

  const activeLabel = typeFilter ? t(TYPE_LABEL_KEY[typeFilter] || 'nav.manga') : t(TAB_META[tab].labelKey)
  const ActiveIcon = typeFilter ? BookOpen : TAB_META[tab].icon

  return (
    <>
      <Head><title>{activeLabel} Manga - KiraStream</title></Head>
      <div className="space-y-8">
        {/* Header + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="section-title flex items-center gap-2">
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
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
            {QUICK_MENU.map(({ labelKey, href, icon: Icon }) => {
              const active = href === '/manga'
                ? !typeFilter && tab === 'all'
                : router.asPath === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center text-xs font-semibold transition-colors ${
                    active
                      ? 'border-primary bg-primary/10 text-primary dark:border-accent dark:bg-accent/15 dark:text-accent'
                      : 'border-pearl/10 bg-pearl/[0.03] text-text-light/70 dark:text-text-dark/70 hover:border-ocean/40 hover:text-primary dark:hover:text-accent'
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
                  href={`/manga/genre/${g.slug}`}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors bg-pearl/[0.04] border border-pearl/10 text-text-light/70 dark:text-text-dark/70 hover:bg-ocean hover:text-white"
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
