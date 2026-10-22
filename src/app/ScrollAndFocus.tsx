import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router'
import { usePrefersReducedMotion } from '@/hooks'

/**
 * After route changes: restore scroll (top on Push/Replace; browser handles Pop)
 * and move focus to main for keyboard / SR users without fighting reduced-motion.
 */
export function ScrollAndFocus() {
  const { pathname, hash } = useLocation()
  const navType = useNavigationType()
  const reducedMotion = usePrefersReducedMotion()
  const mainRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    mainRef.current = document.getElementById('main')
  }, [])

  useEffect(() => {
    if (hash) {
      const id = hash.replace(/^#/, '')
      const target = document.getElementById(id)
      if (target) {
        target.scrollIntoView({
          behavior: reducedMotion ? 'auto' : 'smooth',
          block: 'start',
        })
        return
      }
    }

    if (navType !== 'POP') {
      window.scrollTo(0, 0)
    }

    const main = mainRef.current
    if (main) {
      if (!main.hasAttribute('tabindex')) {
        main.setAttribute('tabindex', '-1')
      }
      main.focus({ preventScroll: true })
    }
  }, [pathname, hash, navType, reducedMotion])

  return null
}
