import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { ScrollText, ImageOff } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'
import CategorySearchBar from '@/components/CategorySearchBar'
import LandscapeSpotlight from '@/components/LandscapeSpotlight'

interface WebtoonItem {
  title: string
  thumbnail?: string
  url: string
}

export default function WebtoonPage() {
  const router = useRouter()
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)
  const day = typeof router.query.day === 'string' ? router.query.day : 'trending'

  const [items, setItems] = useState<WebtoonItem[]>([])
  const [loading, setLoading] = useState(true)
  const imageProxy = (url: string) => `/api/proxy?url=${encodeURIComponent(url)}`

  useEffect(() => {
    if (!router.isReady) return
    let cancelled = false
    setLoading(true)
    fetch(`/api/webtoon?action=trending&day=${encodeURIComponent(day)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        setItems(data.items || [])
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Webtoon fetch error:', err)
        setItems([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [day, router.isReady])

  return (
    <>
      <Head><title>{t('webtoon.pageTitle').replace('{label}', t('nav.webtoon'))}</title></Head>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <ScrollText size={22} className="text-ocean" aria-hidden="true" /> {t('nav.webtoon')}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{t('webtoon.subtitle')}</p>
          </div>
          <CategorySearchBar type="webtoon" placeholder={t('search.placeholderWebtoon')} />
        </div>

        {/* Featured landscape */}
        {!loading && items.length > 0 && (
          <LandscapeSpotlight
            kind="comic"
            title={items[0].title}
            href={`/webtoon/${encodeURIComponent(items[0].url)}`}
            image={items[0].thumbnail || ''}
            imageProxy={(url) => `/api/proxy?url=${encodeURIComponent(url)}`}
          />
        )}

        {loading ? (
          <div className="anime-grid">
            {[...Array(12)].map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="card p-5 text-center text-[var(--color-text-muted)] text-sm">
            {t('webtoon.loadError')}
          </div>
        ) : (
          <div className="anime-grid">
            {items.map((item, i) => (
              <Link key={i} href={`/webtoon/${encodeURIComponent(item.url)}`} className="anime-card group">
                <div className="relative aspect-[3/4] bg-[var(--color-surface-alt)]">
                  {item.thumbnail ? (
                    <Image src={imageProxy(item.thumbnail)} alt={item.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[var(--color-text-muted)]">
                      <ImageOff size={24} aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <h3 className="line-clamp-2 text-xs font-semibold leading-snug sm:text-sm text-[var(--color-text)]">{item.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
