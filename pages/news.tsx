import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Newspaper, TrendingUp, CalendarDays, ExternalLink, Loader2 } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'

interface SeasonItem {
  mal_id: number
  title: string
  images: { jpg: { image_url: string } }
  score: number | null
  year: number
  season: string
  type: string
  url: string
}

type Tab = 'now' | 'upcoming'

export default function NewsPage() {
  const [tab, setTab] = useState<Tab>('now')
  const [items, setItems] = useState<SeasonItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)

  useEffect(() => {
    setLoading(true)
    setError('')
    const endpoint = tab === 'now' ? 'seasons/now' : 'seasons/upcoming'
    fetch(`https://api.jikan.moe/v4/${endpoint}?limit=20`)
      .then((res) => {
        if (!res.ok) throw new Error('bad status')
        return res.json()
      })
      .then((data) => setItems((data.data || []).slice(0, 20)))
      .catch(() => setError(t('news.loadError')))
      .finally(() => setLoading(false))
  }, [tab])

  return (
    <>
      <Head><title>{t('news.title')}</title></Head>
      <div className="space-y-8">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Newspaper size={22} className="text-ocean" /> {t('news.heading')}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {t('news.subtitle')}
          </p>
        </div>

        <div className="flex gap-2 border-b border-ocean/10 pb-3">
          <button onClick={() => setTab('now')} className={`tab flex items-center gap-1.5 ${tab === 'now' ? 'active' : ''}`}>
            <TrendingUp size={15} /> {t('news.now')}
          </button>
          <button onClick={() => setTab('upcoming')} className={`tab flex items-center gap-1.5 ${tab === 'upcoming' ? 'active' : ''}`}>
            <CalendarDays size={15} /> {t('news.upcoming')}
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center min-h-[30vh]">
            <Loader2 size={28} className="animate-spin text-ocean" />
          </div>
        )}

        {error && <div className="card p-8 text-center text-sm text-[var(--color-text-muted)]">{error}</div>}

        {!loading && !error && items.length === 0 && (
          <div className="card p-8 text-center text-sm text-[var(--color-text-muted)]">{t('news.empty')}</div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => (
              <a
                key={item.mal_id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-surface-dark">
                  {item.images?.jpg?.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/api/proxy?url=${encodeURIComponent(item.images.jpg.image_url)}`}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)] text-xs">No Image</div>
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium text-[var(--color-text)] group-hover:text-ocean transition-colors line-clamp-2">
                    {item.title}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    {item.type ? `${item.type} • ` : ''}
                    {item.score ? `⭐ ${item.score}` : 'N/A'}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}

        <div className="card p-4 text-xs text-[var(--color-text-muted)] flex items-center gap-2">
          <ExternalLink size={13} />
          {t('news.dataFrom')}{' '}
          <a href="https://myanimelist.net" target="_blank" rel="noopener noreferrer" className="text-ocean hover:underline">
            MyAnimeList
          </a>{' '}
          {t('news.viaJikan')}
        </div>
      </div>
    </>
  )
}
