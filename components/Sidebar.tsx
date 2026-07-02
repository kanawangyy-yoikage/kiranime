import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import {
  Home,
  Flame,
  Film,
  PlayCircle,
  CheckCircle,
  Tags,
  BookOpen,
  Library,
  Calendar,
  Search,
  Moon,
  Sun,
  Menu,
  X
} from 'lucide-react'

export default function Sidebar() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setIsDark(isDark)
  }, [])

  const toggleTheme = () => {
    const root = document.documentElement
    if (root.classList.contains('dark')) {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
      setIsDark(false)
    } else {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
      setIsDark(true)
    }
  }

  const navItems = [
    { icon: <Home size={20} />, label: 'Beranda', href: '/' },
    { icon: <Flame size={20} />, label: 'Populer', href: '/popular' },
    { icon: <Film size={20} />, label: 'Movies', href: '/movies' },
    { icon: <PlayCircle size={20} />, label: 'Ongoing', href: '/ongoing' },
    { icon: <CheckCircle size={20} />, label: 'Selesai', href: '/completed' },
    { icon: <Tags size={20} />, label: 'Genres', href: '/genres' },
    { icon: <BookOpen size={20} />, label: 'Manga', href: '/manga' },
    { icon: <Library size={20} />, label: 'Novel', href: '/novel' },
    { icon: <Calendar size={20} />, label: 'Jadwal', href: '/schedule' },
    { icon: <Search size={20} />, label: 'Pencarian', href: '/search' },
  ]

  // Close sidebar on route change for mobile
  useEffect(() => {
    setIsOpen(false)
  }, [router.pathname])

  return (
    <>
      {/* Mobile Header Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-md z-40 flex items-center justify-between px-4 border-b border-pearl/10 shadow-sm">
        <span className="font-display font-bold text-xl text-primary flex items-center gap-2">
          <PlayCircle className="text-accent" />
          KiraNime
        </span>
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg bg-surface dark:bg-surface-dark text-text-light dark:text-text-dark hover:bg-pearl/10 transition-colors">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-noir/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed top-0 left-0 h-screen w-64 bg-surface dark:bg-surface-dark z-50 
        flex flex-col border-r border-pearl/10 shadow-xl lg:shadow-none
        transition-transform duration-300 ease-spring
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-pearl/10 shrink-0">
          <Link href="/" className="font-display font-bold text-2xl text-primary flex items-center gap-2 transition-transform hover:scale-105">
            <PlayCircle className="text-accent fill-accent/20" />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">KiraNime</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = router.pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group font-medium
                  ${isActive 
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' 
                    : 'text-text-light/70 dark:text-text-dark/70 hover:bg-pearl/5 hover:text-primary'}
                `}
              >
                <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </div>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-pearl/10 shrink-0 space-y-3">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-pearl/5 hover:bg-pearl/10 text-text-light dark:text-text-dark transition-colors font-medium border border-transparent hover:border-pearl/10"
          >
            <span className="flex items-center gap-3">
              {isDark ? <Moon size={20} className="text-accent" /> : <Sun size={20} className="text-accent" />}
              Tema
            </span>
            <span className="text-xs uppercase tracking-wider opacity-60 font-bold">
              {isDark ? 'Dark' : 'Light'}
            </span>
          </button>
          
          <div className="text-center">
            <p className="text-xs text-text-light/40 dark:text-text-dark/40 font-medium">Made with ❤️ by Kira</p>
            <p className="text-[10px] text-text-light/30 dark:text-text-dark/30 mt-1">v1.1.0 &copy; 2026 KiraNime</p>
          </div>
        </div>
      </aside>
    </>
  )
}
