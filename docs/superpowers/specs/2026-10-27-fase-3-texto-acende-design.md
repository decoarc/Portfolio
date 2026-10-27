# Fase 3, segunda leva — Texto que acende com o scroll

- **Data:** 2026-10-27
- **Status:** aprovado pelo dono em 2026-10-27
- **Branch:** `fase-3-texto-acende`
- **Depende de:** hover da segunda leva (`d36828a`), scroll suave
  (`src/motion/smoothScroll.ts`)
- **Referência visual:** `docs/fase-3/prototipo/texto-acende.html`. É um
  protótipo descartável e já abre na configuração escolhida pelo dono. Na
  dúvida sobre ritmo ou aparência, quem decide é o protótipo, salvo onde este
  documento diz outra coisa. O protótipo não cuida de acessibilidade, reduced
  motion nem fallback sem JS; isso está aqui.

## 1. Intenção

Item "Texto que acende com o scroll" do `docs/BACKLOG.md` (referência:
yasingenc.net). O que pegou o dono na referência foi **a leitura acontecendo
junto com a rolagem, e a fluidez dela**: o texto não "toca" uma animação ao
entrar na tela, ele acende na exata medida em que a pessoa rola, como se a
rolagem lesse junto.

## 2. Objetivos, não-objetivos, anti-objetivos

**Objetivos**

- Dois parágrafos acendem palavra por palavra, guiados pela posição da
  rolagem, de forma contínua e reversível.
- A fluidez vem do scroll suave que já existe: o efeito lê a posição no mesmo
  laço de frame do Lenis.

**Não-objetivos**

- Outros textos: o corpo do Sobre, as fichas da Abordagem, a intro de Work e o
  case study ficam como estão.
- Cortina do case study (próximo item da leva).
- Calibrar para o texto real: os valores são revistos na Fase 5, quando o mock
  sair (o lead do Sobre já é real; a intro da Abordagem também, mas as fichas
  abaixo dela são mock).

**Anti-objetivos** (é falha mesmo que funcione)

- Animação disparada uma vez ao entrar na tela, em vez de acompanhar a rolagem.
- Texto apagado sem JS, com reduced motion ou para leitor de tela.
- Leitor de tela lendo palavra por palavra, ou o texto partido na árvore de
  acessibilidade.
- Degraus visíveis (o acender saltar de palavra em palavra sem suavidade) ou
  atraso em relação ao scroll.
- Estado React por frame ou um segundo laço de `requestAnimationFrame`.

## 3. O que foi decidido

### 3.1 Onde

- **Introdução da Abordagem:** o `intro` do `SectionHead` dentro de
  `src/sections/Approach/Approach.tsx`. Só nessa seção; o `SectionHead` de Work
  também tem `intro` e fica sem efeito.
- **Lead do Sobre:** o parágrafo `.lead` de `src/sections/About/About.tsx`.

### 3.2 Comportamento (decidido pelo dono no protótipo)

| | |
|---|---|
| Opacidade inicial (apagado) | **0,20** |
| Suavidade da frente | **2,5 palavras** em transição ao mesmo tempo |
| Começa a acender | quando o **topo** do parágrafo cruza **80%** da altura da viewport (medida do topo da tela) |
| Termina aceso | quando o **fim** do parágrafo cruza **50%** da altura da viewport |
| Direção | reversível: rolar para cima apaga de novo; abaixo do início fica apagado, acima do fim fica aceso |

A conta do protótipo (`frame()` em `texto-acende.html`) é a aprovada:

- `from = rect.top − 0,80 × vh`, `to = rect.bottom − 0,50 × vh`
- `t = clamp(0, from / (from − to), 1)`
- `p = t × (n + soft)`, onde `n` é o número de palavras e `soft = 2,5`
- palavra `i` (a partir de 0): `opacity = dim + (1 − dim) × clamp(0, (p − i) / soft, 1)`

Com `t = 1`, todas as palavras estão em opacidade 1. A cor de cada parágrafo
não muda: o aceso é exatamente o estado atual (`--ink` no lead, `--ink-muted`
na intro); o efeito só mexe em `opacity`.

### 3.3 Regras (do `docs/MOTION_SPEC.md`, aplicadas aqui)

- **Reduced motion:** nenhum efeito; texto aceso, sem quebra em palavras.
- **Sem JS:** o texto nasce aceso. O estado apagado só existe sob um atributo
  que o script aplica quando vai animar (como o `data-entrance` da abertura).
  Como o site é uma SPA sem prerender, isso quer dizer: o primeiro render já
  sai aceso, e ele só apaga quando o efeito aplica o atributo. O teste prova
  isso no primeiro render ou com o efeito bloqueado; não há prerender no
  escopo.
- **Fim da página** (decisão minha): se a página não tiver rolagem suficiente
  para o fim do parágrafo chegar a 50% da viewport (tela alta, seções curtas
  depois do Sobre), a linha de término sobe até onde a rolagem máxima alcança,
  e o parágrafo fica todo aceso no fim da página. Nenhum parágrafo pode ficar
  meio apagado para sempre. Fora desse caso, a conta é a da §3.2.
- **Leitor de tela:** lê a frase inteira, sempre. A versão quebrada em palavras
  é só visual (`aria-hidden`), e a frase inteira fica disponível para a
  tecnologia assistiva (por exemplo, numa cópia `.visually-hidden`, que já
  existe em `global.css`). A forma exata é do implementador, desde que o texto
  não apareça duas vezes nem na tela nem para o leitor, e que copiar e colar
  continue trazendo a frase.
- **Contraste** (decisão do dono, 2026-10-27): o estado apagado (0,20) é uma
  exceção aceita ao contraste WCAG; é o próprio efeito. O gate de
  `e2e/a11y.spec.ts` continua exigindo zero violações e zero incompletos de
  `color-contrast`, medindo o texto **aceso**: o teste rola até os dois
  parágrafos ficarem acesos (como já espera a abertura terminar) antes da
  auditoria. Um teste à parte confirma que, com reduced motion, os dois
  parágrafos têm opacidade 1 desde o carregamento. Subir a opacidade inicial
  até passar no contraste foi considerado e recusado.
- **Toque:** vale igual. No celular o scroll é nativo; a conta é a mesma.
- **Desempenho:** a posição vem de `onScroll` de `smoothScroll.ts` (evento do
  Lenis quando ativo, scroll da janela com um rAF por frame quando não). Por
  frame, só uma custom property por parágrafo (`--p` no protótipo); a opacidade
  de cada palavra sai em CSS. Nada de estado React por frame.
- **Idiomas:** funciona em pt e en; a quebra em palavras acompanha o texto do
  locale e se refaz quando ele troca.
- **Guarda de motion:** o efeito não usa `transition` nem `animation` — a
  suavidade vem do Lenis —, então `scripts/motion-guard.test.ts` não é afetado.
  As palavras ganham um valor de `data-motion` próprio se o
  `e2e/motion.spec.ts` precisar distingui-las.

## 4. Documentação

- Ficha nova "Texto que acende" em `docs/MOTION_SPEC.md`, no formato das
  demais, com a evidência.
- `docs/BACKLOG.md`: item marcado como feito; resta a cortina do case study.

## 5. Para o implementador decidir

- Componente ou hook (algo como um `ScrollLitText` em `src/components/` ou um
  hook em `src/motion/`) e como o `SectionHead` recebe a intro com efeito.
- Quando medir (`getBoundingClientRect` por frame, como o protótipo, ou cache
  com `ResizeObserver`), desde que não haja degrau nem atraso visível.
- Como a quebra preserva espaços e pontuação (a vírgula fica com a palavra
  anterior, como no protótipo).
- Testes: unitário para a conta (`t`, `p`, opacidade por palavra, extremos) e
  e2e para reduced motion (texto aceso, sem quebra), sem JS e leitor de tela
  (nome acessível do parágrafo igual à frase).
