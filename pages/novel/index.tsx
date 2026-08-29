import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { BookMarked } from 'lucide-react'
import NovelGrid from '@/components/NovelGrid'
import Section from '@/components/Section'
import CategorySearchBar from '@/components/CategorySearchBar'
import LandscapeSlider from '@/components/LandscapeSlider'
import NovelMenuAside from '@/components/NovelMenuAside'
import { fetchNovelHome, fetchNovelHotSearch, type Novel, type NovelGenreTag, type NovelSection } from '@/lib/api'
import type { SpotlightItem } from '@/components/LandscapeSpotlight'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'

function sectionJp(title: string): string | undefined {
  const lower = title.toLowerCase()
  if (lower.includes('terbaru') || lower.includes('baru')) return '新着'
  if (lower.includes('populer')) return '人気'
  if (lower.includes('trending')) return '急上昇'
  if (lower.includes('hot')) return '人気検索'
  return undefined
}

// Cover novel dari nacdn.novelhubapp.com udah lengkap & bisa diakses langsung
// (tanpa proxy; NovelGrid pakai referrerPolicy="no-referrer" di img-nya).
const imageProxy = (url: string) => url

function toSpotlight(novel: Novel): SpotlightItem {
  return {
    kind: 'comic',
    title: novel.title,
    href: `/novel/${novel.slug}`,
    image: novel.image,
    score: novel.rating,
    type: novel.type,
    chapter: novel.latestChapter,
    status: novel.status,
  }
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

  const spotlightPool = [
    ...hotSearch,
    ...sections.flatMap((s) => s.novels.slice(0, 2)),
  ].filter((n, i, arr) => arr.findIndex((x) => x.slug === n.slug) === i)
  const slides = spotlightPool.slice(0, 6).map(toSpotlight)

  return (
    <>
      <Head><title>{t('novel.title')}</title></Head>
      <div className="flex items-start gap-6">
        <div className="flex-1 min-w-0 space-y-12 md:space-y-16">
          {/* Header + Search (novel gak punya subtitle key) */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="page-title flex items-center gap-2">
                <BookMarked size={24} className="text-ocean" aria-hidden="true" /> {t('nav.novel')}
              </h1>
            </div>
            <CategorySearchBar type="novel" placeholder={t('search.placeholderNovel')} />
          </div>

          {/* Slider geser */}
          {loading ? (
            <div className="skeleton min-h-[220px] rounded-3xl" />
          ) : slides.length > 0 ? (
            <LandscapeSlider kind="comic" items={slides} imageProxy={imageProxy} />
          ) : null}

          {loading ? (
            <Section title={t('novel.hotSearch')} jp="人気検索">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}
              </div>
            </Section>
          ) : sections.length === 0 && hotSearch.length === 0 ? (
            <div className="card p-6 text-center" style={{ color: 'var(--color-text-muted)' }}>{t('novel.loadError')}</div>
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

        <NovelMenuAside genres={genres} hotSearch={hotSearch} />
      </div>
    </>
  )
}