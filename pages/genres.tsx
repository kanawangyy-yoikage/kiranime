import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { fetchGenres, fetchByGenre, type Anime } from '@/lib/api'
import AnimeGrid from '@/components/AnimeGrid'

export default function GenresPage() {
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
        
        // Auto-select first genre
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

  return (
    <>
      <Head>
        <title>Genre Anime - KiraNime</title>
      </Head>

      <div className="space-y-6">
        <div className="card p-6">
          <h1 className="section-title">Genre Anime</h1>
          <p className="text-pearl/60 mb-4">Jelajahi anime berdasarkan genre favorit</p>

          {/* Genre Pills */}
          {loading ? (
            <div className="flex gap-2 flex-wrap">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="loading-skeleton w-24 h-10 rounded-full" />
              ))}
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {genres.map((genre) => (
                <button
                  key={genre.slug}
                  onClick={() => loadAnimesByGenre(genre.slug)}
                  className={`px-4 py-2 rounded-full font-medium transition-all ${
                    selectedGenre === genre.slug
                      ? 'bg-ocean text-white'
                      : 'bg-surface-dark text-white/70 hover:bg-surface-hover'
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
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-ocean/30 border-t-ocean rounded-full animate-spin mx-auto mb-4" />
            <p className="text-pearl">Loading anime...</p>
          </div>
        ) : (
          <>
            {animes.length > 0 ? (
              <div>
                <h2 className="section-title mb-4">
                  {genres.find(g => g.slug === selectedGenre)?.name || 'Anime'}
                  <span className="text-sm text-pearl/60 font-normal ml-2">
                    ({animes.length} hasil)
                  </span>
                </h2>
                <AnimeGrid animes={animes} />
              </div>
            ) : (
              <div className="text-center py-12 card p-6">
                <p className="text-pearl/60">Tidak ada anime ditemukan untuk genre ini</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
