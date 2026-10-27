# Motion

- **Direção:** Editorial Rolodex (`docs/DESIGN_DECISIONS.md`)
- **Estado:** Fase 3 — abertura da home e scroll suave implementados,
  aprovados no Gate 3 (`docs/gate-3/README.md`); segunda leva (hover nos links
  de ação e na lista de trabalhos) implementada, com evidência em
  `docs/fase-3/segunda-leva/`
- **Design aprovado:** `docs/superpowers/specs/2026-10-26-fase-3-motion-design.md`
  e, para a segunda leva,
  `docs/superpowers/specs/2026-10-27-fase-3-hover-design.md`
- **Referência visual:** `docs/fase-3/prototipo/desktop.html` e
  `docs/fase-3/prototipo/mobile.html` — a função `frame()` de cada um é o
  comportamento aprovado

O movimento expressa hierarquia e continuidade. Nunca esconde conteúdo, prende
o foco ou substitui o desenho da informação.

## Regras globais

Valem para todo efeito, este e os próximos. Vêm de `docs/SPEC.md` §5.

- **Reduced motion** (`prefers-reduced-motion: reduce`): sem scroll suave, sem
  entrada, sem afastamento, escala, sombra ou curva. Sem movimento: os estados
  de hover e foco aparecem na hora.
- **Hover só com ponteiro fino:** todo estado de hover fica sob
  `(hover: hover) and (pointer: fine)`, para um toque não deixar nada preso. Os
  estados de foco (`:focus-visible`, e `:has(:focus-visible)` no lugar de
  `:focus-within`) valem em qualquer dispositivo. Só o foco de teclado: um
  clique ou toque também foca, e `:focus-within` deixaria o estado preso.
- **Sem JS:** nenhum conteúdo nasce escondido ou fora do lugar no CSS. Estado
  escondido só existe sob um atributo que o script aplica quando vai animar.
- **Navegação nunca espera animação:** links funcionam em `t = 0`; troca de
  idioma e abertura de case study não aguardam nada.
- **Teclado:** foco por teclado num elemento coberto por movimento o traz de
  volta à vista. Só teclado (`:focus-visible`): um clique também foca, e mover
  a página entre mousedown e mouseup engoliria o clique.
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
- `src/motion/magnet.ts` — o `useMagnet` e a conta do puxão do magnético.
- `src/components/ActionLink/` — o link de ação (traço que corre, magnético e
  slot da prévia), usado nos CTAs do hero e nos canais do contato.
- `src/components/ProjectThumb/` — a miniatura 4:3 (imagem ou placeholder),
  usada na ficha e na tira de capas.
- `src/components/CoverStrip/` — a tira de capas da prévia do CTA primário.
- `src/sections/Work/Work.module.css` — a reação tipográfica da lista.
- Guardas: `scripts/motion-guard.test.ts` (`transition` e `animation`, inclusive
  `@keyframes`, só dentro de `@media (prefers-reduced-motion: no-preference)`;
  a exceção antiga é a entrada do `Hero.module.css`, sob
  `[data-entrance='run']`) e `e2e/motion.spec.ts` (com reduce, zero animação,
  inclusive depois de hover e foco; sem reduce, só elementos com `data-motion`
  têm duração e, em repouso, `getAnimations()` é zero). Valores de
  `data-motion`: `action-link`, `trace`, `peek`, `thumb`, `slip`, `slip-title`.

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
| Elemento | O Release (folha `--surface`) sobe no fluxo; o hero fica preso no topo (`[data-opening]`; com `top` negativo se não couber na janela, para rolar até o fim antes de parar), encolhe e escurece; em volta dele aparece `--ink` |
| Gatilho | Scroll, nos dois sentidos |
| Estado inicial | Borda reta, hero em `scale(1)`, sem sombra |
| Estado final | Curva `sin(π·p) × 14 vh` (≥ 768 px) ou `× 7 vh` (< 768 px): zero no começo e no fim, máxima no meio; hero até `scale(0.94)`; sombra de `--ink` transparente → 55 %, até opacidade 0,9 |
| Duração e easing | Acompanha o scroll |
| Reduced motion | Sem curva, escala nem sombra, e o hero no fluxo normal, como no Gate 2 (preso, um Shift+Tab deixaria o foco sob a folha) |
| Sem JS | Igual ao reduced motion |
| Limitação aceita | A folha cobre o nome antes do afastamento terminar (ver `docs/BACKLOG.md`) |
| Evidência | `docs/gate-3/` |

### Scroll suave

| | |
|---|---|
| Objetivo | Continuidade: o scroll da roda e do trackpad desliza em vez de saltar |
| Elemento | A página inteira (Lenis 1.3.26, `lerp 0.09`) |
| Gatilho | Roda do mouse, trackpad, links de âncora |
| Estado inicial / final | — |
| Duração e easing | Interpolação do Lenis; âncoras com a duração padrão dele |
| Toque | Nativo (padrão do Lenis) |
| Reduced motion | Lenis não é iniciado; scroll nativo e salto direto para âncoras |
| Sem JS | Scroll nativo |
| Navegação | O `ScrollManager` é o único dono da rolagem: intercepta cliques em links `#hash` (sem o salto nativo), navega pelo router, rola por `scrollToTarget`/`scrollToTop`, foca o destino e remede a página a cada navegação (o Lenis só remede sozinho com 250 ms de atraso). O Lenis roda sem `anchors` |
| Evidência | `e2e/smooth-scroll.spec.ts` |

### Sublinhado que corre

| | |
|---|---|
| Objetivo | O link de ação responde ao cursor e ao foco sem mudar de tamanho nem de cor de texto |
| Elemento | O traço (`data-motion="trace"`) sob os dois CTAs do hero e os dois canais do contato (GitHub, LinkedIn), dentro do `ActionLink` |
| Gatilho | Hover (só com ponteiro fino) e `:focus-visible` |
| Estado inicial | O do Gate 2: CTA primário 2 px em `--accent`; secundário 1 px em `--rule`; canais em `--rule` com a espessura do sublinhado automático do Chromium, `max(1px, round(down, 0.1em, 1px))` — 2 px com `--text-lead` a partir de 20 px (desktop), 1 px abaixo disso —, cobrindo texto e dica, sem a seta ↗ |
| Estado final | O traço termina em `--accent` nos quatro; espessura e cor do texto não mudam |
| Duração e easing | 0,7 s, `cubic-bezier(0.2, 0.7, 0, 1)`. `scaleX` sai pela direita (origem à direita) até 45 %, volta crescendo com origem à esquerda |
| Reduced motion | Sem animação: o traço já aparece vermelho no hover e no foco |
| Sem JS | Funciona igual (só CSS) |
| Evidência | `docs/fase-3/segunda-leva/hero-cta-hover-1440.png`, `contato-github-foco-1440.png`; `e2e/hover.spec.ts` |

### Magnético

| | |
|---|---|
| Objetivo | O link é levemente atraído pelo cursor |
| Elemento | O `<a>` do `ActionLink` (`data-motion="action-link"`), nunca o bloco `.actions` do hero, que tem o `transform` da abertura |
| Gatilho | `pointermove` com `pointerType === 'mouse'` sobre o link; `pointerleave` devolve |
| Estado inicial | `--magnet-x/--magnet-y` em 0 |
| Estado final | `x = 0,25 × dx`, `y = 0,35 × dy` (px), com dx e dy a distância do cursor ao centro do link. O `getBoundingClientRect` inclui a translação do próprio link, então o puxão efetivo fica um pouco abaixo de 0,25/0,35 (igual ao protótipo aprovado) |
| Duração e easing | `transform` em 0,3 s, `cubic-bezier(0.2, 0.7, 0, 1)`; o valor é escrito no evento, sem laço de `requestAnimationFrame` |
| Reduced motion | Não existe: o `onMove` lê a media query a cada movimento e não escreve nada; o hook escuta a mudança, e ligar o reduce no meio da sessão apaga `--magnet-x/--magnet-y` na hora |
| Teclado e toque | Não reagem (só `pointerType === 'mouse'`) |
| Sem JS | Não existe |
| Evidência | `e2e/hover.spec.ts` (puxa, teclado não puxa, abertura e magnético não se sobrescrevem) |

### Prévias dos links de ação (tira e cartão)

| | |
|---|---|
| Objetivo | Mostrar, antes do clique, o que há do outro lado do link |
| Elemento | O slot `data-motion="peek"`, irmão do `<a>`: no CTA primário, a tira de capas (`CoverStrip`, uma miniatura de 96 px por projeto da lista, giradas de leve); em GitHub e LinkedIn, um cartão de 280 px (monograma, endereço = `href` sem `https://`, linha curta) |
| Gatilho | Hover (só com ponteiro fino) e `:focus-visible` do link. O cartão também fica aberto com o cursor sobre ele (`.wrapper:hover`), com uma ponte invisível cobrindo o vão de 12 px até o link |
| Dispensa | `Escape`, com a prévia aberta por hover ou foco, a esconde (`data-peek="dismissed"` no wrapper do `ActionLink`) até o cursor sair do wrapper e o foco sair do link. Só atributo no DOM: sem estado React, sem rAF |
| Estado inicial | `visibility: hidden`, `opacity: 0`, `translateY(8px)` |
| Estado final | `visible`, `opacity: 1`, sem deslocamento |
| Duração e easing | Entra em 0,3 s (opacidade) e 0,4 s (`transform`), `cubic-bezier(0.2, 0.7, 0, 1)`; na saída `visibility` espera o fade |
| Posição | Tira: só a partir de 1200 px, acima do CTA, nas colunas 8–12 ao lado do nome; abaixo disso `display: none`, pois não há espaço livre junto a função e statement. Cartão: abaixo do link; abaixo de 768 px os dois cartões abrem sob a linha dos canais, ancorados na lista. O contato tem piso de respiro inferior (`--sheet-pad-block-end: max(clamp(48px, 10vh, 112px), 9.25rem)`) para o cartão aberto caber na folha sem cobrir o rodapé |
| Acessibilidade | `aria-hidden`, sem texto novo para leitor de tela; a dica de nova aba vem do `hint` do link. WCAG 1.4.13: as duas prévias se dispensam com `Escape`; o cartão aceita o cursor (`pointer-events: auto`, só com ponteiro fino). A tira fica com `pointer-events: none`: é decorativa e redundante (as mesmas imagens das fichas da lista), então não precisa ser alcançável pelo cursor |
| Reduced motion | Sem transição: a prévia aparece e some na hora |
| Sem JS | Funciona (só CSS) |
| Evidência | `docs/fase-3/segunda-leva/hero-cta-hover-1440.png`, `contato-github-foco-1440.png`; `e2e/hover.spec.ts` (a tira não cobre o hero em 1440, 1200, 768 e 390; os dois cartões não cobrem o outro canal nem o rodapé, também em 1366×650; o cursor passa do link ao cartão; `Escape` esconde; nos dois idiomas) |

### Miniatura da ficha

| | |
|---|---|
| Objetivo | A lista de trabalhos ganha imagem, e a imagem não depende de hover |
| Elemento | `ProjectThumb` (`data-motion="thumb"`) em cada `ProjectSlip`: 4:3, 168 px a partir de 768 px, 96 px abaixo disso, ao lado de meta e título. Com `cover`, a imagem de 800 px (`loading="lazy"`, `alt=""`); sem, o placeholder escuro em HTML/CSS, `aria-hidden`. Não é link |
| Gatilho | Hover da ficha (só com ponteiro fino) e foco de teclado dentro dela (`:has(:focus-visible)`) |
| Estado inicial | `scale(1)` dentro da moldura, que corta o excesso |
| Estado final | `scale(1.06)` |
| Duração e easing | 0,6 s, `cubic-bezier(0.2, 0.7, 0, 1)` |
| Reduced motion | Sem transição: a escala vale na hora |
| Sem JS | Funciona; a miniatura está sempre visível |
| Evidência | `docs/fase-3/segunda-leva/lista-hover-1440.png`, `lista-mobile-390.png` |

### Reação tipográfica

| | |
|---|---|
| Objetivo | Marcar o alvo na lista de trabalhos sem sublinhado |
| Elemento | A ficha (`data-motion="slip"`) e o título dela (`data-motion="slip-title"`), por seletores em `Work.module.css` |
| Gatilho | Hover da ficha (só com ponteiro fino) e foco de teclado dentro dela (`:has(:focus-visible)`, não `:focus-within`: um clique ou toque num link da ficha, que abre nova aba, deixaria a lista esmaecida presa) |
| Estado inicial | Título no lugar, fichas com opacidade 1 |
| Estado final | Título em `translateX(clamp(16px, 3vw, 48px))`; as outras fichas em opacidade 0,35. Com o foco numa ficha e o cursor em outra, as duas ficam acesas |
| Duração e easing | Opacidade 0,35 s, título 0,45 s, `cubic-bezier(0.2, 0.7, 0, 1)`; as transições ficam declaradas também em repouso, para o estado desfazer igual |
| Contraste | Com 0,35, o texto das outras fichas fica deliberadamente abaixo de AA enquanto o cursor está numa ficha; o axe roda sem hover e não vê isso (aprovado pelo dono no protótipo) |
| Toque | O tap não esmaece nada: o hover não vale sem ponteiro fino, e o foco do toque não é `:focus-visible` |
| Reduced motion | Sem transição: o estado final vale na hora |
| Sem JS | Funciona (só CSS) |
| Evidência | `docs/fase-3/segunda-leva/lista-hover-1440.png`; `e2e/hover.spec.ts` |

## Próximos efeitos

Ver `docs/BACKLOG.md`, seções "Interação e motion".
