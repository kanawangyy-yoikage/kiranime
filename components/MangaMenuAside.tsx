import Link from 'next/link'
import { useRouter } from 'next/router'
import { BookOpen, Flame, Sparkles, TrendingUp, Tags } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'
import type { ComicGenre } from '@/lib/api'

const MENU_ITEMS = [
  { labelKey: 'manga.all', tab: 'all' as const, icon: BookOpen },
  { labelKey: 'section.popular', tab: 'popular' as const, icon: Flame },
  { labelKey: 'manga.latest', tab: 'latest' as const, icon: Sparkles },
  { labelKey: 'manga.trending', tab: 'trending' as const, icon: TrendingUp },
]

interface MangaMenuAsideProps {
  genres: ComicGenre[]
}

export default function MangaMenuAside({ genres }: MangaMenuAsideProps) {
  const router = useRouter()
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)

  const rawTab = router.query.tab
  const tab = rawTab === 'popular' || rawTab === 'latest' || rawTab === 'trending' ? rawTab : 'all'
  const hasType = router.query.type === 'manga' || router.query.type === 'manhwa' || router.query.type === 'manhua'
  const hasGenre = typeof router.query.genre === 'string' && router.query.genre !== ''

  return (
    <aside className="hidden xl:block w-64 shrink-0 space-y-4 sticky top-[calc(6rem+env(safe-area-inset-top))] self-start">
      {/* Menu Komik */}
      <div className="card p-4">
        <h3 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
          <BookOpen size={16} className="text-ocean" /> {t('common.quickMenu')}
        </h3>
        <div className="space-y-1">
          {MENU_ITEMS.map(({ labelKey, tab: itemTab, icon: Icon }) => {
            const active = !hasType && !hasGenre && tab === itemTab
            return (
              <Link
                key={itemTab}
                href={itemTab === 'all' ? '/manga' : `/manga?tab=${itemTab}`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary dark:bg-accent/15 dark:text-accent'
                    : 'text-[var(--color-text-muted)] hover:bg-pearl/10 hover:text-primary dark:hover:text-accent'
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                {t(labelKey)}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Genre */}
      {genres.length > 0 && (
        <div className="card p-4">
          <h3 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
            <Tags size={16} className="text-ocean" /> {t('manga.genre')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {genres.slice(0, 18).map((g) => (
              <Link
                key={g.slug}
                href={`/manga?genre=${g.slug}`}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors bg-pearl/[0.04] border border-pearl/10 text-[var(--color-text-muted)] hover:bg-ocean hover:text-white"
              >
                {g.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}