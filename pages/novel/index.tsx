import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { BookMarked, ChevronLeft, ChevronRight } from 'lucide-react'
import NovelGrid from '@/components/NovelGrid'
import CategorySearchBar from '@/components/CategorySearchBar'
import { fetchNovelHome, fetchNovelGenres, enrichNovelCovers, type Novel, type NovelGenreTag } from '@/lib/api'

export default function NovelListPage() {
  const [novels, setNovels] = useState<Novel[]>([])
  const [genres, setGenres] = useState<NovelGenreTag[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchNovelGenres().then(setGenres)
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const data = await fetchNovelHome(page)
      if (cancelled) return
      setNovels(data) // tampilin dulu tanpa gambar biar gak nunggu lama
      setLoading(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })

      // baru nyusul cari covernya satu-satu di background, update pas ketemu
      const enriched = await enrichNovelCovers(data)
      if (!cancelled) setNovels(enriched)
    }
    load()
    return () => { cancelled = true }
  }, [page])

  return (
    <>
      <Head><title>Novel - KiraStream</title></Head>
      <div className="space-y-6">
        <div className="card px-5 py-4 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="section-title flex items-center gap-2"><BookMarked size={22} className="text-ocean" /> Novel</h1>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">Baca novel favorit kamu.</p>
            </div>
            <CategorySearchBar type="novel" placeholder="Cari novel..." />
          </div>

          {genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {genres.slice(0, 14).map((g) => (
                <Link
                  key={g.slug}
                  href={`/novel/genre/${g.slug}`}
                  className="px-3 py-1.5 bg-surface-dark hover:bg-ocean/20 text-pearl/80 hover:text-pearl text-xs font-medium rounded-full transition-colors"
                >
                  {g.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}
          </div>
        ) : novels.length === 0 ? (
          <div className="card p-6 text-center text-pearl/60">Novel belum bisa dimuat, coba refresh halaman ini sebentar lagi.</div>
        ) : (
          <>
            <NovelGrid novels={novels} />
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn-secondary inline-flex items-center gap-1 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} /> Sebelumnya
              </button>
              <span className="text-sm text-pearl/70">Halaman {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary inline-flex items-center gap-1 text-sm"
              >
                Selanjutnya <ChevronRight size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
