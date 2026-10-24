# M5 performance notes

Lab date: 2026-10-23. These numbers are one localhost preview run. They are not Cloudflare field Core Web Vitals.

## Method

- Build: `pnpm build`, then `pnpm exec vite preview --host 127.0.0.1 --port 4173`.
- Renderer: Playwright Chromium, fresh context per route, cache disabled.
- Throttle (CDP `Network.emulateNetworkConditions`): latency 150 ms, download 180000 bytes/s, upload 80000 bytes/s. Same throttle as the audit lab.
- Wait after `load`: 2.5 s, so LCP and late layout shifts can settle.
- INP was not measured. Do not claim an INP score.

Budgets from the architecture notes: LCP ≤ 2.5 s, CLS ≤ 0.1.

## Results

| Route | Viewport | LCP | LCP element | CLS | Transfer total |
|-------|----------|-----|-------------|-----|----------------|
| `/` | 390×844 | 1096 ms | bio paragraph (“Software engineering for interfaces…”) | 0.0013 | 253 kB |
| `/work/map-areas` | 1280×900 | 2272 ms | cover `img` (`/images/projects/map-areas.webp`) | 0.0002 | 303 kB |

Transfer sizes are `transferSize` with cache disabled (bytes on the wire, including headers).

| Asset | Home | Case study |
|-------|------|------------|
| JS `index-Db6Gf6XI.js` | 106.0 kB | 106.0 kB |
| CSS `index-E5ml5yy0.css` | 8.1 kB | 8.1 kB |
| Bricolage Latin | 41.6 kB | 41.6 kB |
| Source Sans Latin | 29.2 kB | 29.2 kB |
| IBM Plex Mono Latin 400 | 15.0 kB | 15.0 kB |
| IBM Plex Mono Latin 500 | 15.2 kB | not requested in this run |
| `map-areas-800.webp` | 37.6 kB | — |
| `map-areas.webp` | — | 103.2 kB |

Build gzip, same bundle: JS 106.83 kB, CSS 7.85 kB. No new runtime dependency. `@axe-core/playwright` is dev-only.

## Against the audit baseline

| Route | Baseline LCP | This run | Baseline CLS | This run |
|-------|--------------|----------|--------------|----------|
| `/` 390×844 | 1088 ms, bio paragraph | 1096 ms, same paragraph | 0.0013 | 0.0013 |
| `/work/map-areas` 1280×900 | 2280 ms, cover `img` | 2272 ms, same cover | 0.0002 | 0.0002 |

The case-study LCP element is still the cover, and 2272 ms is under 2.5 s in this single lab run. No preload, image codec, or bundle visualizer was added.

JS, CSS, font, and image transfers match the previous lab (JS ~106 kB, CSS ~8 kB, Latin faces ~41 + 29 + 30 kB, cover 38 kB / 103 kB). The audit table’s “≈ 85 kB” for fonts was the three families without spelling out Plex 500; the file list in the audit body already summed those faces to about 100 kB. This run does not show a transfer regression.

## After the footer selector fix

`pnpm validate` on 2026-10-23 passed after `.footer :global(.meta)`. That rebuild gzip is JS 106.82 kB and CSS 7.85 kB. The throttled LCP/CLS lab above was taken before this color-only change. The footer credit is not an LCP element, so the lab was not repeated. Computed footer color is `#8b959e` on `#141b21`, 5.70:1. The six axe scans then reported zero serious or critical violations.

## Limits of what was tested

- Text zoom: root font 32 px and 64 px on the full Work, About, and Contact sections at 320, 390, 768, and 1280 CSS pixels. No horizontal overflow. Section headings stay below the sticky header. At 320 px and root 64 px the header is 390 px tall; that is the approved Task 5 wrap.
- Browser zoom: headless Chromium ignored Ctrl+= (`innerWidth` stayed 1280, `devicePixelRatio` 1, `visualViewport.scale` 1). Reflow was therefore tested as CSS viewports of 1280, 640, and 320 at root 16 px, which is the layout viewport Chrome uses at 100%, 200%, and 400% of a 1280 px window. No horizontal overflow on Work, About, or Contact. That pass is not Firefox text-only zoom. The root-font pass remains the 1.4.4 proxy.
- No physical phone. Sticky header and touch targets were not checked in the hand. INP was not measured. These figures are not a Cloudflare field score.
