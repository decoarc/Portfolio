# Decisões de design

Registro das escolhas visuais e seus motivos. Uma entrada por decisão,
incluindo as alternativas rejeitadas — rejeitada sem motivo registrado volta
a ser proposta seis meses depois.

## D1 — Metáfora visual · D2 — Paleta e tipografia

- **Status:** decidida em 2026-10-26, no Gate 1
- **Decisão:** **02 — Editorial Rolodex** é a direção base.
- **Quem decidiu:** o dono do projeto, comparando as três composições ao vivo e
  as 18 capturas.
- **Evidência:** `docs/gate-1/` e `docs/gate-1/README.md`

### A direção escolhida

Arquivo editorial. Papel tipo manila com margem larga e medida curta; hero
puramente tipográfico, sem imagem; projetos como lâminas de índice separadas
por filete, com o número de ficha recuado na margem; a seção de trabalhos
assentada numa folha mais clara que a capa.

É a direção menos dependente de mídia das três — relevante porque hoje há um
projeto real e nenhuma captura de produto autorizada.

### Valores que vão para `src/styles/tokens.css` na Fase 2

Todos medidos no comp 02 da Fase 0 (apagado ao fim da Fase 2; as capturas
ficam em `docs/gate-1/`).

| Papel | Valor |
|---|---|
| Fundo (capa) | `#E8DCC0` |
| Superfície (folha de índice) | `#F2EAD6` |
| Tinta | `#16130F` |
| Tinta suave | `#5A534A` |
| Filete | `#A89771` |
| Acento | `#A32114` |

| Família | Papel | Licença |
|---|---|---|
| Fraunces Variable | Display (usa `opsz`, `SOFT` e `WONK`) | OFL, via `@fontsource-variable/fraunces` (`full.css`) |
| Instrument Sans Variable | Corpo | OFL, via `@fontsource-variable/instrument-sans` |
| Geist Mono Variable | Metadados e numeração | OFL, via `@fontsource-variable/geist-mono` |

Contrastes medidos (WCAG AA exige 4.5:1 para corpo): tinta sobre fundo 13.60:1,
tinta sobre superfície 15.44:1, tinta suave sobre fundo 5.57:1, tinta suave
sobre superfície 6.32:1, acento sobre fundo 5.54:1, acento sobre superfície
6.29:1.

**A base manila substituiu um creme `#F2EEE6`** durante a Fase 0: o
`src/styles/tokens.css` anterior já registrava `Avoid: cream #F4F1EA`, e o
creme proposto estava a um fio disso. Croma 40 contra 12 torna a escolha
deliberada em vez de um off-white padrão.

### Fraunces completa (`full.css`)

A Fraunces vai como `@fontsource-variable/fraunces/full.css`, com os eixos
`opsz`, `SOFT` e `WONK` ativos. O comp da Fase 0 carregava só o eixo de peso,
então `opsz` e `WONK` não apareciam nas capturas do Gate 1. O dono escolheu o
arquivo completo em 2026-10-26 e aprovou o resultado no checkpoint da Task 4,
comparando `docs/gate-2/home-*-pt.png` com `docs/gate-1/02-editorial-rolodex-*-pt.png`.

### Rejeitadas

**01 — Inspection Slot.** Bancada de inspeção: folha de contatos de aberturas
emolduradas, Archivo, grafite com âmbar industrial. Risco registrado no dossiê:
virar "industrial genérico". Dependência média de mídia — as aberturas pedem
imagem para não ficarem vazias, e hoje não há mídia de projeto.

**03 — Spatial Gallery.** Placas suspensas sob luz fria, Syne, preto profundo.
Dois custos registrados: é a mais dependente de mídia das três, e a
profundidade e a luz são as que mais custam em motion na Fase 3. Além disso
perde o escalonamento abaixo de ~900px e, em tablet, empilha numa coluna só —
distinguindo-se ali por cor e tipografia, não por composição.

`design/comps/` foi apagado ao fim da Fase 2, junto com os scripts, as fontes
das direções rejeitadas e a configuração do Playwright dos comps. As capturas
em `docs/gate-1/` permanecem como registro.

## D-Release — O índice numerado da home

- **Status:** decidida na Fase 2 (2026-10-26)
- **Decisão:** a seção Release da `SPEC.md` §4.2 é o índice numerado da home,
  na folha clara — a virada de página — e substitui um menu de seções no topo.
  O masthead carrega só a marca da home e o seletor de idioma.
- **Numerais no trilho:** reservados aos números das seções da home e aos
  números das fichas de Work. Os itens de Abordagem não levam número (colidiam
  com o da seção).
- **Case study:** margem de trilho mais larga, `clamp(160px, 18vw, 240px)` a
  partir de 768px, para caber o `<dl>` mono de metadados (papel, período,
  stack, links).
- **Folha:** o respiro da `Sheet` é definido por `--sheet-pad-*`, nunca
  sobreposto com `padding`, para não depender da ordem das folhas de estilo.

## D-Motion — Tecnologia da Fase 3

- **Status:** decidida na Fase 3 (2026-10-26)
- **Decisão:** Lenis 1.3.26 para o scroll suave, mais funções próprias
  (`src/motion/opening.ts`) que escrevem custom properties lidas pelo CSS, e uma
  transição CSS para a entrada do nome. Sem GSAP, sem WebGL.
- **Motivo:** os efeitos aprovados são funções simples da posição do scroll e
  uma transição; GSAP não traria nada que justifique o peso. `docs/SPEC.md` §9
  só aceita GSAP se um efeito aprovado provar que CSS não alcança.
- **Alternativas descartadas:** GSAP ScrollTrigger (peso sem ganho para estes
  efeitos); CSS `animation-timeline: scroll()` (suporte desigual no Safari na
  data).
- Ficha de cada efeito: `docs/MOTION_SPEC.md`

## D-About — `/about` como página dedicada

- **Status:** aguardando o dono (decide no Gate 4)
- **Origem:** spec mãe §10 deixou a decisão adiada; a Fase 4 a trouxe para o
  fechamento (`docs/superpowers/specs/2026-10-27-fase-4-acabamento-design.md` §10).
- **Recomendação do Claude: não promover.**
  - A seção About da home é curta.
  - O conteúdo dela ainda é mock; uma página nova teria de ser escrita e
    revista duas vezes.
  - Uma página separada quebra a leitura de cima para baixo que a abertura
    constrói (nome, índice, trabalhos, abordagem, sobre, contato).
  - Custa uma rota a mais em cada idioma: arquivo prerenderizado, head,
    testes e baseline visual.
- **Se o dono promover:** vira rota `/about` e `/pt/about` (ou o nome em PT que
  ele escolher), com o índice da home apontando para ela. A seção About da
  home seria reduzida a um resumo com link. Entra como tarefa da Fase 5, com o
  conteúdo real.

## D-Prerender — HTML estático por rota, sem framework

- **Status:** decidida na Fase 4 (2026-10-27)
- **Decisão:** `vite build --ssr` mais `scripts/prerender.ts`, que grava um HTML
  por rota no formato do Cloudflare Pages (`pt.html`, `work/<slug>.html`,
  `404.html`, `pt/404.html`). O React hidrata o HTML. Sem Next, sem Astro.
- **Motivo:** o site é estático e já usa React Router; o necessário era
  conteúdo e head por rota para buscadores e pré-visualização de links, e
  nome visível antes do JS. Um framework traria um segundo modelo de rotas.
- **Consequências:** `VITE_SITE_ORIGIN` obrigatório no `build` de produção;
  CSP com hash do único script inline; o preview imita o Pages
  (`vite-pages-preview.ts`). Detalhes em `docs/ARCHITECTURE.md`, "Prerender".

## D-Fraunces — Instância latin sem `SOFT`, com `wght` inteiro

- **Status:** decidida na Fase 4 (2026-10-27)
- **Decisão:** a Fraunces latin é gerada por `scripts/fonts/instance-fraunces.py`
  com `SOFT` fixado em 0 e `wght`, `opsz` e `WONK` inteiros: 66 964 B contra
  121 016 B (−44,7%).
- **Motivo:** o critério era "mais de 30% menor e sem diferença visual". Fixar
  `wght` em 600 daria −71,3%, mas o instancer recalcula os deltas e muda o
  antialias: as 24 capturas da regressão visual falharam. A variante adotada
  passa nas 252 comparações com `threshold: 0`.
- **Em aberto com o dono:** o `wght` fixo em 600 muda o visual e exige regravar
  as baselines (ver o Gate 4). Medidas: `docs/gate-4/PERFORMANCE.md`.
- **Preload das fontes:** testado e recusado; piorou o LCP das homes em +156 a
  +444 ms.
