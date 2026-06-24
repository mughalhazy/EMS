<#
.SYNOPSIS
  Seals the EMS workspace against npm/cache/build leakage to C:.
  Run once per machine or after a Windows profile reset.
  All tool caches are redirected to D:, telemetry is disabled.

.USAGE
  powershell -ExecutionPolicy Bypass -File .\scripts\setup-env.ps1
#>

$ErrorActionPreference = "Stop"

# ── 1. Directories ────────────────────────────────────────────────────────
$dirs = @(
    "D:\npm-cache",
    "D:\npm",
    "D:\Temp",
    "D:\playwright-browsers",
    "D:\cypress-cache",
    "D:\node-gyp",
    "D:\jest-cache",
    "D:\nx-cache",
    "D:\turbo-cache"
)
foreach ($d in $dirs) {
    if (-not (Test-Path $d)) { New-Item -ItemType Directory -Force $d | Out-Null }
    Write-Host "  DIR  $d"
}

# ── 2. Permanent user-scope environment variables ─────────────────────────
$vars = [ordered]@{
    # npm
    "npm_config_cache"           = "D:\npm-cache"
    "npm_config_prefix"          = "D:\npm"

    # Playwright / Puppeteer
    "PLAYWRIGHT_BROWSERS_PATH"   = "D:\playwright-browsers"
    "PUPPETEER_CACHE_DIR"        = "D:\playwright-browsers"

    # Cypress
    "CYPRESS_CACHE_FOLDER"       = "D:\cypress-cache"

    # node-gyp native builds
    "npm_config_nodedir"         = "D:\node-gyp"

    # Jest transform cache
    "JEST_CACHE_DIR"             = "D:\jest-cache"

    # Nx monorepo cache
    "NX_CACHE_DIRECTORY"         = "D:\nx-cache"

    # Turborepo cache
    "TURBO_CACHE_DIR"            = "D:\turbo-cache"

    # REPL history off C:
    "NODE_REPL_HISTORY"          = "D:\Temp\.node_repl_history"

    # Telemetry off
    "NEXT_TELEMETRY_DISABLED"    = "1"
    "NESTJS_TELEMETRY_DISABLED"  = "true"

    # Posix-style TMPDIR for tools that honour it
    "TMPDIR"                     = "D:\Temp"
}

foreach ($key in $vars.Keys) {
    [System.Environment]::SetEnvironmentVariable($key, $vars[$key], "User")
    Write-Host "  ENV  $key = $($vars[$key])"
}

# ── 3. npm user config (.npmrc) ───────────────────────────────────────────
$npmrcPath = "$env:USERPROFILE\.npmrc"
$npmrcContent = @"
cache=D:\npm-cache
prefix=D:\npm
"@
Set-Content -Path $npmrcPath -Value $npmrcContent -Encoding utf8
Write-Host "  NPMRC  $npmrcPath updated"

Write-Host ""
Write-Host "Workspace sealed. Open a NEW terminal for env vars to take effect." -ForegroundColor Green
