import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { BookOpen, Flame, Sparkles, TrendingUp, Shuffle } from 'lucide-react'
import ComicGrid from '@/components/ComicGrid'
import CategorySearchBar from '@/components/CategorySearchBar'
import {
  fetchComicPopular,
  fetchComicLatest,
  fetchComicTrending,
  fetchComicByType,
  fetchComicRandom,
  type Comic,
} from '@/lib/api'

type Tab = 'popular' | 'latest' | 'trending'
type TypeFilter = 'all' | 'manga' | 'manhwa' | 'manhua'

const TYPE_FILTERS: { key: TypeFilter; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'manga', label: 'Manga' },
  { key: 'manhwa', label: 'Manhwa' },
  { key: 'manhua', label: 'Manhua' },
]

export default function MangaListPage() {
  const [comics, setComics] = useState<Comic[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [tab, setTab] = useState<Tab>('popular')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [shuffling, setShuffling] = useState(false)

  const loadPage = useCallback(async (currentTab: Tab, currentType: TypeFilter, currentPage: number) => {
    setLoading(true)
    const data =
      currentType !== 'all'
        ? await fetchComicByType(currentType, currentPage)
        : currentTab === 'popular'
        ? await fetchComicPopular(currentPage)
        : currentTab === 'trending'
        ? await fetchComicTrending(currentPage)
        : await fetchComicLatest(currentPage)
    setComics(prev => (currentPage === 1 ? data : [...prev, ...data]))
    setLoading(false)
  }, [])

  useEffect(() => {
    loadPage(tab, typeFilter, page)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, tab, typeFilter])

  const switchTab = (next: Tab) => {
    if (next === tab) return
    setTab(next)
    setPage(1)
    setComics([])
  }

  const switchType = (next: TypeFilter) => {
    if (next === typeFilter) return
    setTypeFilter(next)
    setPage(1)
    setComics([])
  }

  const shuffleRandom = async () => {
    setShuffling(true)
    const data = await fetchComicRandom()
    if (data.length > 0) {
      setComics(data)
      setPage(1)
    }
    setShuffling(false)
  }

  return (
    <>
      <Head><title>Manga - KiraStream</title></Head>
      <div className="space-y-6">
        <div className="card px-5 py-4 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="section-title flex items-center gap-2"><BookOpen size={22} className="text-ocean" /> Manga</h1>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">Baca manga, manhwa, & manhua favorit kamu.</p>
            </div>
            <CategorySearchBar type="manga" placeholder="Cari manga..." />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => switchTab('popular')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${tab === 'popular' ? 'bg-ocean text-white' : 'bg-surface-dark text-pearl/70 hover:bg-surface-hover'}`}
            >
              <Flame size={15} /> Populer
            </button>
            <button
              onClick={() => switchTab('latest')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${tab === 'latest' ? 'bg-ocean text-white' : 'bg-surface-dark text-pearl/70 hover:bg-surface-hover'}`}
            >
              <Sparkles size={15} /> Terbaru
            </button>
            <button
              onClick={() => switchTab('trending')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${tab === 'trending' ? 'bg-ocean text-white' : 'bg-surface-dark text-pearl/70 hover:bg-surface-hover'}`}
            >
              <TrendingUp size={15} /> Trending
            </button>

            <span className="mx-1 hidden sm:inline text-pearl/20">|</span>

            <button
              onClick={shuffleRandom}
              disabled={shuffling}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium bg-surface-dark text-pearl/70 hover:bg-surface-hover transition-all disabled:opacity-50"
            >
              <Shuffle size={15} className={shuffling ? 'animate-spin' : ''} /> {shuffling ? 'Ngacak...' : 'Acak'}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-pearl/50 uppercase tracking-wide">Tipe:</span>
            {TYPE_FILTERS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => switchType(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${typeFilter === key ? 'bg-purple-600 text-white' : 'bg-surface-dark text-pearl/60 hover:bg-surface-hover'}`}
              >
                {label}
              </button>
            ))}
          </div>
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
