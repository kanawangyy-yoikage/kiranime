import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, Frown, BookMarked } from 'lucide-react'
import { fetchNovelChapterContent, NovelChapterContent } from '@/lib/api'

export default function NovelReaderPage() {
  const router = useRouter()
  const { slug } = router.query

  const [chapter, setChapter] = useState<NovelChapterContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!slug || typeof slug !== 'string') return
    setLoading(true)
    setError(false)
    fetchNovelChapterContent(slug)
      .then((data) => {
        if (!data) setError(true)
        else setChapter(data)
      })
      .catch((err) => {
        console.error('Novel reader error:', err)
        setError(true)
      })
      .finally(() => setLoading(false))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [slug])

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
        <div className="card p-4 flex justify-between items-center gap-3">
          {chapter.parentSlug ? (
            <Link href={`/novel/${chapter.parentSlug}`} className="btn-secondary text-sm inline-flex items-center gap-1.5 shrink-0">
              <BookMarked size={16} /> Daftar Chapter
            </Link>
          ) : (
            <button onClick={() => router.back()} className="btn-secondary text-sm inline-flex items-center gap-1.5 shrink-0">
              <ArrowLeft size={16} /> Kembali
            </button>
          )}
          <h1 className="text-sm md:text-lg font-bold text-pearl text-center px-2 truncate flex-1">
            {chapter.title}
          </h1>
        </div>

        {/* Chapter text */}
        <div className="card p-6 md:p-8">
          {chapter.isHtml ? (
            <div
              className="text-[15px] leading-relaxed text-pearl/90 space-y-4 [&_p]:mb-4"
              dangerouslySetInnerHTML={{ __html: chapter.content }}
            />
          ) : (
            <div className="text-[15px] leading-relaxed text-pearl/90 whitespace-pre-line space-y-4">
              {chapter.content}
            </div>
          )}
        </div>

        {/* Navigation Bottom (prev / next chapter) */}
        <div className="card p-4 flex items-center justify-between gap-3">
          {chapter.prevSlug ? (
            <Link href={`/novel/read/${chapter.prevSlug}`} className="btn-secondary text-sm inline-flex items-center gap-1.5">
              <ChevronLeft size={16} /> Sebelumnya
            </Link>
          ) : <span />}

          {chapter.parentSlug && (
            <Link href={`/novel/${chapter.parentSlug}`} className="text-xs text-pearl/50 hover:text-pearl transition-colors">
              Daftar Chapter
            </Link>
          )}

          {chapter.nextSlug ? (
            <Link href={`/novel/read/${chapter.nextSlug}`} className="btn-secondary text-sm inline-flex items-center gap-1.5">
              Selanjutnya <ChevronRight size={16} />
            </Link>
          ) : <span />}
        </div>
      </div>
    </>
  )
}
