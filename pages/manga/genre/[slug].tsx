import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Tags } from 'lucide-react'
import ComicGrid from '@/components/ComicGrid'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'
import { fetchComicByGenre, type Comic } from '@/lib/api'

export default function MangaGenrePage() {
  const router = useRouter()
  const slug = typeof router.query.slug === 'string' ? router.query.slug : ''
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)
  const genreName = slug.replace(/-/g, ' ')

  const [comics, setComics] = useState<Comic[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
    setComics([])
  }, [slug])

  useEffect(() => {
    if (!slug) return
    const load = async () => {
      setLoading(true)
      const data = await fetchComicByGenre(slug, page)
      setComics((prev) => (page === 1 ? data : [...prev, ...data]))
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, page])

  return (
    <>
      <Head><title>{t('genre.title').replace('{name}', genreName)} - Manga - KiraStream</title></Head>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="section-title flex items-center gap-2">
              <Tags size={22} style={{ color: 'var(--color-primary)' }} aria-hidden="true" /> {t('genre.title').replace('{name}', genreName)}
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('genre.comicSubtitle')}</p>
          </div>
          <Link href="/manga" className="btn-secondary text-sm">{t('genre.backToComics')}</Link>
        </div>

        {loading && page === 1 ? (
          <div className="anime-grid">
            {[...Array(12)].map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}
          </div>
        ) : comics.length === 0 ? (
          <div className="card p-6 text-center" style={{ color: 'var(--color-text-muted)' }}>{t('genre.noComics')}</div>
        ) : (
          <>
            <ComicGrid comics={comics} />
            <div className="text-center">
              <button onClick={() => setPage(p => p + 1)} disabled={loading} className="btn-secondary">
                {loading ? t('common.loading') : t('common.loadMore')}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
