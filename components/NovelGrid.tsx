import Link from 'next/link'
import { Star } from 'lucide-react'
import { Novel } from '@/lib/api'

interface NovelGridProps {
  novels: Novel[]
}

export default function NovelGrid({ novels }: NovelGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {novels.map((novel) => (
        <Link
          key={novel.slug}
          href={`/novel/${novel.slug}`}
          className="card group hover:scale-105 transition-transform duration-200"
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
              <div className="absolute top-2 right-2 bg-yellow-500/90 text-noir text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                <Star size={12} className="fill-noir" /> {novel.rating}
              </div>
            )}

            {novel.type && (
              <div className="absolute bottom-2 left-2 bg-ocean/90 text-pearl text-xs font-medium px-2 py-1 rounded">
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
      ))}
    </div>
  )
}
