# Fase 3 — Motion: a abertura da home

- **Data:** 2026-10-26
- **Status:** aguardando aprovação do dono
- **Depende de:** Fase 2 concluída (merge `841d95a`), direção Editorial Rolodex
- **Referência visual:** `docs/fase-3/prototipo/desktop.html` e
  `docs/fase-3/prototipo/mobile.html` — protótipos descartáveis aprovados pelo
  dono, com a configuração escolhida. São a fonte de verdade para o movimento:
  na dúvida sobre curva, ritmo ou valor, o protótipo responde.

## 1. Intenção

O site está estático e correto (Gate 2). O dono quer dinamismo e uma sensação
de movimento e profundidade, sem perder a identidade editorial — papel, serifa,
índice numerado. Referências levantadas: yasingenc.net (linhas de texto
gigantes que se afastam com o scroll) e dennissnellenberg.com (borda curva
entre seções, scroll suave). A ideia não é copiá-los.

Do levantamento, o dono escolheu dois momentos, e esta fase é só eles:

1. **O nome se afastando** no hero.
2. **A folha virando:** o índice (Release) sobe por cima do hero com a borda
   curva — a "virada de página" que `docs/DESIGN_DECISIONS.md` (D-Release) já
   atribui a essa seção.

Mais o **scroll suave** no site inteiro, que o dono liberou explicitamente.

## 2. Objetivos, não-objetivos, anti-objetivos

**Objetivos**

- A primeira dobra da home ganha um momento autoral: o nome entra, e o primeiro
  gesto de scroll o separa enquanto a folha do índice sobe.
- O movimento acompanha o scroll nos dois sentidos (voltar desfaz).
- Tudo continua funcionando sem motion, sem JS e com teclado.

**Não-objetivos** (registrados em `docs/BACKLOG.md`, seção "Interação e motion
— depois da abertura da home")

- Texto que acende com o scroll, lista de trabalhos reagindo ao mouse, cortina
  ao abrir um case study, botões que se enchem de cor, preview de projeto no
  hover.
- Resolver a folha cobrindo o nome no meio do afastamento (ver §3.3).
- Motion nas páginas de case study, além do scroll suave.

**Anti-objetivos** — falha mesmo que funcione:

- O nome ou os CTAs ficarem ilegíveis ou atrasados para quem chega.
- Navegação (índice, CTAs, links de hash, troca de idioma) depender de
  animação ou ficar mais lenta.
- Engasgo perceptível no scroll em hardware comum.
- Visual de "template de agência": brilho, partículas, cursor customizado.

## 3. O que foi decidido

### 3.1 Entrada do nome

Ao carregar a home, "André" e "Arcodaci" sobem de trás de uma fenda: cada
palavra está numa linha que corta o que passa da sua altura, e o texto parte de
`translateY(105%)` até a posição final.

- Duração 1,1 s, easing `cubic-bezier(.2, .7, 0, 1)`; a segunda linha atrasa
  120 ms.
- Só o nome entra assim. Metadados, statement, CTAs e localização estão no lugar
  desde o primeiro frame.

### 3.2 Afastamento do nome

Com o scroll, "André" desliza para a esquerda e "Arcodaci" para a direita.

- Progresso `p = clamp(scrollY / alturaDaJanela, 0, 1)`; deslocamento
  `easeOutCubic(p) × distância`, em `vw`.
- **Distância: 25 vw no desktop, 40 vw no celular** (escolha do dono para cada
  um).
- Ao mesmo tempo, o bloco de baixo do hero (função, statement, CTAs,
  localização) sobe `p × 6 vh` e perde opacidade (`1 − 1,4p`).
- A linha que contém a palavra corta só na vertical: na horizontal a palavra
  pode sair da coluna e da tela.

### 3.3 Folha virando

O hero fica parado no topo enquanto o Release (folha clara, `--surface`) sobe
por cima dele no fluxo normal da página.

- A borda de cima do Release é curva (uma elipse: meio da borda mais alto que as
  pontas). Altura da curva `sin(π·p) × máximo`: zero quando a folha começa a
  entrar, máxima no meio do caminho, zero quando chega ao topo.
- **Altura máxima da curva: 14 vh no desktop, 7 vh no celular** (escolha do
  dono).
- Sob a folha, o hero encolhe até `scale(0,94)` e escurece com um gradiente de
  `--ink` de transparente a 55 %, até opacidade 0,9.
- A folha cobre o nome antes de o afastamento terminar. O dono notou, testou
  duas alternativas (segurar o hero até o nome sair; manter o nome por cima da
  folha) e recusou as duas: fica como está, com possível ajuste futuro.

### 3.4 Scroll suave

Biblioteca Lenis no site inteiro, `lerp ≈ 0,09` como no protótipo. Toque
continua nativo (padrão do Lenis), então o celular rola como sempre rolou.

## 4. Restrições

### 4.1 Reduced motion

Com `prefers-reduced-motion: reduce`:

- Lenis não é iniciado; scroll nativo.
- Sem entrada: o nome aparece no lugar.
- Sem afastamento, sem escala nem sombra no hero, sem curva.
- Ainda pode haver o hero parado com o Release subindo por cima: é o próprio
  scroll, não uma animação. Se o empilhamento atrapalhar a leitura, o hero
  volta ao fluxo normal — escolha de quem construir, registrada no
  `MOTION_SPEC.md`.

O que vale é o resultado do Gate 2: navegação, conteúdo e responsividade
idênticos com motion desligado.

### 4.2 Sem JS

A página renderizada sem JS é a da Fase 2. O estado escondido da entrada só
pode existir depois que o script confirmar que vai animar (por exemplo, uma
classe aplicada por script antes da primeira pintura). Nenhum conteúdo nasce com
`opacity: 0` ou fora do lugar no CSS.

### 4.3 Acessibilidade e conteúdo

- O `h1` continua com o nome acessível "André Arcodaci", com espaço. Dividir em
  duas linhas não pode juntar as palavras nem duplicar o texto para leitor de
  tela. Os testes já localizam o hero por `getByRole('region', { name:
  site.person.name })`.
- A divisão vem de `person.name` (separar no espaço), não de copy nova nos
  componentes.
- A regra de `e2e/first-viewport.spec.ts` continua valendo: os dois CTAs
  inteiros na primeira dobra, em 390×844 e 768×1024, com a página parada no
  topo.
- Foco e teclado: Tab pelo hero e pelo índice não pode deixar o foco num
  elemento coberto pela folha sem trazê-lo à vista.

### 4.4 Navegação

- O Lenis precisa conviver com o `ScrollManager`: links de hash (o índice, os
  CTAs `#work` e `#contact`), troca de rota, voltar/avançar e o foco no destino
  continuam funcionando. Com Lenis ativo, rolagem para âncora passa pelo Lenis
  (`scrollTo`) para não brigar com ele.
- A troca de idioma e a navegação para o case study não esperam animação.

### 4.5 Desempenho

- Animar só `transform` e `opacity`. A curva pode ser um pseudo-elemento cuja
  altura muda; se medir mal, trocar por `scaleY` de uma elipse de altura fixa.
- Um único laço de `requestAnimationFrame` (o do Lenis) atualiza tudo; nada de
  estado React por frame.
- `will-change` só nos elementos que se movem.

### 4.6 Documentos que mudam

- **`docs/SPEC.md` §5.3** proíbe "smooth scrolling forçado ou seções presas por
  padrão". O dono autorizou as duas coisas em 2026-10-26: anotar a exceção no
  próprio §5.3, apontando para este documento.
- **`docs/MOTION_SPEC.md`** está desatualizado (fala da direção antiga, Ledger ×
  Datum × Cut). Reescrever para a direção Editorial Rolodex, com uma ficha por
  efeito no formato do `SPEC.md` §5.4: objetivo, elemento, gatilho, estados
  inicial e final, duração e easing, alternativa reduced-motion, fallback sem
  JS.
- **`docs/ARCHITECTURE.md`**: trocar "Nenhum `animation` nem `transition`" pela
  regra nova e registrar a pasta `src/motion/`, já prevista na arquitetura.
- **`docs/DESIGN_DECISIONS.md`**: nova decisão "D-Motion" com a tecnologia
  (Lenis + JS próprio, sem GSAP) e o porquê.
- **README**: estado do projeto.

### 4.7 Testes que mudam

Dois guardas da Fase 2 proíbem qualquer motion e vão falhar:

- `scripts/no-motion.test.ts` (nenhum CSS declara `animation`/`transition`).
- `e2e/motion.spec.ts` (zero animações e zero durações, com e sem reduced
  motion).

Os dois viram guardas da regra nova, não são apagados:

- Com `reduce`: zero animações e zero durações, como hoje.
- Sem `reduce`: só os elementos da abertura podem ter transição ou transform
  dirigido por scroll; qualquer outro é falha.

Testes novos, no mínimo: nome acessível do `h1` intacto; com reduced motion o
nome está no lugar no primeiro frame; sem reduced motion, depois de rolar uma
altura de tela os dois spans do nome estão deslocados em sentidos opostos e o
Release cobre o topo; links do índice levam à seção certa com o Lenis ativo.

## 5. Gate 3

Conforme `docs/superpowers/specs/2026-10-26-portfolio-visual-redesign-design.md`:
"comparação visual com os comps e medição de fluidez em hardware real". Para
esta fase:

1. Comparação lado a lado com `docs/fase-3/prototipo/` em 1440, 768 e 390 de
   largura, nos dois idiomas, com capturas ou gravação em `docs/gate-3/`.
2. Fluidez medida no Chrome desktop e **num celular real do dono** — o celular
   só foi visto numa moldura de 390×844 no navegador; o aparelho é a prova.
3. `pnpm validate` verde.
4. A suíte com reduced motion mostra o site idêntico ao do Gate 2.

## 6. Escolhas de quem desenhou, para o dono conferir

- **"Celular" é abaixo de 768 px**, o mesmo corte que o Hero já usa entre flex
  e grid. **Tablet (768–1199 px)** usa os valores do desktop: 25 vw e curva de
  14 vh. O dono só viu desktop e celular.
- **Página que abre já rolada** (deep link `/#work`, recarregar no meio, voltar
  do navegador): sem entrada; o afastamento e a curva assumem o valor da posição
  atual desde o primeiro frame.
- **Entrada a cada carregamento da home**, inclusive ao voltar de um case
  study e ao trocar de idioma. Começa depois de `document.fonts.ready`, para não
  revelar a fonte de fallback.
- **Rolagem para âncora com o Lenis** fica suave (duração padrão dele). Com
  reduced motion, salto direto como hoje.
- **Lenis + código próprio, sem GSAP.** Os efeitos são funções simples do
  scroll e uma transição CSS; GSAP não traria nada que justifique o peso.
  `SPEC.md` §9 só aceita GSAP se um efeito aprovado provar que CSS não alcança.

## 7. O que fica com quem construir

- A estrutura em `src/motion/` (hooks, instância do Lenis, leitura de reduced
  motion) e como o Hero e o Release a consomem, respeitando a regra de que
  seções não importam umas às outras.
- Como prender o hero: hoje a barra superior (`Masthead`) fica acima dele no
  fluxo e o hero mede `100svh − --masthead-h`. Nenhuma faixa de cor do `body`
  pode aparecer embaixo do hero parado.
- Versão exata do Lenis (uma estável com pelo menos duas semanas de publicação).
- Detalhes de easing que não mudam o resultado visto no protótipo.
