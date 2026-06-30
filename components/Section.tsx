import Link from 'next/link'
import { ReactNode } from 'react'

interface SectionProps {
  title: string
  viewAll?: string
  children: ReactNode
}

export default function Section({ title, viewAll, children }: SectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title">{title}</h2>
        {viewAll && (
          <Link
            href={viewAll}
            className="text-sm font-medium text-ocean hover:text-accent-secondary transition-colors flex items-center gap-1"
          >
            Lihat Semua
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}
