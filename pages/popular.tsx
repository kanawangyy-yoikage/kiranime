import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Flame } from 'lucide-react'
import AnimeGrid from '@/components/AnimeGrid'
import CategorySearchBar from '@/components/CategorySearchBar'
import AnimeMenuAside from '@/components/AnimeMenuAside'
import { fetchPopular, type Anime } from '@/lib/api'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'

export default function PopularPage() {
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const data = await fetchPopular(page)
      setAnimes(prev => page === 1 ? data : [...prev, ...data])
      setLoading(false)
    }
    load()
  }, [page])

  return (
    <>
      <Head><title>{t('page.popular.title')} - KiraStream</title></Head>
      <div className="flex items-start gap-6">
        <div className="flex-1 min-w-0 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="page-title flex items-center gap-2"><Flame size={22} className="text-ocean" aria-hidden="true" /> {t('page.popular.title')}</h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('page.popular.subtitle')}</p>
          </div>
          <CategorySearchBar type="anime" placeholder={t('hero.searchPlaceholder')} />
        </div>
        {loading && page === 1 ? (
          <div className="text-center py-12"><div className="w-10 h-10 border-[3px] border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin mx-auto" /></div>
        ) : (
          <>
            <AnimeGrid animes={animes} />
            {animes.length > 0 && (
              <div className="text-center pt-2">
                <button onClick={() => setPage(p => p + 1)} disabled={loading} className="btn-secondary">
                  {loading ? t('common.loading') : t('common.loadMore')}
                </button>
              </div>
            )}
          </>
        )}
        </div>
        <AnimeMenuAside />
      </div>
    </>
  )
}
