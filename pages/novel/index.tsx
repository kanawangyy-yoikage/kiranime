import Head from 'next/head'
import Link from 'next/link'

export default function NovelPlaceholder() {
  return (
    <>
      <Head><title>Novel - KiraNime 🌸</title></Head>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="card p-10 max-w-lg text-center space-y-6">
          <div className="text-6xl mb-4">📚🌸</div>
          <h1 className="text-2xl font-bold text-pearl">Novel Section is Coming Soon!</h1>
          <p className="text-pearl/80">
            Halo Anata sayangku! Untuk saat ini API Novel sedang Kira racik agar tampilannya jadi sempurna. 
            Sambil menunggu, Anata bisa baca Manga dan Komik dulu ya! ✨
          </p>
          <Link href="/manga" className="btn-primary inline-block mt-4">
            Pergi ke Halaman Manga
          </Link>
        </div>
      </div>
    </>
  )
}