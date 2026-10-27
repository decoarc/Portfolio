# Fase 3, segunda leva — Hover nos links e na lista de trabalhos

- **Data:** 2026-10-27
- **Status:** aprovado pelo dono em 2026-10-27
- **Branch:** `fase-3-segunda-leva`
- **Depende de:** Gate 3 aprovado (abertura da home), ajustes da abertura
  (`490ce8b`)
- **Referência visual:** `docs/fase-3/prototipo/hover.html`. É um protótipo
  descartável e já abre na configuração escolhida pelo dono. O painel à direita
  mostra também as opções recusadas. Na dúvida sobre curva, ritmo ou aparência,
  quem decide é o protótipo, salvo onde este documento diz outra coisa.

## 1. Intenção

O item do backlog era "botões e links que se enchem de cor no hover". Ao ver as
alternativas lado a lado no protótipo, o dono quis **algo mais visual além do
texto que descreve os projetos** e escolheu um conjunto de quatro efeitos. Esse
conjunto absorve dois itens do backlog e substitui um terceiro:

| Item do backlog | O que acontece com ele |
| --- | --- |
| Botões e links que se enchem de cor | Substituído pelo **sublinhado que corre**, com magnético. O preenchimento foi visto e recusado |
| Lista de trabalhos reagindo ao mouse | Feito aqui: a **reação tipográfica** |
| Preview de projeto no hover (Fase 5) | A prévia que segue o cursor foi vista e recusada. Entram **miniaturas fixas em cada ficha**. A mídia real continua para a Fase 5 |

Também entram dois efeitos novos, que não estavam no backlog: as **prévias nos
links de ação**.

## 2. Objetivos, não-objetivos, anti-objetivos

**Objetivos**

- Os links de ação respondem ao cursor de um jeito editorial: o traço corre e o
  link é levemente atraído pelo cursor.
- A lista de trabalhos passa a ter imagem, e a imagem não depende de hover.
- Antes do clique, o visitante vê o que existe do outro lado do link.

**Não-objetivos**

- Mídia real dos projetos mock. Continua na Fase 5, junto com a troca do
  conteúdo.
- Hover nos links "Repositório" e "Demo" dentro das fichas, nos links do case
  study, no índice (Release) e na barra superior.
- Texto que acende e cortina do case study, que são os próximos itens da leva.

**Anti-objetivos** (é falha mesmo que funcione)

- Uma prévia cobrir texto legível ou ficar entre o cursor e o alvo do clique.
- Um efeito que só existe com mouse e deixa o teclado sem equivalente.
- Motion visível com `prefers-reduced-motion: reduce`.
- O link mudar de tamanho ou empurrar o layout no hover.

## 3. O que foi decidido

### 3.1 Links de ação: sublinhado que corre

**Onde:** os dois CTAs do hero ("Trabalhos selecionados" e "Entrar em contato")
e os dois canais do contato (GitHub e LinkedIn).

- **Em repouso** nada muda em relação ao Gate 2. O CTA primário tem traço de 2px
  em `--accent`, o secundário tem traço de 1px em `--rule` e os canais do
  contato têm sublinhado em `--rule`.
- **Em hover e `:focus-visible`** o traço sai pela direita (encolhe ancorado à
  direita), volta pela esquerda (cresce ancorado à esquerda) e termina em
  `--accent` em todos os quatro links. O CTA secundário e os canais trocam o
  bege pelo vermelho, mas a espessura de cada traço se mantém. O protótipo usa
  0,7 s com a curva `cubic-bezier(0.2, 0.7, 0, 1)`.
- **A cor do texto** não muda. Nos canais do contato, a mudança de cor do Gate 2
  (texto vira `--accent`) dá lugar ao traço. Essa decisão é minha: o protótipo
  faz assim e o dono aprovou nessa forma.
- **O traço é um elemento animado só com `transform`** (`scaleX`), não o
  `border-bottom` nem o `text-decoration`. A seta ↗ dos canais fica fora do
  traço, como hoje fica fora do sublinhado.

### 3.2 Links de ação: magnético

- Nos mesmos quatro links, o cursor dentro do link o puxa na sua direção: o
  link desloca **0,25 × dx** na horizontal e **0,35 × dy** na vertical, em
  pixels, onde dx e dy são as distâncias do cursor ao centro do link. Ao sair,
  ele volta ao lugar com transição.
- Responde **só a ponteiro de mouse** (`pointerType === 'mouse'`). Não reage a
  teclado nem a toque.
- O link se move **na direção** do cursor, nunca para longe, e assim respeita a
  SPEC §5.2.
- **Não ganha laço próprio de `requestAnimationFrame`.** O deslocamento é
  escrito no evento de ponteiro, numa custom property, e a transição CSS
  suaviza.
- Com reduced motion, ou sem JS, ele não existe.
- No hero, o bloco dos CTAs já tem `transform` próprio na abertura
  (`--opening-bottom-*`). O magnético atua no link, não no bloco, e os dois não
  podem se sobrescrever.

### 3.3 Prévia no CTA "Trabalhos selecionados"

- No hover e no `:focus-visible` do CTA primário do hero, aparece junto dele uma
  tira com as capas de todos os projetos listados na home, na ordem da lista.
  Cada capa é uma miniatura levemente girada, como no protótipo.
- A tira é decorativa: `aria-hidden`, `pointer-events: none` e nenhum texto novo
  para leitor de tela.
- Ela não pode cobrir texto legível do hero (nome, statement, função) nem o
  outro CTA, em nenhuma das três faixas de layout (< 768, 768–1199, ≥ 1200). Se
  em alguma faixa não houver espaço livre, a tira não aparece nela. O builder
  escolhe a posição dentro dessa regra.
- O primeiro CTA leva a `#work`. A tira surge sem atrasar a navegação.

### 3.4 Prévia nos canais do contato

- No hover e no `:focus-visible` de GitHub e de LinkedIn, aparece junto ao link
  um cartão com um monograma, o endereço sem protocolo (`github.com/decoarc`,
  `linkedin.com/in/andrearcodaci`) e uma linha curta que diz o que há lá e que
  abre em nova aba.
- **Sem dados inventados:** nada de contagem de repositórios, seguidores ou
  avatar.
- O endereço é derivado do `href` do canal. A linha curta é conteúdo novo por
  canal, em `pt` e `en`, e fica em `src/content/*/site.ts`. Hoje ela diz
  "perfil e repositórios" e "perfil profissional".
- O cartão é decorativo (`aria-hidden`): o leitor de tela já ouve a dica de nova
  aba pelo `hint` do `ExternalLink` e não a ouve duas vezes. O cartão também não
  pode cobrir o outro canal.

### 3.5 Miniatura em cada ficha da lista de trabalhos

- Toda ficha (`ProjectSlip`) ganha uma miniatura **sempre visível**, em 4:3. No
  protótipo ela fica numa coluna à direita, com 168px de largura a partir de
  768px. No mobile, a posição é decisão do builder: pode ficar acima do título
  ou ao lado do número, desde que continue visível.
- **Com `cover`** (hoje só o Map Areas) a miniatura é a imagem, usando a versão
  de 800px (`map-areas-800.webp`), com `loading="lazy"` e `alt=""`. O título da
  ficha já nomeia o projeto.
- **Sem `cover`** a miniatura é o placeholder escuro do protótipo: fundo
  `--ink`, título do projeto em Fraunces cor `--bg` e, acima dele, a linha mono
  "{tipo} · sem captura" em `--rule`. Decisão do dono: vale até a Fase 5. O
  placeholder é desenhado em HTML/CSS, não em imagem, e é `aria-hidden`. O
  texto "sem captura" vai para o conteúdo em `pt` e `en`.
- A tira de capas (§3.3) usa as mesmas miniaturas.
- No hover e no `:focus-within` da ficha, a imagem cresce para `scale(1.06)`
  dentro da moldura, que corta o excesso.
- A miniatura **não é link**. Essa decisão é minha: o título continua sendo o
  único alvo, então não aparece um segundo link com o mesmo nome. Se o dono
  quiser a imagem clicável, o caminho é o padrão de "cartão inteiro clicável"
  (o link do título cobrindo a ficha com um pseudo-elemento), sem duplicar o
  `<a>`.
- Com o `status: 'preview'` do Map Areas, a ficha não tem link de título. A
  miniatura aparece mesmo assim, e a ficha reage ao hover (§3.6) como as
  outras.

### 3.6 Reação tipográfica na lista

- No hover e no `:focus-within` de uma ficha, o título dela desliza para a
  direita `clamp(16px, 3vw, 48px)` e as outras fichas da mesma lista vão para
  opacidade 0,35.
- A ficha que reage é a que está sob o cursor ou que contém o foco. Fora da
  lista, tudo volta ao normal.
- **Só com ponteiro fino:** sob `(hover: hover) and (pointer: fine)` para o
  hover. O `:focus-within` vale sempre.
- O sublinhado de hover do título (Gate 2) sai, porque o deslocamento já marca o
  alvo. O `:focus-visible` mantém o contorno global.
- **Contraste:** com opacidade 0,35, o texto das outras fichas fica temporária e
  deliberadamente abaixo de AA enquanto o cursor está em outra ficha. O axe
  roda sem hover e não pega isso. O dono aprovou o efeito no protótipo.

## 4. Regras que valem para os quatro efeitos

São as de `docs/MOTION_SPEC.md`. As consequências deste trabalho:

- **Reduced motion:** nenhuma transição nem animação. Os estados finais
  continuam valendo e aparecem na hora: o traço já vermelho, as prévias visíveis
  no hover e no foco, a ficha esmaecida, a imagem ampliada. A SPEC §5.3 pede
  "manter estados compreensíveis e feedback essencial". A MOTION_SPEC diz hoje
  "o site fica idêntico ao do Gate 2", então essa frase precisa ser ajustada
  para "sem movimento", porque os estados de hover mudam.
- **Sem JS:** tudo funciona menos o magnético. Nada nasce escondido fora de um
  estado de hover ou foco.
- **Toque:** sem dependência de hover (SPEC §5.3). As miniaturas estão sempre
  visíveis, e prévias e reação não são necessárias para entender nada. Todo
  estado de **hover** dos seis efeitos fica sob
  `(hover: hover) and (pointer: fine)`. Assim um toque não deixa a tira, o
  cartão, o zoom ou o esmaecimento presos. Os estados de foco
  (`:focus-visible`, `:focus-within`) valem em qualquer dispositivo. Essa
  decisão é minha.
- **Desempenho:** só `transform` e `opacity` animam.
- **As duas guardas de motion mudam de contrato:**
  - `scripts/motion-guard.test.ts` hoje só aceita transição em
    `Hero.module.css` sob `[data-entrance='run']`. Passa a aceitar também
    `transition` e `animation` (inclusive `@keyframes`, porque o traço que corre
    é uma animação de ida e volta) declaradas **dentro de
    `@media (prefers-reduced-motion: no-preference)`**, e só lá. A regra antiga
    da entrada continua valendo.
  - `e2e/motion.spec.ts`, com reduce: nada muda. A suíte exige zero duração em
    todo elemento e zero animação, inclusive depois do hover e do foco, nas
    duas páginas.
  - `e2e/motion.spec.ts`, sem reduce, em `/`: o teste "só a abertura tem
    motion" passa a ser "só elementos com `data-motion` têm duração". Cada
    elemento novo leva `data-motion`, com valor de escolha do builder. As duas
    asserções que hoje exigem zero duração e zero animação em todo elemento
    deixam de valer para a home, porque as transições de saída (o magnético
    voltando, o esmaecimento desfazendo) precisam estar declaradas também em
    repouso. No lugar delas entram:
    - nenhum elemento sem `data-motion` tem duração;
    - com a página em repouso depois da entrada (sem hover nem foco),
      `getAnimations()` é zero;
    - depois de passar por hover e foco, toda animação em curso pertence a um
      elemento com `data-motion`.
  - `e2e/motion.spec.ts`, sem reduce, em `/work/:slug`: as asserções continuam
    estritas como hoje (zero duração, zero animação). Os links do case study
    não ganham efeito (§2).
  - Essa forma de mudar o teste foi decisão minha. A troca é consciente: o
    teste da home passa de "não existe motion" para "todo motion é declarado e
    marcado".
- **Fichas no `MOTION_SPEC.md`:** uma por efeito (§3.1–§3.6, com §3.3 e §3.4
  podendo dividir uma ficha), no formato das existentes: objetivo, elemento,
  gatilho, estados, duração e easing, reduced motion, sem JS, evidência.
- **Backlog:** os três itens da tabela do §1 saem de `docs/BACKLOG.md`. O
  "Preview de projeto no hover" vira "Miniaturas com mídia real", ainda na Fase
  5.

## 5. O que fica com o builder

- Os nomes e a forma dos componentes: se o traço e o magnético viram um
  componente compartilhado entre `Hero` e `ExternalLink` ou um modificador do
  `ExternalLink`, e como a miniatura é desenhada.
- A posição da tira no hero (respeitando §3.3) e a da miniatura no mobile.
- As durações exatas das transições que o protótipo não fixa. A referência é a
  curva `cubic-bezier(0.2, 0.7, 0, 1)` da abertura, com 0,3 a 0,7 s.
- Como as imagens das capas são carregadas para a tira, que pode reaproveitar
  as `img` já presentes nas fichas.
- A evidência para o dono (capturas ou um GIF), salva em
  `docs/fase-3/segunda-leva/`.
