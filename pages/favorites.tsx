import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Heart, HeartCrack } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getFavorites } from '@/lib/firebase'
import AnimeGrid from '@/components/AnimeGrid'
import { useRouter } from 'next/router'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'

export default function FavoritesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)
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
          <div className="w-10 h-10 border-[3px] border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{t('favorites.title')} - KiraStream</title>
      </Head>

      <div className="space-y-8">
        <div className="flex flex-col gap-1">
          <h1 className="section-title flex items-center gap-2"><Heart size={22} style={{ color: 'var(--color-primary)' }} fill="currentColor" aria-hidden="true" /> {t('favorites.heading')}</h1>
          <p className="text-[var(--color-text-muted)]">
            {t('favorites.count').replace('{n}', String(favorites.length))}
          </p>
        </div>

        {favorites.length > 0 ? (
          <AnimeGrid animes={favorites} />
        ) : (
          <div className="text-center py-12 card p-6">
            <HeartCrack className="mx-auto mb-4 text-[var(--color-text-muted)]" size={40} aria-hidden="true" />
            <h2 className="text-xl font-bold text-[var(--color-text)] mb-2">{t('favorites.empty')}</h2>
            <p className="text-[var(--color-text-muted)] mb-4">{t('favorites.emptyDesc')}</p>
            <button
              onClick={() => router.push('/')}
              className="btn-primary"
            >
              {t('favorites.explore')}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
