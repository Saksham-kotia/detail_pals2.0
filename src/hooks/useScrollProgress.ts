import { useScroll, useTransform, MotionValue } from 'framer-motion'

/** Returns a 0–1 MotionValue representing document scroll progress */
export function useScrollProgress(): MotionValue<number> {
  const { scrollYProgress } = useScroll()
  return scrollYProgress
}
