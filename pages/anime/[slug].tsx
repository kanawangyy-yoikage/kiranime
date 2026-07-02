import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { fetchDetail, fetchEpisode, type AnimeDetail, type StreamData } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { 
  toggleFavorite, 
  checkFavorite, 
  saveHistory,
  saveContinueWatching,
  addToWatchlist,
  type WatchlistStatus 
} from '@/lib/firebase'

export default function AnimeDetailPage() {
  const router = useRouter()
  const { slug } = router.query
  const { user } = useAuth()

  const [anime, setAnime] = useState<AnimeDetail | null>(null)
  const [streamData, setStreamData] = useState<StreamData | null>(null)
  const [loading, setLoading] = useState(true)
  const [playingEpisode, setPlayingEpisode] = useState<string | null>(null)
  const [isFavorited, setIsFavorited] = useState(false)
  const [selectedServer, setSelectedServer] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Load anime detail
  useEffect(() => {
    if (!slug || typeof slug !== 'string') return

    const loadDetail = async () => {
      setLoading(true)
      try {
        const data = await fetchDetail(slug)
        setAnime(data)
        
        // Check if favorited
        if (user) {
          const fav = await checkFavorite(slug)
          setIsFavorited(fav)
        }

        // Save to history
        if (data && user) {
          await saveHistory({
            slug,
            title: data.title,
            image: data.image,
            timestamp: Date.now(),
          })
        }
      } catch (error) {
        console.error('Failed to load anime:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDetail()
  }, [slug, user])

  // Play episode
  const handlePlayEpisode = async (episodeSlug: string) => {
    setPlayingEpisode(episodeSlug)
    try {
      const data = await fetchEpisode(episodeSlug)
      setStreamData(data)
      setSelectedServer(0)

      // Scroll to player
      setTimeout(() => {
        document.getElementById('video-player')?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (error) {
      console.error('Failed to load episode:', error)
    }
  }

  // Toggle favorite
  const handleToggleFavorite = async () => {
    if (!user || !anime) return
    
    const result = await toggleFavorite({
      slug: slug as string,
      title: anime.title,
      image: anime.image,
      score: anime.info.score || 'N/A',
    })
    
    if (result.success) {
      setIsFavorited(result.isFavorited)
    }
  }

  // Add to watchlist
  const handleAddToWatchlist = async (status: WatchlistStatus) => {
    if (!user || !anime) return
    
    await addToWatchlist({
      slug: slug as string,
      title: anime.title,
      image: anime.image,
      status,
      totalEpisodes: Number(anime.info.total_episode) || 0,
      score: Number(anime.info.score) || 0,
    })
    
    alert(`Ditambahkan ke ${status}!`)
  }

  // Video progress tracking
  const handleVideoProgress = () => {
    if (!videoRef.current || !user || !playingEpisode) return
    
    const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100
    
    // Save every 10 seconds
    if (Math.floor(videoRef.current.currentTime) % 10 === 0) {
      saveContinueWatching(slug as string, playingEpisode, progress)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ocean/30 border-t-ocean rounded-full animate-spin mx-auto mb-4" />
          <p className="text-pearl">Loading anime...</p>
        </div>
      </div>
    )
  }

  if (!anime) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-pearl mb-4">Anime tidak ditemukan</h2>
        <button
          onClick={() => router.back()}
          className="btn-primary"
        >
          Kembali
        </button>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{anime.title} - KiraNime</title>
        <meta name="description" content={anime.description} />
      </Head>

      <div className="space-y-6">
        {/* Video Player */}
        {streamData && (
          <motion.div
            id="video-player"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card p-4"
          >
            <h3 className="font-bold text-pearl mb-4 text-lg">
              {streamData.title}
            </h3>

            {/* Video Container */}
            <div className="video-container mb-4">
              <iframe
                src={streamData.streams[selectedServer]?.url || ''}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                frameBorder="0"
              />
            </div>

            {/* Server Selection */}
            {streamData.streams.length > 1 && (
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-sm text-pearl/60 self-center">Server:</span>
                {streamData.streams.map((stream, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedServer(idx)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedServer === idx
                        ? 'bg-ocean text-white'
                        : 'bg-surface-dark text-white/70 hover:bg-surface-hover'
                    }`}
                  >
                    {stream.server}
                  </button>
                ))}
              </div>
            )}

            {/* Download Links */}
            {streamData.downloads && streamData.downloads.length > 0 && (
              <details className="mt-4">
                <summary className="cursor-pointer text-pearl font-medium hover:text-ocean transition-colors">
                  📥 Download Links
                </summary>
                <div className="mt-3 space-y-2">
                  {streamData.downloads.map((dl, idx) => (
                    <div key={idx} className="bg-surface-dark rounded-lg p-3">
                      <p className="text-sm font-medium text-white mb-2">
                        {dl.resolution} - {dl.format}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {dl.links.map((link, lidx) => (
                          <a
                            key={lidx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-ocean/20 hover:bg-ocean/30 rounded text-xs text-white transition-colors"
                          >
                            {link.host}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </motion.div>
        )}

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card overflow-hidden"
        >
          <div className="relative min-h-[300px] sm:min-h-[260px] md:min-h-80 bg-[var(--color-surface-alt)]">
            <Image
              src={`/api/mal-image?url=${encodeURIComponent(anime.image)}`}
              alt={anime.title}
              fill
              className="object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-surface)] via-[var(--color-surface)]/80 to-transparent" />
            
            <div className="relative p-6">
              <div className="flex flex-col md:flex-row gap-6 items-end">
                {/* Poster */}
                <div className="relative w-32 h-48 md:w-40 md:h-60 flex-shrink-0 rounded-lg overflow-hidden border border-[var(--color-border)] shadow-2xl">
                  <Image
                    src={`/api/mal-image?url=${encodeURIComponent(anime.image)}`}
                    alt={anime.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 pb-2">
                  <h1 className="text-2xl md:text-4xl font-bold mb-2 text-[var(--color-text)]">
                    {anime.title}
                  </h1>
                  
                  {anime.info.japanese && (
                    <p className="text-sm text-pearl/60 mb-3">{anime.info.japanese}</p>
                  )}

                  <div className="flex flex-wrap gap-2 mb-4">
                    {anime.genres.slice(0, 4).map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1 bg-ocean/20 rounded-full text-xs font-medium text-pearl"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-pearl/80">
                    {anime.info.score && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {anime.info.score}
                      </span>
                    )}
                    {anime.info.type && <span>• {anime.info.type}</span>}
                    {anime.info.total_episode && <span>• {anime.info.total_episode} Episode</span>}
                    {anime.info.status && <span>• {anime.info.status}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-6 flex flex-wrap gap-3">
            {user && (
              <>
                <button
                  onClick={handleToggleFavorite}
                  className={`btn-secondary ${isFavorited ? 'bg-red-500/20 border-red-500' : ''}`}
                >
                  {isFavorited ? '❤️ Favorit' : '🤍 Tambah Favorit'}
                </button>

                <div className="relative group">
                  <button className="btn-secondary">
                    📝 Watchlist ▼
                  </button>
                  <div className="absolute top-full left-0 mt-2 hidden group-hover:block dropdown min-w-[150px]">
                    <button
                      onClick={() => handleAddToWatchlist('planning')}
                      className="dropdown-item w-full text-left"
                    >
                      Mau Nonton
                    </button>
                    <button
                      onClick={() => handleAddToWatchlist('watching')}
                      className="dropdown-item w-full text-left"
                    >
                      Sedang Nonton
                    </button>
                    <button
                      onClick={() => handleAddToWatchlist('completed')}
                      className="dropdown-item w-full text-left"
                    >
                      Selesai
                    </button>
                    <button
                      onClick={() => handleAddToWatchlist('dropped')}
                      className="dropdown-item w-full text-left"
                    >
                      Dropped
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Synopsis & Info */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Synopsis */}
          <div className="md:col-span-2 card p-6">
            <h2 className="section-title">Sinopsis</h2>
            <p className="text-pearl/80 leading-relaxed whitespace-pre-line">
              {anime.description || 'Tidak ada sinopsis tersedia.'}
            </p>
          </div>

          {/* Info */}
          <div className="card p-6">
            <h2 className="section-title">Informasi</h2>
            <dl className="space-y-3 text-sm">
              {Object.entries(anime.info).map(([key, value]) => {
                if (!value || key === 'genre') return null
                return (
                  <div key={key}>
                    <dt className="text-pearl/60 capitalize mb-1">
                      {key.replace(/_/g, ' ')}
                    </dt>
                    <dd className="text-pearl font-medium">{value}</dd>
                  </div>
                )
              })}
            </dl>
          </div>
        </div>

        {/* Episodes */}
        {anime.episodes.length > 0 && (
          <div className="card p-6">
            <h2 className="section-title">Daftar Episode</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {anime.episodes.reverse().map((episode) => (
                <button
                  key={episode.slug}
                  onClick={() => handlePlayEpisode(episode.slug)}
                  className={`p-3 rounded-lg font-medium transition-all ${
                    playingEpisode === episode.slug
                      ? 'bg-ocean text-white'
                      : 'bg-surface-dark text-white/70 hover:bg-surface-hover'
                  }`}
                >
                  {episode.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
