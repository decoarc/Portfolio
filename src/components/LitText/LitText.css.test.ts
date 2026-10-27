// @vitest-environment node
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(join(__dirname, 'LitText.module.css'), 'utf8')

/**
 * O build não prefixa CSS, e Safaris mais antigos só respeitam o
 * `user-select` com prefixo: sem ele, copiar o parágrafo traria a frase duas
 * vezes (a cópia para leitor de tela e as palavras). O e2e roda só Chromium.
 */
describe('LitText.module.css', () => {
  it('a cópia para leitor de tela fica fora da seleção também no Safari', () => {
    const copy = /\.copy\s*\{([^}]*)\}/.exec(css)?.[1] ?? ''
    expect(copy).toMatch(/-webkit-user-select:\s*none;/)
    expect(copy).toMatch(/(^|[\s;])user-select:\s*none;/)
  })
})
