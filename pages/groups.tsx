import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Users, Plus, X, MessageCircle, Loader2, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  getMyGroups,
  getFriends,
  createGroup,
  deleteGroup,
  type Group,
  type SocialUser,
} from '@/lib/social'

export default function GroupsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [groups, setGroups] = useState<Group[]>([])
  const [friends, setFriends] = useState<SocialUser[]>([])
  const [loading, setLoading] = useState(true)

  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState('')

  const loadAll = useCallback(async () => {
    const [g, f] = await Promise.all([getMyGroups(), getFriends()])
    setGroups(g)
    setFriends(f)
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

  const handleCreate = async () => {
    if (!name.trim() || saving) return
    setSaving(true)
    const res = await createGroup(name, desc, selected)
    setSaving(false)
    if (res.success) {
      setCreating(false)
      setName('')
      setDesc('')
      setSelected([])
      await loadAll()
      if (res.id) router.push(`/groups/${res.id}`)
    }
  }

  const toggleSelect = (uid: string) => {
    setSelected((prev) => (prev.includes(uid) ? prev.filter((u) => u !== uid) : [...prev, uid]))
  }

  const handleDelete = async (id: string, groupName: string) => {
    if (!confirm(`Hapus grup "${groupName}"?`)) return
    setBusyId(id)
    await deleteGroup(id)
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
      <Head><title>Grup - KiraStream</title></Head>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="section-title flex items-center gap-2">
              <Users size={22} className="text-ocean" /> Grup
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Nonton bareng teman, diskusi & share di grup.</p>
          </div>
          <button onClick={() => setCreating(true)} className="btn-primary inline-flex items-center gap-2 justify-center">
            <Plus size={16} /> Buat Grup
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-pearl/60 mb-4">Belum ada grup. Buat grup pertama bareng temanmu!</p>
            <button onClick={() => setCreating(true)} className="btn-primary inline-flex items-center gap-2">
              <Plus size={16} /> Buat Grup
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((g) => (
              <div key={g.id} className="card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-12 h-12 rounded-xl bg-ocean/20 text-ocean flex items-center justify-center shrink-0">
                    <Users size={22} />
                  </div>
                  {g.ownerId === user?.uid && (
                    <button
                      onClick={() => handleDelete(g.id, g.name)}
                      disabled={busyId === g.id}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                      aria-label="Hapus grup"
                    >
                      {busyId === g.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  )}
                </div>
                <div>
                  <h2 className="font-bold text-pearl truncate">{g.name}</h2>
                  {g.description && <p className="text-xs text-pearl/60 line-clamp-2 mt-1">{g.description}</p>}
                  <p className="text-xs text-pearl/40 mt-2">{g.memberIds?.length || 0} anggota</p>
                </div>
                <Link
                  href={`/groups/${g.id}`}
                  className="btn-primary w-full inline-flex items-center justify-center gap-2 text-sm py-2"
                >
                  <MessageCircle size={15} /> Buka Grup
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      {creating && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-[60] bg-noir/60 backdrop-blur-sm"
            onClick={() => setCreating(false)}
            aria-label="Tutup"
          />
          <div
            role="dialog"
            aria-modal="true"
            className="fixed z-[61] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md card p-5 max-h-[85vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg text-pearl flex items-center gap-2">
                <Users size={18} className="text-ocean" /> Buat Grup Baru
              </h2>
              <button onClick={() => setCreating(false)} className="p-2 rounded-lg hover:bg-pearl/10" aria-label="Tutup">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama grup\u2026"
                className="input-field"
                maxLength={40}
              />
              <textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Deskripsi (opsional)\u2026"
                className="input-field text-sm"
                rows={2}
                maxLength={160}
              />

              <div>
                <p className="text-xs font-semibold text-pearl/60 uppercase tracking-wider mb-2">
                  Pilih teman ({selected.length})
                </p>
                {friends.length === 0 ? (
                  <p className="text-xs text-pearl/40">Belum ada teman untuk diajak. Tambah teman dulu di halaman Teman.</p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {friends.map((f) => {
                      const active = selected.includes(f.uid)
                      return (
                        <button
                          key={f.uid}
                          onClick={() => toggleSelect(f.uid)}
                          className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors ${
                            active ? 'bg-ocean/20' : 'hover:bg-surface-dark'
                          }`}
                        >
                          {f.photoURL ? (
                            <img src={f.photoURL} alt={f.displayName} className="w-9 h-9 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-ocean/30 text-pearl flex items-center justify-center font-bold shrink-0">
                              {f.displayName?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <span className="flex-1 text-sm text-pearl truncate text-left">{f.displayName}</span>
                          <span
                            className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs shrink-0 ${
                              active ? 'bg-ocean border-ocean text-white' : 'border-pearl/30'
                            }`}
                          >
                            {active && '✓'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={handleCreate}
                disabled={!name.trim() || saving}
                className="btn-primary w-full py-2.5 inline-flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {saving ? 'Membuat\u2026' : 'Buat Grup'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}
