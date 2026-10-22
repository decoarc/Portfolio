# Unverified Claims & Owner Questions

**Purpose:** Separate what is safe to publish from what needs André’s voice or confirmation.  
**Rule:** Nothing in the “needs confirmation” or “missing” lists should ship as asserted fact without an answer.

---

## 1. Interpretations (plausible — not yet confirmed)

| ID | Statement in draft | Why it is only [I] |
|----|--------------------|--------------------|
| I1 | Personal / learning motivation (not a client brief) | No README problem statement; no client artifacts |
| I2 | Solo builder of UI, API, schema, CRS, packaging | Repo under `decoarc`; no co-author evidence found — still not proof |
| I3 | Motivated by Brazil geospatial practice | Map defaults to São Paulo; not explicit motivation text |
| I4 | MySQL → PostGIS was an intentional hardening choice | Migration commit exists; “why” is inferred |
| I5 | Year label `2025` (or 2025–2026) | Git dates support a range; field format is a single optional number |

---

## 2. Missing evidence (do not invent)

| ID | Gap | Impact if invented |
|----|-----|--------------------|
| M1 | Author-approved problem paragraph | Fake client / fake pain story |
| M2 | Collaborator credits (if any) | Misattribution |
| M3 | Quantitative outcomes (users, scale, perf) | Recruiter-detectable inflation |
| M4 | Extra gallery stills (draw, UTM, modal) | Weak visual proof of depth (optional) |
| M5 | Confirmation to show `hrefRepo` on Work card | Privacy / presentation preference |
| M6 | Willingness to keep public writable demo as-is | Honesty vs hardening narrative |
| M7 | Upstream GitHub description still mentions MySQL/Google Maps | Contradicts case-study stack if recruiters open the repo |

---

## 3. Concise questions for the project owner

Please answer in-line (short answers are fine):

### Narrative

1. **Problem (D3):** Approve the draft problem paragraph in `MAP_AREAS_NARRATIVE_DRAFT.md` §B, or paste your preferred 2–4 sentences.  
2. **Role (D4):** Were you the sole builder? Anyone to credit (pair, mentor, course)?  
3. **Year (D6):** Prefer `year: 2025`, omit year, or another label?

### Links & hygiene

4. **Repo link (D5):** Show `https://github.com/decoarc/geo-areas-php` on the Work card and case study? (Recommend **yes**.)  
5. **GitHub blurb:** Will you update the remote description away from MySQL/Google Maps before publish?  
6. **Credentials (D8):** Acknowledge upstream README/Compose password exposure will be scrubbed/rotated **outside** Portfolio before or soon after publish? (Do not paste secrets here.)

### Outcomes & demo honesty

7. **Outcomes:** Any qualitative outcomes to add beyond live demo + public source + skill demonstration? (If none, the draft’s qualitative list is enough.)  
8. **Writable demo:** OK to state that the public demo has **no authentication** on save endpoints, as an honesty limitation?

### Media

9. **Gallery:** Want 2–4 extra stills before publish (see `RECOMMENDED_MEDIA.md`), or is cover + live demo enough for v1?  
10. **PT UI note:** Confirm we state once that the product UI is Portuguese while the case study is English.

### Publication

11. After answers, authorize a **separate apply pass** to write approved copy into `map-areas.ts` and set `published` + `evidenceComplete: true`? (Not done in this Gate E prep.)

---

## 4. Claims explicitly blocked until answered

- Any sentence implying employment, client delivery, or “production system for …”  
- Any metric (users, areas saved, uptime %, performance)  
- Any security “production-ready” claim  
- Listing MySQL or Google Maps as current technologies
