import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { ScrollText, ImageOff, Flame, CalendarDays, CheckCircle } from 'lucide-react'
import CategorySearchBar from '@/components/CategorySearchBar'
import LandscapeSpotlight from '@/components/LandscapeSpotlight'

const DAY_ORDER = ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu']

const QUICK_MENU: { label: string; key: string; href: string; icon: typeof Flame }[] = [
  { label: 'Trending', key: 'trending', href: '/webtoon', icon: Flame },
  ...DAY_ORDER.map((day) => ({
    label: day.charAt(0).toUpperCase() + day.slice(1),
    key: day,
    href: `/webtoon?day=${day}`,
    icon: CalendarDays,
  })),
  { label: 'Selesai', key: 'completed', href: '/webtoon?day=completed', icon: CheckCircle },
]

interface WebtoonItem {
  title: string
  thumbnail?: string
  url: string
}

export default function WebtoonPage() {
  const router = useRouter()
  const day = typeof router.query.day === 'string' ? router.query.day : 'trending'

  const [items, setItems] = useState<WebtoonItem[]>([])
  const [loading, setLoading] = useState(true)
  const imageProxy = (url: string) => `/api/proxy?url=${encodeURIComponent(url)}`

  useEffect(() => {
    if (!router.isReady) return
    let cancelled = false
    setLoading(true)
    fetch(`/api/webtoon?action=trending&day=${encodeURIComponent(day)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        setItems(data.items || [])
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Webtoon fetch error:', err)
        setItems([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [day, router.isReady])

  const activeLabel = QUICK_MENU.find((m) => m.key === day)?.label || 'Webtoon'

  return (
    <>
      <Head><title>{activeLabel} Webtoon - KiraStream</title></Head>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="section-title flex items-center gap-2">
              <ScrollText size={22} className="text-ocean" aria-hidden="true" /> Webtoon
            </h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">Baca webtoon favorit kamu.</p>
          </div>
          <CategorySearchBar type="webtoon" placeholder="Cari webtoon\u2026" />
        </div>

        {/* Featured landscape */}
        {!loading && items.length > 0 && (
          <LandscapeSpotlight
            kind="comic"
            title={items[0].title}
            href={`/webtoon/${encodeURIComponent(items[0].url)}`}
            image={items[0].thumbnail || ''}
            imageProxy={(url) => `/api/proxy?url=${encodeURIComponent(url)}`}
          />
        )}

        {/* Quick Menu */}
        <div className="card p-4">
          <h3 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2 text-[var(--color-text)]">
            <CalendarDays size={16} className="text-ocean" aria-hidden="true" /> Jadwal Harian
          </h3>
          <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5 lg:grid-cols-9">
            {QUICK_MENU.map(({ label, key, href, icon: Icon }) => {
              const active = key === 'trending' ? day === 'trending' : day === key
              return (
                <Link
                  key={key}
                  href={href}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center text-xs font-semibold transition-colors ${
                    active
                      ? 'border-primary bg-primary/10 text-primary dark:border-accent dark:bg-accent/15 dark:text-accent'
                      : 'border-pearl/10 bg-pearl/[0.03] text-text-light/70 dark:text-text-dark/70 hover:border-ocean/40 hover:text-primary dark:hover:text-accent'
                  }`}
                >
                  <Icon size={18} className="text-ocean" aria-hidden="true" />
                  {label}
                </Link>
              )
            })}
          </div>
        </div>

        {loading ? (
          <div className="anime-grid">
            {[...Array(12)].map((_, i) => <div key={i} className="skeleton aspect-[3/4]" />)}
          </div>
        ) : items.length === 0 ? (
          <div className="card p-5 text-center text-[var(--color-text-muted)] text-sm">
            Webtoon belum bisa dimuat, coba refresh halaman ini sebentar lagi.
          </div>
        ) : (
          <div className="anime-grid">
            {items.map((item, i) => (
              <Link key={i} href={`/webtoon/${encodeURIComponent(item.url)}`} className="anime-card group">
                <div className="relative aspect-[3/4] bg-[var(--color-surface-alt)]">
                  {item.thumbnail ? (
                    <Image src={imageProxy(item.thumbnail)} alt={item.title} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[var(--color-text-muted)]">
                      <ImageOff size={24} aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="p-2.5">
                  <h3 className="line-clamp-2 text-xs font-semibold leading-snug sm:text-sm text-[var(--color-text)]">{item.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
