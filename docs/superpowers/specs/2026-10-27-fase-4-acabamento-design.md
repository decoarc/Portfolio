# Fase 4 — Acabamento

- **Data:** 2026-10-27
- **Status:** aguardando revisão do dono
- **Branch:** `fase-4-acabamento`
- **Depende de:** Fase 3 encerrada (`1320f8d`); spec mãe
  `docs/superpowers/specs/2026-10-26-portfolio-visual-redesign-design.md` §3
  (escopo), §6 (rotas e metadados), §7 (testes) e §8 (critérios)
- **Ponto de partida medido em 2026-10-27:** typecheck, lint, format, 201
  testes unitários, `build:preview` e 136 e2e verdes. JS 377 kB (119,7 kB
  gzip), CSS 28,3 kB (6,1 kB gzip), Fraunces latin 121 kB.

## 1. Intenção

Deixar o site pronto para publicar. A Fase 5 só troca o conteúdo mock pelo real
e coloca o site no ar. Tudo o que não depende de conteúdo real fecha aqui:
acessibilidade, metadados, 404, performance e testes.

O dono pediu que a fase comece direto pelo escopo da spec e que o Claude sugira
o que der acabamento melhor. Das sugestões, o dono aprovou explicitamente o
**prerender** (2026-10-27). As outras entram neste documento como propostas do
Claude (marcadas "decisão do Claude") e valem quando o dono aprovar o
documento.

## 2. Objetivos, não-objetivos, anti-objetivos

**Objetivos**

- Cada rota existe como HTML pronto no build, com conteúdo, `title`,
  `description`, `canonical`, `hreflang` e Open Graph no idioma da rota, sem
  depender de JS.
- O 404 responde com status 404 de verdade, no idioma do caminho.
- WCAG 2.2 AA verificado no site renderizado, nos dois idiomas, com cada
  correção presa por teste.
- Performance medida com o mesmo método do M5 e registrada, sem regressão de
  LCP e CLS sobre o M5.
- A suíte cobre a tabela da §7 da spec mãe, incluindo a regressão visual.
- Gate 4: critérios da §8 satisfeitos, exceto o 9.

**Não-objetivos**

- Trocar conteúdo mock, textos de `description` e Open Graph definitivos,
  miniaturas reais (Fase 5).
- Os quatro "endurecimentos do título que viaja" do backlog (ficam na Fase 5,
  junto da troca de conteúdo que pode expô-los).
- Escolher o domínio de produção (Fase 5; ver §4.1).
- Mudar a direção visual, o motion aprovado ou a sequência da home.
- SSR em servidor, Pages Functions ou qualquer runtime no Cloudflare: o site
  continua 100% estático.

**Anti-objetivos** (é falha mesmo que funcione)

- O nome piscar no hero: aparecer pronto no HTML e depois sumir para fazer a
  entrada.
- Erro ou aviso de hidratação no console em qualquer rota.
- Uma rota que existe no app sem HTML próprio (cai no 404 do Cloudflare) ou o
  inverso: HTML de projeto em `draft`.
- Tag de head duplicada depois de navegar no app (dois `description`, dois
  `canonical`).
- Correção de acessibilidade que muda o visual aprovado sem dizer qual
  propriedade e qual critério WCAG motivou.
- Teste visual que passa sempre (baseline regravada sem olhar).

## 3. Como o trabalho se divide

Seis frentes, nesta ordem, porque as de baixo dependem das de cima:

1. **Head por rota** (§4): um modelo único de metadados.
2. **Prerender** (§5): HTML de cada rota no build e servidor de preview que
   imita o Cloudflare Pages.
3. **Publicação** (§6): imagem Open Graph, ícones, `theme-color`, `_headers`.
4. **Acessibilidade** (§7): auditoria renderizada, `forced-colors`, reduced
   motion no meio da sessão.
5. **Performance** (§8): Fraunces mais leve, preload de fontes, medição.
6. **Testes e fechamento** (§9 e §10): regressão visual, `/about`, docs e
   Gate 4.

## 4. Head por rota

### 4.1 O modelo

Uma função pura, `routeHead(locale, path, content)` em `src/app/head.ts`,
devolve tudo o que vai no `<head>` de uma rota:

| Campo | Home | Case study | 404 |
| --- | --- | --- | --- |
| `title` | `site.meta.homeTitle` | `project.title + titleSuffix` | `notFound.title + titleSuffix` |
| `description` | `site.meta.description` (novo) | `project.summary` | `site.notFound.body` |
| `canonical` | URL absoluta da rota | idem | — |
| `alternates` | `en`, `pt-BR` e `x-default` (= EN) | idem, mesmo slug | — |
| `robots` | — | — | `noindex` |
| Open Graph | `og:type website` | `og:type article` | — |

Open Graph em toda rota indexável: `og:title`, `og:description`, `og:url`,
`og:site_name` (`person.name`), `og:locale` (`en_US` ou `pt_BR`),
`og:locale:alternate`, `og:image` (+ `width`, `height`, `alt`) e
`twitter:card = summary_large_image`.

Um case em `preview` (o Map Areas hoje) tem página e head completos, como os
publicados. Rascunho não tem rota.

**Origem absoluta.** `canonical`, `hreflang` e `og:url` exigem URL absoluta, e
o domínio ainda não existe. A origem vem de `VITE_SITE_ORIGIN` no build.
`build:preview` usa `http://127.0.0.1:4173` quando a variável falta. `build`
(produção) **falha** sem ela, com mensagem dizendo o que definir. A escolha do
domínio é da Fase 5.

**Conteúdo novo.** `site.meta.description` e `site.meta.ogImageAlt` nos dois
locales, marcados para revisão na Fase 5 (`description` e OG são calibrados
com o texto real, conforme o backlog). O teste de paridade cobre as chaves
novas sem mudança.

### 4.2 No app (navegação no cliente)

Hoje cada rota renderiza um `<title>` do React 19. Isso sai. Cada rota chama
`useRouteHead(head)`, que, num efeito, atualiza `document.title` e as tags do
head marcadas com `data-head` (criando ou removendo as que mudam de uma rota
para outra, como `robots` e `og:*`). Assim:

- o HTML do prerender e o head depois de navegar são produzidos pela mesma
  função;
- não há duplicata (anti-objetivo), porque as tags são atualizadas em vez de
  somadas;
- o React não precisa içar `<title>` no `renderToString`, comportamento que
  depende de renderizar o documento inteiro.

`document.documentElement.lang` continua no `LocaleLayout`.

## 5. Prerender

### 5.1 Como gera

Depois do `vite build` do cliente, um segundo `vite build --ssr` compila uma
entrada de servidor (`src/entry-server.tsx`) com os mesmos CSS Modules e
aliases. `scripts/prerender.ts` importa esse bundle e, para cada rota da
lista:

1. renderiza o app com o `StaticRouterProvider` do React Router
   (`createStaticHandler` sobre as mesmas `createRoutes()`), via
   `renderToString`;
2. calcula `routeHead` e escreve `lang`, o head e o HTML no `dist/index.html`
   do build do cliente, usado como molde;
3. grava o arquivo (§5.2).

**Lista de rotas:** a home e o 404 de cada locale, mais `/work/:slug` de todo
projeto com `caseStudyAccess !== 'none'` em cada locale. A lista sai do
conteúdo, não de uma lista à mão. O script **falha o build** quando:

- uma rota da lista renderiza o 404 no lugar do conteúdo;
- o HTML gerado não tem `<h1>` ou o head não tem `title` e `description`;
- sobra um projeto `published` ou `preview` sem arquivo.

No cliente, `main.tsx` usa `hydrateRoot` quando `#root` já tem filhos e
`createRoot` quando não (dev). O `index.html` molde deixa de ter `title` e
`description` fixos.

Sem dependência de runtime nova; `react-dom/server` já vem com o React.

### 5.2 Arquivos e o Cloudflare Pages

O Cloudflare Pages (documentação lida em 2026-10-27):

- serve `/contato` a partir de `contato.html` (sem extensão na URL) e
  `/pasta/` a partir de `pasta/index.html`;
- aplica as regras do `_redirects` **mesmo quando existe arquivo** que casa;
- sem `404.html` na raiz, trata o site como SPA e devolve `/` para tudo;
  com ele, usa o `404.html` mais próximo do caminho, subindo pastas, e
  responde 404.

Por isso:

| URL | Arquivo |
| --- | --- |
| `/` | `dist/index.html` |
| `/pt` | `dist/pt.html` |
| `/work/<slug>` | `dist/work/<slug>.html` |
| `/pt/work/<slug>` | `dist/pt/work/<slug>.html` |
| 404 em inglês (qualquer caminho fora de `/pt`) | `dist/404.html` |
| 404 em português (sob `/pt/`) | `dist/pt/404.html` |

- As URLs atuais, sem barra no fim, ficam como estão.
- O `public/_redirects` perde o `/* /index.html 200`. Como regra vence arquivo,
  ele mandaria tudo para a home. O arquivo passa a ter só redirecionamentos
  explícitos, se algum for necessário (por exemplo `/pt/` para `/pt`).
- **A verificar no primeiro passo da implementação:** que `/pt` é servido por
  `pt.html` mesmo com a pasta `dist/pt/` ao lado, e que `/pt/x` recebe
  `pt/404.html`. Fazer com `npx wrangler pages dev dist` (sem instalar
  dependência). Se o Pages se comportar diferente, a saída é
  `pt/index.html` com URL canônica `/pt/`, e esta seção é atualizada antes
  de seguir.

**Preview local.** O `vite-spa-fallback.ts` vira um plugin que imita essas
regras no `vite preview`: arquivo exato, depois `<caminho>.html`, depois
`<caminho>/index.html`, senão o `404.html` mais próximo com status 404. Ele
também aplica os cabeçalhos do `public/_headers` (§6), para o e2e pegar
violação de CSP antes da produção. O `vite` de dev continua com o fallback
SPA dele.

### 5.3 A entrada do nome sem piscar

Hoje o hero é montado pelo JS, e o `Opening` esconde o nome (`pending`) antes
da primeira pintura. Com o prerender, o HTML chega com o nome visível. Se o
JS esconder depois, o nome pisca (anti-objetivo).

**Decisão do Claude:** um script inline mínimo no `<head>` da home (só nas
duas homes) marca `<html data-entrance-early>` quando a página abre no topo,
sem hash e sem `prefers-reduced-motion: reduce`. O CSS do hero trata essa
marca como o `pending` atual. O `Opening` assume o controle ao montar
(passa para `pending`, `run`, `done` como hoje) e remove a marca. Se o JS
não chegar em 3 s, o próprio script inline remove a marca e o nome aparece
parado, sem entrada. Sem JS desde o início (script bloqueado), a marca nunca
é posta e o nome está no HTML. O hash desse script entra no CSP (§6).

Alternativa considerada e descartada: abrir mão da entrada quando o HTML
pinta antes do JS. Seria sempre, porque o HTML é o que pinta primeiro, e a
entrada é parte do Gate 3 aprovado.

### 5.4 Hidratação

O primeiro render no cliente precisa sair idêntico ao HTML. O código já foi
escrito para "sem JS é o estado estático" (Gate 2): `LitText` renderiza o
texto simples, o `Opening` só mexe no DOM em efeito. O que ler `window` ou
`matchMedia` durante o render quebra isso e precisa ir para efeito. Um e2e
(§9) falha com qualquer mensagem de hidratação no console, em todas as
rotas.

## 6. Publicação

**Decisões do Claude, sugeridas ao dono em 2026-10-27.**

- **Imagem Open Graph:** uma por locale, 1200 × 630, em
  `public/og/home-en.png` e `public/og/home-pt.png`, usada por todas as rotas
  do locale. É uma composição tipográfica com os tokens do site: o nome em
  Fraunces e a função, fundo da capa. Ela é gerada por captura Playwright de
  uma página-molde, que fica em `e2e/og.capture.ts`, e a imagem vai
  versionada. Revista na Fase 5 com o texto real.
- **Ícones:** `apple-touch-icon` 180 × 180 PNG, gerado do `favicon.svg`.
- **`theme-color`** com a cor da capa e **`color-scheme: light`**. O site não
  tem tema escuro, e isso evita que o navegador pinte controles nativos em
  escuro.
- **`public/_headers`:**
  - `/assets/*` com cache longo e `immutable` (os nomes têm hash);
  - HTML sem cache longo;
  - `Content-Security-Policy`:
    - `default-src 'self'`;
    - `script-src 'self' 'sha256-…'` (o script de §5.3, com hash calculado no
      build);
    - `style-src 'self' 'unsafe-inline'`, porque o motion escreve propriedades
      em `style`;
    - `img-src 'self' data:`, `font-src 'self'`;
    - `base-uri 'self'`, `form-action 'none'`, `frame-ancestors 'none'`;
  - `X-Content-Type-Options: nosniff`;
  - `Referrer-Policy: strict-origin-when-cross-origin`;
  - `Permissions-Policy` desligando câmera, microfone e geolocalização.

  O `_headers` é gerado no build (por causa do hash), não escrito à mão.

## 7. Acessibilidade — WCAG 2.2 AA

A afinação do M5 se perdeu na reescrita (spec mãe §2). A auditoria é refeita
no site renderizado, nos dois idiomas, em 320, 390, 768 e 1440. O método e o
formato seguem `docs/m5/M5_AUDIT_AND_PLAN.md`, e o resultado vai em
`docs/gate-4/A11Y_AUDIT.md`.

**O que a auditoria cobre**, além do axe que já roda:

| Critério | Como verificar |
| --- | --- |
| 1.4.4 e 1.4.10, texto a 200% e reflow | fonte raiz 32 px e viewport 320 px: sem scroll horizontal e sem texto cortado |
| 1.4.11, contraste não textual | foco, filetes que separam itens, placeholder da miniatura |
| 1.4.12, espaçamento de texto | bookmarklet de espaçamento WCAG aplicado por script: nada cortado |
| 1.4.13, conteúdo no hover | prévias e miniaturas: dispensáveis, persistentes, sem esconder o que se lê |
| 2.4.3 e 2.4.7, ordem e foco visível | Tab pela home e pelo case, nos dois idiomas |
| 2.4.11, foco não escondido | foco por teclado nunca fica coberto pelo masthead, pela folha da abertura ou pela View Transition |
| 2.5.8, tamanho do alvo | todo alvo com 24 × 24 px ou espaçamento equivalente |
| 3.1.1 e 3.1.2, idioma | `lang` da página e `lang` do seletor de idioma |
| 4.1.2, nome e papel | links externos com o aviso "abre em nova aba" lido |
| leitor de tela | NVDA no Windows, home e case, nos dois idiomas, só os pontos críticos: título, índice, lista de trabalhos, links externos |

**Itens já decididos para entrar:**

- **Alto contraste do Windows (`forced-colors: active`).** Sugestão do Claude.
  Playwright emula o modo. Foco, filetes, a borda da folha e o placeholder
  "sem captura" precisam continuar visíveis. Correções vão em
  `@media (forced-colors: active)` e não mudam o visual normal.
- **Reduced motion ligado no meio da sessão** (backlog): voltar/avançar no
  navegador não pode mostrar o fade padrão de 250 ms da View Transition
  quando `prefers-reduced-motion: reduce`. O CSS que zera a animação passa a
  valer também sob `reduce`.
- **Exceção que continua:** as palavras apagadas do texto que acende (aceita
  pelo dono em 2026-10-27), auditadas acesas como hoje.

Cada correção leva um teste e uma linha na auditoria: critério, antes, depois
e a propriedade alterada. Mudança visual além do mínimo vai para o dono antes
de entrar.

## 8. Performance

**Método:** o mesmo de `docs/m5/PERFORMANCE_NOTES.md`, com Playwright
Chromium, cache desligado, 150 ms de latência e 180 kB/s, 2,5 s após o
`load`. As rotas são `/` em 390 × 844, `/pt` em 1440 × 900 e
`/pt/work/map-areas` em 1440 × 900, medidas antes e depois de cada mudança
desta seção. O resultado vai em `docs/gate-4/PERFORMANCE.md`, com a mesma
ressalva do M5: número de laboratório, não Core Web Vitals de campo, e sem
INP.

**Orçamentos:** LCP ≤ 2,5 s e CLS ≤ 0,1 (arquitetura), em todas as três rotas.

**Mudanças:**

1. **Fraunces mais leve** (decisão do Claude). O site usa os eixos `wght`,
   `opsz` e `WONK` (os três cortes de `tokens.css`), e `SOFT` fica sempre em 0.
   Um arquivo latin próprio, com `SOFT` fixado em 0 e `wght` reduzido à faixa
   usada, é gerado com `fonttools varLib.instancer` e `pyftsubset` (ferramenta
   só de desenvolvimento; o comando fica num script em `scripts/` e o `.woff2`
   vai em `public/fonts/`). Os demais subsets continuam do fontsource.
   - **Entra só se** o latin cair pelo menos 30% e as capturas da regressão
     visual não mudarem. Senão, fica registrado e sai.
   - **Antes de gerar,** conferir a licença: se a OFL da Fraunces tiver Reserved
     Font Name, a fonte modificada precisa de outro nome de família.
2. **Preload** do latin da Fraunces e da Instrument Sans no head do HTML
   pré-renderizado, depois de medir. Se não melhorar o LCP, sai.
3. O JS fica como está (o motion é o custo aprovado). Uma divisão por rota só
   entra se o LCP do case passar do orçamento.

O prerender deve, por si só, adiantar o LCP: o texto pinta sem esperar o JS.
A medição confirma ou desmente.

## 9. Testes

A suíte já foi reescrita nas Fases 2 e 3. O que falta para fechar a tabela da
§7 da spec mãe, mais o que as frentes acima pedem:

| Nível | Novo |
| --- | --- |
| Unitário | `routeHead` (cada tipo de rota, nos dois locales, `x-default`, sem origem em produção falha); lista de rotas do prerender a partir do conteúdo; geração do `_headers` |
| Componente | `useRouteHead` atualiza sem duplicar ao trocar de rota |
| E2E | HTML cru de cada rota (via `request`, sem navegador) traz head e `h1` corretos; com JS desligado a home, o case e o 404 são legíveis e navegáveis; caminho inexistente responde 404 no idioma certo; nenhuma mensagem de hidratação no console; nenhuma violação de CSP; nome não pisca (o nome nunca é visível e depois invisível na entrada) |
| Acessibilidade | axe também em `forced-colors: active`; testes das correções de §7 |
| Regressão visual | novo projeto Playwright `visual`: hero, trabalhos, case e contato em 1440, 768 e 390, nos dois idiomas, com reduced motion (estado estático e determinístico), via `toHaveScreenshot` |

**Regressão visual.** A baseline é gerada no Windows do dono e versionada. O
render de fonte muda entre sistemas, por isso o teste só vale nesta máquina
(não há CI). `test:e2e` passa a rodar os projetos `chromium` e `visual`. A
troca de conteúdo da Fase 5 regrava a baseline, olhando as diferenças.

**Scripts:** `pnpm validate:preview` = typecheck, lint, `format:check`, test,
`build:preview`, `test:e2e`. É a verificação do Gate 4. O `validate` continua
como está e falha por desenho enquanto houver mock.

## 10. Fechamento

- **`/about` como página dedicada** (spec mãe §10). **Recomendação do
  Claude:** não promover. A seção da home é curta, o conteúdo dela é mock e
  uma página separada quebra a leitura de cima para baixo que a abertura
  constrói. A decisão é do dono e vai em `docs/DESIGN_DECISIONS.md`.
- **Docs.**
  - O `README.md` e os READMEs dos Gates 2 e 3 dizem que o critério 9 fecha na
    Fase 4. Corrigir para Fase 5.
  - O `docs/BACKLOG.md` perde os dois itens da Fase 4 (metadados e reduced
    motion no meio da sessão) e registra o que esta fase adiar.
  - O `docs/ARCHITECTURE.md` ganha o prerender: o que é gerado, onde e por quê.
- **`docs/gate-4/README.md`**: como avaliar (`pnpm build:preview && pnpm
  preview`), a tabela dos critérios da §8 com a evidência de cada um,
  auditoria, performance e a pendência do dono. A pendência é testar no
  celular real e, se quiser, o `wrangler pages dev`.

**Gate 4:** critérios 1 a 8 e 10 da §8 satisfeitos com evidência,
`pnpm validate:preview` verde e o dono aprova.

## 11. Riscos

| Risco | Mitigação |
| --- | --- |
| O Pages servir `/pt` diferente do esperado | Verificação com `wrangler pages dev` como primeiro passo de §5.2; plano B escrito |
| Hidratação divergir em rota pouco visitada | E2E de console em todas as rotas geradas |
| Nome piscar ou ficar escondido | Script inline com saída de 3 s; teste da sequência de visibilidade |
| CSP quebrar algo só em produção | Preview aplica o mesmo `_headers`; e2e de violação |
| Baseline visual frágil entre máquinas | Só local, documentado; Fase 5 regrava |
| Instância da Fraunces mudar o desenho | Critério de entrada: capturas visuais idênticas |
| Domínio indefinido | `VITE_SITE_ORIGIN` obrigatório só no `build` de produção |

## 12. O que fica para quem implementa

- Nomes de arquivos auxiliares, organização interna de `head.ts` e do
  `prerender.ts`.
- Composição exata da imagem Open Graph, dentro dos tokens e da tipografia
  do site. O dono vê a imagem no Gate 4.
- As correções pontuais que a auditoria encontrar, dentro da regra de §7.
