import { content, type CompLocale, type CompProject } from './content'

const LOCALES: CompLocale[] = ['en', 'pt']

export function resolvePath(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc === null || typeof acc !== 'object') return undefined
    return (acc as Record<string, unknown>)[key]
  }, source)
}

/** Preenche `[data-copy]` do escopo dado. Não desce para dentro de `<template>`. */
export function applyCopy(root: ParentNode, data: unknown): void {
  for (const el of root.querySelectorAll<HTMLElement>('[data-copy]')) {
    const path = el.dataset.copy
    if (!path) continue
    const value = resolvePath(data, path)
    if (typeof value === 'string') el.textContent = value
  }
}

export function renderWorkList(root: ParentNode, projects: CompProject[]): void {
  const list = root.querySelector<HTMLElement>('[data-work-list]')
  const template = root.querySelector<HTMLTemplateElement>('template[data-work-item]')
  if (!list || !template) return

  list.replaceChildren()
  projects.forEach((project, index) => {
    const node = template.content.cloneNode(true) as DocumentFragment
    const indexEl = node.querySelector<HTMLElement>('[data-index]')
    if (indexEl) indexEl.textContent = String(index + 1).padStart(2, '0')
    applyCopy(node, project)
    list.append(node)
  })
}

export function applyLocale(root: ParentNode, locale: CompLocale): void {
  const data = content[locale]
  applyCopy(root, data)
  renderWorkList(root, data.projects)
}

export function readLocale(search: string): CompLocale {
  const value = new URLSearchParams(search).get('locale')
  return LOCALES.includes(value as CompLocale) ? (value as CompLocale) : 'en'
}

export function isChromeEnabled(search: string): boolean {
  return new URLSearchParams(search).get('chrome') !== '0'
}

/**
 * Barra fixa de desenvolvimento: troca de idioma, leitura do viewport e o
 * rótulo MOCK, para que nenhuma captura seja confundida com trabalho real.
 * Fica fora do fluxo do documento e some com `?chrome=0`, que é como as
 * verificações automatizadas carregam os comps.
 */
export function mountChrome(doc: Document, locale: CompLocale): void {
  const bar = doc.createElement('div')
  bar.dataset.compChrome = ''
  bar.setAttribute('style', [
    'position:fixed',
    'inset:auto 12px 12px auto',
    'z-index:9999',
    'display:flex',
    'gap:8px',
    'align-items:center',
    'padding:6px 10px',
    'border-radius:999px',
    'background:#000000',
    'color:#ffffff',
    'font:500 12px/1 ui-monospace,monospace',
  ].join(';'))

  const badge = doc.createElement('span')
  badge.textContent = 'MOCK'
  badge.setAttribute('style', 'color:#ffd166;letter-spacing:0.08em')
  bar.append(badge)

  for (const option of LOCALES) {
    const link = doc.createElement('a')
    const url = new URL(doc.location.href)
    url.searchParams.set('locale', option)
    link.href = url.pathname + url.search
    link.textContent = option.toUpperCase()
    link.setAttribute(
      'style',
      `color:${option === locale ? '#ffffff' : '#9aa0a6'};text-decoration:none`,
    )
    bar.append(link)
  }

  const size = doc.createElement('span')
  size.setAttribute('style', 'color:#9aa0a6')
  const report = () => {
    size.textContent = `${doc.defaultView?.innerWidth ?? 0}px`
  }
  report()
  doc.defaultView?.addEventListener('resize', report)
  bar.append(size)

  doc.body.append(bar)
}

if (typeof document !== 'undefined' && document.querySelector('[data-region="hero"]')) {
  const locale = readLocale(window.location.search)
  document.documentElement.lang = locale === 'pt' ? 'pt-BR' : 'en'
  applyLocale(document, locale)
  if (isChromeEnabled(window.location.search)) mountChrome(document, locale)
}
