import Link from 'next/link'
import { useRouter } from 'next/router'
import { ScrollText, Flame, CheckCircle2, CalendarDays } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'

const DAYS: { label: string; value: string }[] = [
  { label: 'Monday', value: 'monday' },
  { label: 'Tuesday', value: 'tuesday' },
  { label: 'Wednesday', value: 'wednesday' },
  { label: 'Thursday', value: 'thursday' },
  { label: 'Friday', value: 'friday' },
  { label: 'Saturday', value: 'saturday' },
  { label: 'Sunday', value: 'sunday' },
]

export default function WebtoonMenuAside() {
  const router = useRouter()
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)
  const day = typeof router.query.day === 'string' ? router.query.day : ''

  const linkClass = (active: boolean) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-primary/10 text-primary dark:bg-accent/15 dark:text-accent'
        : 'text-[var(--color-text-muted)] hover:bg-pearl/10 hover:text-primary dark:hover:text-accent'
    }`

  return (
    <aside className="hidden xl:block w-64 shrink-0 space-y-4 sticky top-[calc(6rem+env(safe-area-inset-top))] self-start">
      {/* Jadwal Rilis */}
      <div className="card p-4">
        <h3 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
          <ScrollText size={16} className="text-ocean" /> {t('webtoon.dailySchedule')}
        </h3>
        <div className="space-y-1">
          <Link href="/webtoon?day=trending" className={linkClass(day === 'trending')}>
            <Flame size={16} aria-hidden="true" />
            {t('manga.trending')}
          </Link>
          <Link href="/webtoon?day=completed" className={linkClass(day === 'completed')}>
            <CheckCircle2 size={16} aria-hidden="true" />
            {t('webtoon.completed')}
          </Link>
          <div className="my-2 border-t border-[var(--color-border)]" />
          {DAYS.map((d) => (
            <Link key={d.value} href={`/webtoon?day=${d.value}`} className={linkClass(day === d.value)}>
              <CalendarDays size={16} aria-hidden="true" />
              {d.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}