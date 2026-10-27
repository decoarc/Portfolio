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
