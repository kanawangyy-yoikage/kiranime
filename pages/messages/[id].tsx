import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  getOrCreateConversation,
  getUserById,
  getFriendIds,
  sendFriendRequest,
  type SocialUser,
} from '@/lib/social'
import ChatRoom from '@/components/ChatRoom'

export default function DirectMessagePage() {
  const router = useRouter()
  const { id } = router.query
  const { user, loading: authLoading } = useAuth()

  const [other, setOther] = useState<SocialUser | null>(null)
  const [convId, setConvId] = useState('')
  const [friendIds, setFriendIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [requesting, setRequesting] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }
    if (!id) return

    const load = async () => {
      const otherUid = String(id)
      const [u, ids, conv] = await Promise.all([
        getUserById(otherUid),
        getFriendIds(),
        getOrCreateConversation(otherUid),
      ])
      setOther(u)
      setFriendIds(ids)
      if (conv) setConvId(conv)
      setLoading(false)
    }
    load()
  }, [id, user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-[3px] border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
      </div>
    )
  }

  if (!other) {
    return (
      <div className="card p-10 text-center space-y-3">
        <p className="text-pearl/60">User tidak ditemukan.</p>
        <Link href="/messages" className="btn-secondary inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Kembali
        </Link>
      </div>
    )
  }

  const isFriend = friendIds.includes(other.uid)

  const handleAddFriend = async () => {
    if (requesting) return
    setRequesting(true)
    const res = await sendFriendRequest(other.uid)
    setRequesting(false)
    if (res.success) setFriendIds(await getFriendIds())
  }

  return (
    <>
      <Head><title>{other.displayName} - Pesan</title></Head>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Link href="/messages" className="btn-secondary p-2" aria-label="Kembali">
            <ArrowLeft size={18} />
          </Link>
          {other.photoURL ? (
            <img src={other.photoURL} alt={other.displayName} className="w-11 h-11 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-11 h-11 rounded-full bg-ocean/30 text-pearl flex items-center justify-center font-bold shrink-0">
              {other.displayName[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg text-pearl truncate">{other.displayName}</h1>
            <p className="text-xs text-pearl/50">
              {isFriend ? 'Teman' : 'Bukan temanmu'}
            </p>
          </div>
          {!isFriend && (
            <button
              onClick={handleAddFriend}
              disabled={requesting}
              className="btn-secondary text-xs px-3 py-1.5 inline-flex items-center gap-1.5"
            >
              {requesting ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
              {requesting ? 'Mengirim\u2026' : 'Tambah teman'}
            </button>
          )}
        </div>

        <div className="card p-0 overflow-hidden">
          {convId ? <ChatRoom path="dm" targetId={convId} /> : null}
        </div>
      </div>
    </>
  )
}
