import Link from 'next/link'
import { useRouter } from 'next/router'
import { Home, Clapperboard, BookOpen, ScrollText, BookMarked, User } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'

export default function MobileNav() {
  const router = useRouter()
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)

  const ITEMS = [
    { label: t('nav.home'), href: '/', icon: Home },
    { label: t('nav.anime'), href: '/anime', icon: Clapperboard },
    { label: t('nav.manga'), href: '/manga', icon: BookOpen },
    { label: t('nav.webtoon'), href: '/webtoon', icon: ScrollText },
    { label: t('nav.novel'), href: '/novel', icon: BookMarked },
    { label: t('nav.profile'), href: '/profile', icon: User },
  ]

  const isActive = (href: string) => {
    if (href === '/') return router.pathname === '/'
    return router.pathname === href || router.pathname.startsWith(`${href}/`)
  }

  return (
    <nav
      className="site-mobile-nav lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-md border-t border-pearl/10"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label={t('a11y.bottomNav')}
    >
      <div className="grid grid-cols-6">
        {ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${
                active ? 'text-primary dark:text-accent' : 'text-text-light/50 dark:text-text-dark/50'
              }`}
            >
              <Icon size={20} className={active ? 'scale-110' : ''} aria-hidden="true" />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
