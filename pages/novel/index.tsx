import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { BookMarked, ChevronLeft, ChevronRight, LayoutGrid, BookOpen } from 'lucide-react'
import NovelGrid from '@/components/NovelGrid'
import CategorySearchBar from '@/components/CategorySearchBar'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'
import { fetchNovelHome, fetchNovelGenres, enrichNovelCovers, type Novel, type NovelGenreTag } from '@/lib/api'

export default function NovelListPage() {
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)
  const [novels, setNovels] = useState<Novel[]>([])
  const [genres, setGenres] = useState<NovelGenreTag[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchNovelGenres().then(setGenres)
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const data = await fetchNovelHome(page)
      if (cancelled) return
      setNovels(data)
      setLoading(false)
      window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })

      const enriched = await enrichNovelCovers(data)
      if (!cancelled) setNovels(enriched)
    }
    load()
    return () => { cancelled = true }
  }, [page])

  const quickMenu = [
    ...genres.slice(0, 7).map((g) => ({ label: g.name, href: `/novel/genre/${g.slug}` })),
  ]

  return (
    <>
      <Head><title>{t('novel.title')}</title></Head>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="section-title flex items-center gap-2"><BookMarked size={22} className="text-ocean" aria-hidden="true" /> {t('novel.heading')}</h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{t('novel.subtitle')}</p>
          </div>
          <CategorySearchBar type="novel" placeholder={t('search.placeholderNovel')} />
        </div>

        {/* Quick Menu */}
        {quickMenu.length > 0 && (
          <div className="card p-4">
            <h3 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
              <LayoutGrid size={16} className="text-ocean" aria-hidden="true" /> {t('common.quickMenu')}
            </h3>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
              <Link
                href="/novel"
                className="flex flex-col items-center gap-1.5 rounded-xl border border-primary bg-primary/10 px-2 py-3 text-center text-xs font-semibold text-primary dark:border-accent dark:bg-accent/15 dark:text-accent"
              >
                <BookOpen size={18} className="text-ocean" aria-hidden="true" />
                {t('novel.all')}
              </Link>
              {quickMenu.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center justify-center rounded-xl border border-pearl/10 bg-pearl/[0.03] px-2 py-3 text-center text-xs font-semibold text-text-light/70 dark:text-text-dark/70 hover:border-ocean/40 hover:text-primary dark:hover:text-accent transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Genres */}
        {genres.length > 0 && (
          <div className="card p-4">
            <h3 className="font-bold text-sm uppercase tracking-wider mb-3">{t('novel.allGenres')}</h3>
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <Link
                  key={g.slug}
                  href={`/novel/genre/${g.slug}`}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors bg-pearl/[0.04] border border-pearl/10 text-text-light/70 dark:text-text-dark/70 hover:bg-ocean hover:text-white"
                >
                  {g.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}
          </div>
        ) : novels.length === 0 ? (
          <div className="card p-6 text-center" style={{ color: 'var(--color-text-muted)' }}>{t('novel.loadError')}</div>
        ) : (
          <>
            <NovelGrid novels={novels} />
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="btn-secondary inline-flex items-center gap-1 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} aria-hidden="true" /> {t('common.previous')}
              </button>
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('novel.page').replace('{page}', String(page))}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                className="btn-secondary inline-flex items-center gap-1 text-sm"
              >
                {t('common.next')} <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}
