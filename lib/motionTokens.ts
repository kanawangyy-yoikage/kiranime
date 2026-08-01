// lib/motionTokens.ts
// Motion System v4.2 — tokens terpusat agar durasi & easing konsisten.

export const motionTokens = {
  duration: {
    fast: 0.18,
    normal: 0.35,
    slow: 0.6,
  },
  // Pakai sebagai `ease` di dalam object `transition`:
  // transition={{ duration: motionTokens.duration.normal, ease: motionTokens.easing.smooth }}
  easing: {
    smooth: [0.22, 1, 0.36, 1] as [number, number, number, number],
    sharp: [0.4, 0, 0.2, 1] as [number, number, number, number],
  },
  distance: {
    sm: 8,
    md: 16,
    lg: 24,
  },
}

// Heuristik perangkat lemah: gabungan memory (Chrome/Android) + jumlah core (fallback Safari/Firefox).
// Responsiveness > smoothness: di perangkat lemah animasi dipercepat drastis.
declare global {
  interface Navigator {
    deviceMemory?: number
  }
}

const deviceMemory = typeof navigator !== 'undefined' ? navigator.deviceMemory : undefined
const hardwareConcurrency = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency : undefined

export const isLowEndDevice =
  (deviceMemory !== undefined && deviceMemory <= 2) ||
  (deviceMemory === undefined && hardwareConcurrency !== undefined && hardwareConcurrency <= 4)

export const adaptiveDuration = (normal: number) => (isLowEndDevice ? Math.min(normal, 0.2) : normal)
