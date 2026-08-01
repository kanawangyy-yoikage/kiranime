import Link from 'next/link'
import { Star } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { Novel } from '@/lib/api'
import { staggerContainer, staggerItem } from './motionVariants'

interface NovelGridProps {
  novels: Novel[]
}

export default function NovelGrid({ novels }: NovelGridProps) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
      variants={staggerContainer}
      initial={reduce ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
    >
      {novels.map((novel) => (
        <motion.div key={novel.slug} variants={staggerItem}>
          <Link
            href={`/novel/${novel.slug}`}
            className="card group hover:scale-105 transition-transform duration-200 block"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg bg-surface dark:bg-surface-dark">
              {novel.image ? (
                <img
                  // Gambar ini datang dari nacdn.novelhubapp.com (dicari berdasarkan judul lewat
                  // enrichNovelCovers), bukan dari poster asli SakuraNovel yang keblokir.
                  src={novel.image}
                  alt={novel.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.currentTarget
                    target.style.display = 'none'
                    const fallback = target.nextElementSibling as HTMLElement | null
                    if (fallback) fallback.style.display = 'flex'
                  }}
                />
              ) : null}
              <div
                className="w-full h-full items-center justify-center text-pearl/40 text-xs"
                style={{ display: novel.image ? 'none' : 'flex' }}
              >
                No Image
              </div>

              {novel.rating && (
                <div className="absolute top-2 right-2 bg-primary/90 dark:bg-accent/90 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                  <Star size={12} className="fill-white" /> {novel.rating}
                </div>
              )}

              {novel.type && (
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-full">
                  {novel.type}
                </div>
              )}
            </div>

            <div className="p-3">
              <h3 className="font-semibold text-pearl text-sm line-clamp-2 group-hover:text-ocean transition-colors duration-200">
                {novel.title}
              </h3>
              {novel.latestChapter ? (
                <p className="text-xs text-pearl/60 mt-1 line-clamp-1">{novel.latestChapter}</p>
              ) : novel.status ? (
                <p className="text-xs text-pearl/60 mt-1 capitalize">{novel.status}</p>
              ) : null}
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  )
}
