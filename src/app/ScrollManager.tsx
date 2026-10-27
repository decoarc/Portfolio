import { useEffect, useRef } from 'react'
import { useLocation, useNavigate, useNavigationType } from 'react-router'
import {
  refreshSmoothScroll,
  scrollToTarget,
  scrollToTop,
  scrollToY,
} from '@/motion/smoothScroll.ts'
import { wantsInstantScroll } from './navigationState.ts'
import { savedScroll } from './scrollMemory.ts'

/**
 * Gerencia scroll e foco a cada navegação. A rolagem passa pelo scroll suave
 * quando ele está ativo. É o único dono da rolagem até âncoras: cliques em
 * links `#hash` viram navegação do router, sem o salto nativo do navegador.
 */
export function ScrollManager() {
  const { pathname, hash, key, state } = useLocation()
  const navigationType = useNavigationType()
  const navigate = useNavigate()
  const previousPathname = useRef<string | null>(null)

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
    const changedPage =
      previousPathname.current !== null && previousPathname.current !== pathname
    previousPathname.current = pathname
    if (hash) {
      let id = hash.slice(1)
      try {
        id = decodeURIComponent(id)
      } catch {
        // hash malformado: usa o texto cru
      }
      const target = document.getElementById(id)
      if (!target) return
      scrollToTarget(target, { immediate: wantsInstantScroll(state) })
      // O foco vai para quem a âncora marca (o link do título da ficha); sem
      // marca, ou com várias (um contêiner como `#main`), o próprio alvo, que
      // então precisa de tabindex.
      const marked = target.querySelectorAll<HTMLElement>('[data-anchor-focus]')
      const focusTarget = marked.length === 1 ? marked[0] : target
      if (focusTarget === target && !target.hasAttribute('tabindex'))
        target.setAttribute('tabindex', '-1')
      focusTarget.focus({ preventScroll: true })
      return
    }
    // Voltar/avançar volta à posição gravada pelo router antes de sair da
    // página (`scrollMemory`); sem gravação (primeira carga, recarregar), fica
    // a do navegador. O foco vai para `#main`, porque o elemento focado na
    // página anterior saiu do DOM. Na primeira carga não há página anterior:
    // o foco fica onde o navegador o põe.
    if (navigationType === 'POP') {
      const saved = savedScroll[key]
      if (saved !== undefined) scrollToY(saved)
      if (changedPage)
        document.getElementById('main')?.focus({ preventScroll: true })
      return
    }
    scrollToTop()
    const routeFocus = document.querySelector<HTMLElement>('[data-route-focus]')
    ;(routeFocus ?? document.getElementById('main'))?.focus({
      preventScroll: true,
    })
  }, [pathname, hash, key, state, navigationType])

  return null
}
