import Link from 'next/link'
import { Star } from 'lucide-react'
import { Novel } from '@/lib/api'

interface NovelGridProps {
  novels: Novel[]
}

export default function NovelGrid({ novels }: NovelGridProps) {
  const cacheNovel = (novel: Novel) => {
    // Endpoint chapters (dipakai di halaman detail) gak balikin judul/cover/sinopsis novel,
    // jadi kita simpen sebentar data dari listing di sini biar detail page bisa langsung nampilin
    // info dasarnya sambil nunggu daftar chapter asli di-fetch.
    try {
      sessionStorage.setItem(`novelMeta:${novel.id}`, JSON.stringify(novel))
    } catch {
      // sessionStorage bisa aja gak available (mode private/incognito ketat), diemin aja
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {novels.map((novel) => (
        <Link
          key={novel.id}
          href={`/novel/${novel.id}`}
          onClick={() => cacheNovel(novel)}
          className="card group hover:scale-105 transition-transform duration-200"
        >
          <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg bg-surface dark:bg-surface-dark">
            {novel.image ? (
              <img
                src={`/api/proxy?url=${encodeURIComponent(novel.image)}`}
                alt={novel.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-pearl/40">
                No Image
              </div>
            )}

            {novel.score && (
              <div className="absolute top-2 right-2 bg-yellow-500/90 text-noir text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                <Star size={12} className="fill-noir" /> {novel.score}
              </div>
            )}

            {novel.totalChapters ? (
              <div className="absolute bottom-2 left-2 bg-ocean/90 text-pearl text-xs font-medium px-2 py-1 rounded">
                {novel.totalChapters} Ch
              </div>
            ) : null}
          </div>

          <div className="p-3">
            <h3 className="font-semibold text-pearl text-sm line-clamp-2 group-hover:text-ocean transition-colors duration-200">
              {novel.title}
            </h3>
            {novel.status && (
              <p className="text-xs text-pearl/60 mt-1 capitalize">{novel.status}</p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
