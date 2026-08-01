// pages/webtoon/read/[slug].tsx
import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { ArrowLeft, Frown } from 'lucide-react'
import ReaderScrollControls from '@/components/ReaderScrollControls'

export default function WebtoonReader() {
  const router = useRouter()
  const { slug } = router.query
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const imageProxy = (url: string) => `/api/proxy?url=${encodeURIComponent(url)}`

  useEffect(() => {
    if (!slug || typeof slug !== 'string') return
    const episodeUrl = decodeURIComponent(slug)
    setLoading(true)
    setError(false)
    fetch(`/api/webtoon?action=pages&url=${encodeURIComponent(episodeUrl)}`)
      .then(res => res.json())
      .then(data => {
        if (!data.images || data.images.length === 0) {
          setError(true)
        } else {
          setImages(data.images)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Reader error:', err)
        setError(true)
        setLoading(false)
      })
  }, [slug])

  return (
    <>
      <Head><title>Membaca Webtoon - KiraStream</title></Head>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-[3px] border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-4" />
          <p style={{ color: 'var(--color-text-muted)' }}>Membuka episode\u2026</p>
        </div>
      ) : error || images.length === 0 ? (
        <div className="text-center py-20 card p-6">
          <Frown className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} size={40} />
          <p className="text-xl mb-4" style={{ color: 'var(--color-text)' }}>Episode ini gagal kebuka atau memang belum ada isinya</p>
          <button onClick={() => router.back()} className="btn-primary">Kembali</button>
        </div>
      ) : (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="card p-4 flex justify-between items-center">
            <button onClick={() => router.back()} className="btn-secondary text-sm inline-flex items-center gap-1.5">
              <ArrowLeft size={16} /> Kembali
            </button>
          </div>

          <div className="flex flex-col items-center bg-black rounded-lg overflow-hidden py-4 shadow-xl border border-ocean/10">
            {images.map((imgUrl, index) => (
              <div key={index} className="w-full relative">
                <img
                  src={imageProxy(imgUrl)}
                  alt={`Panel ${index + 1}`}
                  className="w-full h-auto select-none"
                  loading={index < 3 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>

          <div className="card p-4 flex justify-center">
            <button onClick={() => router.back()} className="btn-secondary">Kembali ke Episode</button>
          </div>
        </div>
      )}

      <ReaderScrollControls />
    </>
  )
}
