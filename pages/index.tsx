import { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import AnimeGrid from '@/components/AnimeGrid'
import Section from '@/components/Section'
import { fetchLatest, fetchPopular, fetchSchedule, fetchMALSeason } from '@/lib/api'
import type { Anime, MALAnime } from '@/lib/api'

interface HomeData {
  latest: Anime[]
  popular: Anime[]
  schedule: Record<string, Anime[]>
  malSeason: MALAnime[]
}

export default function Home() {
  const [data, setData] = useState<HomeData>({
    latest: [],
    popular: [],
    schedule: {},
    malSeason: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [latest, popular, schedule, malSeason] = await Promise.all([
          fetchLatest(),
          fetchPopular(),
          fetchSchedule(),
          fetchMALSeason(),
        ])
        
        setData({ latest, popular, schedule, malSeason })
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  }

  return (
    <>
      <Head>
        <title>KiraNime - Anime Streaming Platform</title>
        <meta name="description" content="Stream anime subtitle Indonesia dengan pengalaman terbaik. Powered by Kira~ 🌸" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-12"
      >
        {/* Hero Section */}
        <motion.section 
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl p-6 md:p-12 glass"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-midnight/90 via-ocean/30 to-transparent" />
          <div className="relative z-10 max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-pearl mb-4">
              KiraNime{' '}
              <span className="text-ocean bg-pearl/10 px-2 rounded-lg">🌸</span>
            </h1>
            <p className="text-lg md:text-xl text-pearl/80 mb-8">
              Streaming anime subtitle Indonesia dengan pengalaman terbaik.
              Powered by{' '}
              <span className="text-accent-primary font-semibold">Kira~ ✨</span>
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-primary"
              >
                🎥 Mulai Nonton
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-secondary"
              >
                🔥 Trending Anime
              </motion.button>
            </div>
          </div>
          
          {/* Decorative anime images */}
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-l from-midnight to-transparent" />
          </div>
        </motion.section>

        {/* Latest Anime */}
        <Section title="Terbaru" viewAll="/latest">
          {loading ? (
            <div className="anime-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="loading-skeleton h-72 rounded-lg" />
              ))}
            </div>
          ) : (
            <AnimeGrid animes={data.latest.slice(0, 8)} />
          )}
        </Section>

        {/* Popular Anime */}
        <Section title="Populer" viewAll="/popular">
          {loading ? (
            <div className="anime-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="loading-skeleton h-72 rounded-lg" />
              ))}
            </div>
          ) : (
            <AnimeGrid animes={data.popular.slice(0, 6)} />
          )}
        </Section>

        {/* MAL Season Anime */}
        {data.malSeason.length > 0 && (
          <Section title="Seasonal Anime (MAL)" viewAll="/seasonal">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {data.malSeason.slice(0, 5).map((anime) => (
                <Link 
                  key={anime.mal_id} 
                  href={`/mal/${anime.mal_id}`}
                  className="card group hover:scale-105 transition-transform"
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <Image
                      src={anime.images.jpg.large_image_url || anime.images.jpg.image_url}
                      alt={anime.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-noir/90 via-noir/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-2 right-2 bg-yellow-500/90 text-noir text-xs font-bold px-2 py-1 rounded">
                      ⭐ {anime.score?.toFixed(1) || 'N/A'}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-pearl truncate text-sm">
                      {anime.title}
                    </h3>
                    <p className="text-xs text-pearl/60 mt-1">
                      {anime.status || 'Unknown'} • {anime.episodes || '?'} eps
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* Schedule */}
        {Object.keys(data.schedule).length > 0 && (
          <Section title="Jadwal Rilis">
            <div className="space-y-4">
              {Object.entries(data.schedule).map(([day, animes]) => (
                <motion.div 
                  key={day}
                  variants={itemVariants}
                  className="card p-4"
                >
                  <h3 className="font-bold text-pearl mb-3 text-lg">
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </h3>
                  <div className="flex overflow-x-auto gap-4 pb-2">
                    {animes.slice(0, 5).map((anime) => (
                      <Link
                        key={anime.slug}
                        href={`/anime/${anime.slug}`}
                        className="flex-shrink-0 w-24 hover:opacity-80 transition-opacity"
                      >
                        <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-2">
                          <Image
                            src={anime.image}
                            alt={anime.title}
                            fill
                            className="object-cover"
                          />
                          {anime.episode && (
                            <div className="absolute bottom-0 left-0 right-0 bg-ocean/90 text-pearl text-xs text-center py-1">
                              Ep {anime.episode}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-pearl truncate text-center">
                          {anime.title}
                        </p>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </Section>
        )}

        {/* Quick Links */}
        <motion.section 
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <Link href="/movies" className="card p-6 text-center hover:scale-105 transition-transform">
            <div className="text-3xl mb-2">🎬</div>
            <h3 className="font-semibold text-pearl">Movies</h3>
            <p className="text-sm text-pearl/60 mt-1">Anime Movie</p>
          </Link>
          
          <Link href="/ongoing" className="card p-6 text-center hover:scale-105 transition-transform">
            <div className="text-3xl mb-2">📺</div>
            <h3 className="font-semibold text-pearl">Ongoing</h3>
            <p className="text-sm text-pearl/60 mt-1">Sedang Tayang</p>
          </Link>
          
          <Link href="/genres" className="card p-6 text-center hover:scale-105 transition-transform">
            <div className="text-3xl mb-2">🏷️</div>
            <h3 className="font-semibold text-pearl">Genres</h3>
            <p className="text-sm text-pearl/60 mt-1">Kategori Genre</p>
          </Link>
          
          <Link href="/search" className="card p-6 text-center hover:scale-105 transition-transform">
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="font-semibold text-pearl">Search</h3>
            <p className="text-sm text-pearl/60 mt-1">Cari Anime</p>
          </Link>
        </motion.section>

        {/* Footer */}
        <motion.footer 
          variants={itemVariants}
          className="mt-12 pt-8 border-t border-ocean/20 text-center text-pearl/60"
        >
          <p className="mb-2">
            Made with 💖 by{' '}
            <span className="text-accent-primary font-semibold">Kira~ 🌸</span>
          </p>
          <p className="text-sm">
            KiraNime tidak meng-host video apapun. Semua konten berasal dari pihak ketiga.
          </p>
          <p className="text-xs mt-2">
            © {new Date().getFullYear()} KiraNime • Support anime official jika mampu!
          </p>
        </motion.footer>
      </motion.div>
    </>
  )
}
