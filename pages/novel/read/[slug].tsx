import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { Frown, BookMarked } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'

export default function NovelReaderPage() {
  const router = useRouter()
  const { novel } = router.query
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)

  return (
    <>
      <Head><title>{t('reader.readNovel')} - KiraStream</title></Head>
      <div className="text-center py-20 card p-6 max-w-md mx-auto">
        <Frown className="mx-auto mb-3" style={{ color: 'var(--color-text-muted)' }} size={40} />
        <p className="text-xl mb-3" style={{ color: 'var(--color-text)' }}>{t('reader.unavailable')}</p>
        <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>{t('reader.openingNovel')}</p>
        <Link
          href={typeof novel === 'string' && novel ? `/novel/${novel}` : '/novel'}
          className="btn-primary inline-flex items-center gap-2"
        >
          <BookMarked size={16} /> {t('reader.backToNovel')}
        </Link>
      </div>
    </>
  )
}
