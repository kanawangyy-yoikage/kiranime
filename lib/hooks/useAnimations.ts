// lib/hooks/useAnimations.ts
// Hook untuk mengecek apakah animasi harus dikurangi (reduced) berdasarkan
// pengaturan pengguna KiraStream — TIDAK mengikuti prefers-reduced-motion sistem.
// Return true = animasi DIMATIKAN (reduced), false = animasi DIJALANKAN.

import { useSettings } from '@/contexts/SettingsContext'

export function useAnimationsEnabled(): boolean {
  const { animations } = useSettings()
  // Return true untuk "reduce" (matikan animasi) jika user disable di settings
  return !animations
}