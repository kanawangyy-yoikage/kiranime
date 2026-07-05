import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import InstallPwaPrompt from '@/components/InstallPwaPrompt'
import { AuthProvider } from '@/contexts/AuthContext'
import { LoadingProvider } from '@/contexts/LoadingContext'

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('dark', saved ? saved === 'dark' : prefersDark)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    if (process.env.NODE_ENV !== 'production') return

    const register = () => {
      navigator.serviceWorker
        .register('/sw.js')
        .catch((err) => console.error('Gagal mendaftarkan service worker:', err))
    }

    window.addEventListener('load', register)
    return () => window.removeEventListener('load', register)
  }, [])

  return (
    <AuthProvider>
      <LoadingProvider>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        </Head>
        <div className="min-h-screen bg-bg-light text-text-light transition-colors duration-300 dark:bg-bg-dark dark:text-text-dark">
          <Sidebar />
          <main className="min-h-screen pt-16 lg:ml-64 lg:pt-0">
            <div className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">
              <Component {...pageProps} />
            </div>
          </main>
          <InstallPwaPrompt />
        </div>
      </LoadingProvider>
    </AuthProvider>
  )
}
