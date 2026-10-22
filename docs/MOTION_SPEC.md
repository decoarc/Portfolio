# Motion Specification

**Status:** Planning — bound to locked **Ledger × Datum × Cut** hybrid  
**Principle:** Motion expresses hierarchy and continuity. It never conceals content, traps focus, or replaces information design.  
**Sequencing:** Elaborate motion **after** static first-viewport approval and static homepage approval (`IMPLEMENTATION_PLAN.md` Gates B/C). Controlled prototypes may explore variants only inside an approved static composition.

---

## 1. Goals

1. Make the first visit feel art-directed within the first second **without** delaying readable identity.  
2. Connect homepage → case study with a continuous sense of place.  
3. Reward exploration (hover/focus on projects) without requiring it.  
4. Remain excellent when motion is reduced or unavailable.

---

## 2. Global rules

| Rule | Requirement |
|------|-------------|
| Reduced motion | If `prefers-reduced-motion: reduce`, skip transforms/parallax/staggers; use instant state or ≤150ms fades only |
| Content availability | Name, role, primary CTA, and project titles must be in the DOM and readable immediately (no `opacity: 0` without a non-motion pathway) |
| No scroll-jacking | Native scrolling only in v1; no wheel capture, no Lenis unless later approved |
| No animation-gated navigation | Links work at `t=0` |
| Keyboard | Focus styles are not motion-dependent; hover-only revelations must have `:focus-visible` equivalents |
| Layout stability | Animate `transform`/`opacity` preferentially; reserve space for media; avoid animating `width/height/top/left` except trivial cases |
| Performance | Cancel timelines on unmount; avoid per-frame React state for scroll (use GSAP/ScrollTrigger or CSS) |
| Mobile | Shorter distances, fewer simultaneous animations, no multi-layer parallax |

---

## 3. Motion tokens (to implement in M1)

Conceptual tokens (exact values tunable):

| Token | Proposed default | Reduced |
|-------|------------------|---------|
| `--motion-fast` | 150ms | 0–100ms or off |
| `--motion-medium` | 320ms | off |
| `--motion-slow` | 600ms | off |
| `--ease-out-expressive` | cubic-bezier(0.16, 1, 0.3, 1) | n/a |
| `--ease-ink` | cubic-bezier(0.22, 1, 0.36, 1) | n/a |
| Stagger step | 60–90ms | 0 |

---

## 4. Sequence inventory

### 4.1 Hero — professional identity (priority: P0)

**Intent:** Announce name and role with typographic confidence.

| Beat | Normal | Reduced |
|------|--------|---------|
| 0ms | Identity text visible (static CSS), CTA clickable | Same |
| 0–700ms | Optional line-mask or fade-up of title lines (stagger ≤90ms) | No movement; full opacity |
| Parallel | Hero media opacity 0→1 or subtle ken-burns **max 2%** scale | Static image |

**Acceptance**

- With JS disabled or GSAP failed to load: hero still complete via CSS  
- LCP element is not delayed by waiting for a timeline `onComplete`  

### 4.2 Section entrance reveals (P1)

**Targets:** Work, About, Contact headings and primary blocks.

| Normal | Reduced |
|--------|---------|
| `from` opacity 0 + `y: 24–40px` → rest; ScrollTrigger `start: "top 85%"`, `once: true` | Elements at rest styles always |

**Anti-patterns**

- Chained reveals that take >1s of scroll attention  
- Blur-up on large text (expensive, muddy)  

### 4.3 Selected projects — preview interaction (P0)

**Desktop**

- Default: typographic row + muted preview  
- `:hover` / `:focus-visible` within row: preview becomes vivid; optional horizontal shift ≤12px; underline/accent ink  

**Mobile**

- No hover dependency; preview always visible at reduced size OR tap opens case study directly  

**Acceptance**

- Entire row is one link (or clear primary link) with accessible name  
- Motion is cancelable mid-hover without stuck states  

### 4.4 About / expertise (P2)

- Prefer static layout + light entrance  
- **Do not** port the prototype’s continuous 3D skills autoplay carousel  
- If a portrait interaction ships: CSS mask reveal is OK on pointer devices; on coarse pointers, show final composite or toggle with a button (labeled)  

### 4.5 Page transitions — home ↔ case study (P1)

**Normal (recommended v1)**

- Exit: home content fades/translates lightly (≤250ms)  
- Enter: case study title continues from list title position **if inexpensive**; otherwise shared fade + title appear  
- Use React Router + a thin transition wrapper; abort on rapid navigation  

**Reduced**

- Instant swap or 100ms fade  

**Out of scope v1**

- Full FLIP shared element engineering across all assets  
- WebGL route curtains  

### 4.6 Contact / closing (P2)

- Quiet entrance; optional accent rule draw (SVG stroke) once  
- No looping attention-grabbers  

### 4.7 Scroll progress (P3 — optional)

- Thin progress indicator OK if contrast-safe and not redundant with browser UI  
- Must not flash or animate noisily  

---

## 5. Scroll storytelling

Allowed:

- One-time section reveals  
- Mild scrubbed opacity on hero media (≤ range that still keeps type readable)  

Not allowed in v1:

- Forced snap sections  
- Multi-scene pin storytelling that traps users  
- Scroll-linked animations that update React state every frame  

---

## 6. Library usage policy

| Tool | When |
|------|------|
| CSS transitions | Hover, focus, color, small transforms |
| CSS `@keyframes` | Simple loops only if essential (prefer none) |
| GSAP | Hero orchestration, scroll reveals, route transition timelines |
| ScrollTrigger | Section once-reveals; optional hero scrub |
| Lenis | **Default off** |
| WebGL/Three | **Default off** |

GSAP load strategy (M3 decision point):

1. Prefer static CSS hero, enhance with GSAP after idle/`requestIdleCallback` **or**  
2. Sync import if bundle cost remains acceptable after measurement  

Choose based on M5 measurements, not aesthetics alone.

---

## 7. Accessibility specifics

- Honor `prefers-reduced-motion` at runtime and when preference changes (`matchMedia` listener).  
- Do not use `animation` on elements that cause vestibular issues with large travel distances.  
- Pause any future autoplay on `document.hidden`.  
- Ensure focus order ignores decorative motion layers (`aria-hidden="true"` on pure decoration).  
- Live regions are not for animation status.

---

## 8. Performance checklist (motion)

- [ ] No continuous `requestAnimationFrame` loops without user benefit  
- [ ] Canvas/WebGL absent in v1  
- [ ] Timelines cleaned up on route change  
- [ ] Image decode not blocked behind animation  
- [ ] Mobile: disable scrubbed parallax if INP/jank observed  

---

## 9. Mapping to locked hybrid

| Layer | Motion flavor | Where applied |
|-------|---------------|---------------|
| Ledger (default) | Soft expressive eases, typographic masks, restrained hover | Hero entrance, section reveals |
| Datum | Short geometric snaps; optional hairline/meta emphasis — no HUD loops | Project row meta; focus states |
| Cut (rationed) | Harder cuts/wipes; light↔dark field transitions; selected route transition | One major band flip; home→case study experiment |

Do not run Cut-level wipes on every scroll reveal. Reduced-motion always collapses Cut to instant or ≤150ms fade.

---

## 10. Controlled motion prototyping (M3)

After Gates B/C (static composition approved), run **time-boxed experiments** before locking production motion. Each experiment records: hypothesis, variant A/B notes, a11y/perf check, keep/kill decision.

### Experiment set (required)

| ID | Experiment | Success looks like | Hard constraints |
|----|------------|--------------------|------------------|
| MP-1 | **Hero typography entrance** | Identity feels art-directed within ~700ms; still readable at t=0 | No content gated; reduced-motion = static |
| MP-2 | **Project preview interactions** | Hover/focus rewards exploration; mobile has non-hover path | Keyboard parity; no stuck hover state |
| MP-3 | **Homepage → case-study transition** | Continuity without theatre; interruptible on rapid nav | SPA route must already have host fallback plan; reduced-motion = fade/instant |
| MP-4 | **Light/dark section transitions** | Cut-style band change feels intentional, not flashbang | Contrast remains AA; no scroll-jack; optional once-per-section |

### Prototype protocol

1. Implement behind a local flag or isolated branch section if needed — do not polish dead ends into the design system.  
2. Verify `prefers-reduced-motion` path for every experiment.  
3. Keep **native scrolling** (no Lenis) unless a later explicit exception is approved.  
4. Prefer CSS for MP-2; use GSAP when timelines for MP-1/MP-3/MP-4 clearly need it.  
5. Kill variants that hurt INP, CLS, or originality (generic fade-stagger spam).  
6. Only **kept** variants become the M3 production motion set.

### Exit criteria for prototyping

- [ ] Each of MP-1…MP-4 has a keep/kill note  
- [ ] Production motion set documented (update this file’s §4 if timings change)  
- [ ] Bundle impact of GSAP noted if introduced  

---

## 11. Acceptance criteria (motion milestone M3)

1. Gates B/C already passed (static composition approved).  
2. Identity readable with reduced motion OS setting on.  
3. No scroll library capturing wheel by default.  
4. Project interactions keyboard-equivalent.  
5. Route transitions interruptible.  
6. Light/dark section transition (if kept) preserves contrast and does not trap scroll.  
7. Manual check: no major layout shifts attributable to motion.  
8. Documented before/after notes for any GSAP bundle impact.  
9. MP-1…MP-4 prototyping notes complete.

---

## 12. Open motion decisions

1. Native scroll remains default (**recommended locked** unless André requests Lenis trial).  
2. Hero media: static plate vs ≤2% drift?  
3. Route transitions: fade-only vs title continuity vs Cut wipe (decide via MP-3).  
4. Portrait reveal interaction: ship or defer?  
5. Which single homepage band uses the Cut light/dark flip (Work vs Closing)?
