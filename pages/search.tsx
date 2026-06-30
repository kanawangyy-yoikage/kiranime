import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import AnimeGrid from '@/components/AnimeGrid'
import Section from '@/components/Section'
import { searchAnime, searchMAL, type Anime, type MALAnime } from '@/lib/api'

export default function SearchPage() {
  const router = useRouter()
  const { q } = router.query
  
  const [results, setResults] = useState<Anime[]>([])
  const [malResults, setMalResults] = useState<MALAnime[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (q && typeof q === 'string') {
      setSearchQuery(q)
      performSearch(q)
    }
  }, [q])

  const performSearch = async (query: string) => {
    if (!query.trim()) return
    
    setLoading(true)
    try {
      const [animeResults, malResults] = await Promise.all([
        searchAnime(query),
        searchMAL(query),
      ])
      
      setResults(animeResults)
      setMalResults(malResults)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <>
      <Head>
        <title>Cari Anime - KiraNime</title>
      </Head>

      <div className="space-y-6">
        {/* Search Bar */}
        <div className="card p-6">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari anime berdasarkan judul..."
              className="input-field pr-12"
              autoFocus
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-ocean hover:bg-accent-secondary rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 text-pearl" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-ocean/30 border-t-ocean rounded-full animate-spin mx-auto mb-4" />
            <p className="text-pearl">Mencari anime...</p>
          </div>
        )}

        {/* Results */}
        {!loading && q && (
          <>
            {results.length > 0 ? (
              <Section title={`Hasil Pencarian: "${q}" (${results.length})`}>
                <AnimeGrid animes={results} />
              </Section>
            ) : (
              <div className="text-center py-12 card p-6">
                <p className="text-2xl mb-2">😔</p>
                <p className="text-pearl/80">Tidak ada hasil untuk "{q}"</p>
                <p className="text-sm text-pearl/60 mt-2">Coba kata kunci lain</p>
              </div>
            )}

            {/* MAL Results */}
            {malResults.length > 0 && (
              <Section title="Hasil dari MyAnimeList">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {malResults.slice(0, 6).map((anime) => (
                    <a
                      key={anime.mal_id}
                      href={`https://myanimelist.net/anime/${anime.mal_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="card group hover:scale-105 transition-transform"
                    >
                      <div className="relative aspect-[3/4]">
                        <img
                          src={anime.images.jpg.image_url}
                          alt={anime.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 bg-yellow-500/90 text-noir text-xs font-bold px-2 py-1 rounded">
                          ⭐ {anime.score?.toFixed(1) || 'N/A'}
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-pearl text-sm truncate">
                          {anime.title}
                        </h3>
                      </div>
                    </a>
                  ))}
                </div>
              </Section>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !q && (
          <div className="text-center py-12 card p-6">
            <p className="text-4xl mb-4">🔍</p>
            <h2 className="text-xl font-bold text-pearl mb-2">Cari Anime Favoritmu</h2>
            <p className="text-pearl/60">Ketik judul anime di atas untuk memulai pencarian</p>
          </div>
        )}
      </div>
    </>
  )
}
