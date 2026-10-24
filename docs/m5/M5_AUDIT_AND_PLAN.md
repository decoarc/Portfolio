# M5 — Responsive, Accessibility & Performance

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the approved homepage, case study, and 404 so primary flows meet WCAG 2.2 AA, survive 320–1440px and 200% text, and stay within the architecture performance budgets — without redesigning Ledger × Datum × Cut.

**Architecture:** Keep CSS Modules and the existing tokens. Fix the few AA failures in place (contrast, focus, document title, accessible name, text overflow). Lock each fix with a Playwright or Vitest assertion. Measure production preview again after the changes; do not invent field scores.

**Tech Stack:** Vite, React 19, TypeScript, CSS Modules, Playwright, Vitest. One new dev dependency is allowed: `@axe-core/playwright` (already scheduled in `docs/IMPLEMENTATION_PLAN.md` for M5). No GSAP, Lenis, WebGL, image pipeline, or visualizer plugin.

**Spec:** `docs/IMPLEMENTATION_PLAN.md` (M5), `docs/ARCHITECTURE.md` §§9–10, `docs/MOTION_SPEC.md` §11. This audit is the evidence those sections did not have yet.

## Global Constraints

- Do not modify the approved visual direction except where a task below names the exact property and the WCAG reason.
- At root `font-size: 16px`, hero computed sizes stay: 320px → `41.6px`, 390px → `58.5px`, 768px → `69.12px`, 1280px → `115.2px`. Header height stays `60px`.
- Do not add libraries beyond `@axe-core/playwright`.
- Do not change Map Areas `status`, `evidenceComplete`, or `hrefRepo`. They stay `preview`, `false`, and omitted.
- Do not edit the sibling `prototype/` or `geo-areas-php` repos.
- Do not push or deploy.
- Do not commit unless André asks.

---

## Audit Health Score

Lab date: 2026-10-23. Renderer: Playwright Chromium against `pnpm dev` (layout, focus, text zoom) and `pnpm preview` (transfer, CLS, LCP). No physical device. No custom drag surfaces, so touch gestures were not synthesized; hit areas are bounding boxes.

Source detector: `impeccable detect --json --no-advisory src` returned no primary findings. Rendered issues below were measured in the browser; the static scan does not see contrast, document titles, or text zoom.

| # | Dimension | Score | Key finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 2 | Preview label 2.61:1, charcoal focus ring 1.71:1, one document title for every route, hero plate removed from the accessibility tree |
| 2 | Performance | 3 | Throttled production lab: home LCP 1.1s / CLS 0.001, case-study LCP 2.3s / CLS 0.000 on the cover. JS gzip 107 kB. No image work required |
| 3 | Theming | 3 | Token system is real. `--color-focus` does not follow charcoal surfaces that are outside `[data-theme=field]` |
| 4 | Responsive Design | 2 | No horizontal scroll from 320 to 1440 at default text. At 200% text the surname is clipped and the header spills |
| 5 | Implementation Integrity | 4 | Ledger / Datum / Cut is coherent. Detector found no systemic drift |
| **Total** | | **14/20** | **Good — fix the weak dimensions before calling M5 done** |

## What already holds

- Landmarks: skip link, `header`, `nav`, `main#main`, `footer`. `lang="en"`. Heading order is h1 → h2 → h3 on the homepage and h1 → h2 on the case study.
- Primary controls use `min-height: 44px`. Nothing interactive measured under 24×24. Nav labels are narrower than 44px (`Work` ≈ 31×44). That meets WCAG 2.2 AA 2.5.8. Do not widen the header to chase 44px width.
- No horizontal overflow at 320, 390, 768, 1024, 1280, or 1440 on `/`, `/work/map-areas`, and `/work/does-not-exist` with default text. Header stays 60px and does not overflow.
- Glyphs of “André” and “Arcodaci” sit inside the viewport at 16px root on 320, 390, and 1280.
- Case-study pictures switch correctly: 390px loads `map-areas-800.webp` (800×600, 37 kB), 1280px loads `map-areas.webp` (1200×900, 100 kB). Both match the 4:3 width/height attributes.
- `prefers-reduced-motion: reduce` on the homepage: hero `animation-name: none`, opacity 1, transform none; first `MotionReveal` opacity 1; `scroll-behavior: auto`; `--motion-fast: 0ms`.
- Hash navigation to `/#work` keeps the work heading below the sticky header (`work.top` 97, header bottom 60). The next Tab stayed in the work section (Live demo); it did not jump back to the top.
- Map Areas remains preview. Homepage shows “Case study soon” and no case-study link. The case study has no Repository link. `getProjectHref` tests already lock this.
- Production build is one JS chunk: `339.59 kB` / gzip `106.74 kB`, CSS gzip `7.61 kB`. No GSAP. Browsers request only the Latin subsets (Bricolage 41 kB, Source Sans 29 kB, IBM Plex 400 + 500 ≈ 30 kB). Unused subsets are emitted to `dist/` and were not downloaded.

### Performance lab (do not treat as a field score)

One Playwright run of `pnpm preview` on `127.0.0.1:4173`. CDP throttle: latency 150ms, download 180000 bytes/s, upload 80000 bytes/s. Cache not warm.

| Route | Viewport | LCP | LCP element | CLS | Notable transfers |
|-------|----------|-----|-------------|-----|-------------------|
| `/` | 390×844 | 1088 ms | bio paragraph | 0.0013 | JS 106 kB, CSS 8 kB, three Latin fonts ≈ 85 kB, `map-areas-800.webp` 38 kB |
| `/work/map-areas` | 1280×900 | 2280 ms | cover `img` | 0.0002 | same JS/CSS, `map-areas.webp` 103 kB, Latin fonts |

Both runs are under the architecture budgets (LCP ≤ 2.5s, CLS ≤ 0.1) **in this localhost lab only**. The case-study number is close to the ceiling because the cover cannot start until React paints. Remeasure after M5 changes. A Cloudflare field number is out of scope (no deploy).

Text contrast that already passes AA and must not be lightened: ink on paper 15.07:1, muted on paper 8.18:1, subtle on paper 4.55:1, field-muted on field 5.70:1, mobile hero role (78% field-ink) 8.86:1.

---

## Findings

### P1 — Fix in M5

**1. “Project preview” fails text contrast**

- **Location:** `src/styles/tokens.css` `--color-mark: #b8860b`; used only by `src/pages/CaseStudyPage/CaseStudyPage.module.css` `.previewLead`
- **Evidence:** computed color `rgb(184, 134, 11)` at `13px` on paper `#e4e7e2`. Ratio **2.61:1**. AA needs 4.5:1 for this size.
- **WCAG:** 1.4.3 Contrast (Minimum), AA
- **Impact:** the preview status, the only cue that this case study is not a finished publication, is hard to read.
- **Fix:** darken the same gold. `#7c5a08` is **5.06:1** on `#e4e7e2` and is not used anywhere else, so the rest of the palette stays. Do not introduce a second accent hue.

**2. Focus ring disappears on charcoal surfaces that are not `data-theme="field"`**

- **Location:** `src/styles/global.css` `:focus-visible` uses `--color-focus` (`#1a4560`). Footer in `src/components/AppShell/AppShell.module.css` and the mobile hero CTAs in `src/sections/Hero/Hero.module.css` sit on `#141b21` without `[data-theme=field]`.
- **Evidence:** footer GitHub link outline `rgb(26, 69, 96)` on footer background `rgb(20, 27, 33)`. Ratio **1.71:1**. The same outline is on the mobile hero CTAs, whose ring (outline-offset 3px) sits on the charcoal copy panel. Contact is fine: `[data-theme=field]` sets `--color-focus` to `#7eb6d6` (7.90:1). Desktop hero CTAs sit on paper and pass.
- **WCAG:** 1.4.11 Non-text Contrast, 2.4.7 Focus Visible, AA
- **Impact:** keyboard users lose the focus indicator on the footer and on the mobile hero actions.
- **Fix:** do not put `data-theme="field"` on the hero. That token set recolors `--color-ink` and would change the desktop column. Override outline and the focus shadow only on `.footer :focus-visible` and on the hero CTAs below `48rem`, using `--color-field-ink`.

**3. Every route shares one document title**

- **Location:** `index.html` title; no `document.title` update in `src/`
- **Evidence:** `/`, `/work/map-areas`, and `/work/does-not-exist` all report `André Arcodaci — Portfolio`.
- **WCAG:** 2.4.2 Page Titled, A
- **Impact:** screen-reader and browser UI cannot tell the case study or the 404 from the homepage.
- **Fix:** set the title from the route. Home keeps the current string. Case study: `Map Areas — André Arcodaci`. 404: `Page not found — André Arcodaci`. This does not change the visible layout. Do not steal focus from `ScrollAndFocus`.

**4. Hero plate is removed from the accessibility tree**

- **Location:** `src/sections/Hero/Hero.tsx` line 48, `aria-hidden="true"` on `<aside class="plate">`
- **Evidence:** with reduced motion, `aside` `aria-hidden` is `true`. The plate is the only place that shows “Focus”, “Interfaces”, “APIs & automation”, “Developer tools”, and “BR · Web” together. Location is repeated later in Contact; the focus list is not.
- **WCAG:** 1.3.1 Info and Relationships, A
- **Impact:** screen-reader users never hear the hero’s secondary message.
- **Fix:** remove `aria-hidden` from the `aside`. Keep it on the decorative field and on `.plateIndex`. Hide the repeated “AA” sigil with `aria-hidden` if it duplicates the header mark. No visual change.

**5. 200% text clips the surname and spills the header**

- **Location:** `src/sections/Hero/Hero.module.css` (`.name` clamps and `.hero { overflow: clip }`); `src/components/AppShell/AppShell.module.css` (`.header { height: var(--header-height) }`)
- **Evidence:** Playwright, root `font-size: 32px` (proxy for 200% text). Glyph ranges via `Range.getBoundingClientRect()`:

  | Root | Viewport | “Arcodaci” right | Client width | scrollWidth |
  |------|----------|------------------|--------------|-------------|
  | 16px | 320 | 168 | 320 | 320 |
  | 16px | 390 | 248 | 390 | 390 |
  | 16px | 1280 | 1224 | 1280 | 1280 |
  | 32px | 320 | 365 | 320 | 400 |
  | 32px | 390 | 446 | 390 | 400 |
  | 32px | 1280 | 1555 | 1280 | 1280 |

  At 32px the surname is laid out past the viewport. `overflow: clip` on `.hero` means scrolling does not reveal it (at 1280, `scrollWidth` stays 1280). Header at 390/32px: used height 120px, `scrollHeight` 150px; “Work” top −27px; “Contact” bottom 149px, so it overlaps the hero. At 16px the header is one 60px row on every width tested, including 320.
- **WCAG:** 1.4.4 Resize Text, AA
- **Cause:** `rem` inside `clamp()` becomes the winner when the root font doubles, while `vw` stays put. Media-query `rem` does **not** follow the root font, so the desktop composition stays in place and the type outgrows the column.
- **Fix:** lower only the `rem` floor of each hero `clamp` so the `vw` term still wins at 32px, and so the 16px computed size is unchanged. Let the header grow with `min-height` instead of a fixed `height`. See Task 5 for the exact replacements.

### P2 — Fix in the same milestone, after the P1s

**6. Cover description is announced twice**

- **Location:** `src/pages/CaseStudyPage/CaseStudyPage.tsx` — `alt` and `figcaption` are both `project.coverImage.alt`
- **WCAG:** 1.1.1 Non-text Content, A (redundant description)
- **Fix:** `alt=""` on that image so the visible caption is the accessible name. Do not remove the caption. Gallery images, if any are added later, need the same rule only when a caption repeats the alt.

**7. Contact channel name is “GitHubExternal”**

- **Location:** `src/sections/Contact/Contact.tsx` — adjacent spans with no text node between “GitHub” and “External”
- **Evidence:** focused name in the accessibility tree was `GitHubExternal`.
- **WCAG:** 2.5.3 Label in Name, A
- **Fix:** put the hint in content (`site` copy) and separate it in the accessible name (`GitHub, external`). Keep the visible “External” label. Move the hardcoded English string out of the component.

**8. Back to Work does not move focus to the section**

- **Location:** `src/app/ScrollAndFocus.tsx` — when `hash` is present the effect scrolls and returns before focusing `main` or the target
- **Evidence:** after “Back to selected work”, `activeElement` is `body`, `scrollY` 745, work heading visible. Tab then focused “Live demo” at `scrollY` 828. Focus is not lost to the header, and the heading is not covered. Screen-reader users are not taken to the heading.
- **WCAG:** 2.4.3 Focus Order, A (partial)
- **Fix:** after scrolling to the hash target, `focus({ preventScroll: true })` on that element (`tabIndex={-1}` if it is not focusable). Do this only for hash navigations. Keep the existing `main` focus for navigations without a hash.

**9. Universal `0.01ms` motion kill is redundant**

- **Location:** `src/styles/global.css` lines 31–38
- **Evidence:** hero and reveal motion are already inside `@media (prefers-reduced-motion: no-preference)`. Tokens already set durations to `0ms` under `reduce`. The reduced-motion path already shows the content. The universal kill is the pattern that also flattens any future transition that is not a token.
- **Fix:** delete the universal `animation-duration` / `transition-duration` block. Keep `scroll-behavior: auto` and the token zeros. Add the regression test in Task 8 before deleting it.

**10. `will-change` sits on every reveal until it enters**

- **Location:** `src/motion/MotionReveal.module.css` line 22
- **Fix:** remove `will-change`. The transition already lists `opacity` and `transform`. Do not add it elsewhere.

### P3 — Record, do not redesign

- Nav hit width under 44px with height 44px. AA 2.5.8 passes. Leave the header metrics alone at 16px.
- Skip link focused box is about 124×38. Height is above 24px. Leave it unless a focus-style edit in Task 3 happens to touch it.
- `dist/` contains Cyrillic, Greek, Vietnamese, and `.woff` fallbacks. The browser did not download them (`unicode-range`). Do not add a font tool. Do not hand-copy `@font-face` rules.
- `docs/MOTION_SPEC.md` says the reveal fallback is 2.5s. `useInViewOnce` uses `1200`. Update the spec sentence to 1200ms. Do not slow the fallback.
- No `fetchpriority` on the case-study cover. Add `fetchpriority="high"` on that one image (Task 9). Do not preload it from `index.html` — that would tax the homepage, whose LCP is text.
- No AVIF, no `rollup-plugin-visualizer`, no route-split. The 100 kB cover and 107 kB gzip JS do not justify a new pipeline. Case-study LCP is JS-gated; splitting the page component off React and React Router saves little.
- `--color-ink-subtle` passes AA by 0.05 (4.55:1). Do not lighten it.

### Footer credit contrast — closed 2026-10-23

`p.meta` was `#5f686f` on `#141b21` (3.05:1) because CSS Modules hashed `.footer .meta` and the element uses the global class `meta`. The approved fix is `.footer :global(.meta)` with `color: var(--color-field-muted)` unchanged. Computed color is now `rgb(139, 149, 158)` (`#8b959e`) on `rgb(20, 27, 33)`, **5.70:1** at 12px, on `/`, `/work/map-areas`, and `/work/does-not-exist`. The six settled axe scans report zero `serious` or `critical` violations.

Section indexes that failed mid-reveal (About “03”, Contact “04”, Work “02”) pass once opacity is 1. The axe scans run under `prefers-reduced-motion: reduce` so they read the settled color. `--color-ink-subtle` on paper stays 4.55:1. Do not darken it for a transition frame.

### Recorded, not implemented

These do not block the technical close. Do not treat them as a license to restyle before the visual review.

- Footer social links still announce “GitHub” and “LinkedIn”. The “, External” name is on the Contact channels, which are the links that show the hint.
- Headless Chromium ignored Ctrl+= (`innerWidth` 1280, `devicePixelRatio` 1, `visualViewport.scale` 1). Reflow was tested as CSS viewports 1280, 640, and 320 at root 16px. That matches Chrome’s layout viewport at 100%, 200%, and 400% of a 1280px window. It is not Firefox text-only zoom. Root font 32px and 64px remains the 1.4.4 proxy.
- At 320px and root 16px the header wraps to 113px. At root 64px on 320px it is 390px tall. Both were accepted in the Task 5 review. The display name stays at the 16px pixel size when the root font grows.
- No physical phone. INP was not measured. The LCP/CLS numbers are one localhost preview run, not a Cloudflare field score.
- Map Areas stays `preview`, `evidenceComplete: false`, without `hrefRepo`. Publishing it is out of M5.

### Regressions to protect

These already work and M5 must not break them:

- Homepage does not link to `/work/map-areas`. “Case study soon” stays. No “Repository” link. `status: 'preview'`, `evidenceComplete: false`, `hrefRepo` omitted in `src/content/en/projects/map-areas.ts`.
- Direct URL and reload of `/work/map-areas` still render the preview. Unknown slugs still render the in-app 404.
- External links keep `rel="noopener noreferrer"`.
- `ScrollAndFocus` still moves focus to `main` on push navigations that have no hash.
- Reduced motion still shows the hero and the work section immediately.
- Gate B hero composition at 16px root is unchanged (font-size baselines above).

---

## Implementation plan

### Task 1: Document titles

**Files:**

- Create: `src/app/useDocumentTitle.ts`
- Modify: `src/pages/HomePage/HomePage.tsx`
- Modify: `src/pages/CaseStudyPage/CaseStudyPage.tsx`
- Modify: `src/pages/NotFoundPage/NotFoundPage.tsx`
- Test: `e2e/a11y.spec.ts`

**Interfaces:**

- Produces: `useDocumentTitle(title: string): void` — sets `document.title` on mount and when `title` changes. Does not focus anything.

- [x] **Step 1: Write the failing Playwright test**

```ts
test('routes expose distinct titles', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('André Arcodaci — Portfolio')
  await page.goto('/work/map-areas')
  await expect(page).toHaveTitle('Map Areas — André Arcodaci')
  await page.goto('/work/does-not-exist')
  await expect(page).toHaveTitle('Page not found — André Arcodaci')
})
```

- [x] **Step 2: Run `pnpm exec playwright test e2e/a11y.spec.ts --grep "distinct titles"` and confirm it fails**

- [x] **Step 3: Implement the hook and call it from the three pages**

Home passes the existing `index.html` title through the hook so client navigations back to `/` restore it. Case study uses `` `${project.title} — ${site.person.name}` ``. Not-found uses `` `${site.notFound.title} — ${site.person.name}` ``.

- [x] **Step 4: Re-run the test and confirm it passes**

### Task 2: Preview label contrast

**Files:**

- Modify: `src/styles/tokens.css` (`--color-mark` only)
- Test: `e2e/a11y.spec.ts`

**Interfaces:**

- Consumes: nothing from Task 1
- Produces: `--color-mark: #7c5a08`

- [x] **Step 1: Failing test** — on `/work/map-areas`, read computed color of the preview lead and assert contrast against `#e4e7e2` is ≥ 4.5. Use the WCAG relative-luminance function in the test file (same formula as the audit). Also assert the color is not `#b8860b`.

- [x] **Step 2: Run it and confirm failure at 2.61**

- [x] **Step 3: Set `--color-mark: #7c5a08`**

- [x] **Step 4: Re-run and confirm ≥ 4.5**

### Task 3: Focus ring on charcoal

**Files:**

- Modify: `src/components/AppShell/AppShell.module.css`
- Modify: `src/sections/Hero/Hero.module.css`
- Test: `e2e/a11y.spec.ts`

**Interfaces:**

- Produces: footer and mobile-hero focus outlines use `var(--color-field-ink)` and a matching `box-shadow`, with specificity above the global `:focus-visible`.

- [x] **Step 1: Failing test** at 390×844. Focus `footer a` and the “Selected work” hero link. Parse `outlineColor` and the background behind the ring (footer element background; hero `.copy` background). Assert contrast ≥ 3.

- [x] **Step 2: Confirm the footer ratio is about 1.71**

- [x] **Step 3: Add the overrides**

```css
/* AppShell.module.css */
.footer :focus-visible {
  outline-color: var(--color-field-ink);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-field-ink) 45%, transparent);
}
```

```css
/* Hero.module.css, inside the base (mobile) rules */
.ctaPrimary:focus-visible,
.ctaSecondary:focus-visible {
  outline-color: var(--color-field-ink);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-field-ink) 45%, transparent);
}
```

Inside the existing `@media (min-width: 48rem)` block, reset those two CTAs to `outline-color: var(--color-focus)` and `box-shadow: var(--shadow-focus)` so the desktop paper column keeps the ink-blue ring.

- [x] **Step 4: Re-run. Footer passes at 390 and 1280. Hero CTA passes at 390. Desktop hero CTA (1280) still uses `rgb(26, 69, 96)` on paper.**

### Task 4: Hero plate in the accessibility tree

**Files:**

- Modify: `src/sections/Hero/Hero.tsx`
- Test: `e2e/a11y.spec.ts`

**Interfaces:**

- Consumes: nothing
- Produces: the focus list is exposed as list items. The decorative field and plate index stay `aria-hidden`.

- [x] **Step 1: Failing test**

```ts
await page.goto('/')
await expect(page.getByRole('listitem', { name: 'Interfaces' })).toBeVisible()
await expect(page.getByText('APIs & automation')).toBeVisible()
```

`getByRole` skips `aria-hidden` ancestors, so this fails today.

- [x] **Step 2: Confirm failure**

- [x] **Step 3: Remove `aria-hidden` from the `<aside>`. Add `aria-hidden` to `.plateSigil` only.**

- [x] **Step 4: Confirm the list item is visible to the role query, and the page still has one h1 named André Arcodaci**

### Task 5: 200% text without clipping

**Files:**

- Modify: `src/sections/Hero/Hero.module.css`
- Modify: `src/components/AppShell/AppShell.module.css`
- Test: `e2e/responsive.spec.ts`

**Interfaces:**

- Consumes: the 16px baselines in this document
- Produces: a homepage whose glyph boxes and header links stay inside the viewport at root 32px, and whose 16px hero type is unchanged

- [x] **Step 1: Failing tests**

Default root, assert computed `h1` font-size:

- 320 → `41.6px`
- 390 → `58.5px`
- 768 → `69.12px`
- 1280 → `115.2px`

And header height `60` at 320 and 390.

Then set `document.documentElement.style.fontSize = '32px'` and assert, at 320, 390, and 1280:

- `Range` bounds of both `h1 span`s have `left >= -1` and `right <= clientWidth + 1`
- `scrollWidth <= clientWidth + 1`
- every `header a` box is inside the header box (`top >= header.top - 1` and `bottom <= header.bottom + 1`)

- [x] **Step 2: Confirm 32px fails and 16px baselines pass before any CSS edit**

- [x] **Step 3: Lower only the rem floors, and let the header grow**

Hero `.name` font-size:

| Rule | Replace | With |
|------|---------|------|
| base | `clamp(3.25rem, 15vw, 4.25rem)` | `clamp(1.75rem, 15vw, 4.25rem)` |
| `max-width: 22.5rem` | `clamp(2.6rem, 13vw, 3.25rem)` | `clamp(1.25rem, 13vw, 3.25rem)` |
| `min-width: 48rem` | `clamp(3.75rem, 9vw, 6.5rem)` | `clamp(2rem, 9vw, 6.5rem)` |
| `min-width: 64rem` | `clamp(5rem, 8.5vw, 8.75rem)` | `clamp(2.5rem, 8.5vw, 8.75rem)` |
| `min-width: 80rem` | `clamp(6rem, 9vw, 9.5rem)` | `clamp(3.5rem, 9vw, 9.5rem)` |

Header:

```css
.header {
  height: auto;
  min-height: var(--header-height);
}
.headerInner {
  flex-wrap: wrap;
  height: auto;
  min-height: var(--header-height);
}
```

If `scrollWidth` still fails, apply the same floor-lowering to the next display clamp the test identifies (likely `Contact.module.css` `.title`). Do not change a clamp whose 16px computed size would move.

- [x] **Step 4: 16px baselines still match. 32px glyph and header assertions pass. `pnpm test` still passes.**

### Task 6: Cover name and contact name

**Files:**

- Modify: `src/pages/CaseStudyPage/CaseStudyPage.tsx` (cover `img` `alt=""`)
- Modify: `src/content/types.ts` and `src/content/en/site.ts` if `contact` needs an `externalHint` string
- Modify: `src/sections/Contact/Contact.tsx`
- Test: `e2e/a11y.spec.ts`

**Interfaces:**

- Produces: `site.contact.externalHint: 'External'`
- Accessible name for a channel: `` `${item.label}, ${externalHint}` `` via `aria-label`, while the visible hint text stays `externalHint`.

- [x] **Step 1: Failing tests**

```ts
await expect(page.getByRole('img', { name: 'Map Areas interface — sidebar controls beside a Leaflet map of São Paulo' })).toHaveCount(0)
await expect(page.getByText('Map Areas interface — sidebar controls beside a Leaflet map of São Paulo')).toBeVisible()
await expect(page.getByRole('link', { name: 'GitHub, external' })).toBeVisible()
```

The caption text stays visible. The image is not a second named image.

- [x] **Step 2: Confirm failure (`GitHubExternal`, and the img still has the alt)**

- [x] **Step 3: Implement `alt=""` and the content-driven channel label**

- [x] **Step 4: Re-run. Homepage live-demo link and case-study live-demo link still have accessible names.**

### Task 7: Hash target receives focus

**Files:**

- Modify: `src/app/ScrollAndFocus.tsx`
- Test: `e2e/a11y.spec.ts`

**Interfaces:**

- Consumes: existing `usePrefersReducedMotion` behavior (`auto` vs `smooth`)
- Produces: hash targets are focused after `scrollIntoView`, with `preventScroll: true`

- [x] **Step 1: Failing test** — from `/work/map-areas`, activate “Back to selected work”. Expect `document.activeElement` to be `#work` or inside `#work`, and `#work`’s top to be ≥ the header bottom.

- [x] **Step 2: Confirm focus is `body` today**

- [x] **Step 3: In the hash branch, after `scrollIntoView`, set `tabIndex="-1"` when missing and `target.focus({ preventScroll: true })`. Do not `return` before that. Keep the no-hash path focusing `#main`.**

- [x] **Step 4: Re-run. A push to `/work/map-areas` still focuses `#main`.**

### Task 8: Reduced-motion regression and the redundant kill switch

**Files:**

- Modify: `src/styles/global.css`
- Modify: `src/motion/MotionReveal.module.css`
- Modify: `docs/MOTION_SPEC.md` (fallback sentence `2.5s` → `1200ms` only)
- Test: `e2e/motion.spec.ts`

**Interfaces:**

- Consumes: `usePrefersReducedMotion` and the existing `no-preference` gates
- Produces: no universal `0.01ms` duration override; no `will-change` on `.reveal`

- [x] **Step 1: Failing-if-regressed test, in a context with `reducedMotion: 'reduce'`**

```ts
await page.goto('/')
const hero = page.locator('h1 span').first()
await expect(hero).toBeVisible()
await expect(hero).toHaveCSS('opacity', '1')
await expect(hero).toHaveCSS('animation-name', 'none')
await expect(page.getByRole('heading', { name: 'Selected work' })).toBeVisible()
await expect(page.locator('#work')).toHaveCSS('opacity', '1')
```

Also assert `getComputedStyle(document.documentElement).scrollBehavior === 'auto'`.

- [x] **Step 2: Run it before the CSS deletion. It should already pass. If it fails, stop and fix the gate; do not delete the kill switch.**

- [x] **Step 3: Remove the universal duration block. Keep the `scroll-behavior: auto` rule. Remove `will-change` from `.reveal`. Correct the 2.5s sentence in `MOTION_SPEC.md`.**

- [x] **Step 4: Re-run the reduced-motion test and `pnpm test`.**

### Task 9: Case-study cover priority

**Files:**

- Modify: `src/pages/CaseStudyPage/CaseStudyPage.tsx` — `fetchPriority="high"` on the cover `img` only
- Do not add it to Work thumbnails (they stay `loading="lazy"`).

**Interfaces:**

- Consumes: the cover `img` from Task 6 (`alt=""`)
- Produces: `fetchPriority="high"` plus the existing `width`, `height`, and `decoding="async"`

- [x] **Step 1: Assert the case-study cover has `fetchpriority="high"` and the work thumbnail has `loading="lazy"`**

- [x] **Step 2: Confirm the attribute is absent**

- [x] **Step 3: Add the attribute**

- [x] **Step 4: Re-run. Image `currentSrc` is still `map-areas-800.webp` at 390 and `map-areas.webp` at 1280.**

### Task 10: axe on primary flows, plus publication guards

**Files:**

- Modify: `package.json` / lockfile — devDependency `@axe-core/playwright` only
- Modify: `README.md` stack table — one row for that package, milestone M5, reason “WCAG smoke on primary routes”
- Modify: `e2e/a11y.spec.ts`
- Do not retitle the README milestone list in this task.

**Interfaces:**

- Consumes: pages after Tasks 1–9
- Produces: `pnpm test:e2e` fails on any axe violation of impact `serious` or `critical` on `/`, `/work/map-areas`, and `/work/does-not-exist` at 390 and 1280

- [x] **Step 1: Install `@axe-core/playwright` with pnpm. No other packages.**

- [x] **Step 2: Add the scan**

```ts
import AxeBuilder from '@axe-core/playwright'

for (const path of ['/', '/work/map-areas', '/work/does-not-exist']) {
  test(`no serious axe violations on ${path}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto(path)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze()
    const blocking = results.violations.filter((v) =>
      v.impact === 'serious' || v.impact === 'critical',
    )
    expect(blocking).toEqual([])
  })
}
```

Repeat the three routes at 1280×900, or parameterize the viewport. Also assert, on `/`:

- `getByRole('link', { name: 'Case study' })` count is 0
- “Case study soon” is visible

And on `/work/map-areas`:

- “Project preview” is visible
- `getByRole('link', { name: 'Repository' })` count is 0
- live demo href is `https://geo-areas-php.onrender.com/`

- [x] **Step 3: Run `pnpm exec playwright test e2e/a11y.spec.ts`. Fix only violations caused by M5 or already listed in this audit. If axe reports a new serious issue, add it to the known-issues section with the rule id instead of restyling the page.**

- [x] **Step 4: `pnpm validate` passes.** `src/content/en/projects/map-areas.ts` still has `status: 'preview'`, `evidenceComplete: false`, and no `hrefRepo`.**

### Task 11: Write the measured notes

**Files:**

- Create: `docs/m5/PERFORMANCE_NOTES.md`
- Modify: `docs/m5/M5_AUDIT_AND_PLAN.md` — check off completed tasks only; do not delete the audit evidence

**Interfaces:**

- Consumes: a fresh `pnpm preview` run with the same throttle as this audit
- Produces: a note that states method, viewport, LCP element, LCP ms, CLS, and transfer totals for `/` and `/work/map-areas`. It states that these are not Cloudflare field numbers. It lists any axe or text-zoom item still open.

- [x] **Step 1: Re-run the throttled preview measurement after Tasks 1–10**

- [x] **Step 2: Write `docs/m5/PERFORMANCE_NOTES.md` with the new numbers next to the budgets (LCP ≤ 2.5s, CLS ≤ 0.1, INP not claimed)**

- [x] **Step 3: If case-study LCP is still the cover and still under 2.5s in that single lab run, say so and stop. Do not add a preload, an image codec, or a bundle visualizer to chase a number this lab already meets.**

---

## Acceptance criteria

M5 is done when all of these are true:

- [x] `pnpm validate` passes (typecheck, lint, unit tests, build, Playwright). Final run: 28 Vitest tests, 40 Playwright tests.
- [x] axe reports zero `serious` or `critical` violations on `/`, `/work/map-areas`, and `/work/does-not-exist` at 390 and 1280.
- [x] Document titles differ for home, Map Areas, and 404.
- [x] Preview lead contrast ≥ 4.5:1. Footer credit is 5.70:1. Footer and mobile-hero focus rings ≥ 3:1 against the charcoal behind them.
- [x] “Interfaces” is a list item in the accessibility tree. Cover caption is visible once, not twice. Contact links expose “GitHub, external” / “LinkedIn, external”.
- [x] At root 16px, hero font sizes match 41.6 / 58.5 / 69.12 / 115.2 px at 320 / 390 / 768 / 1280. Header height is 60px from 390px up. At 320px the bar wraps to 113px; that wrap was approved in the Task 5 review.
- [x] At root 32px, surname glyphs and header links stay inside the viewport at 320, 390, and 1280, with no horizontal scroll.
- [x] Reduced motion: hero opacity 1, no entrance animation, work heading visible, `scroll-behavior: auto`.
- [x] Homepage still withholds the case-study link. Map Areas content flags are unchanged. No Repository link.
- [x] `docs/m5/PERFORMANCE_NOTES.md` records a new localhost preview measurement and does not claim a field LCP.
- [x] No new runtime dependency. Dev dependency added: `@axe-core/playwright` only.

## Tests

| Check | Where |
|-------|--------|
| Titles, contrast, focus, plate, cover name, contact name, hash focus | `e2e/a11y.spec.ts` |
| 16px baselines and 32px overflow | `e2e/responsive.spec.ts` |
| Reduced motion | `e2e/motion.spec.ts` |
| axe serious/critical, preview publication guards | `e2e/a11y.spec.ts` |
| Existing status → href rules | `src/content/projectLinks.test.ts`, `src/content/caseStudyAccess.test.ts` (do not weaken) |
| Existing route smoke | `e2e/routing.spec.ts` (keep green) |
| Full gate | `pnpm validate` |

`e2e/visual-review.spec.ts` may keep writing screenshots under `docs/m4b-review/`. Do not treat those PNGs as M5 acceptance.

## Risks and dependencies

| Risk | Why it matters | What to do |
|------|----------------|------------|
| Lowering clamp floors changes the 16px hero | Gate B composition is approved | Task 5 fails the build if computed font-size moves. Revert the floor that moved it. |
| `data-theme="field"` on the hero or footer | Retokens ink and paper, not just the focus ring | Forbidden. Override the outline locally. |
| Darker gold reads as a new accent | `--color-mark` is only the preview label | One token, one consumer. Stop there. |
| Hash focus fights `ScrollAndFocus` | M4 already focuses `main` on route change | Task 7 focuses the hash target only when a hash resolved. The no-hash path stays. |
| Deleting the `0.01ms` kill reveals an ungated animation | Motion could return for reduced-motion users | Task 8’s test must pass before the deletion. |
| axe reports contrast on `--color-ink-subtle` | 4.55:1 is a pass but fragile | Do not lighten the token. If a serious violation appears, record the rule id and the computed ratio before changing color. |
| Case-study LCP sits near 2.5s | A slower machine or cold font cache can cross the budget | Record the lab. Do not add a pipeline in this milestone. Field check waits for deploy, which is M6. |
| `@axe-core/playwright` major version vs Playwright 1.64 | Install may fail peer deps | Use the current 4.x line that peers with Playwright 1.64. If the install demands a Playwright bump, stop and ask. Do not bump Playwright “while here”. |
| Text-zoom proxy is root `font-size`, not browser zoom | Full-page zoom also scales `vw` and would hide this bug | Keep the root-font test. It matches Firefox text zoom, which is the 1.4.4 case these clamps fail. |
| Physical phone not tested | Sticky header and 44px targets can still feel wrong in the hand | Say so in `PERFORMANCE_NOTES.md`. Do not block M5 on a device lab. |

## Out of scope

- Publishing Map Areas, adding `hrefRepo`, or editing `geo-areas-php`.
- Push, Cloudflare deploy, or a field Core Web Vitals report.
- Visual redesign, new type, new palette, hamburger navigation, Lenis, GSAP, AVIF.
- Portuguese locale.
- Rewriting the stale M4 status lines in `README.md` beyond the single axe row.

## Execution

Implementation waits for André’s approval of this audit. After approval, two ways to execute:

1. **Subagent-driven** — one fresh agent per task, review between tasks.
2. **Inline** — tasks in this session, stopping after Task 5 (visual/text-zoom) and after Task 10 (`pnpm validate`) for a look.

No code changes until that approval.
