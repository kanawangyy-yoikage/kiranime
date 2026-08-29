import Link from 'next/link'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { motionTokens, adaptiveDuration } from '@/lib/motionTokens'
import { useAnimationsEnabled } from '@/lib/hooks/useAnimations'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const MotionLink = motion(Link)

interface AZListProps {
  compact?: boolean
}

export default function AZList({ compact }: AZListProps) {
  const router = useRouter()
  const reduce = useAnimationsEnabled()
  const activeLetter = typeof router.query.letter === 'string' ? router.query.letter.toUpperCase() : ''

  const staggerContainer = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.02,
        delayChildren: 0.05,
      },
    },
  }

  const staggerItem = {
    hidden: { opacity: 0, y: reduce ? 0 : motionTokens.distance.sm },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: adaptiveDuration(motionTokens.duration.fast),
        ease: motionTokens.easing.smooth,
      },
    },
  }

  return (
    <motion.div
      className={`grid gap-1 ${compact ? 'grid-cols-7' : 'grid-cols-9'}`}
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
    >
      {LETTERS.map((letter) => {
        const active = activeLetter === letter
        return (
          <motion.div key={letter} variants={staggerItem}>
            <MotionLink
              href={`/animelist?letter=${letter.toLowerCase()}`}
              className={`flex items-center justify-center rounded-md text-xs font-bold py-1.5 transition-colors border ${
                active
                  ? 'bg-primary text-white dark:bg-accent dark:text-noir border-primary dark:border-accent'
                  : 'bg-surface-alt dark:bg-surface-dark text-[var(--color-text-muted)] border-transparent hover:bg-primary hover:text-white dark:hover:bg-accent dark:hover:text-noir'
              }`}
              whileHover={reduce ? undefined : { scale: 1.15 }}
              whileTap={reduce ? undefined : { scale: 0.9 }}
              transition={{ duration: adaptiveDuration(motionTokens.duration.fast) }}
            >
              {letter}
            </MotionLink>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
