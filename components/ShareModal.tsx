import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, UserPlus, Search, Share2, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'
import {
  getFriends,
  getMyGroups,
  sendFriendRequest,
  getOrCreateConversation,
  sendMessage,
  searchUsersByKeyword,
  type SocialUser,
  type Group,
  type SharePayload,
} from '@/lib/social'

interface ShareModalProps {
  open: boolean
  onClose: () => void
  item: SharePayload
}

type Mode = 'friends' | 'groups'

export default function ShareModal({ open, onClose, item }: ShareModalProps) {
  const { user } = useAuth()
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)
  const [mode, setMode] = useState<Mode>('friends')
  const [friends, setFriends] = useState<SocialUser[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [searchResults, setSearchResults] = useState<SocialUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sendingTo, setSendingTo] = useState('')
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (!open) return
    setMode('friends')
    setStatus(null)
    setSearchQuery('')
    setSearchResults([])
    if (!user) return
    Promise.all([getFriends(), getMyGroups()]).then(([f, g]) => {
      setFriends(f)
      setGroups(g)
    })
  }, [open, user])

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    const t = setTimeout(async () => {
      const res = await searchUsersByKeyword(searchQuery)
      setSearchResults(res)
    }, 250)
    return () => clearTimeout(t)
  }, [searchQuery])

  const doShare = async (target: SocialUser | Group) => {
    const isGroup = 'id' in target && !('uid' in target)
    setSendingTo(isGroup ? target.id : target.uid)
    setStatus(null)
    let ok = false
    if (isGroup) {
      const res = await sendMessage('group', target.id, { type: 'share', share: item })
      ok = res.success
    } else {
      const convId = await getOrCreateConversation(target.uid)
      if (convId) {
        const res = await sendMessage('dm', convId, { type: 'share', share: item })
        ok = res.success
      }
    }
    setSendingTo('')
    setStatus({ ok, text: ok ? t('share.success') : t('share.fail') })
  }

  const handleAddFriend = async (uid: string) => {
    const res = await sendFriendRequest(uid)
    setStatus({ ok: res.success, text: res.success ? t('share.requestSent') : res.error || t('share.genericFail') })
    setSearchResults((prev) => prev.filter((u) => u.uid !== uid))
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-noir/60 backdrop-blur-sm"
            onClick={onClose}
            aria-label={t('common.close')}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={t('share.aria')}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            className="fixed z-[61] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md card p-5 max-h-[80vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg flex items-center gap-2 text-pearl">
                <Share2 size={18} className="text-ocean" /> {t('share.title')}
              </h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-pearl/10" aria-label={t('common.close')}>
                <X size={18} />
              </button>
            </div>

            {/* Preview */}
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-surface-dark">
              {item.image ? (
                <img
                  src={`/api/proxy?url=${encodeURIComponent(item.image)}`}
                  alt={item.title}
                  className="w-12 h-16 object-cover rounded-md"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                />
              ) : null}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-pearl truncate">{item.title}</p>
                <p className="text-xs text-pearl/50 capitalize">{item.kind}</p>
              </div>
            </div>

            {!user ? (
              <div className="text-center py-8">
                <p className="text-pearl/70 mb-4">{t('share.requireLogin')}</p>
                <Link href="/login" onClick={onClose} className="btn-primary inline-flex items-center gap-2">
                  <UserPlus size={16} /> {t('nav.login')}
                </Link>
              </div>
            ) : (
              <>
                {/* Mode tabs */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setMode('friends')}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      mode === 'friends'
                        ? 'bg-primary/15 text-primary dark:text-accent border border-primary/30'
                        : 'bg-surface-dark text-pearl/60 hover:text-pearl'
                    }`}
                  >
                    {t('share.friends')}
                  </button>
                  <button
                    onClick={() => setMode('groups')}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      mode === 'groups'
                        ? 'bg-primary/15 text-primary dark:text-accent border border-primary/30'
                        : 'bg-surface-dark text-pearl/60 hover:text-pearl'
                    }`}
                  >
                    {t('share.groups')}
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2">
                  {mode === 'friends' ? (
                    <>
                      {/* Search new friends */}
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-surface-dark mb-2">
                        <Search size={16} className="text-pearl/40 shrink-0" />
                        <input
                          type="search"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={t('share.searchPlaceholder')}
                          className="flex-1 bg-transparent text-sm outline-none placeholder:text-pearl/30"
                        />
                      </div>

                      {searchResults.length > 0 && (
                        <div className="space-y-1.5 mb-2">
                          {searchResults.map((u) => (
                            <div key={u.uid} className="flex flex-wrap items-center gap-3 p-2.5 rounded-xl bg-surface-dark">
                              <Avatar user={u} />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-pearl truncate">{u.displayName}</p>
                              </div>
                              <button
                                onClick={() => handleAddFriend(u.uid)}
                                className="text-xs text-ocean hover:text-oceanAccent-secondary font-semibold shrink-0"
                              >
                                {t('share.addFriend')}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {friends.length === 0 && searchResults.length === 0 ? (
                        <p className="text-center text-sm text-pearl/50 py-8">
                          {t('share.noFriends')}
                        </p>
                      ) : (
                        friends.map((f) => (
                          <div key={f.uid} className="flex flex-wrap items-center gap-3 p-2.5 rounded-xl hover:bg-surface-dark transition-colors">
                            <Avatar user={f} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-pearl truncate">{f.displayName}</p>
                            </div>
                            <button
                              onClick={() => doShare(f)}
                              disabled={!!sendingTo}
                              className="btn-primary text-xs px-3 py-1.5"
                            >
                              {sendingTo === f.uid ? <Loader2 size={14} className="animate-spin" /> : t('share.send')}
                            </button>
                          </div>
                        ))
                      )}
                    </>
                  ) : (
                    <>
                      {groups.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-sm text-pearl/50 mb-3">{t('share.noGroups')}</p>
                          <Link href="/groups" onClick={onClose} className="text-sm text-ocean font-semibold inline-flex items-center gap-1.5">
                            <Users size={16} /> {t('share.createGroup')}
                          </Link>
                        </div>
                      ) : (
                        groups.map((g) => (
                          <div key={g.id} className="flex flex-wrap items-center gap-3 p-2.5 rounded-xl hover:bg-surface-dark transition-colors">
                            <div className="w-10 h-10 rounded-full bg-ocean/20 text-ocean flex items-center justify-center shrink-0">
                              <Users size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-pearl truncate">{g.name}</p>
                              <p className="text-xs text-pearl/50">{t('groups.members').replace('{n}', String(g.memberIds?.length || 0))}</p>
                            </div>
                            <button
                              onClick={() => doShare(g)}
                              disabled={!!sendingTo}
                              className="btn-primary text-xs px-3 py-1.5"
                            >
                              {sendingTo === g.id ? <Loader2 size={14} className="animate-spin" /> : t('share.send')}
                            </button>
                          </div>
                        ))
                      )}
                    </>
                  )}
                </div>
              </>
            )}

            {status && (
              <div
                className={`mt-3 text-sm text-center py-2 rounded-lg ${
                  status.ok ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                }`}
              >
                {status.text}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Tiny inline avatar (avoid importing the bigger one)
function Avatar({ user }: { user: SocialUser }) {
  return user.photoURL ? (
    <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full object-cover shrink-0" />
  ) : (
    <div className="w-10 h-10 rounded-full bg-ocean/30 text-pearl flex items-center justify-center font-bold shrink-0">
      {user.displayName?.[0]?.toUpperCase() || '?'}
    </div>
  )
}
