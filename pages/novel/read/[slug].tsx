import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { getNovelPages } from '@/lib/novel'

export default function NovelReadPage() {
  const router = useRouter()
  const { slug } = router.query
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug || typeof slug !== 'string') return
    getNovelPages(decodeURIComponent(slug)).then(setImages).finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="text-center py-12 text-pearl/60">Loading reader...</div>

  return (
    <>
      <Head><title>Reader - KiraNime</title></Head>
      <div className="space-y-4 max-w-3xl mx-auto">
        {images.length === 0 ? (
          <div className="card p-6 text-center text-pearl/60">Tidak ada gambar chapter yang bisa di-scrape dari source ini.</div>
        ) : images.map((img, idx) => <img key={idx} src={img} alt={`page ${idx+1}`} className="w-full h-auto" />)}
      </div>
    </>
  )
}
