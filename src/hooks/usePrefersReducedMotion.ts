import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function getInitialPreference(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return window.matchMedia(QUERY).matches
}

/** Live `prefers-reduced-motion` preference for motion gating. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(getInitialPreference)

  useEffect(() => {
    const media = window.matchMedia(QUERY)
    const onChange = () => {
      setReduced(media.matches)
    }
    onChange()
    media.addEventListener('change', onChange)
    return () => {
      media.removeEventListener('change', onChange)
    }
  }, [])

  return reduced
}
