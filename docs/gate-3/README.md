# Gate 3 — Abertura da home com motion

A Fase 3 implementou a abertura aprovada nos protótipos: o nome sobe de trás da
fenda, se afasta com o scroll ("André" para a esquerda, "Arcodaci" para a
direita) enquanto a folha do índice sobe por cima do hero com a borda curva,
e o site inteiro ganhou scroll suave. Com `prefers-reduced-motion: reduce`, nada
disso acontece e o site é o do Gate 2.

- Design: `docs/superpowers/specs/2026-10-26-fase-3-motion-design.md`
- Fichas de cada efeito: `docs/MOTION_SPEC.md`
- Protótipos de referência: `docs/fase-3/prototipo/desktop.html` e
  `docs/fase-3/prototipo/mobile.html`

## Como avaliar

```bash
pnpm build:preview && pnpm preview
# http://127.0.0.1:4173/        (EN)
# http://127.0.0.1:4173/pt      (PT)
```

## Critério do Gate 3

"Comparação visual com os comps e medição de fluidez em hardware real."

| Item | Estado |
| --- | --- |
| Comparação com os protótipos em 1440, 768 e 390, nos dois idiomas | Capturas abaixo; diferenças listadas em "Comparação" |
| Fluidez no Chrome desktop | Medido (ver "Fluidez"); falta a sensação do dono |
| **Fluidez num celular real do dono** | **Pendente — só o dono pode fazer** |
| `pnpm validate` verde | Verde até o `build`, que falha por desenho enquanto houver mock (ver abaixo) |
| Reduced motion idêntico ao Gate 2 | `e2e/motion.spec.ts`, capturas `*-reduce-p50.png` |

## Pendência do dono: o celular

O protótipo do celular só foi visto numa moldura de 390 × 844 no navegador. O
aparelho é a prova.

1. Na máquina de desenvolvimento, na mesma rede Wi-Fi do celular:

   ```bash
   pnpm build:preview && pnpm preview --host
   ```

2. O terminal mostra um endereço `Network: http://192.168.x.x:4173/`. Abra-o
   no celular.
3. Confira: a entrada do nome ao abrir; o afastamento e a curva acompanhando o
   dedo, para baixo e para cima; nenhum engasgo; o índice e os links levando
   à seção certa. No celular o scroll é o nativo (o Lenis só suaviza mouse e
   trackpad), então a sensação deve ser a de sempre.
4. Diga se aprova, ou o que mudar.

## Capturas

Geradas por `npx playwright test --project=capture e2e/gate-3.capture.ts`, em
`docs/gate-3/home-<viewport>-<locale>-<estado>.png` — viewports `desktop`
(1440 × 900), `tablet` (768 × 1024) e `mobile` (390 × 844), locales `en` e
`pt` (24 imagens):

- `p0`, `p50`, `p100`: depois da entrada, com a página rolada 0, meia e uma
  altura de tela.
- `reduce-p50`: com reduced motion, meia tela rolada — o hero no fluxo
  normal, rolando como no Gate 2; sem curva, escala nem sombra.

`pnpm capture` também regrava `docs/gate-2/`; desde esta fase aquelas capturas
usam reduced motion, que é o site do Gate 2.

## Comparação com os protótipos

Igual ao protótipo: entrada (1,1 s, segunda linha +120 ms), afastamento
(25 vw a partir de 768 px, 40 vw abaixo), curva (14 vh e 7 vh), escala até
0,94, sombra e o bloco de baixo subindo e apagando.

Diferenças, todas decorrentes do site real:

- **A barra superior não fica dentro do hero.** No protótipo ela era parte do
  hero e ia junto; aqui ela rola embora e o hero só prende depois que ela sai.
- **Moldura de tinta.** Com o hero encolhido aparece `--ink` em volta dele,
  como no protótipo (lá era o fundo da página); aqui vem do invólucro da
  abertura, porque o fundo da página é claro.
- **A folha cobre o nome no meio do afastamento**, como no protótipo — a
  limitação que o dono aceitou (`docs/BACKLOG.md`).

## Fluidez

Medida em Chromium (Playwright, headless, na máquina de desenvolvimento):
intervalo entre frames enquanto a roda rola a abertura para baixo e para cima.

| Viewport | Frames | Mediana | p95 | Máximo | Acima de 50 ms |
| --- | --- | --- | --- | --- | --- |
| 1440 × 900 | 265 | 16,7 ms | 16,8 ms | 16,8 ms | 0 |
| 390 × 844 | 267 | 16,7 ms | 16,7 ms | 16,8 ms | 0 |

Headless não é hardware de usuário. Para conferir no seu Chrome: DevTools →
Performance → gravar enquanto rola a abertura; não deve haver frames longos
(vermelhos) acima de 50 ms.

## `pnpm validate`

Typecheck, lint, 122 testes unitários e 62 e2e passam. O passo `build` sai
com 1 porque 12 itens de conteúdo ainda têm `mock: true` — a trava do critério
8 funcionando, registrada em `docs/BACKLOG.md` ("`pnpm validate` falha por
desenho enquanto houver mock"). Fecha na Fase 4. `pnpm build:preview` passa.

## Testes da fase

| O quê | Teste |
| --- | --- |
| Contas da abertura (valores aprovados, 767/768 px) | `src/motion/opening.test.ts` |
| Lenis: uma instância, desligado com reduced motion | `src/motion/smoothScroll.test.ts`, `e2e/smooth-scroll.spec.ts` |
| Entrada, deep link, sombra, foco por teclado | `src/motion/Opening.test.tsx` |
| Afastamento e folha nos três viewports, troca em 768 px, Shift+Tab, deep link | `e2e/opening.spec.ts` |
| Só a entrada declara transição | `scripts/motion-guard.test.ts`, `e2e/motion.spec.ts` |
| Nome acessível intacto, divisão do nome | `src/sections/Hero/Hero.test.tsx` |

Merge na `main` só depois da aprovação do dono.
