import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { ScrollText, Frown } from 'lucide-react'

interface WebtoonEpisode {
  title: string
  thumbnail: string
  url: string
}

interface WebtoonDetailData {
  title: string
  thumbnail: string
  url: string
  episodes: WebtoonEpisode[]
}

export default function WebtoonDetailPage() {
  const router = useRouter()
  const { slug } = router.query
  const [webtoon, setWebtoon] = useState<WebtoonDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const imageProxy = (url: string) => `/api/proxy?url=${encodeURIComponent(url)}`

  useEffect(() => {
    if (!slug || typeof slug !== 'string') return
    const url = decodeURIComponent(slug)
    setLoading(true)
    setError(false)
    fetch(`/api/webtoon?action=detail&url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(true)
        } else {
          setWebtoon(data)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Webtoon detail fetch error:', err)
        setError(true)
        setLoading(false)
      })
  }, [slug])

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 border-4 border-ocean/30 border-t-ocean rounded-full animate-spin mx-auto mb-4" />
        <p className="text-pearl">Mengambil detail webtoon...</p>
      </div>
    )
  }

  if (error || !webtoon) {
    return (
      <div className="text-center py-20 card p-6">
        <Frown className="mx-auto mb-3 text-pearl/60" size={40} />
        <p className="text-xl text-pearl mb-4">Yah... Webtoon tidak ditemukan</p>
        <Link href="/webtoon" className="btn-primary">Kembali ke Webtoon</Link>
      </div>
    )
  }

  return (
    <>
      <Head><title>{webtoon.title} - KiraNime</title></Head>
      <div className="space-y-6">
        <div className="card p-6 flex gap-6 flex-col md:flex-row">
          <div className="w-48 h-72 flex-shrink-0 overflow-hidden rounded-lg bg-surface-dark mx-auto md:mx-0">
            {webtoon.thumbnail ? (
              <img src={imageProxy(webtoon.thumbnail)} alt={webtoon.title} className="w-full h-full object-cover" />
            ) : null}
          </div>
          <div className="flex-1 space-y-3">
            <h1 className="text-2xl font-bold text-pearl">{webtoon.title}</h1>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold text-pearl mb-4 flex items-center gap-2">
            <ScrollText size={20} className="text-ocean" /> Daftar Episode ({webtoon.episodes?.length || 0})
          </h2>

          {!webtoon.episodes || webtoon.episodes.length === 0 ? (
            <p className="text-pearl/60">Tidak ada episode tersedia.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
              {webtoon.episodes.map((ep, i) => (
                <Link
                  key={i}
                  href={`/webtoon/read/${encodeURIComponent(ep.url)}`}
                  className="flex items-center justify-between p-3 bg-surface-dark hover:bg-surface-hover rounded-lg transition-colors group"
                >
                  <span className="text-sm font-medium text-pearl group-hover:text-ocean transition-colors truncate">
                    {ep.title || `Episode ${i + 1}`}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
