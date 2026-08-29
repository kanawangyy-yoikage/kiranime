import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { ScrollText, ImageOff } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'
import Section from '@/components/Section'
import CategorySearchBar from '@/components/CategorySearchBar'
import LandscapeSlider from '@/components/LandscapeSlider'
import LandscapeSpotlight from '@/components/LandscapeSpotlight'
import WebtoonMenuAside from '@/components/WebtoonMenuAside'
import type { SpotlightItem } from '@/components/LandscapeSpotlight'

interface WebtoonItem {
  title: string
  thumbnail?: string
  url: string
}

const imageProxy = (url: string) => `/api/proxy?url=${encodeURIComponent(url)}`

function toSpotlight(item: WebtoonItem): SpotlightItem {
  return {
    kind: 'comic',
    title: item.title,
    href: `/webtoon/${encodeURIComponent(item.url)}`,
    image: item.thumbnail || '',
  }
}

export default function WebtoonPage() {
  const router = useRouter()
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)
  const day = typeof router.query.day === 'string' ? router.query.day : ''

  const [trending, setTrending] = useState<WebtoonItem[]>([])
  const [completed, setCompleted] = useState<WebtoonItem[]>([])
  const [items, setItems] = useState<WebtoonItem[]>([])
  const [loading, setLoading] = useState(true)

  const isDayMode = day !== ''

  useEffect(() => {
    if (!router.isReady) return
    let cancelled = false
    setLoading(true)

    if (isDayMode) {
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
    } else {
      Promise.allSettled([
        fetch('/api/webtoon?action=trending&day=trending').then((res) => res.json()),
        fetch('/api/webtoon?action=trending&day=completed').then((res) => res.json()),
      ])
        .then(([trendingRes, completedRes]) => {
          if (cancelled) return
          setTrending(trendingRes.status === 'fulfilled' ? trendingRes.value.items || [] : [])
          setCompleted(completedRes.status === 'fulfilled' ? completedRes.value.items || [] : [])
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }

    return () => {
      cancelled = true
    }
  }, [day, router.isReady, isDayMode])

  const spotlightPool = [...trending, ...completed].filter(
    (w, i, arr) => arr.findIndex((x) => x.url === w.url) === i
  )
  const slides = spotlightPool.slice(0, 6).map(toSpotlight)

  const gridCard = (item: WebtoonItem) => (
    <Link href={`/webtoon/${encodeURIComponent(item.url)}`} className="anime-card group">
      <div className="relative aspect-[3/4] bg-[var(--color-surface-alt)]">
        {item.thumbnail ? (
          <Image
            src={imageProxy(item.thumbnail)}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--color-text-muted)]">
            <ImageOff size={20} aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="line-clamp-2 text-xs font-semibold leading-snug sm:text-sm text-[var(--color-text)]">
          {item.title}
        </h3>
      </div>
    </Link>
  )

  // Day mode: listing per-hari (deep-link target untuk viewAll + menu aside)
  if (isDayMode) {
    return (
      <>
        <Head><title>{t('webtoon.pageTitle').replace('{label}', t('nav.webtoon'))}</title></Head>
        <div className="flex items-start gap-6">
          <div className="flex-1 min-w-0 space-y-12 md:space-y-16">
            {/* Header + Search */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="page-title flex items-center gap-2">
                  <ScrollText size={24} className="text-ocean" aria-hidden="true" /> {t('nav.webtoon')}
                </h1>
                <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {t('webtoon.subtitle')}
                </p>
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
                imageProxy={imageProxy}
              />
            )}

            {loading ? (
              <div className="anime-grid">
                {[...Array(12)].map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}
              </div>
            ) : items.length === 0 ? (
              <div className="card p-5 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {t('webtoon.loadError')}
              </div>
            ) : (
              <div className="anime-grid">
                {items.map((item, i) => <div key={i}>{gridCard(item)}</div>)}
              </div>
            )}
          </div>

          <WebtoonMenuAside />
        </div>
      </>
    )
  }

  // ─── DEFAULT BERANDA ────────────────────────────────────────
  return (
    <>
      <Head><title>{t('webtoon.pageTitle').replace('{label}', t('nav.webtoon'))}</title></Head>
      <div className="flex items-start gap-6">
        <div className="flex-1 min-w-0 space-y-12 md:space-y-16">
          {/* Header + Search */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="page-title flex items-center gap-2">
                <ScrollText size={24} className="text-ocean" aria-hidden="true" /> {t('nav.webtoon')}
              </h1>
              <p className="mt-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {t('webtoon.subtitle')}
              </p>
            </div>
            <CategorySearchBar type="webtoon" placeholder={t('search.placeholderWebtoon')} />
          </div>

          {/* Slider geser */}
          {loading ? (
            <div className="skeleton min-h-[220px] rounded-3xl" />
          ) : slides.length > 0 ? (
            <LandscapeSlider kind="comic" items={slides} imageProxy={imageProxy} />
          ) : null}

          {/* Trending */}
          <Section title={t('nav.webtoon')} jp="トレンド" viewAll="/webtoon?day=trending">
            {loading ? (
              <div className="anime-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}</div>
            ) : trending.length === 0 ? (
              <div className="card p-5 text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('home.webtoonError')}</div>
            ) : (
              <>
                <LandscapeSpotlight
                  kind="comic"
                  title={trending[0].title}
                  href={`/webtoon/${encodeURIComponent(trending[0].url)}`}
                  image={trending[0].thumbnail || ''}
                  imageProxy={imageProxy}
                />
                <div className="anime-grid">
                  {trending.slice(1, 9).map((item) => <div key={item.url}>{gridCard(item)}</div>)}
                </div>
              </>
            )}
          </Section>

          {/* Completed */}
          <Section title={t('section.finishedReading')} jp="読了" viewAll="/webtoon?day=completed">
            {loading ? (
              <div className="anime-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}</div>
            ) : completed.length === 0 ? (
              <div className="card p-5 text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('home.webtoonError')}</div>
            ) : (
              <div className="anime-grid">
                {completed.slice(0, 8).map((item) => <div key={item.url}>{gridCard(item)}</div>)}
              </div>
            )}
          </Section>
        </div>

        <WebtoonMenuAside />
      </div>
    </>
  )
}