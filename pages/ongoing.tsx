import { useState, useEffect } from 'react'
import Head from 'next/head'
import { PlayCircle } from 'lucide-react'
import AnimeGrid from '@/components/AnimeGrid'
import { fetchOngoing, type Anime } from '@/lib/api'

export default function OngoingPage() {
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = await fetchOngoing(page)
      setAnimes(prev => page === 1 ? data : [...prev, ...data])
      setLoading(false)
    }
    load()
  }, [page])

  return (
    <>
      <Head><title>Anime Ongoing - KiraNime</title></Head>
      <div className="space-y-6">
        <div className="card p-6">
          <h1 className="section-title flex items-center gap-2"><PlayCircle size={22} className="text-ocean" /> Sedang Tayang</h1>
          <p className="text-pearl/60">Anime yang sedang tayang sekarang.</p>
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
