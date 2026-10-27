/** Estado de navegação que pede rolagem imediata até a âncora, sem deslize. */
export const INSTANT_SCROLL = { scroll: 'instant' } as const

export function wantsInstantScroll(state: unknown): boolean {
  return (
    typeof state === 'object' &&
    state !== null &&
    (state as { scroll?: unknown }).scroll === INSTANT_SCROLL.scroll
  )
}
