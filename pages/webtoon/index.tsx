import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import { BookOpen, Clapperboard, ImageOff, ScrollText, BookMarked } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'
import { motionTokens, adaptiveDuration } from '@/lib/motionTokens'
import Section from '@/components/Section'
import CategorySearchBar from '@/components/CategorySearchBar'
import LandscapeSpotlight from '@/components/LandscapeSpotlight'

interface WebtoonItem {
  title: string
  thumbnail?: string
  url: string
}

function textStyle(muted = false) {
  return { color: muted ? 'var(--color-text-muted)' : 'var(--color-text)' }
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
  const imageProxy = (url: string) => `/api/proxy?url=${encodeURIComponent(url)}`

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

  const reduce = useReducedMotion()
  const heroStagger = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduce ? 0 : 0.09,
        delayChildren: reduce ? 0 : 0.1,
      },
    },
  }
  const heroItem = {
    hidden: { opacity: 0, y: reduce ? 0 : motionTokens.distance.md },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: adaptiveDuration(motionTokens.duration.normal), ease: motionTokens.easing.smooth },
    },
  }

  const quickLinks = [
    { href: '/anime', label: t('nav.anime'), Icon: Clapperboard },
    { href: '/manga', label: t('nav.manga'), Icon: BookOpen },
    { href: '/webtoon', label: t('nav.webtoon'), Icon: ScrollText },
    { href: '/novel', label: t('nav.novel'), Icon: BookMarked },
  ]

  // Day mode: keep the existing day-filtered listing (deep-link target for viewAll)
  if (isDayMode) {
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

  // Default beranda view
  return (
    <>
      <Head><title>{t('webtoon.pageTitle').replace('{label}', t('nav.webtoon'))}</title></Head>
      <div className="space-y-12 md:space-y-16">
        {/* Hero / Landing */}
        <section className="hero-panel relative overflow-hidden rounded-3xl border px-6 py-16 md:px-10 md:py-24">
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute inset-0 bg-gradient-to-br from-ocean/10 via-transparent to-accent/10 dark:from-ocean/15 dark:via-transparent dark:to-accent/15" />
            <div className="absolute inset-0 bg-gradient-to-b from-surface/80 via-surface/60 to-surface dark:from-noir/70 dark:via-noir/50 dark:to-noir" />
          </div>

          <motion.div
            className="relative z-10 flex flex-col items-center text-center"
            variants={heroStagger}
            initial={reduce ? false : 'hidden'}
            animate="visible"
          >
            <motion.span variants={heroItem} className="badge mb-5">{t('hero.badge')}</motion.span>

            <motion.h1
              variants={heroItem}
              className="text-5xl font-extrabold tracking-tighter md:text-7xl text-primary dark:text-[var(--color-text)]"
            >
              Kira<span className="text-ocean dark:text-accent">Webtoon</span>
            </motion.h1>

            <motion.p variants={heroItem} className="mt-5 max-w-2xl text-sm leading-7 md:text-base" style={textStyle(true)}>
              {t('hero.tagline')}
            </motion.p>

            {/* Search */}
            <motion.div variants={heroItem} className="mt-9 w-full max-w-xl">
              <CategorySearchBar type="webtoon" placeholder={t('search.placeholderWebtoon')} className="!w-full" />
            </motion.div>

            {/* Quick category links */}
            <motion.div variants={heroItem} className="mt-9 grid w-full max-w-2xl grid-cols-2 gap-2.5 sm:grid-cols-4">
              {quickLinks.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-surface px-4 py-2.5 text-sm font-semibold text-[var(--color-text)] dark:bg-surface-dark transition-colors hover:border-ocean hover:text-ocean dark:hover:border-accent dark:hover:text-accent"
                >
                  <Icon size={16} className="text-ocean dark:text-accent" aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Trending */}
        <Section title={t('nav.webtoon')} jp="トレンド" viewAll="/webtoon">
          {loading ? (
            <div className="anime-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}</div>
          ) : trending.length === 0 ? (
            <div className="card p-5 text-sm" style={textStyle(true)}>{t('home.webtoonError')}</div>
          ) : (
            <>
              <LandscapeSpotlight
                kind="comic"
                title={trending[0].title}
                href={`/webtoon/${encodeURIComponent(trending[0].url)}`}
                image={trending[0].thumbnail || ''}
                imageProxy={(url) => `/api/proxy?url=${encodeURIComponent(url)}`}
              />
              <div className="anime-grid">
                {trending.slice(1, 9).map((item) => (
                  <Link key={item.url} href={`/webtoon/${encodeURIComponent(item.url)}`} className="anime-card group">
                    <div className="relative aspect-[3/4] bg-[var(--color-surface-alt)]">
                      {item.thumbnail ? (
                        <Image src={imageProxy(item.thumbnail)} alt={item.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center" style={textStyle(true)}>
                          <ImageOff size={20} />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <h3 className="line-clamp-2 text-xs font-semibold sm:text-sm" style={textStyle()}>{item.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </Section>

        {/* Completed */}
        <Section title={t('section.finishedReading')} jp="読了" viewAll="/webtoon?day=completed">
          {loading ? (
            <div className="anime-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}</div>
          ) : completed.length === 0 ? (
            <div className="card p-5 text-sm" style={textStyle(true)}>{t('home.webtoonError')}</div>
          ) : (
            <div className="anime-grid">
              {completed.slice(0, 8).map((item) => (
                <Link key={item.url} href={`/webtoon/${encodeURIComponent(item.url)}`} className="anime-card group">
                  <div className="relative aspect-[3/4] bg-[var(--color-surface-alt)]">
                    {item.thumbnail ? (
                      <Image src={imageProxy(item.thumbnail)} alt={item.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center" style={textStyle(true)}>
                        <ImageOff size={20} />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h3 className="line-clamp-2 text-xs font-semibold sm:text-sm" style={textStyle()}>{item.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Section>
      </div>
    </>
  )
}
