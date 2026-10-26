import { beforeEach, describe, expect, it } from 'vitest'
import { content } from './content'
import {
  applyCopy,
  applyLocale,
  isChromeEnabled,
  isFlatMode,
  readLocale,
  renderWorkList,
  resolvePath,
} from './harness'

const MARKUP = `
  <section data-region="hero">
    <h1 data-copy="person.name"></h1>
    <p data-copy="hero.statement"></p>
  </section>
  <section data-region="work">
    <h2 data-copy="work.label"></h2>
    <ol data-work-list></ol>
    <template data-work-item>
      <li>
        <span data-index></span>
        <h3 data-copy="title"></h3>
        <p data-copy="summary"></p>
        <span data-copy="year"></span>
      </li>
    </template>
  </section>
`

describe('harness dos comps', () => {
  beforeEach(() => {
    document.body.innerHTML = MARKUP
  })

  it('resolve caminho pontilhado', () => {
    expect(resolvePath({ a: { b: 'c' } }, 'a.b')).toBe('c')
  })

  it('devolve undefined em caminho inexistente, sem lançar', () => {
    expect(resolvePath({ a: 1 }, 'a.b.c')).toBeUndefined()
  })

  it('preenche elementos [data-copy]', () => {
    applyCopy(document.body, content.en)
    expect(document.querySelector('[data-copy="person.name"]')?.textContent).toBe(
      'André Arcodaci',
    )
  })

  it('não preenche o conteúdo do template', () => {
    applyCopy(document.body, content.en)
    const template = document.querySelector<HTMLTemplateElement>(
      'template[data-work-item]',
    )
    expect(template?.content.querySelector('[data-copy="title"]')?.textContent).toBe('')
  })

  it('monta um item de lista por projeto', () => {
    renderWorkList(document.body, content.en.projects)
    expect(document.querySelectorAll('[data-work-list] > li')).toHaveLength(
      content.en.projects.length,
    )
  })

  it('preenche cada item com dados relativos ao projeto e o índice', () => {
    renderWorkList(document.body, content.en.projects)
    const first = document.querySelector('[data-work-list] > li')
    expect(first?.querySelector('[data-copy="title"]')?.textContent).toBe('Map Areas')
    expect(first?.querySelector('[data-index]')?.textContent).toBe('01')
  })

  it('substitui a lista ao trocar de locale, sem acumular', () => {
    applyLocale(document.body, 'en')
    applyLocale(document.body, 'pt')
    expect(document.querySelectorAll('[data-work-list] > li')).toHaveLength(
      content.pt.projects.length,
    )
    expect(document.querySelector('[data-copy="person.name"]')?.textContent).toBe(
      'André Arcodaci',
    )
    expect(document.querySelector('[data-copy="work.label"]')?.textContent).toBe(
      'Trabalhos selecionados',
    )
  })

  it('lê o locale da query string, com EN como padrão', () => {
    expect(readLocale('?locale=pt')).toBe('pt')
    expect(readLocale('?locale=en')).toBe('en')
    expect(readLocale('')).toBe('en')
    expect(readLocale('?locale=fr')).toBe('en')
  })

  it('desliga o chrome com ?chrome=0', () => {
    expect(isChromeEnabled('?chrome=0')).toBe(false)
    expect(isChromeEnabled('')).toBe(true)
  })

  it('liga o modo plano só com ?flat=1', () => {
    expect(isFlatMode('?flat=1')).toBe(true)
    expect(isFlatMode('?flat=0')).toBe(false)
    expect(isFlatMode('')).toBe(false)
  })
})
