import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { fetchChapterPages, ChapterPages } from '@/lib/api'

export default function ChapterReaderPage() {
  const router = useRouter()
  const { slug } = router.query

  const [chapter, setChapter] = useState<ChapterPages | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug || typeof slug !== 'string') return
    const load = async () => {
      try {
        const data = await fetchChapterPages(slug)
        setChapter(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 border-4 border-ocean/30 border-t-ocean rounded-full animate-spin mx-auto mb-4" />
        <p className="text-pearl">Membuka lembaran chapter...</p>
      </div>
    )
  }

  if (!chapter || !chapter.pages || chapter.pages.length === 0) {
    return (
      <div className="text-center py-20 card p-6">
        <p className="text-xl text-pearl mb-4">Yah... Halaman chapter kosong atau gagal dimuat 😭</p>
        <button onClick={() => router.back()} className="btn-primary">Kembali</button>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{chapter.title || 'Baca Manga'} - KiraNime 🌸</title>
      </Head>

      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Navigation Top */}
        <div className="card p-4 flex justify-between items-center">
          <button onClick={() => router.back()} className="btn-secondary text-sm">
            ← Detail Komik
          </button>
          <h1 className="text-sm md:text-lg font-bold text-pearl text-center px-4 truncate flex-1">
            {chapter.title}
          </h1>
        </div>

        {/* Comic Pages list */}
        <div className="flex flex-col items-center bg-noir rounded-lg overflow-hidden py-4 shadow-xl border border-ocean/10">
          {chapter.pages.map((imgUrl, index) => (
            <div key={index} className="w-full max-w-3xl relative">
              <img
                src={imgUrl}
                alt={`Halaman ${index + 1}`}
                className="w-full h-auto select-none"
                loading={index < 3 ? 'eager' : 'lazy'}
              />
              <div className="absolute bottom-2 right-2 bg-noir/70 text-white text-xs px-2 py-1 rounded">
                {index + 1} / {chapter.pages.length}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Bottom */}
        <div className="card p-4 flex justify-center gap-4">
          <button onClick={() => router.back()} className="btn-secondary">
            Kembali ke Daftar Chapter
          </button>
        </div>
      </div>
    </>
  )
}
