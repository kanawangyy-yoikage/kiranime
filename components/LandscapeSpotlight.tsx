import Link from 'next/link'
import { Star, CheckCircle2, PlayCircle, BookOpen } from 'lucide-react'

export interface SpotlightItem {
  kind: 'anime' | 'comic'
  title: string
  href: string
  image: string
  score?: string
  type?: string
  episode?: string
  chapter?: string
  genres?: string[]
  status?: string
}

interface LandscapeSpotlightProps extends SpotlightItem {
  imageProxy: (url: string) => string
}

export default function LandscapeSpotlight({
  kind,
  title,
  href,
  image,
  imageProxy,
  score,
  type,
  episode,
  chapter,
  genres = [],
  status,
}: LandscapeSpotlightProps) {
  const isAnime = kind === 'anime'
  const CtaIcon = isAnime ? PlayCircle : BookOpen
  const ctaLabel = isAnime ? 'Tonton Sekarang' : 'Baca Sekarang'

  return (
    <Link
      href={href}
      className="group relative flex min-h-[200px] flex-col justify-end overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-5 shadow-sm transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-xl sm:min-h-[260px] sm:p-8"
    >
      {/* Background image */}
      {image && (
        <>
          <img
            src={imageProxy(image)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" aria-hidden="true" />
        </>
      )}

      <div className="relative z-10 flex items-end justify-between gap-4">
        <div className="min-w-0">
          {/* Badges */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
              <CheckCircle2 size={13} aria-hidden="true" />
              Selesai
            </span>
            {score && (
              <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
                <Star size={12} className="fill-yellow-400 text-yellow-400" aria-hidden="true" />
                {score}
              </span>
            )}
            {type && (
              <span className="rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white/90 capitalize backdrop-blur-sm">
                {type}
              </span>
            )}
            {isAnime && episode && (
              <span className="rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
                {episode} Episode
              </span>
            )}
            {!isAnime && chapter && (
              <span className="rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
                {chapter}
              </span>
            )}
            {status && (
              <span className="rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white/90 capitalize backdrop-blur-sm">
                {status}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl font-extrabold leading-tight text-white drop-shadow-md sm:text-3xl">
            {title}
          </h3>

          {/* Genres */}
          {genres.length > 0 && (
            <div className="mt-2.5 hidden flex-wrap gap-1.5 sm:flex">
              {genres.slice(0, 4).map((g) => (
                <span key={g} className="rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-xs font-medium text-white/85 backdrop-blur-sm">
                  {g}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="shrink-0">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-black shadow-lg transition-[transform,box-shadow] duration-200 group-hover:scale-105 sm:px-6 sm:py-3 sm:text-sm">
            <CtaIcon size={18} aria-hidden="true" />
            {ctaLabel}
          </span>
        </div>
      </div>
    </Link>
  )
}
