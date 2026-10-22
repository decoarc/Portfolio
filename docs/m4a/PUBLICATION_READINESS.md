# Publication Readiness Assessment

**Milestone:** M4a  
**Rule:** Do not auto-publish incomplete case studies. Homepage may keep `preview` listings.

---

## 1. Status definitions (recap)

| Status | Homepage | Case-study CTA | Intent |
|--------|----------|----------------|--------|
| `draft` | Hidden | No | Incomplete inventory or not ready to show |
| `preview` | Shown | No (“Case study soon”) | Honest teaser + optional live demo |
| `published` | Shown | Yes if `evidenceComplete` | Full evidenced case study |

---

## 2. Map Areas (`map-areas`)

| Dimension | Assessment |
|-----------|------------|
| **Recommended status now** | Keep **`preview`** |
| **`evidenceComplete`** | Keep **`false`** |
| Ready for homepage listing? | **Yes** (already shipped) |
| Ready for live demo link? | **Yes** (with cold-start caveat) |
| Ready for `/work/map-areas`? | **No** — narrative fields are still TBD placeholders in `map-areas.ts` |
| Path to `published` | Fill case-study sections per [CASE_STUDY_CONTENT_SPEC.md](./CASE_STUDY_CONTENT_SPEC.md) using [PROJECT_EVIDENCE_INVENTORY.md](./PROJECT_EVIDENCE_INVENTORY.md); add `hrefRepo`; optional gallery; André review; then Gate E |

**Verdict:** Strongest (and only) v1 case-study candidate. **Preview today → publish after Gate E**, not before M4b content rewrite.

---

## 3. Other repositories with material

| Project | Recommended status if added | Why |
|---------|----------------------------|-----|
| AssetFlow | `draft` | Substantial CMMS; needs deliberate public framing, screenshots/demo, and André OK before even `preview` |
| JobTrack | `draft` | Clear product story in README; no Portfolio assets/links yet |
| MindHub | `draft` | Desktop app; capture/demo plan required |
| occupational-risk-platform (NR1 Risk) | `draft` | Explicitly a non-production prototype — only show with that framing |

**Verdict for v1 Work section:** Do **not** expand the public list until at least Map Areas case study is evidenced. Homepage `moreSoonNote` already covers honesty. Optional: add 0–1 extra **`preview`** cards later only with cover + accurate tagline + safe links.

---

## 4. Readiness matrix

| Project | Inventory | Cover | Live | Repo public | Narrative | Case study publish? |
|---------|-----------|-------|------|-------------|-----------|---------------------|
| Map Areas | Strong | Yes | Yes | Yes | Incomplete in Portfolio | **Not yet** |
| AssetFlow | Partial (README) | No | Unknown | Remote exists | Missing | No |
| JobTrack | Partial (README) | No | Unknown | Remote exists | Missing | No |
| MindHub | Partial (README) | No | N/A desktop | Remote exists | Missing | No |
| NR1 Risk | Partial (README) | No | Local prototype | Remote exists | Missing | No |

---

## 5. Recommended v1 publication plan

1. **Now (post–Gate D prep):** Map Areas remains `preview`; no case-study route link; stack tags reflect PHP / PostGIS / Leaflet / proj4.  
2. **M4b (host locked — Cloudflare Pages; needs explicit go-ahead):** Implement routes + template + `_redirects`; keep Map Areas unpublished until content passes checklist.  
3. **Gate E:** Map Areas → `published` + `evidenceComplete: true` when narrative + review complete.  
4. **Later:** Promote a second project from `draft` → `preview` only with real media and links — still no publish without evidence.

See also [CASE_STUDY_READINESS.md](./CASE_STUDY_READINESS.md).

---

## 6. Explicit non-actions

- Do not set `published` while `problem` / responsibilities / implementation / challenges remain TBD stubs.  
- Do not invent second/third Work cards from repo names alone.  
- Do not treat GitHub stars, commit counts, or Render uptime as outcomes.
