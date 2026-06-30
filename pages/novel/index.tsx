import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'

export default function NovelPage() {
  const [trending, setTrending] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/novel?action=trending&day=trending')
      .then(res => res.json())
      .then(data => {
        setTrending(data.items || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Novel fetch error:', err)
        setLoading(false)
      })
  }, [])

  return (
    <>
      <Head><title>Novel - KiraNime 🌸</title></Head>
      <div className="space-y-6">
        <div className="card p-6">
          <h1 className="section-title">📚 Novel</h1>
          <p className="text-pearl/60">Baca novel webtoon favorit kamu~ 🌸</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-pearl/60">Loading novel...</div>
        ) : trending.length === 0 ? (
          <div className="card p-6 text-center text-pearl/60">Belum ada novel tersedia. Coba lagi nanti ya! 🌸</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {trending.map((item, i) => (
              <Link key={i} href={`/novel/${encodeURIComponent(item.url)}`} className="card group">
                <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg bg-surface-dark">
                  {item.thumbnail ? <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /> : <div className="w-full h-full flex items-center justify-center text-pearl/40">No Image</div>}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-pearl line-clamp-2">{item.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
