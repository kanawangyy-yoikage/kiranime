import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useEffect } from 'react'
import { Plus_Jakarta_Sans } from 'next/font/google'
import Layout from '@/components/Layout'
import { AuthProvider } from '@/contexts/AuthContext'
import { LoadingProvider } from '@/contexts/LoadingContext'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
})

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    document.documentElement.classList.toggle('dark', saved ? saved === 'dark' : true)
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
    <div className={jakarta.variable}>
      <AuthProvider>
        <LoadingProvider>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
          </Head>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </LoadingProvider>
      </AuthProvider>
    </div>
  )
}
