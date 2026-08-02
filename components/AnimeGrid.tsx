// components/AnimeGrid.tsx
import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import type { Anime } from '@/lib/api'
import { staggerContainer, staggerItem } from './motionVariants'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'

// Helper untuk proxy gambar
const imageProxy = (url: string) => `/api/mal-image?url=${encodeURIComponent(url)}`

const AnimeCard = ({ anime }: { anime: Anime }) => {
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)
  return (
    <motion.div variants={staggerItem}>
      <Link href={`/anime/${anime.slug}`} className="anime-card group block">
        <div className="relative aspect-[3/4] bg-[var(--color-surface-alt)] overflow-hidden">
          <Image
            src={imageProxy(anime.image)}
            alt={anime.title}
            fill
            sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 15vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {anime.episode && (
            <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-xs font-bold text-white">
              {t('grid.episode').replace('{n}', anime.episode)}
            </div>
          )}        </div>
        <div className="p-2.5">
          <h3 className="line-clamp-2 text-xs font-semibold sm:text-sm" style={{ color: 'var(--color-text)' }}>
            {anime.title}
          </h3>
        </div>
      </Link>
    </motion.div>
  )
}

export default function AnimeGrid({ animes }: { animes: Anime[] }) {
  const reduce = useReducedMotion()
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)
  if (!animes || animes.length === 0) {
    return <div className="card p-5 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>{t('grid.noAnime')}</div>
  }

  return (
    <motion.div
      className="anime-grid"
      variants={staggerContainer}
      initial={reduce ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {animes.map((anime) => (
        <AnimeCard key={anime.slug} anime={anime} />
      ))}
    </motion.div>
  )
}
