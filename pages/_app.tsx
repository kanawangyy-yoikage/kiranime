import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Sidebar from '@/components/Sidebar'
import { AuthProvider } from '@/contexts/AuthContext'
import { LoadingProvider } from '@/contexts/LoadingContext'

function MyApp({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Theme initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem('kira-theme') as 'dark' | 'light'
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.toggle('light', savedTheme === 'light')
    }
  }, [])

  // Theme toggle
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('kira-theme', newTheme)
    document.documentElement.classList.toggle('light', newTheme === 'light')
  }

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isSidebarOpen && window.innerWidth < 1024) {
        const sidebar = document.querySelector('#sidebar')
        if (sidebar && !sidebar.contains(e.target as Node)) {
          setIsSidebarOpen(false)
        }
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isSidebarOpen])

  return (
    <AuthProvider>
      <LoadingProvider>
        <div className={`min-h-screen transition-colors duration-300 ${theme}`}>
          <Navbar 
            theme={theme}
            toggleTheme={toggleTheme}
            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          
          <div className="flex pt-16">
            <Sidebar 
              isOpen={isSidebarOpen}
              theme={theme}
              toggleTheme={toggleTheme}
            />
            
            <main className="flex-1 p-4 lg:p-6 min-h-screen overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                <Component {...pageProps} />
              </div>
            </main>
          </div>

          {/* Mobile overlay */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-noir/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </div>
      </LoadingProvider>
    </AuthProvider>
  )
}

export default MyApp
