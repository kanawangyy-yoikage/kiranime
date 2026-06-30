import { useState, useEffect } from 'react'
import Head from 'next/head'
import ComicGrid from '@/components/ComicGrid'
import Section from '@/components/Section'
import { fetchComicLatest, fetchComicPopular, Comic } from '@/lib/api'

export default function MangaPage() {
  const [latestComics, setLatestComics] = useState<Comic[]>([])
  const [popularComics, setPopularComics] = useState<Comic[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [latest, popular] = await Promise.all([
          fetchComicLatest(1),
          fetchComicPopular(1),
        ])
        setLatestComics(latest)
        setPopularComics(popular)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <>
      <Head>
        <title>Manga & Komik - KiraNime 🌸</title>
      </Head>

      <div className="space-y-8">
        <div className="card p-6">
          <h1 className="text-2xl font-bold text-pearl">📖 Manga & Komik</h1>
          <p className="text-pearl/60">Baca Manga, Manhwa, dan Manhua online gratis dengan Kira~ 🌸</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-ocean/30 border-t-ocean rounded-full animate-spin mx-auto mb-4" />
            <p className="text-pearl">Membuka lembaran komik...</p>
          </div>
        ) : (
          <>
            {popularComics.length > 0 && (
              <Section title="🔥 Komik Populer">
                <ComicGrid comics={popularComics} />
              </Section>
            )}

            {latestComics.length > 0 && (
              <Section title="⚡ Update Terbaru">
                <ComicGrid comics={latestComics} />
              </Section>
            )}
          </>
        )}
      </div>
    </>
  )
}
