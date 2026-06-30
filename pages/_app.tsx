import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import Sidebar from '@/components/Sidebar'
import { AuthProvider } from '@/contexts/AuthContext'
import { LoadingProvider } from '@/contexts/LoadingContext'

export default function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('dark', saved ? saved === 'dark' : prefersDark)
  }, [])

  return (
    <AuthProvider>
      <LoadingProvider>
        <div className="min-h-screen bg-bg-light text-text-light transition-colors duration-300 dark:bg-bg-dark dark:text-text-dark">
          <Sidebar />
          <main className="min-h-screen pt-16 lg:ml-64 lg:pt-0">
            <div className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">
              <Component {...pageProps} />
            </div>
          </main>
        </div>
      </LoadingProvider>
    </AuthProvider>
  )
}
