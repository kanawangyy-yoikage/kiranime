import Link from 'next/link'
import { useRouter } from 'next/router'
import { Home, Flame, PlayCircle, CheckCircle, Calendar, Tags, Clapperboard, BookOpen, ScrollText, BookMarked } from 'lucide-react'
import AZList from './AZList'

const MENU_ITEMS = [
  { label: 'Beranda', href: '/', icon: Home },
  { label: 'Populer', href: '/popular', icon: Flame },
  { label: 'Ongoing', href: '/ongoing', icon: PlayCircle },
  { label: 'Selesai', href: '/completed', icon: CheckCircle },
  { label: 'Movies', href: '/movies', icon: Clapperboard },
  { label: 'Jadwal', href: '/schedule', icon: Calendar },
  { label: 'Genres', href: '/genres', icon: Tags },
]

const OTHER_LINKS = [
  { label: 'Komik', href: '/manga', icon: BookOpen },
  { label: 'Webtoon', href: '/webtoon', icon: ScrollText },
  { label: 'Novel', href: '/novel', icon: BookMarked },
]

export default function AnimeMenuAside() {
  const router = useRouter()

  return (
    <aside className="hidden xl:block w-64 shrink-0 space-y-4 sticky top-24 self-start">
      {/* Menu Anime */}
      <div className="card p-4">
        <h3 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
          <Clapperboard size={16} className="text-ocean" /> Menu Anime
        </h3>
        <div className="space-y-1">
          {MENU_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = href === '/' ? router.pathname === '/' : router.pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary dark:bg-accent/15 dark:text-accent'
                    : 'text-text-light/70 dark:text-text-dark/70 hover:bg-pearl/10 hover:text-primary dark:hover:text-accent'
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* A-Z List */}
      <div className="card p-4">
        <h3 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
          <Home size={16} className="text-ocean" /> A-Z List
        </h3>
        <AZList compact />
      </div>

      {/* Komik & Lainnya */}
      <div className="card p-4">
        <h3 className="font-bold text-sm uppercase tracking-wider mb-3">Jelajahi</h3>
        <div className="space-y-1">
          {OTHER_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-text-light/70 dark:text-text-dark/70 hover:bg-pearl/10 hover:text-primary dark:hover:text-accent transition-colors"
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}
