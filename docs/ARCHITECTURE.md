# Architecture Proposal

**Status:** Accepted in principle (M0 — GO WITH ADJUSTMENTS); hosting/SPA fallback still unresolved  
**Scope:** Greenfield app in `Portfolio/` only  
**Visual system:** Ledger × Datum × Cut hybrid (`VISUAL_DIRECTIONS.md`)  
**Non-goals:** Backend, CMS, paid APIs, copying `prototype/` architecture  
**Workspace:** `Portfolio/` writable; `prototype/` strictly read-only

---

## 1. Technology stack

### Recommended baseline

| Layer | Choice | Justification |
|-------|--------|---------------|
| UI library | React 19 | Matches skills narrative; strong ecosystem; team familiarity from prototype |
| Language | TypeScript (strict) | Credibility + maintainability; typed content models |
| Build | Vite | Fast DX; first-class TS; simpler than CRA (prototype’s toolchain is legacy) |
| Routing | React Router (data-oriented, latest stable) | Case study URLs; future locale prefixes |
| Styling | CSS Modules + CSS custom properties (design tokens) | Local scope without Tailwind default aesthetics; tokens enable theming/i18n later |
| Motion | CSS first; **GSAP + ScrollTrigger** only for justified complex sequences | Prototype already proved GSAP usefulness; load on interaction/idle where possible |
| Smooth scroll | **Not by default** | Lenis-style smoothing risks scroll-jacking feel; reconsider only if art direction demands and a11y review passes |
| 3D/WebGL | **Not in v1** | Optional later; unjustified cost for current content volume |
| Unit/integration | Vitest + Testing Library | Fast, Vite-native |
| E2E | Playwright | Routing, a11y smoke, reduced-motion paths |
| Package manager | pnpm (preferred) or npm | Lockfile + efficiency; decide at M1 scaffold |
| Hosting | **Must be chosen before case-study routing is finalized** | Static site; SPA deep-link fallback differs by host (see §8) |

### Explicitly deferred

- Next.js / SSR/SSG frameworks — unnecessary until SEO/i18n complexity demands; Vite SPA + prerender plugin is enough for v1 if SEO becomes a concern  
- Tailwind — fights “non-default aesthetic” goal unless heavily constrained; CSS Modules keep craft intentional  
- Contentful/Sanity — no paid/CMS without approval; typed TS/JSON content is enough  
- Form backends — contact strategy TBD; mailto / external LinkedIn acceptable for v1  

### Dependency justification rule

Keep dependencies **justified and minimal**.

- Do not add a dependency unless it removes meaningful custom risk (router, test runners, GSAP for complex timeline orchestration).  
- Document each new dependency in the M1 README or a short ADR note (name, why, milestone introduced, rejection of lighter alternative).  
- Prefer platform/CSS before libraries. GSAP only when CSS cannot meet `MOTION_SPEC.md` experiments cleanly.  
- No Lenis/Three/WebGL without explicit approval.

---

## 2. Application structure

Proposed tree (created in M1+; not scaffolded yet):

```text
Portfolio/
  docs/                    # planning & living docs (this folder)
  public/
    fonts/                 # self-hosted fonts only
    images/                # optimized project/portrait assets
  src/
    app/
      App.tsx
      routes.tsx
      providers.tsx         # thin; avoid god-objects
    pages/
      HomePage/
      ProjectPage/
      NotFoundPage/
    sections/              # homepage sections (Hero, Work, About, Contact)
    components/            # reusable UI (Button, Container, ProjectRow, …)
    motion/                # GSAP helpers, reduced-motion wrappers
    content/
      en/
        site.ts
        projects/
          map-areas.ts     # example
      types.ts             # shared content types
      index.ts             # locale selector seam for future PT
    styles/
      tokens.css           # design tokens
      global.css           # reset, base, fonts
      mq.css               # shared media query helpers if needed
    hooks/
    utils/
    test/
  index.html
  vite.config.ts
  playwright.config.ts
  vitest.config.ts
```

### Module boundaries

| Unit | Responsibility | Must not |
|------|----------------|----------|
| `content/*` | Facts, copy, project data | Import React or CSS |
| `sections/*` | Page composition | Own global styles outside modules |
| `motion/*` | Animation orchestration | Contain business copy |
| `pages/*` | Route-level composition | Deep GSAP timelines (delegate) |

---

## 3. Styling strategy

1. **Tokens in CSS** (`:root` and `[data-theme]` if needed): color, type scale, space, elevation, motion durations/easing, z-index.  
2. **CSS Modules** per component/section for layout and specifics.  
3. **No runtime CSS-in-JS** in v1 (keeps critical path light).  
4. **Self-hosted fonts** with `font-display: swap` and measured fallbacks to limit CLS.  
5. **Theming:** Support contrasting light/dark *surfaces* via tokens; full user theme toggle is optional, not required for v1.  
6. **Responsive:** Mobile-first media queries; fluid type with `clamp`; grid with intentional collapse rules documented per section.

---

## 4. Motion architecture

See `MOTION_SPEC.md` for sequences, **controlled prototyping (MP-1…MP-4)**, and acceptance criteria.

Technical rules:

- Feature-detect `prefers-reduced-motion: reduce` once; expose `useMotionPreference`.  
- Default to CSS transitions/animations for hover and simple enters.  
- GSAP timelines registered in `useLayoutEffect`/`useEffect` with cleanup (`ctx.revert()`).  
- ScrollTrigger: `once: true` for reveals; avoid pin-heavy scenes in v1.  
- Do not ship Lenis unless explicitly approved; **native scrolling is the default**.  
- Code-split GSAP via dynamic `import()` if homepage can paint meaningful content without it.  
- Do not expand elaborate motion until static homepage approval (Gate C). Prototypes are time-boxed keep/kill experiments.

---

## 5. Project data model

Typed content modules (English first):

```ts
// Conceptual model — finalize field names in M1

export type Locale = "en" | "pt"; // pt unused until content exists

/** Controls public visibility and link generation during intermediate milestones. */
export type ProjectStatus =
  | "draft" // content incomplete; never linked from public UI
  | "preview" // may appear in Work list as coming soon; no case-study route link
  | "published"; // full case study may be routed and linked

export interface SiteContent {
  person: {
    name: string;
    role: string;
    locationLabel: string; // e.g. "Based in Brazil"
    shortBio: string;
    // email?: string; // only when provided
  };
  social: Array<{
    id: "github" | "linkedin" | "instagram" | string;
    label: string;
    href: string;
    professionalDefault?: boolean; // Instagram may be omitted from primary UI
  }>;
  nav: Array<{ label: string; href: string }>;
}

export interface ProjectSummary {
  slug: string;
  title: string;
  tagline: string;
  stack: string[];
  year?: number;
  status: ProjectStatus;
  coverImage: { src: string; alt: string; width: number; height: number };
  featured: boolean;
  hrefLive?: string;
  hrefRepo?: string;
}

export interface ProjectCaseStudy extends ProjectSummary {
  problem: string;
  responsibilities: string[];
  implementation: string[];
  challenges: string[];
  outcomes: string[]; // use "[Outcome TBD]" when unknown — never invent metrics
  gallery?: Array<{ src: string; alt: string; width: number; height: number }>;
  /** Case study ships only when evidence is real enough; see publication rules. */
  evidenceComplete: boolean;
}
```

### Content rules

- No invented employers, metrics, or awards  
- Missing outcomes → explicit placeholder strings  
- Images always carry intrinsic dimensions in content for CLS control  
- **Publication / development status is required** on every project  

### Link safety (intermediate milestones)

| Status | Homepage Work list | Link to `/work/:slug` | Direct URL behavior |
|--------|--------------------|------------------------|---------------------|
| `draft` | Hidden (or local-only flag) | No | Soft 404 / “unavailable” — never blank crash |
| `preview` | Optional teaser, no dead CTA | No | Soft 404 / “coming soon” |
| `published` | Listed | Yes, only if `evidenceComplete` | Full case study |

Helpers (to implement in M1+): `isPublicProject`, `getProjectHref` — UI must use these so stubs cannot emit broken links. Prefer omitting the case-study CTA over linking to a 404 during M2–M3.

**Case study publication rule:** Do not mark `published` + `evidenceComplete` until problem/responsibilities/tech/implementation/challenges exist as real (non-invented) content. Outcomes may still contain explicit `[Outcome TBD]` placeholders.

---

## 6. Routing strategy

| Route | Page | Notes |
|-------|------|-------|
| `/` | Home | Hero, Work, About, Contact sections |
| `/work/:slug` | Case study | Only for `published` + `evidenceComplete` projects |
| `*` | 404 | Branded, minimal; also used for unpublished slugs |

Future locale (not v1 implementation requirement):

- `/pt` + `/pt/work/:slug` **or** domain-level later  
- Keep `content/en` and `content/pt` seams ready; router locale detection can wait  

Anchors on home (`/#work`) remain valid for single-page navigation; router still owns case studies.

### Routing finalization gate

**Do not finalize case-study routing configuration until hosting + SPA fallback are resolved** (see §8). Deep links to `/work/:slug` fail on static hosts without a fallback (`404.html` / `_redirects` / host “SPA mode”). Choosing the host first avoids rework of `base`, public paths, and redirect files.

Until that gate passes, homepage may use in-page Work anchors and withhold case-study links (`preview`/`draft` rules above).

---

## 7. Testing strategy (incremental)

Introduce automated tests **incrementally** — not a big-bang M6 dump.

| Phase | Add | Focus |
|-------|-----|--------|
| M1 | Vitest + 1–2 unit tests | Content helpers: status → href rules; slug validation |
| M2 / Gate B | Testing Library smoke | Hero identity renders without motion |
| M4 | Expand unit + component | Published-only routes; unpublished → not found |
| M5 | Playwright a11y smoke (axe) | Primary flows |
| M6 | Playwright E2E paths + CI | Home ↔ case study, 404, reduced-motion; wire CI |

| Layer | Tool | What |
|-------|------|------|
| Unit | Vitest | Content helpers, publication/link rules, motion preference util |
| Component | Testing Library | Hero identity; nav keyboard; no broken project CTAs |
| E2E | Playwright | Home → case study → back; 404; `prefers-reduced-motion` smoke |
| a11y | axe via Playwright (or `@axe-core/playwright`) | Critical routes, no serious/critical violations target |
| Visual QA | Human + browser | **Required** at first-viewport gate; automated screenshots optional later |

**Definition of done for tests:** Assertions against real acceptance criteria (identity visible, links never 404 from public CTAs, reduced motion does not hide content) — not screenshot vanity in early milestones.

---

## 8. Deployment approach

### Hosting decision (blocking for routing)

Static build (`vite build`) → deploy `dist/` to a free static host. **André must choose a host before case-study routing is finalized.**

| Option | Pros | SPA deep-link fallback |
|--------|------|------------------------|
| Cloudflare Pages | Fast CDN, easy Git integrate | Enable SPA fallback / `_redirects` (`/* /index.html 200`) |
| GitHub Pages | Matches prototype habit | `404.html` copy of `index.html` (or action plugin); set Vite `base` if project pages |
| Netlify | Simple previews | `public/_redirects` or netlify.toml SPA rule |

**Do not** introduce paid plans or serverless functions without approval.

### Checklist before finalizing `/work/:slug`

- [ ] Host chosen  
- [ ] Vite `base` decided (root domain vs project pages)  
- [ ] SPA fallback file/config authored and verified with a hard-refresh on a deep link  
- [ ] Production asset paths for fonts/images validated  

### CI (grow into M6)

- Early: local `typecheck` + unit tests  
- Later: GitHub Actions — install → lint/typecheck → unit → build → Playwright on PR  
Exact workflow authored when E2E suite exists; do not block M1 on full CI.

---

## 9. Accessibility requirements

Target: **WCAG 2.2 Level AA** for all primary flows.

Non-negotiables:

- Semantic landmarks (`header`, `main`, `nav`, `footer`)  
- Visible focus styles using tokens  
- Hit targets ≥ 24×24px (prefer 44×44 where primary)  
- Color contrast for text and interactive states  
- Keyboard access to all project previews and menus  
- `prefers-reduced-motion` disables non-essential motion; content remains complete  
- Do not hide nav via `visibility: hidden` / opacity 0 without an alternate persistent way to navigate (prototype anti-pattern)  
- Images: meaningful `alt`; decorative `alt=""`  
- Language: `lang="en"` on document; future `lang` switching when PT ships  
- Skip link to main content  

---

## 10. Performance strategy

### Budgets (initial targets — not measured yet)

| Metric | Target (mobile mid-range, production) |
|--------|----------------------------------------|
| LCP | ≤ 2.5s on typical broadband |
| CLS | ≤ 0.1 |
| INP | ≤ 200ms |
| JS initial | Keep first-load JS lean; defer GSAP if possible |
| Images | Responsive `srcset`, modern formats (AVIF/WebP) with fallback; compress portraits/project shots |

### Tactics

- Self-host fonts; subset if licensed/tools allow  
- Preload hero font and hero image only  
- No always-on canvas background in v1  
- Prefer CSS for decorative depth  
- Analyze bundle in M5 (`rollup-plugin-visualizer` or Vite built-ins) only when optimizing  

---

## 11. i18n readiness (without implementing PT)

- All user-facing strings in `content/en`  
- Components accept content props or read from a single `getContent(locale)` seam  
- Date/number formatting via `Intl` when needed  
- Do not concatenate translations in components  

---

## 12. Security & privacy (lightweight)

- External links: `rel="noopener noreferrer"`  
- No tracking pixels/scripts without approval  
- If a contact form is added later, prefer privacy-respecting free tiers or mailto — reassess then  

---

## 13. Important decisions log

| Decision | Choice | Why |
|----------|--------|-----|
| Greenfield vs evolve prototype | Greenfield in `Portfolio/` | Prototype CRA + aesthetic debt; brief forbids auto-copying architecture |
| CRA vs Vite | Vite | Modern, maintained, faster DX |
| Tailwind vs CSS Modules | CSS Modules + tokens | Avoid default utility aesthetic; intentional craft |
| Lenis | Out by default | Scroll-jacking / a11y risk relative to benefit |
| WebGL | Out of v1 | Cost unjustified |
| Content source | Typed modules | No CMS cost; versioned with git |
| Case studies | Separate routes | Depth + shareable URLs |
| Visual direction | Ledger × Datum × Cut hybrid | Audit GO WITH ADJUSTMENTS; cohesion rules in `VISUAL_DIRECTIONS.md` |
| Project status field | `draft` / `preview` / `published` | Prevent broken links mid-build |
| Hosting before routing | Required | SPA fallback differs by host |
| Tests | Incremental by milestone | Avoid untested early / test dump late |

---

## 14. Reuse from prototype (policy)

| Candidate | Reuse? | Notes |
|-----------|--------|-------|
| Map Areas copy + URL + screenshot | **Maybe** | Re-edit into case-study model; optimize image |
| Portrait pair | **Maybe** | Confirm approval; optimize; rethink reveal interaction |
| Social URLs | **Yes** (if still current) | Verify before ship |
| Skill logo PNGs | **No as primary UX** | Prefer textual stack lists; logos optional later |
| Particle canvas / neon glow CSS | **No** | Conflicts with new art direction |
| GSAP reveal patterns | **Conceptually yes** | Re-implement cleanly; don’t copy-paste modules |
| Lenis wiring | **No (default)** | See above |

When any file bytes are copied, record: source path, destination, and reason in milestone notes.

---

## 15. Approval

Architecture accepted in principle under GO WITH ADJUSTMENTS. Remaining blockers before/alongside early implementation:

1. Explicit **M1 go-ahead** (no install/scaffold until then)  
2. **Hosting target** (+ SPA fallback implication) before finalizing case-study routes  
3. Visual gates B/C in `DESIGN_BRIEF.md` / `IMPLEMENTATION_PLAN.md` (browser proof, not docs)  

Package installation begins only after explicit M1 go-ahead.
