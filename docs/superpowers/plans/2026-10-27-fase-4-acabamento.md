# Fase 4 — Acabamento — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deixar o site pronto para publicar: cada rota como HTML pré-renderizado
com head completo por idioma, 404 com status real, WCAG 2.2 AA verificado,
performance medida, suíte com regressão visual e o Gate 4 documentado.

**Architecture:** Uma função pura (`routeHead`) descreve o head de cada rota. O
cliente a aplica ao navegar (`useRouteHead`), e o prerender a escreve no HTML.
Depois do `vite build`, um `vite build --ssr` compila `src/entry-server.tsx`, e
`scripts/prerender.ts` gera um `.html` por rota no formato que o Cloudflare
Pages serve, mais `404.html` por idioma e o `_headers`. Um plugin de preview
imita as regras do Pages, para o e2e enxergar o que a produção vai servir.

**Tech Stack:** React 19 (`react-dom/server`, `hydrateRoot`), React Router 8.5
(`createStaticHandler`, `createStaticRouter`, `StaticRouterProvider`), Vite 8
(modo `--ssr`, arquivos `.env.<modo>`), TypeScript 5.9, Vitest 5 + jsdom,
Playwright 1.64 + `@axe-core/playwright`, fonttools (Python, só para gerar a
fonte; fora do `package.json`).

**Spec:** `docs/superpowers/specs/2026-10-27-fase-4-acabamento-design.md`.
Spec mãe: `docs/superpowers/specs/2026-10-26-portfolio-visual-redesign-design.md`
§6–§8.

## Global Constraints

- Branch `fase-4-acabamento` (já criada, com o design commitado). **Nenhuma
  dependência nova no `package.json`.** O `npx wrangler` e o `fonttools`
  (pip, num venv fora do repo) são ferramentas de uma vez.
- URLs sem barra no fim: `/`, `/pt`, `/work/<slug>`, `/pt/work/<slug>`.
- `hreflang`: `en`, `pt-BR`, `x-default` (= URL EN). `og:locale`: `en_US` /
  `pt_BR`. `twitter:card = summary_large_image`. 404 com
  `<meta name="robots" content="noindex">`, sem canonical, alternates nem OG.
- Imagem OG 1200 × 630 em `public/og/home-en.png` e `public/og/home-pt.png`.
  `apple-touch-icon` 180 × 180 em `public/apple-touch-icon.png`.
- Origem absoluta: `VITE_SITE_ORIGIN`, sem barra final. `.env.development`
  e `.env.test` → `http://localhost:5173`; `.env.preview` →
  `http://127.0.0.1:4173`. `pnpm build` (modo `production`) sem a variável
  **falha** com mensagem que diz o que definir.
- Script de entrada: `<html data-entrance-early="pending">`, troca para
  `expired` em **3000 ms**. Só nas duas homes.
- CSP exata (§6 do design): `default-src 'self'; script-src 'self'
  'sha256-<hash>'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;
  font-src 'self'; base-uri 'self'; form-action 'none'; frame-ancestors
  'none'`. Mais `X-Content-Type-Options: nosniff`, `Referrer-Policy:
  strict-origin-when-cross-origin`, `Permissions-Policy: camera=(),
  microphone=(), geolocation=()`. `/assets/*`: `Cache-Control: public,
  max-age=31536000, immutable`.
- Orçamentos: LCP ≤ 2,5 s, CLS ≤ 0,1. Fraunces instanciada entra só com o
  latin ≥ 30% menor **e** a regressão visual sem diferença.
- Nenhuma string voltada ao usuário em componente; textos novos nos dois
  locales.
- **Guarda de motion** (`scripts/motion-guard.test.ts`): toda `animation` ou
  `transition` nova fica dentro de `@media (prefers-reduced-motion:
  no-preference)`.
- Mudança visual além do mínimo que um critério WCAG exige: parar e levar
  ao dono.
- **Verificação sem `rtk`:** `pnpm typecheck`, `pnpm lint`,
  `pnpm format:check`, `pnpm test`, `pnpm build:preview`, `pnpm test:e2e`,
  lendo o exit code com `; echo "exit=$?"`. `pnpm build` e `pnpm validate`
  falham por desenho enquanto houver mock. Toda verificação nova é vista
  falhando uma vez antes de o verde valer.
- **Servidor de preview velho:** o Playwright reaproveita a porta 4173.
  Antes de cada e2e, confira que nada escuta nela (o build mudou).
- Commits em português, `tipo: descrição`, terminando com
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **JS lento (> 3 s):** o nome aparece parado e, quando o JS chega, **não**
   some para fazer a entrada. E2E na Task 5 (atrasar o bundle com
   `page.route`).
2. **Deep link com hash na home pré-renderizada** (`/pt#contact`): sem marca
   de entrada, nome visível, e a página para em `#contact` depois da
   hidratação. E2E na Task 5.
3. **Recarga no meio da página:** o navegador restaura a rolagem depois do
   script do head. O `Opening` vê `scrollY > 0`, tira a marca e o nome fica
   visível, sem entrada. E2E na Task 5.
4. **Barra no fim e caixa** (`/pt/`, `/work/token-killer/`): `/pt/` redireciona
   301 para `/pt`, e o resto se comporta como na verificação do wrangler
   (Task 3, Step 1), registrada no teste do plugin. Teste na Task 4.
5. **Troca de idioma sem JS, a partir de um case e de um 404:** o `<a>` do
   masthead leva à rota equivalente, que existe como arquivo (ou cai no 404
   do idioma certo). E2E na Task 3.

---

## File Structure

| Arquivo | Responsabilidade |
| --- | --- |
| `src/app/siteOrigin.ts` (+ teste) | Lê e valida `VITE_SITE_ORIGIN` |
| `src/app/head.ts` (+ teste) | `RouteHead`, `routeHead()`, `renderHeadTags()`, `applyHead()` |
| `src/app/useRouteHead.ts` | Aplica o head no cliente |
| `src/app/prerenderRoutes.ts` (+ teste) | Lista de rotas e arquivos a gerar, a partir do conteúdo |
| `src/app/entranceEarly.ts` (+ teste) | Texto do script inline da entrada |
| `src/entry-server.tsx` | `render(url)` para o prerender |
| `scripts/prerender.ts` | Gera os `.html`, `404.html`, `_headers` |
| `scripts/headers.ts` (+ teste) | Monta o texto do `_headers` |
| `vite-pages-preview.ts` (+ teste) | Substitui `vite-spa-fallback.ts`: regras do Pages no preview |
| `.env.development`, `.env.test`, `.env.preview` | Origem por modo |
| `e2e/prerender.spec.ts` | HTML cru, sem JS, status 404, hidratação, CSP |
| `e2e/entrance-early.spec.ts` | Nome sem piscar, JS lento, hash, recarga |
| `e2e/publish.capture.ts` | Gera imagem OG e `apple-touch-icon` |
| `e2e/a11y-audit.spec.ts` | Testes das correções da auditoria |
| `e2e/visual.visual.ts` (+ snapshots) | Regressão visual |
| `e2e/perf.capture.ts` | Medição de laboratório |
| `scripts/fonts/instance-fraunces.py`, `public/fonts/` | Fraunces instanciada (condicional) |
| `docs/gate-4/*` | Auditoria, performance, README do gate |

---

### Task 1: Origem do site e modelo de head

**Files:**
- Create: `src/app/siteOrigin.ts`, `src/app/siteOrigin.test.ts`, `src/app/head.ts`, `src/app/head.test.ts`, `.env.development`, `.env.test`, `.env.preview`
- Modify: `src/content/types.ts` (`SiteContent.meta`), `src/content/en/site.ts`, `src/content/pt/site.ts`, `src/vite-env.d.ts` (ou o arquivo de tipos de env que existir: `ImportMetaEnv.VITE_SITE_ORIGIN: string`)

**Interfaces:**
- Produces:
  - `resolveSiteOrigin(value: string | undefined): string` (lança `Error` com `'VITE_SITE_ORIGIN'` na mensagem se vazio ou se não for URL `http(s)` absoluta; remove a barra final) e `siteOrigin(): string` = `resolveSiteOrigin(import.meta.env.VITE_SITE_ORIGIN)`
  - `type RouteKey = { locale: Locale; page: 'home' } | { locale: Locale; page: 'case'; slug: string } | { locale: Locale; page: 'notFound' }`
  - `interface RouteHead { title: string; description: string; canonical?: string; alternates: { hreflang: 'en' | 'pt-BR' | 'x-default'; href: string }[]; robots?: 'noindex'; og?: { type: 'website' | 'article'; url: string; title: string; description: string; siteName: string; locale: 'en_US' | 'pt_BR'; localeAlternate: 'en_US' | 'pt_BR'; image: { url: string; width: 1200; height: 630; alt: string } } }`
  - `routeHead(key: RouteKey, content: Record<Locale, LocaleContent>, origin: string): RouteHead`. Lança se `page: 'case'` e o slug não tiver `caseStudyAccess !== 'none'` no locale.
  - `renderHeadTags(head: RouteHead): string`: `<title>` + tags, todas exceto o `<title>` com o atributo `data-head`, valores escapados para HTML.
  - `applyHead(doc: Document, head: RouteHead): void`: define `doc.title`, remove todo `[data-head]` e insere as tags de `renderHeadTags` sem o `<title>`.
  - `SiteContent.meta` ganha `description: string` e `ogImageAlt: string`.

- [ ] **Step 1: Write the failing tests**

`siteOrigin.test.ts`:
```ts
expect(resolveSiteOrigin('https://exemplo.dev/')).toBe('https://exemplo.dev')
expect(() => resolveSiteOrigin(undefined)).toThrow(/VITE_SITE_ORIGIN/)
expect(() => resolveSiteOrigin('')).toThrow(/VITE_SITE_ORIGIN/)
expect(() => resolveSiteOrigin('exemplo.dev')).toThrow(/VITE_SITE_ORIGIN/)
```

`head.test.ts` (origem `'https://x.dev'`, `contentByLocale` real):
```ts
const home = routeHead({ locale: 'pt', page: 'home' }, contentByLocale, 'https://x.dev')
expect(home.title).toBe(sitePt.meta.homeTitle)
expect(home.description).toBe(sitePt.meta.description)
expect(home.canonical).toBe('https://x.dev/pt')
expect(home.alternates).toEqual([
  { hreflang: 'en', href: 'https://x.dev/' },
  { hreflang: 'pt-BR', href: 'https://x.dev/pt' },
  { hreflang: 'x-default', href: 'https://x.dev/' },
])
expect(home.og).toMatchObject({ type: 'website', locale: 'pt_BR', localeAlternate: 'en_US',
  image: { url: 'https://x.dev/og/home-pt.png', width: 1200, height: 630 } })

const cs = routeHead({ locale: 'en', page: 'case', slug: 'map-areas' }, contentByLocale, 'https://x.dev')
expect(cs.title).toBe(`Map Areas${siteEn.meta.titleSuffix}`)
expect(cs.description).toBe(/* summary EN do map-areas */)
expect(cs.canonical).toBe('https://x.dev/work/map-areas')
expect(cs.alternates[1]).toEqual({ hreflang: 'pt-BR', href: 'https://x.dev/pt/work/map-areas' })
expect(cs.og?.type).toBe('article')

const nf = routeHead({ locale: 'en', page: 'notFound' }, contentByLocale, 'https://x.dev')
expect(nf).toMatchObject({ robots: 'noindex', alternates: [] })
expect(nf.canonical).toBeUndefined(); expect(nf.og).toBeUndefined()

expect(() => routeHead({ locale: 'en', page: 'case', slug: 'nao-existe' }, contentByLocale, 'https://x.dev')).toThrow()

const html = renderHeadTags({ ...nf, title: 'A & "B"' })
expect(html).toContain('<title>A &amp; &quot;B&quot;</title>')
expect(html).toContain('<meta data-head name="robots" content="noindex">')

applyHead(document, cs); applyHead(document, home)
expect(document.querySelectorAll('meta[name="description"]')).toHaveLength(1)
expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1)
expect(document.querySelector('meta[property="og:type"]')?.getAttribute('content')).toBe('website')
applyHead(document, nf)
expect(document.querySelector('meta[property^="og:"]')).toBeNull()
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test src/app/siteOrigin.test.ts src/app/head.test.ts; echo "exit=$?"`
Expected: FAIL (módulos não existem), exit 1.

- [ ] **Step 3: Implement**

`siteOrigin.ts` e `head.ts` com as assinaturas acima. URLs pelo
`localePath` existente (`/` EN vira `https://x.dev/`, demais sem barra
final). Em `head.ts`, nenhum import de React nem de DOM global (o
`applyHead` recebe o `Document`). Textos novos: `meta.description` e
`meta.ogImageAlt` nos dois locales, sóbrios e verdadeiros (sem métrica,
empregador ou prêmio, como o resto do site), com comentário
`// Revisar na Fase 5 com o conteúdo real`. Os três `.env.*` com o valor de
Global Constraints.

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm test; echo "exit=$?"` → exit 0 (inclui a paridade de locales com as chaves novas). `pnpm typecheck; echo "exit=$?"` → 0.

- [ ] **Step 5: Commit** — `feat: modelo de head por rota e origem do site`

---

### Task 2: Head aplicado no cliente

**Files:**
- Create: `src/app/useRouteHead.ts`
- Modify: `src/app/HomeRoute.tsx`, `src/app/CaseStudyRoute.tsx`, `src/app/NotFoundRoute.tsx` (tiram o `<title>` e chamam o hook), `src/app/routes.test.tsx`, `src/app/CaseStudyRoute.test.tsx`

**Interfaces:**
- Consumes: `routeHead`, `applyHead`, `siteOrigin`, `RouteKey` (Task 1); `contentByLocale` (`src/content/index.ts`)
- Produces: `useRouteHead(key: RouteKey): void`, que roda `applyHead(document, routeHead(key, contentByLocale, siteOrigin()))` num `useEffect` dependente dos campos de `key`. O `NotFoundRoute` passa `{ locale, page: 'notFound' }`, inclusive quando renderizado pelo `CaseStudyRoute` para um slug inválido.

- [ ] **Step 1: Write the failing tests** em `routes.test.tsx`:

```ts
it('navegar da home ao case troca o head sem duplicar', async () => {
  const router = createMemoryRouter(createRoutes(), { initialEntries: ['/pt'] })
  render(<RouterProvider router={router} />)
  await screen.findByRole('banner')
  expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('http://localhost:5173/pt')
  await act(() => router.navigate('/pt/work/map-areas'))
  expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1)
  expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe('http://localhost:5173/pt/work/map-areas')
  await act(() => router.navigate('/pt/nada'))
  expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex')
  expect(document.querySelector('link[rel="canonical"]')).toBeNull()
})
it('nenhuma rota renderiza <title> no corpo', ...) // container.querySelector('title') === null
```
Os testes de `document.title` que já existem continuam e precisam passar.

- [ ] **Step 2: Run to verify it fails** — `pnpm test src/app; echo "exit=$?"` → exit 1.
- [ ] **Step 3: Implement** — o hook e a troca nas três rotas.
- [ ] **Step 4: Run** — `pnpm test; echo "exit=$?"` → 0. `pnpm lint; echo "exit=$?"` → 0.
- [ ] **Step 5: Commit** — `feat: head por rota aplicado na navegação`

---

### Task 3: Prerender

**Files:**
- Create: `src/app/prerenderRoutes.ts`, `src/app/prerenderRoutes.test.ts`, `src/entry-server.tsx`, `scripts/prerender.ts`, `e2e/prerender.spec.ts`
- Modify: `src/main.tsx`, `index.html`, `package.json` (scripts), `public/_redirects`, `tsconfig.node.json` (se `scripts/prerender.ts` precisar de tipos do bundle SSR), `.gitignore` (já ignora `dist-ssr`), `docs/superpowers/specs/2026-10-27-fase-4-acabamento-design.md` §5.2 (resultado do Step 1)

**Interfaces:**
- Consumes: `RouteKey`, `routeHead`, `renderHeadTags`, `siteOrigin` (Task 1); `caseStudyAccess`, `listProjects` (`src/content/publication.ts`); `createRoutes` (`src/app/routes.tsx`)
- Produces:
  - `interface PrerenderRoute { key: RouteKey; url: string; file: string }` e `prerenderRoutes(content: Record<Locale, LocaleContent>): PrerenderRoute[]` (`file` relativo a `dist/`, com `/`)
  - `src/entry-server.tsx` exporta `render(url: string): Promise<string>` (HTML do `#root`), `prerenderRoutes`, `routeHead`, `renderHeadTags`, `contentByLocale`, `siteOrigin` e (Task 5) `ENTRANCE_EARLY_SCRIPT`
  - Scripts: `build` = `node scripts/assert-no-mock.ts && tsc -b && vite build && vite build --ssr src/entry-server.tsx --outDir dist-ssr && node scripts/prerender.ts`; `build:preview` igual, com `--allow-mock` e `--mode preview` nos **dois** `vite build`
  - `index.html` molde: sem `<title>` nem `description` fixos; `<!--head-->` no `<head>` e `<!--app-->` dentro de `#root`, que o `prerender.ts` substitui

- [ ] **Step 1: Verificar o Cloudflare Pages antes de escrever código**

Gere à mão um `dist` mínimo (`index.html`, `pt.html`, `pt/work/x.html`,
`404.html`, `pt/404.html`, cada um com um texto diferente, e um `_redirects`
com `/pt/ /pt 301`) numa pasta do scratchpad e rode
`npx wrangler pages dev <pasta>`. Registre o status e o arquivo servido para
`/`, `/pt`, `/pt/`, `/PT`, `/pt/work/x`, `/pt/work/x/`, `/pt/nada`, `/nada`
e `/work/x.html`. Esperado: `/pt` → `pt.html` 200; `/pt/` → 301 `/pt`;
`/pt/nada` → `pt/404.html` 404; `/nada` → `404.html` 404. Se divergir, use
o plano B de §5.2 (`pt/index.html`, canônica `/pt/`), atualize o design e a
tabela de URLs **antes** de seguir. Cole a tabela observada em §5.2 do
design.

- [ ] **Step 2: Write the failing tests**

`prerenderRoutes.test.ts`:
```ts
const routes = prerenderRoutes(contentByLocale)
expect(routes.map((r) => [r.url, r.file])).toEqual(expect.arrayContaining([
  ['/', 'index.html'], ['/pt', 'pt.html'],
  ['/work/map-areas', 'work/map-areas.html'], ['/pt/work/map-areas', 'pt/work/map-areas.html'],
  ['/nao-encontrada', '404.html'], ['/pt/nao-encontrada', 'pt/404.html'],
]))
// com um projeto draft injetado num clone do conteúdo, ele não aparece
// cada locale tem exatamente os projetos com caseStudyAccess !== 'none'
```

`e2e/prerender.spec.ts` (usa `request`, sem navegador, nas checagens de HTML cru):
```ts
for (const [url, h1] of [['/', /André/], ['/pt', /André/], ['/pt/work/map-areas', /Map Areas/]]) {
  const res = await request.get(url); expect(res.status()).toBe(200)
  const html = await res.text()
  expect(html).toMatch(/<h1[\s>]/); expect(html).toMatch(h1)
  expect(html.match(/rel="canonical"/g)).toHaveLength(1)
  expect(html).toContain('hreflang="x-default"'); expect(html).toContain('property="og:image"')
}
expect(await (await request.get('/pt')).text()).toContain('<html lang="pt-BR"')
const nf = await request.get('/pt/nada'); expect(nf.status()).toBe(404)
expect(await nf.text()).toContain('Página não encontrada')
expect(await nf.text()).toContain('content="noindex"')
```
E com navegador:
- **sem JS** (`test.use({ javaScriptEnabled: false })`): `/pt` mostra o `h1`,
  a lista de trabalhos e o contato; clicar na ficha do Map Areas chega ao
  case; o link do masthead no case leva a `/work/map-areas` em inglês; o
  link do masthead em `/pt/nada` leva a `/nada` (404 EN). Isso é o Review
  Focus 5;
- **hidratação:** para cada `url` de `prerenderRoutes` (importado), abrir a
  página, esperar `networkidle` e falhar se houver mensagem de console com
  `/hydrat|did not match|Minified React error/i`.

- [ ] **Step 3: Run to verify it fails** — `pnpm test src/app/prerenderRoutes.test.ts; echo "exit=$?"` → 1. O e2e só falha de verdade depois da Task 4 (o preview ainda faz fallback SPA e devolve 200 no 404), então rode-o lá.

- [ ] **Step 4: Implement**

- `entry-server.tsx`: `createStaticHandler(createRoutes())`, `handler.query(new Request(siteOrigin() + url))`, `createStaticRouter(handler.dataRoutes, context)` e `renderToString(<StrictMode><StaticRouterProvider router={router} context={context} /></StrictMode>)`. Importa os mesmos CSS globais que `main.tsx`, menos o que for só de cliente.
- `prerender.ts`: lê `dist/index.html` como molde, importa `dist-ssr/entry-server.js`, gera cada arquivo de `prerenderRoutes` com `lang`, `renderHeadTags(routeHead(...))` e o HTML do app. **Falha (exit 1)** com mensagem quando:
  - uma rota que não é 404 renderiza o `h1` de `site.notFound.title`;
  - falta `<h1` no HTML ou `<title>`/`description` no head;
  - `routeHead` lança.
- `main.tsx`: `hydrateRoot` se `root.hasChildNodes()`, senão `createRoot`. Qualquer leitura de `window`/`matchMedia` no **render** que o e2e de hidratação apontar vai para efeito.
- `public/_redirects`: só `/pt/ /pt 301` (e o que o Step 1 mostrar necessário), com comentário dizendo que regra vence arquivo no Pages.

- [ ] **Step 5: Run** — `pnpm test; echo "exit=$?"` → 0; `pnpm build:preview; echo "exit=$?"` → 0 e `dist/` com os arquivos da tabela de §5.2; `pnpm typecheck` e `pnpm lint` → 0.
- [ ] **Step 6: Commit** — `feat: prerender de cada rota no build`

---

### Task 4: Preview com as regras do Cloudflare Pages

**Files:**
- Create: `vite-pages-preview.ts`, `vite-pages-preview.test.ts`
- Delete: `vite-spa-fallback.ts`
- Modify: `vite.config.ts`, `tsconfig.node.json` (`include` ganha `vite-pages-preview*.ts`)

**Interfaces:**
- Produces:
  - `resolvePagesRequest(urlPath: string, exists: (file: string) => boolean): { file: string; status: 200 | 404 } | { redirect: string; status: 301 }`. A ordem é: `_redirects` (passado já parseado), arquivo exato, `<caminho>.html`, `<caminho>/index.html`, e por fim o `404.html` mais próximo subindo pastas.
  - `parseRedirects(text: string): { from: string; to: string; status: number }[]`
  - `parseHeaders(text: string): { pattern: string; headers: Record<string, string> }[]` e `headersFor(rules, urlPath): Record<string, string>` (`*` no fim casa qualquer sufixo)
  - `pagesPreviewPlugin(): Plugin`: só `configurePreviewServer`, lendo `_redirects` e `_headers` de `dist/`.

- [ ] **Step 1: Write the failing tests** (`exists` falso só com os arquivos da tabela de §5.2):

```ts
expect(resolve('/pt')).toEqual({ file: 'pt.html', status: 200 })
expect(resolve('/pt/')).toEqual({ redirect: '/pt', status: 301 })
expect(resolve('/pt/work/map-areas')).toEqual({ file: 'pt/work/map-areas.html', status: 200 })
expect(resolve('/pt/nada/fundo')).toEqual({ file: 'pt/404.html', status: 404 })
expect(resolve('/nada')).toEqual({ file: '404.html', status: 404 })
expect(resolve('/assets/x.js')).toEqual({ file: 'assets/x.js', status: 200 })
// + os casos observados no Step 1 da Task 3 para /PT e /work/x/ (Review Focus 4)
expect(headersFor(parseHeaders('/*\n  X-A: 1\n/assets/*\n  X-B: 2\n'), '/assets/a.js')).toEqual({ 'X-A': '1', 'X-B': '2' })
```

- [ ] **Step 2: Run to verify it fails** — `pnpm test vite-pages-preview.test.ts; echo "exit=$?"` → 1.
- [ ] **Step 3: Implement** e trocar o plugin no `vite.config.ts`. Arquivos que não existem no `dist` seguem para o Vite (`next()`).
- [ ] **Step 4: Run** — `pnpm test; echo "exit=$?"` → 0. Porta 4173 livre, `pnpm test:e2e; echo "exit=$?"` → 0, incluindo `e2e/prerender.spec.ts` da Task 3 e a suíte antiga (`routing.spec.ts` com `/nao-existe` agora recebe 404: ajuste só a asserção de status, se houver). Antes do verde, veja o `prerender.spec.ts` falhar com o plugin antigo (status 200 no 404).
- [ ] **Step 5: Commit** — `feat: preview imita o Cloudflare Pages`

---

### Task 5: A entrada do nome sem piscar

**Files:**
- Create: `src/app/entranceEarly.ts`, `src/app/entranceEarly.test.ts`, `e2e/entrance-early.spec.ts`
- Modify: `src/motion/Opening.tsx` (+ `Opening.test.tsx`), `src/sections/Hero/Hero.module.css`, `scripts/prerender.ts`, `src/entry-server.tsx`

**Interfaces:**
- Produces: `ENTRANCE_EARLY_SCRIPT: string`, código de navegador autocontido. Se `scrollY === 0`, sem `location.hash` e sem `matchMedia('(prefers-reduced-motion: reduce)').matches`, faz `documentElement.dataset.entranceEarly = 'pending'` e agenda, em 3000 ms, a troca de `pending` para `expired`. O `prerender.ts` o inline como `<script>` no head **só** das rotas `page: 'home'`. A Task 6 hasheia exatamente esse texto.
- `Opening`: no `useLayoutEffect`, lê `document.documentElement.dataset.entranceEarly` e o remove **sempre** (inclusive com reduced motion). Com `expired`, não define `data-entrance` (sem entrada). Com `pending` ou ausente, segue a lógica atual (que já pula a entrada com `scrollY > 0` ou hash).
- CSS: `:global(html[data-entrance-early='pending']) .word` com as mesmas declarações de `[data-entrance='pending'] .word`.

- [ ] **Step 1: Write the failing tests**

`entranceEarly.test.ts` (executa o texto com `new Function` em jsdom):
- topo, sem hash e sem reduce → `pending`; depois de `vi.advanceTimersByTime(3000)` → `expired`;
- com hash → atributo ausente; com `matchMedia` reduce → ausente.

`Opening.test.tsx`:
- com `data-entrance-early="expired"`, depois de montar não há `data-entrance` e o atributo do `<html>` sumiu;
- com `pending` → `data-entrance="pending"` e o atributo sumiu.

`e2e/entrance-early.spec.ts`:
- **nunca pisca:** `page.addInitScript` grava, a cada `requestAnimationFrame` até 2 s, a opacidade computada da primeira `.word` do hero. A sequência nunca tem um valor `> 0.5` seguido de `< 0.5`, e termina em `1`;
- **JS lento** (Review Focus 1): `page.route('**/assets/index-*.js')` atrasa 4 s. Aos 3,5 s o nome está visível; depois de o JS carregar e de mais 1 s, continua visível em todos os frames gravados;
- **hash** (Review Focus 2): `/pt#contact` → `<html>` sem `data-entrance-early` no `DOMContentLoaded`, nome visível, `#contact` na janela depois de hidratar;
- **recarga no meio** (Review Focus 3): rolar até metade de `/`, `page.reload()`, nome visível sem entrada (`data-entrance` ausente ou `done`) e rolagem restaurada `> 0`;
- **reduced motion:** sem marca e sem entrada.

- [ ] **Step 2: Run to verify it fails** — `pnpm test src/app/entranceEarly.test.ts src/motion; echo "exit=$?"` → 1; `pnpm build:preview && pnpm test:e2e e2e/entrance-early.spec.ts; echo "exit=$?"` → 1 (o teste de não piscar falha hoje).
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** — unit e e2e completos → exit 0. `e2e/opening.spec.ts` e `e2e/a11y.spec.ts` continuam verdes.
- [ ] **Step 5: Commit** — `feat: entrada do nome sem piscar no HTML pré-renderizado`

---

### Task 6: Publicação — cabeçalhos, imagem OG, ícones

**Files:**
- Create: `scripts/headers.ts`, `scripts/headers.test.ts`, `e2e/publish.capture.ts`, `public/og/home-en.png`, `public/og/home-pt.png`, `public/apple-touch-icon.png`
- Modify: `scripts/prerender.ts` (grava `dist/_headers`), `index.html` (`theme-color`, `color-scheme`, `apple-touch-icon`), `src/styles/global.css` (`color-scheme: light` no `:root`, se ainda não houver), `e2e/prerender.spec.ts`

**Interfaces:**
- Consumes: `ENTRANCE_EARLY_SCRIPT` (Task 5); `parseHeaders`/`headersFor` (Task 4, no teste)
- Produces: `scriptHash(source: string): string` (`'sha256-' + base64(sha256(source))`) e `buildHeaders(scriptHashes: string[]): string`, no formato do `_headers` do Pages, com os valores exatos de Global Constraints.

- [ ] **Step 1: Write the failing tests**

`headers.test.ts`:
```ts
const text = buildHeaders([scriptHash('x')])
const rules = parseHeaders(text)
const html = headersFor(rules, '/pt')
expect(html['Content-Security-Policy']).toBe(`default-src 'self'; script-src 'self' '${scriptHash('x')}'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; base-uri 'self'; form-action 'none'; frame-ancestors 'none'`)
expect(html['X-Content-Type-Options']).toBe('nosniff')
expect(headersFor(rules, '/assets/a.js')['Cache-Control']).toBe('public, max-age=31536000, immutable')
expect(headersFor(rules, '/pt')['Cache-Control']).toBeUndefined()
```

`e2e/prerender.spec.ts` ganha:
- **CSP:** em `/`, `/pt/work/map-areas` e `/nada`, nenhum `securitypolicyviolation` (escutado via `addInitScript`) e nenhuma mensagem de console com `Content Security Policy`, inclusive durante a entrada e o scroll até o fim;
- **imagens:** `og:image` e `apple-touch-icon` respondem 200 com `image/png`;
- **`meta[name="theme-color"]`** presente.

- [ ] **Step 2: Run to verify it fails** — `pnpm test scripts/headers.test.ts; echo "exit=$?"` → 1.
- [ ] **Step 3: Implement**

- `buildHeaders` e a escrita do `dist/_headers` no prerender, com o hash do `ENTRANCE_EARLY_SCRIPT`. Se o e2e de CSP apontar outro script inline (por exemplo, do Vite), ele entra na lista de hashes, não em `'unsafe-inline'`.
- `e2e/publish.capture.ts` (projeto `capture`): viewport 1200 × 630, reduced motion, `/` e `/pt` → `public/og/home-<locale>.png` (o primeiro viewport real, como o design pede). `favicon.svg` renderizado em 180 × 180 → `public/apple-touch-icon.png`.
- `theme-color`: o valor do token da capa em `src/styles/tokens.css`.

- [ ] **Step 4: Run** — `npx playwright test --project=capture e2e/publish.capture.ts; echo "exit=$?"` → 0 e abrir as três PNGs para conferir (o dono vê no Gate 4). Depois `pnpm test`, `pnpm build:preview` e `pnpm test:e2e`, todos com exit 0.
- [ ] **Step 5: Commit** — `feat: cabeçalhos de segurança, imagem Open Graph e ícones`

---

### Task 7: Auditoria de acessibilidade e correções

Auditoria primeiro, correções depois, uma por commit.

**Files:**
- Create: `docs/gate-4/A11Y_AUDIT.md`, `e2e/a11y-audit.spec.ts`
- Modify: `e2e/a11y.spec.ts` (axe também com `forcedColors: 'active'`), `src/motion/titleFlight.css`, e os CSS/componentes que a auditoria apontar

- [ ] **Step 1: Auditar** com o build de preview, nos dois idiomas, em 320, 390, 768 e 1440, seguindo a tabela de §7 do design. Para cada critério, registre em `A11Y_AUDIT.md`: método, resultado e, se falhar, o elemento e a medida. O formato é o de `docs/m5/M5_AUDIT_AND_PLAN.md` (pontuação por critério e achados P0–P3). Itens mínimos que o arquivo precisa ter:
  - texto a 200%, com fonte raiz 32 px em 320 px: largura de `scrollWidth` e elementos cortados;
  - espaçamento de texto 1.4.12: injetar `* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important } p { margin-bottom: 2em !important }` e procurar `overflow` cortando texto;
  - foco não escondido 2.4.11: em cada Tab pela home e pelo case, o retângulo do foco não pode ficar inteiro sob o masthead nem sob a folha da abertura;
  - alvos 2.5.8: `getBoundingClientRect` de todo `a` e `button` ≥ 24 × 24, ou a exceção de espaçamento;
  - `forced-colors: active`: capturas da home, do case e do 404, com foco num link, mostrando o que some;
  - `ariaSnapshot` de `main` na home e no case, nos dois idiomas: título, índice, lista de trabalhos e links externos com o aviso.
- [ ] **Step 2: Commit da auditoria** — `docs: auditoria WCAG 2.2 AA da fase 4`
- [ ] **Step 3: Reduced motion no meio da sessão** (backlog). Teste e2e em `a11y-audit.spec.ts`: abrir um case pela ficha sem reduce, `page.emulateMedia({ reducedMotion: 'reduce' })`, `page.goBack()`. Nenhum `::view-transition` com animação em andamento (`document.getAnimations()` sem animação de pseudo `::view-transition`). Veja falhar e corrija no `titleFlight.css`, dentro de `@media (prefers-reduced-motion: reduce)` (`animation: none` nos pseudo-elementos, sem `transition`/`animation` nova fora de `no-preference`). Commit `fix: sem fade de view transition com reduced motion ligado no meio da sessão`.
- [ ] **Step 4: Para cada achado P0–P2,** um teste em `a11y-audit.spec.ts` que reproduz a medida da auditoria, visto falhando; a correção mínima; a linha "antes → depois, propriedade, critério" na auditoria; um commit `fix: <critério> — <o quê>`. Mudança visual além do mínimo: parar e levar ao dono (Global Constraints). P3 vai para o `docs/BACKLOG.md` com o motivo.
- [ ] **Step 5: Forced colors.** O axe em `forcedColors: 'active'` nas `GATE_ROUTES`, mais um teste que confere foco, filetes da lista, borda da folha e o placeholder "sem captura" com `outline`/`border` de cor de sistema diferente do fundo. Correções em `@media (forced-colors: active)`. Commit `fix: alto contraste do Windows`.
- [ ] **Step 6: Run** — `pnpm test`, `pnpm build:preview` e `pnpm test:e2e`, todos com exit 0. Commit final da auditoria com o estado "depois".

---

### Task 8: Regressão visual e `validate:preview`

Antes da Task 9, porque a Fraunces instanciada só entra se as capturas não mudarem.

**Files:**
- Create: `e2e/visual.visual.ts`, `e2e/visual.visual.ts-snapshots/*` (gerado)
- Modify: `playwright.config.ts` (projeto `visual`: `testMatch: /.*\.visual\.ts/`, `reducedMotion: 'reduce'` em `contextOptions`, `expect.toHaveScreenshot: { maxDiffPixelRatio: 0 }`), `package.json` (`test:e2e` = `playwright test --project=chromium --project=visual`; `test:visual:update` = `playwright test --project=visual --update-snapshots`; `validate:preview` = `pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build:preview && pnpm test:e2e`), `README.md` (seção de scripts)

- [ ] **Step 1: Write the test**: para `en` e `pt`, em 1440 × 900, 768 × 1024 e 390 × 844, `toHaveScreenshot` do locator de hero, `#work`, `#contact` e do case `/work/map-areas` (página inteira), depois de `document.fonts.ready`. Nome `<parte>-<viewport>-<locale>.png`.
- [ ] **Step 2: Gerar a baseline** — `pnpm build:preview && pnpm test:visual:update; echo "exit=$?"` → 0. Abrir uma amostra das PNGs e conferir que não pegaram estado de entrada nem fonte de fallback.
- [ ] **Step 3: Ver falhar** — mude temporariamente uma cor em `tokens.css`, rode `pnpm test:e2e`, confirme exit 1 com diff no projeto `visual` e desfaça.
- [ ] **Step 4: Run** — `pnpm validate:preview; echo "exit=$?"` → 0.
- [ ] **Step 5: Commit** — `test: regressão visual e validate:preview`

---

### Task 9: Performance

**Files:**
- Create: `e2e/perf.capture.ts`, `docs/gate-4/PERFORMANCE.md`; condicionais: `scripts/fonts/instance-fraunces.py`, `scripts/fonts/README.md`, `public/fonts/fraunces-latin.woff2`, `public/fonts/LICENSE-Fraunces.txt`, `src/styles/fonts.css`
- Modify: `src/main.tsx` e `src/entry-server.tsx` (import das fontes, se trocar), `scripts/prerender.ts` (preload, se entrar)

- [ ] **Step 1: Medir a linha de base.** `e2e/perf.capture.ts` (projeto `capture`) reproduz o método de `docs/m5/PERFORMANCE_NOTES.md`: contexto novo por rota, cache desligado, CDP `Network.emulateNetworkConditions` com latência 150 ms, download 180000 B/s e upload 80000 B/s, 2,5 s depois do `load`. Mede LCP (com o elemento), CLS e `transferSize` por recurso para `/` em 390 × 844, `/pt` em 1440 × 900 e `/pt/work/map-areas` em 1440 × 900, e imprime uma tabela markdown. Rode 3 vezes e registre a mediana em `PERFORMANCE.md`, junto com o M5 e o ponto de partida da Fase 3 (o HTML antes do prerender: `git stash` não serve; use o commit `1320f8d` num worktree só para essa medida). Commit `docs: linha de base de performance da fase 4`.
- [ ] **Step 2: Fraunces instanciada.** Num venv fora do repo, `pip install fonttools brotli`. Meça os pesos e cortes realmente usados: um script Playwright coleta `font-weight` e `font-variation-settings` computados de todo elemento com família Fraunces, nas `GATE_ROUTES`. O `instance-fraunces.py`:
  - recebe o latin full do fontsource;
  - fixa `SOFT=0` e restringe `wght` à faixa medida, mantendo `opsz` e `WONK`;
  - subseta para o mesmo `unicode-range` do latin do fontsource;
  - grava `public/fonts/fraunces-latin.woff2`.

  O `src/styles/fonts.css` declara esse arquivo para o latin e importa os
  demais subsets do fontsource. **Critério:** o latin fica ≥ 30% menor e
  `pnpm test:e2e` passa sem nenhuma diferença no projeto `visual`. Se
  passar, commit `perf: Fraunces latin instanciada`. Se não, desfaça e
  registre o número em `PERFORMANCE.md`.
- [ ] **Step 3: Preload** do latin da Fraunces e da Instrument Sans (`<link rel="preload" as="font" type="font/woff2" crossorigin>`, com os nomes com hash vindos do manifest do build) no head gerado. Meça de novo. Fica só se o LCP mediano melhorar em alguma rota sem piorar outra. Commit ou desfaça e registre.
- [ ] **Step 4: Registrar o resultado final** em `PERFORMANCE.md` (tabela antes → depois, com a ressalva de laboratório e sem INP). Se alguma rota passar do orçamento, pare e leve ao dono. Commit `docs: performance da fase 4`.

---

### Task 10: Fechamento e Gate 4

**Files:**
- Create: `docs/gate-4/README.md`, capturas em `docs/gate-4/`
- Modify: `docs/DESIGN_DECISIONS.md`, `docs/BACKLOG.md`, `docs/ARCHITECTURE.md`, `README.md`, `docs/gate-2/README.md`, `docs/gate-3/README.md`, `docs/MOTION_SPEC.md` (ficha da abertura: marca `data-entrance-early`), `docs/superpowers/specs/2026-10-27-fase-4-acabamento-design.md` (status)

- [ ] **Step 1: `/about`.** Entrada nova em `DESIGN_DECISIONS.md` com a recomendação do Claude (não promover) e o motivo de §10 do design, **status: aguardando o dono**. O dono decide no Gate 4.
- [ ] **Step 2: Docs.**
  - `README.md` e os READMEs dos Gates 2 e 3: o critério 9 fecha na Fase 5.
  - `BACKLOG.md`: saem os dois itens da Fase 4, entra o que esta fase adiou (P3 da auditoria, preload ou Fraunces recusados), cada um com "Quando".
  - `ARCHITECTURE.md`: o prerender (arquivos gerados, formato do Pages, `VITE_SITE_ORIGIN`, `_headers`).
  - `MOTION_SPEC.md`: o script de entrada.
- [ ] **Step 3: `docs/gate-4/README.md`** no formato do Gate 3: como avaliar (`pnpm build:preview && pnpm preview`), tabela dos critérios 1–8 e 10 da §8 da spec mãe com a evidência de cada um (teste ou documento), links para `A11Y_AUDIT.md` e `PERFORMANCE.md`, a imagem OG dos dois idiomas, e a pendência do dono: celular real, NVDA nos pontos críticos, `/about` e, se quiser, `npx wrangler pages dev dist`.
- [ ] **Step 4: Verificação final** — porta 4173 livre, `pnpm validate:preview; echo "exit=$?"` → 0. `pnpm build; echo "exit=$?"` → 1 por causa do mock (critério 8). Com `VITE_SITE_ORIGIN` ausente e `ALLOW_MOCK=1`, `pnpm build` também falha, com a mensagem da origem.
- [ ] **Step 5: Commit** — `docs: gate 4 — acabamento`
