import Link from 'next/link'
import { Star } from 'lucide-react'
import { Comic } from '@/lib/api'

interface ComicGridProps {
  comics: Comic[]
}

export default function ComicGrid({ comics }: ComicGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {comics.map((comic) => (
        <Link
          key={comic.slug}
          href={`/manga/${comic.slug}`}
          className="card group hover:scale-105 transition-transform duration-200"
        >
          <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg bg-surface dark:bg-surface-dark">
            {comic.image ? (
              <img
                src={comic.image}
                alt={comic.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-pearl/40">
                No Image
              </div>
            )}
            
            {comic.score && (
              <div className="absolute top-2 right-2 bg-yellow-500/90 text-noir text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                <Star size={12} className="fill-noir" /> {comic.score}
              </div>
            )}

            {comic.chapter && (
              <div className="absolute bottom-2 left-2 bg-ocean/90 text-pearl text-xs font-medium px-2 py-1 rounded">
                Ch. {comic.chapter.replace(/chapter\s+/gi, '')}
              </div>
            )}

            {comic.type && (
              <div className="absolute top-2 left-2 bg-purple-600/90 text-pearl text-xs font-bold px-2 py-0.5 rounded capitalize">
                {comic.type}
              </div>
            )}
          </div>

          <div className="p-3">
            <h3 className="font-semibold text-pearl text-sm line-clamp-2 group-hover:text-ocean transition-colors duration-200">
              {comic.title}
            </h3>
            {comic.status && (
              <p className="text-xs text-pearl/60 mt-1 capitalize">{comic.status}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
