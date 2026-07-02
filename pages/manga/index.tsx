import { useState, useEffect } from 'react'
import Head from 'next/head'
import { BookOpen, Flame, Sparkles } from 'lucide-react'
import ComicGrid from '@/components/ComicGrid'
import { fetchComicPopular, fetchComicLatest, type Comic } from '@/lib/api'

export default function MangaListPage() {
  const [comics, setComics] = useState<Comic[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [tab, setTab] = useState<'popular' | 'latest'>('popular')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = tab === 'popular' ? await fetchComicPopular(page) : await fetchComicLatest(page)
      setComics(prev => (page === 1 ? data : [...prev, ...data]))
      setLoading(false)
    }
    load()
  }, [page, tab])

  const switchTab = (next: 'popular' | 'latest') => {
    if (next === tab) return
    setTab(next)
    setPage(1)
    setComics([])
  }

  return (
    <>
      <Head><title>Manga - KiraNime</title></Head>
      <div className="space-y-6">
        <div className="card px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="section-title flex items-center gap-2"><BookOpen size={22} className="text-ocean" /> Manga</h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Baca manga favorit kamu.</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => switchTab('popular')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${tab === 'popular' ? 'bg-ocean text-pearl' : 'bg-surface-dark text-pearl/70 hover:bg-surface-hover'}`}
            >
              <Flame size={15} /> Populer
            </button>
            <button
              onClick={() => switchTab('latest')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${tab === 'latest' ? 'bg-ocean text-pearl' : 'bg-surface-dark text-pearl/70 hover:bg-surface-hover'}`}
            >
              <Sparkles size={15} /> Terbaru
            </button>
          </div>
        </div>

        {loading && page === 1 ? (
          <div className="anime-grid">
            {[...Array(12)].map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}
          </div>
        ) : comics.length === 0 ? (
          <div className="card p-6 text-center text-pearl/60">Belum ada manga tersedia. Coba lagi nanti.</div>
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
