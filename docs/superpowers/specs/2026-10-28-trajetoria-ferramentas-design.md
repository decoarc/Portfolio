# Trajetória, ferramentas e projetos pessoais

- **Data:** 2026-10-28
- **Status:** aprovado pelo dono em 2026-10-28 (conversa); documento aguardando
  revisão do dono
- **Depende de:** Fase 4 (`b2902aa`) e a troca de ordem Sobre/Interesses
  (`34ca7d7`), ambas no `main`
- **Referência visual:** os mockups aprovados ficam em
  `.superpowers/brainstorm/120-1793194181/content/`, uma pasta ignorada pelo
  git e sujeita a sumir. As telas aprovadas são `trajetoria-mescla.html` (a
  versão da esquerda, "Hoje") e `ferramentas-layout.html` (opção **C**).
  Este documento descreve o que eles mostram. Se o documento e um mockup
  divergirem, vale o documento.

## 1. Intenção

O dono quer que quem chega ao site veja, antes dos projetos, de onde ele vem e
com o que trabalha. A home ganha duas seções:

- **Trajetória:** a experiência profissional como dev, em linha do tempo, e a
  formação acadêmica resumida. Inspirada no "Trajectory so far" de
  erickkarl.dev, mas no desenho do site (ficha de arquivo, não o visual
  espacial dele).
- **Ferramentas:** o que ele usa, em cinco grupos.

A lista de trabalhos passa a se chamar **Projetos pessoais**, porque é isso
que ela mostra. A experiência de trabalho agora fica na Trajetória.

Os dados vêm do LinkedIn do dono e de uma lista que ele escreveu
(2026-10-28). São reais: não levam `mock: true`.

## 2. Objetivos, não-objetivos, anti-objetivos

**Objetivos**

- Nova ordem da home, nos dois idiomas: **01 Trajetória → 02 Ferramentas →
  03 Projetos pessoais → 04 Abordagem → 05 Interesses → 06 Sobre →
  07 Contato.** O índice (Release) e os números das seções seguem essa ordem.
- A seção Trajetória (§3.2) e a seção Ferramentas (§3.3), com o conteúdo de §4.
- "Trabalhos selecionados" / "Selected work" vira "Projetos pessoais" /
  "Personal projects" em todo lugar que o visitante lê (§3.4).
- A lista "Working with" sai do About.

**Não-objetivos**

- Mudar o hero, a abertura (entrada do nome, afastamento, folha que sobe) ou o
  case study além do rótulo do link de voltar.
- Motion novo. As seções novas não ganham efeito; seguem paradas, como
  Interesses.
- Trocar os mocks dos projetos, da Abordagem ou os textos de head (Fase 5).
- Barra, porcentagem ou nível de proficiência em qualquer ferramenta.

**Anti-objetivos** (é falha mesmo que funcione)

- Afirmar algo que o dono não disse: cargo, empresa, data, curso ou
  ferramenta que não está em §4 (`SPEC.md` §4.3).
- O cargo atual só identificado pela cor do marcador. O "hoje"/"present" no
  texto é o que diz que é atual.
- Quebrar links já compartilhados: `#work`, `/work/:slug`, `#about`,
  `#contact` continuam funcionando.
- Número de seção no índice diferente do número no cabeçalho da seção.

## 3. O que foi decidido

### 3.1 Ordem e índice

`homeSections` passa a devolver, quando todas existem:
`trajectory, tools, work, approach, interests, about, contact`. As regras de
hoje continuam: Abordagem e Interesses somem quando não têm itens. As novas
são fixas, como Trabalhos, Sobre e Contato.

- `HomeSectionId` ganha `'trajectory'` e `'tools'`.
- `release.entries` ganha as duas entradas nos dois idiomas.
- O número de cada seção continua sendo a posição dela em `homeSections`,
  mais um (`HomeRoute`).
- Âncoras novas: `#trajectory` e `#tools` (decisão do Claude). As de hoje não
  mudam.

### 3.2 Trajetória (aprovada no mockup "mescla")

Folha clara (`Sheet tone="sheet"`), `SectionHead` com número e título, como
as outras seções. Abaixo do título, uma frase de abertura em `--ink-muted`.

**Experiência: linha do tempo.**

- Rótulo "Experiência" / "Experience" em mono, maiúsculas (estilo `.type` da
  ficha).
- Um fio vertical de 1 px em `--rule` à esquerda dos itens, com um marcador
  redondo de 9 px por item.
  - Marcador do item atual: preenchido em `--accent`.
  - Marcador dos demais: vazado, com borda `--ink`.
- **Cada item mostra:**
  - período e modalidade em mono ("Out 2025 — hoje · Remoto");
  - cargo em Fraunces, no corte e no peso do título da ficha (`--fraunces-title`,
    600, `--text-title`);
  - empresa e tipo de contrato em `--ink-muted`;
  - descrição de uma a duas linhas;
  - tecnologias em mono pequeno, separadas por espaço, como no mockup.
- **Ordem:** do mais recente ao mais antigo.
- **Com um item só (hoje):** o fio é curto; não há preenchimento artificial.
- **Semântica:** lista ordenada (`<ol>`); fio e marcador são decorativos. O
  período usa `<time dateTime>` com o mês em ISO (`2025-10`).

**Formação: lista separada abaixo.**

- Rótulo "Formação" / "Education" em mono, com espaço acima (~40 px) separando
  da experiência.
- Linhas entre filetes `--rule`, como a lista de trabalhos. Cada linha tem duas
  colunas:
  - à esquerda, o período em mono;
  - à direita, o curso em peso 500, seguido de "· instituição" em
    `--ink-muted`.
- **Abaixo de 768 px:** o período sobe para cima do curso, em vez de ficar ao
  lado (decisão do Claude, padrão das fichas).

### 3.3 Ferramentas (aprovada a opção C)

Folha clara, `SectionHead`. Para cada grupo, uma linha entre filetes:

- **Rótulo do grupo:** mono pequeno, maiúsculas, `--ink-muted` (estilo
  `.type`).
- **Ferramentas:** etiquetas em linha, que quebram de linha quando falta
  espaço. Cada etiqueta tem borda fina de 1 px em `--rule`, texto em mono
  12 px e espaço interno pequeno (~4 × 10 px), sem fundo nem cantos
  arredondados.
- **Semântica:** cada grupo é um rótulo com uma lista (`<ul>`). As etiquetas
  não são links nem botões.
- **Sem introdução** abaixo do título; o mockup não tem.

### 3.4 Projetos pessoais (renomeação)

| Onde | PT | EN |
| --- | --- | --- |
| Título da seção (`work.label`) | Projetos pessoais | Personal projects |
| Índice (`release.entries.work`) | Projetos pessoais | Personal projects |
| Botão principal do hero (`hero.ctaPrimary`) | Projetos pessoais | Personal projects |
| Link do case (`caseStudy.backToWork`) | Voltar aos projetos pessoais | Back to personal projects |

O `id` da seção continua `work` e os caminhos continuam `/work/:slug`
(decisão do Claude: links já compartilhados não quebram). A introdução da
seção (`work.intro`) continua.

### 3.5 Sobre

Saem `about.stackLabel` e `about.stack` do conteúdo, do tipo e do componente.
O resto do About não muda.

## 4. Conteúdo

O texto em português é o que o dono viu nos mockups. O inglês é tradução do
Claude, a revisar pelo dono na Fase 5, como o resto do texto.

### 4.1 Trajetória

| Campo | PT | EN |
| --- | --- | --- |
| Título | Trajetória | Trajectory |
| Abertura | Da engenharia mecânica ao desenvolvimento de software. | From mechanical engineering to software development. |
| Rótulo experiência | Experiência | Experience |
| Rótulo formação | Formação | Education |

**Experiência** (um item, atual):

| Campo | PT | EN |
| --- | --- | --- |
| Período | Out 2025 — hoje | Oct 2025 — present |
| Início (ISO) | `2025-10` | `2025-10` |
| Modalidade | Remoto | Remote |
| Cargo | Software Developer | Software Developer |
| Empresa | Witek | Witek |
| Contrato | Tempo integral | Full-time |
| Descrição | Desenvolvimento full stack para o setor imobiliário e registral, em escala nacional: novas features, melhorias, correções e otimização de serviços críticos usados por cartórios. | Full stack development for the real estate and property registry sector, nationwide: new features, improvements, fixes and optimization of critical services used by notary offices. |
| Tecnologias | PHP, JavaScript, MySQL, Git, Docker, Scrum, Azure | idem |

**Formação** (do mais recente ao mais antigo):

| Período | PT | EN |
| --- | --- | --- |
| 2023 — 2024 | Pós-graduação, Engenharia de Confiabilidade e Gestão de Ativos · PUC Minas | Postgraduate specialization, Reliability Engineering and Asset Management · PUC Minas |
| 2015 — 2022 | Bacharelado em Engenharia Mecânica · Universidade Salvador | Bachelor's degree in Mechanical Engineering · Universidade Salvador |

### 4.2 Ferramentas

| Grupo PT | Grupo EN | Ferramentas (iguais nos dois) |
| --- | --- | --- |
| Frontend | Frontend | JavaScript, TypeScript, React, Next.js, Tailwind CSS, Material UI, Vite |
| Backend | Backend | Node.js, Express, Python, PHP, REST APIs |
| Bancos de dados | Databases | MySQL, PostgreSQL, SQLite, MongoDB |
| Cloud, DevOps e entrega | Cloud, DevOps & Delivery | GCP, Azure, Docker, Git |
| Desktop e sistemas | Desktop & Systems | Rust, Tauri, C++, C# |

Título da seção: "Ferramentas" / "Tools".

Saíram da lista do dono, com o acordo dele, "SQL", por ser a linguagem, e
"Neon", por ser PostgreSQL hospedado. "Tauri 2" ficou só "Tauri".

## 5. Restrições

- **Conteúdo e componentes:** nenhuma string voltada ao usuário em
  componente. O teste de paridade cobre as chaves novas, e os dois locales
  mantêm o mesmo shape.
- **Seções:** cada seção recebe o conteúdo por prop e não importa outra seção
  (spec mãe §4).
- **Acessibilidade WCAG 2.2 AA, como na Fase 4:**
  - texto a 200% e reflow em 320 px sem corte nem scroll horizontal (as
    etiquetas quebram de linha);
  - contraste do texto ≥ 4,5:1;
  - a borda das etiquetas e o fio são decorativos (mesma leitura da `--rule`
    registrada para o dono no Gate 4);
  - em `forced-colors: active`, o fio, os marcadores e as bordas das etiquetas
    continuam visíveis;
  - axe sem violações nas rotas da suíte.
- **Prerender:** sem mudança no mecanismo. As seções novas são da home e o
  HTML gerado deve conter as duas.
- **Verificação:** `pnpm validate:preview` verde. `pnpm build` continua
  falhando por causa dos mocks restantes, e isso é esperado.

## 6. O que muda além do código

- **Testes que fixam a ordem ou os rótulos antigos:** `homeSections`,
  `routes.test`, `Release`, `About` (lista "Working with") e os e2e que
  procuram "Selected work" ou o número de uma seção. Esses passam a seguir a
  ordem nova.
- **Regressão visual:**
  - as baselines do hero (rótulo do botão), de `#work` (número 03 e título) e
    de `#contact` (número 07) mudam;
  - são regravadas com `pnpm test:visual:update`, olhando cada diferença;
  - entram capturas novas de `#trajectory` e `#tools`, nos mesmos três
    viewports e dois idiomas.
- **Imagens OG:** o hero muda de rótulo, então `public/og/home-en.png` e
  `home-pt.png` são regeradas (`e2e/publish.capture.ts`).
- **Docs:**
  - `docs/SPEC.md` §4.1 e §4.2 com a nova sequência;
  - `docs/DESIGN_DECISIONS.md` com uma entrada nova (D-Trajetória) que registra
    a ordem, o renome e os formatos aprovados;
  - em `docs/BACKLOG.md`, a seção "Antes da Fase 5" sai;
  - `docs/gate-4/README.md` ganha uma nota de que a home mudou depois da
    Fase 4.

## 7. O que fica para quem implementa

- Nomes de componentes e arquivos (sugestão: `sections/Trajectory`,
  `sections/Tools`), e o shape exato dos tipos novos, desde que §4 caiba
  nele sem perder campo.
- Medidas finas de espaçamento, dentro dos tokens e do que os mockups mostram.
- Se a linha do tempo vira componente próprio ou fica dentro da seção.
