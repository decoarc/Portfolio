import { describe, expect, it } from 'vitest'
import { findMockPaths } from './mock.ts'

describe('findMockPaths', () => {
  it('acha projeto mock em array', () => {
    const tree = {
      en: { projects: [{ slug: 'a' }, { slug: 'b', mock: true }] },
    }
    expect(findMockPaths(tree)).toEqual(['en.projects[1]'])
  })

  it('acha item aninhado', () => {
    const tree = {
      pt: { site: { approach: { items: [{ title: 'x', mock: true }] } } },
    }
    expect(findMockPaths(tree)).toEqual(['pt.site.approach.items[0]'])
  })

  it('nao desce dentro de um mock', () => {
    expect(findMockPaths({ a: { mock: true, b: { mock: true } } })).toEqual([
      'a',
    ])
  })

  it('ignora mock false ou string', () => {
    expect(findMockPaths({ a: { mock: false }, b: { mock: 'true' } })).toEqual(
      [],
    )
  })

  it('arvore sem mock devolve vazio', () => {
    expect(findMockPaths({ a: [1, 'x', null, { b: 2 }] })).toEqual([])
  })
})
