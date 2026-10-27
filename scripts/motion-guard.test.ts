// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Motion da Fase 3: a entrada do nome, no Hero, só sob `[data-entrance='run']`
 * — atributo que o `Opening` aplica e que nunca existe com reduced motion. Os
 * hovers declaram transição e animação só dentro de
 * `@media (prefers-reduced-motion: no-preference)`. O movimento por scroll não
 * declara transição: são custom properties escritas a cada frame. Desligar
 * motion (`animation: none`, `transition: none`) vale em qualquer lugar: é o
 * que o `reduce` precisa declarar.
 */
const MOTION =
  /(^|[\s;{])(-(webkit|moz|o|ms)-)?(animation|transition)(-[a-z-]+)?\s*:/m

const ALLOWED = ['src/sections/Hero/Hero.module.css']
const ALLOWED_SELECTOR = "[data-entrance='run']"
const NO_PREFERENCE = 'prefers-reduced-motion: no-preference'
/** Declaração que só tira motion, como `animation: none;`. */
const MOTION_OFF = /:\s*none\s*(!important\s*)?;?\s*$/

function cssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return cssFiles(full)
    return entry.name.endsWith('.css') ? [full] : []
  })
}

/** Linhas com declaração de motion, cada uma com os seletores que a envolvem. */
function motionDeclarations(css: string) {
  const found: { line: number; text: string; selectors: string[] }[] = []
  const stack: string[] = []
  let pending = ''
  css.split('\n').forEach((raw, index) => {
    const line = raw.replace(/\/\*.*?\*\//g, '')
    if (MOTION.test(line))
      found.push({ line: index + 1, text: raw.trim(), selectors: [...stack] })
    for (const char of line) {
      if (char === '{') {
        stack.push(pending.trim())
        pending = ''
      } else if (char === '}') {
        stack.pop()
        pending = ''
      } else if (char === ';') {
        pending = ''
      } else {
        pending += char
      }
    }
    pending += ' '
  })
  return found
}

describe('guarda de motion', () => {
  it('motion só sob data-entrance=run (entrada) ou dentro de prefers-reduced-motion: no-preference', () => {
    const hits: string[] = []
    for (const file of cssFiles('src')) {
      const normalized = file.replaceAll('\\', '/')
      for (const hit of motionDeclarations(readFileSync(file, 'utf8'))) {
        const allowed =
          MOTION_OFF.test(hit.text) ||
          (ALLOWED.includes(normalized) &&
            hit.selectors.some((selector) =>
              selector.includes(ALLOWED_SELECTOR),
            )) ||
          hit.selectors.some((selector) => selector.includes(NO_PREFERENCE))
        if (!allowed) hits.push(`${normalized}:${hit.line}  ${hit.text}`)
      }
    }
    expect(hits).toEqual([])
  })

  it('o verificador aceita motion só dentro de no-preference', () => {
    const css = `.a { transition: transform 1s; }
@media (prefers-reduced-motion: no-preference) {
  .b { transition: transform 1s; animation: x 1s; }
}`
    const hits = motionDeclarations(css).filter(
      (hit) => !hit.selectors.some((s) => s.includes(NO_PREFERENCE)),
    )
    expect(hits.map((h) => h.line)).toEqual([1])
  })

  it('desligar motion (`none`) vale fora de no-preference', () => {
    expect(MOTION_OFF.test('animation: none;')).toBe(true)
    expect(MOTION_OFF.test('transition: none;')).toBe(true)
    expect(MOTION_OFF.test('animation: none 1s;')).toBe(false)
    expect(MOTION_OFF.test('animation: fade 1s;')).toBe(false)
  })
})
