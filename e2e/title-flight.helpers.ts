import type { Page } from '@playwright/test'

/** Uma animação da View Transition, como o navegador a expõe. */
export interface FlightAnimation {
  /** Pseudo-elemento animado, por exemplo `::view-transition-group(case-title)`. */
  pseudo: string
  playState: AnimationPlayState
}

/** Caixa do grupo do título, lida no estilo calculado do pseudo-elemento. */
export interface GroupBox {
  width: number
  height: number
  /** `transform` calculado (`matrix(...)` ou `none`). */
  transform: string
  /** Translação do `transform`: a posição do canto na janela. */
  x: number
  y: number
}

/** Animações vivas da View Transition (as dos pseudo-elementos `::view-transition-*`). */
export function flight(page: Page): Promise<FlightAnimation[]> {
  return page.evaluate(() =>
    document
      .getAnimations()
      .filter((animation) => {
        const effect = animation.effect as KeyframeEffect | null
        return effect?.pseudoElement?.includes('view-transition') ?? false
      })
      .map((animation) => ({
        pseudo: (animation.effect as KeyframeEffect).pseudoElement ?? '',
        playState: animation.playState,
      })),
  )
}

/**
 * Espera a View Transition começar e congela todas as animações dela em `ms`
 * (tempo desde o início, atrasos incluídos). Devolve quantas congelou.
 */
export async function freezeAt(page: Page, ms: number): Promise<number> {
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .some((animation) =>
        (animation.effect as KeyframeEffect | null)?.pseudoElement?.includes(
          'view-transition',
        ),
      ),
  )
  return page.evaluate((ms) => {
    const animations = document
      .getAnimations()
      .filter((animation) =>
        (animation.effect as KeyframeEffect | null)?.pseudoElement?.includes(
          'view-transition',
        ),
      )
    for (const animation of animations) {
      animation.pause()
      animation.currentTime = ms
    }
    return animations.length
  }, ms)
}

/** Solta as animações congeladas por `freezeAt`, para a transição terminar. */
export function release(page: Page): Promise<void> {
  return page.evaluate(() => {
    for (const animation of document.getAnimations()) {
      const effect = animation.effect as KeyframeEffect | null
      if (effect?.pseudoElement?.includes('view-transition')) animation.play()
    }
  })
}

/** Largura, altura e `transform` de `::view-transition-group(name)`. */
export function groupBox(page: Page, name = 'case-title'): Promise<GroupBox> {
  return page.evaluate((name) => {
    const style = getComputedStyle(
      document.documentElement,
      `::view-transition-group(${name})`,
    )
    const transform = style.transform
    const matrix = new DOMMatrixReadOnly(
      transform === 'none' ? undefined : transform,
    )
    return {
      width: parseFloat(style.width),
      height: parseFloat(style.height),
      transform,
      x: matrix.e,
      y: matrix.f,
    }
  }, name)
}

/** Opacidade calculada de um pseudo-elemento da transição, como número. */
export function pseudoOpacity(page: Page, pseudo: string): Promise<number> {
  return page.evaluate(
    (pseudo) =>
      Number(getComputedStyle(document.documentElement, pseudo).opacity),
    pseudo,
  )
}
