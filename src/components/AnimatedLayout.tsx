import { motion } from 'framer-motion'

const fade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const },
}

export function PageFade({ children }: { children: React.ReactNode }) {
  return (
    <motion.div {...fade}>
      {children}
    </motion.div>
  )
}

export function AnimatedOrbs() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <motion.div
        className="absolute -left-1/4 top-0 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl"
        animate={{ x: [0, 30, 0], opacity: [0.35, 0.5, 0.35] }}
        transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY }}
      />
      <motion.div
        className="absolute -right-1/4 bottom-0 h-[28rem] w-[28rem] rounded-full bg-amber-400/5 blur-3xl"
        animate={{ x: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Number.POSITIVE_INFINITY }}
      />
    </div>
  )
}
