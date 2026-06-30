import { useState, useEffect } from 'react'
import Head from 'next/head'
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

  return (
    <>
      <Head>
        <title>Jadwal Rilis - KiraNime</title>
      </Head>

      <div className="space-y-6">
        <div className="card p-6">
          <h1 className="section-title">📅 Jadwal Rilis Anime</h1>
          <p className="text-pearl/60">Jadwal anime yang tayang setiap hari</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="card p-6">
                <div className="loading-skeleton h-6 w-32 mb-4" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="loading-skeleton h-32" />
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
                  <h2 className="text-lg font-bold text-pearl mb-4 capitalize flex items-center gap-2">
                    <span className="w-2 h-8 bg-ocean rounded-full" />
                    {day}
                    <span className="text-sm text-pearl/60 font-normal ml-2">
                      ({dayAnimes.length} anime)
                    </span>
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {dayAnimes.map((anime) => (
                      <a
                        key={anime.slug}
                        href={`/anime/${anime.slug}`}
                        className="group"
                      >
                        <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-2">
                          <img
                            src={anime.image}
                            alt={anime.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {anime.episode && (
                            <div className="absolute bottom-0 left-0 right-0 bg-ocean/90 text-pearl text-xs text-center py-1 font-medium">
                              Episode {anime.episode}
                            </div>
                          )}
                        </div>
                        <h3 className="text-sm text-pearl font-medium line-clamp-2 group-hover:text-ocean transition-colors">
                          {anime.title}
                        </h3>
                      </a>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && Object.keys(schedule).length === 0 && (
          <div className="text-center py-12 card p-6">
            <p className="text-pearl/60">Jadwal tidak tersedia saat ini</p>
          </div>
        )}
      </div>
    </>
  )
}
