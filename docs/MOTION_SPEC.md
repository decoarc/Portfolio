# Motion

- **Direção:** Editorial Rolodex (`docs/DESIGN_DECISIONS.md`)
- **Estado:** Fase 3 — abertura da home e scroll suave implementados,
  aguardando o Gate 3 (`docs/gate-3/README.md`)
- **Design aprovado:** `docs/superpowers/specs/2026-10-26-fase-3-motion-design.md`
- **Referência visual:** `docs/fase-3/prototipo/desktop.html` e
  `docs/fase-3/prototipo/mobile.html` — a função `frame()` de cada um é o
  comportamento aprovado

O movimento expressa hierarquia e continuidade. Nunca esconde conteúdo, prende
o foco ou substitui o desenho da informação.

## Regras globais

Valem para todo efeito, este e os próximos. Vêm de `docs/SPEC.md` §5.

- **Reduced motion** (`prefers-reduced-motion: reduce`): sem scroll suave, sem
  entrada, sem afastamento, escala, sombra ou curva. O site fica idêntico ao do
  Gate 2.
- **Sem JS:** nenhum conteúdo nasce escondido ou fora do lugar no CSS. Estado
  escondido só existe sob um atributo que o script aplica quando vai animar.
- **Navegação nunca espera animação:** links funcionam em `t = 0`; troca de
  idioma e abertura de case study não aguardam nada.
- **Teclado:** foco num elemento coberto por movimento o traz de volta à vista.
- **Desempenho:** só `transform` e `opacity` animam, mais a altura do
  pseudo-elemento da curva. Um laço de `requestAnimationFrame` só (o do Lenis);
  nenhum estado React por frame.
- **Exceção ao §5.3 da SPEC:** scroll suave e o hero preso sob a folha foram
  autorizados pelo dono em 2026-10-26.

### Onde o motion vive no código

- `src/motion/opening.ts` — valores aprovados e as contas de um frame.
- `src/motion/Opening.tsx` — envolve Hero e Release na home; escreve as
  `--opening-*` e conduz a entrada por `data-entrance`.
- `src/motion/smoothScroll.ts` — a instância única do Lenis.
- Guardas: `scripts/motion-guard.test.ts` (só `Hero.module.css` declara
  transição, e só sob `[data-entrance='run']`) e `e2e/motion.spec.ts` (com
  reduce, zero animação; sem reduce, só elementos com `data-motion` têm
  duração).

## Fichas

### Entrada do nome

| | |
|---|---|
| Objetivo | Momento autoral na chegada: o nome se apresenta antes de tudo |
| Elemento | As duas palavras do `h1` do hero ("André", "Arcodaci"), cada uma numa linha que corta o que passa da sua altura (a fenda) |
| Gatilho | Carregar a home com a página no topo e sem hash; começa depois de `document.fonts.ready` |
| Estado inicial | `translateY(105%)` — abaixo da fenda (`data-entrance="pending"`) |
| Estado final | No lugar (`data-entrance="done"`) |
| Duração e easing | 1,1 s, `cubic-bezier(0.2, 0.7, 0, 1)`; a segunda linha atrasa 120 ms |
| Reduced motion | Sem entrada: o nome aparece no lugar no primeiro frame |
| Sem JS | O atributo não existe; o nome está no lugar |
| Página aberta rolada | Deep link (`/#work`), recarregar no meio: sem entrada |
| Evidência | `docs/gate-3/` |

### Afastamento do nome

| | |
|---|---|
| Objetivo | O primeiro gesto de scroll separa o nome, abrindo a página |
| Elemento | "André" vai para a esquerda, "Arcodaci" para a direita; o bloco de baixo do hero (função, statement, CTAs, localização) sobe e apaga |
| Gatilho | Scroll, nos dois sentidos; `p = clamp(scrollY / innerHeight, 0, 1)` |
| Estado inicial | `p = 0`: tudo no lugar |
| Estado final | `p = 1`: palavras a `easeOutCubic(p) × 25 vw` (≥ 768 px) ou `× 40 vw` (< 768 px); bloco de baixo `p × 6 vh` acima, opacidade `1 − 1,4p` (mínimo 0) |
| Duração e easing | Acompanha o scroll; o Lenis suaviza (`lerp 0.09`) |
| Reduced motion | Nada se move |
| Sem JS | As propriedades não são escritas; padrões neutros |
| Evidência | `docs/gate-3/` |

### Folha com borda curva

| | |
|---|---|
| Objetivo | A virada de página: o índice sobe por cima do hero (D-Release) |
| Elemento | O Release (folha `--surface`) sobe no fluxo; o hero fica preso no topo, encolhe e escurece; em volta dele aparece `--ink` |
| Gatilho | Scroll, nos dois sentidos |
| Estado inicial | Borda reta, hero em `scale(1)`, sem sombra |
| Estado final | Curva `sin(π·p) × 14 vh` (≥ 768 px) ou `× 7 vh` (< 768 px): zero no começo e no fim, máxima no meio; hero até `scale(0.94)`; sombra de `--ink` transparente → 55 %, até opacidade 0,9 |
| Duração e easing | Acompanha o scroll |
| Reduced motion | Sem curva, escala nem sombra. O hero continua preso e a folha sobe por cima — é o próprio scroll, não animação |
| Sem JS | Igual ao reduced motion |
| Limitação aceita | A folha cobre o nome antes do afastamento terminar (ver `docs/BACKLOG.md`) |
| Evidência | `docs/gate-3/` |

### Scroll suave

| | |
|---|---|
| Objetivo | Continuidade: o scroll da roda e do trackpad desliza em vez de saltar |
| Elemento | A página inteira (Lenis 1.3.26, `lerp 0.09`, `anchors: true`) |
| Gatilho | Roda do mouse, trackpad, links de âncora |
| Estado inicial / final | — |
| Duração e easing | Interpolação do Lenis; âncoras com a duração padrão dele |
| Toque | Nativo (padrão do Lenis) |
| Reduced motion | Lenis não é iniciado; scroll nativo e salto direto para âncoras |
| Sem JS | Scroll nativo |
| Navegação | O `ScrollManager` rola por `scrollToTarget`/`scrollToTop` e remede a página a cada navegação (o Lenis só remede sozinho com 250 ms de atraso) |
| Evidência | `e2e/smooth-scroll.spec.ts` |

## Próximos efeitos

Ver `docs/BACKLOG.md`, seções "Interação e motion".
