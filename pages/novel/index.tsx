import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { BookOpen, Clapperboard, ScrollText, BookMarked } from 'lucide-react'
import NovelGrid from '@/components/NovelGrid'
import Section from '@/components/Section'
import CategorySearchBar from '@/components/CategorySearchBar'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'
import { motionTokens, adaptiveDuration } from '@/lib/motionTokens'
import { fetchNovelHome, fetchNovelHotSearch, type Novel, type NovelGenreTag, type NovelSection } from '@/lib/api'

function textStyle(muted = false) {
  return { color: muted ? 'var(--color-text-muted)' : 'var(--color-text)' }
}

function sectionJp(title: string): string | undefined {
  const lower = title.toLowerCase()
  if (lower.includes('terbaru') || lower.includes('baru')) return '新着'
  if (lower.includes('populer')) return '人気'
  if (lower.includes('trending')) return '急上昇'
  if (lower.includes('hot')) return '人気検索'
  return undefined
}

export default function NovelListPage() {
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)
  const [sections, setSections] = useState<NovelSection[]>([])
  const [genres, setGenres] = useState<NovelGenreTag[]>([])
  const [hotSearch, setHotSearch] = useState<Novel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const [home, hot] = await Promise.all([fetchNovelHome(), fetchNovelHotSearch()])
      if (cancelled) return
      setSections(home.sections)
      setGenres(home.genres)
      setHotSearch(hot)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

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

  return (
    <>
      <Head><title>{t('novel.title')}</title></Head>
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
              Kira<span className="text-ocean dark:text-accent">{t('nav.novel')}</span>
            </motion.h1>

            <motion.p variants={heroItem} className="mt-5 max-w-2xl text-sm leading-7 md:text-base" style={textStyle(true)}>
              {t('hero.tagline')}
            </motion.p>

            {/* Search */}
            <motion.div variants={heroItem} className="mt-9 w-full max-w-xl">
              <CategorySearchBar type="novel" placeholder={t('search.placeholderNovel')} className="!w-full" />
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

        {loading ? (
          <Section title={t('novel.hotSearch')} jp="人気検索">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}
            </div>
          </Section>
        ) : sections.length === 0 && hotSearch.length === 0 ? (
          <div className="card p-6 text-center" style={textStyle(true)}>{t('novel.loadError')}</div>
        ) : (
          <>
            {hotSearch.length > 0 && (
              <Section title={t('novel.hotSearch')} jp="人気検索">
                <NovelGrid novels={hotSearch.slice(0, 8)} />
              </Section>
            )}

            {sections.map((section) => (
              <Section key={section.title} title={section.title} jp={sectionJp(section.title)}>
                <NovelGrid novels={section.novels.slice(0, 8)} />
              </Section>
            ))}

            {genres.length > 0 && (
              <Section title={t('novel.allGenres')} jp="ジャンル">
                <div className="flex flex-wrap gap-2">
                  {genres.map((g) => (
                    <Link
                      key={g.id}
                      href={`/novel/genre/${g.slug || g.id}`}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors bg-pearl/[0.04] border border-pearl/10 text-[var(--color-text-muted)] hover:bg-ocean hover:text-white"
                    >
                      {g.name}
                    </Link>
                  ))}
                </div>
              </Section>
            )}
          </>
        )}
      </div>
    </>
  )
}