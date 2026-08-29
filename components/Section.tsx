import Link from 'next/link'
import { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import Reveal from './Reveal'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'

interface SectionProps {
  title: string
  viewAll?: string
  /** Aksen Jepang dekoratif (kanji/katakana) di atas judul section. */
  jp?: string
  children: ReactNode
}

export default function Section({ title, viewAll, jp, children }: SectionProps) {
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)

  return (
    <Reveal as="section" className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="section-title">
          {jp && (
            <span
              className="mb-0.5 block text-[11px] font-bold tracking-[0.35em] text-primary dark:text-accent"
              aria-hidden="true"
            >
              {jp}
            </span>
          )}
          {title}
        </h2>
        {viewAll && (
          <Link
            href={viewAll}
            className="group text-sm font-medium text-ocean hover:text-oceanAccent-secondary transition-colors flex items-center gap-1.5"
          >
            {t('common.viewAll')}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        )}
      </div>
      {children}
    </Reveal>
  )
}
