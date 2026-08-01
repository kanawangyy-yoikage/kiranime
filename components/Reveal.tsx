// components/Reveal.tsx
// Wrapper animasi masuk-konten saat scroll (whileInView).
// - Hanya animasi transform + opacity (aman performa).
// - Hormat prefers-reduced-motion (langsung tampil, tanpa geser).
// - Durasi adaptif untuk perangkat lemah.
import { motion, useReducedMotion } from 'framer-motion'
import { ReactNode } from 'react'
import { motionTokens, adaptiveDuration } from '@/lib/motionTokens'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  once?: boolean
  as?: 'div' | 'section' | 'li'
}

export default function Reveal({
  children,
  className,
  delay = 0,
  y = motionTokens.distance.md,
  once = true,
  as = 'div',
}: RevealProps) {
  const reduce = useReducedMotion()
  const Tag = as === 'li' ? motion.li : as === 'section' ? motion.section : motion.div

  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.15 }}
      transition={{
        duration: reduce ? 0.01 : adaptiveDuration(motionTokens.duration.normal),
        ease: motionTokens.easing.smooth,
        delay: reduce ? 0 : delay,
      }}
    >
      {children}
    </Tag>
  )
}
