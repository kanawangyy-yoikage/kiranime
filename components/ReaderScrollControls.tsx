import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Maximize,
  Minimize,
  Play,
  Pause,
} from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'

// ─── READER SCROLL ASSIST ────────────────────────────────────
// Tombol bantu scroll pas baca komik/webtoon: scroll pelan-pelan
// per layar (naik/turun), lompat ke atas/bawah, auto-scroll,
// dan mode layar penuh. Jarak tiap langkah scroll mengikuti
// setting `readerScrollDistance` (persentase tinggi layar).

const AUTO_SCROLL_INTERVAL = 3000

export default function ReaderScrollControls() {
  const [show, setShow] = useState(false)
  const [atBottom, setAtBottom] = useState(false)
  const [autoScrolling, setAutoScrolling] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const autoScrollTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const { language, readerScrollDistance } = useSettings()
  const t = (key: string) => translate(language, key)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight - 8)
      setShow(y > 120)
      setAtBottom(y >= maxY - 4)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onChange = () => {
      const fs = Boolean(document.fullscreenElement)
      setIsFullscreen(fs)
      if (!fs) document.documentElement.classList.remove('reader-immersive')
    }
    document.addEventListener('fullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      stopAutoScroll()
      exitImmersive()
    }
  }, [])

  useEffect(() => {
    if (!autoScrolling) return
    const onTakeover = () => stopAutoScroll()
    window.addEventListener('wheel', onTakeover, { passive: true })
    window.addEventListener('touchstart', onTakeover, { passive: true })
    return () => {
      window.removeEventListener('wheel', onTakeover)
      window.removeEventListener('touchstart', onTakeover)
    }
  }, [autoScrolling])

  const stepPx = () => Math.floor(window.innerHeight * (readerScrollDistance / 100))

  const scrollByStep = (dir: 1 | -1) => {
    window.scrollBy({ top: stepPx() * dir, behavior: 'smooth' })
  }

  const jump = (top: boolean) => {
    window.scrollTo({
      top: top ? 0 : document.documentElement.scrollHeight,
      behavior: 'smooth',
    })
  }

  const stopAutoScroll = () => {
    if (autoScrollTimer.current) {
      clearInterval(autoScrollTimer.current)
      autoScrollTimer.current = null
    }
    setAutoScrolling(false)
  }

  const startAutoScroll = () => {
    if (autoScrollTimer.current) return
    setAutoScrolling(true)
    autoScrollTimer.current = setInterval(() => {
      const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight - 8)
      if (window.scrollY >= maxY - 4) {
        stopAutoScroll()
        return
      }
      window.scrollBy({ top: stepPx(), behavior: 'smooth' })
    }, AUTO_SCROLL_INTERVAL)
  }

  const enterImmersive = () => {
    const el = document.documentElement
    try {
      if (typeof el.requestFullscreen === 'function') {
        const p = el.requestFullscreen() as Promise<void> | undefined
        if (p && typeof p.catch === 'function') {
          p.catch(() => {
            el.classList.add('reader-immersive')
            setIsFullscreen(true)
          })
        }
        return
      }
    } catch {
      // fall through to immersive fallback below
    }
    el.classList.add('reader-immersive')
    setIsFullscreen(true)
  }

  const exitImmersive = () => {
    if (document.fullscreenElement && typeof document.exitFullscreen === 'function') {
      document.exitFullscreen().catch(() => {})
    }
    document.documentElement.classList.remove('reader-immersive')
    setIsFullscreen(false)
  }

  const toggleFullscreen = () => {
    const immersive = document.documentElement.classList.contains('reader-immersive')
    if (document.fullscreenElement || immersive) {
      exitImmersive()
    } else {
      enterImmersive()
    }
  }

  return (
    <motion.div
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 12 }}
      transition={{ duration: 0.18 }}
      className="fixed bottom-24 lg:bottom-6 right-4 z-40 flex flex-col gap-2"
      style={{ pointerEvents: show ? 'auto' : 'none' }}
      aria-hidden={!show}
    >
      <div className="card p-1.5 flex flex-col gap-1 shadow-xl">
        <button
          onClick={() => scrollByStep(-1)}
          className="p-2 rounded-lg hover:bg-pearl/10 text-pearl/80 transition-colors"
          aria-label={t('reader.scrollUpAria')}
          title={t('reader.scrollUp')}
        >
          <ChevronUp size={20} />
        </button>
        <button
          onClick={() => scrollByStep(1)}
          className="p-2 rounded-lg hover:bg-pearl/10 text-pearl/80 transition-colors"
          aria-label={t('reader.scrollDownAria')}
          title={t('reader.scrollDown')}
        >
          <ChevronDown size={20} />
        </button>
      </div>
      <div className="card p-1.5 flex flex-col gap-1 shadow-xl">
        <button
          onClick={() => jump(true)}
          className="p-2 rounded-lg hover:bg-pearl/10 text-pearl/80 transition-colors"
          aria-label={t('reader.jumpTop')}
          title={t('reader.top')}
        >
          <ArrowUp size={18} />
        </button>
        <button
          onClick={() => jump(false)}
          className="p-2 rounded-lg hover:bg-pearl/10 text-ocean transition-colors"
          aria-label={atBottom ? t('reader.atBottom') : t('reader.jumpBottom')}
          title={atBottom ? t('reader.atBottom') : t('reader.bottom')}
        >
          <ArrowDown size={18} />
        </button>
      </div>
      <div className="card p-1.5 flex flex-col gap-1 shadow-xl">
        <button
          onClick={() => (autoScrolling ? stopAutoScroll() : startAutoScroll())}
          className={`p-2 rounded-lg transition-colors ${
            autoScrolling
              ? 'bg-ocean/20 text-ocean'
              : 'hover:bg-pearl/10 text-pearl/80'
          }`}
          aria-label={autoScrolling ? t('reader.autoScrollStop') : t('reader.autoScrollStart')}
          title={t('reader.autoScroll')}
        >
          {autoScrolling ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-lg hover:bg-pearl/10 text-pearl/80 transition-colors"
          aria-label={isFullscreen ? t('reader.exitFullscreen') : t('reader.fullscreen')}
          title={isFullscreen ? t('reader.exitFullscreen') : t('reader.fullscreen')}
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>
      </div>
    </motion.div>
  )
}
