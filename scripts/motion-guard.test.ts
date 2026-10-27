// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Motion da Fase 3: a única transição declarada é a entrada do nome, no
 * Hero, e só sob `[data-entrance='run']` — atributo que o `Opening` aplica e
 * que nunca existe com reduced motion. O movimento por scroll não declara
 * transição: são custom properties escritas a cada frame.
 */
const MOTION =
  /(^|[\s;{])(-(webkit|moz|o|ms)-)?(animation|transition)(-[a-z-]+)?\s*:/m

const ALLOWED = ['src/sections/Hero/Hero.module.css']
const ALLOWED_SELECTOR = "[data-entrance='run']"

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
  it('só a entrada do nome declara transição, e só sob data-entrance=run', () => {
    const hits: string[] = []
    for (const file of cssFiles('src')) {
      const normalized = file.replaceAll('\\', '/')
      for (const hit of motionDeclarations(readFileSync(file, 'utf8'))) {
        const allowed =
          ALLOWED.includes(normalized) &&
          hit.selectors.some((selector) => selector.includes(ALLOWED_SELECTOR))
        if (!allowed) hits.push(`${normalized}:${hit.line}  ${hit.text}`)
      }
    }
    expect(hits).toEqual([])
  })
})
