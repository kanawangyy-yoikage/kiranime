import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'

interface SidebarProps {
  isOpen: boolean
  theme: 'dark' | 'light'
  toggleTheme: () => void
}

export default function Sidebar({ isOpen, theme, toggleTheme }: SidebarProps) {
  const router = useRouter()
  const { user, logout } = useAuth()

  const navItems = [
    { icon: '🏠', label: 'Beranda', href: '/' },
    { icon: '🔥', label: 'Populer', href: '/popular' },
    { icon: '🎬', label: 'Movies', href: '/movies' },
    { icon: '📺', label: 'Ongoing', href: '/ongoing' },
    { icon: '✅', label: 'Selesai', href: '/completed' },
    { icon: '🏷️', label: 'Genres', href: '/genres' },
    { icon: '📖', label: 'Manga', href: '/manga' },
    { icon: '📚', label: 'Novel', href: '/novel' },
    { icon: '📅', label: 'Jadwal', href: '/schedule' },
    { icon: '🔍', label: 'Pencarian', href: '/search' },
  ]

  const userItems = user ? [
    { icon: '👤', label: 'Profil', href: '/profile' },
    { icon: '❤️', label: 'Favorit', href: '/favorites' },
    { icon: '📝', label: 'Watchlist', href: '/watchlist' },
    { icon: '🕒', label: 'History', href: '/history' },
  ] : []

  const isActive = (href: string) => router.pathname === href

  return (
    <>
      <aside
        id="sidebar"
        className={`
          fixed left-0 top-16 bottom-0 w-64 glass border-r border-ocean/20 z-50
          transition-transform duration-300 overflow-y-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        <div className="p-4 space-y-6">
          {/* User Section */}
          {user ? (
            <div className="card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-ocean flex items-center justify-center text-xl font-bold text-pearl">
                  {user.displayName?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-pearl truncate">
                    {user.displayName || 'KiraFan'}
                  </p>
                  <p className="text-xs text-pearl/60 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
              <Link
                href="/profile"
                className="block w-full text-center py-2 bg-ocean/20 hover:bg-ocean/30 rounded-lg text-sm font-medium text-pearl transition-colors"
              >
                Lihat Profil
              </Link>
            </div>
          ) : (
            <div className="card p-4 text-center">
              <p className="text-sm text-pearl/60 mb-3">
                Login untuk menyimpan favorit & watchlist
              </p>
              <Link
                href="/login"
                className="block w-full py-2 bg-ocean hover:bg-accent-secondary rounded-lg text-sm font-medium text-pearl transition-colors"
              >
                Login / Register
              </Link>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-1">
            <p className="text-xs font-semibold text-pearl/40 uppercase tracking-wide px-3 mb-2">
              Menu
            </p>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium text-pearl">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Items */}
          {userItems.length > 0 && (
            <nav className="space-y-1">
              <p className="text-xs font-semibold text-pearl/40 uppercase tracking-wide px-3 mb-2">
                Saya
              </p>
              {userItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium text-pearl">{item.label}</span>
                </Link>
              ))}
            </nav>
          )}

          {/* Settings */}
          <div className="space-y-1 pt-4 border-t border-ocean/20">
            <button
              onClick={toggleTheme}
              className="nav-item w-full text-left"
            >
              <span className="text-xl">
                {theme === 'dark' ? '🌙' : '☀️'}
              </span>
              <span className="font-medium text-pearl">
                {theme === 'dark' ? 'Mode Gelap' : 'Mode Terang'}
              </span>
            </button>

            {user && (
              <button
                onClick={() => logout()}
                className="nav-item w-full text-left hover:bg-red-500/10"
              >
                <span className="text-xl">🚪</span>
                <span className="font-medium text-pearl">Logout</span>
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-ocean/20">
            <p className="text-xs text-pearl/40 text-center">
              Made with 💖 by Kira~ 🌸
            </p>
            <p className="text-xs text-pearl/40 text-center mt-1">
              v1.0.0 • © 2026 KiraNime
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
