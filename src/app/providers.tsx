import type { ReactNode } from 'react'

interface ProvidersProps {
  children: ReactNode
}

/** Thin provider seam for future locale / motion preference context. */
export function Providers({ children }: ProvidersProps) {
  return children
}
