import styles from './SkipLink.module.css'

interface SkipLinkProps {
  label: string
  href?: string
}

export function SkipLink({ label, href = '#main' }: SkipLinkProps) {
  return (
    <a className={styles.skip} href={href}>
      {label}
    </a>
  )
}
