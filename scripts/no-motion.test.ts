// @vitest-environment node
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Motion é a Fase 3: nenhum CSS de src/ pode declarar animation ou transition.
const MOTION = /(^|[\s;{])(-(webkit|moz|o|ms)-)?(animation|transition)(-[a-z-]+)?\s*:/m

function cssFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return cssFiles(full)
    return entry.name.endsWith('.css') ? [full] : []
  })
}

describe('sem motion nesta fase', () => {
  it('nenhum CSS de src/ declara animation ou transition', () => {
    const hits: string[] = []
    for (const file of cssFiles('src')) {
      readFileSync(file, 'utf8')
        .split('\n')
        .forEach((line, index) => {
          if (MOTION.test(line)) hits.push(`${file}:${index + 1}  ${line.trim()}`)
        })
    }
    expect(hits).toEqual([])
  })
})
