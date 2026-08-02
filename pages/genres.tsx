import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Tags } from 'lucide-react'
import { fetchGenres, fetchByGenre, type Anime } from '@/lib/api'
import AnimeGrid from '@/components/AnimeGrid'
import AnimeMenuAside from '@/components/AnimeMenuAside'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'

export default function GenresPage() {
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)
  const [genres, setGenres] = useState<{ name: string; slug: string }[]>([])
  const [selectedGenre, setSelectedGenre] = useState<string>('')
  const [animes, setAnimes] = useState<Anime[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingAnimes, setLoadingAnimes] = useState(false)

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const data = await fetchGenres()
        setGenres(data)

        if (data.length > 0) {
          setSelectedGenre(data[0].slug)
          loadAnimesByGenre(data[0].slug)
        }
      } catch (error) {
        console.error('Failed to load genres:', error)
      } finally {
        setLoading(false)
      }
    }

    loadGenres()
  }, [])

  const loadAnimesByGenre = async (slug: string) => {
    setLoadingAnimes(true)
    setSelectedGenre(slug)
    try {
      const data = await fetchByGenre(slug)
      setAnimes(data)
    } catch (error) {
      console.error('Failed to load animes:', error)
    } finally {
      setLoadingAnimes(false)
    }
  }

  const activeGenreName = genres.find((g) => g.slug === selectedGenre)?.name || 'Anime'

  return (
    <>
      <Head>
        <title>{t('genres.title')}</title>
      </Head>

      <div className="flex items-start gap-6">
        <div className="flex-1 min-w-0 space-y-8">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Tags size={22} className="text-ocean" /> {t('genres.heading')}
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{t('genres.subtitle')}</p>
          </div>

          {/* Genre Pills */}
          <div className="card p-5">
            {loading ? (
              <div className="flex flex-wrap gap-2">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="skeleton h-9 w-24 rounded-full" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {genres.map((genre) => (
                  <button
                    key={genre.slug}
                    onClick={() => loadAnimesByGenre(genre.slug)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                      selectedGenre === genre.slug
                        ? 'border-primary bg-primary/10 text-primary dark:border-accent dark:bg-accent/15 dark:text-accent'
                        : 'border-pearl/10 bg-pearl/[0.03] text-text-light/70 dark:text-text-dark/70 hover:border-ocean/40 hover:text-primary dark:hover:text-accent'
                    }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Anime Grid */}
          {loadingAnimes ? (
            <div className="anime-grid">
              {[...Array(12)].map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}
            </div>
          ) : animes.length > 0 ? (
            <div className="space-y-4">
              <h2 className="section-title flex items-baseline gap-2">
                {activeGenreName}
                <span className="text-sm font-normal text-[var(--color-text-muted)]">({t('genres.results').replace('{n}', String(animes.length))})</span>
              </h2>
              <AnimeGrid animes={animes} />
            </div>
          ) : (
            <div className="card p-6 text-center text-[var(--color-text-muted)]">
              {t('genres.empty')}
            </div>
          )}
        </div>

        <AnimeMenuAside />
      </div>
    </>
  )
}
