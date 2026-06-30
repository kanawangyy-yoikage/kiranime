import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Anime } from '@/lib/api'

interface AnimeGridProps {
  animes: Anime[]
}

export default function AnimeGrid({ animes }: AnimeGridProps) {
  if (!animes || animes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-pearl/60">Tidak ada anime ditemukan</p>
      </div>
    )
  }

  return (
    <div className="anime-grid">
      {animes.map((anime, index) => (
        <motion.div
          key={anime.slug || index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Link
            href={`/anime/${anime.slug}`}
            className="block anime-card group"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
              <Image
                src={anime.image}
                alt={anime.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
              />
              
              {/* Overlay */}
              <div className="overlay">
                <div className="info">
                  <h3 className="font-semibold text-pearl text-sm line-clamp-2">
                    {anime.title}
                  </h3>
                  {anime.genres && anime.genres.length > 0 && (
                    <p className="text-xs text-pearl/70 mt-1">
                      {anime.genres.slice(0, 2).join(' • ')}
                    </p>
                  )}
                </div>
              </div>

              {/* Episode Badge */}
              {anime.episode && (
                <div className="episode-badge">
                  Ep {anime.episode}
                </div>
              )}

              {/* Score Badge */}
              {anime.score && (
                <div className="score-badge">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {anime.score}
                </div>
              )}

              {/* Type Badge */}
              {anime.type && (
                <div className="absolute bottom-2 left-2 bg-noir/70 text-pearl text-xs px-2 py-1 rounded">
                  {anime.type}
                </div>
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
