import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router'

/** Gerencia scroll e foco a cada navegação. Sem `behavior: 'smooth'` (motion é a Fase 3). */
export function ScrollManager() {
  const { pathname, hash } = useLocation()
  const navigationType = useNavigationType()

  useEffect(() => {
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
      target.scrollIntoView({ block: 'start' })
      target.focus({ preventScroll: true })
      return
    }
    // Voltar/avançar deixa o navegador restaurar a posição.
    if (navigationType === 'POP') return
    window.scrollTo(0, 0)
    document.getElementById('main')?.focus({ preventScroll: true })
  }, [pathname, hash, navigationType])

  return null
}
