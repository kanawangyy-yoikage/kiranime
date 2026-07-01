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
      <Head><title>Novel - KiraNime</title></Head>
      <div className="space-y-5">
        <div className="card px-5 py-4">
          <h1 className="section-title">Novel</h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>Baca novel dan webtoon favorit kamu.</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-pearl/60">Loading novel...</div>
        ) : trending.length === 0 ? (
          <div className="card p-5 text-center" style={{ color: 'var(--color-text-muted)' }}>Belum ada novel tersedia. Coba lagi nanti.</div>
        ) : (
          <div className="anime-grid">
            {trending.map((item, i) => (
              <Link key={i} href={`/novel/${encodeURIComponent(item.url)}`} className="anime-card group">
                <div className="relative aspect-[3/4] overflow-hidden bg-surface-dark">
                  {item.thumbnail ? <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" /> : <div className="flex h-full w-full items-center justify-center text-xs" style={{ color: 'var(--color-text-muted)' }}>No Image</div>}
                </div>
                <div className="p-2.5">
                  <h3 className="line-clamp-2 text-xs font-semibold leading-snug sm:text-sm" style={{ color: 'var(--color-text)' }}>{item.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
