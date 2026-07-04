import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { BookMarked, Frown } from 'lucide-react'
import { fetchNovelChapters, NovelDetail, Novel } from '@/lib/api'

export default function NovelDetailPage() {
  const router = useRouter()
  const { slug } = router.query

  const [novel, setNovel] = useState<NovelDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug || typeof slug !== 'string') return

    // Endpoint chapters gak balikin judul/cover/sinopsis, jadi prefill dulu dari cache
    // listing (kalau ada, dari NovelGrid) biar gak nunggu kosong pas baru masuk halaman.
    try {
      const cached = sessionStorage.getItem(`novelMeta:${slug}`)
      if (cached) {
        const c: Novel = JSON.parse(cached)
        setNovel({
          id: slug,
          title: c.title,
          image: c.image,
          description: c.summary || '',
          status: c.status || '',
          author: '',
          genres: c.genres || [],
          chapters: [],
        })
      }
    } catch { /* sessionStorage gak available, gapapa */ }

    const load = async () => {
      try {
        const data = await fetchNovelChapters(slug)
        setNovel((prev) => {
          if (!data) return prev // gagal fetch chapters, tetep pertahanin info dari cache kalau ada
          return {
            ...data,
            title: data.title || prev?.title || '',
            image: data.image || prev?.image || '',
            description: data.description || prev?.description || '',
            genres: data.genres.length ? data.genres : (prev?.genres || []),
          }
        })
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
        <p className="text-pearl">Mengambil detail novel...</p>
      </div>
    )
  }

  if (!novel) {
    return (
      <div className="text-center py-20 card p-6">
        <Frown className="mx-auto mb-3 text-pearl/60" size={40} />
        <p className="text-xl text-pearl mb-4">Yah... Novel tidak ditemukan</p>
        <Link href="/novel" className="btn-primary">Kembali ke Novel</Link>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{novel.title} - KiraNime</title>
      </Head>

      <div className="space-y-6">
        {/* Info Card */}
        <div className="card p-6 flex flex-col md:flex-row gap-6">
          <div className="w-48 h-72 flex-shrink-0 mx-auto md:mx-0 overflow-hidden rounded-lg bg-surface-dark">
            {novel.image ? (
              <img src={`/api/proxy?url=${encodeURIComponent(novel.image)}`} alt={novel.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-pearl/40 text-sm">No Image</div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-pearl text-center md:text-left">{novel.title}</h1>

            <div className="grid grid-cols-2 gap-2 text-sm text-pearl/80">
              {novel.author && <p><span className="text-pearl/50">Author:</span> {novel.author}</p>}
              {novel.status && <p><span className="text-pearl/50">Status:</span> {novel.status}</p>}
            </div>

            {novel.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {novel.genres.map((genre) => (
                  <span key={genre} className="px-3 py-1 bg-ocean/20 hover:bg-ocean/30 text-pearl text-xs font-medium rounded-full transition-colors">
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {novel.description && (
              <div className="pt-4 border-t border-ocean/20">
                <p className="text-sm leading-relaxed text-pearl/80 whitespace-pre-line">{novel.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Chapter list */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-pearl mb-4 flex items-center gap-2"><BookMarked size={20} className="text-ocean" /> Daftar Chapter ({novel.chapters.length})</h2>

          {novel.chapters.length === 0 ? (
            <p className="text-pearl/60">Tidak ada chapter tersedia.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
              {novel.chapters.map((ch) => (
                <Link
                  key={ch.slug}
                  href={`/novel/read/${novel.id}/${ch.slug}`}
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
