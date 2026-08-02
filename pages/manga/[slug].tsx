import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { BookOpen, Frown, Share2 } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'
import { fetchComicDetail, ComicDetail } from '@/lib/api'
import ShareModal from '@/components/ShareModal'

export default function ComicDetailPage() {
  const router = useRouter()
  const { slug } = router.query
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)

  const [comic, setComic] = useState<ComicDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [shareOpen, setShareOpen] = useState(false)

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
        <div className="w-10 h-10 border-[3px] border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-4" />
        <p style={{ color: 'var(--color-text-muted)' }}>{t('manga.loadingDetail')}</p>
      </div>
    )
  }

  if (!comic) {
    return (
      <div className="text-center py-20 card p-6">
        <Frown className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} size={40} />
        <p className="text-xl mb-4" style={{ color: 'var(--color-text)' }}>{t('manga.notFound')}</p>
        <Link href="/manga" className="btn-primary">{t('manga.backToManga')}</Link>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{comic.title} - KiraStream</title>
      </Head>

      <div className="space-y-6">
        {/* Info Card */}
        <div className="card p-6 flex flex-col md:flex-row gap-6">
          <div className="w-48 h-72 flex-shrink-0 mx-auto md:mx-0 overflow-hidden rounded-lg bg-surface-dark">
            {comic.image ? (
              <img src={`/api/proxy?url=${encodeURIComponent(comic.image)}`} alt={comic.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-pearl/40 text-sm">No Image</div>
            )}
          </div>

          <div className="flex-1 space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-pearl text-center md:text-left">{comic.title}</h1>
            
            <div className="grid grid-cols-2 gap-2 text-sm text-pearl/80">
              {comic.author && <p><span className="text-pearl/50">{t('manga.author')}</span> {comic.author}</p>}
              {comic.artist && <p><span className="text-pearl/50">{t('manga.artist')}</span> {comic.artist}</p>}
              {comic.status && <p><span className="text-pearl/50">{t('manga.status')}</span> {comic.status}</p>}
              {comic.released && <p><span className="text-pearl/50">{t('manga.released')}</span> {comic.released}</p>}
              {comic.type && <p><span className="text-pearl/50">{t('manga.type')}</span> {comic.type}</p>}
            </div>

            <div className="flex flex-wrap gap-2">
              {comic.genres.map((genre) => (
                <span key={genre} className="px-3 py-1 bg-ocean/20 hover:bg-ocean/30 text-pearl text-xs font-medium rounded-full transition-colors">
                  {genre}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button onClick={() => setShareOpen(true)} className="btn-secondary inline-flex items-center gap-2 text-sm">
                <Share2 size={16} /> {t('share.title')}
              </button>
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
          <h2 className="text-xl font-bold text-pearl mb-4 flex items-center gap-2"><BookOpen size={20} className="text-ocean" /> {t('manga.chapters').replace('{n}', String(comic.chapters.length))}</h2>
          
          {comic.chapters.length === 0 ? (
            <p className="text-pearl/60">{t('manga.noChapters')}</p>
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

        {/* Share Modal */}
        {comic && (
          <ShareModal
            open={shareOpen}
            onClose={() => setShareOpen(false)}
            item={{
              kind: 'manga',
              slug: slug as string,
              title: comic.title,
              image: comic.image,
              href: `/manga/${slug}`,
            }}
          />
        )}
      </div>
    </>
  )
}
