# Fase 3, segunda leva — Título que viaja (abrir um case study)

- **Data:** 2026-10-27
- **Status:** aprovado pelo dono em 2026-10-27
- **Branch:** `fase-3-titulo-viaja`
- **Depende de:** texto que acende (`f8096f4`), `ScrollManager` como único dono
  da rolagem até âncoras, scroll suave (`src/motion/smoothScroll.ts`)
- **Referência visual:** `docs/fase-3/prototipo/cortina.html`. É um protótipo
  descartável e já abre na opção escolhida ("3 · Título que viaja", velocidade
  normal). Na dúvida sobre ritmo ou aparência, quem decide é o protótipo, salvo
  onde este documento diz outra coisa. O protótipo não cuida de
  acessibilidade, reduced motion, fallback sem JS nem do router; isso está
  aqui.

## 1. Intenção

Item "Cortina ao abrir um case study" do `docs/BACKLOG.md`. O dono partiu da
cortina do dennissnellenberg.com, considerou uma virada de folha maleável
(WebGL) e preferiu algo mais suave e minimalista. Entre cinco ideias testadas
no protótipo (folha que sobe, ficha que se abre, título que viaja, virada leve,
fade mínimo), escolheu **o título que viaja**: o título da ficha clicada cresce
e desliza até virar o título do case, enquanto a home sai por baixo. A
sensação buscada é de *entrar no projeto* pela palavra que a pessoa clicou, e
não de trocar de página.

O dono pediu atenção explícita à tipografia: **durante o movimento a fonte não
pode mudar**. Na primeira versão do protótipo ela mudava (o título voava em
sans e depois num corte da Fraunces diferente do da ficha); a correção está
em §3.3.

## 2. Objetivos, não-objetivos, anti-objetivos

**Objetivos**

- Abrir um case study pela lista de trabalhos: o título viaja da ficha até o
  título do case.
- Voltar pelo "Voltar aos trabalhos": o título faz o caminho inverso e a home
  reaparece **parada na ficha do projeto que foi aberto** (decisão do dono,
  2026-10-27), não no topo da lista.

**Não-objetivos**

- Transição em outras trocas: troca de idioma, 404, link do masthead para a
  home, primeira carga direto em `/work/:slug`.
- Cortina com o nome do projeto, virada de folha (CSS 3D ou WebGL) e as outras
  ideias do protótipo: vistas e recusadas.
- Mudar o desenho do case study ou da ficha.

**Anti-objetivos** (é falha mesmo que funcione)

- A fonte do título mudar em qualquer quadro do movimento: troca de família,
  de corte óptico (`opsz`), de peso ou salto no espaçamento no início ou no fim.
- O clique esperar a animação para navegar, ou a URL mudar só depois dela.
- Conteúdo do case escondido sem JS, com reduced motion ou num navegador sem
  suporte.
- Foco perdido no `<body>` depois da troca, ou o leitor de tela anunciando o
  título duas vezes.
- A volta parar no topo da página ou no topo de `#work` em vez da ficha.
- Título preso em meio voo, cópia duplicada ou página tremendo depois que a
  transição acaba.

## 3. O que foi decidido

### 3.1 Comportamento (decidido pelo dono no protótipo)

**Ida (home → case)**, ao ativar o título de uma ficha que tem case
(`caseStudyHref` não nulo), com clique ou Enter:

- O título sai da posição e do tamanho que tem na ficha e chega à posição e ao
  tamanho do `h1` do case. **800 ms**, `cubic-bezier(0.76, 0, 0.24, 1)`.
- A home some por baixo: o fundo do case (`--surface`) entra por cima dela em
  **450 ms**, `cubic-bezier(0.2, 0.7, 0, 1)`.
- O resto do case (link "Voltar", rótulo do tipo, corpo) sobe **20 px** e
  aparece em **550 ms**, mesma curva, a partir de **380 ms**, com 60 ms entre
  um bloco e outro.

**Volta (case → home)**, pelo link "Voltar aos trabalhos":

- O resto do case some em **250 ms**.
- O título volta do `h1` até o título da ficha daquele projeto em **750 ms**,
  `cubic-bezier(0.76, 0, 0.24, 1)`.
- O fundo do case sai em **450 ms**, a partir de **200 ms**, revelando a home.
- A home já está rolada até a ficha do projeto quando o movimento começa (a
  ficha aparece por volta de 30% da altura da janela, como no protótipo; ver
  §5).

### 3.2 Mecanismo (decisão do Claude, sem objeção do dono)

**View Transitions do navegador, pelo React Router.** O `Link` do título da
ficha e o link "Voltar" usam `viewTransition`. O router chama
`document.startViewTransition`, troca a rota dentro dela e o navegador anima
entre a foto antiga e a nova. Com isso:

- a navegação acontece no clique (`t = 0`, regra global do
  `docs/MOTION_SPEC.md`); a animação é só sobre as fotos;
- não há camada de transição montada à mão nem estado React por frame;
- o título da ficha e o `h1` do case recebem o mesmo `view-transition-name`,
  **só no projeto envolvido** (o nome precisa ser único na página);
- os tempos de §3.1 viram CSS nos pseudo-elementos `::view-transition-*`.

**Sem transição, troca direta como hoje**, quando:

- o navegador não tem `document.startViewTransition`;
- `prefers-reduced-motion: reduce`;
- não há JS (o link é um `<a href>` normal);
- a navegação não é uma das duas acima (ver não-objetivos).

**Botão voltar do navegador:** tentar a mesma volta animada. Se não der para
fazer isso de forma confiável, a troca direta é aceita, desde que a home volte
na posição que o navegador restaura e o foco não se perca.

### 3.3 Tipografia durante o movimento

No código, o título da ficha (`ProjectSlip.module.css`) e o do case
(`CaseStudyRoute.module.css`) já usam o mesmo corte:
`font-variation-settings: var(--fraunces-title)` (`'opsz' 72, 'WONK' 1`),
peso 600. Diferem em tamanho e no espaçamento entre letras (−0,02em na ficha,
−0,03em no case).

- O `opsz` fica **fixo** nos dois (já está explícito no
  `font-variation-settings`). Assim, escalar a foto não muda o desenho das
  letras.
- **Só a foto grande viaja, sem cruzamento** (decisão do Claude, levantada na
  revisão). As fotos da View Transition são imagens: a do título da ficha,
  ampliada 2–3×, fica borrada, e cruzá-la com a do `h1` mostraria letras
  duplicadas. Então o grupo do título mostra só a foto do `h1` nos dois
  sentidos: na ida é a foto nova (`::view-transition-new`), que começa
  reduzida ao tamanho da ficha; na volta é a antiga (`::view-transition-old`),
  que termina reduzida. A outra foto fica invisível o tempo todo. É o mesmo
  princípio do protótipo, que voa uma cópia no tamanho do case escalada para
  baixo. Uma camada de título montada à mão continua fora (§3.2).
- A diferença de espaçamento (−0,02em × −0,03em) é a única que sobra: no
  primeiro quadro da ida e no último da volta, a foto do `h1` fica cerca de 1%
  mais estreita que o título da ficha. Se a evidência de §4 mostrar esse
  salto, a saída é igualar o espaçamento dos dois títulos (mudança visual
  mínima); senão, fica como está.
- O título que viaja é **um bloco só**, sem quebra de linha diferente entre
  origem e destino. Se o título do case quebrar em duas linhas (nome longo em
  janela estreita) e o da ficha não, a viagem precisa continuar legível. Ver
  §5.

### 3.4 Volta para a ficha

- O link "Voltar aos trabalhos" do case passa a apontar para a ficha do
  projeto, e não para `/#work`. Cada ficha ganha uma âncora estável derivada
  do slug (por exemplo `id="work-<slug>"`).
- Sem JS, ou em navegador sem View Transitions, o link continua levando à
  ficha (é só uma âncora): o comportamento novo vale para todos.
- Ao chegar, o foco vai para o **link do título** daquela ficha, não para o
  `<li>`.
- **A ficha pousa em repouso** (decisão do Claude, levantada na revisão). A
  reação da lista (`Work.module.css`: título recua, as outras esmaecem) fica
  desligada enquanto a transição roda, para o título pousar no lugar exato e
  o cursor parado sobre outra ficha não apagar a de destino. Terminada a
  transição, as regras normais voltam: hover exige o ponteiro se mexer, e o
  foco por teclado mostra a reação como hoje (ela é o indicador de foco da
  ficha).
- **Projeto em preview** (tem ficha, mas sem link e com case só por URL
  direta): o "Voltar" leva à ficha, o foco vai para o `h3` dela
  (`tabIndex={-1}`) e a troca é direta, sem título viajando (decisão do
  Claude).
- A rolagem até a ficha na volta é **imediata** (sem o deslize do Lenis):
  a foto nova da View Transition tem de ser tirada já com a ficha no lugar.
  Os outros usos de âncora (`#work`, `#about`…) continuam com o deslize.

### 3.5 Foco e leitor de tela

- Na ida, o foco vai para o `h1` do case (hoje vai para o `<main>`). O `h1`
  recebe `tabIndex={-1}` e não ganha anel de foco visível por clique.
- As fotos da View Transition não entram na árvore de acessibilidade; não há
  texto duplicado.
- O `<title>` da página continua mudando como hoje.

## 4. Evidência

- Teste e2e novo (modelo: `e2e/lit-text.spec.ts`): abrir um case pela ficha e
  voltar, em Chromium. Verifica que a URL muda no clique, que o foco termina
  no `h1` e depois no link da ficha, que a ficha está visível depois da volta
  e que não sobra nenhum `::view-transition` ativo.
- Mesmo teste com `reducedMotion: 'reduce'`: troca direta, mesmos foco e
  posição.
- Teste da tipografia: com a transição pausada no primeiro, no meio e no
  último quadro, capturas do título, na ida e na volta. No primeiro, retângulo
  igual ao do título da ficha; no último, igual ao do `h1`; em todos, uma
  única imagem do título (nenhuma letra duplicada), nítida, Fraunces com o
  mesmo desenho. As capturas ficam em `docs/fase-3/segunda-leva/`.
- Os testes atuais de rota, foco e `ScrollManager` continuam verdes; os que
  esperam o foco no `<main>` ao abrir um case são ajustados para o `h1`.
- `pnpm validate` verde.

## 5. Para o implementador decidir

- Como marcar só o projeto envolvido com `view-transition-name` (por exemplo
  `useViewTransitionState` na ida e, na volta, o slug de onde se veio). Vale
  qualquer forma que não deixe dois elementos com o mesmo nome na página.
- A posição exata da ficha na volta (protótipo: topo da ficha a ~30% da
  janela). Requisito: a ficha inteira visível em 1440×900 e em 390×844.
- Título que quebra em linhas diferentes na origem e no destino: aceitar se
  continuar legível na evidência; se não, trocar o grupo do título por um
  cruzamento simples só nesse caso.
- Se o botão voltar do navegador fica animado (§3.2).
- Onde mora o CSS dos pseudo-elementos (`src/styles/` ou um módulo em
  `src/motion/`), seguindo "Onde o motion vive no código" do
  `docs/MOTION_SPEC.md`.

## 6. Documentação ao terminar

- `docs/MOTION_SPEC.md`: ficha nova "Título que viaja", no formato das demais
  (Objetivo, Elemento, Gatilho, Estado inicial/final, Duração e easing, Toque,
  Reduced motion, Sem JS, Navegação, Evidência), e a linha "Estado" do topo.
- `docs/BACKLOG.md`: remover "Cortina ao abrir um case study" e fechar o
  parágrafo da segunda leva (a leva termina aqui).
