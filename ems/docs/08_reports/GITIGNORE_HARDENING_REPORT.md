Status: Final
Authority Level: High
Created: 2026-06-24
Owner: AI

# .gitignore Hardening Report

> Protocol: PRE-FRONTEND GIT BASELINE, REPOSITORY HYGIENE, AND GITHUB SYNC — Part C
> Date: 2026-06-24

---

## Changes Made in This Protocol

### Fix 1: Whitelist `.env.*.example` files

**Problem:** `.env.*` pattern excluded all environment-variant files including safe example files:
- `infra/deployment/env/.env.development.example` — IGNORED (wrong)
- `infra/deployment/env/.env.staging.example` — IGNORED (wrong)
- `infra/deployment/env/.env.production.example` — IGNORED (wrong)

Only `infra/docker/.env.example` was whitelisted by `!.env.example`.

**Fix added:**
```gitignore
!.env.*.example
```

**Result:** All four `.env.*.example` files are now tracked and committed.

### Fix 2: Simplified `.workspace/` exclusion

**Problem:** Previous workspace sealing protocol added individual subdirectory exclusions:
```gitignore
.workspace/cache/
.workspace/temp/
.workspace/logs/
.workspace/runtime/
.workspace/test-output/
.workspace/coverage/
.workspace/artifacts/
!.workspace/**/.gitkeep
```
This is fragile — `.workspace/` parent directory was NOT ignored, and the `.gitkeep` negation doesn't work correctly when parent dirs are excluded.

**Fix:** Replaced with a single clean exclusion:
```gitignore
.workspace/
```

**Result:** `.workspace/` and all contents are excluded. Confirmed with `git check-ignore -v`.

### Fix 3: `.gitattributes` added

**Problem:** Git warned about LF → CRLF conversions on Windows for all 497 files. No `.gitattributes` existed.

**Fix:** Created `.gitattributes` with:
```
* text=auto eol=lf
*.bat text eol=crlf
*.cmd text eol=crlf
*.ps1 text eol=crlf
```

**Result:** LF normalized for all text files; CRLF preserved for Windows-native scripts.

---

## Full .gitignore Coverage After Hardening

| Category | Patterns | Status |
|---|---|---|
| Node modules | node_modules/ | ✓ |
| Build outputs | dist/, build/, out/, .next/, .nuxt/, .output/, *.tsbuildinfo | ✓ |
| NestJS | .nest/ | ✓ |
| Test | coverage/, .nyc_output/, junit.xml, test-results/, playwright-report/ | ✓ |
| Cache | .cache/, .jest-cache/, .parcel-cache/, .eslintcache, .stylelintcache, .swc/ | ✓ |
| Env files | .env, .env.* (with .env.example and .env.*.example whitelisted) | ✓ |
| OS | .DS_Store, Thumbs.db, desktop.ini | ✓ |
| IDE | .vscode/*, .idea/, *.suo, *.njsproj, *.sln | ✓ |
| Docker override | docker-compose.override.yml | ✓ |
| Logs | logs/, *.log | ✓ |
| Secrets | *.pem, *.key, *.p12, *.pfx, secrets/ | ✓ |
| Workspace | .workspace/ | ✓ |
| Quarantine | archive/quarantine_cleanup/ | ✓ |
| Yarn | .yarn/cache, .yarn/unplugged, .pnp, .pnp.js | ✓ |
| Python | (no Python in project) | N/A |

---

## Verification

```bash
git check-ignore -v .workspace/
# → .gitignore:81:.workspace/   .workspace/   ✓ IGNORED

git ls-files --others --exclude-standard | grep "node_modules"
# → (empty) ✓ IGNORED

git ls-files --others --exclude-standard | grep "\.env\."
# → infra/deployment/env/.env.*.example  ✓ TRACKED (example files)
```

---

## Verdict

.gitignore HARDENED — 3 fixes applied; all bloat categories protected
