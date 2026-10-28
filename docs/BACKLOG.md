# Backlog

Itens adiados deliberadamente, com o motivo e o momento certo de pegá-los.
Item sem momento definido vira item esquecido. As ideias recusadas ficam no
fim, para não voltarem ao tema sem querer.

A Fase 3 terminou em 2026-10-27 com a segunda leva (hover nos links de ação,
reação da lista de trabalhos, texto que acende com o scroll e título que viaja
da ficha ao case study; ver `docs/MOTION_SPEC.md`). O que foi calibrado sobre
o texto mock é revisto na Fase 5.

## Fase 4 — Acabamento (encerrada, aguardando o Gate 4)

A Fase 4 terminou em 2026-10-27 (`docs/gate-4/README.md`). Metadados por idioma
e reduced motion no meio da sessão foram entregues; o que ela adiou está abaixo,
cada item com o momento certo.

### Acessibilidade — P3 da auditoria da Fase 4

Achados menores de `docs/gate-4/A11Y_AUDIT.md`, sem falha de critério AA:

- **"sem captura" cortado na miniatura com texto a 200%** (até 334 px em
  320). A miniatura é decorativa (`aria-hidden`) e repete o tipo e o título da
  ficha. **Por quê adiado:** some com as capturas reais. **Quando:** Fase 5,
  com as capturas.
- **Alto contraste: o traço dos CTAs e dos canais e o círculo do monograma do
  cartão somem.** O link segue identificado por `LinkText` e pelo foco; o
  monograma é decorativo. **Fazer, se quiser:** `border-bottom` em
  `CanvasText` no traço, dentro de `@media (forced-colors: active)`.
  **Quando:** se o dono quiser, na Fase 5.
- **Tipo da ficha encosta na miniatura com texto a 200%** em 320 px (o
  espaçamento de letra final de "CONCEPT" toca a moldura). Nada some.
- **Números de seção e de ficha lidos como texto solto** ("01" antes do `h2`,
  parágrafo "01" na ficha). **Quando:** confirmar com o NVDA do Gate 4; se
  incomodar, `aria-hidden` no número.

## Fase 5 — Conteúdo real e publicação

Regra de deploy: publicar só um `dist/` gerado por `pnpm build` com
`VITE_SITE_ORIGIN` definida; nunca um `dist/` que sobrou do e2e (o webServer do
Playwright roda `build:preview` e deixa canonicals e OG em localhost).

O conteúdo mock fica até o fim e só é trocado quando o repositório for
publicado (decisão do dono, 2026-10-27). Hoje são 12 itens `mock: true`: três
projetos (Atlas Ledger, Field Notes, Token Killer) e os três princípios da
Abordagem, cada um em pt e en.

### Textos de `description` e Open Graph

O mecanismo de metadados por idioma está pronto (Fase 4). Os textos de
`site.meta.description` e `site.meta.ogImageAlt` são mock e as imagens
`public/og/home-en.png` e `home-pt.png` mostram o texto de hoje.

- **Fazer:** revisar os textos com o conteúdo real e regravar as imagens OG.
- **Quando:** Fase 5, junto da troca dos mocks.

### Domínio e `VITE_SITE_ORIGIN`

`canonical`, `hreflang` e `og:url` usam `VITE_SITE_ORIGIN`, e `pnpm build`
falha sem ela. O domínio ainda não existe.

- **Fazer:** escolher o domínio e defini-lo no painel do Cloudflare Pages.
- **Quando:** Fase 5, antes do primeiro deploy.

### Baselines visuais de outra máquina

As baselines de `e2e/visual.visual.ts-snapshots/` são só `win32`, geradas nesta
máquina, sem tolerância por pixel.

- **Fazer:** regravar com `pnpm test:visual:update` depois de trocar mocks e
  capturas (olhando as diferenças); se o CI for Linux, gerar as baselines lá.
- **Quando:** Fase 5.

### Folga do LCP do case

O case Map Areas mede 2344 ms no preview sem gzip (156 ms de folga sobre o
orçamento de 2,5 s). O LCP é a capa de 103 kB disputando banda com o JS.

- **Fazer:** medir de novo com a capa real; se passar do orçamento, comprimir
  ou redimensionar a capa, ou dividir o JS por rota (design da Fase 4, §8,
  item 3).
- **Quando:** Fase 5, com a capa real.

### `pnpm validate` falha por desenho enquanto houver mock

`validate` encadeia `build`, e `build` roda a trava de mock
(`scripts/assert-no-mock.ts`) antes de `tsc -b`. Enquanto algum item tiver
`mock: true`, `validate` sai com 1 — é o critério 8 da spec funcionando. O
critério 9 (`validate` verde; o `build` de produção roda por último, depois do e2e) fecha na Fase 5, com conteúdo real no lugar dos
mocks.

### Miniaturas com mídia real

As fichas da lista de trabalhos já têm miniatura (segunda leva da Fase 3). Hoje
só o Map Areas tem imagem (`cover`); os outros projetos usam o placeholder
escuro "sem captura", aprovado pelo dono até a Fase 5.

- **Fazer:** trocar os placeholders por capturas autorizadas, junto da troca dos
  mocks (decisão do dono, 2026-10-27). Cada projeto passa a ter a própria fonte
  (`thumbSrc`) e o tamanho e o formato da mídia real podem rever o 4:3.
- **Restrições que já valem:** `docs/SPEC.md` §5.2 e §6; a imagem continua
  decorativa (`alt=""`) e sem depender de hover.
- **Registrar em:** as fichas "Miniatura da ficha" e "Prévias dos links de ação"
  de `docs/MOTION_SPEC.md`, se o desenho mudar.

### Endurecimentos do título que viaja

Quatro pontos frágeis, hoje sem efeito visível, deixados de fora do review final:

- `data-title-flight` só é limpo no `popstate`; deveria sair quando a view
  transition termina. Um futuro `Link` com `viewTransition` herdaria regras de
  abrir/fechar velhas.
- O `ScrollManager` só escolhe o `[data-anchor-focus]` quando o alvo contém
  exatamente um. Trocar por "o ancestral `[id]` mais próximo é o alvo"; quebra se
  `#work` tiver uma única ficha.
- Os ids de `workAnchor` (`work-<slug>`) dividem espaço com `work-heading`. Um
  teste de conteúdo deve proibir o slug `heading`.
- Com `data-settling`, quem volta pelo teclado com Enter vê só o contorno de foco
  (não a reação da lista) até a próxima tecla.

- **Fazer:** os quatro ajustes acima, cada um com seu teste.
- **Por quê:** nenhum aparece com o conteúdo mock; todos podem aparecer com a
  mudança de conteúdo ou de links.

## Ferramental — ao atualizar o rtk

### O wrapper `rtk` reporta sucesso falso

Durante a Fase 0 o `rtk` reportou `TypeScript: No errors found` com código de
saída 0 **enquanto cinco erros de tipo reais existiam**, e mascarou o código de
saída. Um build quebrado passou por seis verificações independentes porque os
implementadores confiaram nessa saída; só apareceu no review final da branch.

Observado também, por um dos agentes:

- intercepta comandos mesmo sem o prefixo `rtk`;
- `npx prettier --check` e `pnpm exec prettier` imprimiram
  `All files formatted correctly` com código de saída 1;
- `pnpm exec vitest` também é interceptado;
- scripts de `package.json` cujo nome não bate com nenhum filtro
  (`typecheck`, `build`, `format:check`) passam crus.

**Investigado em 2026-10-26 (rtk 0.37.2)** com sondas de erro proposital
(tipo, teste, lint) e controle pelo PowerShell, que não passa pelo hook — o
hook `rtk hook claude` só casa com o tool `Bash`.

| Comando | O que o rtk faz de fato | Mensagem | Exit |
| --- | --- | --- | --- |
| `rtk pnpm typecheck` | subcomando embutido: roda `npx tsc` **sem argumentos**, ignorando o script do `package.json` | `No errors found` — **falso** | 0 — **falso** |
| `rtk tsc --noEmit` / `npx tsc --noEmit` (reescrito) | idem: sem `-b`, o `tsconfig.json` raiz tem `"files": []` e nada é checado | `No errors found` — **falso** | 0 — **falso** |
| `rtk prettier --check` / `npx`/`pnpm exec prettier` (reescrito) | o filtro só lê stdout; o prettier escreve os `[warn]` no stderr | `All files formatted correctly` — **falso** | 1 — correto |
| `rtk vitest` / `pnpm exec vitest run` (reescrito) | parser falha (`All parsing tiers failed`), sobra só a linha do relatório JSON | sem conteúdo | correto |
| `rtk tsc -b`, `rtk lint`, `rtk pnpm lint`, `rtk pnpm build` | repassa ou filtra corretamente | correta | correto |
| `pnpm typecheck`, `pnpm build`, `pnpm test`, `pnpm validate` sem prefixo | o hook **não** reescreve | — | correto |

**Causa raiz da Fase 0:** os agentes seguiram a instrução global "sempre
prefixe com `rtk`" e rodaram `rtk pnpm typecheck` (confirmado nos
transcripts). Esse subcomando não é passthrough — troca `tsc -b --pretty
false` por `tsc`, que num tsconfig de referências checa zero arquivos. O exit
0 é do próprio `tsc`; o rtk só converte silêncio em afirmação. Onde aparecia
`| tail`, o pipe sem `pipefail` mascarava o exit code de qualquer jeito.

**Critérios de validação confiáveis:**

1. Verificação que decide verde/vermelho roda como **script do projeto sem
   prefixo** (`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`,
   `pnpm validate`). O hook não os toca.
2. Nunca `rtk pnpm <script>` para script com nome de subcomando do rtk
   (`typecheck`, `list`, `install`, `outdated`): o rtk executa a versão dele,
   não a do projeto.
3. O exit code é a fonte de verdade, nunca a frase-resumo. Ler com
   `cmd; echo "exit=$?"` — nunca atrás de `| tail`/`| head` sem
   `set -o pipefail`.
4. Toda verificação nova precisa ter sido vista falhando uma vez (sonda com
   erro proposital) antes de ter o verde aceito.
5. Quando a saída do rtk estiver vazia ou estranha, `rtk proxy <cmd>` dá a
   saída crua; o log completo de falhas fica em `~/AppData/Local/rtk/tee/`.

**Correção no ambiente (feita em 2026-10-26):**

- `%APPDATA%\rtk\config.toml`, `[hooks] exclude_commands`: a exclusão casa
  por **prefixo**, então cada forma de invocação tem entrada própria — `tsc`,
  `npx tsc`, `pnpm exec tsc`, `pnpm tsc`, `npm exec tsc`, e o mesmo para
  `prettier` e `vitest`. Conferido com `rtk rewrite`: os 15 prefixos passam
  crus; `eslint`, `git` e `pnpm list` continuam filtrados. Backup do config
  anterior ao lado, em `config.toml.bak-2026-10-26`.
- `~/CLAUDE.md` e `~/.claude/RTK.md` ganharam a exceção "comandos de
  verificação nunca passam pelo `rtk`", com os critérios acima. O exclude não
  cobre o `rtk pnpm typecheck` digitado explicitamente; quem cobre é essa
  regra. Atenção: o bloco do `~/CLAUDE.md` é gerado por `rtk init`, e rodar
  de novo pode sobrescrever a exceção.

**Upstream (`rtk-ai/rtk`), ainda abertos na v1.1.0:** #2809 (`rtk pnpm
typecheck` ignora o script) e #2878 (prettier só lê stdout, com a correção em
aberto no #3571). O caso do sucesso falso em tsconfig de referências não
estava relatado; o comentário para o #2809 está redigido e aguarda o
`gh auth login`.

**Quando revisitar:** ao atualizar o rtk, se #2809 e #2878 estiverem
fechados, testar de novo com sonda de erro antes de remover as exclusões.

## Ferramental — preview

### O preview não comprime (gzip) como o Pages

`vite-pages-preview.ts` serve sem compressão; o Cloudflare Pages comprime. As
medidas de `docs/gate-4/PERFORMANCE.md` foram feitas nas duas condições, mas o
e2e roda sem gzip.

- **Fazer:** se um teste passar a depender do tamanho no fio, comprimir no
  plugin ou medir com `npx wrangler pages dev dist`.
- **Quando:** só se isso aparecer; hoje nenhum teste depende.

## Decidido e recusado

Não são pendências: registram decisões do dono para que o tema não volte sem
uma ideia nova.

### A folha cobre o nome no meio do afastamento

Na abertura aprovada, a folha do índice sobe ao mesmo tempo que o nome se
afasta e o cobre antes de o movimento terminar. O dono notou e escolheu manter
assim por ora. Já foram testadas e recusadas duas alternativas (protótipo v5):
segurar o hero até o nome terminar e só então subir a folha, e manter o nome por
cima da folha até ela chegar ao topo. Se voltar ao tema, partir de outra ideia.

### Cursor de nanquim e gotas

Ideia do dono, vista em protótipo em 2026-10-27 e descartada por ele no mesmo
dia: cursor em forma de bolha de nanquim com brilho de esfera (virando mão e
barra de texto em tinta, com estado de carregamento próprio) e gotas que caíam
de tempos em tempos, deixando uma mancha que sumia depois de uns 5 s. Não
entrou nenhuma das duas partes. Se voltar ao tema, partir de outra ideia.

### Prévia que segue o cursor

A prévia com um círculo "View" que acompanha o cursor sobre a lista de
trabalhos (dennissnellenberg.com) foi vista no protótipo da segunda leva da
Fase 3 e não entrou.

### Preload das fontes

Testado na Fase 4 (Fraunces e Instrument Sans, no `<head>` das três páginas
medidas): o LCP das homes piorou de 156 a 444 ms, porque as fontes disputam a
banda com o CSS e o JS no começo. O LCP delas é um parágrafo que já pinta com
`font-display: swap`. Medidas em `docs/gate-4/PERFORMANCE.md`. Se voltar ao
tema, partir de outra ideia (por exemplo, um LCP que dependa da fonte).

### Fraunces com `wght` fixo em 600 (o dono pode rever)

Daria −71,3% no arquivo (34,7 kB em vez de 66,9 kB), mas muda o desenho dos
títulos (antialias) e as 24 capturas da regressão visual falham. A Fase 4
ficou com o `wght` inteiro (−44,7%, sem diferença visual). A decisão de aceitar
o visual novo e regravar as baselines é do dono (`docs/gate-4/README.md`).
