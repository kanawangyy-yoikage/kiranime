import Head from 'next/head'
import Link from 'next/link'
import { WifiOff } from 'lucide-react'

export default function Offline() {
  return (
    <>
      <Head>
        <title>Offline - KiraNime</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full border p-5" style={{ borderColor: 'var(--color-border, #5B88B2)' }}>
          <WifiOff className="h-10 w-10" style={{ color: 'var(--color-text-muted, #5B88B2)' }} />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          Kamu sedang offline
        </h1>
        <p className="max-w-sm text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Sepertinya koneksi internet kamu terputus. Halaman yang sudah pernah dibuka mungkin masih bisa
          diakses, coba muat ulang setelah tersambung kembali.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-bg-light transition-opacity hover:opacity-90"
        >
          Coba ke Beranda
        </Link>
      </div>
    </>
  )
}
