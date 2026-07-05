import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, Tag } from 'lucide-react'
import NovelGrid from '@/components/NovelGrid'
import { fetchNovelByGenre, enrichNovelCovers, type Novel } from '@/lib/api'

export default function NovelGenrePage() {
  const router = useRouter()
  const { slug } = router.query

  const [novels, setNovels] = useState<Novel[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [slug])

  useEffect(() => {
    if (!slug || typeof slug !== 'string') return
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const data = await fetchNovelByGenre(slug, page)
      if (cancelled) return
      setNovels(data)
      setLoading(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })

      const enriched = await enrichNovelCovers(data)
      if (!cancelled) setNovels(enriched)
    }
    load()
    return () => { cancelled = true }
  }, [slug, page])

  const genreName = typeof slug === 'string'
    ? slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : ''

  return (
    <>
      <Head><title>Genre {genreName} - Novel - KiraNime</title></Head>
      <div className="space-y-6">
        <div className="card px-5 py-4 flex items-center justify-between gap-3">
          <div>
            <Link href="/novel" className="inline-flex items-center gap-1.5 text-sm text-pearl/60 hover:text-pearl mb-1">
              <ArrowLeft size={14} /> Kembali ke Novel
            </Link>
            <h1 className="section-title flex items-center gap-2"><Tag size={20} className="text-ocean" /> Genre: {genreName}</h1>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}
          </div>
        ) : novels.length === 0 ? (
          <div className="card p-6 text-center text-pearl/60">Belum ada novel di genre ini.</div>
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
