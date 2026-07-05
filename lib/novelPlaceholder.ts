// Placeholder cover generator — dipake pas gambar novel gagal dimuat (kena block dari sumbernya).
// Gradient warnanya deterministik dari judul, jadi tiap novel dapet warna beda tapi konsisten.

export function getNovelCoverGradient(title: string): string {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue1 = Math.abs(hash) % 360
  const hue2 = (hue1 + 45) % 360
  return `linear-gradient(135deg, hsl(${hue1}, 45%, 28%), hsl(${hue2}, 45%, 16%))`
}

export function getNovelInitial(title: string): string {
  const trimmed = title.trim()
  return trimmed ? trimmed[0].toUpperCase() : '?'
}
