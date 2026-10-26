import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const COMPS_DIR = join(process.cwd(), 'design', 'comps')

/**
 * `animation:`, `transition:`, suas longhands e variantes com prefixo de
 * vendor (`-webkit-`, `-moz-` etc.), fora de comentário.
 */
const FORBIDDEN = /(^|[\s;{])(-[a-z]+-)?(animation|transition)(-[a-z-]+)?\s*:/

describe('comps são estáticos', () => {
  /**
   * Limites conhecidos desta varredura, para quem ler depois não achar que a
   * cobertura é total: ela olha só `design/comps/*.css`. Fica de fora o
   * `<style>` inline de `index.html`, qualquer CSS em subdiretório, e
   * `el.style.animation` atribuído por JS. A trava complementar está em
   * `checks/comps.spec.ts`, que roda `document.getAnimations()` na página
   * montada e pega o que escapar daqui.
   */
  const files = readdirSync(COMPS_DIR).filter((name) => name.endsWith('.css'))

  it('encontra ao menos um CSS de comp', () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it.each(files)('%s não declara animação nem transição', (file) => {
    const css = readFileSync(join(COMPS_DIR, file), 'utf8')
      // Comentários podem mencionar o que se moveria na Fase 3.
      .replace(/\/\*[\s\S]*?\*\//g, '')
    expect(css).not.toMatch(FORBIDDEN)
  })
})

describe('FORBIDDEN cobre propriedades prefixadas por vendor', () => {
  it.each([
    ['-webkit-transition: opacity 0.3s;', true],
    ['-moz-animation: spin 1s linear;', true],
    ['transition: all 0.2s;', true],
    ['animation-duration: 1s;', true],
    ['--transition-note: foo;', false],
    ['grid-template-areas: "a b";', false],
  ])('%s → match esperado = %s', (declaration, shouldMatch) => {
    expect(FORBIDDEN.test(declaration)).toBe(shouldMatch)
  })
})
