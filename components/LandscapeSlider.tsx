import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import LandscapeSpotlight, { type SpotlightItem } from './LandscapeSpotlight'

interface LandscapeSliderProps {
  kind: 'anime' | 'comic'
  items: SpotlightItem[]
  imageProxy: (url: string) => string
  interval?: number
}

export default function LandscapeSlider({ kind, items, imageProxy, interval = 6000 }: LandscapeSliderProps) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduceMotion = useReducedMotion()

  const goTo = useCallback((i: number) => {
    setIndex(((i % items.length) + items.length) % items.length)
  }, [items.length])

  const prev = useCallback(() => goTo(index - 1), [goTo, index])
  const next = useCallback(() => goTo(index + 1), [goTo, index])

  useEffect(() => {
    if (items.length <= 1 || paused || reduceMotion) return
    const id = setInterval(() => setIndex((i) => (i + 1) % items.length), interval)
    return () => clearInterval(id)
  }, [items.length, paused, reduceMotion, interval])

  if (items.length === 0) return null

  const item = items[index]

  return (
    <div
      className="relative group"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          key={index}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <LandscapeSpotlight {...item} imageProxy={imageProxy} />
        </motion.div>
      </AnimatePresence>

      {items.length > 1 && (
        <>
          {/* Prev / Next */}
          <button
            onClick={prev}
            aria-label="Sebelumnya"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white border border-white/20 hover:bg-black/75 hover:scale-105 focus-visible:opacity-100 transition-[opacity,transform,background-color] opacity-0 group-hover:opacity-100"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            aria-label="Berikutnya"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white border border-white/20 hover:bg-black/75 hover:scale-105 focus-visible:opacity-100 transition-[opacity,transform,background-color] opacity-0 group-hover:opacity-100"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-5 z-20 flex items-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ke slide ${i + 1}`}
                aria-current={i === index}
                className={`p-2 -m-2 flex items-center transition-[width,background-color] duration-300 ${
                  i === index ? 'w-6' : 'w-1.5'
                }`}
              >
                <span
                  className={`h-1.5 w-full rounded-full transition-colors duration-300 ${
                    i === index ? 'bg-white' : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
