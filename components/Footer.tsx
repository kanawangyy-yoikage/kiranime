import Link from 'next/link'
import Image from 'next/image'
import { Heart, Mail, MessageCircle } from 'lucide-react'

const NAV_COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Anime',
    links: [
      { label: 'Populer', href: '/popular' },
      { label: 'Movies', href: '/movies' },
      { label: 'Ongoing', href: '/ongoing' },
      { label: 'Selesai', href: '/completed' },
      { label: 'Jadwal', href: '/schedule' },
      { label: 'Genres', href: '/genres' },
    ],
  },
  {
    title: 'Komik',
    links: [
      { label: 'Semua Komik', href: '/manga' },
      { label: 'Manga', href: '/manga?type=manga' },
      { label: 'Manhwa', href: '/manga?type=manhwa' },
      { label: 'Manhua', href: '/manga?type=manhua' },
    ],
  },
  {
    title: 'Lainnya',
    links: [
      { label: 'Webtoon', href: '/webtoon' },
      { label: 'Novel', href: '/novel' },
      { label: 'A-Z List', href: '/animelist?letter=a' },
      { label: 'Cari', href: '/search' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-pearl/10 bg-surface dark:bg-surface-dark mt-10 pb-24 lg:pb-8">
      <div className="mx-auto max-w-[1600px] px-4 md:px-6 lg:px-8 py-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/icons/icon-96x96.png" alt="" width={36} height={36} className="rounded-xl" />
              <Image src="/logo-title.png" alt="KiraStream" width={130} height={43} className="h-8 w-auto object-contain" />
            </Link>
            <p className="mt-4 text-sm leading-6 text-text-light/60 dark:text-text-dark/60">
              Platform streaming anime, baca manga, manhwa, manhua, webtoon, dan novel subtitle/bahasa Indonesia dengan
              tampilan cepat, bersih, dan nyaman.
            </p>
          </div>

          {/* Nav columns */}
          {NAV_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-bold text-sm uppercase tracking-wider mb-4">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-light/60 dark:text-text-dark/60 hover:text-primary dark:hover:text-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wider mb-4">Kontak</h3>
            <ul className="space-y-3 text-sm text-text-light/60 dark:text-text-dark/60">
              <li>
                <a
                  href="mailto:kira@kirastream.example"
                  className="flex items-center gap-2.5 hover:text-primary dark:hover:text-accent transition-colors"
                >
                  <Mail size={16} /> kira@kirastream.example
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center gap-2.5 hover:text-primary dark:hover:text-accent transition-colors"
                >
                  <MessageCircle size={16} /> Komunitas Discord
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 rounded-2xl border border-pearl/10 bg-pearl/[0.03] p-5">
          <p className="text-xs leading-5 text-text-light/50 dark:text-text-dark/50">
            Disclaimer: KiraStream tidak menyimpan file video, gambar, atau konten apa pun di server kami. Seluruh konten
            (anime, manga, webtoon, dan novel) berasal dari sumber pihak ketiga yang tersedia di internet. Seluruh hak cipta
            dan trademark milik masing-masing pemiliknya. Jika kamu merasa konten di situs ini melanggar hak cipta, silakan
            hubungi kami.
          </p>
        </div>

        {/* Bottom */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-light/40 dark:text-text-dark/40">
          <p>v1.1.0 &copy; 2026 KiraStream. All rights reserved.</p>
          <p className="inline-flex items-center gap-1">
            Made with <Heart size={12} className="fill-red-400 text-red-400" /> by Kira, matchadesu_
          </p>
        </div>
      </div>
    </footer>
  )
}
