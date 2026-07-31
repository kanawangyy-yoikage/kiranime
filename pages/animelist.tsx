import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { ListOrdered } from 'lucide-react'
import AnimeGrid from '@/components/AnimeGrid'
import AZList from '@/components/AZList'
import { fetchAnimeList, type Anime } from '@/lib/api'

export default function AnimeListPage() {
  const router = useRouter()
  const letter = typeof router.query.letter === 'string' ? router.query.letter.toLowerCase() : 'a'

  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
    setAnimes([])
  }, [letter])

  useEffect(() => {
    if (!router.isReady) return
    const load = async () => {
      setLoading(true)
      const data = await fetchAnimeList(letter, page)
      setAnimes((prev) => (page === 1 ? data : [...prev, ...data]))
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letter, page, router.isReady])

  return (
    <>
      <Head>
        <title>Anime A-Z: {letter.toUpperCase()} - KiraStream</title>
      </Head>

      <div className="space-y-6">
        <div className="card p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h1 className="section-title flex items-center gap-2">
                <ListOrdered size={22} className="text-ocean" aria-hidden="true" /> Anime A-Z
              </h1>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Kumpulan anime berdasarkan huruf <span className="font-bold text-primary dark:text-accent">{letter.toUpperCase()}</span>
              </p>
            </div>
          </div>
          <AZList />
        </div>

        {loading && page === 1 ? (
          <div className="anime-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="skeleton aspect-[3/4]" />
            ))}
          </div>
        ) : animes.length === 0 ? (
          <div className="card p-6 text-center text-[var(--color-text-muted)]">
            Belum ada anime yang dimulai huruf &quot;{letter.toUpperCase()}&quot;, coba huruf lain.
          </div>
        ) : (
          <>
            <AnimeGrid animes={animes} />
            {animes.length > 0 && (
              <div className="text-center">
                <button onClick={() => setPage((p) => p + 1)} disabled={loading} className="btn-primary">
                  {loading ? 'Loading\u2026' : 'Muat Lebih Banyak'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
