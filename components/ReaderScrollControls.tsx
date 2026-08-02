import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react'
import { useSettings } from '@/contexts/SettingsContext'
import { translate } from '@/lib/i18n'

// ─── READER SCROLL ASSIST ────────────────────────────────────
// Tombol bantu scroll pas baca komik/webtoon: scroll pelan-pelan
// per layar (naik/turun), plus lompat langsung ke atas/bawah.

export default function ReaderScrollControls() {
  const [show, setShow] = useState(false)
  const [atBottom, setAtBottom] = useState(false)
  const { language } = useSettings()
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

  const scrollByViewport = (dir: 1 | -1) => {
    const h = Math.floor(window.innerHeight * 0.9)
    window.scrollBy({ top: h * dir, behavior: 'smooth' })
  }

  const jump = (top: boolean) => {
    window.scrollTo({
      top: top ? 0 : document.documentElement.scrollHeight,
      behavior: 'smooth',
    })
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
          onClick={() => scrollByViewport(-1)}
          className="p-2 rounded-lg hover:bg-pearl/10 text-pearl/80 transition-colors"
          aria-label={t('reader.scrollUpAria')}
          title={t('reader.scrollUp')}
        >
          <ChevronUp size={20} />
        </button>
        <button
          onClick={() => scrollByViewport(1)}
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
    </motion.div>
  )
}
