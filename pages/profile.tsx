import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Pencil, Clapperboard, Clock, Star, BookmarkPlus, PlayCircle, CheckCircle, Ban } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserFirestore, uploadAvatar, uploadBanner, updateUserFirestore } from '@/lib/firebase'
import { getHistory, getFavorites, getWatchlistByStatus, getContinueWatching } from '@/lib/firebase'

export default function ProfilePage() {
  const router = useRouter()
  const { user, updateProfile, loading: authLoading } = useAuth()
  
  const [profile, setProfile] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [watchlist, setWatchlist] = useState<any[]>([])
  const [continueWatching, setContinueWatching] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'favorites' | 'watchlist'>('overview')
  
  // Edit state
  const [editMode, setEditMode] = useState(false)
  const [editName, setEditName] = useState('')
  const [editBio, setEditBio] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      router.push('/login')
      return
    }

    const loadProfile = async () => {
      try {
        const userData = await getUserFirestore(user.uid)
        setProfile(userData)
        setEditName(userData?.displayName || '')
        setEditBio(userData?.bio || '')
        
        const [hist, favs, wl, cw] = await Promise.all([
          getHistory(20),
          getFavorites(),
          getWatchlistByStatus(),
          getContinueWatching(),
        ])
        
        setHistory(hist)
        setFavorites(favs)
        setWatchlist(wl)
        setContinueWatching(cw)
      } catch (error) {
        console.error('Failed to load profile:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user, authLoading, router])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await updateProfile({ displayName: editName })
      await updateUserFirestore(user!.uid, { displayName: editName, bio: editBio })
      setProfile({ ...profile, displayName: editName, bio: editBio })
      setEditMode(false)
    } catch (error) {
      console.error('Failed to save profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    
    const result = await uploadAvatar(file, user.uid)
    if (result.success) {
      await updateProfile({ photoURL: result.url })
      await updateUserFirestore(user.uid, { photoURL: result.url })
      setProfile({ ...profile, photoURL: result.url })
    }
  }

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

  if (!user) return null

  // Calculate stats
  const stats = {
    watchedEpisodes: profile?.stats?.watchedEpisodes || history.length * 3 || 0,
    totalHours: profile?.stats?.totalHours || Math.round(history.length * 0.4) || 0,
    favorites: favorites.length,
    watchlist: watchlist.length,
    continueWatching: continueWatching.length,
  }

  return (
    <>
      <Head>
        <title>Profil Saya - KiraNime</title>
      </Head>

      <div className="space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden"
        >
          {/* Banner */}
          <div 
            className="h-32 md:h-48"
            style={{ 
              background: profile?.bannerColor || 'linear-gradient(135deg, #1a237e, #5B88B2, #A8C7FA)' 
            }}
          />

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4 -mt-12 md:-mt-16">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-ocean border-4 border-surface-card flex items-center justify-center overflow-hidden">
                  {profile?.photoURL ? (
                    <img
                      src={profile.photoURL}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-pearl">
                      {(profile?.displayName || '?')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-ocean rounded-full cursor-pointer hover:bg-accent-secondary transition-colors">
                  <svg className="w-4 h-4 text-pearl" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>

              {/* Name & Bio */}
              <div className="flex-1 text-center md:text-left pb-2">
                {editMode ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input-field text-xl font-bold"
                      placeholder="Nama"
                    />
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      className="input-field text-sm"
                      placeholder="Bio singkat..."
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        className="btn-primary text-sm"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={() => setEditMode(false)}
                        className="btn-secondary text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-display font-bold text-pearl">
                      {profile?.displayName || 'KiraFan'}
                    </h1>
                    <p className="text-pearl/60 text-sm mb-2">{user.email}</p>
                    {profile?.bio && (
                      <p className="text-pearl/80 text-sm">{profile.bio}</p>
                    )}
                    <button
                      onClick={() => setEditMode(true)}
                      className="mt-2 text-sm text-ocean hover:text-accent-secondary transition-colors inline-flex items-center gap-1.5"
                    >
                      <Pencil size={14} /> Edit Profil
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-ocean">{stats.watchedEpisodes}</div>
            <div className="text-xs text-pearl/60">Episode Ditonton</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-ocean">{stats.totalHours}h</div>
            <div className="text-xs text-pearl/60">Estimasi Jam</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-ocean">{stats.favorites}</div>
            <div className="text-xs text-pearl/60">Favorit</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-ocean">{stats.watchlist}</div>
            <div className="text-xs text-pearl/60">Watchlist</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-ocean">{stats.continueWatching}</div>
            <div className="text-xs text-pearl/60">Lanjutkan Nonton</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card overflow-hidden">
          <div className="flex border-b border-ocean/20 overflow-x-auto">
            {(['overview', 'history', 'favorites', 'watchlist'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab flex-shrink-0 capitalize ${
                  activeTab === tab ? 'active' : ''
                }`}
              >
                {tab === 'overview' ? 'Ringkasan' :
                 tab === 'history' ? 'Riwayat' :
                 tab === 'favorites' ? 'Favorit' : 'Watchlist'}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Continue Watching */}
                {continueWatching.length > 0 && (
                  <div>
                    <h3 className="font-bold text-pearl mb-3 flex items-center gap-2"><Clapperboard size={18} className="text-ocean" /> Lanjutkan Nonton</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {continueWatching.slice(0, 4).map((item) => (
                        <a
                          key={item.slug}
                          href={`/anime/${item.slug}`}
                          className="group"
                        >
                          <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
                            <img
                              src={item.image || '/default.jpg'}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-dark">
                              <div 
                                className="h-full bg-ocean"
                                style={{ width: `${item.progress || 0}%` }}
                              />
                            </div>
                          </div>
                          <p className="text-sm text-pearl truncate">{item.title}</p>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent History */}
                {history.length > 0 && (
                  <div>
                    <h3 className="font-bold text-pearl mb-3 flex items-center gap-2"><Clock size={18} className="text-ocean" /> Riwayat Terakhir</h3>
                    <div className="space-y-2">
                      {history.slice(0, 5).map((item) => (
                        <a
                          key={item.slug || item.timestamp}
                          href={`/anime/${item.slug}`}
                          className="flex items-center gap-3 p-2 hover:bg-surface-hover rounded-lg transition-colors"
                        >
                          <img
                            src={item.image || '/default.jpg'}
                            alt={item.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium text-pearl text-sm">{item.title}</p>
                            <p className="text-xs text-pearl/60">
                              {new Date(item.timestamp || item.lastWatchedAt).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* History */}
            {activeTab === 'history' && (
              <div className="space-y-2">
                {history.length > 0 ? (
                  history.map((item) => (
                    <a
                      key={item.slug || item.timestamp}
                      href={`/anime/${item.slug}`}
                      className="flex items-center gap-4 p-3 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      <img
                        src={item.image || '/default.jpg'}
                        alt={item.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-pearl">{item.title}</p>
                        <p className="text-sm text-pearl/60">
                          {new Date(item.timestamp || item.lastWatchedAt).toLocaleString('id-ID')}
                        </p>
                        {item.progress > 0 && (
                          <div className="mt-1 h-1 bg-surface-dark rounded">
                            <div className="h-full bg-ocean rounded" style={{ width: `${item.progress}%` }} />
                          </div>
                        )}
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="text-center py-8 text-pearl/60">
                    Belum ada riwayat tontonan
                  </div>
                )}
              </div>
            )}

            {/* Favorites */}
            {activeTab === 'favorites' && (
              <div className="space-y-2">
                {favorites.length > 0 ? (
                  favorites.map((item) => (
                    <a
                      key={item.slug}
                      href={`/anime/${item.slug}`}
                      className="flex items-center gap-4 p-3 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      <img
                        src={item.image || '/default.jpg'}
                        alt={item.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-pearl">{item.title}</p>
                        <p className="text-sm text-pearl/60 flex items-center gap-1"><Star size={12} className="fill-yellow-500 text-yellow-500" /> {item.score || 'N/A'}</p>
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="text-center py-8 text-pearl/60">
                    Belum ada favorit
                  </div>
                )}
              </div>
            )}

            {/* Watchlist */}
            {activeTab === 'watchlist' && (
              <div className="space-y-4">
                {watchlist.length > 0 ? (
                  watchlist.map((item) => (
                    <a
                      key={item.slug}
                      href={`/anime/${item.slug}`}
                      className="flex items-center gap-4 p-3 hover:bg-surface-hover rounded-lg transition-colors"
                    >
                      <img
                        src={item.image || '/default.jpg'}
                        alt={item.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-pearl">{item.title}</p>
                        <p className="text-sm text-pearl/60 capitalize inline-flex items-center gap-1.5">
                          {item.status === 'planning' && (<><BookmarkPlus size={14} /> Mau Nonton</>)}
                          {item.status === 'watching' && (<><PlayCircle size={14} /> Sedang Nonton</>)}
                          {item.status === 'completed' && (<><CheckCircle size={14} /> Selesai</>)}
                          {item.status === 'dropped' && (<><Ban size={14} /> Dropped</>)}
                        </p>
                        {item.totalEpisodes > 0 && (
                          <p className="text-xs text-pearl/60">
                            {item.progress || 0}/{item.totalEpisodes} episode
                          </p>
                        )}
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="text-center py-8 text-pearl/60">
                    Watchlist kosong
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
