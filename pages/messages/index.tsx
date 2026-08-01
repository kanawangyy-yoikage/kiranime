import { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { MessageCircle, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { getConversations, getUserById, formatMessageTime, type Conversation } from '@/lib/social'

interface ConvWithUser extends Conversation {
  otherUid: string
  otherName: string
  otherPhoto: string | null
}

export default function MessagesPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [convs, setConvs] = useState<ConvWithUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push('/login')
      return
    }
    setLoading(true)
    getConversations().then(async (list) => {
      const enriched: ConvWithUser[] = await Promise.all(
        list.map(async (c) => {
          const otherUid = (c.memberIds || []).find((p) => p !== user.uid) || ''
          let otherName = 'KiraFan'
          let otherPhoto: string | null = null
          if (otherUid) {
            const other = await getUserById(otherUid)
            if (other) {
              otherName = other.displayName
              otherPhoto = other.photoURL
            }
          }
          return { ...c, otherUid, otherName, otherPhoto }
        })
      )
      setConvs(enriched)
      setLoading(false)
    })
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-[3px] border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <>
      <Head><title>Pesan - KiraStream</title></Head>
      <div className="space-y-5">
        <h1 className="section-title flex items-center gap-2">
          <MessageCircle size={22} className="text-ocean" /> Pesan
        </h1>

        {convs.length === 0 ? (
          <div className="card p-10 text-center space-y-2">
            <p className="text-pearl/60">Belum ada percakapan.</p>
            <p className="text-sm text-pearl/40">
              Mulai dari halaman <Link href="/friends" className="text-ocean hover:underline">Teman</Link> lalu klik Chat.
            </p>
          </div>
        ) : (
          <div className="card divide-y divide-ocean/10">
            {convs.map((c) => (
              <Link
                key={c.id}
                href={`/messages/${c.otherUid}`}
                className="flex items-center gap-3 p-3.5 hover:bg-surface-dark transition-colors"
              >
                {c.otherPhoto ? (
                  <img src={c.otherPhoto} alt={c.otherName} className="w-12 h-12 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-ocean/30 text-pearl flex items-center justify-center font-bold shrink-0">
                    {c.otherName[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-pearl truncate">{c.otherName}</p>
                    {c.lastMessageAt && <span className="text-[10px] text-pearl/40 flex-shrink-0">{formatMessageTime(c.lastMessageAt)}</span>}
                  </div>
                  <p className="text-sm text-pearl/50 truncate mt-0.5">
                    {c.lastMessage || 'Belum ada pesan'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
