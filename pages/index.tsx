import { useEffect, useState, FormEvent } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { BookOpen, Clapperboard, ImageOff, ScrollText, Search, BookMarked } from 'lucide-react'
import AnimeGrid from '@/components/AnimeGrid'
import Section from '@/components/Section'
import { fetchLatest, fetchPopular, fetchSchedule, fetchMALSeason } from '@/lib/api'
import type { Anime, MALAnime } from '@/lib/api'

interface WebtoonItem {
  title: string
  thumbnail?: string
  url: string
}

interface HomeData {
  latest: Anime[]
  popular: Anime[]
  schedule: Record<string, Anime[]>
  malSeason: MALAnime[]
  webtoons: WebtoonItem[]
}

function textStyle(muted = false) {
  return { color: muted ? 'var(--color-text-muted)' : 'var(--color-text)' }
}

export default function Home() {
  const [data, setData] = useState<HomeData>({ latest: [], popular: [], schedule: {}, malSeason: [], webtoons: [] })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const [latest, popular, schedule, malSeason, webtoonRes] = await Promise.allSettled([
          fetchLatest(),
          fetchPopular(),
          fetchSchedule(),
          fetchMALSeason(),
          fetch('/api/webtoon?action=trending&day=trending').then((res) => res.json()),
        ])

        setData({
          latest: latest.status === 'fulfilled' ? latest.value : [],
          popular: popular.status === 'fulfilled' ? popular.value : [],
          schedule: schedule.status === 'fulfilled' ? schedule.value : {},
          malSeason: malSeason.status === 'fulfilled' ? malSeason.value : [],
          webtoons: webtoonRes.status === 'fulfilled' ? webtoonRes.value.items || [] : [],
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  const quickLinks = [
    { href: '/popular', label: 'Anime', Icon: Clapperboard },
    { href: '/manga', label: 'Komik', Icon: BookOpen },
    { href: '/webtoon', label: 'Webtoon', Icon: ScrollText },
    { href: '/novel', label: 'Novel', Icon: BookMarked },
  ]

  return (
    <>
      <Head>
        <title>KiraStream - Streaming Anime Subtitle Indonesia</title>
        <meta name="description" content="Streaming anime subtitle Indonesia dengan UI modern, manga, webtoon, dan jadwal rilis." />
      </Head>

      <div className="space-y-12 md:space-y-16">
        {/* Hero / Landing */}
        <section className="hero-panel relative overflow-hidden rounded-3xl border px-6 py-16 md:px-10 md:py-24">
          {data.popular[0]?.image && (
            <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
              <Image
                src={`/api/mal-image?url=${encodeURIComponent(data.popular[0].image)}`}
                alt=""
                fill
                sizes="100vw"
                className="object-cover object-top opacity-20 dark:opacity-25"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-surface/80 via-surface/60 to-surface dark:from-noir/70 dark:via-noir/50 dark:to-noir" />
            </div>
          )}

          <div className="relative z-10 flex flex-col items-center text-center">
            <span className="badge mb-5">Streaming Anime & Komik</span>

            <h1 className="text-5xl font-extrabold tracking-tighter md:text-7xl text-primary dark:text-pearl">
              Kira<span className="text-ocean dark:text-accent">Stream</span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 md:text-base" style={textStyle(true)}>
              Streaming anime subtitle Indonesia, baca manga, manhwa, manhua, webtoon, dan novel. Cepat, bersih, dan nyaman di desktop maupun mobile.
            </p>

            {/* Search */}
            <form onSubmit={handleSearch} className="mt-9 w-full max-w-xl">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-light/40 dark:text-text-dark/40" aria-hidden="true" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari anime, komik, webtoon, novel\u2026"
                  className="input-field w-full py-3.5 pl-12 pr-28 text-sm rounded-full"
                />
                <button type="submit" className="btn-primary absolute right-1.5 top-1/2 -translate-y-1/2 px-5 py-2 text-xs rounded-full">
                  Cari
                </button>
              </div>
            </form>

            {/* Quick category links */}
            <div className="mt-9 grid w-full max-w-2xl grid-cols-2 gap-2.5 sm:grid-cols-4">
              {quickLinks.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center justify-center gap-2 rounded-full border border-[var(--color-border)] bg-surface px-4 py-2.5 text-sm font-semibold text-text-light dark:bg-surface-dark dark:text-text-dark transition-colors hover:border-ocean hover:text-ocean dark:hover:border-accent dark:hover:text-accent"
                >
                  <Icon size={16} className="text-ocean dark:text-accent" aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <Section title="Terbaru" viewAll="/ongoing">
          {loading ? <div className="anime-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}</div> : <AnimeGrid animes={data.latest.slice(0, 8)} />}
        </Section>

        <Section title="Populer" viewAll="/popular">
          {loading ? <div className="anime-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}</div> : <AnimeGrid animes={data.popular.slice(0, 8)} />}
        </Section>

        <Section title="Webtoon" viewAll="/webtoon">
          {loading ? (
            <div className="anime-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}</div>
          ) : data.webtoons.length === 0 ? (
            <div className="card p-5 text-sm" style={textStyle(true)}>Webtoon-nya belum bisa ditampilkan sekarang, coba lagi beberapa saat lagi ya.</div>
          ) : (
            <div className="anime-grid">
              {data.webtoons.slice(0, 8).map((item) => (
                <Link key={item.url} href={`/webtoon/${encodeURIComponent(item.url)}`} className="anime-card group">
                  <div className="relative aspect-[3/4] bg-[var(--color-surface-alt)]">
                    {item.thumbnail ? (
                      <Image src={`/api/proxy?url=${encodeURIComponent(item.thumbnail || '')}`} alt={item.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center" style={textStyle(true)}>
                        <ImageOff size={20} />
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h3 className="line-clamp-2 text-xs font-semibold sm:text-sm" style={textStyle()}>{item.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Section>

        {Object.keys(data.schedule).length > 0 && (
          <Section title="Jadwal Rilis" viewAll="/schedule">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Object.entries(data.schedule).slice(0, 6).map(([day, animes]) => (
                <div key={day} className="card p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="font-bold capitalize" style={textStyle()}>{day}</h3>
                    <span className="text-xs font-semibold" style={textStyle(true)}>{animes.length} anime</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {animes.slice(0, 3).map((anime) => (
                      <Link key={anime.slug} href={`/anime/${anime.slug}`} className="group">
                        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[var(--color-surface-alt)]">
                          <Image src={`/api/mal-image?url=${encodeURIComponent(anime.image || '')}`} alt={anime.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                          {anime.episode && <div className="absolute inset-x-0 bottom-0 bg-black/65 px-1 py-1 text-center text-[10px] font-bold text-white">Ep {anime.episode}</div>}
                        </div>
                        <p className="mt-1 line-clamp-2 text-center text-[11px] font-medium" style={textStyle()}>{anime.title}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {data.malSeason.length > 0 && (
          <Section title="Seasonal Anime" viewAll="/seasonal">
            <div className="anime-grid">
              {data.malSeason.slice(0, 8).map((anime) => (
                <Link key={anime.mal_id} href={`/mal/${anime.mal_id}`} className="anime-card group">
                  <div className="relative aspect-[3/4] bg-[var(--color-surface-alt)]">
                    <Image src={`/api/mal-image?url=${encodeURIComponent(anime.images.jpg.large_image_url || anime.images.jpg.image_url || '')}`} alt={anime.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                    <div className="absolute right-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-bold text-white">{anime.score?.toFixed(1) || 'N/A'}</div>
                  </div>
                  <div className="p-2.5">
                    <h3 className="truncate text-sm font-semibold" style={textStyle()}>{anime.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </Section>
        )}
      </div>
    </>
  )
}
