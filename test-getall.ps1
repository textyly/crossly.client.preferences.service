# test-getall.ps1
# Tests the GET /preferences ("getAll") endpoint of crossly.client.preferences.service.
# - Starts the service if it isn't already running (compiling first if needed)
# - Seeds a couple of sample records so getAll has something to return
# - Calls GET /preferences and prints the result
#
# Usage:  powershell -ExecutionPolicy Bypass -File .\test-getall.ps1

$ErrorActionPreference = 'Stop'
$base = 'http://localhost:5002'
$serviceDir = $PSScriptRoot

function Test-ServerUp {
    try { Invoke-RestMethod "$base/health" -TimeoutSec 1 | Out-Null; return $true } catch { return $false }
}

$startedByScript = $false
$server = $null

if (-not (Test-ServerUp)) {
    Write-Host "Server not running - starting it..." -ForegroundColor Yellow
    if (-not (Test-Path (Join-Path $serviceDir 'dist\app.js'))) {
        Push-Location $serviceDir
        npm run compile
        Pop-Location
    }
    $server = Start-Process node -ArgumentList 'dist/app.js' -WorkingDirectory $serviceDir -PassThru -NoNewWindow
    $startedByScript = $true
    for ($i = 0; $i -lt 20 -and -not (Test-ServerUp); $i++) { Start-Sleep -Milliseconds 300 }
}

try {
    Write-Host "`nSeeding sample preferences..." -ForegroundColor Cyan
    @(
        @{ clientId = 'user-1'; theme = 'dark';  language = 'bg' },
        @{ clientId = 'user-2'; theme = 'light'; language = 'en' }
    ) | ForEach-Object {
        Invoke-RestMethod "$base/preferences" -Method Post -Body ($_ | ConvertTo-Json) -ContentType 'application/json' | Out-Null
    }

    Write-Host "`nGET $base/preferences  (getAll):" -ForegroundColor Green
    $all = Invoke-RestMethod "$base/preferences" -Method Get
    $all | ConvertTo-Json -Depth 5
    Write-Host "`nCount: $($all.Count)" -ForegroundColor Green
}
finally {
    if ($startedByScript -and $server) {
        Stop-Process -Id $server.Id -Force
        Write-Host "`nStopped the server that this script started." -ForegroundColor Yellow
    }
}
