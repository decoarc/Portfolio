# Performance da Fase 4

Laboratório de 2026-10-27. São números de laboratório num servidor local,
**não** Core Web Vitals de campo do Cloudflare. INP não foi medido: não há nota
de INP para afirmar.

## Método

O de `docs/m5/PERFORMANCE_NOTES.md`, agora em `e2e/perf.capture.ts`
(projeto `capture`):

- Playwright Chromium, contexto novo por rota, cache desligado (CDP
  `Network.setCacheDisabled`).
- CDP `Network.emulateNetworkConditions`: latência 150 ms, descida
  180000 B/s, subida 80000 B/s.
- 2,5 s de espera depois do `load`.
- LCP: última entrada `largest-contentful-paint`, com o elemento. CLS: maior
  janela de sessão de `layout-shift` (sem entrada recente do usuário).
  Transferência: soma do `transferSize` do documento e de cada recurso.
- Rotas: `/` em 390 × 844, `/pt` em 1440 × 900, `/pt/work/map-areas` em
  1440 × 900.
- Cada medida é a **mediana de 3 rodadas**. Rodar:
  `PERF_JSON=<arquivo> npx playwright test --project=capture e2e/perf.capture.ts`
  com o preview no ar (`pnpm build:preview`, depois
  `pnpm preview --host 127.0.0.1 --port 4173`).

Orçamentos (arquitetura): LCP ≤ 2,5 s e CLS ≤ 0,1, nas três rotas.

### Ressalva: compressão do servidor de preview

O preview da Fase 4 (`vite-pages-preview.ts`, que imita as regras do Pages)
serve os arquivos **sem gzip**: o JS vai com 381,7 kB no fio, o CSS com
29,5 kB. O `vite preview` puro do commit `1320f8d` (e do M5) gzipa o texto
(JS 118,8 kB). O Cloudflare Pages comprime texto em produção. Por isso a
linha de base atual aparece duas vezes:

- **preview da Fase 4**: o servidor do e2e, como está;
- **com gzip**: o mesmo `dist/` servido por um servidor de rascunho (fora do
  repo) que só mapeia caminho → `.html` e gzipa texto, para comparar com o
  `1320f8d` na mesma condição.

Fontes e imagens já são comprimidas e não mudam entre os dois.

## Linha de base

Mediana de 3 rodadas (as três rodadas entre parênteses).

| Rota | Viewport | Medida | LCP | Elemento LCP | CLS | Transferência |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | 390×844 | M5 (2026-10-23, 1 rodada, outro design) | 1096 ms | parágrafo da bio | 0,0013 | 253 kB |
| `/` | 390×844 | antes do prerender (`1320f8d`, gzip) | 1156 ms (1188/1152/1156) | `p` “I build interfaces, APIs and automation…” | 0,0002 | 338,8 kB |
| `/` | 390×844 | Fase 4, preview da Fase 4 (sem gzip) | 748 ms (768/748/732) | mesmo `p` | 0,0002 | 640,1 kB |
| `/` | 390×844 | Fase 4, com gzip | 500 ms (508/480/500) | mesmo `p` | 0,0002 | 343,8 kB |
| `/pt` | 1440×900 | antes do prerender (`1320f8d`, gzip) | 1164 ms (1164/1152/1176) | `p` “Construo interfaces, APIs e automação…” | 0,0001 | 338,8 kB |
| `/pt` | 1440×900 | Fase 4, preview da Fase 4 (sem gzip) | 752 ms (756/752/748) | mesmo `p` | 0,0001 | 640,4 kB |
| `/pt` | 1440×900 | Fase 4, com gzip | 492 ms (512/492/484) | mesmo `p` | 0,0001 | 343,9 kB |
| `/work/map-areas` | 1280×900 | M5 (2026-10-23, 1 rodada, outro design) | 2272 ms | capa `img` | 0,0002 | 303 kB |
| `/pt/work/map-areas` | 1440×900 | antes do prerender (`1320f8d`, gzip) | 2716 ms (2716/2720/2708) | `img` `/images/projects/map-areas.webp` | 0,0002 | 404,5 kB |
| `/pt/work/map-areas` | 1440×900 | Fase 4, preview da Fase 4 (sem gzip) | 2340 ms (2352/2340/2336) | mesma `img` | 0,0002 | 697,8 kB |
| `/pt/work/map-areas` | 1440×900 | Fase 4, com gzip | 2308 ms (2316/2304/2308) | mesma `img` | 0,0002 | 408,4 kB |

O M5 é de outro design (Bricolage/Source Sans/Plex, JS de 106 kB) e de outro
viewport no case (1280 × 900); fica como referência, não como comparação
direta. O M5 não mediu `/pt`.

O prerender adiantou o LCP das homes: o parágrafo agora pinta com o HTML, sem
esperar o JS (1156 → 500 ms em `/`, 1164 → 492 ms em `/pt`, mesma condição de
gzip). No case, o LCP é a capa e caiu de 2716 para 2308 ms: antes do
prerender o `<img>` só era descoberto depois do JS; agora está no HTML.

### Transferência por recurso (linha de base)

| Recurso | `1320f8d` (gzip) | Fase 4, preview | Fase 4, gzip |
| --- | --- | --- | --- |
| HTML `/` | 0,9 kB | 16,2 kB | 4,2 kB |
| HTML `/pt/work/map-areas` | 0,9 kB | 8,2 kB | 3,1 kB |
| JS `index-*.js` | 118,8 kB | 381,7 kB | 120,3 kB |
| CSS `index-*.css` | 6,4 kB | 29,5 kB | 6,6 kB |
| Fraunces latin (`full`) | 121,3 kB | 121,3 kB | 121,3 kB |
| Instrument Sans latin | 30,4 kB | 30,4 kB | 30,4 kB |
| Geist Mono latin | 23,4 kB | 23,4 kB | 23,4 kB |
| `map-areas-800.webp` (homes) | 37,6 kB | 37,6 kB | 37,6 kB |
| `map-areas.webp` (case) | 103,2 kB | 103,2 kB | 103,2 kB |

A Fraunces latin é o maior arquivo depois do JS e é pedida em todas as rotas.

## Mudança 1: Fraunces latin instanciada — entra

Pesos e cortes medidos (todo elemento e pseudo-elemento com família Fraunces,
`GATE_ROUTES`, três viewports, com e sem reduced motion): `font-weight` só
600; `font-variation-settings` `"SOFT" 0, "WONK" 1, "opsz" 144`,
`"WONK" 1, "opsz" 72`, `"opsz" 48` e `normal` (opsz automático pelo
tamanho). `SOFT` sempre 0. Detalhe em `scripts/fonts/README.md`.

| Variante do latin | Tamanho | vs. fontsource (121 016 B) | Regressão visual (`threshold: 0`) |
| --- | --- | --- | --- |
| fontsource `full` (antes) | 121 016 B | — | baseline |
| `SOFT` 0, `wght` fixo em 600 (pedido no plano) | 34 688 B | −71,3% | **falha**: 24 de 24 capturas, 16 a 215 px diferentes |
| `SOFT` 0, `wght` 600 com UPM escalado para 16000 | 45 752 B | −62,2% | **falha**: 24 de 24 capturas |
| `SOFT` 0, `wght` restrito a 600–900 | 61 124 B | −49,5% | **falha**: 24 de 24 capturas |
| **`SOFT` 0, `wght` inteiro (adotada)** | **66 964 B** | **−44,7%** | **passa**: 252 de 252 no `pnpm test:e2e` |

O padrão do eixo `wght` no arquivo é 900. Fixar ou restringir o `wght`
recalcula os deltas e os arredonda para unidades inteiras, o que muda o
antialias dos títulos. `SOFT` 0 é o padrão do eixo: fixá-lo só descarta
deltas. Critério (≥ 30% menor e sem diferença visual) cumprido pela variante
adotada; o `wght` fica inteiro, ao contrário do que o plano previa.

No fio: 121,3 kB → 67,3 kB (−54,0 kB) em todas as rotas.

Medida depois da mudança (preview da Fase 4, sem gzip; mediana de 3):

| Rota | LCP | CLS | Transferência |
| --- | --- | --- | --- |
| `/` 390×844 | 756 ms (756/756/780) | 0,0002 | 586,0 kB |
| `/pt` 1440×900 | 748 ms (756/748/744) | 0,0001 | 586,4 kB |
| `/pt/work/map-areas` 1440×900 | 2344 ms (2356/2344/2316) | 0,0002 | 643,7 kB |

O LCP não muda (diferenças de ±8 ms, dentro do ruído entre rodadas): o
elemento LCP das homes é um parágrafo em Instrument Sans e o do case é a capa.

## Mudança 2: preload das fontes — sai

Teste: `<link rel="preload" as="font" type="font/woff2" crossorigin>` do latin
da Fraunces (`/fonts/fraunces-latin.woff2`) e do latin da Instrument Sans
(`/assets/instrument-sans-latin-wght-normal-<hash>.woff2`) no head das três
páginas medidas, logo depois do `viewport`. Critério: o LCP mediano melhora em
alguma rota sem piorar outra. Mediana de 3; "sem" é a Fraunces instanciada sem
preload.

| Rota | Sem preload | Fraunces + Instrument Sans | Só Instrument Sans | Sem preload, gzip | Fraunces + Instrument Sans, gzip |
| --- | --- | --- | --- | --- | --- |
| `/` 390×844 | 756 ms | 1200 ms (1280/1196/1200) | 912 ms (920/904/912) | 512 ms (500/512/784) | 664 ms (656/664/672) |
| `/pt` 1440×900 | 748 ms | 1188 ms (1188/1192/1176) | 908 ms (916/908/900) | 504 ms (496/504/552) | 668 ms (676/656/668) |
| `/pt/work/map-areas` 1440×900 | 2344 ms | 2388 ms (2388/2384/2400) | 2320 ms (2320/2320/2328) | 2232 ms (2228/2248/2232) | 2240 ms (2240/2228/2248) |

O preload piora as homes nas duas condições: as fontes passam a disputar a
banda de 180 kB/s com o CSS e o JS logo no começo, e o parágrafo LCP (que já
pinta com `font-display: swap`) pinta mais tarde. No case, o ganho de 24 ms
do preload só da Instrument Sans fica dentro do ruído e vem com +156 ms nas
homes. Nenhuma variante cumpre o critério. O preload não entrou no
`scripts/prerender.ts`: a medida foi feita injetando as tags no `dist/` de um
build, que foi refeito em seguida.

## Resultado final

Estado final: prerender (Fase 4) + Fraunces latin instanciada, sem preload.
Número de laboratório no preview local; não é Core Web Vitals de campo, e INP
não foi medido. Mediana de 3.

| Rota | Antes do prerender (`1320f8d`, gzip) | Linha de base da Fase 4 (gzip) | **Final (gzip)** | Linha de base (preview) | **Final (preview)** | CLS final | Orçamento |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` 390×844 | 1156 ms | 500 ms | **512 ms** | 748 ms | **756 ms** | 0,0002 | ok |
| `/pt` 1440×900 | 1164 ms | 492 ms | **504 ms** | 752 ms | **748 ms** | 0,0001 | ok |
| `/pt/work/map-areas` 1440×900 | 2716 ms | 2308 ms | **2232 ms** | 2340 ms | **2344 ms** | 0,0002 | ok |

Elementos LCP finais: o parágrafo de abertura (`p` “I build interfaces…” /
“Construo interfaces…”) nas homes e a capa `img`
`/images/projects/map-areas.webp` no case, os mesmos da linha de base.

| Transferência | Linha de base (preview) | Final (preview) | Linha de base (gzip) | Final (gzip) |
| --- | --- | --- | --- | --- |
| `/` | 640,1 kB | 586,0 kB | 343,8 kB | 289,7 kB |
| `/pt` | 640,4 kB | 586,4 kB | 343,9 kB | 289,9 kB |
| `/pt/work/map-areas` | 697,8 kB | 643,7 kB | 408,4 kB | 354,3 kB |

As três rotas ficam dentro do orçamento (LCP ≤ 2,5 s, CLS ≤ 0,1). O case é a
rota mais perto do limite: 2344 ms no preview sem gzip (156 ms de folga) e
2232 ms com gzip. O LCP dele é a capa de 103 kB disputando banda com o JS; se
a capa real da Fase 5 for maior, é aí que o orçamento aperta. A divisão do JS
por rota (design §8, item 3) não foi necessária.

Nas homes, as diferenças de até ±12 ms entre a linha de base e o final são
ruído entre rodadas: o LCP é texto em Instrument Sans, e a Fraunces não entra
nele. No case com gzip, o LCP caiu 76 ms (2308 → 2232 ms, as três rodadas
abaixo de todas as da linha de base): a capa disputa banda com 54 kB a menos
de fonte. Sem gzip, o JS de 381 kB domina a banda e a queda não aparece
(2340 → 2344 ms).
