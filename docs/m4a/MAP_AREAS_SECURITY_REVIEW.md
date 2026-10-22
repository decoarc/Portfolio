# Map Areas — Credential Exposure Review

**Reviewed:** 2026-10-22  
**Target:** sibling repo `DEV/geo-areas-php` (`https://github.com/decoarc/geo-areas-php`)  
**Portfolio action:** documentation only  
**Upstream action:** **none** — do not modify `geo-areas-php` without André’s explicit authorization  

**Policy for this document:** describe **files** and **credential types** only. Do **not** paste, quote, or reconstruct secret values.

---

## 1. Scope

Inspected local Map Areas sources and docs for credentials that could be:

- committed to git / visible on the public GitHub remote
- documented in README for local setup
- present only in local ignored files

Also noted related demo security properties already inventoried in M4a (open write endpoints, permissive CORS on the converter) — those are product limitations, not “leaked passwords,” but they raise the cost of any shared DB password.

---

## 2. Findings

| Severity | File (upstream) | Credential type | Classification | Notes |
|----------|-----------------|-----------------|----------------|-------|
| **High** | `README.md` | Postgres DB password (plaintext in setup docs) | **Potentially real** | Same value pattern as Compose; file is git-tracked and public on GitHub |
| **High** | `docker-compose.yml` | `POSTGRES_PASSWORD` (and related `POSTGRES_USER` / `POSTGRES_DB`) | **Potentially real** | Hardcoded compose env for local PostGIS; tracked in git |
| **Low / OK** | `.env.example` | `DB_PASS` placeholder | **Placeholder** | Uses an obvious non-secret placeholder string |
| **Info** | `.env` (local) | App DB settings (`DB_*`) | **Local secret store** | Listed in `.gitignore`; **not** tracked by git |
| **Info** | `connection.php` | Reads host/user/pass/db from env file | **No hardcoded password in source** | Loads `.env`-style values at runtime |
| **Info** | `update-areas.ts`, `update-perimeter.ts` | `password: config.DB_PASS` | **Code reference only** | Consumes config; not a committed secret by itself |
| **N/A** | `vendor/proj4php/**` | Coordinate system names containing “SK…” | **False positive** | Not application secrets |

No cloud API keys, OAuth tokens, Render API keys, or AWS-style credentials were identified in the application source/docs reviewed for this pass.

---

## 3. Placeholder vs potentially real

| Signal | Assessment |
|--------|------------|
| `.env.example` value | Placeholder — safe to keep as documentation |
| README + `docker-compose.yml` password | **Treat as a real shared local/demo password** until proven otherwise — it is a concrete non-placeholder string committed for Compose bootstrapping |
| Whether production (Render) uses the same value | **Unknown from Portfolio workspace** — assume reuse risk until André confirms Render env vars are distinct |

---

## 4. Related exposure (non-password)

Already documented in [PROJECT_EVIDENCE_INVENTORY.md](./PROJECT_EVIDENCE_INVENTORY.md); restated for Gate D hygiene:

| Issue | Why it matters with DB credentials |
|-------|------------------------------------|
| Unauthenticated write endpoints on the live demo | Anyone who can reach the demo may mutate data if the DB is reachable |
| `Access-Control-Allow-Origin: *` on coordinate converter | Broad browser access to that endpoint |

These do not replace password remediation; they amplify impact if DB credentials leak or if the demo DB is internet-exposed with a known password.

---

## 5. Recommended remediation (upstream — authorization required)

Perform in `geo-areas-php` (and hosting dashboards), **not** in Portfolio:

1. **Scrub history-sensitive docs:** Replace README password with a pointer to `.env` / `.env.example`; remove concrete passwords from Compose in favor of env substitution or a local override file that is gitignored.  
2. **Rotate:** Change any password that matched the committed value — local Docker volume, and **any remote** DB (Render or otherwise) if that value was reused.  
3. **Confirm `.env` never committed** (already gitignored; keep it that way).  
4. **Optional hardening (demo):** rate-limit or disable public writes; tighten CORS; document “public demo, not production security.”  
5. **Git history:** If the password was ever production-grade, consider history rewrite or treat the secret as permanently burned and rotate everywhere — decide with André; do not rewrite from Portfolio agents.

---

## 6. Portfolio constraints

- Do **not** copy upstream credentials into Portfolio content, case studies, or commits.  
- Case-study copy may mention “demo has no auth” as a limitation; must **not** include connection strings or passwords.  
- Gate E publication is not blocked solely by this review, but scrubbing upstream before promoting credibility of the public repo is strongly recommended (decision **D8** in [OPEN_EVIDENCE_AND_DECISIONS.md](./OPEN_EVIDENCE_AND_DECISIONS.md)).
