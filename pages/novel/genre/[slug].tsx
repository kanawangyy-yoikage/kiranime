import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { ArrowLeft, Tag } from 'lucide-react'
import NovelGrid from '@/components/NovelGrid'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'
import { fetchNovelByGenre, type Novel, type NovelGenreTag } from '@/lib/api'

export default function NovelGenrePage() {
  const router = useRouter()
  const { slug } = router.query
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)

  const [novels, setNovels] = useState<Novel[]>([])
  const [genres, setGenres] = useState<NovelGenreTag[]>([])
  const [loading, setLoading] = useState(true)

  const genreId = typeof slug === 'string' ? slug : ''

  useEffect(() => {
    if (!genreId) return
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const { genres: gs, novels: ns } = await fetchNovelByGenre(genreId)
      if (cancelled) return
      setGenres(gs)
      setNovels(ns)
      setLoading(false)
      window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    }
    load()
    return () => { cancelled = true }
  }, [genreId])

  const genreName = genres.find((g) => g.id === genreId)?.name
    || genres.find((g) => g.slug === genreId)?.name
    || genreId

  return (
    <>
      <Head><title>{t('genre.title').replace('{name}', genreName)} - Novel - KiraStream</title></Head>
      <div className="space-y-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Link href="/novel" className="inline-flex items-center gap-1.5 text-sm hover:underline mb-1" style={{ color: 'var(--color-text-muted)' }}>
              <ArrowLeft size={14} /> {t('novel.backToNovel')}
            </Link>
            <h1 className="page-title flex items-center gap-2"><Tag size={20} style={{ color: 'var(--color-primary)' }} /> {t('genre.title').replace('{name}', genreName)}</h1>
          </div>
        </div>

        {genres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => {
              const active = g.id === genreId || g.slug === genreId
              return (
                <Link
                  key={g.id}
                  href={`/novel/genre/${g.slug || g.id}`}
                  aria-current={active ? 'page' : undefined}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    active
                      ? 'bg-ocean text-white'
                      : 'bg-pearl/[0.04] border border-pearl/10 text-[var(--color-text-muted)] hover:bg-ocean/20'
                  }`}
                >
                  {g.name}
                </Link>
              )
            })}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}
          </div>
        ) : novels.length === 0 ? (
          <div className="card p-6 text-center" style={{ color: 'var(--color-text-muted)' }}>{t('genre.noNovels')}</div>
        ) : (
          <NovelGrid novels={novels} />
        )}
      </div>
    </>
  )
}
