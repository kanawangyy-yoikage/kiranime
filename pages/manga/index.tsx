import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import type { Anime } from '@/lib/api'

export default function MangaListPage() {
  const [manga, setManga] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const imageProxy = (url: string) => `/api/proxy?url=${encodeURIComponent(url)}`

  useEffect(() => {
    fetch('/api/novel?action=trending&day=trending')
      .then(res => res.json())
      .then(data => {
        const mapped = (data.items || []).map((item: any) => ({
          title: item.title,
          slug: item.url,
          image: item.thumbnail || '',
        }))
        setManga(mapped)
        setLoading(false)
      })
      .catch(err => {
        console.error('Manga fetch error:', err)
        setLoading(false)
      })
  }, [])

  return (
    <>
      <Head><title>Manga - KiraNime</title></Head>
      <div className="space-y-6">
        <div className="card px-5 py-4">
          <h1 className="section-title">📖 Manga</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Baca manga favorit kamu.</p>
        </div>

        {loading ? (
          <div className="anime-grid">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}
          </div>
        ) : (
          <div className="anime-grid">
            {manga.map((item) => (
              <Link key={item.slug} href={`/manga/${encodeURIComponent(item.slug)}`} className="anime-card group">
                <div className="relative aspect-[3/4] bg-[var(--color-surface-alt)]">
                  <Image src={imageProxy(item.image)} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                </div>
                <div className="p-2.5">
                  <h3 className="text-xs font-semibold line-clamp-2 text-[var(--color-text)]">{item.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
