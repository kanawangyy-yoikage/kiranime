import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { ArrowLeft, Frown } from 'lucide-react'
import { fetchNovelChapterContent, NovelChapterContent } from '@/lib/api'

export default function NovelReaderPage() {
  const router = useRouter()
  const { novelId, chapterId } = router.query

  const [chapter, setChapter] = useState<NovelChapterContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!novelId || !chapterId || typeof novelId !== 'string' || typeof chapterId !== 'string') return
    setLoading(true)
    setError(false)
    fetchNovelChapterContent(novelId, chapterId)
      .then((data) => {
        if (!data || !data.content) {
          setError(true)
        } else {
          setChapter(data)
        }
      })
      .catch((err) => {
        console.error('Novel reader error:', err)
        setError(true)
      })
      .finally(() => setLoading(false))
  }, [novelId, chapterId])

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 border-4 border-ocean/30 border-t-ocean rounded-full animate-spin mx-auto mb-4" />
        <p className="text-pearl">Membuka chapter...</p>
      </div>
    )
  }

  if (error || !chapter) {
    return (
      <div className="text-center py-20 card p-6">
        <Frown className="mx-auto mb-3 text-pearl/60" size={40} />
        <p className="text-xl text-pearl mb-4">Yah... Chapter gagal dimuat atau kosong</p>
        <button onClick={() => router.back()} className="btn-primary">Kembali</button>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{chapter.title || 'Baca Novel'} - KiraNime</title>
      </Head>

      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Navigation Top */}
        <div className="card p-4 flex justify-between items-center">
          <button onClick={() => router.back()} className="btn-secondary text-sm inline-flex items-center gap-1.5">
            <ArrowLeft size={16} /> Daftar Chapter
          </button>
          <h1 className="text-sm md:text-lg font-bold text-pearl text-center px-4 truncate flex-1">
            {chapter.title}
          </h1>
        </div>

        {/* Chapter text */}
        <div className="card p-6 md:p-8">
          <div className="text-[15px] leading-relaxed text-pearl/90 whitespace-pre-line space-y-4">
            {chapter.content}
          </div>
        </div>

        {/* Navigation Bottom */}
        <div className="card p-4 flex justify-center">
          <button onClick={() => router.back()} className="btn-secondary">
            Kembali ke Daftar Chapter
          </button>
        </div>
      </div>
    </>
  )
}
