import type { ReactNode } from 'react'
import styles from './Sheet.module.css'

interface SheetProps {
  tone: 'cover' | 'sheet'
  id?: string
  labelledBy?: string
  children: ReactNode
  className?: string
}

/** Folha de uma seção: padding de gutter mais o trilho de margem. */
export function Sheet({
  tone,
  id,
  labelledBy,
  children,
  className,
}: SheetProps) {
  const classes = [
    styles.sheet,
    tone === 'cover' ? styles.cover : styles.paper,
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <section id={id} aria-labelledby={labelledBy} className={classes}>
      {children}
    </section>
  )
}
