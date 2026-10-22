import type { CSSProperties, ElementType, ReactNode } from 'react'
import { useInViewOnce } from '@/hooks'
import styles from './MotionReveal.module.css'

interface MotionRevealProps {
  children: ReactNode
  className?: string
  as?: ElementType
  /** Stagger delay in ms when motion is enabled. */
  delayMs?: number
}

/**
 * MP-3 — one-time section/block reveal. Rest styles win without JS / reduced motion.
 */
export function MotionReveal({
  children,
  className,
  as: Tag = 'div',
  delayMs = 0,
}: MotionRevealProps) {
  const [ref, inView] = useInViewOnce<HTMLElement>()
  const classes = [styles.reveal, inView ? styles.inView : '', className]
    .filter(Boolean)
    .join(' ')

  const style = {
    '--reveal-delay': `${delayMs}ms`,
  } as CSSProperties

  return (
    <Tag
      ref={ref}
      className={classes}
      style={style}
      data-motion-inview={inView ? 'true' : 'false'}
    >
      {children}
    </Tag>
  )
}
