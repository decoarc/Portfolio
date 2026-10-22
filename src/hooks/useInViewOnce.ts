import { useEffect, useRef, useState, type RefObject } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

interface UseInViewOnceOptions {
  /** Fallback reveal if the observer never fires (ms). */
  fallbackMs?: number
  rootMargin?: string
  threshold?: number
}

/**
 * One-shot intersection reveal. Reduced-motion users start revealed.
 * Fallback ensures content never stays hidden if IO fails.
 */
export function useInViewOnce<T extends HTMLElement = HTMLElement>(
  options: UseInViewOnceOptions = {},
): [RefObject<T | null>, boolean] {
  const {
    fallbackMs = 2500,
    rootMargin = '0px 0px -10% 0px',
    threshold = 0.15,
  } = options
  const reduced = usePrefersReducedMotion()
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(reduced)

  useEffect(() => {
    if (reduced) {
      setInView(true)
      return
    }

    const node = ref.current
    if (!node) {
      return
    }

    let done = false
    const reveal = () => {
      if (done) return
      done = true
      setInView(true)
    }

    const fallback = window.setTimeout(reveal, fallbackMs)

    if (typeof IntersectionObserver !== 'function') {
      reveal()
      window.clearTimeout(fallback)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          reveal()
          observer.disconnect()
          window.clearTimeout(fallback)
        }
      },
      { rootMargin, threshold },
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
      window.clearTimeout(fallback)
    }
  }, [reduced, fallbackMs, rootMargin, threshold])

  return [ref, inView]
}
