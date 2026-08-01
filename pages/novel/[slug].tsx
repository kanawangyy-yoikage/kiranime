import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { BookMarked, Frown, Share2 } from 'lucide-react'
import { fetchNovelDetail, fetchNovelCoverByTitle, NovelDetail } from '@/lib/api'
import ShareModal from '@/components/ShareModal'

export default function NovelDetailPage() {
  const router = useRouter()
  const { slug } = router.query

  const [novel, setNovel] = useState<NovelDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [shareOpen, setShareOpen] = useState(false)

  useEffect(() => {
    if (!slug || typeof slug !== 'string') return
    let cancelled = false
    setLoading(true)
    fetchNovelDetail(slug)
      .then(async (data) => {
        if (cancelled || !data) return
        setNovel(data)
        setLoading(false)
        // cari covernya belakangan (biar detail utama gak nunggu), update begitu ketemu
        const cover = await fetchNovelCoverByTitle(data.title)
        if (!cancelled && cover) setNovel((prev) => (prev ? { ...prev, image: cover } : prev))
      })
      .catch((err) => console.error(err))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [slug])

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-[3px] border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-4" />
        <p style={{ color: 'var(--color-text-muted)' }}>Mengambil detail novel\u2026</p>
      </div>
    )
  }

  if (!novel) {
    return (
      <div className="text-center py-20 card p-6">
        <Frown className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} size={40} />
        <p className="text-xl mb-4" style={{ color: 'var(--color-text)' }}>Waduh, novelnya nggak ketemu</p>
        <Link href="/novel" className="btn-primary">Kembali ke Novel</Link>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{novel.title} - KiraStream</title>
      </Head>

      <div className="space-y-6">
        {/* Info Card */}
        <div className="card p-6 flex flex-col md:flex-row gap-6">
          <div className="w-48 h-72 flex-shrink-0 mx-auto md:mx-0 overflow-hidden rounded-lg bg-surface-dark">
            {novel.image ? (
              <img
                src={novel.image}
                alt={novel.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.currentTarget
                  target.style.display = 'none'
                  const fallback = target.nextElementSibling as HTMLElement | null
                  if (fallback) fallback.style.display = 'flex'
                }}
              />
            ) : null}
            <div
              className="w-full h-full items-center justify-center text-pearl/40 text-sm"
              style={{ display: novel.image ? 'none' : 'flex' }}
            >
              No Image
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-pearl text-center md:text-left">{novel.title}</h1>
            {novel.altTitle && novel.altTitle !== novel.title && (
              <p className="text-sm text-pearl/50 text-center md:text-left -mt-3">{novel.altTitle}</p>
            )}

            <div className="grid grid-cols-2 gap-2 text-sm text-pearl/80">
              {novel.author && <p><span className="text-pearl/50">Author:</span> {novel.author}</p>}
              {novel.status && <p><span className="text-pearl/50">Status:</span> {novel.status}</p>}
              {novel.type && <p><span className="text-pearl/50">Tipe:</span> {novel.type}</p>}
              {novel.rating && <p><span className="text-pearl/50">Rating:</span> {novel.rating}</p>}
              {novel.country && <p><span className="text-pearl/50">Negara:</span> {novel.country}</p>}
              {novel.published && <p><span className="text-pearl/50">Terbit:</span> {novel.published}</p>}
            </div>

            {novel.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {novel.genres.map((genre) => (
                  <Link
                    key={genre.slug || genre.name}
                    href={`/novel/genre/${genre.slug}`}
                    className="px-3 py-1 bg-ocean/20 hover:bg-ocean/30 text-pearl text-xs font-medium rounded-full transition-colors"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <button onClick={() => setShareOpen(true)} className="btn-secondary inline-flex items-center gap-2 text-sm">
                <Share2 size={16} /> Bagikan
              </button>
            </div>

            {novel.synopsis && (
              <div className="pt-4 border-t border-ocean/20">
                <p className="text-sm leading-relaxed text-pearl/80 whitespace-pre-line">{novel.synopsis}</p>
              </div>
            )}
          </div>
        </div>

        {/* Chapter list */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-pearl mb-4 flex items-center gap-2"><BookMarked size={20} className="text-ocean" /> Daftar Chapter ({novel.chapters.length})</h2>

          {novel.chapters.length === 0 ? (
            <p className="text-pearl/60">Chapternya belum ada nih, coba cek lagi nanti.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
              {novel.chapters.map((ch) => (
                <Link
                  key={ch.slug}
                  href={`/novel/read/${ch.slug}`}
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

        {/* Share Modal */}
        {novel && (
          <ShareModal
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            item={{
              kind: 'novel',
              slug: slug as string,
              title: novel.title,
              image: novel.image,
              href: `/novel/${slug}`,
            }}
          />
        )}
      </div>
    </>
  )
}
