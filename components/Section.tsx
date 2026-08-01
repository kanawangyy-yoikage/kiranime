import Link from 'next/link'
import { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'

interface SectionProps {
  title: string
  viewAll?: string
  children: ReactNode
}

export default function Section({ title, viewAll, children }: SectionProps) {
  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="section-title">{title}</h2>
        {viewAll && (
          <Link
            href={viewAll}
            className="group text-sm font-medium text-ocean hover:text-oceanAccent-secondary transition-colors flex items-center gap-1.5"
          >
            Lihat Semua
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}
