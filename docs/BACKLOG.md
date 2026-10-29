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
  ficha. **Por quê adiado:** some com as capturas reais. **Resolvido** em
  2026-10-28: nenhuma ficha usa mais o placeholder.
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

Os mocks saíram em 2026-10-28: a Abordagem e o hero têm texto do dono, e os
três projetos inventados deram lugar ao Local Email Client (LEC, verificado,
publicado). A lista tem dois projetos: Map Areas e LEC. Nenhum item
`mock: true` restou.

### Cobertura que dependia dos projetos mock

Sem projeto conceitual, sem projeto sem links e, desde que o Map Areas foi
publicado (2026-10-28), sem projeto em preview, quatro caminhos perderam
cobertura com conteúdo real:

- **Aviso de conceito no case** (`conceptNotice`) e **ficha técnica sem a
  linha de links vazia**: o `CaseStudyRoute.test.tsx` só os exercitava pelo
  Token Killer.
- **Case em preview**: o aviso `previewNotice` acima do título (unitário,
  removido) e a volta sem viagem com foco no `h3` (`e2e/title-flight.spec.ts`,
  que se pula sem projeto em preview).
- **Título que viaja, volta com o cursor parado sobre outra ficha**
  (`e2e/title-flight.spec.ts`): o pouso põe a ficha no topo, e a única vizinha
  à vista seria a de baixo. Com o LEC na última posição o teste se pula.
- **Fazer:** cobrir conceito, links vazios e preview com conteúdo injetado
  (`vi.mock` do `content/index.ts`) se esses casos não voltarem no conteúdo.
  O do título que viaja volta sozinho quando entrar uma ficha depois do LEC.
- **Quando:** ao adicionar o próximo projeto.

### Senha no `geo-areas-php` — trava do deploy

O Map Areas linka `github.com/decoarc/geo-areas-php` desde 2026-10-28, por
decisão do dono, que corrige o upstream antes de publicar o portfólio. Hoje o
repo é público e ainda tem a mesma senha literal no `docker-compose.yml` e no
`README.md` (conferido sem expor o valor): o item 1 de
`docs/gate-e/UPSTREAM_BACKLOG.md` segue aberto.

- **Fazer (no upstream):** trocar a senha por variável, girar o valor onde ele
  tiver sido reusado (no Render, por exemplo) e avaliar o histórico. Os itens
  2 e 3 do mesmo backlog (endpoints de escrita, descrição do GitHub) valem a
  revisão na mesma passada.
- **Quando:** antes do primeiro deploy do portfólio. Não publicar o site com
  o item 1 aberto.

### Teste intermitente: Shift+Tab da abertura

`e2e/opening.spec.ts` › "Shift+Tab do índice para o CTA do hero traz o CTA à
vista" falhou no `HEAD` `004d028` (antes da troca de conteúdo) e em duas de
três rodadas depois, e passou na rodada final.

- **Fazer:** investigar com `superpowers:systematic-debugging`.
- **Quando:** antes de fechar a Fase 5.

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

### Publicação no GitHub Pages — rever ao migrar para domínio próprio

Subida provisória em `https://decoarc.github.io/Portfolio/` (workflow
`.github/workflows/pages.yml`, Source = GitHub Actions). Ela exige caminhos
com prefixo `/Portfolio/`, que não valem num domínio próprio na raiz.

- **Fazer, ao ter o domínio:**
  - Trocar `VITE_BASE_PATH` para `/` e `VITE_SITE_ORIGIN` para o domínio, no
    `pages.yml` (ou no painel do host, se a hospedagem mudar).
  - Remover o `base` provisório: confirmar que `/favicon.svg`, `/og/*` e
    `/images/*` voltam a resolver na raiz.
  - Decidir o host final: Cloudflare Pages (previsto no `docs/ARCHITECTURE.md`)
    ou VPS. Se for Cloudflare, o workflow do Pages sai.
- **Headers de segurança:** `dist/_headers` (CSP com hash do script de
  entrada, `X-Frame-Options`, etc.) é gerado pelo prerender, mas o GitHub Pages
  ignora esse arquivo. Hoje o site vai sem CSP e sem esses headers. Ao migrar,
  conferir se o host aplica o `_headers`; se não, configurar os headers no
  servidor (VPS: Nginx/Caddy).
- **`public/_redirects`:** regra `/pt/ → /pt` só para Cloudflare. No GitHub
  Pages não tem efeito: `/pt/` (com barra) dá 404, porque a rota é `pt.html` e
  não existe `pt/index.html`. Só `/pt` funciona.
- **Página 404:** o workflow não gera `404.html` próprio; o prerender grava o
  `404.html` (raiz e `pt/`), e é o que o GitHub Pages serve para caminhos
  inexistentes. Conferir o comportamento no host final.
- **Testes:** a suíte e2e (Playwright) ainda não rodou contra o build do
  GitHub Pages. Só foi feito um smoke test manual com o `dist` servido em
  `/Portfolio/`. Rodar `pnpm test:e2e` ao migrar (com `base` `/`) para
  confirmar que nada regrediu.
- **Quando:** antes de apontar o domínio próprio para o site.

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

### Miniaturas com mídia real (feito, 2026-10-28)

Os dois projetos têm captura. A do LEC vem de
`Local_Email_Client (LEC)/docs/screenshots/caixa-de-entrada.png` (um JPEG de
1024×609, perfil de exemplo, sem dados reais): a capa guarda a proporção
original, sem ampliar; a miniatura 800×600 é um recorte 4:3 ancorado à
esquerda, para manter a árvore de pastas. O 4:3 da miniatura ficou.

O placeholder "sem captura" saiu do site, mas segue no `ProjectThumb` e no
teste dele; o teste de quebra de linha em `e2e/hover.spec.ts` se pula enquanto
nenhuma ficha estiver sem captura.

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

Resolvido em 2026-10-28 por outro caminho: o dono tirou o hero preso (ele rola
no fluxo e só o nome se afasta), e a folha deixou de cobri-lo.

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
