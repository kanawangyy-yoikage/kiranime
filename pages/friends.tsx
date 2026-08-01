import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Users, UserPlus, Search, MessageCircle, Check, X, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  getFriends,
  getIncomingRequests,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  removeFriend,
  searchUsersByKeyword,
  type SocialUser,
  type FriendRequest,
} from '@/lib/social'

type Tab = 'friends' | 'requests' | 'add'

export default function FriendsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [tab, setTab] = useState<Tab>('friends')
  const [friends, setFriends] = useState<SocialUser[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SocialUser[]>([])
  const [searching, setSearching] = useState(false)
  const [busyId, setBusyId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadAll = useCallback(async () => {
    const [f, r] = await Promise.all([getFriends(), getIncomingRequests()])
    setFriends(f)
    setRequests(r)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }
    loadAll()
  }, [user, authLoading, router, loadAll])

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }
    setSearching(true)
    const t = setTimeout(async () => {
      const res = await searchUsersByKeyword(query)
      setResults(res)
      setSearching(false)
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  const runAction = async (id: string, fn: () => Promise<any>) => {
    setBusyId(id)
    setError('')
    const res = await fn()
    if (res && res.success === false && res.error) {
      setError(res.error)
    }
    setBusyId('')
    await loadAll()
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-[3px] border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Head><title>Teman - KiraStream</title></Head>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="section-title flex items-center gap-2">
              <Users size={22} className="text-ocean" /> Teman
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Kelola pertemanan & bagikan anime/manga kesukaanmu.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-ocean/10 pb-3 overflow-x-auto">
          {(['friends', 'requests', 'add'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`tab flex-shrink-0 capitalize ${tab === t ? 'active' : ''}`}
            >
              {t === 'friends' ? 'Temanku' : t === 'requests' ? `Permintaan (${requests.length})` : 'Tambah Teman'}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Friends */}
        {tab === 'friends' && (
          <div className="card p-4 space-y-2">
            {friends.length === 0 ? (
              <p className="text-center text-sm text-pearl/50 py-8">
                Belum ada teman. Yuk cari & tambah temanmu!
              </p>
            ) : (
              friends.map((f) => (
                <div key={f.uid} className="flex flex-wrap items-center gap-3 p-2.5 rounded-xl hover:bg-surface-dark transition-colors">
                  {f.photoURL ? (
                    <img src={f.photoURL} alt={f.displayName} className="w-11 h-11 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-ocean/30 text-pearl flex items-center justify-center font-bold shrink-0">
                      {f.displayName?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-pearl truncate">{f.displayName}</p>
                    <p className="text-xs text-pearl/50 truncate">{f.email || ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/messages/${f.uid}`} className="btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5">
                      <MessageCircle size={14} /> Chat
                    </Link>
                    <button
                      onClick={() => runAction(f.uid, () => removeFriend(f.uid))}
                      disabled={busyId === f.uid}
                      className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                    >
                      {busyId === f.uid ? <Loader2 size={14} className="animate-spin" /> : 'Hapus'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Requests */}
        {tab === 'requests' && (
          <div className="card p-4 space-y-2">
            {requests.length === 0 ? (
              <p className="text-center text-sm text-pearl/50 py-8">Tidak ada permintaan teman masuk.</p>
            ) : (
              requests.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center gap-3 p-2.5 rounded-xl hover:bg-surface-dark transition-colors">
                  {r.from.photoURL ? (
                    <img src={r.from.photoURL} alt={r.from.displayName} className="w-11 h-11 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-ocean/30 text-pearl flex items-center justify-center font-bold shrink-0">
                      {r.from.displayName?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-pearl truncate">{r.from.displayName}</p>
                    <p className="text-xs text-pearl/50">minta jadi teman</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => runAction(r.from.uid, () => acceptFriendRequest(r.from.uid))}
                      disabled={busyId === r.from.uid}
                      className="btn-primary text-xs px-3 py-1.5 inline-flex items-center gap-1"
                    >
                      {busyId === r.from.uid ? <Loader2 size={14} className="animate-spin" /> : <><Check size={14} /> Terima</>}
                    </button>
                    <button
                      onClick={() => runAction(r.from.uid, () => declineFriendRequest(r.from.uid))}
                      disabled={busyId === r.from.uid}
                      className="btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1"
                    >
                      <X size={14} /> Tolak
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Add friend */}
        {tab === 'add' && (
          <div className="card p-4 space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-dark">
              <Search size={16} className="text-pearl/40 shrink-0" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama temanmu\u2026"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-pearl/30"
              />
            </div>

            {searching && (
              <p className="text-center text-sm text-pearl/50">Mencari\u2026</p>
            )}

            {!searching && query.trim() && results.length === 0 && (
              <p className="text-center text-sm text-pearl/50 py-4">
                Nggak ketemu. Pastikan temanmu sudah pernah login ya~
              </p>
            )}

            {results.length > 0 && (
              <div className="space-y-2">
                {results.map((u) => (
                  <div key={u.uid} className="flex flex-wrap items-center gap-3 p-2.5 rounded-xl hover:bg-surface-dark transition-colors">
                    {u.photoURL ? (
                      <img src={u.photoURL} alt={u.displayName} className="w-11 h-11 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-ocean/30 text-pearl flex items-center justify-center font-bold shrink-0">
                        {u.displayName?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-pearl truncate">{u.displayName}</p>
                      <p className="text-xs text-pearl/50 truncate">{u.email || ''}</p>
                    </div>
                    <button
                      onClick={() => runAction(u.uid, () => sendFriendRequest(u.uid))}
                      disabled={busyId === u.uid || friends.some((f) => f.uid === u.uid)}
                      className="btn-primary text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
                    >
                      {busyId === u.uid ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : friends.some((f) => f.uid === u.uid) ? (
                        'Sudah teman'
                      ) : (
                        <><UserPlus size={14} /> Kirim permintaan</>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
