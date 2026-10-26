# Fase 2 — Fundação (Editorial Rolodex) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever `src/` sobre a direção 02 — Editorial Rolodex: home estática na sequência de `SPEC.md` §4.2, case studies em `/work/:slug`, conteúdo tipado em PT e EN com rotas `/` e `/pt`, trava de mock no build, e tudo funcionando sem motion (Gate 2).

**Architecture:** Uma camada de conteúdo tipada por locale (`src/content/`), carregável pelo Node para que a trava de mock leia a mesma árvore que o app. Rotas do React Router em dois subtrees idênticos (`/` e `/pt`) sob um `LocaleLayout` que publica locale e conteúdo por contexto. Seções da home recebem conteúdo por prop e não importam umas às outras; tokens e CSS Modules portam os valores medidos do comp 02.

**Tech Stack:** React 19, React Router 8 (data router), Vite 8, TypeScript 5.9, CSS Modules, Vitest 5 + Testing Library + jsdom, Playwright 1.64 + `@axe-core/playwright`, Node 24 (executa `.ts` nativamente), `@fontsource-variable/{fraunces,instrument-sans,geist-mono}`.

**Spec:** `docs/superpowers/specs/2026-10-26-portfolio-visual-redesign-design.md` (§3 Fase 2, §4–§8) e `docs/SPEC.md` (§3.3, §4, §6). Direção e valores: `docs/DESIGN_DECISIONS.md` e `design/comps/02-editorial-rolodex.{html,css}`.

## Global Constraints

- Trabalhar na branch `feat/fase-2-fundacao`, criada a partir de `main`.
- **Nenhuma `animation` nem `transition` em CSS ou JS nesta fase.** Motion é a Fase 3. `scripts/no-motion.test.ts` (Task 3) e o e2e de motion (Task 8) falham se aparecer.
- **Nenhum componente contém string voltada ao usuário.** Toda copy vem de `src/content/<locale>/`.
- **Os dois locales têm o mesmo shape**, e o teste de paridade (Task 2) falha quando não têm.
- **Integridade (`SPEC.md` §4.3):** `type: 'concept'` sempre exibe o rótulo de estudo conceitual; nenhuma métrica ou resultado inventado, nem em mock; repositório privado não é linkado (Map Areas não tem link de repo — decisão do Gate E).
- **Copy real em PT é tradução da copy EN verificada, sem afirmação nova.** Listar no relatório final da fase para revisão do dono.
- **Todo item inventado carrega `mock: true`.** `pnpm build` falha enquanto houver um; `pnpm build:preview` (ou `ALLOW_MOCK=1 pnpm build` no bash) passa.
- **Árvore de conteúdo carregável pelo Node:** em `src/content/**` e `src/lib/mock.ts`, imports relativos com extensão `.ts` explícita, tipos só por `import type`, nada de alias `@/`, nada de import de CSS/DOM.
- **Valores visuais vêm do comp 02, medidos:** fundo `#E8DCC0`, superfície `#F2EAD6`, tinta `#16130F`, tinta suave `#5A534A`, filete `#A89771`, acento `#A32114`. Cor nova só entra com contraste medido ≥ 4.5:1 sobre fundo e superfície.
- **Fraunces completa (decisão do dono, 2026-10-26):** importar `@fontsource-variable/fraunces/full.css`, para que `opsz`, `SOFT` e `WONK` tenham efeito. O comp carregava só o eixo de peso.
- **Viewports:** 1440×900, 768×1024, 390×844, nos dois idiomas.
- **Verificação sem `rtk`:** `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm test:e2e`, sem prefixo, lendo o exit code com `; echo "exit=$?"`. Nunca `rtk pnpm typecheck`. Toda verificação nova é vista falhando uma vez antes de o verde valer.
- Commits em português, `tipo: descrição`, como o histórico.

## Review Focus

1. **Primeiro viewport em 390×844 e 768×1024 com a barra superior somada ao hero:** os dois CTAs do hero precisam estar inteiros na tela sem rolar. Teste na Task 4.
2. **PT longo em 390px** ("Desenvolvedor Full Stack", "Trabalhos selecionados", títulos e stacks dos projetos, case study): nenhum overflow horizontal no documento em nenhuma rota. Teste na Task 8.
3. **Carregar direto ou recarregar `/pt/work/:slug`, `/pt/` com barra final e `/pt/rota-inexistente`:** página em português, `lang="pt-BR"`, nunca a versão EN nem a 404 EN. Testes nas Tasks 3 e 7.
4. **Trocar de idioma num case study, numa 404 ou com hash na URL:** a rota equivalente no outro idioma, mesmo slug e mesmo hash. Teste unitário na Task 1, e2e na Task 7.
5. **Voltar do case study para `#work`:** a home abre na lista de trabalhos com o foco nela, não no topo. Teste na Task 7.

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `src/content/types.ts` | `Locale`, `Project`, `SiteContent`, `LocaleContent` e tipos auxiliares |
| `src/content/publication.ts` | Regras de publicação: o que é listado, o que tem link, o que a rota mostra |
| `src/content/{en,pt}/site.ts` | Copy do site por locale |
| `src/content/{en,pt}/projects/*.ts` + `index.ts` | Um arquivo por projeto; `index.ts` define a ordem |
| `src/content/index.ts` | `contentByLocale`, `getContent(locale)` |
| `src/lib/locale.ts` | Caminhos por locale, troca de idioma, `lang` do HTML |
| `src/lib/mock.ts` | `findMockPaths` — varredura da árvore |
| `scripts/assert-no-mock.ts` | Trava de build |
| `scripts/no-motion.test.ts` | Nenhum CSS de `src/` declara `animation`/`transition` |
| `src/styles/tokens.css`, `global.css` | Tokens do comp 02; reset, base, foco, utilitários |
| `src/app/` | `App`, `routes`, `LocaleLayout`, `LocaleContext`, `ScrollManager`, rotas `HomeRoute`, `CaseStudyRoute`, `NotFoundRoute` |
| `src/components/` | `SkipLink`, `Masthead`, `Sheet`, `SectionHead`, `ExternalLink`, `ProjectSlip` |
| `src/sections/` | `Hero`, `Release`, `Work`, `Approach`, `About`, `Interests`, `Contact` — cada um `X.tsx`, `X.module.css`, `X.test.tsx` |
| `e2e/*.spec.ts` | routing, journey, keyboard, responsive, motion, a11y |
| `e2e/gate-2.capture.ts` | Capturas do Gate 2 em `docs/gate-2/` (projeto Playwright separado) |

---

### Task 1: Terreno limpo, tipos de conteúdo e lógica de locale/publicação

**Files:**
- Delete: tudo em `src/` exceto `src/test/setup.ts`; `e2e/*.spec.ts`; `scripts/m3-runtime-validate.mjs`
- Modify: `package.json` (remover `@fontsource-variable/bricolage-grotesque`, `@fontsource-variable/source-sans-3`, `@fontsource/ibm-plex-mono` de `dependencies`)
- Create: `src/content/types.ts`, `src/lib/locale.ts`, `src/content/publication.ts`, `src/lib/mock.ts`
- Test: `src/lib/locale.test.ts`, `src/content/publication.test.ts`, `src/lib/mock.test.ts`

**Interfaces:**
- Produces (em `src/content/types.ts`, exatamente):

```ts
export type Locale = 'en' | 'pt'
export type ProjectType = 'verified' | 'concept'
export type ProjectStatus = 'draft' | 'preview' | 'published'
export type ProjectLinkKind = 'live' | 'repo'
export type HomeSectionId = 'work' | 'approach' | 'about' | 'interests' | 'contact'

export interface ProjectLink { kind: ProjectLinkKind; href: string }
export interface ProjectCover { src: string; alt: string; width: number; height: number }
/** Ao menos um de `paragraphs`/`items` é não vazio. */
export interface CaseSection { heading: string; paragraphs?: string[]; items?: string[] }

export interface Project {
  slug: string
  title: string
  type: ProjectType
  status: ProjectStatus
  /** Dado inventado para exercitar layout. Bloqueia `pnpm build`. */
  mock?: true
  summary: string
  role: string
  /** Texto livre: '2025' ou '2025–2026'. */
  year: string
  stack: string[]
  cover?: ProjectCover
  sections: CaseSection[]
  links: ProjectLink[]
}

export interface ApproachItem { title: string; body: string; mock?: true }
export interface ContactChannel { id: 'github' | 'linkedin'; label: string; href: string }

export interface SiteContent {
  meta: { homeTitle: string; titleSuffix: string }
  shell: {
    skipToContent: string
    homeMark: string
    /** Nome do *outro* idioma, escrito nele: 'Português' no site EN, 'English' no PT. */
    localeSwitch: string
    footerNote: string
  }
  person: { name: string; role: string; location: string }
  hero: { statement: string; ctaPrimary: string; ctaSecondary: string; metaLeft: string; metaRight: string }
  release: { label: string; entries: Record<HomeSectionId, string> }
  projectType: Record<ProjectType, string>
  links: { labels: Record<ProjectLinkKind, string>; externalHint: string }
  work: { label: string; intro: string; previewNote: string }
  approach: { label: string; intro: string; items: ApproachItem[] }
  about: { label: string; lead: string; body: string; stackLabel: string; stack: string[] }
  interests: { label: string; items: string[] }
  contact: { label: string; lead: string; channels: ContactChannel[] }
  caseStudy: {
    backToWork: string
    roleLabel: string
    yearLabel: string
    stackLabel: string
    linksLabel: string
    previewNotice: string
    conceptNotice: string
  }
  notFound: { title: string; body: string; homeLabel: string }
}

export interface LocaleContent { site: SiteContent; projects: Project[] }
```

- Produces (em `src/lib/locale.ts`):
  - `locales: readonly Locale[]` = `['en', 'pt']`
  - `htmlLang(locale: Locale): 'en' | 'pt-BR'`
  - `localePath(locale: Locale, path: string): string` — `path` começa com `/` e pode carregar `#hash`
  - `parseLocalePath(pathname: string): { locale: Locale; path: string }`
  - `switchLocalePath(pathname: string, hash: string, target: Locale): string`
- Produces (em `src/content/publication.ts`):
  - `isValidSlug(slug: string): boolean` — `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`
  - `listProjects(projects: Project[]): Project[]` — remove `draft`, preserva a ordem
  - `caseStudyAccess(project: Project | undefined): 'full' | 'preview' | 'none'`
  - `caseStudyHref(locale: Locale, project: Project): string | null`
  - `findProject(projects: Project[], slug: string | undefined): Project | undefined`
- Produces (em `src/lib/mock.ts`): `findMockPaths(value: unknown, path?: string): string[]`

- [ ] **Step 1: Criar a branch e limpar o terreno**

```bash
git switch -c feat/fase-2-fundacao
```

Apagar os arquivos listados em **Delete** e as três dependências em **Modify**; `pnpm install`. O build fica quebrado até a Task 3 (não há `src/main.tsx`); `typecheck`, `lint` e `test` precisam passar ao fim desta task.

- [ ] **Step 2: Escrever os testes que falham**

`src/lib/locale.test.ts` — tabelas com `it.each`:

| chamada | esperado |
|---|---|
| `localePath('en', '/')` | `'/'` |
| `localePath('pt', '/')` | `'/pt'` |
| `localePath('pt', '/work/map-areas')` | `'/pt/work/map-areas'` |
| `localePath('pt', '/#work')` | `'/pt#work'` |
| `parseLocalePath('/pt')` | `{ locale: 'pt', path: '/' }` |
| `parseLocalePath('/pt/')` | `{ locale: 'pt', path: '/' }` |
| `parseLocalePath('/pt/work/x')` | `{ locale: 'pt', path: '/work/x' }` |
| `parseLocalePath('/ptx')` | `{ locale: 'en', path: '/ptx' }` |
| `parseLocalePath('/work/x')` | `{ locale: 'en', path: '/work/x' }` |
| `switchLocalePath('/work/x', '', 'pt')` | `'/pt/work/x'` |
| `switchLocalePath('/pt/work/x', '', 'en')` | `'/work/x'` |
| `switchLocalePath('/pt', '#work', 'en')` | `'/#work'` |
| `switchLocalePath('/nao-existe', '', 'pt')` | `'/pt/nao-existe'` |
| `htmlLang('pt')` | `'pt-BR'` |

`src/content/publication.test.ts` — com uma fábrica `project(overrides)` local ao teste:
- `listProjects` remove `draft` e mantém `preview` e `published` na ordem de entrada.
- `caseStudyAccess`: `published` → `'full'`; `preview` → `'preview'`; `draft` → `'none'`; `undefined` → `'none'`; `published` com slug `'Bad Slug'` → `'none'`.
- `caseStudyHref('pt', published)` → `'/pt/work/<slug>'`; `preview` → `null`; `draft` → `null`; slug inválido → `null`.
- `findProject(projects, '../etc')` → `undefined`; `findProject(projects, undefined)` → `undefined`.

`src/lib/mock.test.ts`:
- `findMockPaths({ en: { projects: [{ slug: 'a' }, { slug: 'b', mock: true }] } })` → `['en.projects[1]']`
- objeto aninhado com `mock: true` dentro de `approach.items[0]` → caminho `'…approach.items[0]'`
- `mock: false` ou `mock: 'true'` não contam
- árvore sem mock → `[]`

- [ ] **Step 3: Rodar e ver falhar**

Run: `pnpm test; echo "exit=$?"`
Expected: falha por módulos inexistentes, `exit=1`.

- [ ] **Step 4: Implementar `types.ts`, `locale.ts`, `publication.ts` e `mock.ts`**

Respeitar a regra de carregamento pelo Node (Global Constraints) em `types.ts`, `publication.ts` e `mock.ts`. `findMockPaths` percorre objetos e arrays em profundidade e registra o caminho de todo objeto com `mock === true`, sem descer dentro dele.

- [ ] **Step 5: Rodar e ver passar**

Run: `pnpm typecheck; echo "exit=$?"` e `pnpm lint; echo "exit=$?"` e `pnpm test; echo "exit=$?"`
Expected: `exit=0` nas três.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: tipos de conteudo, caminhos por locale e regras de publicacao"
```

---

### Task 2: Conteúdo PT/EN, paridade e trava de mock

**Files:**
- Create: `src/content/en/site.ts`, `src/content/pt/site.ts`, `src/content/{en,pt}/projects/{map-areas,token-killer,atlas-ledger,field-notes,index}.ts`, `src/content/index.ts`, `scripts/assert-no-mock.ts`, `scripts/fixtures/clean-content.ts`, `scripts/fixtures/mocked-content.ts`
- Modify: `package.json` (scripts), `tsconfig.node.json` (`include` ganha `"scripts/**/*.ts"`)
- Test: `src/content/content.test.ts`, `scripts/assert-no-mock.test.ts`

**Interfaces:**
- Consumes: tipos da Task 1; `findMockPaths`.
- Produces: `contentByLocale: Record<Locale, LocaleContent>` e `getContent(locale: Locale): LocaleContent` em `src/content/index.ts`. Scripts `build` e `build:preview` em `package.json`.

**Conteúdo:**

- `en/site.ts`: copy do hero, `work.label/intro` e `projectType` vêm de `design/comps/content.ts` (`concept` → `'Concept study'`, `verified` → `'Verified'`). `about` e os links de contato vêm do `src/content/en/site.ts` apagado na Task 1 (recuperar com `git show main:src/content/en/site.ts`): `about.lead`, `about.body`, `about.stack`; GitHub `https://github.com/decoarc` e LinkedIn `https://linkedin.com/in/andrearcodaci`. Sem e-mail (não há e-mail verificado). Sem Instagram.
- `interests.items`: `['Games', 'Drawing', 'Reading', 'Traveling']` / `['Games', 'Desenho', 'Leitura', 'Viagens']` (`SPEC.md` §4.2).
- `approach.items`: três itens, **todos `mock: true`** — não há copy real de abordagem ainda.
- `work.intro` muda de "Four entries…" para não citar contagem: a lista vai variar de 2 a 8.
- `meta.homeTitle`: `'André Arcodaci — Full Stack Developer'` / `'André Arcodaci — Desenvolvedor Full Stack'`; `meta.titleSuffix`: `' — André Arcodaci'`.
- `release.entries`: `Selected work / Approach / About / Interests / Contact` e `Trabalhos selecionados / Abordagem / Sobre / Interesses / Contato`.
- `map-areas` (EN): portar do `map-areas.ts` apagado (recuperar de `main`). `type: 'verified'`, `status: 'preview'`, sem `mock`, `year: '2025–2026'`, `links: [{ kind: 'live', href: 'https://geo-areas-php.onrender.com/' }]`, `cover` = `/images/projects/map-areas.webp`, 1200×900, alt existente. `problem`, `responsibilities`, `implementation`, `challenges` e `outcomes` viram cinco `sections`, com os headings do antigo `caseStudy` (`Problem and motivation`, `Role and contributions`, `Engineering decisions`, `Technical challenges`, `Outcomes and current status`). `summary` = antigo `tagline`; `role` = `'Solo developer'`.
- `map-areas` (PT): tradução fiel do EN.
- `token-killer`, `atlas-ledger`, `field-notes`: título, ano, summary e stack de `design/comps/content.ts` (stack vira `string[]`); `type: 'concept'`, `status: 'published'`, `mock: true`; 3 a 5 `sections` cada, sem número que pareça métrica.
- Ordem em `projects/index.ts`: `map-areas`, `token-killer`, `atlas-ledger`, `field-notes`.

- [ ] **Step 1: Escrever os testes que falham**

`src/content/content.test.ts`:
- `shapeOf(contentByLocale.en)` igual a `shapeOf(contentByLocale.pt)`, onde `shapeOf` lista os caminhos de folha (arrays por índice). A mensagem de falha mostra os caminhos que sobram em cada lado.
- Nenhuma folha string vazia ou só espaço, nos dois locales.
- Mesmos slugs, na mesma ordem, nos dois locales; todos passam em `isValidSlug`; nenhum slug repetido.
- Para cada projeto: `sections.length >= 1`, e cada seção tem `paragraphs` ou `items` não vazio.
- Nenhum projeto `verified` tem `mock: true` — dado inventado nunca se apresenta como trabalho verificado.
- `links` não contém `kind: 'repo'` para `map-areas`.
- `getContent('pt').site.person.role === 'Desenvolvedor Full Stack'`.

`scripts/assert-no-mock.test.ts` (`// @vitest-environment node`), rodando o script com `spawnSync(process.execPath, ['scripts/assert-no-mock.ts', <fixture>])`:
- fixture limpa → status 0.
- fixture com mock → status 1, e o stderr contém `pt.projects[0]`.
- fixture com mock e `env: { ...process.env, ALLOW_MOCK: '1' }` → status 0, stderr avisa que o mock foi permitido.
- fixture com mock e argumento `--allow-mock` → status 0.

As fixtures exportam `contentByLocale` com o mesmo nome do módulo real; a de mock tem um único projeto `mock: true` em `pt.projects[0]`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm test; echo "exit=$?"`
Expected: `exit=1`.

- [ ] **Step 3: Escrever o conteúdo e `src/content/index.ts`**

- [ ] **Step 4: Implementar `scripts/assert-no-mock.ts`**

Uso: `node scripts/assert-no-mock.ts [caminho-do-modulo] [--allow-mock]`. Padrão do módulo: `src/content/index.ts`, resolvido a partir do cwd e importado com `import(pathToFileURL(...).href)`. Lê `contentByLocale`, chama `findMockPaths`, imprime cada caminho em stderr. Sai com 1 se houver mock, salvo `ALLOW_MOCK === '1'` ou `--allow-mock`, que imprimem o aviso e saem com 0.

- [ ] **Step 5: Ligar a trava aos scripts**

Em `package.json`:

```json
"build": "node scripts/assert-no-mock.ts && tsc -b && vite build",
"build:preview": "node scripts/assert-no-mock.ts --allow-mock && tsc -b && vite build",
```

A trava fica dentro de `build`, não em `prebuild`: o hook `pre*` depende de configuração do pnpm e de como o host de deploy chama o build; o efeito pedido pelo R7 — o build falha — é o mesmo. Registrar o desvio na Task 9.

- [ ] **Step 6: Rodar e ver passar**

Run: `pnpm typecheck; echo "exit=$?"`, `pnpm lint; echo "exit=$?"`, `pnpm test; echo "exit=$?"`
Expected: `exit=0`.

Run: `node scripts/assert-no-mock.ts; echo "exit=$?"`
Expected: lista `en.site.approach.items[0]`…, `en.projects[1]`… e `exit=1` — a trava vista falhando contra a árvore real.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: conteudo pt/en com paridade e trava de mock no build"
```

---

### Task 3: Tokens, fontes, shell, rotas por locale e 404

**Files:**
- Create: `src/main.tsx`, `src/styles/tokens.css`, `src/styles/global.css`, `src/app/App.tsx`, `src/app/routes.tsx`, `src/app/LocaleContext.ts`, `src/app/LocaleLayout.tsx`, `src/app/LocaleLayout.module.css`, `src/app/ScrollManager.tsx`, `src/app/HomeRoute.tsx`, `src/app/CaseStudyRoute.tsx` (stub que só resolve acesso e cai na 404; corpo na Task 7), `src/app/NotFoundRoute.tsx`, `src/app/NotFoundRoute.module.css`, `src/components/SkipLink/*`, `src/components/Masthead/*`, `src/components/Sheet/*`, `scripts/no-motion.test.ts`, `e2e/routing.spec.ts`
- Modify: `package.json` (mover `@fontsource-variable/fraunces`, `instrument-sans`, `geist-mono` de `devDependencies` para `dependencies`), `playwright.config.ts`, `index.html` (remover o script que adiciona `.js`; `lang="en"` fica como padrão)
- Test: `src/app/routes.test.tsx`, `scripts/no-motion.test.ts`, `e2e/routing.spec.ts`

**Interfaces:**
- Consumes: `getContent`, `parseLocalePath`, `switchLocalePath`, `localePath`, `htmlLang`, `caseStudyAccess`, `findProject`.
- Produces:
  - `createRoutes(): RouteObject[]` em `src/app/routes.tsx` — dois subtrees, `path: '/pt'` com `<LocaleLayout locale="pt" />` e `path: '/'` com `<LocaleLayout locale="en" />`, cada um com filhos `{ index: true }` → `HomeRoute`, `work/:slug` → `CaseStudyRoute`, `*` → `NotFoundRoute`.
  - `useLocale(): Locale` e `useContent(): LocaleContent` em `src/app/LocaleContext.ts`.
  - `Sheet({ tone, id, labelledBy, children, className? })` — `tone: 'cover' | 'sheet'`; renderiza `<section>` com o padding de gutter + trilho de margem; `cover` usa `--bg`, `sheet` usa `--surface`.
  - `main` com `id="main"` e `tabIndex={-1}`, alvo do skip link e do `ScrollManager`.

**Tokens (`src/styles/tokens.css`):** as seis cores com os nomes do comp (`--bg`, `--surface`, `--ink`, `--ink-muted`, `--rule`, `--accent`); `--font-display`, `--font-body`, `--font-mono` como no comp; `--gutter: clamp(20px, 5vw, 80px)`; `--margin-rail: clamp(0px, 8vw, 120px)`; `--masthead-h: 3rem`; escala: `--text-display: clamp(2.75rem, 1.2rem + 9.5vw, 9rem)`, `--text-title: clamp(1.5rem, 1.1rem + 1.8vw, 2.75rem)`, `--text-heading: clamp(1.5rem, 1.1rem + 1.6vw, 2.5rem)`, `--text-lead: clamp(1.0625rem, 1rem + 0.4vw, 1.25rem)`, `--text-body: clamp(1rem, 0.96rem + 0.2vw, 1.0625rem)`, `--text-meta: 0.75rem`, `--text-micro: 0.6875rem`; `--track-meta: 0.1em`, `--track-label: 0.14em`; eixos: `--fraunces-display: 'opsz' 144, 'SOFT' 0, 'WONK' 1`, `--fraunces-title: 'opsz' 72, 'WONK' 1`, `--fraunces-heading: 'opsz' 48`.

**Global (`src/styles/global.css`):** `box-sizing`, `html`/`body` como no comp; `:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px }`; `.visually-hidden`. Sem `scroll-behavior: smooth`.

**Masthead:** `<header>` de altura `--masthead-h`, fundo `--bg`, texto mono `--text-meta`. À esquerda, `shell.homeMark` como link para a home do locale; à direita, o link de idioma: texto `shell.localeSwitch`, `href` de `switchLocalePath`, `hrefLang` e `lang` do alvo. **Sem menu de seções** — o índice da home é o `Release` (Task 4).

**ScrollManager:** ao mudar `pathname`/`hash`: com hash, `scrollIntoView({ block: 'start' })` no alvo, `tabindex="-1"` se faltar, `focus({ preventScroll: true })`; sem hash e navegação ≠ `POP`, `window.scrollTo(0, 0)` e foco em `#main`. Nunca `behavior: 'smooth'`.

**Títulos e idioma:** `LocaleLayout` põe `document.documentElement.lang = htmlLang(locale)` num efeito. Cada rota renderiza `<title>` do React 19: home `meta.homeTitle`; 404 `notFound.title + meta.titleSuffix`.

**Playwright:** `webServer.command` passa a `pnpm build:preview && pnpm preview --host 127.0.0.1 --port 4173`. Dois projetos: `{ name: 'chromium', testMatch: /.*\.spec\.ts/ }` e `{ name: 'capture', testMatch: /.*\.capture\.ts/ }`, ambos `Desktop Chrome`. Scripts: `"test:e2e": "playwright test --project=chromium"`, `"capture": "playwright test --project=capture"`.

- [ ] **Step 1: Escrever os testes que falham**

`scripts/no-motion.test.ts` (`// @vitest-environment node`): lê todo `src/**/*.css` e falha se algum casar `/(^|[\s;{])(-(webkit|moz|o|ms)-)?(animation|transition)(-[a-z-]+)?\s*:/m`, listando arquivo e linha. Antes de aceitar o verde, criar um CSS temporário com `transition: opacity 1s` e ver falhar.

`src/app/routes.test.tsx` — `createMemoryRouter(createRoutes(), { initialEntries: [url] })` dentro de `RouterProvider`:
- `'/'` → `document.documentElement.lang === 'en'`, `document.title === 'André Arcodaci — Full Stack Developer'`.
- `'/pt'` e `'/pt/'` → `lang === 'pt-BR'`.
- `'/rota/qualquer'` → heading da 404 em EN; `'/pt/qualquer'` → heading da 404 em PT.
- `'/work/nao-existe'` → 404 EN.
- o link de idioma em `'/work/nao-existe'` aponta para `'/pt/work/nao-existe'`.
- o primeiro link da página é o skip link e aponta para `#main`.

`e2e/routing.spec.ts`:
- `page.goto('/pt/')` direto → `html[lang="pt-BR"]`.
- `page.goto('/pt/rota-inexistente')` direto → 404 em PT, com link para `/pt`.
- recarregar `/pt` mantém PT.

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm test; echo "exit=$?"`
Expected: `exit=1`.

- [ ] **Step 3: Implementar tokens, global, `main.tsx` e o shell**

`main.tsx` importa `@fontsource-variable/fraunces/full.css`, `@fontsource-variable/instrument-sans`, `@fontsource-variable/geist-mono`, depois `tokens.css` e `global.css`. `HomeRoute` nesta task renderiza só o `<title>` — as seções entram nas Tasks 4 a 6.

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm typecheck; echo "exit=$?"`, `pnpm lint; echo "exit=$?"`, `pnpm test; echo "exit=$?"`, `pnpm test:e2e; echo "exit=$?"`
Expected: `exit=0` em todos.

Run: `pnpm build; echo "exit=$?"`
Expected: a trava lista os mocks e `exit=1`. Confirma que o build estrito falha enquanto há mock.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: shell por locale, rotas pt/en, tokens do comp 02 e 404"
```

---

### Task 4: Hero e Release — e aprovação da Fraunces completa

**Files:**
- Create: `src/sections/Hero/{Hero.tsx,Hero.module.css,Hero.test.tsx,index.ts}`, `src/sections/Release/{Release.tsx,Release.module.css,Release.test.tsx,index.ts}`, `e2e/gate-2.capture.ts`, `e2e/first-viewport.spec.ts`
- Modify: `src/app/HomeRoute.tsx`

**Interfaces:**
- Consumes: `Sheet`, `SiteContent['person']`, `SiteContent['hero']`, `SiteContent['release']`.
- Produces:
  - `Hero({ person, copy }: { person: SiteContent['person']; copy: SiteContent['hero'] })` — `Sheet tone="cover"`; CTAs `href="#work"` e `href="#contact"`.
  - `Release({ copy, sections }: { copy: SiteContent['release']; sections: HomeSectionId[] })` — `<nav aria-label={copy.label}>` com `<ol>`; cada item é link `#<id>` com número de dois dígitos (`01`…) e rótulo `copy.entries[id]`. Recebe só as seções que a home de fato renderiza.
  - `homeSections(site: SiteContent): HomeSectionId[]` em `src/app/homeSections.ts` (fora do arquivo de componente, por causa do `react-refresh/only-export-components`), com teste em `src/app/homeSections.test.ts` — ordem `work, approach, about, interests, contact`, omitindo `interests` quando `items` está vazio. O número de cada seção é a sua posição nesta lista mais um, e é o mesmo no `Release` e no `SectionHead` (Task 5).

**Hero:** portar `.hero*` do comp 02 com tokens, inclusive as faixas 768–1199 e ≥1200 e a regra de flex abaixo de 768. Mudanças: `min-height: calc(100svh - var(--masthead-h))`; o bloco de CTAs é `<div>`, não `<nav>`; `.hero__name` usa `font-variation-settings: var(--fraunces-display)`.

**Release:** é a virada de página do arquivo — a primeira coisa na folha `--surface`, logo abaixo do filete de 2px do hero: o índice numerado das seções, em mono, número em `--accent` no trilho de margem como o `.slot__index` do comp. Abaixo de 768px o número volta para o fluxo.

- [ ] **Step 1: Escrever os testes que falham**

`Hero.test.tsx`: `h1` com `person.name`; função e statement visíveis; dois links com os rótulos dos CTAs e `href` `#work` e `#contact`.

`Release.test.tsx`: com `sections = ['work', 'about', 'contact']`, três links `#work`, `#about`, `#contact`, numerados `01`, `02`, `03`; `nav` com nome acessível `copy.label`.

`homeSections.test.ts`: com o conteúdo EN → `['work', 'approach', 'about', 'interests', 'contact']`; com `interests.items = []` → sem `'interests'`.

`e2e/first-viewport.spec.ts`: para 390×844 e 768×1024, em `/` e `/pt`, o `boundingBox()` dos dois CTAs tem `y >= 0` e `y + height <= altura do viewport`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm test; echo "exit=$?"`
Expected: `exit=1`.

- [ ] **Step 3: Implementar `Hero`, `Release` e compor em `HomeRoute`**

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm typecheck; echo "exit=$?"`, `pnpm lint; echo "exit=$?"`, `pnpm test; echo "exit=$?"`, `pnpm test:e2e; echo "exit=$?"`
Expected: `exit=0`.

- [ ] **Step 5: Capturar e parar para aprovação do dono**

`e2e/gate-2.capture.ts`: para cada viewport (`desktop` 1440×900, `tablet` 768×1024, `mobile` 390×844) e locale, espera `document.fonts.ready` e grava `docs/gate-2/home-<viewport>-<locale>.png` com `fullPage: false`. Caminho ancorado em `testInfo.project.testDir`, como em `design/comps/checks/capture.spec.ts`.

Run: `pnpm capture; echo "exit=$?"`
Expected: `exit=0` e seis PNGs em `docs/gate-2/`.

**Checkpoint:** mostrar ao dono `docs/gate-2/home-desktop-pt.png` e `home-mobile-pt.png` ao lado de `docs/gate-1/02-editorial-rolodex-desktop-pt.png` e `…-mobile-pt.png`. A diferença esperada é o traço da Fraunces (`opsz` 144 e `WONK` agora ativos) e a barra superior. Não seguir para a Task 5 sem a aprovação. Se o dono rejeitar a Fraunces completa, trocar o import para `index.css`, remover `--fraunces-*` dos tokens e registrar em `DESIGN_DECISIONS.md`.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: hero e indice da home sobre a direcao rolodex"
```

---

### Task 5: Work — lâminas de índice

**Files:**
- Create: `src/components/SectionHead/*`, `src/components/ExternalLink/*`, `src/components/ProjectSlip/{ProjectSlip.tsx,ProjectSlip.module.css,ProjectSlip.test.tsx,index.ts}`, `src/sections/Work/{Work.tsx,Work.module.css,Work.test.tsx,index.ts}`
- Modify: `src/app/HomeRoute.tsx`

**Interfaces:**
- Consumes: `listProjects`, `caseStudyHref`, `useLocale`, `Sheet`.
- Produces:
  - `SectionHead({ index, headingId, title, intro? }: { index: number; headingId: string; title: string; intro?: string })` — `<h2 id={headingId}>`; número de dois dígitos no trilho de margem, em `--accent`, mono.
  - `ExternalLink({ href, children, hint }: { href: string; children: ReactNode; hint: string })` — `target="_blank"`, `rel="noopener noreferrer"`, `hint` em `.visually-hidden` dentro do link.
  - `ProjectSlip({ project, index, href, labels }: { project: Project; index: number; href: string | null; labels: { type: string; preview: string; links: SiteContent['links'] } })` — `<li>`.
  - `Work({ index, copy, projects, locale, labels }: { index: number; copy: SiteContent['work']; projects: Project[]; locale: Locale; labels: { projectType: SiteContent['projectType']; links: SiteContent['links'] } })` — `Sheet tone="sheet" id="work"`; aplica `listProjects` internamente.

**Lâmina:** portar `.slot*` do comp 02 (grid de duas colunas a partir de 768, número no trilho de margem, filete `--rule` entre lâminas). O título é `<h3>`; com `href`, o texto do título é um link do React Router; sem `href`, texto puro e `labels.preview` em mono abaixo do resumo. Stack: `project.stack.join(' · ')`. Links `live`/`repo` do projeto aparecem como `ExternalLink` na linha da stack.

- [ ] **Step 1: Escrever os testes que falham**

`ProjectSlip.test.tsx`:
- `published` com `href` → `getByRole('link', { name: project.title })` com esse `href`.
- `preview` com `href: null` → nenhum link com o nome do título; texto `labels.preview` presente.
- `type: 'concept'` → texto `labels.type` visível.
- `links: [{ kind: 'live', … }]` → link com `target="_blank"`, `rel="noopener noreferrer"` e nome acessível contendo o rótulo e `externalHint`.
- índice `3` → texto `03`.

`Work.test.tsx`, com uma fábrica de projetos local ao teste:
- com 2 projetos e com 8 projetos: o número de `listitem` bate e os índices vão de `01` a `02` / `08`.
- um `draft` na entrada não aparece.
- `locale: 'pt'` → links de título começam com `/pt/work/`.
- `section` com `id="work"` e nome acessível igual a `copy.label`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm test; echo "exit=$?"`
Expected: `exit=1`.

- [ ] **Step 3: Implementar e compor em `HomeRoute`**

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm typecheck; echo "exit=$?"`, `pnpm lint; echo "exit=$?"`, `pnpm test; echo "exit=$?"`
Expected: `exit=0`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: lista de trabalhos como laminas de indice"
```

---

### Task 6: Approach, About, Interests e Contact

**Files:**
- Create: `src/sections/{Approach,About,Interests,Contact}/{X.tsx,X.module.css,X.test.tsx,index.ts}`
- Modify: `src/app/HomeRoute.tsx`, `src/app/LocaleLayout.tsx` (rodapé com `shell.footerNote`)

**Interfaces:**
- Consumes: `Sheet`, `SectionHead`, `ExternalLink`.
- Produces: `Approach({ index, copy })`, `About({ index, copy })`, `Interests({ index, copy })`, `Contact({ index, copy, externalHint })`, com `copy` sendo a fatia correspondente de `SiteContent` e `id` igual ao `HomeSectionId`.

**Composição:** `Approach`, `About` e `Interests` continuam na folha (`tone="sheet"`), separadas por filete de 2px `--ink`, cada uma abrindo com `SectionHead`. `Approach` é uma lista de fichas no padrão das lâminas (título em Fraunces `--fraunces-title`, corpo em `--ink-muted`). `About` usa medida curta (`max-width: 38ch` no lead, `60ch` no corpo) e a stack em mono separada por `·`. `Interests` é uma linha mono. `Contact` volta para a capa (`tone="cover"`) — a contracapa: `lead` em Fraunces no tamanho `--text-title` e os canais como `ExternalLink` em linha. `HomeRoute` passa `index` a partir de `homeSections` (Task 4).

- [ ] **Step 1: Escrever os testes que falham**

Um teste por seção: heading `h2` com `copy.label` e o `id` da seção; o conteúdo principal renderizado (três itens no Approach, a stack no About, os quatro interesses, os dois canais no Contact com `href` exatos `https://github.com/decoarc` e `https://linkedin.com/in/andrearcodaci` e `rel="noopener noreferrer"`).

Em `src/app/routes.test.tsx`, acrescentar: em `'/'`, os `h2` aparecem na ordem `Selected work, Approach, About, Interests, Contact`; os números no `Release` e nos `SectionHead` coincidem; há exatamente um `h1`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm test; echo "exit=$?"`
Expected: `exit=1`.

- [ ] **Step 3: Implementar e compor**

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm typecheck; echo "exit=$?"`, `pnpm lint; echo "exit=$?"`, `pnpm test; echo "exit=$?"`
Expected: `exit=0`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: abordagem, sobre, interesses e contato na home"
```

---

### Task 7: Case study

**Files:**
- Modify: `src/app/CaseStudyRoute.tsx`
- Create: `src/app/CaseStudyRoute.module.css`, `src/app/CaseStudyRoute.test.tsx`, `e2e/journey.spec.ts`
- Modify: `e2e/routing.spec.ts`

**Interfaces:**
- Consumes: `useLocale`, `useContent`, `findProject`, `caseStudyAccess`, `localePath`, `ExternalLink`, `Sheet`.
- Produces: rota completa; nada novo para tarefas seguintes.

**Composição — a ficha aberta:** `Sheet tone="sheet"`. Link de volta (`caseStudy.backToWork`) para `localePath(locale, '/#work')`. Rótulo de tipo em mono; título `h1` em Fraunces `--fraunces-title`, tamanho `--text-display` com teto de `6rem`. No trilho de margem (a partir de 768px; abaixo disso, em linha antes do resumo) a ficha técnica em mono: `roleLabel`, `yearLabel`, `stackLabel`, `linksLabel`, como `<dl>`. Resumo em `--text-lead`. `cover`, quando existe, como `<img>` com `width`/`height`, `alt`, `loading="eager"`, borda de 1px `--rule`. Cada `CaseSection` vira `h2` + parágrafos e/ou `<ul>`. Avisos: `access === 'preview'` → `caseStudy.previewNotice` acima do título; `type === 'concept'` → `caseStudy.conceptNotice`. `<title>`: `project.title + meta.titleSuffix`. `access === 'none'` → `NotFoundRoute`.

- [ ] **Step 1: Escrever os testes que falham**

`CaseStudyRoute.test.tsx` (via `createMemoryRouter(createRoutes(), …)`):
- `'/work/token-killer'` → `h1` "Token Killer", `conceptNotice` visível, `document.title === 'Token Killer — André Arcodaci'`, cada `heading` de seção presente.
- `'/work/map-areas'` → renderiza com `previewNotice`; `img` com `alt` do cover; link externo da demo; nenhum link de repositório.
- `'/pt/work/map-areas'` → título e seções em PT; link de volta com `href="/pt#work"`.
- `'/work/Token-Killer'` e `'/work/..%2F'` → 404.

`e2e/journey.spec.ts`:
- em `/`, clicar no título "Token Killer" → URL `/work/token-killer`, `h1` visível; clicar em `backToWork` → URL `/#work`, a seção `#work` está no viewport e `document.activeElement.id === 'work'`.
- em `/work/token-killer`, clicar no link de idioma → URL `/pt/work/token-killer`, `html[lang="pt-BR"]`; clicar de novo → `/work/token-killer`.
- em `/pt#contact`, trocar de idioma → `/#contact`.

`e2e/routing.spec.ts`, acrescentar: `page.goto('/pt/work/token-killer')` direto e `page.reload()` → `h1` "Token Killer" e `lang` `pt-BR`.

- [ ] **Step 2: Rodar e ver falhar**

Run: `pnpm test; echo "exit=$?"`
Expected: `exit=1`.

- [ ] **Step 3: Implementar**

- [ ] **Step 4: Rodar e ver passar**

Run: `pnpm typecheck; echo "exit=$?"`, `pnpm lint; echo "exit=$?"`, `pnpm test; echo "exit=$?"`, `pnpm test:e2e; echo "exit=$?"`
Expected: `exit=0`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: case study como ficha aberta, com avisos de preview e conceito"
```

---

### Task 8: Suíte de Gate 2 — teclado, responsivo, motion desligado, acessibilidade e capturas

**Files:**
- Create: `e2e/keyboard.spec.ts`, `e2e/responsive.spec.ts`, `e2e/motion.spec.ts`, `e2e/a11y.spec.ts`, `e2e/routes.ts` (lista compartilhada de rotas)
- Modify: `e2e/gate-2.capture.ts`

**Interfaces:**
- Consumes: as rotas e a copy existentes.
- Produces: `e2e/routes.ts` exporta `GATE_ROUTES = ['/', '/pt', '/work/token-killer', '/pt/work/map-areas', '/nao-existe', '/pt/nao-existe'] as const` e `VIEWPORTS` (os três da Global Constraints).

- [ ] **Step 1: Escrever os testes**

`keyboard.spec.ts`: em `/`, o primeiro `Tab` foca o skip link; `Enter` move o foco para `#main`. Em seguida, `Tab` sucessivos alcançam, nesta ordem relativa, o CTA primário do hero, o primeiro link do `Release` e o link do título de um projeto publicado; cada foco tem `outline-style` diferente de `none`. `Enter` no CTA primário leva a seção `#work` ao viewport.

`responsive.spec.ts`: para cada `VIEWPORTS` × `GATE_ROUTES`, `document.documentElement.scrollWidth <= document.documentElement.clientWidth`. Em 390px, nenhum elemento dentro de `main` tem `getBoundingClientRect().right > innerWidth + 1` (pegar o primeiro culpado e mostrar o seletor na falha).

`motion.spec.ts`: com `test.use({ reducedMotion: 'reduce' })` e sem ele, em `/` e `/work/token-killer`, depois de carregar, de passar o mouse sobre um título de projeto e de focar um link, `document.getAnimations().length === 0`. A Fraunces completa carregou: `performance.getEntriesByType('resource')` contém um nome com `fraunces-latin-full-normal`.

`a11y.spec.ts`: `AxeBuilder` com tags `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa` em cada `GATE_ROUTES` → `violations` vazio, e `incomplete` filtrado por `color-contrast` vazio.

`gate-2.capture.ts`: passa a gravar também `case-<viewport>-<locale>.png` (`/work/token-killer` e `/pt/work/token-killer`) e `home-full-<viewport>-<locale>.png` com `fullPage: true`.

- [ ] **Step 2: Ver cada spec nova falhar uma vez**

Para cada uma das quatro specs, introduzir temporariamente a falha que ela deve pegar — `width: 120vw` num título, `transition: color 0.2s` num link, `outline: none` no `:focus-visible`, `--ink-muted: #8a8378` — rodar `pnpm test:e2e; echo "exit=$?"`, ver `exit=1` com a falha esperada, e desfazer.

- [ ] **Step 3: Rodar e ver passar**

Run: `pnpm typecheck; echo "exit=$?"`, `pnpm lint; echo "exit=$?"`, `pnpm test; echo "exit=$?"`, `pnpm test:e2e; echo "exit=$?"`
Expected: `exit=0`. Corrigir CSS ou markup até passar; não afrouxar o teste.

Run: `pnpm capture; echo "exit=$?"`
Expected: `exit=0`, capturas regravadas em `docs/gate-2/`.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "test: suite do gate 2 e capturas"
```

---

### Task 9: Desmonte da Fase 0, formatação e documentação

**Files:**
- Delete: `design/comps/`, `playwright.comps.config.ts`
- Modify: `package.json`, `vite.config.ts`, `tsconfig.app.json`, `tsconfig.node.json`, `docs/DESIGN_DECISIONS.md`, `docs/BACKLOG.md`, `docs/ARCHITECTURE.md`, `README.md`
- Create: `docs/gate-2/README.md`

- [ ] **Step 1: Desmontar a Fase 0**

Seguir a lista de `design/comps/README.md`, **exceto** o item das capturas de `docs/gate-1/`, que ficam (decisão posterior, em `DESIGN_DECISIONS.md` e `BACKLOG.md`):
- remover `@fontsource-variable/archivo`, `jetbrains-mono`, `space-grotesk`, `syne` de `devDependencies`; remover os scripts `comps` e `comps:capture`; `pnpm install`;
- apagar `playwright.comps.config.ts` e `design/comps/`;
- tirar `'**/design/comps/checks/**'` do `exclude` de `vite.config.ts`;
- tirar `design/comps` do `include` e o bloco `exclude` de `tsconfig.app.json`;
- tirar `design/comps/static.test.ts` do `include` de `tsconfig.node.json`.

Run: `grep -rn "design/comps\|comps:capture\|archivo\|syne\|space-grotesk\|jetbrains" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=docs . ; echo "exit=$?"`
Expected: nenhuma linha, `exit=1`.

- [ ] **Step 2: Formatar**

Run: `pnpm format` e depois `pnpm format:check; echo "exit=$?"`
Expected: `exit=0`. Commit separado, só de formatação.

```bash
git add -A
git commit -m "chore: desmontar a fase 0 e formatar o repositorio"
```

- [ ] **Step 3: Documentar**

- `docs/DESIGN_DECISIONS.md`, em D1/D2: a Fraunces vai como `full.css`; o comp carregava só o eixo de peso, então `opsz`/`WONK` não apareciam nas capturas do Gate 1; o dono escolheu o arquivo completo em 2026-10-26 e aprovou o resultado no checkpoint da Task 4. Nova entrada **D-Release**: a seção Release da `SPEC.md` §4.2 é o índice numerado da home, na folha clara — a virada de página — e substitui um menu de seções no topo.
- `docs/BACKLOG.md`: remover "Dívidas pequenas da Fase 0" (as três resolvidas: `stack` é `string[]`; `static.test.ts` substituído por `scripts/no-motion.test.ts`, que cobre `src/**/*.css`; a spec que reescrevia `docs/m4b-review/home-1280.png` foi apagada), "Desmonte da Fase 0" e "`pnpm format:check` falha". Acrescentar em Fase 4: `hreflang`, `description` e Open Graph por idioma (só `<title>` e `lang` estão na Fase 2); `validate` falha por desenho enquanto houver mock.
- `docs/ARCHITECTURE.md`: substituir pela árvore desta fase — pastas, regra de composição das seções, camada de conteúdo, rotas por locale, a trava de mock dentro de `build` (e por que não `prebuild`), os scripts `build`, `build:preview`, `test:e2e`, `capture`.
- `README.md`: comandos atualizados.
- `docs/gate-2/README.md`: como avaliar (`pnpm build:preview && pnpm preview`), os critérios do Gate 2 ("navegação, conteúdo e responsividade funcionam com todo o motion desligado") com o teste que cobre cada um, a lista das capturas, e a lista de copy PT traduzida de copy real para revisão do dono.

- [ ] **Step 4: Verificação final**

Run, um por vez: `pnpm typecheck; echo "exit=$?"`, `pnpm lint; echo "exit=$?"`, `pnpm test; echo "exit=$?"`, `pnpm format:check; echo "exit=$?"`, `pnpm test:e2e; echo "exit=$?"`
Expected: `exit=0` em todos.

Run: `pnpm build; echo "exit=$?"`
Expected: `exit=1` com os caminhos de mock listados — critério 8 da spec.

Run: `pnpm build:preview; echo "exit=$?"`
Expected: `exit=0`.

`pnpm validate` continua falhando no `build` enquanto houver mock; isso é o critério 8 funcionando, e o critério 9 fecha na Fase 4, com conteúdo real.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "docs: arquitetura, decisoes e dossie do gate 2"
```
