import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const COMPS_DIR = join(process.cwd(), 'design', 'comps')

/** `animation:`, `transition:` e suas longhands, fora de comentário. */
const FORBIDDEN = /(^|[\s;{])(animation|transition)(-[a-z-]+)?\s*:/

describe('comps são estáticos', () => {
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
