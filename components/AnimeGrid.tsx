// components/AnimeGrid.tsx
import Link from 'next/link'
import Image from 'next/image'
import type { Anime } from '@/lib/api'

// Helper untuk proxy gambar
const imageProxy = (url: string) => `/api/mal-image?url=${encodeURIComponent(url)}`

const AnimeCard = ({ anime }: { anime: Anime }) => {
  return (
    <Link href={`/anime/${anime.slug}`} className="anime-card group">
      <div className="relative aspect-[3/4] bg-[var(--color-surface-alt)]">
        <Image
          src={imageProxy(anime.image)}
          alt={anime.title}
          fill
          sizes="(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 15vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {anime.episode && (
          <div className="absolute bottom-1 right-1 rounded bg-black/70 px-1.5 py-0.5 text-xs font-bold text-white">
            Ep {anime.episode}
          </div>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="line-clamp-2 text-xs font-semibold sm:text-sm" style={{ color: 'var(--color-text)' }}>
          {anime.title}
        </h3>
      </div>
    </Link>
  )
}

export default function AnimeGrid({ animes }: { animes: Anime[] }) {
  if (!animes || animes.length === 0) {
    return <div className="card p-5 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>Tidak ada anime ditemukan.</div>
  }

  return (
    <div className="anime-grid">
      {animes.map((anime) => (
        <AnimeCard key={anime.slug} anime={anime} />
      ))}
    </div>
  )
}
