# Portfolio — André Arcodaci

Portfólio bilíngue (EN na raiz, PT em `/pt`) em React 19, Vite 8 e TypeScript.
Direção visual: **Editorial Rolodex** (papel manila, Fraunces, fichas de índice).
Os documentos de planejamento ficam em `docs/`.

## Pré-requisitos

- Node.js >= 22.18 (o `build` roda `scripts/assert-no-mock.ts` com a remoção nativa de tipos do Node, sem flag a partir dessa versão)
- pnpm 10 (`corepack enable`)

## Comandos

```bash
pnpm install
pnpm dev            # servidor local
pnpm typecheck      # tsc -b
pnpm lint           # ESLint
pnpm test           # Vitest, uma execução
pnpm format         # Prettier --write
pnpm format:check
pnpm test:e2e       # Playwright (projetos chromium + visual); sobe build:preview + preview
pnpm test:visual:update  # regrava as baselines da regressão visual (e2e/*-snapshots)
pnpm capture        # regrava as capturas do Gate 2 em docs/gate-2/
pnpm build          # trava de mock + tsc -b + vite build; falha enquanto houver mock
pnpm build:preview  # igual, mas permite mock
pnpm preview        # serve dist/
pnpm validate:preview  # typecheck + lint + format:check + test + build:preview + test:e2e (Gate 4)
pnpm validate       # typecheck + lint + test + build + test:e2e
```

`pnpm build` e `pnpm validate` falham enquanto existir conteúdo `mock: true`:
é a trava de integridade funcionando. Use `pnpm build:preview` para avaliar.

Verificações (typecheck, lint, test, build, e2e) rodam como scripts do projeto,
sem `rtk` na frente, lendo o código de saída.

As baselines da regressão visual (`e2e/visual.visual.ts-snapshots/`) são só
`win32`, geradas nesta máquina, sem tolerância por pixel. Em outro sistema a
suíte `visual` falha por antialias, não por regressão. Regrave com
`pnpm test:visual:update`, olhando as diferenças antes de aceitar.

O `pnpm build` de produção exige `VITE_SITE_ORIGIN` (origem absoluta do site,
usada em `canonical`, `hreflang` e Open Graph); sem ela, falha com a mensagem
do que definir. `build:preview` usa `http://127.0.0.1:4173`.

## Regras de conteúdo

- A copy vive em `src/content/<locale>/`; componentes não têm string própria.
- Os dois locales têm o mesmo shape (teste de paridade).
- Projeto `concept` sempre exibe o rótulo de estudo conceitual; repositório
  privado não é linkado; nada de métrica, empregador ou prêmio inventado.
- Todo item inventado leva `mock: true`.

## Mais

- Arquitetura: `docs/ARCHITECTURE.md`
- Decisões de design: `docs/DESIGN_DECISIONS.md`
- Adiado: `docs/BACKLOG.md`
- Dossiê do Gate 2: `docs/gate-2/README.md`
- Dossiê do Gate 4: `docs/gate-4/README.md`

## Fase atual

Fase 4 (acabamento) implementada: HTML pré-renderizado por rota no formato do
Cloudflare Pages, head por rota (título, descrição, `hreflang`, Open Graph),
cabeçalhos de segurança, imagens Open Graph e ícones, auditoria WCAG 2.2 AA com
correções, regressão visual e medição de performance. Aguardando o Gate 4
(`docs/gate-4/README.md`). Fases 1 a 3 aprovadas.

O critério 9 da spec (`pnpm validate` verde) fecha na **Fase 5**, não na 4: o
`build` falha por desenho enquanto houver conteúdo mock (critério 8), e os
mocks só saem quando o repositório for publicado (decisão do dono,
2026-10-27). Na Fase 4, o equivalente verde é `pnpm validate:preview`.

Próximo passo:

- **Fase 5 — Conteúdo real e publicação** — os mocks saem aqui, junto da
  escolha do domínio (`VITE_SITE_ORIGIN`) e das capturas autorizadas; é quando
  `pnpm build` e `pnpm validate` ficam verdes.
