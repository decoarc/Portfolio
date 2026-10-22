import { useEffect, useRef, useState, type RefObject } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

interface UseInViewOnceOptions {
  /** Fallback reveal if the observer never fires (ms). */
  fallbackMs?: number
  rootMargin?: string
  threshold?: number
}

function isNodeInViewport(node: HTMLElement): boolean {
  const rect = node.getBoundingClientRect()
  const vh = window.innerHeight || document.documentElement.clientHeight
  const vw = window.innerWidth || document.documentElement.clientWidth
  return rect.bottom > 0 && rect.right > 0 && rect.top < vh && rect.left < vw
}

function isHashTarget(node: HTMLElement): boolean {
  const hash = window.location.hash.replace(/^#/, '')
  if (!hash) return false
  if (node.id === hash) return true
  try {
    return Boolean(node.closest(`#${CSS.escape(hash)}`))
  } catch {
    return false
  }
}

/**
 * One-shot intersection reveal. Reduced-motion users start revealed.
 * Also reveals when already on-screen, targeted by hash, or after fallback timeout.
 */
export function useInViewOnce<T extends HTMLElement = HTMLElement>(
  options: UseInViewOnceOptions = {},
): [RefObject<T | null>, boolean] {
  const {
    fallbackMs = 1200,
    rootMargin = '0px 0px -8% 0px',
    threshold = 0.08,
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

    // Immediate paths: already visible, or deep-linked into this section
    if (isHashTarget(node) || isNodeInViewport(node)) {
      reveal()
      return
    }

    const fallback = window.setTimeout(reveal, fallbackMs)

    const onHash = () => {
      if (isHashTarget(node)) {
        reveal()
        window.clearTimeout(fallback)
      }
    }
    window.addEventListener('hashchange', onHash)

    if (typeof IntersectionObserver !== 'function') {
      reveal()
      window.clearTimeout(fallback)
      window.removeEventListener('hashchange', onHash)
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
      window.removeEventListener('hashchange', onHash)
    }
  }, [reduced, fallbackMs, rootMargin, threshold])

  return [ref, inView]
}
