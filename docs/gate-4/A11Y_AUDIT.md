# Fase 4 — Auditoria WCAG 2.2 AA

Auditoria do site renderizado (HTML pré-renderizado + hidratação), refeita
porque a afinação do M5 se perdeu na reescrita. Spec:
`docs/superpowers/specs/2026-10-27-fase-4-acabamento-design.md` §7. Formato:
`docs/m5/M5_AUDIT_AND_PLAN.md`.

**Data:** 2026-10-27. **Renderizador:** Playwright Chromium contra
`pnpm build:preview` + `pnpm preview` (127.0.0.1:4173, com o `_headers` e a
CSP do Cloudflare Pages). **Rotas:** `/`, `/pt`, `/work/token-killer`,
`/pt/work/map-areas`, `/nao-existe`, `/pt/nao-existe`. **Larguras:** 320, 390,
768 e 1440 (altura 844 abaixo de 768, 900 acima). Sem aparelho físico e sem
leitor de tela real: o NVDA fica com o dono no Gate 4.

**Método.** Scripts Playwright descartáveis (fora do repo) mediram cada item
abaixo; o que falhou virou teste em `e2e/a11y-audit.spec.ts` antes da
correção. Estilos de teste entram por `page.addStyleTag` (a CSP permite
estilo inline, não script inline).

## Pontuação por critério

0 = falha grave, 2 = falha pontual, 3 = passa com ressalva, 4 = passa.

| Critério | Método | Antes | Depois | Achado |
| --- | --- | --- | --- | --- |
| 1.4.4 Redimensionar texto | `html { font-size: 32px }` em 320 | 2 | 4 | "Arcodaci" cortado pelo `overflow-x: clip` do hero; CTA PT cortado; convite do contato além da tela (correções 3, 4, 8) |
| 1.4.10 Reflow | `scrollWidth` em 320 (texto normal e 200%) | 2 | 4 | Rolagem horizontal em `/`, `/pt` (cartões do contato), `/pt/work/map-areas` (stack) e masthead a 200% (correções 1, 2, 5) |
| 1.4.11 Contraste não textual | razão das cores calculadas | 3 | 3 | Foco 5,54:1 / 6,29:1. Filetes `--rule` 2,10:1 / 2,39:1, decorativos (aguardando o dono) |
| 1.4.12 Espaçamento de texto | estilo WCAG injetado, 4 larguras × 6 rotas | 2 | 4 | Stack do case vaza em 320 e 390; cartões do contato em 320 (correções 1, 2) |
| 1.4.13 Conteúdo no hover | `e2e/hover.spec.ts` (Escape, cartão que aceita o cursor) | 4 | 4 | — |
| 2.4.3 / 2.4.7 Ordem e foco visível | Tab e Shift+Tab, 390 e 1440, EN e PT | 4 | 4 | — |
| 2.4.11 Foco não escondido | `elementFromPoint` em 9 pontos do foco a cada Tab | 4 | 4 | — |
| 2.5.8 Tamanho do alvo | `getBoundingClientRect` de todo `a`/`button` | 4 | 4 | Menores de 24 px passam pela exceção de espaçamento |
| 3.1.1 / 3.1.2 Idioma | `lang` do `<html>` e do seletor | 4 | 4 | — |
| 4.1.2 Nome e papel | `ariaSnapshot` | 4 | 4 | — |
| Leitor de tela (árvore) | `ariaSnapshot` de `main`, home e case, EN e PT | 4 | 4 | NVDA real fica com o dono no Gate 4 |
| Alto contraste (`forced-colors`) | emulação + capturas + axe | 2 | 4 | A borda da folha que sobe sumia na abertura (correção 7) |
| Reduced motion no meio da sessão | `emulateMedia` + `goBack` | 2 | 4 | Fade padrão de 250 ms da View Transition (correção 6) |
| **Total** | | **41/52** | **51/52** | **Antes: bom, corrigir P1 e P2. Depois: P0–P2 corrigidos; resta a decisão do dono sobre os filetes** |

**Para o dono:** a 200% de texto em 320 px, o nome do hero e algumas palavras
longas (títulos de seção, convite do contato) quebram no meio da palavra
("Arcoda/ci"). É o efeito de `overflow-wrap: anywhere`, a correção mínima dos
achados 3, 4 e 8: sem ela a palavra era cortada ou passava da tela. Com texto
normal nada quebra.

## O que já vale

- **Ordem do Tab (2.4.3).** Home: skip link → marca → idioma → os dois CTAs →
  as cinco entradas do índice → "Live demo" → os títulos das três fichas com
  case → GitHub → LinkedIn. Case: skip link → marca → idioma → "Voltar" →
  links da ficha técnica. Igual em EN e PT.
- **Foco visível (2.4.7) e não escondido (2.4.11).** Todos os 32 passos de Tab
  e Shift+Tab da home e os do case, em 390 e 1440, com `outline` sólido e os 9
  pontos de amostra do retângulo do foco no topo da pilha (`elementFromPoint`).
  O masthead não é preso, então nunca cobre o foco. Voltando por Shift+Tab da
  lista até o hero, com a folha da abertura já por cima e 1,5 s para o scroll
  suave assentar, os CTAs do hero ficam 9/9 visíveis em 390, 768 e 1440 (o
  navegador rola até o fim da abertura). A View Transition dura menos de 1 s e o
  foco vai para o `h1` depois dela.
- **Alvos (2.5.8).** Abaixo de 24 px de altura só há links de 19,2 px (marca,
  idioma, "Voltar", "Voltar ao início", "Live demo" com 16 px no case). Todos
  passam pela exceção de espaçamento: o círculo de 24 px centrado na caixa não
  toca outro alvo. Nenhum alvo menor que 24 px de largura.
- **Contraste do foco (1.4.11).** `--accent` #a32114 contra `--bg` 5,54:1 e
  contra `--surface` 6,29:1. O placeholder "sem captura" é `--bg` sobre `--ink`
  (13,60:1).
- **Idioma (3.1.1, 3.1.2).** `lang="en"` / `lang="pt-BR"` na página; o seletor
  de idioma leva `lang` e `hreflang` do outro idioma.
- **Nome e papel (4.1.2).** Todo link externo é lido com o aviso: "Live demo
  opens in a new tab", "GitHub opens in a new tab", "Demo ao vivo abre em nova
  aba". A seta ↗ fica fora do nome acessível.
- **Árvore de acessibilidade.** Home: `region` do hero com `h1` "André
  Arcodaci"; `navigation` "Contents"/"Sumário" com lista de cinco links; regiões
  nomeadas pelos `h2`; a lista de trabalhos é `list` com quatro `listitem`, cada
  um com `h3` ("Verified: Map Areas", "Concept study: Token Killer"…), e o
  título é o link quando há case. Case: `region` com o nome do projeto, link
  "Voltar", `h1`, a ficha técnica como `term`/`definition`, `h2` por seção. As
  miniaturas ficam fora da árvore (`aria-hidden`).
- **Conteúdo no hover (1.4.13).** Coberto por `e2e/hover.spec.ts`: Escape
  dispensa as prévias, o cartão do contato aceita o cursor e só some quando o
  cursor sai, nenhuma prévia cobre o texto que se lê.
- **Espaçamento de texto (1.4.12)** passa em 768 e 1440 em todas as rotas, e
  em 320 e 390 no case EN e nos 404.

## Medidas

### 1.4.4 e 1.4.10 — texto a 200% (fonte raiz 32 px) em 320 px

| Rota | `scrollWidth` | Elementos além da borda ou cortados |
| --- | --- | --- |
| `/` | 350 | "Arcodaci" até 341 px, cortado pelo `overflow-x: clip` do hero; "Português" no masthead até 322 px; cartões do contato (escondidos) até 326 px |
| `/pt` | 379 | "Arcodaci" até 341 px (cortado); CTA "Trabalhos selecionados" até 366 px, cortado pelo hero; `h2` "Trabalhos selecionados" até 379 px, "Abordagem" até 355, "Interesses" até 321, e o `p` de introdução junto |
| `/work/token-killer` | 322 | "Português" no masthead até 322 px |
| `/pt/work/map-areas` | 650 | Linha da stack ("PostgreSQL/PostGIS · Leaflet · proj4") até 650 px |
| `/nao-existe` | 322 | "Português" no masthead |
| `/pt/nao-existe` | 320 | — |

Em 320 com texto normal: `/` e `/pt` têm `scrollWidth` 326 (os cartões do
contato, 280 px de largura fixa, escondidos mas medidos) e `/pt/work/map-areas`
348 (a stack).

### 1.4.12 — espaçamento de texto

Estilo injetado: `* { line-height: 1.5 !important; letter-spacing: .12em
!important; word-spacing: .16em !important } p { margin-bottom: 2em
!important }`. Nenhum elemento com `overflow` escondendo texto (`scrollWidth`
ou `scrollHeight` maior que a caixa) em nenhuma combinação.

| Rota | 320 | 390 | 768 | 1440 |
| --- | --- | --- | --- | --- |
| `/`, `/pt` | 326 (cartões do contato) | ok | ok | ok |
| `/pt/work/map-areas` | 420 (stack) | 426 (stack) | ok | ok |
| demais | ok | ok | ok | ok |

### Alto contraste do Windows (`forced-colors: active`)

Capturas em 1440 com foco num link: `forced-colors-home.png` (foco no título
do Token Killer), `forced-colors-case.png` (foco em "Voltar"),
`forced-colors-404.png` (foco em "Voltar ao início"),
`forced-colors-abertura-antes.png` e `forced-colors-abertura-depois.png` (a
folha no meio da subida, antes e depois da correção 7).

- **Fica:** o foco (contorno de cor de sistema, `rgb(55, 0, 110)` na emulação),
  os filetes das fichas e do índice (`CanvasText`), a moldura da miniatura e do
  placeholder (a borda da ficha), o filete de 2 px do hero, as bordas do
  cartão do contato.
- **Some:** a borda curva da folha que sobe sobre o hero. A folha e o hero
  viram `Canvas` e o filete do hero fica por baixo da folha: no meio da subida
  não há linha entre os dois (captura `-abertura-antes`). Também somem o
  preenchimento escuro do placeholder (o texto fica sobre `Canvas`, dentro da
  moldura), o traço dos CTAs e dos canais (o link continua em `LinkText`) e o
  círculo do monograma do cartão.

## Achados

### P0

Nenhum.

### P1

**1. Rolagem horizontal em 320 px na home (cartões do contato)**

- **Onde:** `src/sections/Contact/Contact.module.css` `.card { width: 280px }`.
- **Medida:** em 320 × 844, `/` e `/pt` com `scrollWidth` 326. Os cartões
  (`visibility: hidden` em repouso) vão de 46 a 326 px. Com texto a 200%, o
  endereço do LinkedIn vai até 325 px dentro do cartão aberto.
- **WCAG:** 1.4.10 Reflow.
- **Correção mínima:** abaixo de 768 px (onde o cartão se ancora na lista)
  `max-width: 100%`, e o endereço podendo quebrar. Com a lista a partir de
  280 px (janela de ~345 px para cima) nada muda.

**2. A stack e o texto do case não quebram**

- **Onde:** `src/app/CaseStudyRoute.module.css`
  `.stackItem + .stackItem::before { white-space: pre }` e `.text` (grade de
  uma trilha `auto`).
- **Medida:** `/pt/work/map-areas` em 320: a linha da stack vai até 348 px
  (texto normal), 420 px (espaçamento) e 650 px (200%). Os `dd` em linha não
  têm espaço entre eles fora do separador, e o separador com `pre` não deixa
  quebrar. Com a stack corrigida, a 200% o texto inteiro do case ainda vai
  até 400 px: "GEOMETRY(Polygon," mede 316 px numa coluna de 254 px e alarga a
  trilha da grade.
- **WCAG:** 1.4.10 Reflow, 1.4.12 Espaçamento de texto, 1.4.4.
- **Correção mínima:** `white-space: pre-wrap` no separador; a trilha da
  grade presa à coluna e a palavra longa podendo quebrar.

**3. Nome do hero cortado com texto a 200%**

- **Onde:** `src/sections/Hero/Hero.module.css` `.hero { overflow-x: clip }`
  e `.name` (88 px de piso com raiz 32 px).
- **Medida:** em 320 com raiz 32 px, a palavra "Arcodaci" mede 295 px numa
  coluna de 254 px e vai até 341 px; o hero corta em 320. O "i" final some.
- **WCAG:** 1.4.4 Redimensionar texto.
- **Correção mínima:** a palavra pode quebrar quando não cabe
  (`overflow-wrap: anywhere`). Com texto normal ela cabe e nada muda.

**4. CTA, índice e títulos de seção em PT passam da tela com texto a 200%**

- **Onde:** `ActionLink` `.link { white-space: nowrap }` no hero;
  `SectionHead` `.title`; rótulo do índice (`Release`).
- **Medida:** `/pt` em 320 com raiz 32 px: o CTA "Trabalhos selecionados" vai
  até 366 px e é cortado pelo hero; a entrada do índice "Trabalhos
  selecionados" até 362 px; o `h2` "Trabalhos selecionados" até 379 px
  ("selecionados" sozinho mede 288 px), "Abordagem" até 355, "Interesses" até
  321.
- **WCAG:** 1.4.4 Redimensionar texto, 1.4.10 Reflow.
- **Correção mínima:** CTA do hero com quebra normal; título de seção e
  rótulo do índice com `overflow-wrap: anywhere`. Com texto normal nada
  quebra.

**8. Convite do contato passa da tela com texto a 200%** (achado na
varredura por texto, depois das correções 1–5)

- **Onde:** `src/sections/Contact/Contact.module.css` `.lead`.
- **Medida:** `/` em 320 com raiz 32 px: "collaborations," e
  "conversations." vão até 350 px; `scrollWidth` 350. As primeiras medidas
  olhavam a caixa dos elementos, e a caixa do parágrafo fica em 300 px: só a
  medida do texto (`Range`) viu a palavra passar.
- **WCAG:** 1.4.4 Redimensionar texto, 1.4.10 Reflow.
- **Correção mínima:** `overflow-wrap: anywhere`. Com texto normal nada
  quebra.

### P2

**5. Masthead 2 px além da tela com texto a 200%**

- **Onde:** `src/components/Masthead/Masthead.module.css` (flex numa linha,
  altura fixa).
- **Medida:** em 320 com raiz 32 px, o seletor de idioma "Português" termina
  em 322 px; `scrollWidth` 322 no case e no 404.
- **WCAG:** 1.4.10 Reflow.
- **Correção mínima:** `flex-wrap: wrap` e `min-height` no lugar de `height`:
  numa linha (todo caso com texto normal) a barra é a mesma.

**6. Reduced motion ligado no meio da sessão**

- **Onde:** `src/motion/titleFlight.css`: o `animation: none` da troca direta
  só vale sob `no-preference`.
- **Medida:** abrir um case pela ficha sem reduce, `emulateMedia({
  reducedMotion: 'reduce' })`, `goBack()`: até 13 animações de
  `::view-transition-*` em andamento ao mesmo tempo (o fade e o deslocamento
  padrão, 250 ms, de `root` e dos grupos `case-*`).
- **WCAG:** 2.3.3 (AAA) e o compromisso do projeto com reduced motion; item do
  backlog.
- **Correção:** `animation: none` nos pseudo-elementos dentro de
  `@media (prefers-reduced-motion: reduce)`.

**7. Borda da folha some no alto contraste**

- **Onde:** `src/sections/Release/Release.module.css` `.release::before`
  (curva só por cor de fundo).
- **Medida:** `forced-colors: active`, 1440, scroll 450: a curva tem 126 px de
  altura, `background` forçado a `Canvas` sobre o hero também `Canvas`, sem
  borda. Nenhuma linha separa a folha do hero.
- **WCAG:** 1.4.11 no modo de alto contraste (spec §7, item decidido).
- **Correção:** `border-top` em `CanvasText` dentro de
  `@media (forced-colors: active)`.
- **Junto, para o axe em alto contraste:** o placeholder "sem captura" é
  pintado `CanvasText` sobre `Canvas`, mas a cor declarada da linha (`--rule`)
  e do título (`--bg`) continua a do desenho normal; o axe compara essa cor
  com o fundo forçado e acusa 1,36:1 e 2,86:1. As cores de sistema passam a
  ser declaradas no próprio modo, sem mudar o que aparece.

### Aguardando o dono

- **Filetes `--rule` abaixo de 3:1** (2,10:1 no `--bg`, 2,39:1 no `--surface`;
  o mesmo tom é o sublinhado do "Live demo" e o traço do CTA secundário). A
  leitura desta auditoria: os filetes separam itens que já se separam por
  espaço, título e número, e os links se identificam pela posição e pela seta,
  então ficam fora do 1.4.11 e do 1.4.1. Se o dono entender que algum filete é
  necessário para entender o conteúdo, a correção muda a paleta aprovada.
  **Proposta:** `--rule` para um tom com 3:1 nos dois fundos (em torno de
  `#8c7b55`, a confirmar na medida), ou só o sublinhado dos links inline em
  `--ink-muted`. **Medida:** 2,10:1 e 2,39:1; **critério:** 1.4.11.

### P3 — vão para `docs/BACKLOG.md`

- **"sem captura" cortado na miniatura com texto a 200%** (até 334 px em 320,
  404 px em 390). A miniatura é decorativa (`aria-hidden`) e repete o tipo e o
  título da ficha.
- **Alto contraste: traço dos CTAs e dos canais e o círculo do monograma
  somem.** O link continua identificado pela cor `LinkText` e pelo foco; o
  monograma é decorativo.
- **Tipo da ficha encosta na miniatura com texto a 200%.** Em 320 com raiz
  32 px, "CONCEPT STUDY" quebra em duas linhas, mas o espaçamento de letra
  final de "CONCEPT" encosta na moldura da miniatura (caixa de 142 px,
  conteúdo de 176 px). Nada some nem passa da tela.
- **Números de seção e de ficha lidos como texto solto** ("01" antes do `h2`,
  parágrafo "01" na ficha). Não é falha; é ruído para leitor de tela que o NVDA
  do Gate 4 pode confirmar.

## Correções

Cada linha: critério, antes → depois, propriedade. O teste está em
`e2e/a11y-audit.spec.ts`, visto falhando antes da correção.

| # | Critério | Antes → depois | Propriedade |
| --- | --- | --- | --- |
| 6 | Reduced motion no meio da sessão | 13 animações de `::view-transition-*` ao voltar → 0 | `titleFlight.css`: `animation: none` e `opacity: 0` no antigo, sob `prefers-reduced-motion: reduce` |
| 2 | 1.4.10, 1.4.12, 1.4.4 | `/pt/work/map-areas` em 320: `scrollWidth` 348 (normal), 420 (espaçamento), 650 (200%) → 320 | `CaseStudyRoute.module.css`: separador da stack `white-space: pre` → `pre-wrap`; `.facts` `overflow-wrap: anywhere` (antes só a partir de 768, `break-word`); `.text` `grid-template-columns: minmax(0, 1fr)` e `overflow-wrap: break-word` |
| 1 | 1.4.10 | `/` e `/pt` em 320: `scrollWidth` 326 → 320; cartão do LinkedIn aberto de 46–326 px → dentro da janela, também a 200% | `Contact.module.css`: `.card { max-width: 100% }` abaixo de 768 px; `.address { overflow-wrap: anywhere }` |
| 3 | 1.4.4 | 200% em 320: "Arcodaci" até 341 px, cortado pelo hero em 320 → quebra dentro da coluna, inteiro | `Hero.module.css`: `.name { overflow-wrap: anywhere }` |
| 4 | 1.4.4, 1.4.10 | `/pt`, 200% em 320: CTA até 366 px (cortado), índice até 362, `h2` até 379 → tudo dentro da janela | `Hero.module.css`: `.actions .action { white-space: normal }`; `SectionHead.module.css` `.title` e `Release.module.css` `.label`: `overflow-wrap: anywhere` |
| 5 | 1.4.10 | 200% em 320: "Português" até 322 px, `scrollWidth` 322 no case e no 404 → 320; com texto normal a barra continua com uma linha de 48 px | `Masthead.module.css`: `flex-wrap: wrap`, `height` → `min-height` |
| 8 | 1.4.4, 1.4.10 | `/`, 200% em 320: "collaborations," até 350 px, `scrollWidth` 350 → 320 | `Contact.module.css`: `.lead { overflow-wrap: anywhere }` |
| 7 | 1.4.11 em `forced-colors: active` | Borda da folha no meio da subida: nenhuma linha → 2 px `CanvasText` na curva; axe em alto contraste nas `GATE_ROUTES`: 9 nós do placeholder em `color-contrast` → 0 | `Release.module.css`: `.release::before { box-sizing: content-box; border-top: 2px solid CanvasText }`; `ProjectThumb.module.css`: `.placeholder { background: Canvas }`, `.placeholder, .line { color: CanvasText }`; tudo em `@media (forced-colors: active)` |

## Estado depois

2026-10-27, depois das correções, contra `pnpm build:preview` + `pnpm preview`:

- `e2e/a11y-audit.spec.ts` (49 testes) verde: a varredura mede o texto
  (`Range`) em todas as `GATE_ROUTES`, a 200% em 320 px e com o espaçamento
  de texto em 320, 390, 768 e 1440 — nenhum trecho além da janela e
  `scrollWidth` igual à largura em todas. Mais os testes de cada achado, o
  alto contraste e o reduced motion no meio da sessão.
- `e2e/a11y.spec.ts`: axe sem violações nem `color-contrast` incompleto nas
  seis rotas, com e sem `forcedColors: 'active'`.
- A suíte inteira (`pnpm test:e2e`, 228 testes) e `pnpm test` (245) verdes.
- Com texto normal, nada mudou de lugar: todas as correções só agem quando a
  palavra ou a barra não cabem (`overflow-wrap`, `flex-wrap`, `max-width`,
  `pre-wrap`) ou dentro de `@media (forced-colors: active)` e
  `@media (prefers-reduced-motion: reduce)`. As suítes de regressão do hover,
  da abertura, da entrada e do responsivo seguem verdes.
- Pendente do dono no Gate 4: NVDA real nos pontos críticos e a decisão sobre
  os filetes (acima).
