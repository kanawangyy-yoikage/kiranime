import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { BookOpen, Flame, Sparkles, TrendingUp } from 'lucide-react'
import ComicGrid from '@/components/ComicGrid'
import CategorySearchBar from '@/components/CategorySearchBar'
import {
  fetchComicPopular,
  fetchComicLatest,
  fetchComicTrending,
  fetchComicByType,
  fetchComicAll,
  type Comic,
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

export default function MangaListPage() {
  const router = useRouter()

  // Tab & filter tipe dikontrol lewat query string (?tab=..&type=..) yang
  // datang dari submenu "Komik" di Sidebar, bukan dari tombol di halaman ini.
  // Default (gak ada query sama sekali) = "Semua Komik" -> endpoint /comic/unlimited
  const tab: Tab =
    router.query.tab === 'popular' || router.query.tab === 'latest' || router.query.tab === 'trending'
      ? router.query.tab
      : 'all'
  const typeFilter: TypeFilter = router.query.type === 'manga' || router.query.type === 'manhwa' || router.query.type === 'manhua' ? router.query.type : ''

  const [comics, setComics] = useState<Comic[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

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

  // Reset ke halaman 1 tiap kali submenu (tab/type) diganti
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
        <div className="card px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="section-title flex items-center gap-2">
              <ActiveIcon size={22} className="text-ocean" /> {activeLabel}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Baca manga, manhwa, & manhua favorit kamu.</p>
          </div>
          <CategorySearchBar type="manga" placeholder="Cari manga..." />
        </div>

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
