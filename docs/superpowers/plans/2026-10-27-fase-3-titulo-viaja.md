# Fase 3, segunda leva — Título que viaja — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ao abrir um case study pela lista de trabalhos, o título da ficha viaja até o título do case; ao voltar pelo "Voltar aos trabalhos", faz o caminho inverso e a home reaparece parada na ficha do projeto, com o foco no título dela.

**Architecture:** Primeiro a volta passa a mirar a ficha (âncora `#work-<slug>`, rolagem imediata, foco no link do título) e a ida passa a focar o `h1` — isso vale com ou sem animação. Depois, a animação: View Transitions do navegador disparadas pelo `viewTransition` do `Link` do React Router. O título da ficha (só a envolvida, via `useViewTransitionState`) e o texto do `h1` do case recebem o mesmo `view-transition-name`; o sentido da viagem fica em `data-title-flight` no `<html>`, escrito no clique, e o CSS dos pseudo-elementos `::view-transition-*` mostra só a foto grande do título.

**Tech Stack:** React 19, React Router 8.5 (`viewTransition`, `useViewTransitionState`), TypeScript 5.9, CSS Modules + um CSS global para os pseudo-elementos, Lenis 1.3.26, Vitest 5 + Testing Library + jsdom, Playwright 1.64.

**Spec:** `docs/superpowers/specs/2026-10-27-fase-3-titulo-viaja-design.md`. Referência visual: `docs/fase-3/prototipo/cortina.html` (abre na opção "3 · Título que viaja"; `tTitulo()` é o ritmo aprovado).

## Global Constraints

- Branch `fase-3-titulo-viaja` (já criada, com o design commitado). Nenhuma dependência nova.
- **Ida:** grupo do título **800 ms**, `cubic-bezier(0.76, 0, 0.24, 1)`. Raiz (home sai, fundo do case entra): **450 ms**, `cubic-bezier(0.2, 0.7, 0, 1)`. Resto do case sobe **20 px** e aparece em **550 ms**, mesma curva, começando em **380 ms**, **60 ms** entre blocos: link "Voltar" (380), cabeçalho (440), corpo (500).
- **Volta:** resto do case some em **250 ms**; grupo do título **750 ms**, `cubic-bezier(0.76, 0, 0.24, 1)`; raiz em **450 ms** começando em **200 ms**.
- **Só a foto grande viaja:** na ida, `::view-transition-old(case-title)` invisível e `::view-transition-new(case-title)` sem animação própria; na volta, o contrário. Nunca cruzamento das duas fotos.
- **Tipografia:** os dois títulos seguem com `font-variation-settings: var(--fraunces-title)` e peso 600; não mexer no `opsz`. O espaçamento (−0,02em ficha × −0,03em case) só muda se a evidência da Task 3 mostrar salto.
- **Nomes de transição únicos na página:** `case-title` (texto do `h1` do case; e o link da ficha **só** quando `useViewTransitionState(href)` for verdadeiro e `href !== null`), `case-back`, `case-head`, `case-body` (só no case).
- **Sem transição** (troca direta): sem `document.startViewTransition`, com `prefers-reduced-motion: reduce`, sem JS, botão voltar/avançar do navegador, troca de idioma, masthead, 404, primeira carga, e a volta de um case em preview.
- **Guarda de motion** (`scripts/motion-guard.test.ts`): toda declaração `animation`/`transition` nova fica dentro de `@media (prefers-reduced-motion: no-preference)`. Com reduced motion o `viewTransition` do `Link` é `false`, então nenhuma transição roda.
- **Exceção registrada:** o grupo `::view-transition-group(case-title)` anima `width`/`height` (padrão do navegador, só no pseudo-elemento, sem layout da página). Registrar em `docs/MOTION_SPEC.md` (Task 3).
- **Nenhuma string voltada ao usuário em componente.**
- **Verificação sem `rtk`:** `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build:preview`, `pnpm test:e2e`, lendo o exit code com `; echo "exit=$?"`. `pnpm build`/`pnpm validate` falham por desenho enquanto houver mock. Toda verificação nova é vista falhando uma vez antes de o verde valer.
- **Servidor de preview velho:** o Playwright reaproveita a porta 4173 (`reuseExistingServer`). Antes do e2e, confira que nada escuta na 4173.
- Commits em português, `tipo: descrição`, terminando com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Clique duplo / segundo clique durante a viagem** (no "Voltar" ou noutra ficha): o router pula a transição em curso; a página final é a do último clique, sem pseudo-elemento preso nem título invisível. Teste e2e na Task 2.
2. **Botão voltar do navegador depois de abrir um case:** troca direta, a home volta na posição que o navegador restaura e o foco vai para `#main` (hoje fica no `<body>`, porque o `h1` focado sai da página). Teste unitário e e2e na Task 1.
3. **Reduced motion:** nenhum `::view-transition` aparece; mesmos URL, foco e posição da ficha. Teste e2e na Task 2.
4. **Case em PT** (`/pt/work/<slug>`): o "Voltar" leva a `/pt/#work-<slug>` e acha a ficha. Teste unitário na Task 1.
5. **Celular (390×844):** a volta deixa a ficha inteira à vista e o título que quebra em linhas diferentes na origem e no destino continua legível. Teste e2e (ficha em viewport) na Task 1; captura no meio da viagem na Task 3.

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `src/app/navigationState.ts` (+ teste) | O estado de navegação "rolagem imediata" |
| `src/content/publication.ts` (+ teste) | `workAnchor(slug)` |
| `src/motion/smoothScroll.ts` (+ teste) | `scrollToTarget` com `immediate` |
| `src/app/ScrollManager.tsx` (+ teste) | Foco no alvo certo, rolagem imediata, foco em `POP` |
| `src/components/ProjectSlip/ProjectSlip.tsx` (+ teste) | Âncora da ficha, alvo de foco, nome da transição |
| `src/app/CaseStudyRoute.tsx`, `.module.css` (+ teste) | "Voltar" para a ficha, `h1` focável, nomes da transição |
| `src/motion/titleFlight.ts` (+ teste), `src/motion/titleFlight.css` | Nomes, sentido e CSS dos pseudo-elementos |
| `src/sections/Work/Work.tsx`, `Work.module.css` | Ficha pousa em repouso (`data-settling`) |
| `src/main.tsx` | Importa `titleFlight.css` |
| `e2e/journey.spec.ts`, `e2e/title-flight.spec.ts` (novo), `e2e/title-flight.capture.ts` (novo) | Comportamento e evidência |
| `docs/MOTION_SPEC.md`, `docs/BACKLOG.md` | Ficha e backlog |

---

### Task 1: A volta mira a ficha; a ida foca o título

Sem animação ainda. Ao fim desta task, o site já se comporta como o design pede em navegador sem View Transitions.

**Files:**
- Create: `src/app/navigationState.ts`, `src/app/navigationState.test.ts`
- Modify: `src/content/publication.ts` (+ `publication.test.ts`), `src/motion/smoothScroll.ts` (+ `smoothScroll.test.ts`), `src/app/ScrollManager.tsx` (+ `ScrollManager.test.tsx`), `src/components/ProjectSlip/ProjectSlip.tsx` (+ `ProjectSlip.test.tsx`), `src/app/CaseStudyRoute.tsx`, `src/app/CaseStudyRoute.module.css` (+ `CaseStudyRoute.test.tsx`), `e2e/journey.spec.ts`

**Interfaces:**
- Produces:
  - `INSTANT_SCROLL: { readonly scroll: 'instant' }` e `wantsInstantScroll(state: unknown): boolean` em `src/app/navigationState.ts`
  - `workAnchor(slug: string): string` → `` `work-${slug}` `` em `src/content/publication.ts`
  - `scrollToTarget(target: HTMLElement, options?: { immediate?: boolean }): void` (Lenis: `lenis.scrollTo(target, { immediate })`; sem Lenis: `scrollIntoView({ block: 'start' })`, que já é instantâneo)
  - Atributos DOM: `data-anchor-focus` (dentro do alvo de uma âncora, quem recebe o foco) e `data-route-focus` (na página nova, quem recebe o foco num `PUSH` sem hash)
  - `<li id={workAnchor(slug)}>` em cada ficha

- [ ] **Step 1: Write the failing tests**

`navigationState.test.ts`:
```ts
expect(wantsInstantScroll(INSTANT_SCROLL)).toBe(true)
expect(wantsInstantScroll({ scroll: 'smooth' })).toBe(false)
expect(wantsInstantScroll(null)).toBe(false)
expect(wantsInstantScroll('instant')).toBe(false)
```

`publication.test.ts`: `expect(workAnchor('token-killer')).toBe('work-token-killer')`.

`smoothScroll.test.ts` (no padrão do arquivo, com o Lenis simulado): `scrollToTarget(el, { immediate: true })` chama `lenis.scrollTo(el, { immediate: true })`; sem opção, `{ immediate: undefined }` ou `{ immediate: false }` (escolha uma e fixe no teste).

`ScrollManager.test.tsx` (acrescente à rota do teste um `<li id="work-atlas"><a href="/work/atlas" data-anchor-focus>Atlas title</a></li>` e um `<h1 tabIndex={-1} data-route-focus>Case</h1>` numa rota `/work/:slug`):
```ts
it('âncora com data-anchor-focus: foca o elemento marcado, não o alvo', ...)
  // navegar para { hash: '#work-atlas' } → activeElement é o link 'Atlas title'
it('estado INSTANT_SCROLL rola imediato', ...)
  // navigate({ pathname: '/', hash: '#work-atlas' }, { state: INSTANT_SCROLL })
  // → scrollToTarget chamado com (li, { immediate: true })
it('hash sem estado rola com deslize', ...)
  // → scrollToTarget chamado com (alvo, { immediate: false })
it('PUSH sem hash foca data-route-focus quando existe', ...)
  // navegar para /work/atlas → activeElement é o h1
it('POP foca #main e não rola', ...)
  // router.navigate(-1) depois de um PUSH → activeElement.id === 'main'; scrollToTop não chamado
```
(O teste de `POP` precisa de um `<main id="main" tabIndex={-1}>` na árvore do teste.)

`ProjectSlip.test.tsx`:
```ts
// ficha com href: <li> tem id 'work-<slug>'; o link do título tem data-anchor-focus
// ficha sem href (preview): o <h3> tem data-anchor-focus e tabindex="-1"
```

`CaseStudyRoute.test.tsx`:
```ts
// /work/token-killer: link backToWork com href '/#work-token-killer'
// /pt/work/token-killer: href '/pt/#work-token-killer'
// /work/map-areas (preview): href '/#work-map-areas'
// h1 tem tabindex="-1" e data-route-focus
```

- [ ] **Step 2: Run to verify they fail** — `pnpm test; echo "exit=$?"` → falham os testes novos (exports ausentes, ids/atributos ausentes).

- [ ] **Step 3: Implement**
  - `navigationState.ts`, `workAnchor`, `scrollToTarget` como em Interfaces.
  - `ScrollManager`: lê `state` de `useLocation()`; no ramo do hash, `scrollToTarget(target, { immediate: wantsInstantScroll(state) })` e foca `target.querySelector('[data-anchor-focus]') ?? target` (o `tabindex="-1"` automático só no alvo, quando é ele que recebe foco). `POP`: foca `#main` com `preventScroll` e não rola. `PUSH`/`REPLACE` sem hash: `scrollToTop()` e foca `[data-route-focus]` ou, sem ele, `#main`. Inclua `state` nas dependências do efeito.
  - `ProjectSlip`: `id={workAnchor(project.slug)}` no `<li>`; `data-anchor-focus` no `Link`; sem `href`, `data-anchor-focus` e `tabIndex={-1}` no `<h3>`.
  - `CaseStudyRoute`: "Voltar" vira `to={localePath(locale, `/#${workAnchor(project.slug)}`)}` com `state={INSTANT_SCROLL}`; `h1` com `tabIndex={-1}` e `data-route-focus`; em `CaseStudyRoute.module.css`, `.title:focus { outline: none; }` (mesma regra do `main:focus` de `global.css`).
  - `e2e/journey.spec.ts`: o primeiro teste passa a esperar `/#work-token-killer`, `#work-token-killer` em viewport e o foco no link do título (`document.activeElement` com `data-anchor-focus`, nome contendo "Token Killer"). Renomeie para "home → case study → de volta à ficha, com foco no título". Acrescente: o mesmo em 390×844 (ficha em viewport); e o botão voltar do navegador (`page.goBack()`) a partir do case → URL da home, foco em `#main`.

- [ ] **Step 4: Verify** — `pnpm test; echo "exit=$?"` → `exit=0`; `pnpm typecheck; echo "exit=$?"` → `exit=0`; `pnpm lint; echo "exit=$?"` → `exit=0`; `pnpm build:preview; echo "exit=$?"` → `exit=0`; `pnpm test:e2e; echo "exit=$?"` → `exit=0`.

- [ ] **Step 5: Commit** — `feat: voltar do case study para a ficha do projeto, com foco no título`

---

### Task 2: O título viaja

**Files:**
- Create: `src/motion/titleFlight.ts`, `src/motion/titleFlight.test.ts`, `src/motion/titleFlight.css`, `e2e/title-flight.spec.ts`
- Modify: `src/main.tsx`, `src/components/ProjectSlip/ProjectSlip.tsx`, `src/app/CaseStudyRoute.tsx`, `src/app/CaseStudyRoute.module.css`, `src/sections/Work/Work.tsx`, `src/sections/Work/Work.module.css`

**Interfaces:**
- Consumes (Task 1): `INSTANT_SCROLL`, `wantsInstantScroll`, `workAnchor`, `data-anchor-focus`, `data-route-focus`.
- Produces (`src/motion/titleFlight.ts`):
  - `TITLE_FLIGHT = { title: 'case-title', back: 'case-back', head: 'case-head', body: 'case-body' } as const`
  - `type FlightDirection = 'open' | 'close'`
  - `markTitleFlight(direction: FlightDirection): void` — escreve `document.documentElement.dataset.titleFlight`
  - `canFly(): boolean` — `typeof document.startViewTransition === 'function' && !prefersReducedMotion()`

- [ ] **Step 1: Write the failing tests**

`titleFlight.test.ts`:
```ts
markTitleFlight('open'); expect(document.documentElement.dataset.titleFlight).toBe('open')
markTitleFlight('close'); expect(document.documentElement.dataset.titleFlight).toBe('close')
// canFly: false sem startViewTransition (jsdom); true com stub de startViewTransition e matchMedia sem reduce;
// false com stub de startViewTransition e matchMedia reduce
```

`e2e/title-flight.spec.ts` (Chromium, 1440×900; projeto de case `token-killer`). Helpers: `flight(page)` = animações cujo `effect.pseudoElement` contém `view-transition`; `freezeAt(page, ms)` pausa todas e põe `currentTime = ms`; `groupBox(page)` lê `width`, `height` e `transform` de `getComputedStyle(document.documentElement, '::view-transition-group(case-title)')`.
```ts
test('ida: URL muda no clique, antes da viagem acabar')
  // clicar no título da ficha; logo em seguida: URL /work/token-killer e flight(page).length > 0
test('ida: o título começa no lugar da ficha e termina no h1')
  // retângulo do link da ficha antes do clique; freezeAt(0) → grupo com a mesma largura/posição (±2px);
  // freezeAt(800) → grupo igual ao retângulo do texto do h1 depois da troca (±2px)
test('ida: só a foto nova do título aparece')
  // freezeAt(400): opacidade de ::view-transition-old(case-title) = 0; a de ::view-transition-new(case-title) = 1
test('ida: termina com foco no h1 e nenhum pseudo-elemento')
  // esperar flight(page).length === 0; activeElement é o h1 'Token Killer'
test('volta: só a foto antiga aparece; termina na ficha, com foco no link')
  // a partir do case, clicar "Voltar"; freezeAt(375): old(case-title) opacidade 1, new 0;
  // ao fim: #work-token-killer em viewport, foco no link do título
test('volta: a ficha pousa em repouso com o cursor parado sobre outra')
  // antes de clicar "Voltar", page.mouse.move para o ponto onde ficará a ficha anterior;
  // ao fim: todas as fichas com opacity 1 e título com transform 'none'; depois de page.mouse.move(+5px),
  // a reação volta (a ficha sob o cursor com título deslocado)
test('segundo clique durante a viagem termina na página certa')
  // abrir; durante a ida clicar "Voltar" assim que existir; ao fim: URL /#work-token-killer, flight vazio, título visível
test('reduced motion: troca direta, mesmos foco e posição')
  // page.emulateMedia({ reducedMotion: 'reduce' }); ida e volta; flight(page) nunca > 0 (checar logo após cada clique)
test('case em preview: volta direta, sem viagem')
  // /work/map-areas → "Voltar": flight vazio logo após o clique; #work-map-areas em viewport; foco no h3
```

- [ ] **Step 2: Run to verify they fail** — `pnpm test; echo "exit=$?"` (titleFlight ausente) e `pnpm test:e2e -- e2e/title-flight.spec.ts; echo "exit=$?"` (sem viagem: os testes que exigem `flight > 0` falham).

- [ ] **Step 3: Implement**
  - `titleFlight.ts` como em Interfaces.
  - `useViewTransitionState` exige um data router: em `ProjectSlip.test.tsx` (e onde mais a ficha for renderizada com `MemoryRouter`), troque por `createMemoryRouter` + `RouterProvider`, como em `CaseStudyRoute.test.tsx`; os testes existentes continuam iguais.
  - `ProjectSlip`: `const flying = useViewTransitionState(href ?? '') && href !== null`; com `flying`, `style={{ viewTransitionName: TITLE_FLIGHT.title }}` no `Link`. No `Link`: `viewTransition={canFly()}` e `onClick={() => markTitleFlight('open')}`.
  - `CaseStudyRoute`: texto do `h1` dentro de `<span className={styles.titleText}>` (`display: inline-block`) com `view-transition-name: case-title`; `case-back` no link "Voltar", `case-head` no `<header>`, `case-body` no `.body` (os quatro em CSS no módulo). "Voltar": `viewTransition={access === 'full' && canFly()}` e `onClick={() => markTitleFlight('close')}`.
  - `titleFlight.css` (importado em `src/main.tsx` depois de `global.css`), tudo dentro de `@media (prefers-reduced-motion: no-preference)`, com os tempos e curvas das Global Constraints:
    - `::view-transition-group(case-title)`: 800 ms; sob `:root[data-title-flight='close']`, 750 ms.
    - `:root[data-title-flight='open']`: `old(case-title)` com `animation: none; opacity: 0`; `new(case-title)` com `animation: none`. Em `close`, o inverso.
    - `open`: `old(root)` sai e `new(root)` entra em 450 ms; `new(case-back|case-head|case-body)` com um `@keyframes` de `opacity: 0; translate: 0 20px` para o repouso, 550 ms, atrasos 380/440/500 ms (`animation-fill-mode: both`).
    - `close`: `old(case-back|case-head|case-body)` saem em 250 ms; `old(root)`/`new(root)` em 450 ms com atraso 200 ms.
  - `Work`: `settling` inicial = `wantsInstantScroll(useLocation().state)`; com ele, `data-settling` no `<ol>`; um efeito remove no primeiro `pointermove`, `keydown`, `wheel` ou `touchstart` (listeners `once`, removidos no cleanup). Em `Work.module.css`, sob `.list[data-settling]`, nenhuma ficha esmaece e nenhum título/miniatura se desloca (as regras de reação passam a exigir `.list:not([data-settling])`; mantenha as especificidades relativas entre elas).

- [ ] **Step 4: Verify** — `pnpm test; echo "exit=$?"`, `pnpm typecheck; echo "exit=$?"`, `pnpm lint; echo "exit=$?"`, `pnpm build:preview; echo "exit=$?"`, `pnpm test:e2e; echo "exit=$?"` → todos `exit=0`. A guarda de motion continua verde.

- [ ] **Step 5: Commit** — `feat: título da ficha viaja até o case study e volta`

---

### Task 3: Evidência e documentação

**Files:**
- Create: `e2e/title-flight.capture.ts` (modelo: `e2e/hover.capture.ts`, projeto `capture`)
- Modify: `docs/MOTION_SPEC.md`, `docs/BACKLOG.md`

- [ ] **Step 1: Captura** — em 1440×900 e 390×844, para a ida e para a volta, congelar a viagem em 0, metade e fim (helpers da Task 2) e salvar a viewport em `docs/fase-3/segunda-leva/titulo-viaja-<viewport>-<ida|volta>-<0|50|100>.png`. Run `pnpm capture; echo "exit=$?"` → `exit=0` e 12 PNGs.

- [ ] **Step 2: Conferir as capturas.** Em todas: uma única imagem do título, nítida, Fraunces com o mesmo desenho; no quadro 0 da ida e no 100 da volta, nenhum salto visível em relação ao título da ficha. Se houver salto de espaçamento, igualar o `letter-spacing` dos dois títulos em −0,03em (`ProjectSlip.module.css`), refazer as capturas e anotar no commit. Em 390×844, título legível mesmo quebrando em linhas diferentes; se não estiver, mostrar ao dono antes de seguir.

- [ ] **Step 3: Docs.**
  - `docs/MOTION_SPEC.md`: ficha "Título que viaja" no formato das demais (Objetivo, Elemento, Gatilho, Estado inicial/final, Duração e easing, Toque, Reduced motion, Sem JS, Navegação, Evidência = `e2e/title-flight.spec.ts` e as capturas); a exceção do `width`/`height` no grupo do pseudo-elemento; `src/motion/titleFlight.ts` e `titleFlight.css` em "Onde o motion vive no código"; a linha "Estado" do topo (segunda leva concluída).
  - `docs/BACKLOG.md`: remover "Cortina ao abrir um case study"; no parágrafo "Feitos em 2026-10-27…", registrar o título que viaja e que a segunda leva terminou.
  - `pnpm format:check; echo "exit=$?"` → `exit=0`.

- [ ] **Step 4: Commit** — `docs: ficha do título que viaja, evidência e backlog`
