import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { BookMarked, Frown, Share2 } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'
import {
  fetchNovelByTitle,
  fetchNovelChapters,
  fetchNovelGenresMap,
  type Novel,
  type NovelChapterItem,
} from '@/lib/api'
import ShareModal from '@/components/ShareModal'

export default function NovelDetailPage() {
  const router = useRouter()
  const { slug, title } = router.query
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)

  const novelId = typeof slug === 'string' ? slug : ''
  const titleFromQuery = typeof title === 'string' ? title : ''

  const [novel, setNovel] = useState<Novel | null>(null)
  const [chapters, setChapters] = useState<NovelChapterItem[]>([])
  const [loading, setLoading] = useState(true)
  const [shareOpen, setShareOpen] = useState(false)
  const [genreMap, setGenreMap] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!novelId) return
    let cancelled = false
    setLoading(true)
    setNovel(null)
    setChapters([])

    const load = async () => {
      // Genre list lengkap (id ↔ nama) buat ngubah chip genre jadi link yang valid.
      const genres = await fetchNovelGenresMap()
      const map: Record<string, string> = {}
      for (const g of genres) if (g.name && g.id) map[g.name.toLowerCase()] = g.id
      if (!cancelled) setGenreMap(map)

      // Detail novel di-resolve dari pencarian berdasarkan judul (endpoint REST yang
      // tersedia), supaya halaman tetap lengkap walau /novel/chapters lagi mati.
      const [byTitle, chaptersData] = await Promise.all([
        titleFromQuery ? fetchNovelByTitle(titleFromQuery) : Promise.resolve(null),
        fetchNovelChapters(novelId),
      ])
      if (cancelled) return

      if (chaptersData?.novel?.title) {
        setNovel(chaptersData.novel)
        setChapters(chaptersData.chapters || [])
      } else if (byTitle) {
        setNovel(byTitle)
      }
      setLoading(false)
    }

    load()
    return () => { cancelled = true }
  }, [novelId, titleFromQuery])

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-10 h-10 border-[3px] border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-4" />
        <p style={{ color: 'var(--color-text-muted)' }}>{t('novel.loadingDetail')}</p>
      </div>
    )
  }

  if (!novel) {
    return (
      <div className="text-center py-20 card p-6">
        <Frown className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} size={40} />
        <p className="text-xl mb-4" style={{ color: 'var(--color-text)' }}>{t('novel.notFound')}</p>
        <Link href="/novel" className="btn-primary">{t('novel.backToNovel')}</Link>
      </div>
    )
  }

  const metaItems: Array<[string, string]> = []
  if (novel.rating) metaItems.push([t('novel.rating'), novel.rating])
  if (novel.status) metaItems.push([t('novel.status'), novel.status])
  if (novel.type) metaItems.push([t('novel.type'), novel.type])
  if (novel.latestChapter) metaItems.push([t('novel.chapters').replace('{n}', ''), novel.latestChapter])
  if (novel.totalViews) metaItems.push([t('novel.views'), novel.totalViews])
  if (novel.totalWords) metaItems.push([t('novel.words'), novel.totalWords])
  if (novel.language) metaItems.push([t('novel.language'), novel.language])

  return (
    <>
      <Head>
        <title>{novel.title} - KiraStream</title>
      </Head>

      <div className="space-y-8">
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

            {metaItems.length > 0 && (
              <div className="grid grid-cols-2 gap-2 text-sm text-pearl/80">
                {metaItems.map(([label, value]) => (
                  <p key={label}><span className="text-pearl/50">{label}</span> {value}</p>
                ))}
              </div>
            )}

            {(novel.genres?.length || 0) > 0 && (
              <div className="flex flex-wrap gap-2">
                {novel.genres!.map((genreName) => {
                  const genreId = genreMap[genreName.toLowerCase()]
                  const inner = (
                    <span className="px-3 py-1 bg-ocean/20 text-pearl text-xs font-medium rounded-full transition-colors">
                      {genreName}
                    </span>
                  )
                  return genreId ? (
                    <Link key={genreName} href={`/novel/genre/${genreId}`} className="hover:bg-ocean/30 rounded-full transition-colors">
                      {inner}
                    </Link>
                  ) : (
                    <span key={genreName}>{inner}</span>
                  )
                })}
              </div>
            )}

            {(novel.tags?.length || 0) > 0 && (
              <div className="flex flex-wrap gap-2">
                {novel.tags!.map((tag) => (
                  <span key={tag} className="px-2.5 py-1 bg-pearl/[0.06] border border-pearl/10 text-pearl/60 text-xs rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <button onClick={() => setShareOpen(true)} className="btn-secondary inline-flex items-center gap-2 text-sm">
                <Share2 size={16} /> {t('share.title')}
              </button>
            </div>

            {novel.summary && (
              <div className="pt-4 border-t border-ocean/20">
                <p className="text-sm leading-relaxed text-pearl/80 whitespace-pre-line">{novel.summary}</p>
              </div>
            )}
          </div>
        </div>

        {/* Chapter list */}
        <div className="card p-6">
          <h2 className="text-xl font-bold text-pearl mb-4 flex items-center gap-2">
            <BookMarked size={20} className="text-ocean" /> {t('novel.chapters').replace('{n}', String(chapters.length))}
          </h2>

          {chapters.length === 0 ? (
            <p className="text-pearl/60">{t('novel.chaptersUnavailable')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto pr-2">
              {chapters.map((ch) => (
                <Link
                  key={ch.slug}
                  href={`/novel/read/${ch.slug}?novel=${novelId}`}
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
        <ShareModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          item={{
            kind: 'novel',
            slug: novelId,
            title: novel.title,
            image: novel.image,
            href: `/novel/${novelId}`,
          }}
        />
      </div>
    </>
  )
}
