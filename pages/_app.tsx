import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import Script from 'next/script'
import { useEffect } from 'react'
import { Plus_Jakarta_Sans } from 'next/font/google'
import Layout from '@/components/Layout'
import SmoothScroll from '@/components/SmoothScroll'
import { AuthProvider } from '@/contexts/AuthContext'
import { LoadingProvider } from '@/contexts/LoadingContext'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
})

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('theme');var dark=t?t==='dark':true;if(dark)document.documentElement.classList.add('dark');var m=document.getElementById('theme-color-meta');if(m)m.setAttribute('content',dark?'#000000':'#F5F5F7');}catch(e){}})();`

export default function MyApp({ Component, pageProps }: AppProps) {
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
            <meta name="theme-color" content="#000000" id="theme-color-meta" />
          </Head>
          <Script id="theme-init" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
          <SmoothScroll>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </SmoothScroll>
        </LoadingProvider>
      </AuthProvider>
    </div>
  )
}
