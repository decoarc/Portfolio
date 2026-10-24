# Upstream Security Remediation — Planning Only

**Repo:** `geo-areas-php`  
**Parent backlog:** [UPSTREAM_BACKLOG.md](./UPSTREAM_BACKLOG.md) (item 1 — credentials; item 2 — write endpoints)  
**Authorization level:** Planning documentation in Portfolio only  
**This pass:** **No** modifications to the upstream repository

---

## Known issue classes (no secret values)

| Issue | Where (upstream) | Risk |
|-------|------------------|------|
| Plaintext DB password in setup docs | Tracked `README.md` | Public exposure of a concrete local/demo password |
| Hardcoded Compose DB password | Tracked `docker-compose.yml` | Same value pattern committed for local boot |
| Local `.env` | Gitignored (good) | Must remain untracked |
| Unauthenticated write endpoints | Public demo PHP save paths | Demo DB mutable if reachable |
| Permissive CORS on converter | `Access-Control-Allow-Origin: *` | Broad browser access to converter |

---

## Recommended remediation steps (for a future authorized upstream PR)

1. Replace README password examples with pointers to `.env` / `.env.example` placeholders.  
2. Move Compose secrets to env substitution or a gitignored override file.  
3. Rotate any password that matched the committed value — local volumes **and** any remote DB if reused.  
4. Confirm `.env` never enters git history as a tracked file going forward.  
5. Optionally harden the public demo (disable or gate writes; tighten CORS).  
6. After remediation, re-evaluate showing `hrefRepo` on the Portfolio Work card.

---

## Portfolio coupling

- Map Areas remains `preview` / `evidenceComplete: false`.  
- Site **omits** `hrefRepo` until credential remediation (backlog item 1) is done.  
- Case study may mention unauthenticated writes as a **demo limitation**, never connection secrets.  
- Full upstream future work (GitHub refresh, product PT/EN) lives in [UPSTREAM_BACKLOG.md](./UPSTREAM_BACKLOG.md) — outside Portfolio scope.
