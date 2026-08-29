// lib/hooks/useReducedMotion.ts
// Hook yang membaca setting animasi dari SettingsContext.
// Return true = reduced motion diaktifkan (animasi mati), false = animasi hidup.
// TIDAK mengikuti prefers-reduced-motion sistem, hanya setting pengguna.

import { useSettings } from '@/contexts/SettingsContext'

export function useIsReducedMotion(): boolean {
  const { animations } = useSettings()
  // Jika user disable di settingan KiraStream → return true (reduced)
  return !animations
}