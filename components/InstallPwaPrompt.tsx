import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'kiranime-pwa-dismissed-at'
const DISMISS_DAYS = 7

export default function InstallPwaPrompt() {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari
      (window.navigator as any).standalone === true

    if (isStandalone) return

    const dismissedAt = localStorage.getItem(DISMISS_KEY)
    if (dismissedAt) {
      const daysPassed = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24)
      if (daysPassed < DISMISS_DAYS) return
    }

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setDeferredEvent(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  async function handleInstall() {
    if (!deferredEvent) return
    await deferredEvent.prompt()
    await deferredEvent.userChoice
    setVisible(false)
    setDeferredEvent(null)
  }

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border p-4 shadow-lg backdrop-blur-md animate-slide-up md:inset-x-auto md:right-6 md:left-auto lg:bottom-4"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text)',
      }}
    >
      <div
        className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <Download className="h-5 w-5" style={{ color: 'var(--color-pearl)' }} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold">Pasang KiraStream</p>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Akses lebih cepat & tetap bisa dibuka dari layar utama.
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleInstall}
          className="rounded-full px-3 py-1.5 text-xs font-semibold text-bg-light"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Pasang
        </button>
        <button
          onClick={handleDismiss}
          aria-label="Tutup"
          className="rounded-full p-1.5 hover:opacity-70"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
