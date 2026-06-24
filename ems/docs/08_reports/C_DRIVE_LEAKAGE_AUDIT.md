Status: Final
Authority Level: High
Created: 2026-06-24
Owner: AI

# C: Drive Leakage Audit

> Scope: All tools and processes originating from D:\SaaS\EMS workspace
> Date: 2026-06-24
> Verdict: NO EMS-GENERATED C: LEAKAGE DETECTED

---

## Leakage Audit Table

| Path / Tool | Current Location | Risk | Required Fix |
|---|---|---|---|
| npm cache | D:\npm-cache | NONE — correctly on D: | None |
| npm global prefix | D:\npm | NONE — correctly on D: | None |
| pnpm store | Not configured | NONE | None |
| yarn cache | Not present | NONE | None |
| Node TEMP/TMP | D:\Temp (env vars) | NONE — correctly on D: | None |
| Build output (dist/) | Was ems/dist/ — REMOVED | NONE — artifact cleaned | Done |
| Test output | Not present | NONE | None |
| Coverage output | Not present | NONE | None |
| Log files | Not present | NONE | None |
| Runtime output | Not present | NONE | None |

---

## C: Drive Paths Found

### C:\Users\Admin\AppData\Roaming\npm

| Field | Detail |
|---|---|
| Size | 710.81 MB |
| Contents | @anthropic-ai (claude CLI), @openai (codex CLI) — node_modules |
| Origin | Installed before user-level .npmrc redirected prefix to D:\npm |
| EMS-generated? | NO — system-level global CLI tools |
| Active? | PARTIALLY — D:\npm also has both packages (active); C: copies are stale duplicates |
| PATH resolution | Both C:\Users\Admin\AppData\Roaming\npm AND D:\npm are in PATH |
| Risk to EMS | NONE — EMS project does not install or depend on these global tools |
| Risk to system | LOW — duplicate tools in PATH; D:\npm resolves first in most contexts |
| Recommended action | User may optionally delete C:\Users\Admin\AppData\Roaming\npm after verifying D:\npm CLI tools function correctly. NOT an EMS cleanup task. |

### C:\npm-global (PATH entry)

| Field | Detail |
|---|---|
| Exists on disk | NO |
| In PATH | YES |
| EMS-generated? | NO — pre-existing PATH entry |
| Risk | LOW — dead entry; resolves to nothing |
| Recommended action | Remove C:\npm-global from system PATH via Control Panel > System > Advanced > Environment Variables |

---

## Confirmed C: Drive Paths — NOT PRESENT

| Path | Status |
|---|---|
| C:\Users\Admin\AppData\Roaming\npm-cache | NOT FOUND |
| C:\Users\Admin\AppData\Local\pnpm | NOT FOUND |
| C:\Users\Admin\AppData\Local\Yarn | NOT FOUND |
| C:\Users\Admin\AppData\Local\npm | NOT FOUND |

---

## npm Config — Sealing Evidence

**ems/.npmrc (project-level):**
```
cache=D:\npm-cache
prefer-offline=false
fund=false
audit=false
```

**C:\Users\Admin\.npmrc (user-level):**
```
prefix=D:\npm
```

**System TEMP/TMP:**
```
TEMP=D:\Temp
TMP=D:\Temp
```

All project-originating npm writes are confirmed to target D: drive.

---

## Verdict

**NO EMS-GENERATED C: LEAKAGE**

The two C: findings (AppData\Roaming\npm and dead C:\npm-global PATH) are pre-existing system-level artifacts unrelated to EMS workspace activity. They do not represent leakage caused by EMS development operations.
