import { createContext, useContext, useState, ReactNode } from 'react'
import { useSettings } from './SettingsContext'
import { translate } from '@/lib/i18n'

interface LoadingContextType {
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)
  const { language } = useSettings()
  const t = (key: string) => translate(language, key)

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 bg-noir/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div className="bg-surface-card rounded-xl p-6 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-ocean/30 border-t-ocean rounded-full animate-spin" />
            <p className="text-[var(--color-text)] font-medium">{t('common.loading')}</p>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}
