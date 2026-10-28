# Trajetória, ferramentas e projetos pessoais — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A home ganha as seções Trajetória e Ferramentas no topo, a lista de
trabalhos vira "Projetos pessoais" e o About perde a lista "Working with",
nos dois idiomas.

**Architecture:** Conteúdo tipado novo em `SiteContent`
(`trajectory`, `tools`), dois componentes de seção no padrão das existentes
(`Sheet` + `SectionHead`, conteúdo por prop) e a ordem nova em
`homeSections`/`HomeRoute`. Prerender, head e rotas não mudam.

**Tech Stack:** React 19, TypeScript 5.9, CSS Modules, Vitest 5 + Testing
Library, Playwright 1.64 + `@axe-core/playwright`.

**Spec:** `docs/superpowers/specs/2026-10-28-trajetoria-ferramentas-design.md`

## Global Constraints

- Branch `trajetoria-ferramentas` (já criada, com o design commitado). Nenhuma
  dependência nova.
- Ordem da home (todas presentes): `trajectory, tools, work, approach,
  interests, about, contact` → números 01–07. Abordagem e Interesses somem
  sem itens, como hoje.
- Âncoras: `#trajectory`, `#tools`; `#work`, `#about`, `#contact` e
  `/work/:slug` **não mudam**.
- Textos exatos: os de §3.4 e §4 do design, sem acrescentar nem tirar
  informação (anti-objetivo: afirmar o que o dono não disse). Nada de nível ou
  barra de proficiência.
- Conteúdo real: nenhum item novo leva `mock: true`.
- Nenhuma string voltada ao usuário em componente; seções não importam umas às
  outras.
- Sem motion novo: nenhuma `animation`/`transition` nas seções novas; sem
  `LitText` nelas.
- Tokens: fio e bordas em `--rule`; marcador atual em `--accent`, demais
  vazados com borda `--ink`; textos secundários em `--ink-muted`; rótulos no
  estilo `.type` da ficha (Geist Mono, `--text-micro`, `--track-label`,
  maiúsculas); cargo em Fraunces `--fraunces-title`, peso 600,
  `--text-title`.
- WCAG 2.2 AA como na Fase 4: texto a 200% e 320 px sem corte nem scroll
  horizontal; contraste de texto ≥ 4,5:1; em `forced-colors: active` fio,
  marcadores e bordas das etiquetas visíveis; axe sem violações.
- **Verificação sem `rtk`:** `pnpm typecheck`, `pnpm lint` (0 avisos),
  `pnpm format:check`, `pnpm test`, `pnpm validate:preview`, lendo o exit code
  com `; echo "exit=$?"`. `pnpm build` falha por desenho (mocks restantes).
  Porta 4173 livre antes de e2e. Toda verificação nova é vista falhando uma
  vez. `test:visual:update` só na Task 4, olhando cada diferença.
- Commits em português, `tipo: descrição`, terminando com
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Não incluir
  `.impeccable/config.json`.

## Review Focus

1. **Texto a 200% em 320 px:** as etiquetas de Ferramentas e as linhas da
   Formação quebram sem cortar texto nem criar scroll horizontal. Teste na
   Task 4.
2. **Alto contraste do Windows:** fio, marcadores e bordas das etiquetas
   continuam visíveis em `forced-colors: active`. Teste na Task 4.
3. **Deep links:** `/#trajectory`, `/pt#tools` e o antigo `/#work` param na
   seção certa depois da hidratação. Teste na Task 4.
4. **Botão "Projetos pessoais" do hero:** leva a `#work` (seção 03), não à
   primeira seção da página. Teste na Task 4.
5. **Sem JS:** o HTML pré-renderizado de `/` e `/pt` já contém as duas
   seções novas, na ordem nova. Teste na Task 4.

---

## File Structure

| Arquivo | Responsabilidade |
| --- | --- |
| `src/content/types.ts` | Tipos novos; `HomeSectionId`; `about` sem stack |
| `src/content/{en,pt}/site.ts` | Textos novos, renomes, sem stack no About |
| `src/content/content.test.ts` | Garantias do conteúdo novo |
| `src/sections/About/*` | Sem a linha de stack |
| `src/sections/Trajectory/*` (novo) | Seção Trajetória |
| `src/sections/Tools/*` (novo) | Seção Ferramentas |
| `src/app/homeSections.ts`, `src/app/HomeRoute.tsx` (+ testes) | Ordem nova |
| `e2e/*` | Ajustes de ordem/rótulo, testes do Review Focus, visual |
| `docs/*` | SPEC, decisões, backlog, gate-4 |

---

### Task 1: Conteúdo e tipos

**Files:**
- Modify: `src/content/types.ts`, `src/content/en/site.ts`, `src/content/pt/site.ts`, `src/content/content.test.ts`, `src/sections/About/About.tsx`, `src/sections/About/About.module.css`, `src/sections/About/About.test.tsx`

**Interfaces:**
- Produces (em `src/content/types.ts`):
  ```ts
  export type HomeSectionId =
    | 'trajectory' | 'tools' | 'work' | 'approach' | 'about' | 'interests' | 'contact'
  export interface ExperienceItem {
    /** Texto do período como o visitante lê: 'Out 2025 — hoje'. */
    period: string
    /** Mês de início em ISO, para `<time dateTime>`: '2025-10'. */
    start: string
    /** Cargo atual: o marcador destacado e o "hoje"/"present" no período. */
    current: boolean
    mode: string
    role: string
    company: string
    contract: string
    summary: string
    tech: string[]
  }
  export interface EducationItem { period: string; course: string; institution: string }
  export interface ToolGroup { name: string; items: string[] }
  // SiteContent ganha:
  trajectory: {
    label: string; intro: string
    experienceLabel: string; educationLabel: string
    experience: ExperienceItem[]; education: EducationItem[]
  }
  tools: { label: string; groups: ToolGroup[] }
  // SiteContent.about perde stackLabel e stack.
  ```
- `release.entries` tem as 7 chaves.

- [ ] **Step 1: Write the failing tests** em `content.test.ts`:

```ts
describe('trajetória e ferramentas', () => {
  it.each(locales)('%s: exatamente uma experiência atual, com início ISO', (locale) => {
    const { experience } = getContent(locale).site.trajectory
    expect(experience.filter((item) => item.current)).toHaveLength(1)
    for (const item of experience) expect(item.start).toMatch(/^\d{4}-\d{2}$/)
  })
  it('as ferramentas são as mesmas nos dois idiomas, sem SQL nem Neon', () => {
    const items = (locale: Locale) => getContent(locale).site.tools.groups.map((g) => g.items)
    expect(items('pt')).toEqual(items('en'))
    expect(items('en')).toEqual([
      ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Material UI', 'Vite'],
      ['Node.js', 'Express', 'Python', 'PHP', 'REST APIs'],
      ['MySQL', 'PostgreSQL', 'SQLite', 'MongoDB'],
      ['GCP', 'Azure', 'Docker', 'Git'],
      ['Rust', 'Tauri', 'C++', 'C#'],
    ])
  })
  it('nenhum item da trajetória ou das ferramentas é mock', () => {
    for (const locale of locales) {
      const { trajectory, tools } = getContent(locale).site
      expect(JSON.stringify({ trajectory, tools })).not.toContain('"mock"')
    }
  })
  it('projetos pessoais no lugar de trabalhos selecionados', () => {
    expect(getContent('pt').site.work.label).toBe('Projetos pessoais')
    expect(getContent('en').site.work.label).toBe('Personal projects')
  })
})
```
`About.test.tsx`: o segundo teste passa a afirmar lead e corpo visíveis e
`expect(screen.queryByText('Working with')).toBeNull()` (com o número no
primeiro teste trocado para o que a página usa, `06`).

- [ ] **Step 2: Run to verify it fails** — `pnpm test src/content src/sections/About; echo "exit=$?"` → exit 1.
- [ ] **Step 3: Implement**
  - Tipos acima.
  - Conteúdo exato das tabelas de §3.4 e §4 do design, nos dois idiomas: `trajectory`, `tools`, `release.entries.trajectory` ("Trajetória"/"Trajectory") e `release.entries.tools` ("Ferramentas"/"Tools").
  - Renomes: `work.label`, `release.entries.work`, `hero.ctaPrimary`, `caseStudy.backToWork`.
  - Sai a stack do About: conteúdo, tipo, JSX e o CSS de `.stack`/`.stackLabel`.
  - Atualize os comentários do topo de `site.ts`, se citarem a regra de "sem empregador", para dizer que a trajetória usa dados do dono (2026-10-28).
- [ ] **Step 4: Run** — `pnpm test; echo "exit=$?"` → 0 (a paridade cobre as chaves novas). `pnpm typecheck`, `pnpm lint` → 0. Testes de rótulo antigo que quebrarem aqui (por exemplo, "Selected work" em `routes.test.tsx`) são atualizados para o rótulo novo nesta task.
- [ ] **Step 5: Commit** — `feat: conteúdo de trajetória e ferramentas, projetos pessoais`

---

### Task 2: Seção Trajetória

**Files:**
- Create: `src/sections/Trajectory/Trajectory.tsx`, `Trajectory.module.css`, `Trajectory.test.tsx`, `index.ts`

**Interfaces:**
- Consumes: `SiteContent['trajectory']`, `ExperienceItem`, `EducationItem` (Task 1); `Sheet`, `SectionHead` (existentes).
- Produces: `export function Trajectory({ index, copy }: { index: number; copy: SiteContent['trajectory'] })`. A seção é `<Sheet tone="sheet" id="trajectory" labelledBy="trajectory-heading">`. A abertura vai em `SectionHead` como `intro`, com `litIntro` falso.

- [ ] **Step 1: Write the failing tests** (`Trajectory.test.tsx`, conteúdo `siteEn.trajectory` e um clone com dois itens de experiência):

```ts
it('é a região #trajectory nomeada pelo h2, com número e abertura', ...)
  // getByRole('region', { name: 'Trajectory' }) com id 'trajectory'; texto '01'; intro visível
it('experiência é uma lista ordenada; cada item tem cargo, empresa, período em <time> e tecnologias', ...)
  // within(getByRole('list', { name: 'Experience' })) — a <ol> é rotulada pelo rótulo "Experience" (aria-labelledby)
  // getByText('Software Developer'); getByText(/Witek/); container.querySelector('time[datetime="2025-10"]') com texto 'Oct 2025 — present'
  // as 7 tecnologias presentes em ordem
it('o item atual é marcado por atributo, não só por cor', ...)
  // com 2 itens (o 2º current: false): exatamente um <li> com data-current
it('formação é uma lista separada, rotulada, com período, curso e instituição', ...)
  // getByRole('list', { name: 'Education' }) com 2 itens; textos de §4.1; instituição presente
it('nenhum link ou botão na seção', ...)
  // queryAllByRole('link') e ('button') vazios dentro da região
```

- [ ] **Step 2: Run to verify it fails** — `pnpm test src/sections/Trajectory; echo "exit=$?"` → 1.
- [ ] **Step 3: Implement** conforme §3.2 do design.
  - O fio e o marcador são pseudo-elementos (`::before`) decorativos; o `<li>` atual recebe `data-current`.
  - A formação usa duas colunas a partir de 768 px; abaixo disso o período sobe para cima do curso.
  - A Formação tem cerca de 40 px de espaço acima.
- [ ] **Step 4: Run** — `pnpm test src/sections/Trajectory; echo "exit=$?"` → 0; `pnpm lint` → 0.
- [ ] **Step 5: Commit** — `feat: seção Trajetória`

---

### Task 3: Seção Ferramentas

**Files:**
- Create: `src/sections/Tools/Tools.tsx`, `Tools.module.css`, `Tools.test.tsx`, `index.ts`

**Interfaces:**
- Consumes: `SiteContent['tools']`, `ToolGroup` (Task 1).
- Produces: `export function Tools({ index, copy }: { index: number; copy: SiteContent['tools'] })`. A seção é `<Sheet tone="sheet" id="tools" labelledBy="tools-heading">` e não tem `intro`.

- [ ] **Step 1: Write the failing tests**:

```ts
it('é a região #tools nomeada pelo h2, com número', ...)
it('cada grupo é uma lista rotulada pelo nome do grupo, com as ferramentas na ordem', ...)
  // para cada group de siteEn.tools.groups:
  //   within(getByRole('list', { name: group.name })).getAllByRole('listitem').map(li => li.textContent) == group.items
it('nenhuma ferramenta é link ou botão', ...)
```

- [ ] **Step 2: Run to verify it fails** — `pnpm test src/sections/Tools; echo "exit=$?"` → 1.
- [ ] **Step 3: Implement** conforme §3.3 do design.
  - Cada grupo é uma linha entre filetes `--rule` (borda de cima, e de baixo no último).
  - Rótulo no estilo `.type`.
  - As etiquetas usam `display: flex; flex-wrap: wrap; gap: 8px`, borda de 1 px em `--rule`, Geist Mono 12 px, padding de cerca de 4 × 10 px, sem fundo e sem raio.
- [ ] **Step 4: Run** — `pnpm test src/sections/Tools; echo "exit=$?"` → 0; `pnpm lint` → 0.
- [ ] **Step 5: Commit** — `feat: seção Ferramentas`

---

### Task 4: Home na ordem nova, verificação e docs

**Files:**
- Modify: `src/app/homeSections.ts` (+ `homeSections.test.ts`), `src/app/HomeRoute.tsx`, `src/app/routes.test.tsx`, `src/sections/Release/Release.test.tsx` (se fixar ordem), e2e que fixem ordem/número/rótulo, `e2e/visual.visual.ts` (+ snapshots), `e2e/a11y-audit.spec.ts`, `e2e/prerender.spec.ts`, `public/og/home-en.png`, `public/og/home-pt.png`, `docs/SPEC.md`, `docs/DESIGN_DECISIONS.md`, `docs/BACKLOG.md`, `docs/gate-4/README.md`

**Interfaces:**
- Consumes: `Trajectory`, `Tools` (Tasks 2–3); conteúdo (Task 1).
- Produces: `homeSections(site)` → `['trajectory', 'tools', 'work', 'approach', 'interests', 'about', 'contact']` com todos presentes.

- [ ] **Step 1: Write the failing tests**
  - `homeSections.test.ts`: as três ordens. Completa como acima; sem Interesses: `['trajectory','tools','work','approach','about','contact']`; sem Abordagem: `['trajectory','tools','work','interests','about','contact']`.
  - `routes.test.tsx` "h2 na ordem do índice": `['Trajectory', 'Tools', 'Personal projects', 'Approach', 'Interests', 'About', 'Contact']`. O teste de números (índice = cabeçalho) continua e precisa passar.
  - `e2e/prerender.spec.ts` (Review Focus 5): no HTML cru de `/` e `/pt` (via `request`), `id="trajectory"` aparece antes de `id="tools"`, que aparece antes de `id="work"`.
  - `e2e/a11y-audit.spec.ts`:
    - (Review Focus 1) Em 320 × 844 com fonte raiz 32 px, `/` e `/pt`: `#trajectory` e `#tools` sem texto passando da borda, usando o `textPastEdge` existente, e `scrollWidth <= innerWidth`.
    - (Review Focus 2) Com `forcedColors: 'active'`, a borda de uma etiqueta de `#tools` e o marcador do item atual (`::before`) têm cor computada diferente do fundo da seção.
    - (Review Focus 3) `/#trajectory`, `/pt#tools` e `/#work` param com a seção no topo da janela (±masthead) depois de `networkidle`.
    - (Review Focus 4) Clicar no botão principal do hero ("Personal projects") rola até `#work`, e não até `#trajectory`.
  - `e2e/visual.visual.ts`: `PARTS` ganha `{ part: 'trajectory', selector: '#trajectory' }` e `{ part: 'tools', selector: '#tools' }`.
- [ ] **Step 2: Run to verify it fails** — `pnpm test src/app; echo "exit=$?"` → 1; porta 4173 livre, `pnpm build:preview && pnpm test:e2e; echo "exit=$?"` → 1 (ordem, HTML cru, deep links e visual sem baseline).
- [ ] **Step 3: Implement** `homeSections` e `HomeRoute` na ordem nova. Ajuste os e2e antigos que fixam ordem, número ou "Selected work"; liste cada um no relatório.
- [ ] **Step 4: Baselines e OG.**
  - Rode `pnpm test:visual:update`. Abra as baselines que mudaram e as novas, e confira que:
    - mudaram só o rótulo do botão no hero, os números e o título em `#work`/`#contact`;
    - as novas mostram as seções como no design.

    Descreva no relatório o que mudou em cada uma.
  - Regere `public/og/*.png` com `npx playwright test --project=capture e2e/publish.capture.ts` e confira a imagem.
- [ ] **Step 5: Docs.**
  - `docs/SPEC.md`: §4.1 e §4.2 com a sequência nova.
  - `docs/DESIGN_DECISIONS.md`: entrada D-Trajetória, com a ordem, o renome, os formatos aprovados (linha do tempo + formação em lista; etiquetas) e a data.
  - `docs/BACKLOG.md`: sai a seção "Antes da Fase 5".
  - `docs/gate-4/README.md`: uma nota de que a home mudou depois da Fase 4, apontando para o design.
- [ ] **Step 6: Run** — `pnpm typecheck`, `pnpm lint` (0 avisos), `pnpm format:check`, `pnpm test` e `pnpm validate:preview` → todos exit 0.
- [ ] **Step 7: Commit** — um commit de código e testes (`feat: home com trajetória e ferramentas no topo`) e outro de docs (`docs: trajetória e ferramentas na spec e nas decisões`).
