import Link from 'next/link'
import Image from 'next/image'
import { Mail } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'

export default function Footer() {
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)

  const NAV_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
    {
      title: t('nav.anime'),
      links: [
        { label: t('footer.popular'), href: '/popular' },
        { label: t('footer.movies'), href: '/movies' },
        { label: t('footer.ongoing'), href: '/ongoing' },
        { label: t('footer.completed'), href: '/completed' },
        { label: t('footer.schedule'), href: '/schedule' },
        { label: t('footer.genres'), href: '/genres' },
      ],
    },
    {
      title: t('nav.manga'),
      links: [
        { label: t('footer.allComics'), href: '/manga' },
      ],
    },
    {
      title: t('footer.others'),
      links: [
        { label: t('nav.webtoon'), href: '/webtoon' },
        { label: t('nav.novel'), href: '/novel' },
        { label: t('footer.azList'), href: '/animelist?letter=a' },
        { label: t('nav.search'), href: '/search' },
      ],
    },
  ]

  return (
    <footer className="site-footer border-t border-pearl/10 bg-surface dark:bg-surface-dark mt-10 pb-24 lg:pb-8">
      <div className="mx-auto max-w-[1600px] px-4 md:px-6 lg:px-8 py-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/icons/icon-96x96.png" alt="" width={36} height={36} className="rounded-xl" />
              <Image src="/logo-title.png" alt="KiraStream" width={130} height={43} className="h-8 w-auto object-contain" />
            </Link>
            <p className="mt-4 text-sm leading-6 text-[var(--color-text-muted)]">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Nav columns */}
          {NAV_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-bold text-sm uppercase tracking-wider mb-4">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--color-text-muted)] hover:text-primary dark:hover:text-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4">{t('footer.contact')}</h3>
            <ul className="space-y-3 text-sm text-[var(--color-text-muted)]">
              <li>
                <a
                  href="mailto:kira@kirastream.example"
                  className="flex items-center gap-2.5 hover:text-primary dark:hover:text-accent transition-colors"
                >
                  <Mail size={16} aria-hidden="true" /> kira@kirastream.example
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 rounded-2xl border border-pearl/10 bg-pearl/[0.03] p-5">
          <p className="text-xs leading-5 text-[var(--color-text-muted)]">
            {t('footer.disclaimer')}
          </p>
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--color-text-muted)]">
          <p>{t('footer.rights')}</p>
          <p>{t('footer.madeWith')}</p>
        </div>
      </div>
    </footer>
  )
}
