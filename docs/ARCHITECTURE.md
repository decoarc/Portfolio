# Arquitetura

Estado após a Fase 4 (acabamento: prerender, head por rota, segurança, acessibilidade, performance). Stack: React 19, Vite 8, TypeScript estrito,
React Router 8, CSS Modules com custom properties. Hospedagem: Cloudflare Pages, com um HTML
pré-renderizado por rota (ver "Prerender"). Sem backend, sem CMS.

## Pastas

```text
src/
  main.tsx              entrada; importa fontes e estilos, inicia o scroll suave
  app/                  roteamento e casca de página
    routes.tsx          dois subtrees: /pt (PT) e / (EN)
    LocaleLayout.tsx    provê o locale (LocaleContext), masthead e rodapé
    HomeRoute.tsx       monta as seções da home
    CaseStudyRoute.tsx  ficha aberta do projeto (full ou preview)
    NotFoundRoute.tsx   404 no idioma da rota
    head.ts             routeHead(): title, description, canonical, hreflang, Open Graph
    useRouteHead.ts     aplica o head da rota na navegação no cliente
    siteOrigin.ts       lê VITE_SITE_ORIGIN
    prerenderRoutes.ts  lista de rotas do prerender e o arquivo de cada uma
    entranceEarly.ts    script inline que marca data-entrance-early (MOTION_SPEC)
    ScrollManager.tsx   rolagem e foco ao trocar de rota ou hash
    homeSections.ts     quais seções a home renderiza, e a ordem
  components/           peças reutilizáveis, sem copy própria
    Sheet/ SectionHead/ ProjectSlip/ Masthead/ ExternalLink/ SkipLink/
  sections/             uma pasta por seção da home
    Hero/ Release/ Work/ Approach/ About/ Interests/ Contact/
  content/              camada de conteúdo (ver abaixo)
  lib/                  locale.ts (caminhos e troca de idioma), mock.ts
  motion/               movimento (ver docs/MOTION_SPEC.md)
    opening.ts          valores aprovados e as contas de um frame da abertura
    Opening.tsx         envolve Hero e Release; escreve as --opening-*, conduz a entrada
    smoothScroll.ts     instância única do Lenis; rolar para alvo e para o topo
    reducedMotion.ts    prefersReducedMotion()
  entry-server.tsx      bundle SSR usado só pelo prerender
  styles/               tokens.css, global.css, fonts.css
    fonts/              fraunces-latin.woff2 (instância gerada; ver scripts/fonts/)
  test/setup.ts         setup do Vitest
e2e/                    Playwright (projetos chromium e capture)
scripts/                trava de mock, guarda de motion, prerender, _headers
  fonts/                instance-fraunces.py e README (como a Fraunces latin é gerada)
vite-pages-preview.ts   plugin do `vite preview` que imita o Cloudflare Pages
docs/                   spec, decisões, backlog, dossiês dos gates
```

## Regra de composição das seções

- Uma seção recebe `copy` e dados por props, nunca importa conteúdo sozinha.
  Quem lê o conteúdo é a rota (`HomeRoute`), via `getContent(locale)`.
- Toda seção é uma `Sheet` (`tone="cover"` ou `"sheet"`). As seções de conteúdo
  levam `id` e `aria-labelledby`; o Hero só tem `aria-labelledby` (sem `id`) e
  o Release (o índice) é um `nav` rotulado, sem nenhum dos dois. O respiro vem de `--sheet-pad-*`, nunca de `padding`
  sobreposto.
- O número da seção é a posição em `homeSections(site)` mais um: o mesmo no
  índice (Release) e no `SectionHead`. Seção sem itens (Interests vazio) não
  entra, e os números seguintes se ajustam.
- Componentes não contêm string voltada ao usuário. Rótulos acessíveis também
  vêm do conteúdo.
- Motion: só `Hero.module.css` declara `transition`, e só sob
  `[data-entrance='run']`. O movimento por scroll vem das custom properties
  `--opening-*`, que o `Opening` escreve e Hero e Release leem com padrões
  neutros — as seções continuam sem importar uma à outra. Guardas:
  `scripts/motion-guard.test.ts` e `e2e/motion.spec.ts`.

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
idioma preservando caminho e hash. Em produção, quem decide qual arquivo
responde cada URL é o Cloudflare Pages; `vite-pages-preview.ts` imita isso no
`vite preview` (ver "Prerender").

## Prerender

`pnpm build` e `pnpm build:preview` rodam, depois do `vite build` do cliente,
um segundo `vite build --ssr src/entry-server.tsx` (saída em `dist-ssr/`, fora
do deploy) e `scripts/prerender.ts`, que grava em `dist/` um HTML pronto por
rota, usando `dist/index.html` como molde (`<!--head-->`, `<!--app-->`). O
React hidrata esse HTML; o conteúdo existe sem JS.

Arquivos gerados (lista em `src/app/prerenderRoutes.ts`, sai do conteúdo):

| Rota | Arquivo em `dist/` |
| --- | --- |
| `/` | `index.html` |
| `/pt` | `pt.html` |
| `/work/<slug>`, `/pt/work/<slug>` | `work/<slug>.html`, `pt/work/<slug>.html` (todo projeto que não é rascunho) |
| 404 em EN | `404.html` |
| 404 em PT | `pt/404.html` |

Formato do Pages: sem barra no fim e sem `.html` na URL; o Pages serve
`<caminho>.html`, e para um caminho sem arquivo usa o `404.html` mais próximo
subindo as pastas (por isso `/pt/qualquer` cai em `pt/404.html`). O
`public/_redirects` só tem `/pt/ /pt 301`: uma regra `/* /index.html 200`
mandaria tudo para a home, e a regra do `_redirects` vence o arquivo que casa.

`scripts/prerender.ts` falha (exit 1) se uma rota que não é 404 renderiza o 404,
se falta `<h1>`, `<title>` ou `description`, ou se `routeHead` lança.

- **Head por rota.** `routeHead(key, content, origin)` em `src/app/head.ts` é a
  única fonte: o prerender grava as tags e `useRouteHead` aplica as mesmas na
  navegação no cliente. `canonical`, `hreflang` e `og:url` precisam de URL
  absoluta.
- **`VITE_SITE_ORIGIN`.** A origem do site vem dessa variável no build.
  `build:preview` usa `http://127.0.0.1:4173` (`.env.preview`). `build` de
  produção **falha** sem ela, com a mensagem de `siteOrigin.ts`. O domínio é
  escolhido na Fase 5.
- **`_headers`.** O prerender grava `dist/_headers` (`scripts/headers.ts`): CSP
  com o hash do único script inline (o da entrada do nome), `nosniff`,
  `Referrer-Policy`, `Permissions-Policy` e `Cache-Control: immutable` em
  `/assets/*`. Como o `_headers` é gerado, o hash nunca fica velho.
- **Preview.** `vite-pages-preview.ts` lê `dist/_redirects` e `dist/_headers`
  a cada requisição e serve como o Pages: `_redirects` primeiro, URLs
  canônicas (sem `.html` nem barra no fim), arquivo exato, `<caminho>.html`,
  `<caminho>/index.html`, e o 404 mais próximo. O e2e roda contra ele. Não
  comprime (gzip) como o Pages; ver `docs/BACKLOG.md`.
- **Fonte.** A Fraunces latin é `src/styles/fonts/fraunces-latin.woff2`, gerada
  por `scripts/fonts/instance-fraunces.py` (eixo `SOFT` fixado em 0, `wght`,
  `opsz` e `WONK` inteiros, −44,7% sobre o fontsource). Fica em `src/` para o
  Vite pôr hash no nome (`/assets/fraunces-latin-<hash>.woff2`) e cair na
  regra de cache `immutable`. Vietnamese e latin-ext seguem do fontsource.
  Medidas em `docs/gate-4/PERFORMANCE.md`.

## Trava de mock

`scripts/assert-no-mock.ts` carrega `src/content/index.ts` no Node, percorre a
árvore com `findMockPaths` e sai com 1, listando os caminhos, enquanto existir
`mock: true`. `--allow-mock` (ou `ALLOW_MOCK=1`) lista, avisa e sai com 0.

A trava está **dentro dos scripts `build` e `build:preview`**, e não em um
`prebuild`: os dois precisam de argumentos diferentes (`build:preview` passa
`--allow-mock`), o que um único `prebuild` compartilhado não consegue dar. Com
a chamada explícita, a trava também não depende de como o host de deploy invoca
o build. A spec (R7, em
`docs/superpowers/specs/2026-10-26-portfolio-visual-redesign-design.md`) dizia
`prebuild`; este é o desvio, registrado aqui.

O script roda com `node scripts/assert-no-mock.ts`, que exige a remoção nativa
de tipos do Node (sem flag desde o Node 22.18 / 23.6); por isso
`engines.node` é `>=22.18`. O `.node-version` (`24`) fixa o Node do
Cloudflare Pages, cuja imagem padrão pode ser mais antiga que esse piso.

## Scripts

| Script                        | O que faz                                                                  |
| ----------------------------- | -------------------------------------------------------------------------- |
| `dev`                         | servidor de desenvolvimento                                                |
| `build`                       | trava de mock, `tsc -b`, `vite build`, build SSR, prerender; **falha enquanto houver mock** e sem `VITE_SITE_ORIGIN` |
| `build:preview`               | igual, mas a trava só avisa e a origem é a do preview; usado pelo e2e e pelo dossiê |
| `preview`                     | serve `dist/` como o Cloudflare Pages (`vite-pages-preview.ts`)            |
| `typecheck`, `lint`, `test`   | `tsc -b`, ESLint, Vitest                                                   |
| `format`, `format:check`      | Prettier                                                                   |
| `test:e2e`                    | Playwright, projetos `chromium` e `visual` (sobe `build:preview` + `preview`) |
| `test:visual:update`          | regrava as baselines da regressão visual                                   |
| `capture`                     | Playwright, projeto `capture`; grava `docs/gate-2/` e `docs/gate-3/`      |
| `validate:preview`            | typecheck, lint, format:check, test, build:preview, test:e2e (Gate 4)      |
| `validate`                    | typecheck, lint, test, build, test:e2e; falha por desenho enquanto houver mock |

## Testes

- Vitest (jsdom): componentes, seções, rotas, conteúdo e paridade de locales.
  `src/test/setup.ts` guarda os stubs de `window` com
  `typeof window !== 'undefined'` para que testes `// @vitest-environment node`
  rodem.
- `scripts/motion-guard.test.ts` varre `src/**/*.css` atrás de `animation` e
  `transition` fora da regra de entrada do Hero.
- Regressão visual (`e2e/visual.visual.ts`, projeto `visual`): hero, `#work`,
  `#contact` e o case Map Areas, 1440 / 768 / 390, EN e PT, com
  `threshold: 0` e sem pixels de tolerância. As baselines ficam em
  `e2e/visual.visual.ts-snapshots/` e são só `win32`, geradas nesta máquina.
  Fase 5 regrava.
- Playwright: a11y (axe), CTAs na primeira dobra, responsividade, teclado,
  jornada, roteamento por locale, motion, abertura da home e scroll suave. O
  e2e de motion confere
  `getAnimations()` **e** as durações computadas de `transition`/`animation`,
  porque `getAnimations()` sozinho não vê transições ociosas.
