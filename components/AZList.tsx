import Link from 'next/link'
import { useRouter } from 'next/router'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

interface AZListProps {
  compact?: boolean
}

export default function AZList({ compact }: AZListProps) {
  const router = useRouter()
  const activeLetter = typeof router.query.letter === 'string' ? router.query.letter.toUpperCase() : ''

  return (
    <div className={`grid gap-1 ${compact ? 'grid-cols-7' : 'grid-cols-9'}`}>
      {LETTERS.map((letter) => {
        const active = activeLetter === letter
        return (
          <Link
            key={letter}
            href={`/animelist?letter=${letter.toLowerCase()}`}
            className={`flex items-center justify-center rounded-md text-xs font-bold py-1.5 transition-colors border ${
              active
                ? 'bg-primary text-white dark:bg-accent dark:text-noir border-primary dark:border-accent'
                : 'bg-surface-alt dark:bg-surface-dark text-text-light/70 dark:text-text-dark/70 border-transparent hover:bg-primary hover:text-white dark:hover:bg-accent dark:hover:text-noir'
            }`}
          >
            {letter}
          </Link>
        )
      })}
    </div>
  )
}
