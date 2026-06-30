import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { getNovelDetail } from '@/lib/novel'

export default function NovelDetailPage() {
  const router = useRouter()
  const { slug } = router.query
  const [novel, setNovel] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug || typeof slug !== 'string') return
    const url = decodeURIComponent(slug)
    getNovelDetail(url).then(setNovel).finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="text-center py-12 text-pearl/60">Loading...</div>
  if (!novel) return <div className="text-center py-12 text-pearl/60">Novel tidak ditemukan</div>

  return (
    <>
      <Head><title>{novel.title} - KiraNime</title></Head>
      <div className="space-y-6">
        <div className="card p-6 flex gap-6 flex-col md:flex-row">
          <div className="w-48 h-72 flex-shrink-0 overflow-hidden rounded-lg bg-surface-dark mx-auto md:mx-0">
            {novel.thumbnail ? <img src={novel.thumbnail} alt={novel.title} className="w-full h-full object-cover" /> : null}
          </div>
          <div className="flex-1 space-y-3">
            <h1 className="text-2xl font-bold text-pearl">{novel.title}</h1>
            <p className="text-sm text-pearl/60">{novel.author}</p>
            <p className="text-sm text-pearl/80 whitespace-pre-line">{novel.synopsis}</p>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="section-title">Episode</h2>
          <p className="text-pearl/60">Scrape episode list belum disambungkan ke API route. Langsung baca chapter via URL episode kalau source tersedia.</p>
          <div className="mt-4">
            <Link href={`/novel/read/${encodeURIComponent(novel.url)}`} className="btn-primary">Buka Reader</Link>
          </div>
        </div>
      </div>
    </>
  )
}
