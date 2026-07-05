import { useState, useEffect } from 'react'
import Head from 'next/head'
import { BookMarked, Flame, Sparkles } from 'lucide-react'
import NovelGrid from '@/components/NovelGrid'
import CategorySearchBar from '@/components/CategorySearchBar'
import { fetchNovelHome, fetchNovelHotSearch, type Novel } from '@/lib/api'

export default function NovelListPage() {
  const [novels, setNovels] = useState<Novel[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'home' | 'hot'>('home')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = tab === 'home' ? await fetchNovelHome() : await fetchNovelHotSearch()
      setNovels(data)
      setLoading(false)
    }
    load()
  }, [tab])

  const switchTab = (next: 'home' | 'hot') => {
    if (next === tab) return
    setTab(next)
  }

  return (
    <>
      <Head><title>Novel - KiraNime</title></Head>
      <div className="space-y-6">
        <div className="card px-5 py-4 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="section-title flex items-center gap-2"><BookMarked size={22} className="text-ocean" /> Novel</h1>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">Baca novel favorit kamu.</p>
            </div>
            <CategorySearchBar type="novel" placeholder="Cari novel..." />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => switchTab('home')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${tab === 'home' ? 'bg-ocean text-white' : 'bg-surface-dark text-pearl/70 hover:bg-surface-hover'}`}
            >
              <Sparkles size={15} /> Beranda
            </button>
            <button
              onClick={() => switchTab('hot')}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${tab === 'hot' ? 'bg-ocean text-white' : 'bg-surface-dark text-pearl/70 hover:bg-surface-hover'}`}
            >
              <Flame size={15} /> Trending
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}
          </div>
        ) : novels.length === 0 ? (
          <div className="card p-6 text-center text-pearl/60">Belum ada novel tersedia. Coba lagi nanti.</div>
        ) : (
          <NovelGrid novels={novels} />
        )}
      </div>
    </>
  )
}
