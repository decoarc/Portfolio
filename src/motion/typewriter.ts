import { useEffect } from 'react'
import styles from './typewriter.module.css'
import { createClack } from './typewriterSound.ts'

/**
 * Tempo de vida de uma letra, da batida até sair da página. É a única fonte:
 * o CSS recebe o valor em `--life` e encaixa o fade (1 s) no fim dele.
 */
export const STAMP_LIFETIME_MS = 10500
/** Teto de letras na tela: quem segura o teclado não enche o DOM. */
const MAX_STAMPS = 200

export type TypewriterAction =
  { kind: 'stamp'; char: string } | { kind: 'clack' }

/**
 * O que uma tecla faz na máquina: um caractere imprimível carimba, o espaço
 * só bate o clack, e o resto (Enter, Tab, setas, F-keys, teclas mortas de
 * acento, atalhos com Ctrl/Alt/Cmd, tecla segurada) fica de fora. AltGr no
 * Windows chega como Ctrl+Alt, mas digita caractere: esse passa.
 */
export function typewriterAction(
  event: KeyboardEvent,
): TypewriterAction | null {
  if (event.repeat || event.isComposing) return null
  const altGraph = event.getModifierState?.('AltGraph') ?? false
  if (!altGraph && (event.ctrlKey || event.altKey || event.metaKey)) return null
  if (event.metaKey) return null
  if ([...event.key].length !== 1) return null
  if (event.key === ' ') return { kind: 'clack' }
  return { kind: 'stamp', char: event.key }
}

/** Campos onde a tecla é texto de verdade: lá a máquina não interfere. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

const jitter = (spread: number) => (Math.random() * 2 - 1) * spread

/**
 * Máquina de escrever solta na página: cada tecla carimba a letra na ponta
 * do mouse — sem ordem, empilhando se o mouse está parado — e ela some num
 * fade. Presa ao documento (rola com o conteúdo). Só com mouse: celular e
 * tablet ficam de fora.
 */
export function useTypewriter(): void {
  useEffect(() => {
    if (
      typeof window.matchMedia !== 'function' ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) {
      return
    }
    const clack = createClack()
    // Já baixa a fonte da máquina: a primeira letra não sai na reserva.
    void document.fonts?.load('1em "Special Elite"').catch(() => undefined)
    let pointer: { x: number; y: number } | null = null
    let layer: HTMLDivElement | null = null
    const timers = new Set<number>()

    const ensureLayer = () => {
      if (!layer) {
        layer = document.createElement('div')
        layer.className = styles.layer
        layer.setAttribute('aria-hidden', 'true')
        document.body.append(layer)
      }
      // Mede sem a camada, para ela não sustentar a própria altura.
      layer.style.height = '0px'
      layer.style.height = `${document.documentElement.scrollHeight}px`
      return layer
    }

    const dropLayerIfEmpty = () => {
      if (layer && layer.childElementCount === 0) {
        layer.remove()
        layer = null
      }
    }

    const stamp = (char: string) => {
      const host = ensureLayer()
      const x = (pointer?.x ?? window.innerWidth / 2) + window.scrollX
      const y = (pointer?.y ?? window.innerHeight / 2) + window.scrollY
      const el = document.createElement('span')
      el.className = styles.stamp
      el.dataset.typewriterStamp = ''
      el.textContent = char
      el.style.left = `${x}px`
      el.style.top = `${y}px`
      // A torção só vale sem reduced motion: o CSS decide.
      // Tipo de metal desalinha pouco: torção e deslocamento pequenos.
      el.style.setProperty('--rot', `${jitter(2.5).toFixed(1)}deg`)
      el.style.setProperty('--dx', `${jitter(2).toFixed(1)}px`)
      el.style.setProperty('--dy', `${jitter(2.5).toFixed(1)}px`)
      // Carga de tinta da batida: umas saem cheias, outras mais fracas.
      el.style.setProperty('--ink-load', (0.86 + jitter(0.14)).toFixed(2))
      // O CSS tira daqui quando começar o fade: um tempo só, aqui no hook.
      el.style.setProperty('--life', `${STAMP_LIFETIME_MS}ms`)
      host.append(el)
      while (host.childElementCount > MAX_STAMPS)
        host.firstElementChild?.remove()

      const timer = window.setTimeout(() => {
        timers.delete(timer)
        el.remove()
        dropLayerIfEmpty()
      }, STAMP_LIFETIME_MS)
      timers.add(timer)
    }

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      pointer = { x: event.clientX, y: event.clientY }
    }
    const onKey = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return
      const action = typewriterAction(event)
      if (!action) return
      clack()
      if (action.kind === 'stamp') stamp(action.char)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('keydown', onKey)
      for (const timer of timers) window.clearTimeout(timer)
      layer?.remove()
    }
  }, [])
}
