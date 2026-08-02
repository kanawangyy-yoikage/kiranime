import Head from 'next/head'
import Link from 'next/link'
import { WifiOff } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'

export default function Offline() {
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)
  return (
    <>
      <Head>
        <title>Offline - KiraStream</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full border p-5" style={{ borderColor: 'var(--color-border, #5B88B2)' }}>
          <WifiOff className="h-10 w-10" style={{ color: 'var(--color-text-muted, #5B88B2)' }} />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          {t('offline.title')}
        </h1>
        <p className="max-w-sm text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {t('offline.desc')}
        </p>
        <Link
          href="/"
          className="mt-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-bg-light transition-opacity hover:opacity-90"
        >
          {t('offline.home')}
        </Link>
      </div>
    </>
  )
}
