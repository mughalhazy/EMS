<#
.SYNOPSIS
  Verifies the Phase B infra modules compile cleanly.
  Run from D:\SaaS\EMS\ems\
#>
Set-Location "D:\SaaS\EMS\ems"

Write-Host "=== TypeScript compile check ===" -ForegroundColor Cyan
$result = npx tsc --noEmit 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "PASS - no TypeScript errors" -ForegroundColor Green
} else {
    Write-Host "FAIL" -ForegroundColor Red
    $result | ForEach-Object { Write-Host $_ }
}

Write-Host "`n=== npm audit ===" -ForegroundColor Cyan
npm audit --audit-level=high 2>&1 | Select-Object -Last 10
