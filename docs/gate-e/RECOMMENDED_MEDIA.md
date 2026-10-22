# Recommended Media — Map Areas Gate E

**Current assets (sufficient for minimum publish):**

| Asset | Location | Notes |
|-------|----------|-------|
| Cover | `public/images/projects/map-areas.webp` (+ `-800.webp`) | São Paulo map + sidebar; already on homepage and preview page |
| Live demo | `https://geo-areas-php.onrender.com/` | Interactive proof; cold-start caveat |

---

## Additional screenshots that would materially help

Capture from the **running app** (local or demo). Optimize to WebP; include intrinsic `width`/`height` and descriptive `alt`. Do **not** generate fake UI.

| Priority | Shot | Why it helps recruiters |
|----------|------|-------------------------|
| **P1** | Polygon draw in progress (Leaflet.Draw handles visible) | Shows interaction, not just a static map |
| **P1** | Saved areas list with one selected + fitted bounds | Shows persistence / retrieval |
| **P1** | Coordinate modal (paste UTM or GMS) | Differentiator vs “just a map demo” |
| **P2** | Info modal with area km² + perimeter km | Makes PostGIS measurements visible |
| **P2** | Coordinate readout toggled to UTM (southern zone) | Supports CRS story without jargon-only text |
| **P3** | Optional short GIF/WebM (~10–20s): draw → name → save → select | Reduces friction of cold-start demo |

Suggested filenames (when authorized to add assets):

```text
public/images/projects/map-areas-draw.webp
public/images/projects/map-areas-list.webp
public/images/projects/map-areas-coords.webp
public/images/projects/map-areas-measure.webp
```

---

## Capture guidelines

- Prefer 1200×900 or similar 4:3 to match existing cover rhythm  
- Keep PT UI chrome readable (do not crop away sidebar labels)  
- No credential UI, `.env`, or DBeaver password dialogs in frame  
- No fake overlays (“Enterprise”, fake metrics)

---

## Gallery vs minimum

| Publish bar | Media requirement |
|-------------|-------------------|
| `evidenceComplete` minimum | Cover + live demo (gallery optional per M4a spec) |
| Stronger recruiter case | Cover + ≥2 of P1 stills + live demo |

Gate E prep does **not** add image files; capture happens after owner chooses priority.
