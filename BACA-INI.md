# File baru/diubah — Liquid Glass "Bola Kaca" (gaya childrentime/liquid-glass)

## File BARU
- `components/LiquidGlassOrb.tsx`
  Panel/bola kaca yang bisa diseret (drag) bebas ke mana saja di layar.
  Konten di baliknya benar-benar terdistorsi secara real-time (SDF +
  feDisplacementMap), sama seperti referensi childrentime/liquid-glass.

## File yang DIUBAH
- `contexts/SettingsContext.tsx`
  Tambah mode ketiga: `liquidGlassMode: 'static' | 'cursor' | 'orb'`.

- `components/Layout.tsx`
  Merender `LiquidGlassOrb` sebagai widget mengambang (fixed, di atas
  seluruh halaman) saat mode "orb" dipilih.

- `pages/settings.tsx`
  Grid pilihan mode sekarang 3 kolom: Statis / Ikuti Kursor / Bola Kaca.

- `lib/i18n.ts`
  Tambah string terjemahan (ID & EN) untuk mode "Bola Kaca".

## Cara pakai
1. Timpa file-file di atas ke folder project kamu (path sama).
2. `npm run dev` / `npm run build`.
3. Buka **Pengaturan → Liquid Glass → Bola Kaca**.
4. Sebuah panel kaca kecil akan muncul mengambang di pojok kiri atas
   halaman — bisa langsung diseret (drag) ke mana saja, dan konten di
   baliknya akan terlihat terdistorsi seperti lensa.

## Pakai sendiri di tempat lain
```tsx
import LiquidGlassOrb from '@/components/LiquidGlassOrb'

<LiquidGlassOrb shape="circle" width={160} height={160} />
```
