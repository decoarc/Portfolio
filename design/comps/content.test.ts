import { describe, expect, it } from 'vitest'
import { content, type CompCopy } from './content'

/** Caminhos de todas as folhas de um objeto, em ordem estável. */
function leafPaths(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object') return [prefix]
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => leafPaths(item, `${prefix}[${index}]`))
  }
  return Object.entries(value as Record<string, unknown>)
    .flatMap(([key, child]) => leafPaths(child, prefix ? `${prefix}.${key}` : key))
    .sort()
}

function leafValues(value: unknown): unknown[] {
  if (value === null || typeof value !== 'object') return [value]
  if (Array.isArray(value)) return value.flatMap(leafValues)
  return Object.values(value as Record<string, unknown>).flatMap(leafValues)
}

describe('conteúdo mock dos comps', () => {
  it('tem paridade de chaves entre EN e PT', () => {
    expect(leafPaths(content.pt)).toEqual(leafPaths(content.en))
  })

  it('tem o mesmo número de projetos nos dois locales', () => {
    expect(content.pt.projects).toHaveLength(content.en.projects.length)
  })

  it('usa os mesmos slugs, na mesma ordem, nos dois locales', () => {
    expect(content.pt.projects.map((p) => p.slug)).toEqual(
      content.en.projects.map((p) => p.slug),
    )
  })

  it('não tem string vazia ou só espaço', () => {
    for (const locale of ['en', 'pt'] as const) {
      for (const value of leafValues(content[locale] as CompCopy)) {
        expect(typeof value).toBe('string')
        expect((value as string).trim()).not.toBe('')
      }
    }
  })

  it('oferece ao menos quatro projetos, para exercitar a lista', () => {
    expect(content.en.projects.length).toBeGreaterThanOrEqual(4)
  })
})
