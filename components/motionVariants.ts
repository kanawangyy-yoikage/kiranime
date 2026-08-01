// components/motionVariants.ts
// Variants framer-motion untuk container + item (stagger list).
// staggerChildren ≤ 0.1s agar tidak terasa lambat (aturan skill).
import { motionTokens, adaptiveDuration } from '@/lib/motionTokens'

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
}

export const staggerItem = {
  hidden: { opacity: 0, y: motionTokens.distance.md },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: adaptiveDuration(motionTokens.duration.normal),
      ease: motionTokens.easing.smooth,
    },
  },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: adaptiveDuration(motionTokens.duration.normal),
      ease: motionTokens.easing.smooth,
    },
  },
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: adaptiveDuration(motionTokens.duration.normal),
      ease: motionTokens.easing.smooth,
    },
  },
}
