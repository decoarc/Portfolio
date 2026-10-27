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
pnpm test:e2e       # Playwright (projeto chromium); sobe build:preview + preview
pnpm capture        # regrava as capturas do Gate 2 em docs/gate-2/
pnpm build          # trava de mock + tsc -b + vite build; falha enquanto houver mock
pnpm build:preview  # igual, mas permite mock
pnpm preview        # serve dist/
pnpm validate       # typecheck + lint + test + build + test:e2e
```

`pnpm build` e `pnpm validate` falham enquanto existir conteúdo `mock: true`:
é a trava de integridade funcionando. Use `pnpm build:preview` para avaliar.

Verificações (typecheck, lint, test, build, e2e) rodam como scripts do projeto,
sem `rtk` na frente, lendo o código de saída.

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

## Fase atual

Fase 3 (motion) implementada: abertura da home — o nome sobe da fenda e se
afasta com o scroll enquanto a folha do índice sobe com a borda curva — e
scroll suave no site, tudo desligado em reduced motion (`docs/MOTION_SPEC.md`).
Gate 3 aprovado (`docs/gate-3/README.md`).

Próximos passos, nesta ordem (decisão do dono, 2026-10-27):

1. **Fase 3, segunda leva** — dois ajustes pequenos da abertura e os efeitos de
   motion adiados (`docs/BACKLOG.md`), ainda sobre o conteúdo mock.
2. **Fase 4 — Acabamento** — acessibilidade, metadados por idioma, performance,
   ainda com mock.
3. **Fase 5 — Conteúdo real e publicação** — os mocks saem só aqui, quando o
   repositório for publicado; é quando `pnpm build` e `pnpm validate` ficam
   verdes.
