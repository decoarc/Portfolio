# Fase 3, segunda leva — Texto que acende com o scroll — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A introdução da Abordagem e o lead do Sobre acendem palavra por palavra, guiados pela rolagem, de forma contínua e reversível, sem afetar leitor de tela, reduced motion nem o primeiro render.

**Architecture:** Um módulo puro (`src/motion/scrollLit.ts`) guarda os valores aprovados e a conta do progresso. Um componente `LitText` renderiza o parágrafo: no primeiro render, texto simples e aceso. Depois de montar, se não houver reduced motion, ele passa a renderizar uma cópia `.visually-hidden` com a frase inteira e as palavras em `span`s `aria-hidden`. Em seguida aplica `data-lit` e escreve uma custom property `--lit` (progresso em palavras) a cada evento de `onScroll`. A opacidade de cada palavra sai em CSS de `--lit` e do índice `--i`. Não há `transition` nem `animation`: a suavidade vem do Lenis.

**Tech Stack:** React 19, TypeScript 5.9, CSS Modules, Lenis 1.3.26 (já instalado), Vitest 5 + Testing Library + jsdom, Playwright 1.64 + @axe-core/playwright.

**Spec:** `docs/superpowers/specs/2026-10-27-fase-3-texto-acende-design.md`. Referência visual: `docs/fase-3/prototipo/texto-acende.html` (abre na configuração aprovada; a função `frame()` é a conta aprovada).

## Global Constraints

- Branch `fase-3-texto-acende`. Nenhuma dependência nova.
- **Valores aprovados:** opacidade apagada `0.2`; suavidade `2.5` palavras; começa quando o **topo** do parágrafo cruza `0.8 × innerHeight`; termina quando o **fim** cruza `0.5 × innerHeight`.
- **Conta:** `from = top − 0.8·vh`; `to = bottom − endLine`; `t = clamp(0, from / (from − to), 1)`; `lit = t × (n + 2.5)`; palavra `i`: `opacity = 0.2 + 0.8 × clamp(0, (lit − i) / 2.5, 1)`.
- **Guarda do fim da página:** `endLine = max(0.5·vh, bottom − remaining)`, onde `remaining = scrollHeight − innerHeight − scrollY` (≥ 0). Na rolagem máxima, o parágrafo fica todo aceso.
- **Só dois lugares:** `approach.intro` (via `SectionHead`, só na Abordagem) e `about.lead`. O `SectionHead` de Work não muda.
- **Só `opacity` muda.** A cor de cada parágrafo continua a de hoje (`--ink` no lead, `--ink-muted` na intro).
- **Sem `transition`/`animation`** no efeito. Sem estado React por frame. Sem `requestAnimationFrame` próprio: assinar `onScroll` de `src/motion/smoothScroll.ts`.
- **Primeiro render aceso:** o estado apagado só existe sob `[data-lit]`, aplicado pelo efeito. Com reduced motion: texto simples, sem quebra, sem `data-lit`.
- **Leitor de tela:** nome acessível = a frase inteira; as palavras são `aria-hidden="true"`; a cópia `.visually-hidden` (classe global de `src/styles/global.css`) leva `user-select: none`, para copiar e colar não duplicar a frase.
- **Contraste (decisão do dono):** o estado apagado é exceção aceita. O gate de `e2e/a11y.spec.ts` continua exigindo zero `color-contrast` em violações e em incompletos, auditando os dois parágrafos **acesos**.
- **Nenhuma string voltada ao usuário em componente.**
- **Verificação sem `rtk`:** `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build:preview`, `pnpm test:e2e`, lendo o exit code com `; echo "exit=$?"`. `pnpm build`/`pnpm validate` falham por desenho enquanto houver mock (`docs/BACKLOG.md`). Toda verificação nova é vista falhando uma vez antes de o verde valer.
- **Servidor de preview velho:** o Playwright reaproveita um servidor na porta 4173 (`reuseExistingServer`). Antes do e2e, confira que nada escuta na 4173.
- Commits em português, `tipo: descrição`, terminando com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Trocar de idioma** com o parágrafo meio aceso: o texto novo (outra contagem de palavras) aparece no mesmo estado de progresso, sem palavras sobrando nem `--i` velho. Teste e2e na Task 3.
2. **Abrir direto em `/#about`** (o `ScrollManager` rola depois do render): o lead já aparece aceso na posição final, sem esperar um evento de scroll a mais. Teste e2e na Task 3.
3. **Celular (390×844, scroll nativo, sem Lenis no toque):** acende igual. Teste e2e na Task 3.
4. **Fim da página numa tela alta:** na rolagem máxima, as duas frases ficam com todas as palavras em opacidade 1. Teste unitário na Task 1 e e2e na Task 3.
5. **Leitor de tela e cópia:** o parágrafo tem como nome a frase exata, só uma vez; o texto selecionável é a frase uma vez. Testes nas Tasks 2 e 3.

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `src/motion/scrollLit.ts` (+ `scrollLit.test.ts`) | `SCROLL_LIT` e `litProgress()` puro |
| `src/components/LitText/LitText.tsx`, `LitText.module.css`, `index.ts`, `LitText.test.tsx` | O parágrafo que acende |
| `src/components/SectionHead/SectionHead.tsx` (+ teste) | Prop `litIntro` |
| `src/sections/Approach/Approach.tsx`, `src/sections/About/About.tsx` | Adotam o efeito |
| `e2e/lit-text.spec.ts` (novo), `e2e/a11y.spec.ts` | Comportamento; contraste no estado aceso |
| `docs/MOTION_SPEC.md`, `docs/BACKLOG.md` | Ficha e backlog |

---

### Task 1: A conta do progresso

**Files:**
- Create: `src/motion/scrollLit.ts`
- Test: `src/motion/scrollLit.test.ts`

**Interfaces:**
- Produces:
  - `SCROLL_LIT: { dim: 0.2; soft: 2.5; start: 0.8; end: 0.5 }` (`as const`)
  - `interface LitBox { top: number; bottom: number }`
  - `litProgress(box: LitBox, viewportHeight: number, remaining: number, words: number): number`: devolve `lit = t × (words + soft)`, já com a guarda do fim da página. `remaining` negativo é tratado como 0.

- [ ] **Step 1: Write the failing tests** (`vh = 1000`, `words = 10`, logo `lit` máximo = `12.5`)

```ts
describe('litProgress', () => {
  it('apagado até o topo cruzar 80% da janela', () => {
    expect(litProgress({ top: 900, bottom: 1000 }, 1000, 5000, 10)).toBe(0)
    expect(litProgress({ top: 800, bottom: 900 }, 1000, 5000, 10)).toBe(0)
  })
  it('aceso quando o fim cruza 50% da janela, e depois', () => {
    expect(litProgress({ top: 400, bottom: 500 }, 1000, 5000, 10)).toBe(12.5)
    expect(litProgress({ top: -300, bottom: -200 }, 1000, 5000, 10)).toBe(12.5)
  })
  it('no meio do caminho, metade', () => {
    // from = 600 − 800 = −200; to = 700 − 500 = 200; t = 0.5
    expect(litProgress({ top: 600, bottom: 700 }, 1000, 5000, 10)).toBeCloseTo(6.25)
  })
  it('fim da página: na rolagem máxima fica aceso mesmo abaixo de 50%', () => {
    expect(litProgress({ top: 700, bottom: 800 }, 1000, 0, 10)).toBe(12.5)
    expect(litProgress({ top: 900, bottom: 1000 }, 1000, 0, 10)).toBe(12.5)
  })
  it('fim da página: a linha de término é estável enquanto se rola até lá', () => {
    // fim do parágrafo na rolagem máxima = 800 − 200 = 600 > 500
    const a = litProgress({ top: 900, bottom: 1000 }, 1000, 200, 10) // from 100 > 0
    const b = litProgress({ top: 750, bottom: 850 }, 1000, 50, 10)
    expect(a).toBe(0)
    expect(b).toBeGreaterThan(0)
    expect(b).toBeLessThan(12.5)
  })
  it('remaining negativo (overscroll) conta como 0', () => {
    expect(litProgress({ top: 700, bottom: 800 }, 1000, -40, 10)).toBe(12.5)
  })
})
```

- [ ] **Step 2: Run** `pnpm exec vitest run src/motion/scrollLit.test.ts; echo "exit=$?"`. Expected: FAIL (módulo não existe), exit ≠ 0.

- [ ] **Step 3: Implement `SCROLL_LIT` and `litProgress` in `src/motion/scrollLit.ts`**, com a conta das Global Constraints e um comentário de cabeçalho no estilo de `opening.ts` (fonte: protótipo e spec). Quando `from − to` for 0, devolver o máximo se `from ≤ 0`, senão 0.

- [ ] **Step 4: Run** o mesmo comando. Expected: PASS, `exit=0`.

- [ ] **Step 5: Commit** — `feat: conta do texto que acende com o scroll`

---

### Task 2: `LitText` e as duas seções

**Files:**
- Create: `src/components/LitText/LitText.tsx`, `LitText.module.css`, `index.ts`, `LitText.test.tsx`
- Modify: `src/components/SectionHead/SectionHead.tsx`, `SectionHead.test.tsx`, `src/sections/Approach/Approach.tsx`, `src/sections/About/About.tsx`

**Interfaces:**
- Consumes: `SCROLL_LIT`, `litProgress` (Task 1); `onScroll` de `src/motion/smoothScroll.ts`; `prefersReducedMotion` de `src/motion/reducedMotion.ts`.
- Produces:
  - `LitText({ text, className }: { text: string; className?: string })`: renderiza um `<p>`.
  - Marcação depois de montar (sem reduced motion): `<p class=… data-lit style="--lit:…">` com `<span class="visually-hidden …">{text}</span>` e um `<span aria-hidden="true">` com uma `<span class={styles.word} style="--i:N">` por palavra (`text.split(/\s+/)` do texto aparado; pontuação fica com a palavra), separadas por espaço de texto.
  - `SectionHead` ganha `litIntro?: boolean` (padrão `false`): com `true`, a intro é `<LitText className={styles.intro} text={intro} />`.

- [ ] **Step 1: Write the failing tests** em `LitText.test.tsx`, mockando `../../motion/smoothScroll.ts` (`onScroll: vi.fn(() => () => undefined)`) e `../../motion/reducedMotion.ts` como em `src/motion/Opening.test.tsx`:
  - `'o primeiro render é o texto simples, aceso'`: renderiza com `renderToString` (de `react-dom/server`) e espera `<p>` com o texto exato, sem `data-lit` e sem `aria-hidden`.
  - `'depois de montar, quebra em palavras escondidas do leitor de tela'`: `getByRole('paragraph')` tem `data-lit`; `container.querySelectorAll('[aria-hidden="true"] span')` tem uma por palavra, com `--i` de `0` a `n−1`; `getByText(text)` acha a cópia, com a classe `visually-hidden`.
  - `'assina o scroll e escreve --lit'`: `onScroll` foi chamado uma vez, e `--lit` está definido no `<p>` depois do primeiro cálculo (feito na montagem, sem esperar scroll).
  - `'com reduced motion não quebra nem assina'`: `reduce = true` → `<p>` com o texto simples, sem `data-lit`, e `onScroll` não chamado.
  - `'trocar o texto refaz as palavras'`: `rerender` com outra frase → as palavras e a cópia são as da frase nova.
  - `'desmontar cancela a assinatura'`: o retorno de `onScroll` é chamado.
  - Em `SectionHead.test.tsx`: `'litIntro liga o efeito só quando pedido'`: sem a prop, o `<p>` da intro não tem `data-lit`; com `litIntro`, tem.

- [ ] **Step 2: Run** `pnpm exec vitest run src/components/LitText src/components/SectionHead; echo "exit=$?"`. Expected: FAIL, exit ≠ 0.

- [ ] **Step 3: Implement `LitText`**:
  - O estado `split` (booleano, começa `false`) muda **uma vez**, num `useLayoutEffect`, quando `!prefersReducedMotion()`. Não há estado por frame.
  - Um segundo `useLayoutEffect` (depende de `split` e `text`): quando `split` é verdadeiro, aplica `data-lit` e define `write()`. `write()` lê `getBoundingClientRect()`, `innerHeight` e `remaining = documentElement.scrollHeight − innerHeight − scrollY`, e escreve `--lit` arredondado a 3 casas, só quando muda. Chama `write()` na hora, assina `onScroll(write)` e escuta `resize`. Também chama `write()` em `document.fonts.ready`, porque a altura muda com a fonte. Na limpeza, desfaz tudo e remove `data-lit`.
  - CSS em `LitText.module.css`: `[data-lit] .word { opacity: calc(0.2 + 0.8 * clamp(0, (var(--lit, 0) - var(--i)) / 2.5, 1)); }`. Os valores ficam duplicados de `SCROLL_LIT`, com um comentário apontando para ele. A cópia ganha `user-select: none` por uma classe do módulo, junto de `visually-hidden`.
  - `SectionHead`: a prop `litIntro`. `Approach` passa `litIntro`. `About` troca o `<p className={styles.lead}>` por `<LitText className={styles.lead} text={copy.lead} />`.

- [ ] **Step 4: Run** `pnpm exec vitest run; echo "exit=$?"`. Expected: PASS em tudo, inclusive `About.test.tsx` e `Approach.test.tsx` sem mudança (`getByText(lead)` acha a cópia). Se algum desses quebrar, ajustar o teste para o nome acessível do parágrafo, sem relaxar a asserção. Depois `pnpm typecheck; echo "exit=$?"` e `pnpm lint; echo "exit=$?"`, ambos `exit=0`.

- [ ] **Step 5: Commit** — `feat: intro da Abordagem e lead do Sobre acendem com o scroll`

---

### Task 3: Comportamento no navegador e o gate de contraste

**Files:**
- Create: `e2e/lit-text.spec.ts`
- Modify: `e2e/a11y.spec.ts`

**Interfaces:**
- Consumes: a marcação da Task 2 (`p[data-lit]`, `[aria-hidden="true"] span` com `--i`); `contentByLocale` de `src/content/index.ts`; `VIEWPORTS` de `e2e/routes.ts`.
- Produces: helpers locais `wordOpacities(page, text): Promise<number[]>` (opacidade calculada de cada palavra do parágrafo cuja cópia é `text`) e `settle(page)` (espera o scroll parar, como `settledScrollY` em `e2e/smooth-scroll.spec.ts`).

- [ ] **Step 1: Write the failing tests** em `e2e/lit-text.spec.ts` (`reducedMotion: 'no-preference'`, em `/` e `/pt`, para lead e intro):
  - `'apagado abaixo da linha de início'`: depois de carregar (entrada terminada), as opacidades do lead são todas `0.2` (±0.01).
  - `'aceso depois de passar'`: `window.scrollTo` até o fim do parágrafo ficar acima de 50% da janela, `settle` → todas `1`.
  - `'reversível'`: rola de volta ao topo → todas `0.2`.
  - `'no meio, cresce em ordem'`: com o fim do parágrafo entre as duas linhas, as opacidades não crescem da primeira palavra para a última, e há pelo menos um valor estritamente entre 0.2 e 1.
  - `'fim da página'` (viewport 1440×2400): rola até o fim → todas as palavras dos dois parágrafos em `1`.
  - `'abrir em /#about'`: as palavras do lead já aparecem em `1` depois de `settle`.
  - `'trocar de idioma'`: com o lead meio aceso, troca para pt pelo link do masthead e rola até o mesmo ponto. As palavras são as da frase pt (mesma contagem de `span`s que `pt.about.lead.split(/\s+/)`), e o `--i` máximo é `n−1`.
  - `'celular'` (390×844): apagado embaixo e aceso depois de passar.
  - `'leitor de tela e cópia'`: para cada `p[data-lit]`, `locator.ariaSnapshot()` contém a frase exata uma vez e nenhuma palavra solta; selecionar o parágrafo (`Range.selectNodeContents`) dá em `getSelection().toString()`, com espaços normalizados, a frase uma vez.
  - Um bloco `reducedMotion: 'reduce'`: `'sem efeito'` → nenhum `[data-lit]`, nenhuma palavra quebrada, e o `<p>` com o texto simples e opacidade 1.
  - Em `e2e/a11y.spec.ts`, só na home: depois da auditoria atual, rolar até o fim e `settle`, conferir que todas as palavras dos dois parágrafos estão em `1`, e rodar um segundo `AxeBuilder` com `.include('p[data-lit]')` e as mesmas tags, exigindo zero violações e zero incompletos de `color-contrast`. Na auditoria do topo, excluir **só** as palavras apagadas: `.exclude('p[data-lit] [aria-hidden="true"]')`, com um comentário que cite a decisão do dono e a spec.

- [ ] **Step 2: Run** com o build da Task 2 revertido (`git stash` dos arquivos de `src/`) ou antes de aplicá-la: `pnpm build:preview; pnpm exec playwright test e2e/lit-text.spec.ts e2e/a11y.spec.ts --project=chromium; echo "exit=$?"`. Expected: FAIL, exit ≠ 0. Restaurar o stash.

- [ ] **Step 3: Rodar a suíte inteira** com o código da Task 2: confirmar que nada escuta na 4173, depois `pnpm build:preview; echo "exit=$?"` e `pnpm test:e2e; echo "exit=$?"`. Expected: `exit=0` nos dois. Se `e2e/motion.spec.ts` acusar duração nas palavras, o efeito ganhou `transition` por engano: remover, não marcar.

- [ ] **Step 4: Commit** — `test: texto que acende no navegador e contraste no estado aceso`

---

### Task 4: Documentação

**Files:**
- Modify: `docs/MOTION_SPEC.md`, `docs/BACKLOG.md`

- [ ] **Step 1:** Em `docs/MOTION_SPEC.md`:
  - nova ficha "Texto que acende", no formato das demais (Objetivo, Elemento, Gatilho, Estado inicial/final, Duração e easing = "sem duração própria; acompanha a rolagem (Lenis)", Toque, Reduced motion, Sem JS, Navegação, Evidência = `e2e/lit-text.spec.ts`), com a exceção de contraste e a guarda do fim da página;
  - `src/motion/scrollLit.ts` e `src/components/LitText/` na lista "Onde o motion vive no código";
  - a linha "Estado" do topo atualizada.
- [ ] **Step 2:** Em `docs/BACKLOG.md`: remover a seção "Texto que acende com o scroll" e atualizar o parágrafo "Feitos em 2026-10-27…" (resta a cortina do case study).
- [ ] **Step 3:** `pnpm format:check; echo "exit=$?"` → `exit=0`.
- [ ] **Step 4: Commit** — `docs: ficha do texto que acende e backlog`
