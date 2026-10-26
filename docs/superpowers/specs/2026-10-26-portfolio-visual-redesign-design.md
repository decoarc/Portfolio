# Redesenho visual do portfólio — design

**Data:** 2026-10-26
**Branch:** `explore/new-direction`
**Status:** aprovado em brainstorming; pendente de plano de implementação
**Documento de referência:** `docs/SPEC.md` (spec de produto). Este documento resolve o *como*; a spec de produto permanece a autoridade sobre o *quê*.

## 1. Contexto

O portfólio atual (milestones M1–M5) entrega uma direção "Ledger × Datum × Cut": hero editorial dividido em papel claro e campo escuro, Bricolage Grotesque + Source Sans 3 + IBM Plex Mono, CSS Modules sobre `src/styles/tokens.css`. É correto, acessível e sóbrio — e estático. Não tem a assinatura autoral, a profundidade nem o motion que `docs/SPEC.md` descreve como mandatórios.

Duas decisões da spec de produto continuavam em aberto e bloqueavam qualquer implementação visual séria:

- **D1** — metáfora visual central (Inspection Slot, arquivo/Rolodex ou galeria abstrata).
- **D2** — paleta definitiva e famílias tipográficas com licença verificada.

Em paralelo, há pouco conteúdo real: um único projeto verificado (`map-areas`), em inglês. O dono do projeto quer trabalhar com conteúdo mockado até ter projetos suficientes.

## 2. Decisões tomadas

| # | Decisão | Motivo |
|---|---|---|
| R1 | D1 se resolve por **comparação de composições**, não por escolha no papel | É o que `SPEC.md` §3.1 e Gate 1 mandam; direção visual escolhida por descrição tende a desabar no primeiro render real |
| R2 | Conteúdo mockado **sem restrição em dev**, com **trava de build de produção** | Liberdade total para exercitar o layout agora, sem risco de projeto fictício vazar como trabalho entregue (`SPEC.md` §4.3) |
| R3 | **Reescrita total de `src/`** | Decisão do dono. Aceita o custo de reescrever testes e componentes já validados em troca de não herdar o ritmo da página atual |
| R4 | **Bilingue PT-BR/EN desde a fundação** | Retrofit de i18n é caro, e a tipografia display precisa ser julgada em português durante o Gate 1 |
| R5 | **Comps isolados fora do `src/`** (abordagem A) | Os tokens derivam da direção escolhida; construir a fundação antes de decidir significa escrever tokens que vão mudar |
| R6 | Raiz é EN (`/`), português sob prefixo (`/pt`) | `SPEC.md` §8.3 pede URLs estáveis e metadados por idioma; seletor que não muda a URL entrega uma página só ao indexador e quebra link compartilhado |
| R7 | A trava de mock roda em `prebuild`, não como teste | Falhar o build é o ponto; um teste pode ser pulado no deploy |

### 2.1 Custo aceito em R3

A reescrita derruba os testes unitários e e2e atuais, que ancoram no DOM das seções existentes. Eles são **reescritos, não adaptados**. Também se perde a afinação de acessibilidade feita em M5, que precisa ser refeita na Fase 4. Isto foi apresentado e aceito explicitamente.

## 3. Fases e gates

### Fase 0 — Comps comparativos (descartável)

Três páginas HTML autocontidas em `design/comps/`, servidas pelo dev server do Vite. Cada uma é independente: CSS próprio, sem importar token algum, sem React.

Cada comp entrega:

- **Primeiro viewport completo mais o início do bloco de trabalhos.** A continuidade entre hero e conteúdo é parte do julgamento; hero isolado engana.
- **Composição estática.** Nenhuma animação. `SPEC.md` §3.1 exige que o layout funcione parado. Cada comp acompanha uma nota curta descrevendo o que se moveria na Fase 3, sem implementar.
- **PT e EN alternáveis no mesmo comp.** Português tem palavras mais longas e acentuação alta ("André", "Desenvolvedor"); é onde tipografia display quebra.
- **1440 / 768 / 390**, com composição mobile própria — não a desktop comprimida.
- **Uma proposta de D2 embutida:** paleta e par tipográfico, usando apenas famílias OFL auto-hospedáveis via `@fontsource`, para que a licença seja verificável e o carregamento não dependa de CDN de terceiros.

Os três conceitos, conforme `SPEC.md` §3.1:

1. **Inspection Slot** — bancada de inspeção: molduras, recortes, planos e enquadramentos que revelam projetos.
2. **Arquivo editorial / Rolodex** — índices, lâminas e placas que organizam trabalhos; mais tipográfico, menos dependente de mídia.
3. **Galeria espacial abstrata** — mídia e superfícies em profundidade, sem cenário literal.

**Gate 1 — decisão do dono.** A escolha e as alternativas rejeitadas são registradas em `docs/DESIGN_DECISIONS.md`, com o motivo. Nenhum arquivo de `src/` é tocado antes deste gate. `design/comps/` é apagado quando a Fase 2 termina.

### Fase 2 — Fundação

Reescrita de `src/` com os tokens extraídos do comp vencedor. Home estática na sequência de `SPEC.md` §4.2, rotas de case study, conteúdo mockado nos dois idiomas.

**Gate 2:** navegação, conteúdo e responsividade funcionam com todo o motion desligado.

### Fase 3 — Motion

Microinterações, reveals e profundidade, implementados sobre uma fundação que já funciona sem eles.

**A tecnologia de motion é decidida aqui, não antes.** CSS puro é o padrão. GSAP entra apenas se um efeito aprovado provar que CSS não o alcança; WebGL/Three.js apenas se o conceito vencedor provar necessidade (`SPEC.md` §9). Cada efeito é documentado em `docs/MOTION_SPEC.md` com objetivo, gatilho, estados inicial e final, duração e easing, alternativa reduced-motion e fallback sem JS.

**Gate 3:** comparação visual com os comps e medição de fluidez em hardware real.

### Fase 4 — Acabamento

Acessibilidade WCAG 2.2 AA, metadados e `hreflang` por idioma, página 404, performance, reescrita completa da suíte de testes.

**Gate 4:** critérios de aceitação da seção 8 deste documento satisfeitos.

## 4. Arquitetura do novo `src/`

```text
src/
  app/        # router, shell, providers, título e metadados do documento
  sections/   # Hero, Release, Work, Approach, About, Interests, Contact
  components/ # UI reutilizável
  motion/     # presets, hooks, fallback de reduced-motion (Fase 3)
  content/    # conteúdo tipado por locale
  styles/     # tokens.css derivado do comp vencedor, global, media queries
  lib/        # utilitários e guardas de publicação
  test/       # setup (único arquivo preservado da árvore atual)
```

**Regra de composição:** seções não importam umas às outras. A home as compõe e cada seção recebe seu conteúdo por prop. Isto as torna testáveis isoladamente e renderizáveis fora do app.

**Preservado da árvore atual:** `vite.config.ts`, `vite-spa-fallback.ts`, `eslint.config.js`, `.prettierrc.json`, `playwright.config.ts`, `public/` e `src/test/setup.ts`. Tudo o mais dentro de `src/` é reescrito.

## 5. Camada de conteúdo

```text
src/content/
  types.ts              # Locale, SiteContent, ProjectCaseStudy
  en/site.ts  en/projects/
  pt/site.ts  pt/projects/
  index.ts              # getContent(locale)
```

- Nenhum componente contém string voltada ao usuário.
- Os dois locales compartilham o mesmo shape. Um teste de paridade falha quando uma chave existe num locale e falta no outro — é o modo de falha mais comum em i18n mantido à mão.
- Cada projeto mantém os campos de `SPEC.md` §4.3: `slug`, `title`, `type`, `status`, `mock`, `summary`, `role`, `year`, `stack`, `cover`, `alt`, `sections`, `links`.

Três campos controlam eixos **independentes**, e confundi-los é a origem das afirmações falsas que `SPEC.md` §4.3 proíbe:

| Campo | Eixo | Valores | Efeito |
|---|---|---|---|
| `type` | Natureza do trabalho | `verified` \| `concept` | Rótulo visível ao visitante; `concept` nunca se apresenta como trabalho entregue |
| `status` | Maturidade de publicação | `draft` \| `preview` \| `published` | Só `published` gera link para `/work/:slug` |
| `mock` | Origem do dado | `true` \| ausente | Placeholder de desenvolvimento; dispara a trava de build |

Um projeto pode ser `type: concept` e legítimo (estudo real, publicável). `mock: true` é outra coisa: dado inventado para exercitar layout, que nunca pode chegar a produção.

### 5.1 Mock e trava de build

Todo item mockado carrega `mock: true`.

`scripts/assert-no-mock.ts` percorre a árvore de conteúdo dos dois locales e sai com código diferente de zero ao encontrar qualquer item marcado. Roda como `prebuild` no `package.json`.

- `pnpm dev` ignora a trava inteiramente — liberdade total durante o redesenho.
- `pnpm build` falha enquanto houver mock.
- `ALLOW_MOCK=1 pnpm build` passa, para publicar um preview deliberadamente.

Sem dependência nova: um script que lê a árvore de conteúdo e uma linha de `package.json`.

## 6. Rotas e idioma

| Rota | Conteúdo |
|---|---|
| `/` | Home em inglês |
| `/work/:slug` | Case study em inglês |
| `/pt` | Home em português |
| `/pt/work/:slug` | Case study em português |
| `*` | 404 com caminho de volta à home do locale correspondente |

Cada página emite `hreflang` para o par de idiomas e metadados (`title`, `description`, Open Graph) no idioma da rota. O seletor de idioma troca a URL, preservando a rota equivalente.

As guardas de publicação sobrevivem conceitualmente: um projeto sem `status: published` nunca gera link para `/work/:slug`.

## 7. Testes

| Nível | Cobertura |
|---|---|
| Unitário | Composição de conteúdo, paridade de locales, guardas de publicação, trava de mock, utilitários |
| Componente | Cada seção renderiza a partir de conteúdo injetado e é operável por teclado |
| E2E | Home → projeto → contato; deep link direto para case study; troca de idioma; navegação por teclado; `prefers-reduced-motion` |
| Acessibilidade | axe nas rotas principais, nos dois idiomas |
| Regressão visual | Hero, work, case study e contato em 1440 / 768 / 390, a partir do Gate 1 |

## 8. Critérios de aceitação

1. A direção visual escolhida está registrada em `docs/DESIGN_DECISIONS.md`, com as rejeitadas e o motivo.
2. A home comunica nome, função e caminho para trabalhos e contato no primeiro viewport, sem gesto oculto.
3. A composição se sustenta com todo o motion desligado e com `prefers-reduced-motion: reduce`.
4. Toda interação por hover tem equivalente por teclado e por toque.
5. Não existe scroll hijacking, bloqueio de navegação nem transição que esconda conteúdo.
6. Os layouts funcionam em 390, 768 e 1440 sem overflow indevido.
7. Os dois locales têm paridade de chaves e rotas equivalentes.
8. `pnpm build` falha enquanto houver conteúdo mockado, salvo `ALLOW_MOCK=1` explícito.
9. `pnpm validate` passa: typecheck, lint, testes, build e e2e.
10. `design/comps/` não existe mais ao fim da Fase 2.

## 9. Riscos

| Risco | Mitigação |
|---|---|
| A reescrita total perde acessibilidade já conquistada | Fase 4 refaz a auditoria; axe nas rotas principais entra na suíte |
| Nenhum dos três comps convence | Gate 1 permite uma segunda rodada com conceitos ajustados antes de tocar em `src/` |
| Conteúdo mockado vaza para produção | Trava em `prebuild`, com override explícito e visível |
| Tipografia escolhida quebra em português | PT e EN exigidos dentro de cada comp, antes da decisão |
| Motion derruba o FPS no scroll | Decisão de tecnologia adiada para a Fase 3, sobre fundação que já funciona sem motion |
| Escopo cresce sem decisão | Gates por fase; nenhuma fase começa sem a anterior aprovada |

## 10. Decisões deliberadamente adiadas

- **Tecnologia de motion** (CSS, GSAP ou WebGL) — Fase 3, dependente do conceito aprovado.
- **Paleta e par tipográfico definitivos (D2)** — saída do Gate 1; cada comp propõe um conjunto completo.
- **`/about` como página dedicada** (`SPEC.md` D4) — começa como seção da home; promoção avaliada na Fase 4.
- **Volume final de projetos** — a Fase 2 projeta a lista para degradar com elegância entre dois e oito itens.
