# M4a — Project Inventory & Case Study Evidence

**Status:** Delivered — Gate D hosting locked; M4b awaits explicit go-ahead  
**Scope:** Content inventory, case-study structure, hosting/routing (now decided)  
**Non-goals:** Routing implementation, Cloudflare connect/deploy, homepage redesign  

Gate D closure: [GATE_D_CLOSURE.md](./GATE_D_CLOSURE.md) · M4b plan stub: [../m4b/README.md](../m4b/README.md)

## Deliverables

| # | Document | Purpose |
|---|----------|---------|
| 1 | [PROJECT_EVIDENCE_INVENTORY.md](./PROJECT_EVIDENCE_INVENTORY.md) | Verified Map Areas facts + other candidates with repo material |
| 2 | [CASE_STUDY_CONTENT_SPEC.md](./CASE_STUDY_CONTENT_SPEC.md) | Reusable case-study structure mapped to content types |
| 3 | [HOSTING_AND_ROUTING.md](./HOSTING_AND_ROUTING.md) | **Locked** Cloudflare Pages + SPA fallback plan for `/work/:slug` |
| 4 | [PUBLICATION_READINESS.md](./PUBLICATION_READINESS.md) | draft / preview / published recommendations |
| 5 | [OPEN_EVIDENCE_AND_DECISIONS.md](./OPEN_EVIDENCE_AND_DECISIONS.md) | Remaining evidence and decisions before Gate E / M4b |
| 6 | [GATE_D_CLOSURE.md](./GATE_D_CLOSURE.md) | Gate D prep results, blockers, M4b recommendation |
| 7 | [MAP_AREAS_SECURITY_REVIEW.md](./MAP_AREAS_SECURITY_REVIEW.md) | Upstream credential exposure (no secret values) |
| 8 | [CASE_STUDY_READINESS.md](./CASE_STUDY_READINESS.md) | Which sections are fact-ready vs blocked |

## Sources consulted (read-only outside Portfolio)

| Source | Role |
|--------|------|
| `Portfolio/src/content/**` | Current content model and publication helpers |
| `Portfolio/docs/ARCHITECTURE.md`, `IMPLEMENTATION_PLAN.md` | Publication rules, Gate D/E |
| Sibling `prototype/` | Legacy Work card copy + cover PNG provenance |
| Sibling `geo-areas-php/` | Authoritative Map Areas source (not under Portfolio/) |
| Live demo | `https://geo-areas-php.onrender.com/` (Render; cold start observed) |
| Public repo | `https://github.com/decoarc/geo-areas-php` |

## Evidence integrity

- Claims are labeled **Verified**, **Interpretation**, or **Missing**.
- No fabricated metrics, employers, or features.
- Incomplete case studies must not be marked `published` + `evidenceComplete`.
