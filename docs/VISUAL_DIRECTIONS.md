# Visual Directions — Three Concepts

**Status:** Direction locked (M0 audit — GO WITH ADJUSTMENTS)  
**Locked direction:** **Ledger × Datum × Cut hybrid** (see § Locked hybrid contract)  
**Surface:** Portfolio homepage + case studies  
**Mode:** Experience  
**Constraint:** Do not copy existing Awwwards sites; principles only. Avoid AI-default clusters (warm cream + terracotta serif; purple SaaS; neon-cyber glow; broadsheet hairline newspaper).

Palette values below remain **proposal sketches** until tokens are proven in a **browser-rendered first-viewport prototype** (visual validation gate). Documentation alone is not evidence of visual quality.

---

## Shared craft principles (all concepts)

- Brand/name is a hero-level signal, not only nav text  
- First viewport: one composition — name, one headline, one short support line, one CTA group, one dominant visual idea  
- No card grid in the hero; cards only when they contain a real interaction  
- One job per section  
- Real visual anchors (work screenshots, portrait, process imagery) over abstract blobs  
- Motion serves hierarchy and storytelling; reduced-motion paths stay first-class  
- Light/dark contrast is allowed; neither is a default aesthetic costume  

---

## Concept A — “Ledger”

### Creative direction

A contemporary **editorial ledger**: the site reads like a carefully typeset technical periodical crossed with a personal monograph. Asymmetry and oversized type carry character; color is restrained; whitespace is deliberate. Engineering credibility comes from clear project evidence and precise typography, not from neon “tech” cues.

**World metaphor:** Bound issue / signature folio — pacing, margins, and typographic hierarchy as the craft signal.

### Typography

| Role | Character | Notes |
|------|-----------|-------|
| Display | Sharp contemporary sans with optical oddness (condensed or slightly wide — choose one family with a strong italic) | Avoid Inter/Roboto/Arial and the listed AI-default display faces unless no alternative fits |
| Body | Highly readable humanist or neo-grotesk text face | Generous measure control (≈45–70ch) |
| Meta | Small caps / tracked labels for section indexes (“01 / Work”) | Use sparingly |

Pairing goal: **confident display + quiet reading**, not “serif = smart.”

### Color system (sketch)

Strategy: **Restrained** — tinted neutrals + one ink accent.

| Token idea | Sketch |
|------------|--------|
| Paper | Warm-cool off-white *or* cool bone — **not** cream `#F4F1EA` cluster |
| Ink | Near-black with slight blue or green cast |
| Field contrast | Occasional full-bleed charcoal sections (projects / closing) |
| Accent | Single decisive accent (e.g. deep oxide blue or forest ink) — never neon cyan; never purple gradient |

Accent usage: links, index marks, focus rings, one CTA — not decorative underlines everywhere.

### Layout philosophy

- Asymmetric 12-column editorial grid with intentional breaks  
- Oversized name/title overlapping a thin rule or margin notation  
- Horizontal tension: text block offset against a full-bleed project still or portrait crop  
- Section indexes and running “folio” details (subtle, not gimmicky)  

### Hero composition

- Full-bleed quiet photographic or project plane (desaturated work UI or portrait environment)  
- Name as the largest type object  
- Role as secondary line  
- One sentence POV  
- CTA group: “Selected work” + “Contact”  
- No floating badges, glow orbs, or particle fields  

### Project presentation

- Horizontal or staggered list with large titles and small meta (year, stack)  
- Preview as full-bleed media strip on hover/focus (desktop); stacked media-first on mobile  
- Case study pages open like articles: problem statement as lead, then technical sections with code-adjacent but not terminal-costume UI  

### Motion language

- Typographic line reveals (clip/mask) on load  
- Coordinated stagger for hero lines (≤600–900ms total)  
- Scroll: section title pin-lite *without* hijacking scroll; opacity/translate once  
- Project row: preview crossfade or lateral slide on hover; keyboard-equivalent focus treatment  
- Page transitions: shared-element-ish title continuity (CSS/GSAP), not route theatre  

### Mobile adaptation

- Collapse asymmetry to a strong single column with preserved type scale drama  
- Hero media becomes background plane with stronger scrim for contrast  
- Project previews stack; hover behaviors become tap-to-expand / dedicated case-study navigation  
- Reduce parallax to near-zero  

### Accessibility & performance tradeoffs

| Upside | Cost / risk |
|--------|-------------|
| High readability; strong reduced-motion fallback | Large display type needs careful wrapping and contrast on photo heroes |
| Minimal continuous JS | Editorial layouts can CLS if fonts/images are not reserved |
| Accent restraint aids focus visibility | Easy to accidentally “SaaS-ify” if spacing becomes generic |

---

## Concept B — “Datum”

### Creative direction

A **precision drafting** world: the portfolio behaves like a calibrated instrument panel *translated into an Experience site* — measured grids, registration marks, annotation callouts — without becoming a fake IDE or cyber HUD. Cool, exact, slightly industrial. Distinct from Concept A by harder geometry and annotation language.

**World metaphor:** Survey sheet / engineering drawing set — alignment, scale bars, labeled callouts.

### Typography

| Role | Character |
|------|-----------|
| Display | Geometric grotesk with tabular figures |
| Body | Neutral grotesk optimized for UI-length reading |
| Annotation | Monospace **only** for coordinates, IDs, stack chips — not body copy |

Avoid: Matrix-green terminals, scanlines, neon frames.

### Color system (sketch)

Strategy: **Restrained → lightly Committed** on dark sheets.

| Token idea | Sketch |
|------------|--------|
| Sheet | Cool gray-blue light ground |
| Plate | Deep slate for project “plates” |
| Hairline | Mid gray rules (1px) used as structure |
| Accent | Amber or safety-mark yellow used like print registration — rare and loud when present |

### Layout philosophy

- Visible but quiet column guides / margin ticks  
- Projects as “sheets” with title blocks (name, role in project, stack, date)  
- Dense information allowed in case studies; homepage stays sparse  

### Hero composition

- Name set like a title block spanning the top  
- Large diagonal or offset crop of a real interface (Map Areas or placeholder plate)  
- Small annotation labels (“Full Stack · Brazil”) as drafting notes — not pill badges  
- Single primary CTA as a stamped action  

### Project presentation

- Title-block cards *only* if they encode real metadata interaction (expand / open case study)  
- Otherwise: sheet list with numbered plates  
- Case studies use callout “balloons” for challenges — carefully, not sticker spam  

### Motion language

- Hairlines draw in  
- Numbers/counters for section indexes  
- Project plates scale from registration point  
- Avoid continuous canvas; prefer CSS/GSAP line draws  

### Mobile adaptation

- Hide decorative ticks; keep title-block clarity  
- Annotations become a collapsible “specs” disclosure  
- Prefer vertical plate stack  

### Accessibility & performance tradeoffs

| Upside | Cost / risk |
|--------|-------------|
| Excellent technical credibility signal | Can tip into cold/unfriendly if portrait/humanity is weak |
| Clear metadata hierarchy for recruiters | Hairline UI fails contrast if overused |
| Low reliance on photo polish | Feels “tool costume” if monospaced chrome spreads too far |

---

## Concept C — “Cut”

### Creative direction

A **high-contrast cinematic cut**: alternating light “paper” and dark “theater” surfaces, abrupt scale changes, and crop-driven composition. More aggressive than Ledger; more emotional than Datum. Think title sequence meets portfolio — still editorial, but with harder montage energy.

**World metaphor:** Film title cards / print makeready sheets — hard cuts, overprint, crop marks as attitude (not decoration piles).

### Typography

| Role | Character |
|------|-----------|
| Display | Ultra-large, possibly mixed case with abrupt size steps inside one wordmark line |
| Body | Compact serif *or* grotesque — pick one; do not default to Playfair/Fraunces cluster |
| UI | Small sans for controls |

### Color system (sketch)

Strategy: **Committed dual-ground**.

| Token idea | Sketch |
|------------|--------|
| Light field | Bright paper white |
| Dark field | True black / near-black |
| Accent | Single electric-but-inked color (e.g. signal red-orange **or** cobalt — choose one; avoid purple) |
| Overprint | Occasional type crossing photo with multiply/difference — only where contrast still passes WCAG |

### Layout philosophy

- Hard full-bleed section breaks  
- Cropped imagery that ignores polite margins  
- Projects as sequential “cuts,” each with a different dominant scale  

### Hero composition

- Name occupying ≥40% of viewport height  
- Role tucked into a corner as a small title card  
- Dominant image edge-to-edge behind or beside type with intentional collision  
- CTA as understated text link cluster (not a big rounded button row)  

### Project presentation

- One project per viewport band on desktop when possible  
- Hover: image zooms within a hard crop window; title remains anchored  
- Case studies: long-scroll cinematic chapters with sticky chapter labels  

### Motion language

- Hard cuts / quick masks rather than soft fades  
- Scroll-linked crop reveals  
- Page transitions as wipe/cut (respect reduced motion → instant cut or fade)  
- Higher risk of motion sickness — must ship a strong reduced-motion mode  

### Mobile adaptation

- Preserve scale drama; reduce simultaneous collisions  
- Replace hover zoom with scroll-scrubbed crop (optional; only if performance allows)  
- Prefer fewer simultaneous animations  

### Accessibility & performance tradeoffs

| Upside | Cost / risk |
|--------|-------------|
| Highest distinctiveness / memorable first impression | Highest a11y and performance risk (contrast on overprints, motion) |
| Strong “not a template” signal | Harder to maintain; easier to look unfinished if assets are weak |
| Great for imagery-rich case studies | Thin project inventory makes empty drama obvious |

---

## Comparison

| Axis | A Ledger | B Datum | C Cut |
|------|----------|---------|-------|
| Distinctiveness | High (quiet confidence) | High (technical specificity) | Highest (aggressive) |
| Recruiter scan | Excellent | Excellent | Good if disciplined; easy to overstyle |
| Match to “editorial hybrid” brief | **Closest** | Adjacent (instrumental editorial) | Editorial-cinematic hybrid |
| Distance from prototype neon-cyber | Far | Far (if HUD avoided) | Far |
| Motion complexity | Medium | Medium | High |
| Asset dependency | Medium (type + 1–2 strong images) | Lower (can work with UI crops) | High (needs strong imagery) |
| Maintainability | High | High | Medium |
| a11y risk | Low–medium | Low–medium | Medium–high |
| AI-generic risk | Medium if palette drifts cream/serif | Medium if monospaces everywhere | Medium if red/black poster clichés |

---

## Locked hybrid contract

**Decision (2026-10-22 audit):** Deliberate hybrid — not a three-way mashup.

| Layer | Source | Owns |
|-------|--------|------|
| **Foundation** | **Ledger (A)** | Overall world, typography pairing, whitespace, asymmetric editorial grid, restrained accent strategy, homepage reading order |
| **Precision layer** | **Datum (B)** | Project/title-block metadata, tabular figures, annotation-style stack/spec lists, measured alignment cues (quiet — never fake IDE/HUD) |
| **Expression layer** | **Cut (C)** | Selected light/dark field contrasts, crop/scale drama on key plates, rhythm breaks between major bands, **selected** page/section transitions |

### Cohesion rules (mandatory)

1. **One world, layered grammar.** Ledger is the identity. Datum and Cut are dialects applied to specific jobs — not alternating skins per section.  
2. **Do not combine indiscriminately.** A section uses at most: Ledger structure + one of (Datum metadata | Cut contrast). Never stack Datum chrome + Cut wipe + Ledger ornaments in the same component.  
3. **Anti-conservative mandate.** Type scale, asymmetry, and at least one hard light/dark band must be bold enough that removing the nav would still identify this site. “Tasteful beige template” is a failure mode.  
4. **Anti-generic mandate.** Reject Inter-default stacks, cream/terracotta clusters, purple SaaS gradients, neon-cyber glow, equal card grids in the hero, and logo carousels as expertise theater.  
5. **Cut is rationed.** Use Cut for: (a) one primary hero crop or collision, (b) one major surface flip (e.g. Work or Closing on charcoal), (c) homepage→case-study transition experiments. Do not Cut-ify every scroll beat.  
6. **Datum is functional.** Metadata must improve scanability for engineers/recruiters. Hairlines and monospace stay subordinate to Ledger display type.

### Direction contract (surface)

- **THESIS:** An editorial folio that reads as engineered — precise where work is specified, cinematic only at intentional cuts.  
- **OWN-WORLD:** Tinted paper/ink neutrals + one restrained accent (Ledger); occasional full charcoal field (Cut); title-block meta on projects (Datum).  
- **STORY:** Visitor knows who André is immediately; selected work proves engineering depth; contact is unmistakable.  
- **FIRST VIEWPORT:** Name as hero-level type; one POV line; one CTA group; one dominant visual plane (crop/collision allowed). No badges, particles, or card grid.  
- **FORM:** Ledger foundation with named Datum + Cut borrowings (this section).  
- **FINISH:** Unreviewed and undocumented is unfinished; first-viewport quality is proven only by browser render + explicit visual approval (see visual validation gate in `IMPLEMENTATION_PLAN.md`).

### Risks of the hybrid (watchlist)

| Risk | Mitigation |
|------|------------|
| Becomes timid Ledger with stickers | Enforce anti-conservative mandate at first-viewport review |
| Becomes noisy Cut + Datum costume | Ration Cut; strip HUD/mono body copy |
| Incoherent “three concepts” collage | Cohesion rules above; one accent; one display family |

### Historical note

The three concepts above remain as reference material. They are no longer competing options. Palette/type sketches in A/B/C still inform tokens but must be reconciled under Ledger ownership during M1–M2.

---

## Decision status

| Item | Status |
|------|--------|
| Visual direction | **Locked** — Ledger × Datum × Cut hybrid |
| First-viewport visual approval | **Pending** (requires browser-rendered prototype after M1 foundations) |
| Full homepage static approval | **Pending** (after first-viewport gate) |
| M1 scaffold | **Blocked** until explicit written go-ahead |

No application implementation until André explicitly approves starting M1.
