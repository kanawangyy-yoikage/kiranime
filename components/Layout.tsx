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
      <TopNavbar />
      <main className="flex-1 pt-16">
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
