import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { BookOpen, Flame, Sparkles, TrendingUp, LayoutGrid } from 'lucide-react'
import ComicGrid from '@/components/ComicGrid'
import CategorySearchBar from '@/components/CategorySearchBar'
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

const TAB_META: Record<Tab, { label: string; icon: typeof Flame }> = {
  all: { label: 'Semua Komik', icon: BookOpen },
  popular: { label: 'Populer', icon: Flame },
  latest: { label: 'Terbaru', icon: Sparkles },
  trending: { label: 'Trending', icon: TrendingUp },
}

const TYPE_LABEL: Record<string, string> = {
  manga: 'Manga',
  manhwa: 'Manhwa',
  manhua: 'Manhua',
}

const QUICK_MENU: { label: string; href: string; icon: typeof Flame }[] = [
  { label: 'Semua Komik', href: '/manga', icon: BookOpen },
  { label: 'Populer', href: '/manga?tab=popular', icon: Flame },
  { label: 'Terbaru', href: '/manga?tab=latest', icon: Sparkles },
  { label: 'Trending', href: '/manga?tab=trending', icon: TrendingUp },
  { label: 'Manga', href: '/manga?type=manga', icon: BookOpen },
  { label: 'Manhwa', href: '/manga?type=manhwa', icon: BookOpen },
  { label: 'Manhua', href: '/manga?type=manhua', icon: BookOpen },
]

export default function MangaListPage() {
  const router = useRouter()

  const tab: Tab =
    router.query.tab === 'popular' || router.query.tab === 'latest' || router.query.tab === 'trending'
      ? router.query.tab
      : 'all'
  const typeFilter: TypeFilter = router.query.type === 'manga' || router.query.type === 'manhwa' || router.query.type === 'manhua' ? router.query.type : ''

  const [comics, setComics] = useState<Comic[]>([])
  const [genres, setGenres] = useState<ComicGenre[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchComicGenres().then(setGenres)
  }, [])

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

  const activeLabel = typeFilter ? TYPE_LABEL[typeFilter] : TAB_META[tab].label
  const ActiveIcon = typeFilter ? BookOpen : TAB_META[tab].icon

  return (
    <>
      <Head><title>{activeLabel} Manga - KiraStream</title></Head>
      <div className="space-y-6">
        {/* Header + Search */}
        <div className="card px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="section-title flex items-center gap-2">
              <ActiveIcon size={22} className="text-ocean" /> {activeLabel}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Baca manga, manhwa, & manhua favorit kamu.</p>
          </div>
          <CategorySearchBar type="manga" placeholder="Cari manga..." />
        </div>

        {/* Quick Menu */}
        <div className="card p-4">
          <h3 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
            <LayoutGrid size={16} className="text-ocean" /> Quick Menu
          </h3>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
            {QUICK_MENU.map(({ label, href, icon: Icon }) => {
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
                  <Icon size={18} className="text-ocean" />
                  {label}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Genre chips */}
        {genres.length > 0 && (
          <div className="card p-4">
            <h3 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles size={16} className="text-ocean" /> Genre
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
          <div className="card p-6 text-center text-pearl/60">Manga belum bisa dimuat, coba refresh halaman ini sebentar lagi.</div>
        ) : (
          <>
            <ComicGrid comics={comics} />
            <div className="text-center">
              <button onClick={() => setPage(p => p + 1)} disabled={loading} className="btn-primary">
                {loading ? 'Loading...' : 'Muat Lebih Banyak'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
