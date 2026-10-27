# Portfolio — Product & Experience Specification

**Versão:** 0.1.0 (baseline para desenvolvimento)  
**Status:** Draft — decisões conceituais aprováveis, não uma implementação final  
**Idioma do produto:** Português e inglês (PT-BR / EN)  
**Tipo:** Portfólio profissional pessoal, com forte identidade visual e engenharia de interface

## 1. Visão do produto

Construir um portfólio de desenvolvedor que funcione simultaneamente como apresentação profissional e demonstração de capacidade técnica e criativa. A experiência deve ser reconhecível, envolvente e responsiva: o visitante percebe movimento, profundidade e respostas imediatas a cursor, clique e scroll, sem perder o controle da navegação.

**Princípio central:** a identidade nasce da composição e do comportamento dos elementos; animações não podem ser apenas decoração aplicada a uma interface genérica.

### 1.1 Resultados esperados
- Comunicar quem é o profissional, o que desenvolve e como contatá-lo em poucos segundos.
- Destacar projetos reais, contribuição individual, decisões de engenharia e resultados verificáveis.
- Oferecer uma experiência visual autoral e memorável sem sacrificar acessibilidade, legibilidade ou desempenho.
- Permitir adicionar projetos e estudos no futuro sem refazer a arquitetura da homepage.

### 1.2 Público-alvo
- Recrutadores e gestores técnicos que precisam avaliar rapidamente experiência e resultados.
- Engenheiros e designers que desejam examinar decisões técnicas, qualidade da interface e projetos.
- Pessoas interessadas em entrar em contato ou conhecer o trabalho.

### 1.3 Não objetivos
- Transformar a homepage em jogo ou experiência 3D obrigatória.
- Introduzir transições longas, scroll sequestrado ou navegação que dependa de cursor.
- Publicar projetos, resultados, depoimentos ou métricas inventados como fatos.
- Replicar fielmente a identidade de qualquer site de referência.

## 2. Referências e princípios extraídos

As referências servem para **estudar mecanismos e linguagem**, não para copiar telas.

| Referência | Aspecto a investigar | Aplicação potencial |
|---|---|---|
| Morten Stig Christensen | Progressão narrativa e ritmo do scroll | Sequências visuais e transições entre seções |
| Yasin Genc | Atmosfera e assinatura gráfica | Contraste, personalidade e composição |
| Minh Pham | Experimentação visual | Hero autoral e planos de profundidade |
| Dennis Snellenberg | Precisão de motion e hierarquia | Microinterações, navegação e acabamento |
| Nikola Radeski | Identidade gráfica | Tipografia expressiva e linguagem reconhecível |

**Três pilares mandatórios:**
1. **Motion com propósito:** cada movimento orienta atenção, reforça hierarquia ou expressa materialidade.
2. **Interatividade responsiva:** ações do visitante produzem feedback previsível e imediato.
3. **Identidade autoral:** uma linguagem coesa de tipografia, materiais, grids, ritmo e comportamento.

## 3. Direção criativa

### 3.1 Hipótese criativa inicial
**Editorial experimental + materialidade industrial contemporânea + profundidade cinematográfica controlada.**

Tratar esta combinação como **hipótese de exploração**, não como obrigação irrevogável. A metáfora visual central ainda precisa ser escolhida por comparação de composições.

Conceitos candidatos:
- **Inspection Slot / bancada de inspeção:** molduras, recortes, planos e enquadramentos que revelam projetos.
- **Arquivo editorial / Rolodex:** índices, lâminas e placas que organizam trabalhos sem depender de gimmicks.
- **Galeria espacial abstrata:** mídias e superfícies em profundidade, sem cenário literal.

**Gate de decisão D1:** criar três composições estáticas do primeiro viewport, uma por conceito, e escolher a base antes da implementação visual definitiva. Registrar a decisão e o motivo em `docs/DESIGN_DECISIONS.md`. O layout deve funcionar sem animação.

### 3.2 Linguagem visual
- Tipografia: contraste entre uma fonte display expressiva e uma família legível para leitura; testar composição em português e inglês.
- Grid: editorial, com variações assimétricas deliberadas; alinhamentos e espaços consistentes.
- Cor: base neutra/escura como hipótese, com uma cor de acento restrita; validar contraste WCAG.
- Materialidade: texturas, luz e superfícies apenas quando comunicarem profundidade ou identidade.
- Imagens: mídia de projeto autêntica; mockups conceituais explicitamente identificados.
- Hero: nome com presença marcante **apenas no hero**, evitando repeti-lo como elemento dominante em toda a página.

### 3.3 Regras de composição
- A primeira dobra deve comunicar identidade, função profissional e caminho claro para trabalhos/contato.
- Conteúdo e navegação permanecem legíveis sobre qualquer camada visual.
- Profundidade prioriza mídia, luz, planos e superfícies; textos e controles não participam de parallax intenso.
- A estética deve continuar coerente quando todo motion estiver desativado.

## 4. Arquitetura da informação

### 4.1 Páginas mínimas
- `/` — Home: apresentação, trabalhos selecionados, sobre, interesses (opcional), contato.
- `/work/[slug]` — Case study: contexto, problema, papel, solução, stack, decisões, evidências, resultados, links autorizados.
- `/about` — Perfil, experiência, competências e trajetória; pode começar como seção da home e virar página posteriormente.
- Página de erro 404 orientando retorno à home.

### 4.2 Homepage: sequência proposta
1. **Arrival / Hero:** tipografia forte, proposta profissional clara, composição autoral, CTA para projetos.
2. **Release:** passagem do hero para conteúdo, com continuidade visual sem scroll bloqueado.
3. **Selected Work:** projetos com grande presença de mídia e interação de hover/focus.
4. **Approach / Craft:** abordagem de engenharia, ferramentas e decisões ilustradas com evidências.
5. **About:** apresentação humana e trajetória em formato curto.
6. **Interests (opcional):** games, drawing, reading, traveling, mantendo o conteúdo profissional prioritário.
7. **Contact:** e-mail/link de contato, GitHub, LinkedIn e chamada objetiva.

### 4.3 Conteúdo e integridade
- Projeto principal real pode ter destaque maior; outros itens podem ser publicados como **Concept study / Estudo conceitual**, nunca apresentados como trabalhos entregues.
- Nenhuma métrica ou resultado fictício deve parecer verificável.
- Links de repositórios privados ou indisponíveis não devem ser exibidos como públicos.
- Cada projeto contém: `slug`, `title`, `type` (`verified` | `concept`), `summary`, `role`, `year`, `stack`, `cover`, `alt`, `sections`, `links`, `visibility`.
- Conteúdo bilingue em arquivos de dados/MDX desacoplados dos componentes.

## 5. Sistema de motion

### 5.1 Princípios
- **Continuidade:** elementos mudam de estado, em vez de desaparecerem/reaparecerem arbitrariamente.
- **Resposta:** feedback de hover, foco e clique é rápido e perceptível.
- **Profundidade:** poucas camadas com deslocamentos diferentes; não criar pseudo-3D em toda seção.
- **Intenção:** cada efeito documenta o que comunica.
- **Interrompibilidade:** usuário pode navegar ou rolar sem aguardar o fim da animação.

### 5.2 Classes de movimento
| Classe | Gatilho | Comportamento | Restrição |
|---|---|---|---|
| Microinteração | hover/focus/press | deslocamento, destaque, máscara ou luz | Não mover alvos de clique para longe do cursor |
| Reveal | entrada em viewport | surgimento leve de mídia/legenda | Conteúdo deve continuar acessível sem JS |
| Parallax | scroll nativo | velocidade diferencial de planos e mídia | Evitar em blocos de texto e controles |
| Transition | navegação/abertura | continuidade de forma, máscara ou frame | Não bloquear URLs, histórico ou navegação |
| Ambient | ociosidade/movimento do cursor | luz/textura discreta | Desligar em reduced motion e dispositivos restritos |

### 5.3 Contrato técnico de motion
- Usar preferencialmente `transform` e `opacity`; evitar animação contínua de `top`, `left`, `width`, `height` e propriedades que forcem layout.
- Não aplicar listeners de scroll que executem cálculos caros em cada evento; preferir APIs nativas ou pipeline com `requestAnimationFrame` e limpeza correta.
- Sem scroll hijacking, smooth scrolling forçado ou seções presas por padrão.
  Exceção autorizada pelo dono em 2026-10-26: scroll suave (Lenis, desligado em reduced motion) e o hero preso sob a folha do índice — ver `docs/superpowers/specs/2026-10-26-fase-3-motion-design.md`.
- `prefers-reduced-motion: reduce`: remover parallax, efeitos ambientais e transições espaciais; manter estados compreensíveis e feedback essencial.
- Em touch/mobile, eliminar dependência de hover e reduzir camadas de profundidade.
- Uma animação que cause atrasos de interação, enjoo, sobreposição ou perda de informação deve ser removida ou simplificada.

### 5.4 Prototipagem / aprovação
Para cada animação principal, documentar: objetivo, elemento, gatilho, estados inicial/final, duração/easing aproximados, alternativa reduced-motion, fallback sem JS e evidência visual de revisão.

## 6. Interações e navegação
- Cursor personalizado é opcional; cursor nativo deve seguir funcional e visível em todos os estados.
- Hover de projeto pode revelar preview ou camada contextual; clique abre a URL da página do case study.
- Foco por teclado deve produzir equivalentes funcionais ao hover.
- Links e botões usam semântica apropriada, estados de foco visíveis e alvo confortável para toque.
- Menus sempre podem ser fechados e operados por teclado; `Escape` quando aplicável.
- A navegação deve continuar possível sem WebGL, sem mouse e com JavaScript indisponível quando viável.

## 7. Requisitos funcionais

| ID | Requisito | Prioridade |
|---|---|---|
| FR-01 | Hero apresenta nome, função e navegação para trabalhos | P0 |
| FR-02 | Lista de projetos alimentada por conteúdo estruturado | P0 |
| FR-03 | Página individual para projetos publicados | P0 |
| FR-04 | Tipo e status `verified/concept` exibidos com clareza | P0 |
| FR-05 | Contato, GitHub e LinkedIn acessíveis | P0 |
| FR-06 | Responsivo em desktop, tablet e mobile | P0 |
| FR-07 | Idiomas PT-BR / EN com links e navegação coerentes | P1 |
| FR-08 | Interações de hover/focus e motion autoral | P1 |
| FR-09 | Parallax de mídia/profundidade com fallback | P1 |
| FR-10 | Galeria/experimentos ou Rolodex funcional | P2 — depende do conceito aprovado |
| FR-11 | Filtros e categorias de projetos | P2 — quando houver volume suficiente |

## 8. Requisitos não funcionais

### 8.1 Performance
- Metas em produção, avaliadas por dados de campo quando disponíveis: **LCP <= 2,5 s; INP <= 200 ms; CLS <= 0,1** no percentil 75, para mobile e desktop.
- Imagens dimensionadas, responsivas e comprimidas; lazy loading abaixo da primeira dobra; reservar espaço para evitar CLS.
- Evitar bibliotecas pesadas de animação/3D se não justificadas pelo conceito.
- Fontes locais ou eficientemente carregadas, com fallback e sem bloquear renderização.
- A experiência deve ser utilizável em equipamentos medianos, não apenas na máquina de desenvolvimento.

### 8.2 Acessibilidade
- Alvo: WCAG 2.2 AA para fluxos e componentes essenciais.
- Contraste adequado, landmarks semânticos, headings hierárquicos, alternativas textuais, foco visível e navegação por teclado.
- Sem conteúdo essencial acessível apenas por movimento, cor ou hover.
- Respeitar redução de movimento e zoom/reflow a 200%/400% conforme cenários pertinentes.

### 8.3 SEO e qualidade
- Metadados por idioma/página, Open Graph, sitemap, robots e URLs estáveis.
- HTML semântico e conteúdo principal indexável.
- Segurança básica: dependências auditáveis; links externos seguros; sem publicar segredos ou dados privados.
- Logs de erros de cliente sem coleta desnecessária de dados pessoais.

## 9. Arquitetura técnica proposta

**Não fixar framework antes de auditar o repositório existente.** Preservar stack e convenções atuais se atenderem aos requisitos; migração só mediante justificativa técnica.

Organização conceitual:
```text
src/
  app/ or routes/       # rotas, layouts e metadados
  components/           # UI reutilizável e composição
  features/             # hero, work, about, contact
  motion/               # presets, hooks, fallbacks
  content/              # projetos, textos, traduções
  styles/               # tokens, tipografia, layouts
  lib/                  # utilitários
public/                 # mídia otimizada
  projects/
docs/
  DESIGN_DECISIONS.md
  MOTION_SPEC.md
  QA_CHECKLIST.md
```

Regras:
- Separar conteúdo, apresentação e comportamento de motion.
- Manter design tokens para tipografia, cor, espaçamento, raios, camadas e tempos de animação.
- Só introduzir WebGL/Three.js se um conceito aprovado provar necessidade.
- Animar de forma progressiva: conteúdo primeiro, melhoria visual depois.
- Preservar acessibilidade e desempenho nos componentes base antes de adicionar efeitos.

## 10. Plano de entrega com gates

### Gate 0 — Descoberta e baseline
- Inspecionar estrutura atual, rotas, componentes, testes, performance e restrições de deploy.
- Inventariar conteúdo real e ativos disponíveis.
- **Saída:** mapa do repositório, riscos, pendências e baseline de screenshots.

### Gate 1 — Direção visual
- Criar três composições estáticas do hero usando os conceitos candidatos.
- Comparar legibilidade, originalidade, continuidade com trabalhos e qualidade em mobile.
- Selecionar uma direção; registrar alternativas rejeitadas.
- **Gate:** nenhuma grande implementação de animação antes da aprovação da composição.

### Gate 2 — Foundation
- Design tokens, tipografia, layout responsivo, dados de projetos e arquitetura de rotas.
- Home estática utilizável e cases estruturados.
- **Gate:** navegação, conteúdo e responsividade funcionam sem motion.

### Gate 3 — Motion e interatividade
- Implementar microinterações e transições pontuais.
- Adicionar parallax somente aos planos aprovados.
- Criar fallback mobile/reduced motion e realizar testes de fluidez.
- **Gate:** comparações visuais com protótipos + medições em hardware real.

### Gate 4 — Conteúdo e refinamento
- Publicar case real verificado, estudos marcados como conceito e textos PT/EN.
- Refinar acessibilidade, SEO, estados de erro e comportamento responsivo.
- **Gate:** nenhuma afirmação de projeto sem evidência/rotulagem adequada.

### Gate 5 — Validação e release
- Testes automatizados, auditoria de teclado, reduced motion, mobile e performance.
- Verificar deep links, linkagem externa, analytics (se houver) e deploy.
- **Gate:** checklist de aceitação assinado; registrar débitos remanescentes.

## 11. Estratégia de testes

- **Unitários:** composição de dados, traduções, utilitários e estados simples.
- **Integração:** navegação, filtros (se presentes), links e mudança de idioma.
- **E2E:** visitar home, abrir projeto, navegar e contatar; teclado; viewport desktop/mobile; reduced motion.
- **Visual regression:** hero, transição, work, case e contact em breakpoints definidos.
- **Performance:** Lighthouse/lab + testes de fluidez durante scroll; investigar long tasks, quedas de frame e layout shifts.
- **Manual:** mouse, touch, teclado, zoom, navegação sem animação, lentidão de rede e browsers suportados.

## 12. Critérios de aceitação do MVP

O MVP só pode ser considerado aprovado quando:

1. O visitante identifica nome/função e encontra trabalhos e contato sem precisar descobrir gestos ocultos.
2. Existe ao menos um case real com papel, contexto e evidências revisados.
3. A homepage tem linguagem autoral consistente mesmo com animação desligada.
4. Motion e interações relevantes estão implementados e têm alternativa teclado/touch/reduced motion.
5. Não existem scroll hijacking, bloqueios de navegação ou transições que escondam conteúdo.
6. Layouts essenciais funcionam em mobile, tablet e desktop sem overflow indevido.
7. Fluxos críticos e links externos passam em testes E2E.
8. As metas de performance e requisitos de acessibilidade foram medidos; desvios estão documentados e bloqueios críticos resolvidos.
9. Nenhum conceito, projeto ou resultado fictício é apresentado como trabalho verificado.
10. A implantação final permite acesso direto aos deep links das páginas de projeto.

## 13. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Excesso de efeitos comprometer usabilidade | Orçamento de motion e revisão de propósito por efeito |
| Identidade parecer cópia de referência | Composições originais, comparação crítica e documentação de autoria |
| Queda de FPS no scroll | Limitar camadas e propriedades animadas; testar em hardware mediano |
| Site atrativo, mas pouco claro para recrutadores | CTA visível, cases com evidência e leitura objetiva |
| Poucos projetos publicados | Destaque real para projeto existente; concepts claramente rotulados |
| Mobile inconsistente | Composição mobile própria, sem depender de profundidade e hover |
| Escopo crescer sem decisão | Entregas por gates, P0/P1/P2 e registro de mudanças |

## 14. Decisões em aberto

Estas escolhas devem ser feitas durante o Gate 0/1 e **não** bloquear a criação da fundação técnica:

- **D1:** Metáfora principal: Inspection Slot, arquivo/Rolodex ou galeria abstrata?
- **D2:** Paleta definitiva e famílias tipográficas (com licenças verificadas).
- **D3:** Quais transições pertencem à navegação e quais à rolagem?
- **D4:** Manter `/about` dedicado desde o MVP ou começar apenas com seção na home?
- **D5:** Confirmação da stack existente e estratégia de deploy.
- **D6:** Conteúdo e capturas autorizadas de cada projeto.

## 15. Definition of Done (por tarefa)

Uma tarefa só está concluída quando possui: implementação funcional; estados responsivos; suporte a teclado quando interativa; comportamento reduced-motion quando animada; testes apropriados; evidência visual ou gravação para comportamento relevante; documentação atualizada; sem erros críticos de lint, typecheck e build.

---

**Orientação para agentes/implementadores:** antes de escrever código, auditar o repositório e confrontar decisões já aprovadas com esta especificação. Se houver conflito, registrar a divergência e propor alteração mínima. Não substituir escolhas visuais existentes sem evidência ou decisão explícita. Priorizar Gate 0 e Gate 1, nunca implementar todos os efeitos de uma vez.
