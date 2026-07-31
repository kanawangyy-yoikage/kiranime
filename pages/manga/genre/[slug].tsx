import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Tags } from 'lucide-react'
import ComicGrid from '@/components/ComicGrid'
import { fetchComicByGenre, type Comic } from '@/lib/api'

export default function MangaGenrePage() {
  const router = useRouter()
  const slug = typeof router.query.slug === 'string' ? router.query.slug : ''

  const [comics, setComics] = useState<Comic[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
    setComics([])
  }, [slug])

  useEffect(() => {
    if (!slug) return
    const load = async () => {
      setLoading(true)
      const data = await fetchComicByGenre(slug, page)
      setComics((prev) => (page === 1 ? data : [...prev, ...data]))
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, page])

  return (
    <>
      <Head><title>{slug.replace(/-/g, ' ')} - Manga - KiraStream</title></Head>
      <div className="space-y-6">
        <div className="card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="section-title flex items-center gap-2">
              <Tags size={22} className="text-ocean" aria-hidden="true" /> Genre: {slug.replace(/-/g, ' ')}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Kumpulan komik dengan genre ini.</p>
          </div>
          <Link href="/manga" className="btn-secondary text-sm">Kembali ke Komik</Link>
        </div>

        {loading && page === 1 ? (
          <div className="anime-grid">
            {[...Array(12)].map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}
          </div>
        ) : comics.length === 0 ? (
          <div className="card p-6 text-center text-pearl/60">Belum ada komik di genre ini.</div>
        ) : (
          <>
            <ComicGrid comics={comics} />
            <div className="text-center">
              <button onClick={() => setPage(p => p + 1)} disabled={loading} className="btn-primary">
                {loading ? 'Loading\u2026' : 'Muat Lebih Banyak'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
