import Link from 'next/link'
import { Tags, Flame } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'
import type { Novel, NovelGenreTag } from '@/lib/api'

interface NovelMenuAsideProps {
  genres: NovelGenreTag[]
  hotSearch: Novel[]
}

export default function NovelMenuAside({ genres, hotSearch }: NovelMenuAsideProps) {
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)

  return (
    <aside className="hidden xl:block w-64 shrink-0 space-y-4 sticky top-[calc(6rem+env(safe-area-inset-top))] self-start">
      {/* Pencarian Terpopuler */}
      {hotSearch.length > 0 && (
        <div className="card p-4">
          <h3 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
            <Flame size={16} className="text-ocean" /> {t('novel.hotSearch')}
          </h3>
          <div className="space-y-1">
            {hotSearch.slice(0, 6).map((n) => (
              <Link
                key={n.slug}
                href={`/novel/${n.slug}`}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-[var(--color-text-muted)] hover:bg-pearl/10 hover:text-primary dark:hover:text-accent transition-colors"
              >
                {n.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Semua Genre */}
      {genres.length > 0 && (
        <div className="card p-4">
          <h3 className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center gap-2">
            <Tags size={16} className="text-ocean" /> {t('novel.allGenres')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {genres.slice(0, 18).map((g) => (
              <Link
                key={g.id}
                href={`/novel/genre/${g.slug || g.id}`}
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