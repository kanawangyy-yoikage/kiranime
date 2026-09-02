# File yang diganti/ditambahkan — Liquid Glass "Ikuti Kursor"

Salin file-file ini ke folder project `kiranime-main/` kamu di path yang sama
(timpa file lama). Struktur folder di zip ini sudah sama persis dengan struktur
project aslinya.

## File BARU
- `components/LiquidGlassCursor.tsx`
  Komponen liquid glass baru bergaya `rdev/liquid-glass-react` — kaca melengkung
  & mengikuti kursor, dengan chromatic aberration dan efek elastis.

## File yang DIUBAH
- `contexts/SettingsContext.tsx`
  Tambah opsi `liquidGlassMode: 'static' | 'cursor'` (tersimpan di localStorage).

- `pages/settings.tsx`
  Tambah toggle "Statis" vs "Ikuti Kursor" di halaman Pengaturan → Liquid Glass.

- `components/TopNavbar.tsx`
  Tombol/link navbar otomatis pakai versi "Ikuti Kursor" saat mode itu dipilih.

- `components/MobileNav.tsx`
  Item nav bawah (mobile) ikut pakai mode yang sama.

- `components/LandscapeSlider.tsx`
  Tombol prev/next slider ikut pakai mode yang sama.

- `lib/i18n.ts`
  Tambah string terjemahan (ID & EN) untuk toggle mode baru.

## Cara pakai setelah disalin
```
npm install
npm run dev
```
Lalu buka **Pengaturan → Liquid Glass → Ikuti Kursor**.

Kalau mau pakai komponennya sendiri di tempat lain:
```tsx
import LiquidGlassCursor from '@/components/LiquidGlassCursor'

<LiquidGlassCursor cornerRadius={24} elasticity={0.3} aberrationIntensity={2}>
  <span>Konten kamu</span>
</LiquidGlassCursor>
```
