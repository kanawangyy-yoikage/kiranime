import Link from 'next/link'
import { Star } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Comic } from '@/lib/api'
import { staggerContainer, staggerItem } from './motionVariants'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'
import { motionTokens, adaptiveDuration } from '@/lib/motionTokens'

interface ComicGridProps {
  comics: Comic[]
}

const MotionLink = motion(Link)

export default function ComicGrid({ comics }: ComicGridProps) {
  const reduce = useReducedMotion()
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)
  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
      variants={staggerContainer}
      initial={reduce ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {comics.map((comic) => (
        <motion.div key={comic.slug} variants={staggerItem}>
          <MotionLink
            href={`/manga/${comic.slug}`}
            className="card group hover:scale-105 transition-transform duration-200 block"
            whileHover={reduce ? undefined : { y: -4 }}
            whileTap={reduce ? undefined : { scale: 0.98 }}
            transition={{ duration: adaptiveDuration(motionTokens.duration.fast), ease: motionTokens.easing.smooth }}
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg bg-surface dark:bg-surface-dark">
              {comic.image ? (
                <img
                  src={`/api/proxy?url=${encodeURIComponent(comic.image)}`}
                  alt={comic.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--color-text-muted)]">
                  No Image
                </div>              )}

              {comic.score && (
                <div className="absolute top-2 right-2 bg-primary/90 dark:bg-accent/90 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                  <Star size={12} className="fill-white" /> {comic.score}
                </div>
              )}

              {comic.chapter && (
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
                  {t('grid.chapter').replace('{n}', comic.chapter.replace(/chapter\s+/gi, ''))}
                </div>
              )}

              {comic.type && (
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white/90 text-xs font-semibold px-2 py-0.5 rounded-full capitalize">
                  {comic.type}
                </div>
              )}
            </div>

            <div className="p-3">
              <h3 className="font-semibold text-[var(--color-text)] text-sm line-clamp-2 group-hover:text-ocean transition-colors duration-200">
                {comic.title}
              </h3>
              {comic.status && (
                <p className="text-xs text-[var(--color-text-muted)] mt-1 capitalize">{comic.status}</p>
              )}
            </div>
          </MotionLink>
        </motion.div>
      ))}
    </motion.div>
  )
}
