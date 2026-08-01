import { ReactNode } from 'react'
import TopNavbar from './TopNavbar'
import Footer from './Footer'
import MobileNav from './MobileNav'
import InstallPwaPrompt from './InstallPwaPrompt'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-light dark:text-text-dark transition-colors duration-300 flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Lewati ke konten utama
      </a>
      <TopNavbar />
      <main id="main-content" className="flex-1 pt-16 scroll-mt-16">
        <div className="mx-auto max-w-[1600px] px-4 md:px-6 lg:px-8 pb-24 lg:pb-12 animate-fade-in">
          {children}
        </div>
      </main>
      <Footer />
      <MobileNav />
      <InstallPwaPrompt />
    </div>
  )
}
