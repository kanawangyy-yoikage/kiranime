import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { ScrollText, ImageOff } from 'lucide-react'

export default function WebtoonPage() {
  const [trending, setTrending] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const imageProxy = (url: string) => `/api/proxy?url=${encodeURIComponent(url)}`

  useEffect(() => {
    fetch('/api/webtoon?action=trending&day=trending')
      .then(res => res.json())
      .then(data => {
        setTrending(data.items || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Webtoon fetch error:', err)
        setLoading(false)
      })
  }, [])

  return (
    <>
      <Head><title>Webtoon - KiraNime</title></Head>
      <div className="space-y-5">
        <div className="card px-5 py-4">
          <h1 className="section-title flex items-center gap-2">
            <ScrollText size={22} className="text-ocean" /> Webtoon
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Baca webtoon favorit kamu.</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[var(--color-text-muted)] text-sm">Loading webtoon...</div>
        ) : trending.length === 0 ? (
          <div className="card p-5 text-center text-[var(--color-text-muted)] text-sm">Belum ada webtoon tersedia. Coba lagi nanti.</div>
        ) : (
          <div className="anime-grid">
            {trending.map((item, i) => (
              <Link key={i} href={`/webtoon/${encodeURIComponent(item.url)}`} className="anime-card group">
                <div className="relative aspect-[3/4] bg-[var(--color-surface-alt)]">
                  {item.thumbnail ? (
                    <Image src={imageProxy(item.thumbnail)} alt={item.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[var(--color-text-muted)]">
                      <ImageOff size={24} />
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <h3 className="line-clamp-2 text-xs font-semibold leading-snug sm:text-sm text-[var(--color-text)]">{item.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
