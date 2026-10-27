import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router'
import {
  refreshSmoothScroll,
  scrollToTarget,
  scrollToTop,
} from '@/motion/smoothScroll.ts'

/** Gerencia scroll e foco a cada navegação. A rolagem passa pelo scroll suave quando ele está ativo. */
export function ScrollManager() {
  const { pathname, hash } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
    refreshSmoothScroll()
    if (hash) {
      let id = hash.slice(1)
      try {
        id = decodeURIComponent(id)
      } catch {
        // hash malformado: usa o texto cru
      }
      const target = document.getElementById(id)
      if (!target) return
      if (!target.hasAttribute('tabindex'))
        target.setAttribute('tabindex', '-1')
      scrollToTarget(target)
      target.focus({ preventScroll: true })
      return
    }
    // Voltar/avançar deixa o navegador restaurar a posição.
    if (navigationType === 'POP') return
    scrollToTop()
    document.getElementById('main')?.focus({ preventScroll: true })
  }, [pathname, hash, navigationType])

  return null
}
