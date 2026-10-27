import { useEffect } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router'
import {
  refreshSmoothScroll,
  scrollToTarget,
  scrollToTop,
} from '@/motion/smoothScroll.ts'

/**
 * Gerencia scroll e foco a cada navegação. A rolagem passa pelo scroll suave
 * quando ele está ativo. É o único dono da rolagem até âncoras: cliques em
 * links `#hash` viram navegação do router, sem o salto nativo do navegador.
 */
export function ScrollManager() {
  const { pathname, hash, key } = useLocation()
  const navigationType = useNavigationType()
  const navigate = useNavigate()

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return
      const link =
        event.target instanceof Element ? event.target.closest('a') : null
      const href = link?.getAttribute('href')
      if (!href?.startsWith('#') || href.length < 2) return
      if (link?.target && link.target !== '_self') return
      event.preventDefault()
      void navigate({ hash: href })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [navigate])

  // `key` muda a cada navegação: clicar de novo no mesmo hash rola de novo.
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
  }, [pathname, hash, key, navigationType])

  return null
}
