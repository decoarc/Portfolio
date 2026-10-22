# Implementation Plan

**Status:** M0 — **GO WITH ADJUSTMENTS** (docs updated; awaiting explicit M1 go-ahead)  
**Direction:** Ledger × Datum × Cut hybrid (locked)  
**Rule:** No application scaffold, dependency install, or visual implementation until André explicitly approves M1.  
**Workspace:** `Portfolio/` writable only; `prototype/` strictly read-only.

Related docs: `DESIGN_BRIEF.md`, `VISUAL_DIRECTIONS.md`, `ARCHITECTURE.md`, `MOTION_SPEC.md`.

---

## Workspace audit (detailed)

### Verified findings — Portfolio/

| Item | Evidence |
|------|----------|
| Contents | `README.md` (`# Portfolio`), `.git` |
| App code | None |
| Docs (pre-this phase) | None |
| Git | `main` clean; initial commit `ca48e5b` |
| Technologies | Not initialized |

### Verified findings — prototype/ (read-only)

| Item | Evidence |
|------|----------|
| Toolchain | CRA (`react-scripts` 5.0.1), React 19.2, TypeScript 4.9, GSAP 3.15, Lenis 1.3 |
| Entry | `src/App.tsx` single-page composition |
| Sections | Header, Hero, AboutSection, Skills, PersonalProjects, Features (empty separators), Footer |
| Motion | `useScrollEffects` (Lenis + GSAP ScrollTrigger reveals, hero scrub, progress bar) |
| Background | `ParticleWaveBackground` canvas (always painting unless reduced motion) |
| Deploy | `homepage`: `https://decoarc.github.io/prototype` |
| Tests | Default CRA test scaffolding (`App.test.tsx`) — not treated as coverage evidence |

### Reusable candidates (quality filter required)

| Asset / content | Path / source | Reuse recommendation |
|-----------------|---------------|----------------------|
| Name / role / tagline | `Hero.tsx` | Reuse after copy edit |
| About narrative | `AboutSection.tsx` | Reuse with editorial tightening |
| Map Areas project | `PersonalProjects.tsx` + `map-areas.png` | Candidate #1 case study; rewrite into full model; optimize image |
| Portraits | `public/assets/components/About/perfil*.png` (~1.1–1.3MB each) | Maybe; optimize heavily; confirm approval |
| Social URLs | `Footer.tsx` | Likely yes; verify |
| Footer SVGs | `public/assets/components/Footer/*` | Optional; may replace with inline icons in system |
| Skill logos | `public/assets/components/Skills/*` | Do not center UX on these |
| Logo files | `logoHome.png`, etc. | Treat as prototype-only unless André endorses |

### Architectural problems (prototype)

1. CRA is a dead-end toolchain for a new craft portfolio.  
2. No routing → no real case studies.  
3. Global CSS without tokens → inconsistent system risk.  
4. Continuous canvas + RAF skills carousel → battery/CPU cost.  
5. Header fade to `visibility: hidden` → navigation reliability/a11y issue.  
6. Touch `preventDefault` on skills slider → scroll conflict risk.  
7. Empty Features section → unfinished narrative.  
8. Mixed language in aria-labels vs English UI.  

### Technical debt

- Multi‑megabyte images unchecked  
- Neon cyan / glow aesthetic conflicting with new brief  
- Placeholder footer branding (“Logo Prototype by Me”, “© 2025 Me”)  
- Thin automated verification of UX claims  

### Missing information (blocks polish, not planning)

- Full project list and case-study facts  
- Contact email / preferred contact mechanism  
- Approved portrait and wordmark  
- Hosting account preference  
- Whether Instagram stays in professional chrome  
- Portuguese content timeline  

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Thin project inventory | Site feels hollow despite craft | Ship 1 strong case study + honest “more soon” only if needed; gather 2–3 projects before M4 |
| Direction drift toward AI-generic looks | Brand failure | Lock direction in M0; critique against avoid-list in M2/M5 |
| Motion overreach | a11y/perf debt | `MOTION_SPEC.md` gates; no Lenis/WebGL by default |
| Content invention pressure | Credibility damage | Placeholder policy enforced in content types |
| Accidental prototype edits | Process breach | Workspace rule; never run write/git in `prototype/` |
| OneDrive path sync issues | Tooling flakiness | Prefer local-stable workflow; watch for file lock errors |

---

## Design / quality gates (binding)

| Gate | When | Requirement | Blocks |
|------|------|-------------|--------|
| **A — M1 go-ahead** | End of M0 | Explicit written approval to scaffold/install | All code |
| **B — First-viewport visual approval** | Early M2 | **Browser-rendered** first viewport reviewed for type, composition, spacing, contrast, responsive behavior, originality | Full homepage build-out |
| **C — Static homepage approval** | End of M2 | Full static homepage approved | Elaborate motion (M3 experiments → production) |
| **D — Hosting + SPA fallback** | Before finalizing case-study routes | Host chosen; deep-link fallback verified | Locking `/work/:slug` deploy config |
| **E — Case study evidence** | Before `published` | Real problem/responsibilities/tech/implementation/challenges (no invented metrics) | Public case-study links |

**Docs alone are never evidence of visual quality.** Gate B requires looking at a running page.

---

## Milestones

### M0 — Discovery and design approval

**Goal:** Align on brief, visual direction, architecture, motion, and plan.

| Deliverable | Status |
|-------------|--------|
| Workspace audit documented | Done |
| Three visual concepts + locked hybrid | Done (`VISUAL_DIRECTIONS.md`) |
| Architecture proposal (adjusted) | Done (`ARCHITECTURE.md`) |
| Motion spec (+ prototyping) | Done (`MOTION_SPEC.md`) |
| Implementation plan (gates) | Done (this file) |
| Explicit written go-ahead for M1 | **Pending** |

**Acceptance criteria**

- [x] Visual direction locked (Ledger × Datum × Cut hybrid)  
- [x] Planning audit adjustments incorporated into existing docs  
- [ ] Open decisions reviewed (below)  
- [ ] Explicit written go-ahead for M1  

**Stop:** No Vite scaffold, no `pnpm/npm install`, no source app files until Gate A.

---

### M1 — Project foundation and design system

**Goal:** Bootstrappable app shell with tokens and content seams. Visual polish is deferred; foundations must support the hybrid and publication-safe content.

**Deliverables**

- Vite + React + TypeScript project in `Portfolio/` only  
- CSS reset/base, `tokens.css`, font loading strategy (Ledger-owned faces; hybrid cohesion rules)  
- Folder structure per `ARCHITECTURE.md`  
- `content/en` with site shell strings + project stubs including **`status`: draft | preview | published**  
- Link helpers that prevent broken public project CTAs  
- Basic shell route (home); **do not finalize case-study deploy routing until Gate D**  
- Vitest + first unit tests for status → href rules (incremental testing starts here)  
- Lint/format/typecheck scripts  
- README: scripts, workspace boundaries, dependency justification log  

**Acceptance criteria**

- [ ] `dev` / `build` / `typecheck` succeed  
- [ ] Tokens cover color, type, space, motion  
- [ ] Every new dependency justified in README/ADR  
- [ ] No prototype files modified  
- [ ] English content externalized; project `status` enforced in helpers  
- [ ] Public UI cannot link to unpublished case studies  

---

### M2 — Visual prototype, then homepage composition

**Goal:** Prove the hybrid visually in-browser, get design approval, then complete static homepage — **without** elaborate motion.

#### M2a — First-viewport prototype (Gate B)

**Deliverables**

- Browser-rendered first viewport (dev server) implementing Ledger foundation + allowed Cut crop/collision + no Datum clutter in hero  
- Responsive checks at ≈390 and ≈1280+  
- Written review notes: typography, composition, spacing, contrast, originality (anti-generic / anti-conservative)  

**Acceptance criteria (Gate B)**

- [ ] Name + role readable with motion disabled / before any enhancement  
- [ ] Composition matches locked FIRST VIEWPORT intent  
- [ ] Not SaaS-card, not neon-cyber, not cream/terracotta default  
- [ ] **André (or designated reviewer) explicitly approves the rendered prototype**  
- [ ] Failures logged with specific fixes before M2b  

**Stop:** Do not build the full homepage until Gate B passes.

#### M2b — Full static homepage (Gate C)

**Deliverables**

- Hero / Work / About / Contact static composition  
- Work list uses Datum-style metadata; respects `draft`/`preview`/`published`  
- One intentional Cut light/dark band (Work or Closing)  
- Placeholder or real media with intrinsic sizes  
- Testing Library smoke: hero identity  

**Acceptance criteria (Gate C)**

- [ ] Full homepage scannable without JS motion libraries  
- [ ] No broken project links (no “View case study” → 404)  
- [ ] Hybrid cohesion rules held (not three skins stapled together)  
- [ ] **Explicit approval of static homepage** before M3  

---

### M3 — Motion prototyping and interactions

**Goal:** Controlled experiments per `MOTION_SPEC.md` §10, then lock production motion. **Blocked until Gate C.**

**Deliverables**

- Motion preference hook  
- Experiments MP-1…MP-4 (hero type, project preview, home→case study, light/dark band) with keep/kill notes  
- Production motion for kept variants only  
- Native scrolling preserved; reduced-motion paths verified  

**Acceptance criteria**

- [ ] Gate C already passed  
- [ ] All M3 acceptance items in `MOTION_SPEC.md` §11  
- [ ] MP-1…MP-4 notes complete  
- [ ] No Lenis/WebGL unless newly approved  
- [ ] Content never waits on timeline completion  
- [ ] Case-study transition experiment does not assume finalized host routing without Gate D awareness (may stub transition until routes deploy-ready)  

---

### M4 — Project case studies and navigation

**Goal:** Deep project storytelling with shareable URLs — only for evidenced, published work.

**Prerequisites**

- [ ] Gate D: hosting + SPA fallback resolved (or routing kept local-only until then)  
- [ ] Gate E: at least one project with real case-study evidence  

**Deliverables**

- Router with `/`, `/work/:slug`, 404 (unpublished → not found / coming soon)  
- Case study template: problem, responsibilities, tech, implementation, challenges, outcomes  
- At least one **real** published project (Map Areas candidate only after evidence rewrite)  
- Nav + internal linking + back paths  
- Unit/component tests for publication rules  

**Acceptance criteria**

- [ ] No invented metrics; `[Outcome TBD]` allowed only where labeled  
- [ ] `published` requires `evidenceComplete`  
- [ ] Hard-refresh deep link works on chosen host (Gate D)  
- [ ] Focus management sensible on route change  
- [ ] External demo/repo links correct and `noopener`  

---

### M5 — Responsive design, accessibility, and performance

**Goal:** Production-quality resilience across approved surfaces.

**Deliverables**

- Responsive hardening of all routes  
- a11y pass (manual + axe smoke)  
- Image optimization pipeline/results  
- Performance notes vs budgets in `ARCHITECTURE.md`  
- Reduced-motion full-path QA  

**Acceptance criteria**

- [ ] WCAG 2.2 AA issues of severity serious+ resolved on primary flows  
- [ ] CLS/LCP addressed for hero and case study covers (measure; do not fabricate scores)  
- [ ] Mobile nav usable; no prototype-style disappearing header without alternative  
- [ ] Documented remaining known issues (if any)  

---

### M6 — Testing completion, documentation, and deployment

**Goal:** Finish incremental test surface, deploy, document maintenance.

**Deliverables**

- Playwright: home, case study, 404, reduced motion (builds on earlier unit/component tests)  
- Deployment config for chosen host + verified SPA fallback  
- Docs: add a project (status workflow), run tests, content rules  
- Optional: GitHub Actions CI  

**Acceptance criteria**

- [ ] Documented commands all pass  
- [ ] Production URL HTTPS; deep links work  
- [ ] README explains content/`status` edit path  
- [ ] Planning docs reflect locked direction and hosting choice  

---

## Dependency install policy (from M1 onward)

Install only when justified; keep the set minimal:

| Dependency | Allowed from | Justification required |
|------------|--------------|------------------------|
| react, react-dom, vite, typescript | M1 | Core |
| vitest, testing-library | M1 | Incremental tests (status/href, hero smoke) |
| react-router | After Gate D planning clarity (M1 shell OK; finalize with host) | Routing |
| gsap | M3 (only if CSS insufficient for kept experiments) | Complex motion |
| playwright, axe | M5–M6 | E2E / a11y |
| lenis / three | Never by default | Needs explicit approval |

---

## Open decisions (unresolved)

| # | Decision | Owner | Needed by | Status |
|---|----------|-------|-----------|--------|
| 1 | Visual direction | André | Before M1 | **Resolved** — Ledger × Datum × Cut hybrid |
| 2 | Hosting target + SPA fallback | André | **Before case-study routing finalized (Gate D)** | Unresolved |
| 3 | Contact method | André | Before M2b contact final copy | Unresolved |
| 4 | v1 project list + evidence | André | Before Gate E / M4 | Unresolved |
| 5 | Portrait + wordmark approval | André | Before M2b polish | Unresolved |
| 6 | Instagram in chrome? | André | Before M2b | Unresolved |
| 7 | PT i18n timing | André | M1 content seam (scaffold only vs later) | Unresolved |
| 8 | Native scroll vs Lenis | — | M3 | **Default locked: native**; Lenis only on explicit exception |
| 9 | Which band gets Cut light/dark flip | André + implementer | M2b | Unresolved (Work vs Closing) |
| 10 | Accent color / type finalization | Review at Gate B | Gate B | Unresolved until rendered |

---

## Assumption log

| Assumption | If wrong |
|------------|----------|
| English-first hiring audience | Adjust copy tone; PT may need earlier |
| 1–3 projects for v1 | Expand Work section pattern |
| Static hosting is enough | Revisit SSR only if SEO proves insufficient |
| Hybrid stays cohesive under Ledger ownership | Re-assert cohesion rules at Gates B/C |

---

## Explicit non-actions (current phase)

- No `npm/pnpm/yarn install` in Portfolio  
- No Vite/React files created beyond `docs/`  
- No changes under `prototype/`  
- No Git commits unless André requests them  
- No claims of visual excellence or performance scores  
- No M1 start without explicit approval  

---

## Exit from planning

When André gives **explicit M1 go-ahead** (Gate A), begin M1 strictly inside `Portfolio/` following `ARCHITECTURE.md` and the locked hybrid in `VISUAL_DIRECTIONS.md`. Hosting may still be undecided at M1 start but **must** be resolved before Gate D / finalizing case-study routing.
