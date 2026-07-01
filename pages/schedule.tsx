import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { fetchSchedule, type Anime } from '@/lib/api'

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<Record<string, Anime[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const data = await fetchSchedule()
        setSchedule(data)
      } catch (error) {
        console.error('Failed to load schedule:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSchedule()
  }, [])

  const days = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu']
  const imageProxy = (url: string) => `/api/proxy?url=${encodeURIComponent(url)}`

  return (
    <>
      <Head>
        <title>Jadwal Rilis - KiraNime</title>
      </Head>

      <div className="space-y-6">
        <div className="card px-5 py-4">
          <h1 className="section-title">📅 Jadwal Rilis Anime</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">Jadwal anime yang tayang setiap hari</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="skeleton h-6 w-32 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="skeleton h-32" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {days.map((day) => {
              const dayAnimes = schedule[day] || []
              if (dayAnimes.length === 0) return null
              return (
                <div key={day} className="card p-6">
                  <h2 className="text-lg font-bold mb-4 capitalize flex items-center gap-2 text-[var(--color-text)]">
                    <span className="w-2 h-8 bg-[var(--color-accent)] rounded-full" />
                    {day}
                    <span className="text-sm text-[var(--color-text-muted)] font-normal ml-2">
                      ({dayAnimes.length} anime)
                    </span>
                  </h2>
                  <div className="anime-grid">
                    {dayAnimes.map((anime) => (
                      <Link key={anime.slug} href={`/anime/${anime.slug}`} className="anime-card group">
                        <div className="relative aspect-[3/4] bg-[var(--color-surface-alt)]">
                          <Image src={imageProxy(anime.image)} alt={anime.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                          {anime.episode && <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] text-center py-1">Episode {anime.episode}</div>}
                        </div>
                        <div className="p-2.5">
                          <h3 className="text-xs font-semibold line-clamp-2 text-[var(--color-text)]">{anime.title}</h3>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
