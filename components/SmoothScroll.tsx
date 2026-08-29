// components/SmoothScroll.tsx
// Lenis smooth scroll — di-skip otomatis saat user memilih settingan animasi KiraStream.
// Tidak mengikuti prefers-reduced-motion sistem.
import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'
import { useIsReducedMotion } from '@/lib/hooks/useReducedMotion'
import Lenis from 'lenis'

export default function SmoothScroll({ children }: { children: ReactNode }) {
  const router = useRouter()
  const reduced = useIsReducedMotion()

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (reduced) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    })

    let rafId = 0
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    // Scroll ke atas saat pindah halaman (biar tidak melompat mentah).
    const onRouteChange = () => lenis.scrollTo(0, { immediate: false })
    router.events.on('routeChangeStart', onRouteChange)

    // Anchor link dalam halaman lewat Lenis agar smooth.
    const onClickAnchor = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      const a = target?.closest?.('a[href^="#"]')
      if (!a) return
      const id = (a as HTMLAnchorElement).getAttribute('href')
      if (!id || id === '#') return
      const el = document.querySelector(id)
      if (el) {
        e.preventDefault()
        lenis.scrollTo(el as HTMLElement, { offset: -90 })
      }
    }
    document.addEventListener('click', onClickAnchor)

    return () => {
      cancelAnimationFrame(rafId)
      router.events.off('routeChangeStart', onRouteChange)
      document.removeEventListener('click', onClickAnchor)
      lenis.destroy()
    }
  }, [router.events, reduced])

  return <>{children}</>
}