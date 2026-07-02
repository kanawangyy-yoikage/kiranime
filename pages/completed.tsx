import { useState, useEffect } from 'react'
import Head from 'next/head'
import { CheckCircle } from 'lucide-react'
import AnimeGrid from '@/components/AnimeGrid'
import { fetchCompleted, type Anime } from '@/lib/api'

export default function CompletedPage() {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = await fetchCompleted(page)
      setAnimes(prev => page === 1 ? data : [...prev, ...data])
      setLoading(false)
    }
    load()
  }, [page])

  return (
    <>
      <Head><title>Anime Selesai - KiraNime</title></Head>
      <div className="space-y-6">
        <div className="card p-6">
          <h1 className="section-title flex items-center gap-2"><CheckCircle size={22} className="text-ocean" /> Anime Selesai</h1>
          <p className="text-pearl/60">Koleksi anime yang sudah selesai tayang.</p>
        </div>
        {loading && page === 1 ? (
          <div className="text-center py-12"><div className="w-16 h-16 border-4 border-ocean/30 border-t-ocean rounded-full animate-spin mx-auto" /></div>
        ) : (
          <>
            <AnimeGrid animes={animes} />
            {animes.length > 0 && (
              <div className="text-center">
                <button onClick={() => setPage(p => p + 1)} disabled={loading} className="btn-primary">
                  {loading ? 'Loading...' : 'Muat Lebih Banyak'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
