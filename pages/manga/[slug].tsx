import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { BookOpen, Frown } from 'lucide-react'
import { fetchComicDetail, ComicDetail } from '@/lib/api'

export default function ComicDetailPage() {
  const router = useRouter()
  const { slug } = router.query

  const [comic, setComic] = useState<ComicDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug || typeof slug !== 'string') return
    const load = async () => {
      try {
        const data = await fetchComicDetail(slug)
        setComic(data)
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
        <p className="text-pearl">Mengambil detail komik...</p>
      </div>
    )
  }

  if (!comic) {
    return (
      <div className="text-center py-20 card p-6">
        <Frown className="mx-auto mb-3 text-pearl/60" size={40} />
        <p className="text-xl text-pearl mb-4">Yah... Komik tidak ditemukan</p>
        <Link href="/manga" className="btn-primary">Kembali ke Manga</Link>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{comic.title} - KiraNime</title>
      </Head>

      <div className="space-y-6">
        {/* Info Card */}
        <div className="card p-6 flex flex-col md:flex-row gap-6">
          <div className="w-48 h-72 flex-shrink-0 mx-auto md:mx-0 overflow-hidden rounded-lg bg-surface-dark">
            <img src={comic.image} alt={comic.title} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-pearl text-center md:text-left">{comic.title}</h1>
            
            <div className="grid grid-cols-2 gap-2 text-sm text-pearl/80">
              {comic.author && <p><span className="text-pearl/50">Author:</span> {comic.author}</p>}
              {comic.artist && <p><span className="text-pearl/50">Artist:</span> {comic.artist}</p>}
              {comic.status && <p><span className="text-pearl/50">Status:</span> {comic.status}</p>}
              {comic.released && <p><span className="text-pearl/50">Released:</span> {comic.released}</p>}
              {comic.type && <p><span className="text-pearl/50">Type:</span> {comic.type}</p>}
            </div>

            <div className="flex flex-wrap gap-2">
              {comic.genres.map((genre) => (
                <span key={genre} className="px-3 py-1 bg-ocean/20 hover:bg-ocean/30 text-pearl text-xs font-medium rounded-full transition-colors">
                  {genre}
                </span>
              ))}
            </div>

            {comic.description && (
              <div className="pt-4 border-t border-ocean/20">
                <p className="text-sm leading-relaxed text-pearl/80 whitespace-pre-line">{comic.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Chapter list */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-pearl mb-4 flex items-center gap-2"><BookOpen size={20} className="text-ocean" /> Daftar Chapter ({comic.chapters.length})</h2>
          
          {comic.chapters.length === 0 ? (
            <p className="text-pearl/60">Tidak ada chapter tersedia.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
              {comic.chapters.map((ch) => (
                <Link
                  key={ch.slug}
                  href={`/manga/read/${ch.slug}`}
                  className="flex items-center justify-between p-3 bg-surface-dark hover:bg-surface-hover rounded-lg transition-colors group"
                >
                  <span className="text-sm font-medium text-pearl group-hover:text-ocean transition-colors truncate">
                    {ch.title}
                  </span>
                  {ch.date && (
                    <span className="text-xs text-pearl/50 shrink-0 ml-2">{ch.date}</span>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
