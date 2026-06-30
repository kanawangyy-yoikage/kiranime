import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useAuth } from '@/contexts/AuthContext'
import { getFavorites } from '@/lib/firebase'
import AnimeGrid from '@/components/AnimeGrid'
import { useRouter } from 'next/router'

export default function FavoritesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.push('/login')
      return
    }

    const loadFavorites = async () => {
      try {
        const data = await getFavorites()
        setFavorites(data)
      } catch (error) {
        console.error('Failed to load favorites:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-ocean/30 border-t-ocean rounded-full animate-spin mx-auto mb-4" />
          <p className="text-pearl">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Favorit Saya - KiraNime</title>
      </Head>

      <div className="space-y-6">
        <div className="card p-6">
          <h1 className="section-title">❤️ Anime Favorit</h1>
          <p className="text-pearl/60">
            {favorites.length} anime dalam daftar favorit
          </p>
        </div>

        {favorites.length > 0 ? (
          <AnimeGrid animes={favorites} />
        ) : (
          <div className="text-center py-12 card p-6">
            <p className="text-4xl mb-4">💔</p>
            <h2 className="text-xl font-bold text-pearl mb-2">Belum ada favorit</h2>
            <p className="text-pearl/60 mb-4">Tambahkan anime ke favorit untuk melihatnya di sini</p>
            <button
              onClick={() => router.push('/')}
              className="btn-primary"
            >
              Jelajahi Anime
            </button>
          </div>
        )}
      </div>
    </>
  )
}
