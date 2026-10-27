# Fase 3 — Motion: abertura da home — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entrada do nome subindo da fenda, afastamento do nome com o scroll, folha do índice subindo por cima do hero com borda curva, e scroll suave (Lenis) no site inteiro — tudo desligado com `prefers-reduced-motion: reduce`.

**Architecture:** As contas do movimento são funções puras em `src/motion/opening.ts`. Um componente `Opening` (em `src/motion/`) envolve Hero e Release na `HomeRoute`, escuta o scroll e escreve custom properties no próprio elemento; Hero e Release só leem essas propriedades no CSS, com padrões que reproduzem o estado estático. Assim as seções continuam sem importar uma à outra e sem estado React por frame. O Lenis vive num módulo singleton (`src/motion/smoothScroll.ts`) iniciado em `main.tsx` e usado pelo `ScrollManager`.

**Tech Stack:** React 19, React Router 8, Vite 8, TypeScript 5.9, CSS Modules, Vitest 5 + Testing Library + jsdom, Playwright 1.64, `lenis@1.3.26`.

**Spec:** `docs/superpowers/specs/2026-10-26-fase-3-motion-design.md`. Referência visual e de valores: `docs/fase-3/prototipo/desktop.html` e `docs/fase-3/prototipo/mobile.html` (a função `frame()` de cada um é o comportamento aprovado).

## Global Constraints

- Branch `fase-3-motion` (já existe, com o commit do design).
- **Valores aprovados:** afastamento 25 vw (≥ 768 px) e 40 vw (< 768 px); curva máxima 14 vh (≥ 768 px) e 7 vh (< 768 px); entrada 1,1 s `cubic-bezier(.2, .7, 0, 1)`, segunda linha +120 ms, a partir de `translateY(105%)`; bloco de baixo sobe `p × 6 vh` com opacidade `1 − 1,4p` (mínimo 0); hero até `scale(0.94)`; sombra até opacidade 0,9 de um gradiente `--ink` transparente → 55 %; curva `sin(π·p) × máximo`; afastamento `easeOutCubic(p) × distância`; `p = clamp(scrollY / innerHeight, 0, 1)`. Lenis com `lerp: 0.09`.
- **`lenis` fixado em `1.3.26`** (exato, sem `^`): 1.3.27 tem menos de duas semanas. Nenhuma outra dependência nova; nada de GSAP.
- **Reduced motion:** sem Lenis, sem entrada, sem afastamento, sem escala, sombra nem curva. Hero preso com a folha subindo é permitido (é o próprio scroll).
- **Nenhum conteúdo nasce escondido no CSS.** O estado escondido da entrada só existe sob `[data-entrance='pending']`, que só o script aplica.
- **Só `transform` e `opacity` animam**, mais a altura do pseudo-elemento da curva.
- **Nenhuma string voltada ao usuário em componente.** A divisão do nome vem de `person.name.split(' ')`.
- **`h1` mantém o nome acessível exato** `site.person.name` ("André Arcodaci").
- **Viewports:** 1440×900, 768×1024, 390×844, nos dois idiomas.
- **Verificação sem `rtk`:** `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm test:e2e`, lendo o exit code com `; echo "exit=$?"`. Toda verificação nova é vista falhando uma vez antes de o verde valer.
- Commits em português, `tipo: descrição`, como o histórico.

## Review Focus

1. **Shift+Tab do índice de volta para os CTAs do hero com a folha por cima:** o CTA focado tem de ficar visível (o hero volta ao topo). Teste na Task 4.
2. **Abrir já rolado** (`/#work`, recarregar no meio): nada de nome preso em `translateY(105%)`; sem atributo de entrada; afastamento já no valor da posição. Teste na Task 4.
3. **Atravessar 768 px** (girar o celular, redimensionar): distância e curva trocam no próximo frame. Teste unitário na Task 1, e2e na Task 4.
4. **Trocar de idioma** (o layout remonta): uma única instância do Lenis, sem rolagem acelerada. Teste na Task 2.
5. **Home rolada → abrir case study → voltar a `#work`:** case study abre no topo; a volta pousa em `#work` com foco. Teste na Task 2 (o de volta já existe em `e2e/journey.spec.ts`).

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `src/motion/opening.ts` | Constantes aprovadas e funções puras: progresso e valores de um frame |
| `src/motion/reducedMotion.ts` | `prefersReducedMotion()` |
| `src/motion/smoothScroll.ts` | Singleton do Lenis: iniciar, assinar scroll, rolar para alvo/topo |
| `src/motion/Opening.tsx` + `Opening.module.css` | Envolve Hero e Release; escreve as custom properties; entrada; foco |
| `src/sections/Hero/*` | Nome em duas linhas com fenda; lê `--opening-*` |
| `src/sections/Release/*` | Borda curva; fica por cima do hero |
| `src/app/HomeRoute.tsx`, `src/app/ScrollManager.tsx`, `src/main.tsx` | Ligações |
| `scripts/no-motion.test.ts` → `scripts/motion-guard.test.ts` | Só arquivos permitidos declaram `transition`/`animation` |
| `e2e/motion.spec.ts`, `e2e/opening.spec.ts`, `e2e/gate-3.capture.ts` | Guarda em runtime, comportamento da abertura, capturas do Gate 3 |
| `docs/*` | `MOTION_SPEC.md` reescrito, `ARCHITECTURE.md`, `SPEC.md` §5.3, `DESIGN_DECISIONS.md`, `README.md` |

---

### Task 1: As contas da abertura

**Files:**
- Create: `src/motion/opening.ts`
- Test: `src/motion/opening.test.ts`

**Interfaces:**
- Produces:

```ts
export const OPENING = {
  mobileMaxWidth: 767,
  desktop: { driftVw: 25, curveVh: 14 },
  mobile: { driftVw: 40, curveVh: 7 },
  heroMinScale: 0.94,
  shadeMax: 0.9,
  bottomShiftVh: 6,
  bottomFade: 1.4,
} as const

export interface OpeningFrame {
  driftVw: number        // deslocamento de cada palavra (sinal aplicado no CSS)
  bottomShiftVh: number  // quanto o bloco de baixo sobe (positivo = para cima)
  bottomOpacity: number  // 0..1
  heroScale: number      // 0.94..1
  shadeOpacity: number   // 0..0.9
  curveVh: number        // altura da curva
}

export function openingProgress(scrollY: number, viewportHeight: number): number
export function openingFrame(progress: number, viewportWidth: number): OpeningFrame
```

- [ ] **Step 1: Write the failing test** — `opening.test.ts`, `describe('openingProgress')` e `describe('openingFrame')`:

```ts
expect(openingProgress(0, 900)).toBe(0)
expect(openingProgress(450, 900)).toBe(0.5)
expect(openingProgress(5000, 900)).toBe(1)
expect(openingProgress(-40, 900)).toBe(0)          // overscroll do iOS
expect(openingProgress(100, 0)).toBe(1)            // janela sem altura não divide por zero

expect(openingFrame(0, 1440)).toEqual({ driftVw: 0, bottomShiftVh: 0, bottomOpacity: 1, heroScale: 1, shadeOpacity: 0, curveVh: 0 })
expect(openingFrame(1, 1440).driftVw).toBe(25)
expect(openingFrame(1, 390).driftVw).toBe(40)
expect(openingFrame(1, 767).driftVw).toBe(40)
expect(openingFrame(1, 768).driftVw).toBe(25)
expect(openingFrame(0.5, 1440).curveVh).toBeCloseTo(14)
expect(openingFrame(0.5, 390).curveVh).toBeCloseTo(7)
expect(openingFrame(1, 1440).curveVh).toBeCloseTo(0)
expect(openingFrame(0.5, 1440).driftVw).toBeCloseTo(25 * (1 - 0.5 ** 3))   // easeOutCubic
expect(openingFrame(1, 1440)).toMatchObject({ heroScale: 0.94, shadeOpacity: 0.9, bottomShiftVh: 6, bottomOpacity: 0 })
```

- [ ] **Step 2: Run** `pnpm test src/motion/opening.test.ts; echo "exit=$?"` — Expected: FAIL (módulo inexistente).
- [ ] **Step 3: Implement** `openingProgress` e `openingFrame` em `src/motion/opening.ts` com as fórmulas de Global Constraints. Arquivo sem DOM.
- [ ] **Step 4: Run** o mesmo comando — Expected: PASS, `exit=0`.
- [ ] **Step 5: Commit** — `feat: contas da abertura da home`

---

### Task 2: Scroll suave

**Files:**
- Modify: `package.json` (`"lenis": "1.3.26"` em `dependencies`), `pnpm-lock.yaml`
- Create: `src/motion/reducedMotion.ts`, `src/motion/smoothScroll.ts`
- Modify: `src/main.tsx` (importar `lenis/dist/lenis.css` e chamar `startSmoothScroll()` antes do `render`), `src/app/ScrollManager.tsx`
- Test: `src/motion/smoothScroll.test.ts`, `e2e/smooth-scroll.spec.ts`

**Interfaces:**
- Produces:

```ts
// reducedMotion.ts
export function prefersReducedMotion(): boolean   // matchMedia('(prefers-reduced-motion: reduce)').matches; false sem window

// smoothScroll.ts
export function startSmoothScroll(): boolean       // cria o Lenis uma vez; false se reduced motion. Idempotente.
export function stopSmoothScroll(): void           // destrói (usado pelos testes)
export function isSmoothScrollActive(): boolean
export function onScroll(listener: () => void): () => void   // Lenis 'scroll' se ativo, senão 'scroll' da window coalescido em rAF; devolve o cancelamento
export function scrollToTarget(target: HTMLElement): void    // Lenis.scrollTo(target) se ativo, senão target.scrollIntoView({ block: 'start' })
export function scrollToTop(): void                         // Lenis.scrollTo(0, { immediate: true }) se ativo, senão window.scrollTo(0, 0)
```

O Lenis é criado com `{ lerp: 0.09, anchors: true }` e roda no próprio `autoRaf`. `onScroll` assina o evento do Lenis quando ele existe — é o laço único que a spec (§4.5) pede.

- [ ] **Step 1: Write the failing unit test** — `smoothScroll.test.ts` (jsdom; `matchMedia` vem do `src/test/setup.ts`, sobrescrever por teste; `afterEach(stopSmoothScroll)`):
  - `startSmoothScroll()` com reduce → `false`, e `isSmoothScrollActive()` é `false`.
  - sem reduce, duas chamadas → as duas `true`, e o construtor do Lenis foi chamado uma vez (`vi.mock('lenis')`).
  - `scrollToTarget(el)` sem Lenis chama `el.scrollIntoView({ block: 'start' })`.
  - `scrollToTop()` sem Lenis chama `window.scrollTo(0, 0)`.
- [ ] **Step 2: Run** `pnpm test src/motion/smoothScroll.test.ts; echo "exit=$?"` — Expected: FAIL.
- [ ] **Step 3: Install** `pnpm add lenis@1.3.26 --save-exact` e conferir no `package.json` o valor sem `^`.
- [ ] **Step 4: Implement** `reducedMotion.ts` e `smoothScroll.ts`; em `main.tsx`, `import 'lenis/dist/lenis.css'` e `startSmoothScroll()`. No `ScrollManager`, trocar `target.scrollIntoView({ block: 'start' })` por `scrollToTarget(target)` e `window.scrollTo(0, 0)` por `scrollToTop()`; atualizar o comentário do arquivo (não diz mais "sem smooth: Fase 3").
- [ ] **Step 5: Run** o teste unitário — Expected: PASS.
- [ ] **Step 6: Write the e2e** `e2e/smooth-scroll.spec.ts`:
  - `no-preference`: em `/`, `html` tem a classe `lenis`.
  - `reduce` (`test.use({ reducedMotion: 'reduce' })`): `html` não tem a classe `lenis`.
  - Trocar de idioma duas vezes (`/` → `/pt` → `/` pelo link do masthead) e então `page.mouse.wheel(0, 400)`; depois de estabilizar, `scrollY` fica entre 300 e 500 (uma instância; duas dobrariam).
  - Home rolada até `#about`, clicar em "Token Killer" → no case study, `scrollY === 0`.
- [ ] **Step 7: Run** `pnpm test:e2e; echo "exit=$?"` — Expected: PASS, incluindo `e2e/journey.spec.ts` (volta a `#work` com foco) sem alteração. Ver o teste de `scrollY` falhar uma vez (por exemplo, chamando `startSmoothScroll` sem a guarda de idempotência) antes de aceitar o verde.
- [ ] **Step 8: Commit** — `feat: scroll suave com Lenis, desligado em reduced motion`

---

### Task 3: Hero e Release preparados para a abertura (estáticos)

O markup e o CSS ficam prontos, com as custom properties em valores neutros. Sem nenhuma `transition` ainda: esta task passa pelos guardas atuais sem mudá-los.

**Files:**
- Modify: `src/sections/Hero/Hero.tsx`, `Hero.module.css`, `Hero.test.tsx`
- Modify: `src/sections/Release/Release.module.css`

**Interfaces:**
- Produces (contrato de CSS que a Task 4 escreve; todos lidos com fallback neutro):
  - `--opening-drift` (número, em vw; padrão `0`) — palavra com `data-drift="-1"` vai `translateX(calc(var(--opening-drift, 0) * -1vw))`, `data-drift="1"` o simétrico.
  - `--opening-bottom-shift` (vh, padrão `0`), `--opening-bottom-opacity` (padrão `1`) — no bloco de função, statement, CTAs e localização.
  - `--opening-hero-scale` (padrão `1`), `--opening-shade` (padrão `0`) — no hero e no seu `::after` (gradiente `transparent` → `rgb(22 19 15 / 0.55)`, cobrindo o hero, `pointer-events: none`).
  - `--opening-curve` (vh, padrão `0`) — altura do `::before` do Release: fundo `var(--surface)`, `bottom: 100%`, `border-radius: 50% 50% 0 0 / 100% 100% 0 0`.
- Markup do nome no `h1`:

```tsx
<h1 id="hero-name" className={styles.name}>
  <span className={styles.line}><span className={styles.drift} data-drift="-1"><span className={styles.word}>André</span></span></span>
  {' '}
  <span className={styles.line}><span className={styles.drift} data-drift="1"><span className={styles.word}>Arcodaci</span></span></span>
</h1>
```

  (gerado a partir de `person.name.split(' ')`: primeira palavra `-1`, as demais juntas na segunda linha com `1`). `.line` é `display: block; overflow-x: visible; overflow-y: clip`, com o mesmo respiro de descendente do protótipo (`padding-bottom: .06em; margin-bottom: -.06em`). `.drift` e `.word` são `inline-block`.
- Posicionamento fica para a Task 4: sem o `Opening` como pai, um hero `sticky` ficaria preso a página inteira e pintado por cima das seções seguintes. O bloco de baixo do hero precisa ser um elemento só para receber shift e opacidade — se o grid de 768/1200 px impedir, aplicar as duas propriedades em cada um dos quatro elementos (`role`, `statement`, `actions`, `location`) em vez de criar um wrapper.

- [ ] **Step 1: Write the failing test** — em `Hero.test.tsx`:
  - o teste existente `getByRole('heading', { level: 1, name: siteEn.person.name })` continua;
  - novo: `container.querySelectorAll('[data-drift]')` tem 2 elementos, com `data-drift` `-1` e `1` e textos `André` e `Arcodaci`;
  - novo: com `person.name` de três palavras (`'Ana Maria Souza'`), a segunda linha é `Maria Souza` e o nome acessível do `h1` é `'Ana Maria Souza'`.
- [ ] **Step 2: Run** `pnpm test src/sections/Hero; echo "exit=$?"` — Expected: FAIL.
- [ ] **Step 3: Implement** markup e CSS acima em Hero e Release.
- [ ] **Step 4: Run** `pnpm test; echo "exit=$?"` e `pnpm test:e2e; echo "exit=$?"` — Expected: PASS em tudo, incluindo `first-viewport`, `responsive`, `a11y` e o `motion.spec.ts` atual (zero animações). Conferir a olho em `pnpm dev` que a home está idêntica às capturas `docs/gate-2/home-*`.
- [ ] **Step 5: Commit** — `feat: hero e índice preparados para a abertura`

---

### Task 4: `Opening` — o movimento, a entrada e os guardas novos

**Files:**
- Create: `src/motion/Opening.tsx`, `src/motion/Opening.module.css`, `src/motion/Opening.test.tsx`
- Modify: `src/app/HomeRoute.tsx` (envolver `<Hero/>` e `<Release/>` em `<Opening>`)
- Modify: `src/sections/Hero/Hero.module.css` (transição da entrada; `.hero` ganha `position: sticky; top: 0; z-index: 0`)
- Modify: `src/sections/Release/Release.module.css` (`.release` ganha `position: relative; z-index: 1`)
- Rename + rewrite: `scripts/no-motion.test.ts` → `scripts/motion-guard.test.ts`
- Modify: `e2e/motion.spec.ts`
- Create: `e2e/opening.spec.ts`

**Interfaces:**
- Consumes: `openingProgress`, `openingFrame` (Task 1); `onScroll`, `scrollToTop` (Task 2); `prefersReducedMotion` (Task 2); contrato de custom properties (Task 3).
- Produces:

```tsx
/** Envolve [hero preso, folha que cobre]. O primeiro filho é o hero. */
export function Opening({ children }: { children: ReactNode }): JSX.Element
```

  Renderiza `<div className={styles.opening} data-entrance=...>`. `data-entrance` vale `'pending'` → `'run'` → `'done'`, ou não existe.

Comportamento:
- **Reduced motion:** não assina scroll, não escreve propriedades, não aplica `data-entrance`.
- **Frame:** em `useLayoutEffect`, escreve as propriedades uma vez (posição atual) e assina `onScroll` + `resize` da window; cada chamada lê `scrollY`, `innerHeight` e `innerWidth` e escreve as seis propriedades no próprio `div` (`style.setProperty`), arredondadas a 3 casas (`sin(π)` não é zero exato). Cancela tudo no unmount. O hero só fica preso dentro do `div` do `Opening`, que termina junto com o Release.
- **Entrada:** no mesmo `useLayoutEffect`, antes da pintura, se `scrollY === 0` aplica `data-entrance="pending"`; depois de `document.fonts.ready` (ou imediatamente se `document.fonts` não existir) e de um frame, troca para `'run'`; no `transitionend` da segunda palavra, `'done'`. Rolado (`scrollY > 0`) não aplica nada.
- **Foco:** `focusin` no primeiro filho com `scrollY > 0` → `scrollToTop()`.
- CSS da entrada, em `Hero.module.css` (seletores de atributo não são renomeados pelo CSS Modules):

```css
[data-entrance='pending'] .word { transform: translateY(105%); }
[data-entrance='run'] .word { transition: transform 1.1s cubic-bezier(0.2, 0.7, 0, 1); }
[data-entrance='run'] .line + .line .word { transition-delay: 120ms; }
```

  (o `{' '}` entre as linhas é nó de texto, então `.line + .line` pega a segunda).
- `.word` leva `data-motion="entrance"`: é a marca que o guarda em runtime aceita.

- [ ] **Step 1: Rewrite the static guard** — `scripts/motion-guard.test.ts`: o mesmo regex do arquivo antigo; falha se uma declaração de `animation`/`transition` aparecer fora de `ALLOWED = ['src/sections/Hero/Hero.module.css']`, ou se aparecer nesse arquivo fora de uma regra cujo seletor contenha `[data-entrance='run']`. Apagar `scripts/no-motion.test.ts`.
- [ ] **Step 2: Rewrite the runtime guard** — `e2e/motion.spec.ts`:
  - `reduce`: como hoje — zero `getAnimations()` e nenhum elemento com duração > 0 — mais `data-entrance` ausente e `html` sem a classe `lenis`.
  - `no-preference`: esperar `data-entrance` virar `done`; então nenhum elemento **sem** `data-motion` tem duração de `transition`/`animation` > 0, e `getAnimations()` vazio.
- [ ] **Step 3: Write the unit test** — `Opening.test.tsx` (jsdom):
  - com reduce: renderiza os filhos, sem `data-entrance`, sem `--opening-drift` no `style`;
  - sem reduce e `scrollY = 0`: `data-entrance` é `'pending'` logo depois do `render` e vira `'run'` (`waitFor`);
  - sem reduce e `window.scrollY = 900`, `innerHeight = 900`, `innerWidth = 1440`: sem `data-entrance`; `style.getPropertyValue('--opening-drift')` é `'25'` e `--opening-curve` é `'0'` (aceitar formatação numérica equivalente);
  - `innerWidth = 390` com o mesmo scroll: `--opening-drift` é `'40'`;
  - `focusin` num link dentro do primeiro filho com `scrollY = 900` chama `scrollToTop` (`vi.mock('./smoothScroll.ts')`).
- [ ] **Step 4: Write the e2e** — `e2e/opening.spec.ts`, `no-preference`, nos três viewports de `e2e/routes.ts`:
  - em `/`, esperar `data-entrance` = `done`; rolar uma altura de tela (`page.mouse.wheel(0, innerHeight)` e esperar o Lenis assentar); a palavra `data-drift="-1"` tem `translateX` negativo e a `1` positivo, de módulo `25vw` (1440 e 768) ou `40vw` (390) ±2 px; o topo do `nav` do índice está em ≤ 1 px;
  - abrir `/#work` direto: sem `data-entrance`; rolar até o topo; o `.word` não tem transform (o nome está no lugar);
  - em 1440×900, rolar meia tela, `setViewportSize(390, 844)`, esperar um frame: o módulo do afastamento passa à escala de 40 vw;
  - rolar até o índice, focar o primeiro link do índice, `Shift+Tab` até o link `site.hero.ctaSecondary` do hero: o CTA fica visível — `document.elementFromPoint` no centro do CTA devolve o próprio CTA.
  - `reduce`: em `/`, o `.word` não tem transform já no primeiro `screenshot`/avaliação, sem esperar nada.
- [ ] **Step 5: Run** `pnpm test; echo "exit=$?"` e `pnpm test:e2e; echo "exit=$?"` — Expected: FAIL nos testes novos (e o guarda estático ainda passa, porque nada foi adicionado).
- [ ] **Step 6: Implement** `Opening` e o CSS da entrada; ligar na `HomeRoute`. `Opening.module.css` só precisa de `.opening { position: relative; }` se o sticky pedir; se não pedir, não criar o arquivo.
- [ ] **Step 7: Run** de novo — Expected: PASS, `exit=0` nos dois. Ver o guarda estático falhar uma vez (colar `transition: opacity 1s` em `Release.module.css`) e o runtime falhar uma vez (tirar o `data-motion` do `.word`) antes de aceitar o verde.
- [ ] **Step 8: Check by eye** — também que, depois que o Release passa, a seção Work não fica atrás do hero —, em `pnpm dev`, 1440 e 390 (DevTools), lado a lado com `docs/fase-3/prototipo/desktop.html` e `mobile.html` abertos no navegador: entrada, afastamento, curva e sombra iguais.
- [ ] **Step 9: Commit** — `feat: abertura da home — nome se afastando e folha com borda curva`

---

### Task 5: Documentação

**Files:**
- Rewrite: `docs/MOTION_SPEC.md`
- Modify: `docs/ARCHITECTURE.md`, `docs/SPEC.md` (§5.3), `docs/DESIGN_DECISIONS.md`, `README.md`

- [ ] **Step 1: `MOTION_SPEC.md`** — reescrever para a direção Editorial Rolodex. Princípios e regras globais curtos (os de `SPEC.md` §5 que continuam valendo) e uma ficha por efeito — entrada do nome, afastamento, folha com borda curva, scroll suave — no formato de `SPEC.md` §5.4: objetivo, elemento, gatilho, estados inicial e final, duração e easing, alternativa reduced-motion, fallback sem JS, evidência (`docs/gate-3/`). Valores exatamente os de Global Constraints. Fechar com "Próximos efeitos: ver `docs/BACKLOG.md`".
- [ ] **Step 2: `ARCHITECTURE.md`** — trocar "Nenhum `animation` nem `transition` (motion é a Fase 3)" por: só `Hero.module.css` declara transição, e só sob `[data-entrance='run']`; movimento por scroll vem de `--opening-*` escritas pelo `Opening`; guardas em `scripts/motion-guard.test.ts` e `e2e/motion.spec.ts`. Acrescentar `motion/` à árvore de pastas, com uma linha por arquivo.
- [ ] **Step 3: `SPEC.md` §5.3** — abaixo da linha "Sem scroll hijacking, smooth scrolling forçado ou seções presas por padrão", acrescentar: "Exceção autorizada pelo dono em 2026-10-26: scroll suave (Lenis, desligado em reduced motion) e o hero preso sob a folha do índice — ver `docs/superpowers/specs/2026-10-26-fase-3-motion-design.md`."
- [ ] **Step 4: `DESIGN_DECISIONS.md`** — nova seção `## D-Motion — Tecnologia da Fase 3`, no formato das outras: status (decidida na Fase 3, 2026-10-26), decisão (Lenis 1.3.26 + funções próprias e custom properties; sem GSAP nem WebGL), motivo (os efeitos são funções simples do scroll e uma transição CSS; `SPEC.md` §9 só aceita GSAP se um efeito aprovado provar necessidade), alternativas (GSAP ScrollTrigger; CSS `animation-timeline: scroll()` — descartada por suporte desigual no Safari na data).
- [ ] **Step 5: `README.md`** — a linha de estado passa a dizer que a Fase 3 implementou a abertura da home e o scroll suave, aguardando o Gate 3.
- [ ] **Step 6: Run** `pnpm format:check; echo "exit=$?"` — Expected: `exit=0` (docs e `*.md` estão no `.prettierignore`; conferir que nada de código mudou de formatação).
- [ ] **Step 7: Commit** — `docs: motion spec da abertura e exceção de scroll suave`

---

### Task 6: Gate 3 — evidências e verificação final

**Files:**
- Create: `e2e/gate-3.capture.ts`, `docs/gate-3/README.md`, `docs/gate-3/*.png`

- [ ] **Step 1: Write** `e2e/gate-3.capture.ts` no molde de `e2e/gate-2.capture.ts`: para `/` e `/pt`, nos três viewports de `e2e/routes.ts`, sem reduced motion, esperar `data-entrance` = `done`, capturar a primeira dobra em `p = 0`, `0.5` e `1` (rolando `0`, `innerHeight/2`, `innerHeight` e esperando o Lenis assentar), em `docs/gate-3/home-<viewport>-<locale>-p<0|50|100>.png`; e uma captura com `reducedMotion: 'reduce'` em `p = 0.5` por viewport.
- [ ] **Step 2: Run** `pnpm capture; echo "exit=$?"` — Expected: `exit=0` e 24 PNGs em `docs/gate-3/`.
- [ ] **Step 3: Run** `pnpm validate; echo "exit=$?"` — Expected: `exit=0`.
- [ ] **Step 4: Write** `docs/gate-3/README.md`: o que foi entregue, as capturas, a comparação com `docs/fase-3/prototipo/` (diferenças encontradas, se houver), e a pendência do dono — abrir o site no celular real (`pnpm build:preview && pnpm preview --host`, acessando pelo IP da máquina na mesma rede) e julgar a fluidez; e uma gravação ou medição de fluidez no Chrome desktop (DevTools → Performance, rolando a abertura: sem frames longos acima de 50 ms).
- [ ] **Step 5: Commit** — `docs: evidências do gate 3`
- [ ] **Step 6: Hand to owner** — o Gate 3 só fecha com o dono vendo no celular. Não fazer merge na `main` antes disso.
