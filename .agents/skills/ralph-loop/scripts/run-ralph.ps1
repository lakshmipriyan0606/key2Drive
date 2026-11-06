<#
.SYNOPSIS
    Ralph Loop Automated Progress Checker & Verification Harness for Windows PowerShell
.DESCRIPTION
    Inspects PRD.md for task progress, executes verification commands, and outputs status.
#>

param (
    [string]$PrdPath = "PRD.md",
    [string]$ProgressPath = "progress.txt",
    [switch]$VerifyTests
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   RALPH LOOP FOR ANTIGRAVITY STATUS     " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

if (-not (Test-Path $PrdPath)) {
    Write-Warning "PRD file not found at $PrdPath. Create one from PRD.template.md."
    exit 1
}

$prdContent = Get-Content $PrdPath
$totalTasks = ($prdContent | Select-String -Pattern "^- \[[ xX]\]").Count
$completedTasks = ($prdContent | Select-String -Pattern "^- \[[xX]\]").Count
$remainingTasks = ($prdContent | Select-String -Pattern "^- \[ \]").Count

Write-Host "Total Tasks:     $totalTasks" -ForegroundColor White
Write-Host "Completed:       $completedTasks" -ForegroundColor Green
Write-Host "Remaining:       $remainingTasks" -ForegroundColor Yellow

if ($remainingTasks -eq 0 -and $totalTasks -gt 0) {
    Write-Host "`n🎉 ALL TASKS COMPLETED! Ralph Loop goal achieved." -ForegroundColor Green
} else {
    $nextTask = ($prdContent | Select-String -Pattern "^- \[ \]").Line | Select-Object -First 1
    Write-Host "`n👉 NEXT ATOMIC TASK:" -ForegroundColor Cyan
    Write-Host "   $nextTask" -ForegroundColor White
}

if ($VerifyTests) {
    Write-Host "`nRunning Test Verification..." -ForegroundColor Yellow
    npm run typecheck
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Typecheck failed!"
        exit $LASTEXITCODE
    }

    npx vitest run
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Tests failed!"
        exit $LASTEXITCODE
    }

    Write-Host "Verification Passed Cleanly! (100% Green)" -ForegroundColor Green
}

