# Run this yourself (double-click, or `.\scripts\qa\run-provision-qa-fixture.ps1`
# from the repo root) — Claude Code's safety classifier blocks this action when
# attempted directly, since it mutates live production (creates real Cognito
# users/groups and DynamoDB rows). Nothing here is destructive: it only
# creates a dedicated QA platform-admin account, two organizations
# (qa-fixture-a, qa-fixture-b), and staff/client accounts inside each. Safe
# to re-run — existing accounts are left alone (just get a fresh password).
#
# Requires: AWS CLI profile "amplify-admin" configured on this machine
# (already set up from earlier sessions).

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $repoRoot

Write-Host "Provisioning QA fixture in PRODUCTION (front-end-btp)..." -ForegroundColor Cyan
npx tsx scripts/qa/provision-qa-fixture.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nDone. Credentials written to .env.qa.json (gitignored)." -ForegroundColor Green
} else {
    Write-Host "`nScript exited with an error (code $LASTEXITCODE) — see output above." -ForegroundColor Red
}
