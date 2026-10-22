# Design Brief — André Arcodaci Portfolio

**Status:** M0 planning — **GO WITH ADJUSTMENTS** (direction locked; M1 not started)  
**Mode:** Experience (portfolio) with Persuade undertones (hire / contact)  
**Primary language:** English (architecture must allow future Portuguese)  
**Visual direction:** Locked hybrid — Ledger foundation + Datum metadata + Cut contrast/transitions (see `VISUAL_DIRECTIONS.md`)  
**Date:** 2026-10-22 (updated same day after planning audit)

---

## 1. Job and audience

### What this surface is for

A personal portfolio that presents André Arcodaci as a Full Stack Developer / software engineer through a distinctive, art-directed web experience. Visitors should leave with a clear sense of who he is, what he builds, and how to contact him — without the site reading as a generic template or SaaS landing page.

### Who arrives

| Audience | Situation | Mindset |
|----------|-----------|---------|
| Recruiters / hiring managers | Screening candidates quickly | Time-poor; scanning for credibility and fit |
| Technical interviewers / engineers | Evaluating craft and judgment | Skeptical of polish without substance |
| Collaborators / peers | Curiosity, possible collaboration | Looking for taste + technical depth |
| André himself | Self-presentation, iteration | Needs maintainable content and honest scope |

### Primary outcome

Within the first viewport and first scroll, visitors should understand:

1. **Who:** André Arcodaci  
2. **What role:** Full Stack Developer / Software Engineering  
3. **Where:** Brazil (context, not a gimmick)  
4. **What to do next:** View selected work or contact  

Secondary outcome: selected projects read as real engineering (problem → approach → stack → challenges → outcomes), not as logo walls or vibe cards.

### Product-specific truth

Verified from legacy prototype content and this brief (not invented credentials):

- Name and positioning as Full Stack Developer  
- Interest/stack signals: PHP, JavaScript, TypeScript, React, REST APIs, MySQL, Git, Docker, plus interests in architecture, desktop apps, graphics programming, local AI / developer tools  
- At least one documented personal project in the prototype: **Map Areas** (PHP, maps/geospatial; live demo URL present)  
- Public profiles: GitHub (`decoarc`), LinkedIn (`andrearcodaci`), Instagram (`arcowill`)  

Anything beyond this (employers, metrics, client logos, awards) must use **clearly labeled placeholders** until provided.

---

## 2. Experience structure

Planned information architecture (homepage + case studies):

| # | Zone | Job |
|---|------|-----|
| 1 | Hero / Professional identity | Immediate name, role, one line of POV, primary CTA |
| 2 | Selected projects | Curated engineering work with strong previews |
| 3 | About / Expertise | Background narrative + credible skills framing (not a 3D logo carousel by default) |
| 4 | Project case studies | Dedicated routes/pages: problem, responsibilities, tech, implementation, challenges, outcomes |
| 5 | Contact / Closing | Clear contact path and lasting brand note |

Homepage must communicate identity **before** complex animations finish. Motion enhances; it never gates content.

---

## 3. Art direction (locked)

**Direction label:** Sophisticated editorial hybrid — **Ledger × Datum × Cut**  

| Role | Concept | Application |
|------|---------|-------------|
| Foundation | Ledger | Editorial type, asymmetry, whitespace, restrained accent |
| Precision | Datum | Project metadata, specs, measured alignment — not HUD costume |
| Expression | Cut | Selected light/dark bands, crop drama, selected transitions |

**Keywords:** contemporary, distinctive, art-directed, typographic, asymmetric, expressive, precise, confident, technically refined  

**Avoid:** generic SaaS layouts; default Tailwind aesthetics; excessive gradients/glow blobs; purposeless glassmorphism; repetitive rounded cards; generic developer illustrations; decorative motion; overused AI portfolio patterns; copying Awwwards sites; inventing achievements; **indiscriminate mixing of all three concepts in one component**; **excessively conservative / forgettable “tasteful” layouts**.

Visual quality must come from composition, typography, pacing, imagery, interaction, and detail — not from effects volume.

**Color:** Palette sketches are not final. Tokens are provisional until proven in a browser-rendered first-viewport prototype and approved at the visual validation gate.

**Visitor mode:** Experience — the work (and the site’s craft) leads; chrome recedes.

### Visual validation (binding)

Documentation is not evidence of visual quality. Before building the full homepage:

1. Render the **first viewport** in a real browser (dev server).  
2. Review typography, composition, spacing, contrast, responsive behavior, and originality.  
3. Obtain explicit design approval for that prototype.  

Only then expand to full homepage static composition. Elaborate motion waits until that static composition is approved. See `IMPLEMENTATION_PLAN.md`.

---

## 4. Content policy

### Verified vs placeholder

| Category | Rule |
|----------|------|
| Name, role, location framing | Use verified strings |
| Stack / interests | Use brief-approved lists; do not inflate proficiency levels |
| Projects | Only real projects André supplies; Map Areas is a candidate for reuse after content review |
| Outcomes / metrics | Placeholders like `[Outcome TBD]` until real data exists |
| Photography / portrait | Prototype assets are candidates; quality and licensing must be confirmed before shipping |
| Logo / wordmark | Prototype “Logo Prototype by Me” is **not** shipping brand; new mark TBD |

### Localization

- Ship English first  
- Structure copy and routes so Portuguese can be added later (i18n-ready content modules; no hardcoded assumption that English is the only locale forever)  
- Do not implement full i18n in M1 unless approved  

---

## 5. Motion philosophy (summary)

Expressive but purposeful: typographic reveals, coordinated entrances, scroll storytelling, project preview interactions, page transitions, hover depth.  

Hard constraints:

- Respect `prefers-reduced-motion`  
- Keyboard accessibility preserved  
- Content never blocked behind animation completion  
- No scroll-jacking (**native scrolling** by default)  
- Minimize layout shift  
- Avoid unnecessary JS on the critical path  
- Mobile performance is a first-class constraint  
- Elaborate motion only after static composition approval; use controlled prototypes (hero type, project preview, route transition, light/dark band) with keep/kill decisions  

Three.js/WebGL is **optional**, not a goal. Full motion rules live in `MOTION_SPEC.md`.

---

## 6. Success criteria (M0 definition of “good”)

A successful portfolio will:

1. Feel custom and art-directed within 3–5 seconds of landing  
2. Make the engineering story scannable for recruiters  
3. Present projects with case-study depth, not card fluff  
4. Stay accessible (WCAG 2.2 AA target) and performant on mid-range mobile  
5. Be maintainable: content edits should not require redesigning the system  

**Non-goals for v1:** CMS, backend, auth, blog platform, paid APIs, analytics suites (unless André later approves a free/self-hosted option).

---

## 7. Scope and boundaries

### In scope (through M6)

- Greenfield app in `Portfolio/` only  
- Design system foundations, homepage, case studies, contact closing  
- Documentation in `Portfolio/docs/`  
- Automated testing baseline and static deployment plan  

### Out of scope / forbidden without approval

- Modifying `prototype/`  
- Installing packages before M1 approval  
- Claiming visual excellence without review of rendered output  
- Paid services or third-party APIs  
- Fabricated professional history  

### Anti-goals

- Recreating the prototype’s neon/cyber look as the final brand  
- Skill carousels that prioritize spectacle over clarity  
- Empty “Features” sections or filler UI  
- Excessively conservative / generic “tasteful template” outcomes  
- Publishing case studies without real evidence or shipping broken project links  
- Elaborate motion before static composition approval  

---

## 8. Constraints and open decisions

### Binding constraints

- Workspace: write only in `Portfolio/`; `prototype/` is read-only reference  
- Stack preference: React, TypeScript, Vite, CSS Modules, design tokens  
- Git operations only inside `Portfolio/`  

### Open decisions (need André)

See full table in `IMPLEMENTATION_PLAN.md`.

1. ~~Visual direction~~ → **Locked** (Ledger × Datum × Cut hybrid)  
2. Confirm hosting target **and** accept SPA deep-link fallback implications (**before** finalizing case-study routing)  
3. Confirm which projects ship in v1 and provide case-study evidence  
4. Confirm contact channel (email, form, LinkedIn-only, etc.)  
5. Confirm portrait/brand assets and whether prototype images may be reused  
6. Confirm whether Instagram belongs on a professional portfolio  
7. Confirm Portuguese timeline (v1 English-only vs early i18n scaffolding only)  
8. Confirm which homepage band gets the Cut light/dark flip (Work vs Closing)  
9. Explicit **M1 go-ahead** when ready  

---

## 9. Evidence classification

| Type | Items |
|------|--------|
| **Verified** | Portfolio repo is essentially empty (README only); prototype is CRA + React + GSAP + Lenis SPA with the content/assets listed in the audit section of `IMPLEMENTATION_PLAN.md` / below |
| **Decision** | Ledger × Datum × Cut hybrid locked; visual validation gate required; motion after static approval |
| **Recommendation** | Vite greenfield; CSS Modules + tokens; GSAP only where justified; typed content modules with publication status; hosting + SPA fallback before case-study routing finalized |
| **Assumption** | Target audience is primarily English-speaking hiring stakeholders; 2–4 projects for v1 is enough |
| **Unknown** | Full project inventory, employment history, preferred accent color, final wordmark, contact email, **hosting target + SPA fallback strategy** |

---

## 10. Workspace audit (summary)

### Portfolio/ (active project)

| Finding | Detail |
|---------|--------|
| Files | `README.md` (`# Portfolio`), `.git` |
| Tech | None scaffolded |
| Status | Clean git on `main`; suitable greenfield |

### prototype/ (read-only reference)

| Finding | Detail |
|---------|--------|
| Tech | Create React App (`react-scripts` 5), React 19, TypeScript 4.9, GSAP 3, Lenis, Testing Library |
| Structure | Single-page App: Header, Hero, About, Skills, PersonalProjects, Features (empty), Footer, canvas ParticleWaveBackground, ScrollProgress |
| Deploy signal | `homepage` → `https://decoarc.github.io/prototype` |
| Reusable content candidates | Name, role line, about copy (review tone), Map Areas project metadata + preview, social URLs, portrait pair (`perfil.png` / `perfil_2.png`), footer SVGs |
| Architectural problems | CRA legacy toolchain; global CSS co-located without tokens; no router/case studies; canvas always-on background; Lenis + scrubbed hero may feel scroll-hijack-adjacent; skills 3D drag carousel with `preventDefault` on touch; header opacity→0 harms findability/a11y; Features is decorative empty state; mixed PT/EN aria strings |
| Technical debt | Unoptimized multi‑MB images; skill logo PNGs as primary expertise UX; neon cyan glow aesthetic; no design tokens; thin test surface |
| Missing info | Case-study depth, additional projects, contact email, brand system, i18n, a11y audit results (none run in this phase) |
| Risks if copied | Inherits cyber-glow look, CRA cost, motion/a11y debt, and shallow project storytelling |

**Reuse policy:** Copy nothing by default. If reusing assets or copy, document the source path and reason in the PR/commit notes for that milestone.

---

## 11. Approval gates

### Gate A — Start M1 (foundations only)

Do not scaffold, install packages, or write app source until André explicitly approves starting M1. Direction is already locked in `VISUAL_DIRECTIONS.md`; remaining M0 ask is **go-ahead for M1** plus any open decisions André chooses to settle first (hosting strongly preferred early).

### Gate B — First-viewport visual approval (after M1 foundations)

Browser-rendered first viewport must be reviewed and approved before full homepage build-out. Docs ≠ quality.

### Gate C — Static homepage approval (before elaborate motion)

Full static homepage composition approved before M3 motion prototyping expands beyond minimal hooks.

### Gate D — Hosting + SPA fallback (prep closed 2026-10-22)

**Hosting locked: Cloudflare Pages** (`docs/m4a/HOSTING_AND_ROUTING.md`). SPA `_redirects` + live deep-link verify remain for M4b/deploy. Case-study *publication* evidence remains **Gate E** (no hollow narratives; unpublished/WIP must not produce broken public links).

Workspace: write only in `Portfolio/`; `prototype/` remains read-only.
