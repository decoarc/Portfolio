# Fase 0 — Comps comparativos (Gate 1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produzir três composições estáticas comparáveis do primeiro viewport do portfólio, cada uma propondo uma metáfora visual e um conjunto completo de paleta e tipografia, para que o dono decida D1 e D2 vendo em vez de lendo.

**Architecture:** Três páginas HTML autocontidas em `design/comps/`, servidas pelo dev server do Vite, fora de `src/`. Copy e lista de projetos vêm de um módulo compartilhado, para que a comparação isole a composição em vez do texto. Um harness injeta a troca PT/EN e um rótulo de mock. Um config Playwright próprio valida os três comps em três viewports e dois idiomas: sem overflow horizontal, sem animação declarada e sem violação de contraste.

**Tech Stack:** Vite 8 (dev server), TypeScript, Playwright, `@axe-core/playwright`, Vitest + jsdom, famílias `@fontsource*` (OFL).

**Spec:** `docs/superpowers/specs/2026-10-26-portfolio-visual-redesign-design.md` — Fase 0 e Gate 1.

## Global Constraints

- **Nenhum arquivo de `src/` é criado, modificado ou apagado neste plano.** A fundação é a Fase 2 e depende do vencedor do Gate 1.
- **Comps são estáticos.** Nenhuma `animation` ou `transition` em CSS, nenhum movimento em JS. A verificação automatizada falha se `document.getAnimations()` retornar qualquer coisa. O que se moveria na Fase 3 vai por escrito no README, não no código.
- **Os três comps usam exatamente a mesma copy**, servida por `design/comps/content.ts`. Comp com texto próprio compara texto, não desenho.
- **PT-BR e EN** disponíveis em todos os comps, via `?locale=pt` / `?locale=en`.
- **Viewports obrigatórios:** 1440×900, 768×1024, 390×844. Mobile tem composição própria, não a desktop comprimida.
- **Fontes:** apenas famílias OFL instaladas como `devDependencies` via `@fontsource`. Nenhum `<link>` para CDN de terceiros.
- **Contraste:** texto corpo ≥ 4.5:1, texto grande ≥ 3:1. Os valores de paleta deste plano já foram medidos e passam; qualquer cor nova precisa ser medida antes de entrar.
- **`design/comps/` é descartável.** Será apagado ao fim da Fase 2, junto com as `devDependencies` de fontes perdedoras e a entrada de `tsconfig.app.json`.
- Commits em português, no formato `tipo: descrição`, como o histórico existente.

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `design/comps/content.ts` | Copy mock PT/EN e lista de projetos, compartilhada pelos três comps |
| `design/comps/content.test.ts` | Paridade de chaves entre locales e ausência de string vazia |
| `design/comps/harness.ts` | Preenche `[data-copy]`, monta a lista de trabalhos, troca de locale, barra de chrome |
| `design/comps/harness.test.ts` | Resolução de caminho, montagem da lista, troca de locale |
| `design/comps/index.html` | Menu de navegação entre os três comps |
| `design/comps/01-inspection-slot.html` / `.css` | Comp 01 — bancada de inspeção |
| `design/comps/02-editorial-rolodex.html` / `.css` | Comp 02 — arquivo editorial |
| `design/comps/03-spatial-gallery.html` / `.css` | Comp 03 — galeria espacial |
| `design/comps/README.md` | O que cada comp propõe: paleta, tipografia, nota de motion |
| `design/comps/static.test.ts` | Nenhum CSS de comp declara `animation` ou `transition` |
| `design/comps/checks/comps.spec.ts` | Overflow, estaticidade em runtime, contraste — 3 comps × 3 viewports × 2 locales |
| `design/comps/checks/capture.spec.ts` | Capturas para o dossiê do Gate 1 |
| `playwright.comps.config.ts` | Config Playwright contra o dev server (o config principal roda `build && preview`, que não inclui os comps) |
| `docs/gate-1/README.md` | Dossiê comparativo para a decisão |
| `docs/DESIGN_DECISIONS.md` | Registro da decisão D1/D2, com as rejeitadas |

Todos os comps compartilham o **mesmo esqueleto de HTML** (mesmos `data-region`, `data-copy`, `template[data-work-item]`). Só o CSS e a ordem visual mudam. Isto é o que permite a um único arquivo de verificação cobrir os três.

---

### Task 1: Conteúdo mock compartilhado

**Files:**
- Create: `design/comps/content.ts`
- Test: `design/comps/content.test.ts`
- Modify: `tsconfig.app.json` (adicionar `design/comps` ao `include`)

**Interfaces:**
- Consumes: nada.
- Produces: `CompLocale = 'en' | 'pt'`; `CompProject { slug, title, year, type, summary, stack }`; `CompCopy { person: { name, role, location }, hero: { statement, ctaPrimary, ctaSecondary, metaLeft, metaRight }, work: { label, intro }, projects: CompProject[] }`; `content: Record<CompLocale, CompCopy>`.

Todo campo deste tipo é lido por algum `[data-copy]` do esqueleto da Task 3. Campo que nada lê não entra: o teste de paridade o exigiria para sempre nos dois locales sem que nada o exiba.

- [ ] **Step 1: Escrever o teste que falha**

Create `design/comps/content.test.ts`:

```ts
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
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `rtk npx vitest run design/comps/content.test.ts`
Expected: FAIL — `Failed to resolve import "./content"`.

- [ ] **Step 3: Escrever o conteúdo**

Create `design/comps/content.ts`:

```ts
export type CompLocale = 'en' | 'pt'

export interface CompProject {
  slug: string
  title: string
  year: string
  /** Rótulo visível de natureza do trabalho. */
  type: string
  summary: string
  stack: string
}

export interface CompCopy {
  person: {
    name: string
    role: string
    location: string
  }
  hero: {
    statement: string
    ctaPrimary: string
    ctaSecondary: string
    metaLeft: string
    metaRight: string
  }
  work: {
    label: string
    intro: string
  }
  projects: CompProject[]
}

/**
 * Copy mock da Fase 0, compartilhada pelos três comps para que a comparação
 * isole a composição. Só `map-areas` corresponde a trabalho real; os demais
 * existem para exercitar a lista e serão substituídos na Fase 2.
 */
export const content: Record<CompLocale, CompCopy> = {
  en: {
    person: {
      name: 'André Arcodaci',
      role: 'Full Stack Developer',
      location: 'Based in Brazil',
    },
    hero: {
      statement:
        'I build interfaces, APIs and automation — systems you can run, read and reason about.',
      ctaPrimary: 'Selected work',
      ctaSecondary: 'Get in touch',
      metaLeft: 'BR · Remote',
      metaRight: 'Portfolio 2026',
    },
    work: {
      label: 'Selected work',
      intro:
        'Four entries, honest about what they are: one shipped, three studies.',
    },
    projects: [
      {
        slug: 'map-areas',
        title: 'Map Areas',
        year: '2025',
        type: 'Verified',
        summary:
          'Geospatial area management for field teams, built to stay usable when the connection is not.',
        stack: 'React · TypeScript · PostGIS',
      },
      {
        slug: 'token-killer',
        title: 'Token Killer',
        year: '2026',
        type: 'Concept study',
        summary:
          'A command-line proxy that compresses tool output before it ever reaches a model.',
        stack: 'Rust · Tokio',
      },
      {
        slug: 'atlas-ledger',
        title: 'Atlas Ledger',
        year: '2025',
        type: 'Concept study',
        summary:
          'Double-entry bookkeeping primitives over an append-only event log you can audit by hand.',
        stack: 'Go · PostgreSQL',
      },
      {
        slug: 'field-notes',
        title: 'Field Notes',
        year: '2024',
        type: 'Concept study',
        summary:
          'Offline-first capture that reconciles conflicting edits without a server round trip.',
        stack: 'TypeScript · CRDT',
      },
    ],
  },
  pt: {
    person: {
      name: 'André Arcodaci',
      role: 'Desenvolvedor Full Stack',
      location: 'No Brasil',
    },
    hero: {
      statement:
        'Construo interfaces, APIs e automação — sistemas que você consegue rodar, ler e entender.',
      ctaPrimary: 'Trabalhos selecionados',
      ctaSecondary: 'Entrar em contato',
      metaLeft: 'BR · Remoto',
      metaRight: 'Portfólio 2026',
    },
    work: {
      label: 'Trabalhos selecionados',
      intro:
        'Quatro entradas, honestas sobre o que são: uma entregue, três estudos.',
    },
    projects: [
      {
        slug: 'map-areas',
        title: 'Map Areas',
        year: '2025',
        type: 'Verificado',
        summary:
          'Gestão de áreas geoespaciais para equipes de campo, feita para continuar usável quando a conexão não está.',
        stack: 'React · TypeScript · PostGIS',
      },
      {
        slug: 'token-killer',
        title: 'Token Killer',
        year: '2026',
        type: 'Estudo conceitual',
        summary:
          'Um proxy de linha de comando que comprime a saída das ferramentas antes de ela chegar ao modelo.',
        stack: 'Rust · Tokio',
      },
      {
        slug: 'atlas-ledger',
        title: 'Atlas Ledger',
        year: '2025',
        type: 'Estudo conceitual',
        summary:
          'Primitivas de partidas dobradas sobre um log de eventos append-only que dá para auditar na mão.',
        stack: 'Go · PostgreSQL',
      },
      {
        slug: 'field-notes',
        title: 'Field Notes',
        year: '2024',
        type: 'Estudo conceitual',
        summary:
          'Captura offline-first que reconcilia edições conflitantes sem ida e volta ao servidor.',
        stack: 'TypeScript · CRDT',
      },
    ],
  },
}
```

- [ ] **Step 4: Incluir `design/comps` no typecheck**

Modify `tsconfig.app.json` — trocar a última linha:

```json
  "include": ["src", "design/comps"]
```

- [ ] **Step 5: Rodar teste e typecheck**

Run: `rtk npx vitest run design/comps/content.test.ts && rtk pnpm typecheck`
Expected: 5 testes PASS, typecheck sem erro.

- [ ] **Step 6: Commit**

```bash
rtk git add design/comps/content.ts design/comps/content.test.ts tsconfig.app.json
rtk git commit -m "feat(comps): conteudo mock compartilhado PT/EN com teste de paridade"
```

---

### Task 2: Harness de copy, locale e chrome

**Files:**
- Create: `design/comps/harness.ts`
- Test: `design/comps/harness.test.ts`

**Interfaces:**
- Consumes: `content`, `CompLocale`, `CompProject` de `./content`.
- Produces:
  - `resolvePath(source: unknown, path: string): unknown`
  - `applyCopy(root: ParentNode, data: unknown): void`
  - `renderWorkList(root: ParentNode, projects: CompProject[]): void`
  - `applyLocale(root: ParentNode, locale: CompLocale): void`
  - `readLocale(search: string): CompLocale`
  - `isChromeEnabled(search: string): boolean`
  - `mountChrome(doc: Document, locale: CompLocale): void`

**Contrato de marcação que o harness assume** (todos os comps o seguem):

- `[data-copy="hero.statement"]` recebe `textContent` resolvido por caminho pontilhado em `content[locale]`.
- `[data-work-list]` é o container da lista; `template[data-work-item]` é o molde de um item.
- Dentro do molde, `[data-copy="title"]` resolve **relativo ao projeto**, e `[data-index]` recebe a posição com dois dígitos.
- `querySelectorAll` não desce para dentro de `<template>`, então o molde nunca é preenchido no lugar — isso é o que mantém os dois escopos separados sem configuração.

- [ ] **Step 1: Escrever o teste que falha**

Create `design/comps/harness.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { content } from './content'
import {
  applyCopy,
  applyLocale,
  isChromeEnabled,
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
})
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `rtk npx vitest run design/comps/harness.test.ts`
Expected: FAIL — `Failed to resolve import "./harness"`.

- [ ] **Step 3: Escrever o harness**

Create `design/comps/harness.ts`:

```ts
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
```

- [ ] **Step 4: Rodar teste e typecheck**

Run: `rtk npx vitest run design/comps && rtk pnpm typecheck && rtk pnpm lint`
Expected: todos os testes de `content` e `harness` PASS; typecheck e lint limpos.

- [ ] **Step 5: Commit**

```bash
rtk git add design/comps/harness.ts design/comps/harness.test.ts
rtk git commit -m "feat(comps): harness de copy, locale e chrome de desenvolvimento"
```

---

### Task 3: Verificação automatizada e Comp 01 — Inspection Slot

Esta task junta a infraestrutura de verificação ao primeiro comp porque uma sem o outro não é testável: o spec de verificação precisa de um comp para rodar, e o comp precisa do spec para provar que atende os limites.

**Files:**
- Create: `playwright.comps.config.ts`
- Create: `design/comps/checks/comps.spec.ts`
- Create: `design/comps/static.test.ts`
- Create: `design/comps/index.html`
- Create: `design/comps/01-inspection-slot.html`
- Create: `design/comps/01-inspection-slot.css`
- Modify: `package.json` (devDependencies de fontes + script `comps`)

**Interfaces:**
- Consumes: `./harness.ts` (efeito de import), contrato de marcação da Task 2.
- Produces: o esqueleto de HTML que os Comps 02 e 03 reutilizam verbatim; a lista `COMPS` em `checks/comps.spec.ts`, à qual as tasks seguintes acrescentam uma entrada.

- [ ] **Step 1: Instalar as famílias tipográficas candidatas**

Todas verificadas no npm em 5.3.0, todas OFL.

```bash
rtk pnpm add -D @fontsource-variable/archivo @fontsource-variable/instrument-sans @fontsource-variable/jetbrains-mono @fontsource-variable/fraunces @fontsource-variable/geist-mono @fontsource-variable/syne @fontsource-variable/space-grotesk
```

- [ ] **Step 2: Escrever o config Playwright dos comps**

Create `playwright.comps.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test'

/**
 * Config separado do principal: `playwright.config.ts` sobe `build && preview`,
 * e o build de produção só tem `index.html` como entrada — os comps não existem
 * em `dist/`. Aqui rodamos contra o dev server, que serve `design/comps/*.html`
 * direto do disco.
 */
const port = 5174
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: './design/comps/checks',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [['list']],
  use: { baseURL },
  webServer: {
    command: `pnpm dev --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
```

- [ ] **Step 3: Adicionar o script ao `package.json`**

Modify `package.json`, dentro de `"scripts"`, logo após `"test:e2e"`:

```json
    "comps": "playwright test --config playwright.comps.config.ts",
```

- [ ] **Step 4: Escrever a verificação que falha**

Create `design/comps/checks/comps.spec.ts`:

```ts
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/** Cada comp novo entra aqui e herda a matriz inteira de verificação. */
const COMPS = ['01-inspection-slot'] as const

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
] as const

const LOCALES = ['en', 'pt'] as const

for (const comp of COMPS) {
  for (const viewport of VIEWPORTS) {
    for (const locale of LOCALES) {
      test(`${comp} · ${viewport.name} · ${locale}`, async ({ page }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        })
        await page.goto(`/design/comps/${comp}.html?locale=${locale}&chrome=0`)
        await page.evaluate(() => document.fonts.ready.then(() => true))

        await expect(page.locator('[data-region="hero"]')).toBeVisible()
        await expect(page.locator('[data-region="work"]')).toBeVisible()

        // A copy veio do módulo compartilhado, não ficou placeholder vazio.
        await expect(page.locator('[data-copy="person.name"]')).toHaveText(
          'André Arcodaci',
        )
        await expect(page.locator('[data-work-list] > li')).toHaveCount(4)

        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth -
            document.documentElement.clientWidth,
        )
        expect(overflow, 'sem overflow horizontal').toBeLessThanOrEqual(1)

        const animations = await page.evaluate(() => document.getAnimations().length)
        expect(animations, 'comp estático: nenhuma animação declarada').toBe(0)

        const results = await new AxeBuilder({ page })
          .withRules(['color-contrast'])
          .analyze()
        expect(
          results.violations,
          'contraste WCAG AA em todo texto do comp',
        ).toEqual([])
      })
    }
  }
}
```

- [ ] **Step 5: Rodar e confirmar que falha**

Run: `rtk pnpm comps`
Expected: 6 testes FAIL — a página `01-inspection-slot.html` ainda não existe (404 servido como HTML vazio, `[data-region="hero"]` nunca visível).

- [ ] **Step 6: Escrever o esqueleto de HTML do Comp 01**

Este esqueleto é o **contrato compartilhado**. Os Comps 02 e 03 copiam esta estrutura verbatim, trocando apenas `data-comp`, `<title>`, o `<link>` de CSS e os imports de fonte.

Create `design/comps/01-inspection-slot.html`:

```html
<!doctype html>
<html lang="en" data-comp="01-inspection-slot">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Comp 01 — Inspection Slot</title>
    <link rel="stylesheet" href="./01-inspection-slot.css" />
    <script type="module">
      import '@fontsource-variable/archivo'
      import '@fontsource-variable/instrument-sans'
      import '@fontsource-variable/jetbrains-mono'
    </script>
    <script type="module" src="./harness.ts"></script>
  </head>
  <body>
    <main class="comp">
      <section class="hero" data-region="hero">
        <p class="hero__meta hero__meta--left" data-copy="hero.metaLeft"></p>
        <p class="hero__meta hero__meta--right" data-copy="hero.metaRight"></p>
        <h1 class="hero__name" data-copy="person.name"></h1>
        <p class="hero__role" data-copy="person.role"></p>
        <p class="hero__statement" data-copy="hero.statement"></p>
        <nav class="hero__actions">
          <a class="action action--primary" href="#work" data-copy="hero.ctaPrimary"></a>
          <a class="action action--ghost" href="#work" data-copy="hero.ctaSecondary"></a>
        </nav>
        <p class="hero__location" data-copy="person.location"></p>
      </section>

      <section class="work" id="work" data-region="work">
        <header class="work__head">
          <h2 class="work__label" data-copy="work.label"></h2>
          <p class="work__intro" data-copy="work.intro"></p>
        </header>
        <ol class="work__list" data-work-list></ol>
        <template data-work-item>
          <li class="slot">
            <span class="slot__index" data-index></span>
            <span class="slot__type" data-copy="type"></span>
            <h3 class="slot__title" data-copy="title"></h3>
            <p class="slot__summary" data-copy="summary"></p>
            <p class="slot__stack" data-copy="stack"></p>
            <span class="slot__year" data-copy="year"></span>
          </li>
        </template>
      </section>
    </main>
  </body>
</html>
```

**Se os imports nus de fonte não resolverem** (o Vite resolve bare specifiers em `<script type="module">` de entradas HTML, mas confirme no browser que a face correta renderiza — compare com a fallback do sistema): troque o bloco de import por links diretos, que o dev server também serve:

```html
<link rel="stylesheet" href="/node_modules/@fontsource-variable/archivo/index.css" />
<link rel="stylesheet" href="/node_modules/@fontsource-variable/instrument-sans/index.css" />
<link rel="stylesheet" href="/node_modules/@fontsource-variable/jetbrains-mono/index.css" />
```

- [ ] **Step 7: Escrever o CSS do Comp 01**

**Conceito — Inspection Slot.** Bancada de inspeção. A página é uma superfície de metal escovado escuro onde peças são apresentadas em recortes retangulares. O hero é um recorte grande com o nome parcialmente sangrado pela moldura; os projetos são gavetas horizontais numeradas, cada uma com sua etiqueta de tipo. A assinatura é a **moldura**: filetes finos, cantos marcados, numeração monoespaçada e um âmbar de sinalização industrial usado com parcimônia.

**Paleta (medida, passa AA):** fundo `#16181A`, superfície `#1F2225`, tinta `#E8E6E1` (14.27:1 sobre o fundo), tinta suave `#A8A49C` (7.17:1), filete `#4A4F55`, acento `#FF6A1F` (6.22:1).

**Tipografia:** Archivo Variable no display (grotesca industrial, aguenta peso alto sem virar caricatura), Instrument Sans no corpo, JetBrains Mono nos números e etiquetas.

Create `design/comps/01-inspection-slot.css`:

```css
/* Comp 01 — Inspection Slot. Autocontido: não importa token de src/. */

:root {
  --bg: #16181a;
  --surface: #1f2225;
  --ink: #e8e6e1;
  --ink-muted: #a8a49c;
  --rule: #4a4f55;
  --accent: #ff6a1f;

  --font-display: 'Archivo Variable', 'Archivo', system-ui, sans-serif;
  --font-body: 'Instrument Sans Variable', 'Instrument Sans', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono Variable', ui-monospace, monospace;

  --gutter: clamp(20px, 4vw, 64px);
  --frame: 1px;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  background: var(--bg);
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: clamp(1rem, 0.96rem + 0.2vw, 1.0625rem);
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
}

.comp {
  display: block;
}

/* ---- Hero: um recorte único, com o nome sangrando a moldura ---- */

/* Mobile é flex column: empilhar é o comportamento correto e não há risco de
   coluna implícita. O grid de 12 colunas só entra a partir de 768px. */
.hero {
  position: relative;
  min-height: 100svh;
  padding: var(--gutter);
  display: flex;
  flex-direction: column;
  gap: clamp(24px, 4vh, 48px);
  border-bottom: var(--frame) solid var(--rule);
  overflow: hidden;
}

.hero__meta {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-muted);
}

.hero__meta--right {
  align-self: flex-end;
}

.hero__name {
  /* `auto` no eixo de bloco absorve o espaço livre e centra verticalmente,
     tanto no flex do mobile quanto na faixa 1fr do grid desktop. */
  margin: auto 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(3rem, 1.2rem + 11vw, 11rem);
  line-height: 0.86;
  letter-spacing: -0.03em;
  /* A sangria é a assinatura: o nome encosta na moldura esquerda.
     O padding do mesmo valor devolve o texto ao alinhamento — sem ele,
     a primeira letra sai da página. */
  margin-inline-start: calc(var(--gutter) * -1);
  padding-inline-start: var(--gutter);
}

.hero__role,
.hero__statement,
.hero__location {
  margin: 0;
}

.hero__role {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--accent);
}

.hero__statement {
  max-width: 46ch;
  color: var(--ink-muted);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero__location {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-muted);
}

/* Desktop: o bloco inferior vira uma régua de quatro colunas. */
@media (min-width: 768px) {
  .hero {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: auto 1fr auto;
    column-gap: 16px;
  }

  .hero__meta--left {
    grid-column: 1 / span 6;
  }

  .hero__meta--right {
    grid-column: 7 / -1;
  }

  .hero__name {
    grid-column: 1 / -1;
  }

  .hero__role {
    grid-column: 1 / span 3;
    align-self: end;
  }

  .hero__statement {
    grid-column: 4 / span 5;
    align-self: end;
  }

  .hero__actions {
    grid-column: 9 / span 2;
    align-self: end;
  }

  .hero__location {
    grid-column: 11 / -1;
    align-self: end;
    justify-self: end;
  }
}

.action {
  display: inline-block;
  padding: 10px 18px;
  border: var(--frame) solid var(--rule);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  text-decoration: none;
}

.action--primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #16181a;
}

.action--ghost {
  color: var(--ink);
}

/* ---- Work: gavetas numeradas ---- */

.work {
  padding: var(--gutter);
}

.work__head {
  display: grid;
  gap: 12px;
  padding-bottom: clamp(24px, 4vh, 40px);
}

.work__label {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(1.5rem, 1.1rem + 1.6vw, 2.5rem);
  letter-spacing: -0.02em;
}

.work__intro {
  margin: 0;
  max-width: 52ch;
  color: var(--ink-muted);
}

.work__list {
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: var(--frame) solid var(--rule);
}

.slot {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-areas:
    'index type'
    'index title'
    'index summary'
    'index stack'
    'index year';
  column-gap: 16px;
  row-gap: 4px;
  padding: clamp(20px, 3vh, 32px) 0;
  border-bottom: var(--frame) solid var(--rule);
  background: var(--bg);
}

.slot__index {
  grid-area: index;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--ink-muted);
}

.slot__type {
  grid-area: type;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
}

.slot__title {
  grid-area: title;
  margin: 0;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(1.375rem, 1.1rem + 1.2vw, 2rem);
  letter-spacing: -0.02em;
}

.slot__summary {
  grid-area: summary;
  margin: 0;
  max-width: 54ch;
  color: var(--ink-muted);
}

.slot__stack,
.slot__year {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--ink-muted);
}

.slot__stack {
  grid-area: stack;
  margin: 0;
}

.slot__year {
  grid-area: year;
}

/* Desktop: a gaveta se abre em régua — índice, corpo, metadados à direita. */
@media (min-width: 768px) {
  .slot {
    grid-template-columns: 4rem minmax(0, 2fr) minmax(0, 1fr);
    grid-template-areas:
      'index title  year'
      'index summary stack'
      'index type   type';
    align-items: start;
    column-gap: 24px;
    row-gap: 8px;
  }

  .slot__year {
    justify-self: end;
    align-self: center;
  }

  .slot__stack {
    justify-self: end;
    text-align: right;
  }
}
```

- [ ] **Step 8: Rodar a verificação e corrigir até passar**

Run: `rtk pnpm comps`
Expected: 6 testes PASS.

Se o contraste falhar, a cor nova precisa ser medida antes de entrar — as da paleta acima já foram. Se houver overflow em 390px, o suspeito é `--gutter` negativo em `.hero__name`: a sangria compensa com `padding-inline-start` do mesmo valor e não pode ultrapassá-lo.

- [ ] **Step 9: Olhar os três viewports e julgar**

Run: `rtk pnpm dev`
Abra `http://localhost:5173/design/comps/01-inspection-slot.html` e percorra 1440 / 768 / 390 nos dois idiomas. A verificação automatizada prova que não quebra; ela não prova que está bom. Ajuste a composição até ler como bancada de inspeção, e rode `rtk pnpm comps` de novo depois de cada ajuste.

- [ ] **Step 10: Travar a estaticidade no próprio CSS**

`document.getAnimations()` só enxerga animação em execução — um `transition:`
declarado e nunca disparado passaria pela verificação do browser. Esta é a
trava que falta.

Create `design/comps/static.test.ts`:

```ts
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
```

Run: `rtk npx vitest run design/comps/static.test.ts`
Expected: PASS — nenhum dos CSS escritos até aqui declara movimento.

- [ ] **Step 11: Escrever o índice dos comps**

Create `design/comps/index.html`:

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Comps — Gate 1</title>
    <style>
      body {
        margin: 0;
        padding: 48px 32px;
        background: #101214;
        color: #e8e6e1;
        font: 16px/1.6 system-ui, sans-serif;
      }
      h1 { font-size: 1.25rem; letter-spacing: 0.04em; text-transform: uppercase; }
      p { color: #a8a49c; max-width: 60ch; }
      ul { list-style: none; padding: 0; display: grid; gap: 12px; max-width: 60ch; }
      a { color: #e8e6e1; text-decoration: none; display: block; padding: 16px; border: 1px solid #4a4f55; }
      a:hover, a:focus-visible { border-color: #ff6a1f; }
      small { display: block; color: #a8a49c; }
    </style>
  </head>
  <body>
    <h1>Comps — Gate 1</h1>
    <p>
      Três composições estáticas do primeiro viewport, mesma copy, para decidir
      D1 (metáfora) e D2 (paleta e tipografia). Conteúdo mockado.
      Use <code>?locale=pt</code> para ver em português.
    </p>
    <ul>
      <li>
        <a href="./01-inspection-slot.html">
          01 — Inspection Slot
          <small>Bancada de inspeção · Archivo + Instrument Sans · grafite e âmbar</small>
        </a>
      </li>
    </ul>
  </body>
</html>
```

- [ ] **Step 12: Rodar a suíte inteira**

Run: `rtk pnpm typecheck && rtk pnpm lint && rtk pnpm test && rtk pnpm comps`
Expected: tudo PASS. `pnpm test` continua cobrindo os testes de `src/` que ainda existem.

- [ ] **Step 13: Commit**

```bash
rtk git add playwright.comps.config.ts package.json pnpm-lock.yaml design/comps/checks design/comps/static.test.ts design/comps/index.html design/comps/01-inspection-slot.html design/comps/01-inspection-slot.css
rtk git commit -m "feat(comps): verificacao automatizada e comp 01 inspection slot"
```

---

### Task 4: Comp 02 — Arquivo editorial / Rolodex

**Files:**
- Create: `design/comps/02-editorial-rolodex.html`
- Create: `design/comps/02-editorial-rolodex.css`
- Modify: `design/comps/checks/comps.spec.ts` (acrescentar à lista `COMPS`)
- Modify: `design/comps/index.html` (acrescentar o item)

**Interfaces:**
- Consumes: o esqueleto de HTML da Task 3, verbatim — mesmos `data-region`, `data-copy`, `template[data-work-item]`, mesmas classes. Só mudam `data-comp`, `<title>`, o `<link>` de CSS e os imports de fonte.
- Produces: nada que tasks seguintes consumam.

- [ ] **Step 1: Registrar o comp na verificação**

Modify `design/comps/checks/comps.spec.ts` — trocar a linha de `COMPS`:

```ts
const COMPS = ['01-inspection-slot', '02-editorial-rolodex'] as const
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `rtk pnpm comps`
Expected: 12 testes; os 6 de `01` PASS, os 6 de `02` FAIL — a página não existe.

- [ ] **Step 3: Escrever o HTML do Comp 02**

Create `design/comps/02-editorial-rolodex.html` — idêntico ao Comp 01, com quatro trocas:

```html
<!doctype html>
<html lang="en" data-comp="02-editorial-rolodex">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Comp 02 — Editorial Rolodex</title>
    <link rel="stylesheet" href="./02-editorial-rolodex.css" />
    <script type="module">
      import '@fontsource-variable/fraunces'
      import '@fontsource-variable/instrument-sans'
      import '@fontsource-variable/geist-mono'
    </script>
    <script type="module" src="./harness.ts"></script>
  </head>
  <body>
    <main class="comp">
      <section class="hero" data-region="hero">
        <p class="hero__meta hero__meta--left" data-copy="hero.metaLeft"></p>
        <p class="hero__meta hero__meta--right" data-copy="hero.metaRight"></p>
        <h1 class="hero__name" data-copy="person.name"></h1>
        <p class="hero__role" data-copy="person.role"></p>
        <p class="hero__statement" data-copy="hero.statement"></p>
        <nav class="hero__actions">
          <a class="action action--primary" href="#work" data-copy="hero.ctaPrimary"></a>
          <a class="action action--ghost" href="#work" data-copy="hero.ctaSecondary"></a>
        </nav>
        <p class="hero__location" data-copy="person.location"></p>
      </section>

      <section class="work" id="work" data-region="work">
        <header class="work__head">
          <h2 class="work__label" data-copy="work.label"></h2>
          <p class="work__intro" data-copy="work.intro"></p>
        </header>
        <ol class="work__list" data-work-list></ol>
        <template data-work-item>
          <li class="slot">
            <span class="slot__index" data-index></span>
            <span class="slot__type" data-copy="type"></span>
            <h3 class="slot__title" data-copy="title"></h3>
            <p class="slot__summary" data-copy="summary"></p>
            <p class="slot__stack" data-copy="stack"></p>
            <span class="slot__year" data-copy="year"></span>
          </li>
        </template>
      </section>
    </main>
  </body>
</html>
```

- [ ] **Step 4: Escrever o CSS do Comp 02**

**Conceito — Arquivo editorial / Rolodex.** Papel, não tela. A página é uma folha quente com margem larga e uma coluna de medida curta, como um frontispício de revista. O hero é tipográfico puro: o nome em serifa de alto contraste com eixo óptico, sem imagem nenhuma. Os projetos são **lâminas** empilhadas com borda superior marcada e um número de ficha recuado na margem — a leitura é de índice, não de grade. A assinatura é o vermelho de arquivo usado só em etiqueta e numeração.

**Paleta (medida, passa AA):** fundo `#F2EEE6`, superfície `#FBF9F5`, tinta `#16130F` (16.00:1), tinta suave `#5A534A` (6.55:1), filete `#B9AD98`, acento `#A32114` (6.52:1).

**Tipografia:** Fraunces Variable no display (serifa com `opsz`, ganha personalidade em tamanho grande sem perder legibilidade), Instrument Sans no corpo, Geist Mono nos metadados.

```css
/* Comp 02 — Arquivo editorial / Rolodex. Autocontido. */

:root {
  --bg: #f2eee6;
  --surface: #fbf9f5;
  --ink: #16130f;
  --ink-muted: #5a534a;
  --rule: #b9ad98;
  --accent: #a32114;

  --font-display: 'Fraunces Variable', 'Fraunces', Georgia, serif;
  --font-body: 'Instrument Sans Variable', 'Instrument Sans', system-ui, sans-serif;
  --font-mono: 'Geist Mono Variable', ui-monospace, monospace;

  --gutter: clamp(20px, 5vw, 80px);
  --margin-rail: clamp(0px, 8vw, 120px);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  background: var(--bg);
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: clamp(1rem, 0.96rem + 0.2vw, 1.0625rem);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* ---- Hero: frontispício ---- */

/* Mesma regra do Comp 01: flex no mobile, grid a partir de 768px. */
.hero {
  min-height: 100svh;
  padding: var(--gutter) var(--gutter) var(--gutter)
    calc(var(--gutter) + var(--margin-rail));
  display: flex;
  flex-direction: column;
  gap: clamp(24px, 4vh, 48px);
  border-bottom: 2px solid var(--ink);
}

.hero__meta {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-muted);
}

.hero__meta--right {
  align-self: flex-end;
}

.hero__name {
  margin: auto 0;
  font-family: var(--font-display);
  font-variation-settings: 'opsz' 144, 'SOFT' 0, 'WONK' 1;
  font-weight: 600;
  font-size: clamp(2.75rem, 1.2rem + 9.5vw, 9rem);
  line-height: 0.92;
  letter-spacing: -0.025em;
  /* Medida curta deliberada: o nome quebra em duas linhas e isso é o desenho. */
  max-width: 9ch;
}

.hero__role,
.hero__statement,
.hero__location {
  margin: 0;
}

.hero__role {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
}

.hero__statement {
  max-width: 38ch;
  font-size: clamp(1.0625rem, 1rem + 0.4vw, 1.25rem);
  color: var(--ink-muted);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: baseline;
}

.hero__location {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-muted);
}

@media (min-width: 768px) {
  .hero {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: auto 1fr auto;
    column-gap: 20px;
  }

  .hero__meta--left { grid-column: 1 / span 6; }
  .hero__meta--right { grid-column: 7 / -1; }
  .hero__name { grid-column: 1 / span 7; }
  .hero__role { grid-column: 1 / span 3; align-self: end; }
  .hero__statement { grid-column: 4 / span 5; align-self: end; }
  .hero__actions { grid-column: 9 / span 2; align-self: end; }
  .hero__location { grid-column: 11 / -1; align-self: end; justify-self: end; }
}

.action {
  font-family: var(--font-body);
  font-size: 0.9375rem;
  text-decoration: none;
  padding-bottom: 2px;
}

.action--primary {
  color: var(--ink);
  border-bottom: 2px solid var(--accent);
}

.action--ghost {
  color: var(--ink-muted);
  border-bottom: 1px solid var(--rule);
}

/* ---- Work: lâminas de índice ---- */

.work {
  padding: var(--gutter) var(--gutter) var(--gutter)
    calc(var(--gutter) + var(--margin-rail));
}

.work__head {
  display: grid;
  gap: 8px;
  padding-bottom: clamp(24px, 4vh, 48px);
}

.work__label {
  margin: 0;
  font-family: var(--font-display);
  font-variation-settings: 'opsz' 48;
  font-weight: 600;
  font-size: clamp(1.5rem, 1.1rem + 1.6vw, 2.5rem);
}

.work__intro {
  margin: 0;
  max-width: 48ch;
  color: var(--ink-muted);
}

.work__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.slot {
  position: relative;
  display: grid;
  gap: 6px;
  padding: clamp(24px, 3.5vh, 40px) 0;
  border-top: 1px solid var(--rule);
}

/* O número da ficha sai para a margem — é o gesto de arquivo. */
.slot__index {
  position: absolute;
  top: clamp(26px, 3.5vh, 42px);
  left: calc(var(--margin-rail) * -1);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--accent);
}

@media (max-width: 767px) {
  .slot__index {
    position: static;
    color: var(--accent);
  }
}

.slot__type {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-muted);
}

.slot__title {
  margin: 0;
  font-family: var(--font-display);
  font-variation-settings: 'opsz' 72, 'WONK' 1;
  font-weight: 600;
  font-size: clamp(1.5rem, 1.1rem + 1.8vw, 2.75rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
}

.slot__summary {
  margin: 0;
  max-width: 50ch;
  color: var(--ink-muted);
}

.slot__stack,
.slot__year {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--ink-muted);
}

.slot__stack { margin: 0; }

@media (min-width: 768px) {
  .slot {
    grid-template-columns: minmax(0, 3fr) minmax(0, 1fr);
    grid-template-areas:
      'type    year'
      'title   title'
      'summary stack';
    column-gap: 32px;
  }

  .slot__type { grid-area: type; }
  .slot__year { grid-area: year; justify-self: end; }
  .slot__title { grid-area: title; }
  .slot__summary { grid-area: summary; }
  .slot__stack { grid-area: stack; justify-self: end; text-align: right; }
}
```

- [ ] **Step 5: Rodar a verificação**

Run: `rtk pnpm comps`
Expected: 12 testes PASS.

A armadilha provável deste comp é overflow em 390px: `--margin-rail` colapsa para `0px` no `clamp`, e `.slot__index` volta ao fluxo pela media query de `max-width: 767px`. Se sobrar overflow, é porque a margem entrou em algum lugar sem o par `clamp(0px, ...)`.

- [ ] **Step 6: Olhar nos três viewports, nos dois idiomas**

Run: `rtk pnpm dev` e abra `http://localhost:5173/design/comps/02-editorial-rolodex.html`.
"Desenvolvedor Full Stack" é bem mais longo que "Full Stack Developer" — confirme que a régua inferior não quebra feio em PT a 768px.

- [ ] **Step 7: Acrescentar ao índice**

Modify `design/comps/index.html` — acrescentar dentro do `<ul>`:

```html
      <li>
        <a href="./02-editorial-rolodex.html">
          02 — Editorial Rolodex
          <small>Arquivo editorial · Fraunces + Instrument Sans · papel quente e vermelho de arquivo</small>
        </a>
      </li>
```

- [ ] **Step 8: Commit**

```bash
rtk git add design/comps/02-editorial-rolodex.html design/comps/02-editorial-rolodex.css design/comps/checks/comps.spec.ts design/comps/index.html
rtk git commit -m "feat(comps): comp 02 arquivo editorial rolodex"
```

---

### Task 5: Comp 03 — Galeria espacial abstrata

**Files:**
- Create: `design/comps/03-spatial-gallery.html`
- Create: `design/comps/03-spatial-gallery.css`
- Modify: `design/comps/checks/comps.spec.ts` (acrescentar à lista `COMPS`)
- Modify: `design/comps/index.html` (acrescentar o item)

**Interfaces:**
- Consumes: o esqueleto de HTML da Task 3, verbatim.
- Produces: nada que tasks seguintes consumam.

- [ ] **Step 1: Registrar o comp na verificação**

Modify `design/comps/checks/comps.spec.ts`:

```ts
const COMPS = [
  '01-inspection-slot',
  '02-editorial-rolodex',
  '03-spatial-gallery',
] as const
```

- [ ] **Step 2: Rodar e confirmar que falha**

Run: `rtk pnpm comps`
Expected: 18 testes; 12 PASS, os 6 de `03` FAIL.

- [ ] **Step 3: Escrever o HTML do Comp 03**

Create `design/comps/03-spatial-gallery.html` — mesmo esqueleto, com as quatro trocas:

```html
<!doctype html>
<html lang="en" data-comp="03-spatial-gallery">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Comp 03 — Spatial Gallery</title>
    <link rel="stylesheet" href="./03-spatial-gallery.css" />
    <script type="module">
      import '@fontsource-variable/syne'
      import '@fontsource-variable/space-grotesk'
      import '@fontsource-variable/geist-mono'
    </script>
    <script type="module" src="./harness.ts"></script>
  </head>
  <body>
    <main class="comp">
      <section class="hero" data-region="hero">
        <p class="hero__meta hero__meta--left" data-copy="hero.metaLeft"></p>
        <p class="hero__meta hero__meta--right" data-copy="hero.metaRight"></p>
        <h1 class="hero__name" data-copy="person.name"></h1>
        <p class="hero__role" data-copy="person.role"></p>
        <p class="hero__statement" data-copy="hero.statement"></p>
        <nav class="hero__actions">
          <a class="action action--primary" href="#work" data-copy="hero.ctaPrimary"></a>
          <a class="action action--ghost" href="#work" data-copy="hero.ctaSecondary"></a>
        </nav>
        <p class="hero__location" data-copy="person.location"></p>
      </section>

      <section class="work" id="work" data-region="work">
        <header class="work__head">
          <h2 class="work__label" data-copy="work.label"></h2>
          <p class="work__intro" data-copy="work.intro"></p>
        </header>
        <ol class="work__list" data-work-list></ol>
        <template data-work-item>
          <li class="slot">
            <span class="slot__index" data-index></span>
            <span class="slot__type" data-copy="type"></span>
            <h3 class="slot__title" data-copy="title"></h3>
            <p class="slot__summary" data-copy="summary"></p>
            <p class="slot__stack" data-copy="stack"></p>
            <span class="slot__year" data-copy="year"></span>
          </li>
        </template>
      </section>
    </main>
  </body>
</html>
```

- [ ] **Step 4: Escrever o CSS do Comp 03**

**Conceito — Galeria espacial abstrata.** Escuridão com luz. O hero é um vazio quase total com uma única fonte de luz fria atrás do nome, criando plano de fundo e plano de frente sem cenário literal. Os projetos são **placas elevadas** em profundidade: cada uma é uma superfície com luz de borda, deslocada do alinhamento da vizinha, de modo que a lista leia como peças suspensas em sala escura e não como tabela. A assinatura é a **luz**: gradiente radial amplo, bordas que brilham de um lado só.

A profundidade aqui é estática — gradiente e deslocamento, sem `transform` animado. O que se moveria na Fase 3 vai no README.

**Paleta (medida, passa AA):** fundo `#08090B`, superfície `#121519`, tinta `#F0F2F5` (17.76:1), tinta suave `#949CA6` (7.18:1), filete `#333A43`, acento `#AFC7FF` (11.80:1).

**Tipografia:** Syne Variable no display (geométrica expressiva, extremamente "galeria" nos pesos altos), Space Grotesk no corpo, Geist Mono nos metadados.

```css
/* Comp 03 — Galeria espacial abstrata. Autocontido. */

:root {
  --bg: #08090b;
  --surface: #121519;
  --ink: #f0f2f5;
  --ink-muted: #949ca6;
  --rule: #333a43;
  --accent: #afc7ff;

  --font-display: 'Syne Variable', 'Syne', system-ui, sans-serif;
  --font-body: 'Space Grotesk Variable', 'Space Grotesk', system-ui, sans-serif;
  --font-mono: 'Geist Mono Variable', ui-monospace, monospace;

  --gutter: clamp(20px, 4vw, 72px);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  background: var(--bg);
}

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: clamp(1rem, 0.96rem + 0.2vw, 1.0625rem);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* ---- Hero: um vazio com uma fonte de luz ---- */

/* Mesma regra dos Comps 01 e 02: flex no mobile, grid a partir de 768px. */
.hero {
  position: relative;
  min-height: 100svh;
  padding: var(--gutter);
  display: flex;
  flex-direction: column;
  gap: clamp(24px, 4vh, 48px);
  isolation: isolate;
  overflow: hidden;
}

/* A luz: estática, larga, atrás de tudo. */
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(
      60% 45% at 50% 38%,
      rgb(175 199 255 / 14%) 0%,
      rgb(175 199 255 / 4%) 45%,
      transparent 72%
    );
}

.hero__meta {
  margin: 0;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-muted);
}

.hero__meta--right { align-self: flex-end; }

.hero__name {
  margin: auto 0;
  /* No flex column `align-self` é o eixo horizontal; no grid desktop o
     mesmo papel cabe a `justify-self`, declarado na media query. */
  align-self: center;
  text-align: center;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(2.5rem, 0.8rem + 10vw, 9.5rem);
  line-height: 0.95;
  letter-spacing: -0.04em;
  text-wrap: balance;
}

.hero__role,
.hero__statement,
.hero__location {
  margin: 0;
}

.hero__role {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
}

.hero__statement {
  max-width: 42ch;
  color: var(--ink-muted);
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.hero__location {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-muted);
}

@media (min-width: 768px) {
  .hero {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: auto 1fr auto;
    column-gap: 16px;
  }

  .hero__meta--left { grid-column: 1 / span 6; }
  .hero__meta--right { grid-column: 7 / -1; }
  .hero__name { grid-column: 1 / -1; justify-self: center; }
  .hero__role { grid-column: 1 / span 3; align-self: end; }
  .hero__statement { grid-column: 4 / span 5; align-self: end; }
  .hero__actions { grid-column: 9 / span 2; align-self: end; }
  .hero__location { grid-column: 11 / -1; align-self: end; justify-self: end; }
}

.action {
  display: inline-block;
  padding: 11px 20px;
  border-radius: 999px;
  font-size: 0.875rem;
  text-decoration: none;
}

.action--primary {
  background: var(--accent);
  color: #08090b;
}

.action--ghost {
  border: 1px solid var(--rule);
  color: var(--ink);
}

/* ---- Work: placas suspensas ---- */

.work {
  padding: var(--gutter);
}

.work__head {
  display: grid;
  gap: 10px;
  padding-bottom: clamp(28px, 4vh, 56px);
}

.work__label {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.5rem, 1.1rem + 1.6vw, 2.5rem);
  letter-spacing: -0.03em;
}

.work__intro {
  margin: 0;
  max-width: 50ch;
  color: var(--ink-muted);
}

.work__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: clamp(16px, 2.5vh, 28px);
}

.slot {
  display: grid;
  gap: 8px;
  padding: clamp(24px, 3.5vh, 40px);
  border-radius: 14px;
  background:
    linear-gradient(160deg, rgb(175 199 255 / 6%) 0%, transparent 42%),
    var(--surface);
  border: 1px solid var(--rule);
  /* Luz de borda de um lado só: a placa parece iluminada, não desenhada. */
  box-shadow: inset 1px 1px 0 rgb(240 242 245 / 7%);
}

/* O deslocamento alternado é o que cria profundidade sem movimento. */
@media (min-width: 768px) {
  .slot {
    width: min(100%, 52rem);
  }

  .slot:nth-child(even) {
    justify-self: end;
  }
}

.slot__index {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--accent);
}

.slot__type {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ink-muted);
}

.slot__title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.5rem, 1.1rem + 1.8vw, 2.5rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
}

.slot__summary {
  margin: 0;
  max-width: 52ch;
  color: var(--ink-muted);
}

.slot__stack,
.slot__year {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--ink-muted);
}

.slot__stack { margin: 0; }

@media (min-width: 768px) {
  .slot {
    grid-template-columns: minmax(0, 3fr) minmax(0, 1fr);
    grid-template-areas:
      'index   year'
      'type    type'
      'title   title'
      'summary stack';
    column-gap: 32px;
  }

  .slot__index { grid-area: index; }
  .slot__year { grid-area: year; justify-self: end; }
  .slot__type { grid-area: type; }
  .slot__title { grid-area: title; }
  .slot__summary { grid-area: summary; }
  .slot__stack { grid-area: stack; justify-self: end; text-align: right; }
}
```

- [ ] **Step 5: Rodar a verificação**

Run: `rtk pnpm comps`
Expected: 18 testes PASS.

Atenção ao contraste neste comp: o gradiente de `.slot` clareia o topo da placa e o axe mede contra a cor computada do fundo. Se `color-contrast` reclamar, reduza a opacidade do `linear-gradient` em vez de clarear o texto — a tinta já está em 16.32:1 sobre `--surface` e o problema é o gradiente, não a tipografia.

- [ ] **Step 6: Olhar nos três viewports, nos dois idiomas**

Run: `rtk pnpm dev` e abra `http://localhost:5173/design/comps/03-spatial-gallery.html`.
O nome centralizado com `text-wrap: balance` é o ponto frágil em 390px — confirme que "André Arcodaci" quebra em duas linhas equilibradas e que o acento do "é" não encosta na linha de cima.

- [ ] **Step 7: Acrescentar ao índice**

Modify `design/comps/index.html` — acrescentar dentro do `<ul>`:

```html
      <li>
        <a href="./03-spatial-gallery.html">
          03 — Spatial Gallery
          <small>Galeria espacial · Syne + Space Grotesk · preto profundo e luz fria</small>
        </a>
      </li>
```

- [ ] **Step 8: Commit**

```bash
rtk git add design/comps/03-spatial-gallery.html design/comps/03-spatial-gallery.css design/comps/checks/comps.spec.ts design/comps/index.html
rtk git commit -m "feat(comps): comp 03 galeria espacial abstrata"
```

---

### Task 6: Capturas e dossiê do Gate 1

**Files:**
- Create: `design/comps/checks/capture.spec.ts`
- Create: `design/comps/README.md`
- Create: `docs/gate-1/README.md`
- Create: `docs/DESIGN_DECISIONS.md`
- Verify: `.gitignore` não engole `docs/gate-1/*.png` (só modificar se engolir)

**Interfaces:**
- Consumes: os três comps das Tasks 3–5.
- Produces: `docs/gate-1/<comp>-<viewport>-<locale>.png` — as capturas que sustentam a decisão.

- [ ] **Step 1: Escrever o spec de captura**

Create `design/comps/checks/capture.spec.ts`:

```ts
import { test } from '@playwright/test'

const COMPS = [
  '01-inspection-slot',
  '02-editorial-rolodex',
  '03-spatial-gallery',
] as const

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
] as const

const LOCALES = ['en', 'pt'] as const

for (const comp of COMPS) {
  for (const viewport of VIEWPORTS) {
    for (const locale of LOCALES) {
      test(`captura ${comp} · ${viewport.name} · ${locale}`, async ({ page }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        })
        await page.goto(`/design/comps/${comp}.html?locale=${locale}&chrome=0`)
        await page.evaluate(() => document.fonts.ready.then(() => true))
        await page.screenshot({
          path: `docs/gate-1/${comp}-${viewport.name}-${locale}.png`,
          fullPage: true,
        })
      })
    }
  }
}
```

- [ ] **Step 2: Gerar as capturas**

Run: `rtk pnpm comps`
Expected: 36 testes PASS (18 de verificação + 18 de captura) e 18 PNGs em `docs/gate-1/`.

- [ ] **Step 3: Conferir que as capturas não estão ignoradas**

Run: `rtk git status --short docs/gate-1`
Expected: 18 arquivos não rastreados listados. Se nada aparecer, `.gitignore` está engolindo PNG e precisa de uma exceção `!docs/gate-1/*.png`.

- [ ] **Step 4: Escrever o README dos comps**

Create `design/comps/README.md`:

```markdown
# Comps — Fase 0 (descartável)

Três composições estáticas do primeiro viewport para decidir D1 (metáfora
visual) e D2 (paleta e tipografia). Mesma copy nos três, servida por
`content.ts`, para que a comparação isole a composição.

Esta pasta é apagada ao fim da Fase 2, junto com as `devDependencies` de fontes
perdedoras e a entrada `design/comps` em `tsconfig.app.json`.

## Como ver

```bash
pnpm dev
# http://localhost:5173/design/comps/
```

`?locale=pt` troca o idioma. `?chrome=0` esconde a barra de desenvolvimento.

## Como verificar

```bash
pnpm comps
```

Roda, para os três comps × três viewports × dois idiomas: ausência de overflow
horizontal, ausência de animação declarada, contraste WCAG AA. Também regrava
as capturas em `docs/gate-1/`.

## O que cada comp propõe

### 01 — Inspection Slot

Bancada de inspeção. Superfície escura com recortes emoldurados; o nome sangra
a moldura esquerda; os projetos são gavetas numeradas.

- **Paleta:** `#16181A` fundo · `#1F2225` superfície · `#E8E6E1` tinta ·
  `#A8A49C` tinta suave · `#4A4F55` filete · `#FF6A1F` acento
- **Tipografia:** Archivo Variable · Instrument Sans Variable · JetBrains Mono Variable
- **Na Fase 3 se moveria:** a moldura do recorte se abriria no hover de cada
  gaveta, revelando a mídia do projeto por trás; o número da gaveta deslizaria
  junto. Nada disso está implementado aqui.

### 02 — Editorial Rolodex

Arquivo editorial. Papel quente, margem larga, medida curta; hero puramente
tipográfico; projetos como lâminas de índice com o número recuado na margem.

- **Paleta:** `#F2EEE6` fundo · `#FBF9F5` superfície · `#16130F` tinta ·
  `#5A534A` tinta suave · `#B9AD98` filete · `#A32114` acento
- **Tipografia:** Fraunces Variable · Instrument Sans Variable · Geist Mono Variable
- **Na Fase 3 se moveria:** as lâminas se separariam verticalmente na entrada em
  viewport, como fichas folheadas; o eixo óptico da Fraunces mudaria com o
  tamanho, não com o tempo.

### 03 — Spatial Gallery

Galeria espacial. Escuridão com uma fonte de luz fria atrás do nome; projetos
como placas suspensas, deslocadas alternadamente, com luz de borda.

- **Paleta:** `#08090B` fundo · `#121519` superfície · `#F0F2F5` tinta ·
  `#949CA6` tinta suave · `#333A43` filete · `#AFC7FF` acento
- **Tipografia:** Syne Variable · Space Grotesk Variable · Geist Mono Variable
- **Na Fase 3 se moveria:** a fonte de luz seguiria o cursor em deslocamento
  curto e amortecido; as placas teriam parallax leve entre si. Ambos desligados
  em `prefers-reduced-motion` e em touch.

## Contraste

Todos os pares de texto foram medidos e passam WCAG AA (≥ 4.5:1 para corpo).
Cor nova só entra depois de medida — `pnpm comps` falha se não passar.
```

- [ ] **Step 5: Escrever o dossiê do Gate 1**

Create `docs/gate-1/README.md`:

```markdown
# Gate 1 — Decisão de direção visual

Três composições estáticas do primeiro viewport, mesma copy, para decidir
**D1** (metáfora visual) e **D2** (paleta e tipografia), conforme
`docs/SPEC.md` §3.1 e `docs/superpowers/specs/2026-10-26-portfolio-visual-redesign-design.md`.

Nenhum arquivo de `src/` foi tocado. A escolha abre a Fase 2.

## Como avaliar

Ao vivo é melhor que a captura:

```bash
pnpm dev
# http://localhost:5173/design/comps/
```

As capturas abaixo são o registro da decisão, em `<comp>-<viewport>-<locale>.png`.

## Critérios

1. **Legibilidade antes de efeito.** O nome, a função e o caminho para os
   trabalhos se leem em segundos, sem gesto oculto?
2. **Originalidade.** Parece autoral ou parece um template reconhecível?
3. **Continuidade.** A passagem do hero para a lista de trabalhos é do mesmo
   mundo, ou são duas páginas coladas?
4. **Mobile.** 390px tem composição própria ou é a desktop espremida?
5. **Português.** A tipografia display aguenta "Desenvolvedor Full Stack" e os
   acentos sem quebrar?
6. **Futuro.** A linguagem aguenta oito projetos, ou só funciona com quatro?

## Comparação

| | 01 Inspection Slot | 02 Editorial Rolodex | 03 Spatial Gallery |
|---|---|---|---|
| Base | Escura, metálica | Clara, papel | Escura, luz |
| Display | Archivo | Fraunces | Syne |
| Acento | Âmbar industrial `#FF6A1F` | Vermelho de arquivo `#A32114` | Luz fria `#AFC7FF` |
| Depende de mídia | Média — as molduras pedem imagem | Baixa — é tipográfico | Alta — as placas pedem mídia |
| Escala com muitos projetos | Boa | Muito boa | Média |
| Risco | Virar "industrial genérico" | Parecer sóbrio demais, perto do atual | Luz e profundidade custam caro em motion |

## Capturas

As 18 imagens desta pasta são geradas por `pnpm comps` e regravadas a cada
execução. Não edite à mão.

## Decisão

Registrar em `docs/DESIGN_DECISIONS.md` assim que o dono escolher.
```

- [ ] **Step 6: Criar o registro de decisões**

Create `docs/DESIGN_DECISIONS.md`:

```markdown
# Decisões de design

Registro das escolhas visuais e seus motivos. Uma entrada por decisão,
incluindo as alternativas rejeitadas — rejeitada sem motivo registrado volta
a ser proposta seis meses depois.

## D1 — Metáfora visual · D2 — Paleta e tipografia

- **Status:** aberta, aguardando o Gate 1
- **Candidatas:** 01 Inspection Slot · 02 Editorial Rolodex · 03 Spatial Gallery
- **Evidência:** `docs/gate-1/` (18 capturas) e os comps ao vivo em
  `design/comps/`
- **Critérios:** `docs/gate-1/README.md`

Ao decidir, substituir esta seção por: a escolhida, o motivo, as rejeitadas com
o motivo de cada uma, e os valores de paleta e tipografia que vão para
`src/styles/tokens.css` na Fase 2.
```

- [ ] **Step 7: Rodar a suíte inteira**

Run: `rtk pnpm typecheck && rtk pnpm lint && rtk pnpm test && rtk pnpm comps`
Expected: tudo PASS.

- [ ] **Step 8: Commit**

```bash
rtk git add design/comps/checks/capture.spec.ts design/comps/README.md docs/gate-1 docs/DESIGN_DECISIONS.md
rtk git commit -m "feat(comps): capturas e dossie do gate 1"
```

- [ ] **Step 9: Entregar o Gate 1**

Apresentar ao dono: o índice ao vivo (`pnpm dev` → `/design/comps/`), o dossiê
`docs/gate-1/README.md` e as capturas. **Parar aqui.** A Fase 2 não começa sem
a escolha registrada em `docs/DESIGN_DECISIONS.md`.

---

## Notas de execução

**Se um comp não convencer nenhum dos três**, isso é um resultado válido do
Gate 1, não uma falha do plano. A spec prevê uma segunda rodada com conceitos
ajustados antes de qualquer linha de `src/`.

**O que este plano deliberadamente não faz:** nenhum motion, nenhuma mídia de
projeto real, nenhuma navegação entre páginas, nenhum token em `src/`. Tudo
isso é Fase 2 ou posterior, e depende da escolha que este plano existe para
possibilitar.
