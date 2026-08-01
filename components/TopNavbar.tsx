import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState, FormEvent, ReactNode } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Search,
  Moon,
  Sun,
  Menu,
  X,
  ChevronDown,
  LogIn,
  Home,
  Flame,
  Film,
  PlayCircle,
  CheckCircle,
  Calendar,
  Tags,
  BookOpen,
  Sparkles,
  TrendingUp,
  ScrollText,
  BookMarked,
  Clapperboard,
  LogOut,
  ListOrdered,
  User,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface NavItem {
  label: string
  href: string
  icon: ReactNode
}

const ANIME_ITEMS: NavItem[] = [
  { label: 'Populer', href: '/popular', icon: <Flame size={15} /> },
  { label: 'Movies', href: '/movies', icon: <Film size={15} /> },
  { label: 'Ongoing', href: '/ongoing', icon: <PlayCircle size={15} /> },
  { label: 'Selesai', href: '/completed', icon: <CheckCircle size={15} /> },
  { label: 'Jadwal', href: '/schedule', icon: <Calendar size={15} /> },
  { label: 'Genres', href: '/genres', icon: <Tags size={15} /> },
  { label: 'A-Z List', href: '/animelist?letter=a', icon: <ListOrdered size={15} /> },
]

const KOMIK_ITEMS: NavItem[] = [
  { label: 'Semua Komik', href: '/manga', icon: <BookOpen size={15} /> },
  { label: 'Populer', href: '/manga?tab=popular', icon: <Flame size={15} /> },
  { label: 'Terbaru', href: '/manga?tab=latest', icon: <Sparkles size={15} /> },
  { label: 'Trending', href: '/manga?tab=trending', icon: <TrendingUp size={15} /> },
  { label: 'Manga', href: '/manga?type=manga', icon: <BookOpen size={15} /> },
  { label: 'Manhwa', href: '/manga?type=manhwa', icon: <BookOpen size={15} /> },
  { label: 'Manhua', href: '/manga?type=manhua', icon: <BookOpen size={15} /> },
]

const SIMPLE_LINKS: NavItem[] = [
  { label: 'Webtoon', href: '/webtoon', icon: <ScrollText size={16} /> },
  { label: 'Novel', href: '/novel', icon: <BookMarked size={16} /> },
]

interface DropdownGroup {
  key: string
  label: string
  icon: ReactNode
  items: NavItem[]
}

const DROPDOWN_GROUPS: DropdownGroup[] = [
  { key: 'anime', label: 'Anime', icon: <Clapperboard size={18} />, items: ANIME_ITEMS },
  { key: 'komik', label: 'Komik', icon: <BookOpen size={18} />, items: KOMIK_ITEMS },
]

export default function TopNavbar() {
  const router = useRouter()
  const { user, profile, loading: authLoading, logout } = useAuth()
  const [isDark, setIsDark] = useState(true)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const reduceMotion = useReducedMotion()
  const navRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  useEffect(() => {
    setOpenDropdown(null)
    setDrawerOpen(false)
    setSearchOpen(false)
  }, [router.pathname, router.asPath])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null)
        setDrawerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const toggleTheme = () => {
    const root = document.documentElement
    const next = root.classList.contains('dark') ? 'light' : 'dark'
    root.classList.toggle('dark', next === 'dark')
    localStorage.setItem('theme', next)
    setIsDark(next === 'dark')
  }

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      router.push('/')
    } finally {
      setLoggingOut(false)
    }
  }

  const isActive = (href: string) => {
    if (href.includes('?')) return router.asPath === href
    return router.pathname === href
  }

  return (
    <header ref={navRef} className="fixed top-0 left-0 right-0 z-50">
      {/* Main Bar */}
      <div className="h-16 bg-surface/85 dark:bg-surface-dark/85 backdrop-blur-md border-b border-pearl/10 shadow-sm">
        <div className="mx-auto max-w-[1600px] h-full px-4 md:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: Logo + mobile menu */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="lg:hidden p-2 rounded-lg bg-surface dark:bg-surface-dark text-text-light dark:text-text-dark hover:bg-pearl/10 transition-colors"
              aria-label="Buka menu"
            >
              {drawerOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
              <Image src="/icons/icon-96x96.png" alt="" width={32} height={32} className="rounded-lg" />
              <Image src="/logo-title.png" alt="KiraStream" width={110} height={36} className="h-7 w-auto object-contain" priority />
            </Link>
          </div>

          {/* Center: Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            <Link
              href="/"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                router.pathname === '/' ? 'text-primary dark:text-accent' : 'text-text-light/70 dark:text-text-dark/70 hover:text-primary dark:hover:text-accent'
              }`}
            >
              <Home size={16} aria-hidden="true" /> Beranda
            </Link>

            {DROPDOWN_GROUPS.map((group) => {
              const groupActive = group.items.some((i) => isActive(i.href))
              const open = openDropdown === group.key
              return (
                <div key={group.key} className="relative">
                  <button
                    onClick={() => setOpenDropdown(open ? null : group.key)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      groupActive || open ? 'text-primary dark:text-accent' : 'text-text-light/70 dark:text-text-dark/70 hover:text-primary dark:hover:text-accent'
                    }`}
                  >
                    {group.label}
                    <ChevronDown size={14} aria-hidden="true" className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={reduceMotion ? { duration: 0 } : { duration: 0.15 }}
                        className="absolute top-full left-0 mt-2 w-56 rounded-2xl border border-pearl/10 bg-surface dark:bg-surface-dark shadow-xl overflow-hidden"
                      >
                        <div className="py-2 px-2 space-y-0.5">
                          {group.items.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                isActive(item.href)
                                  ? 'bg-primary/10 text-primary dark:bg-accent/15 dark:text-accent'
                                  : 'text-text-light/70 dark:text-text-dark/70 hover:bg-pearl/10 hover:text-primary dark:hover:text-accent'
                              }`}
                            >
                              {item.icon}
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}

            {SIMPLE_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  isActive(link.href) ? 'text-primary dark:text-accent' : 'text-text-light/70 dark:text-text-dark/70 hover:text-primary dark:hover:text-accent'
                }`}
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg bg-surface dark:bg-surface-dark text-text-light dark:text-text-dark hover:bg-pearl/10 transition-colors"
              aria-label="Cari"
            >
              <Search size={20} aria-hidden="true" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-surface dark:bg-surface-dark text-text-light dark:text-text-dark hover:bg-pearl/10 transition-colors"
              aria-label="Ganti tema"
            >
              {isDark ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
            </button>

            {authLoading ? (
              <div className="hidden sm:block w-9 h-9 rounded-full bg-pearl/10 animate-pulse" />
            ) : user ? (
              <Link href="/profile" className="hidden sm:flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-pearl/10 hover:bg-pearl/10 transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary dark:bg-accent flex items-center justify-center overflow-hidden">
                  {profile?.photoURL ? (
                    <img src={profile.photoURL} alt={profile?.displayName || 'Avatar'} className="w-full h-full object-cover" />
                  ) : (
                    <User size={16} className="text-white" />
                  )}
                </div>
                <span className="hidden xl:block text-sm font-semibold max-w-[100px] truncate">
                  {profile?.displayName || user.displayName || 'KiraFan'}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold bg-primary dark:bg-accent text-white dark:text-noir hover:opacity-90 transition-opacity"
              >
                <LogIn size={16} aria-hidden="true" /> Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.15 }}
            className="mx-auto max-w-[1600px] px-4 md:px-6 lg:px-8 pt-2"
          >
            <form
              onSubmit={handleSearch}
              className="rounded-2xl border border-pearl/10 bg-surface dark:bg-surface-dark shadow-xl p-3 flex items-center gap-2"
            >
              <Search size={20} className="shrink-0 text-text-light/40 dark:text-text-dark/40" aria-hidden="true" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari anime, komik, webtoon, novel\u2026"
                className="flex-1 bg-transparent outline-none text-sm text-text-light dark:text-text-dark placeholder:text-text-light/40 dark:placeholder:text-text-dark/40"
              />
              <button type="submit" className="btn-primary text-xs shrink-0">
                Cari
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={reduceMotion ? { duration: 0 } : undefined}
              className="fixed inset-0 bg-noir/50 backdrop-blur-sm lg:hidden"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={reduceMotion ? { duration: 0 } : { type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed top-16 bottom-0 left-0 w-72 bg-surface dark:bg-surface-dark z-50 lg:hidden overflow-y-auto custom-scrollbar border-r border-pearl/10 shadow-xl"
            >
              <nav className="p-4 space-y-1">
                <Link
                  href="/"
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                    router.pathname === '/'
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-text-light/70 dark:text-text-dark/70 hover:bg-pearl/10 hover:text-primary dark:hover:text-accent'
                  }`}
                >
                  <Home size={18} aria-hidden="true" /> Beranda
                </Link>

                {DROPDOWN_GROUPS.map((group) => {
                  const isOpen = openGroup === group.key
                  const groupActive = group.items.some((i) => isActive(i.href))
                  return (
                    <div key={group.key}>
                      <button
                        onClick={() => setOpenGroup(isOpen ? null : group.key)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-colors ${
                          groupActive
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'text-text-light/70 dark:text-text-dark/70 hover:bg-pearl/10 hover:text-primary dark:hover:text-accent'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          {group.icon}
                          {group.label}
                        </span>
                        <ChevronDown size={16} aria-hidden="true" className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={reduceMotion ? { duration: 0 } : { duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-1 ml-4 pl-3 border-l border-pearl/10 space-y-0.5">
                              {group.items.map((item) => (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                                    isActive(item.href)
                                      ? 'bg-primary/10 text-primary font-semibold'
                                      : 'text-text-light/60 dark:text-text-dark/60 hover:bg-pearl/10 hover:text-primary dark:hover:text-accent'
                                  }`}
                                >
                                  {item.icon}
                                  {item.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}

                {SIMPLE_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                      isActive(link.href)
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-text-light/70 dark:text-text-dark/70 hover:bg-pearl/10 hover:text-primary dark:hover:text-accent'
                    }`}
                  >
                    {link.icon} {link.label}
                  </Link>
                ))}

                {/* Account */}
                <div className="pt-3 mt-3 border-t border-pearl/10 space-y-2">
                  {authLoading ? (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-pearl/5 animate-pulse">
                      <div className="w-9 h-9 rounded-full bg-pearl/10 shrink-0" />
                      <div className="h-3 w-24 rounded bg-pearl/10" />
                    </div>
                  ) : user ? (
                    <>
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-pearl/5 hover:bg-pearl/10 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-primary dark:bg-accent shrink-0 flex items-center justify-center overflow-hidden">
                          {profile?.photoURL ? (
                            <img src={profile.photoURL} alt={profile?.displayName || 'Avatar'} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-white">
                              {(profile?.displayName || user.displayName || user.email || '?')[0].toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate">{profile?.displayName || user.displayName || 'KiraFan'}</p>
                          <p className="text-xs text-text-light/50 dark:text-text-dark/50">Lihat profil</p>
                        </div>
                      </Link>
                      <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        <LogOut size={18} aria-hidden="true" />
                        {loggingOut ? 'Logging out\u2026' : 'Logout'}
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary dark:text-accent font-medium border border-primary/20"
                    >
                      <LogIn size={18} aria-hidden="true" />
                      Login / Register
                    </Link>
                  )}
                </div>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
