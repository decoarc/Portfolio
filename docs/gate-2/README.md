# Gate 2 — Fundação sem motion

A Fase 2 reescreveu `src/` na direção Editorial Rolodex, com os dois idiomas,
sem nenhum motion. Este dossiê diz como avaliar, o que cada critério exige e o
que precisa de revisão do dono.

## Como avaliar

```bash
pnpm build:preview && pnpm preview
# http://127.0.0.1:4173/        (EN)
# http://127.0.0.1:4173/pt      (PT)
```

Use `build:preview`: `pnpm build` falha de propósito enquanto houver mock.

## Critério do Gate 2

"Navegação, conteúdo e responsividade funcionam com todo o motion desligado."

| Critério                                                             | Teste que cobre                                                                                                                  |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Navegação: rotas por locale, recarga, 404                            | `e2e/routing.spec.ts`, `src/app/routes.test.tsx`                                                                                 |
| Navegação: home, case study, volta a `#work`, troca de idioma        | `e2e/journey.spec.ts`                                                                                                            |
| Navegação por teclado, skip link, contorno de foco                   | `e2e/keyboard.spec.ts`                                                                                                           |
| Conteúdo: paridade EN/PT, integridade, publicação                    | `src/content/content.test.ts`, `src/content/publication.test.ts`                                                                 |
| Conteúdo: sem mock em produção                                       | `scripts/assert-no-mock.test.ts`; trava dentro de `pnpm build`                                                                   |
| Acessibilidade (axe)                                                 | `e2e/a11y.spec.ts`                                                                                                               |
| Responsividade: sem rolagem horizontal, nada passa da borda em 390px | `e2e/responsive.spec.ts`                                                                                                         |
| Responsividade: CTAs na primeira dobra, 3 viewports × 2 idiomas      | `e2e/first-viewport.spec.ts`                                                                                                     |
| Motion desligado: nenhuma animação ativa nem duração computada       | `e2e/motion.spec.ts` (`getAnimations()` e `transition`/`animation` computados, com `reduce` e `no-preference`)                   |
| Motion desligado: nenhum `animation`/`transition` em CSS             | `scripts/no-motion.test.ts` (varre `src/**/*.css`)                                                                               |
| Fraunces completa carregada (`opsz`, `SOFT`, `WONK`)                 | `e2e/motion.spec.ts`                                                                                                             |

## Capturas

Geradas por `pnpm capture` (`e2e/gate-2.capture.ts`), em
`docs/gate-2/<nome>-<viewport>-<locale>.png`, com viewports `desktop`
(1440×900), `tablet` (768×1024) e `mobile` (390×844), nos locales `en` e `pt`
(18 imagens):

- `home-<viewport>-<locale>.png`: primeira dobra da home;
- `home-full-<viewport>-<locale>.png`: home inteira;
- `case-<viewport>-<locale>.png`: case study.

Para a decisão de fonte, compare `home-*-pt.png` com
`docs/gate-1/02-editorial-rolodex-*-pt.png`.

## Decisões registradas nesta fase

- **Fraunces `full.css`.** Decisão do dono em 2026-10-26: importar o arquivo
  completo (`opsz`, `SOFT`, `WONK` ativos); o comp carregava só o eixo de peso.
  O dono aprovou o resultado no checkpoint da Task 4, comparando as capturas do
  Gate 2 com as do Gate 1.
- **Release** é o índice numerado da home, na folha clara, no lugar de um menu
  de seções no topo; o masthead carrega só a marca da home e o seletor de
  idioma.
- **Numerais no trilho** só nos números das seções da home e das fichas de
  Work. Abordagem não leva número (colidia com o da seção).
- **Case study** usa margem de trilho `clamp(160px, 18vw, 240px)` a partir de
  768px, para caber o `<dl>` mono (papel, período, stack, links).
- **`Sheet`** define o respiro por `--sheet-pad-*`, nunca com `padding`
  sobreposto.
- **`src/test/setup.ts`** mudou o mínimo: stubs de `window` guardados por
  `typeof window !== 'undefined'`, para testes `// @vitest-environment node`.
- **Scripts:** `build` (trava de mock, `tsc -b`, `vite build`; falha enquanto
  houver mock), `build:preview` (permite mock), `test:e2e` (projeto
  `chromium`), `capture` (projeto `capture`, grava `docs/gate-2/`).

## Para revisão do dono

### PT traduzido de copy real (EN verificado)

`src/content/pt/site.ts`:

- `meta.homeTitle`, `shell.footerNote`, `person.role`
- `shell.skipToContent` ("Pular para o conteúdo")
- `release.label` ("Sumário")
- `links.labels.live` ("Demo ao vivo"), `links.labels.repo`,
  `links.externalHint` ("abre em nova aba")
- `work.intro`, `work.previewNote` ("Estudo de caso em breve")
- `approach.label`, `approach.intro`
- `about.lead`, `about.body`, `about.stackLabel` ("Trabalho com"),
  `about.stack[4]` ("APIs REST")
- `contact.lead` ("Aberto a vagas, colaborações e conversas técnicas de
  qualidade."): o EN diz "sharp technical conversations"; o dono escolhe o tom
- `caseStudy.backToWork`, `roleLabel` ("Papel"), `yearLabel`, `previewNotice`,
  `conceptNotice`
- `notFound.title`, `notFound.body`, `notFound.homeLabel`

`src/content/pt/projects/map-areas.ts`: `summary`, `role` ("Desenvolvedor
solo"), `cover.alt`, os cinco `sections[*].heading`, `sections[0].paragraphs[0]`
e todos os `sections[1..4].items[*]`.

Hero, `person.location`, `projectType` e os resumos dos projetos conceituais em
PT vieram literais do conteúdo da Fase 0. O PT de Abordagem e das seções dos
projetos conceituais é mock (tradução do mock EN) e a trava de build o bloqueia.

### Rótulos de interface escritos sem fonte (Task 2)

Não são afirmações sobre trabalho, mas o dono deve revisar o texto:

- `links.externalHint`
- `release.label`
- `approach.label` e `approach.intro`
- `caseStudy.conceptNotice` (afirma "sem usuários, sem resultados em
  produção", verdadeiro para todo item conceitual)
- `caseStudy.roleLabel`, `caseStudy.stackLabel`, `caseStudy.linksLabel`
- `contact.lead` em PT (tom de "sharp")

## Pendente

`pnpm build` e `pnpm validate` falham enquanto houver mock (critério 8 da
spec, funcionando). O critério 9 fecha na Fase 4, com conteúdo real.
