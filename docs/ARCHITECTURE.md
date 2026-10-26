# Arquitetura

Estado após a Fase 2 (fundação). Stack: React 19, Vite 8, TypeScript estrito,
React Router 8, CSS Modules com custom properties. Hospedagem: Cloudflare Pages
(`public/_redirects` faz o fallback de SPA). Sem backend, sem CMS.

## Pastas

```text
src/
  main.tsx              entrada; importa as fontes e os estilos globais
  app/                  roteamento e casca de página
    routes.tsx          dois subtrees: /pt (PT) e / (EN)
    LocaleLayout.tsx    provê o locale (LocaleContext), masthead e rodapé
    HomeRoute.tsx       monta as seções da home
    CaseStudyRoute.tsx  ficha aberta do projeto (full ou preview)
    NotFoundRoute.tsx   404 no idioma da rota
    ScrollManager.tsx   rolagem e foco ao trocar de rota ou hash
    homeSections.ts     quais seções a home renderiza, e a ordem
  components/           peças reutilizáveis, sem copy própria
    Sheet/ SectionHead/ ProjectSlip/ Masthead/ ExternalLink/ SkipLink/
  sections/             uma pasta por seção da home
    Hero/ Release/ Work/ Approach/ About/ Interests/ Contact/
  content/              camada de conteúdo (ver abaixo)
  lib/                  locale.ts (caminhos e troca de idioma), mock.ts
  styles/               tokens.css, global.css
  test/setup.ts         setup do Vitest
e2e/                    Playwright (projetos chromium e capture)
scripts/                trava de mock e teste de motion
docs/                   spec, decisões, backlog, dossiês dos gates
```

## Regra de composição das seções

- Uma seção recebe `copy` e dados por props, nunca importa conteúdo sozinha.
  Quem lê o conteúdo é a rota (`HomeRoute`), via `getContent(locale)`.
- Toda seção é uma `Sheet` (`tone="cover"` ou `"sheet"`), com `id` e
  `aria-labelledby`. O respiro vem de `--sheet-pad-*`, nunca de `padding`
  sobreposto.
- O número da seção é a posição em `homeSections(site)` mais um: o mesmo no
  índice (Release) e no `SectionHead`. Seção sem itens (Interests vazio) não
  entra, e os números seguintes se ajustam.
- Componentes não contêm string voltada ao usuário. Rótulos acessíveis também
  vêm do conteúdo.
- Nenhum `animation` nem `transition` (motion é a Fase 3).

## Camada de conteúdo

`src/content/<locale>/` guarda `site.ts` (copy da casca e das seções) e
`projects/` (um arquivo por projeto). `types.ts` define o shape; os dois locales
têm o mesmo shape e `content.test.ts` falha se divergirem.

- `publication.ts` decide o que é público: `listProjects` remove rascunhos,
  `caseStudyAccess` devolve `full | preview | none`, `caseStudyHref` só devolve
  link para projeto `published`.
- Integridade: `type: 'concept'` sempre exibe o rótulo de estudo conceitual;
  repositório privado não é linkado; nenhuma métrica inventada.
- Todo item inventado leva `mock: true`.
- A árvore `src/content/**` e `src/lib/mock.ts` precisa carregar no Node:
  imports relativos com extensão `.ts`, tipos só por `import type`, sem alias
  `@/`, sem CSS nem DOM.

## Rotas por locale

| Rota                            | Tela                      |
| ------------------------------- | ------------------------- |
| `/`, `/pt`                      | home (EN, PT)             |
| `/work/:slug`, `/pt/work/:slug` | case study                |
| qualquer outra sob `/` ou `/pt` | 404 no idioma do prefixo  |

O locale vem do prefixo da URL, não do navegador. `lib/locale.ts` troca o
idioma preservando caminho e hash. `vite-spa-fallback.ts` espelha o
`_redirects` da Cloudflare no `vite preview`.

## Trava de mock

`scripts/assert-no-mock.ts` carrega `src/content/index.ts` no Node, percorre a
árvore com `findMockPaths` e sai com 1, listando os caminhos, enquanto existir
`mock: true`. `--allow-mock` (ou `ALLOW_MOCK=1`) lista, avisa e sai com 0.

A trava está **dentro do script `build`**, e não em `prebuild`, porque o pnpm 10
não roda hooks `pre`/`post` por padrão (`enable-pre-post-scripts` é `false`); um
`prebuild` seria ignorado em silêncio e a trava nunca dispararia.

## Scripts

| Script                        | O que faz                                                                  |
| ----------------------------- | -------------------------------------------------------------------------- |
| `dev`                         | servidor de desenvolvimento                                                |
| `build`                       | trava de mock, `tsc -b`, `vite build`; **falha enquanto houver mock**      |
| `build:preview`               | igual, mas a trava só avisa; usado pelo e2e e pelo dossiê                  |
| `preview`                     | serve `dist/` (com fallback de SPA)                                        |
| `typecheck`, `lint`, `test`   | `tsc -b`, ESLint, Vitest                                                   |
| `format`, `format:check`      | Prettier                                                                   |
| `test:e2e`                    | Playwright, projeto `chromium` (sobe `build:preview` + `preview`)          |
| `capture`                     | Playwright, projeto `capture`; grava `docs/gate-2/`                        |
| `validate`                    | typecheck, lint, test, build, test:e2e; falha por desenho enquanto houver mock |

## Testes

- Vitest (jsdom): componentes, seções, rotas, conteúdo e paridade de locales.
  `src/test/setup.ts` guarda os stubs de `window` com
  `typeof window !== 'undefined'` para que testes `// @vitest-environment node`
  rodem.
- `scripts/no-motion.test.ts` varre `src/**/*.css` atrás de `animation` e
  `transition`.
- Playwright: a11y (axe), CTAs na primeira dobra, responsividade, teclado,
  jornada, roteamento por locale e motion. O e2e de motion confere
  `getAnimations()` **e** as durações computadas de `transition`/`animation`,
  porque `getAnimations()` sozinho não vê transições ociosas.
