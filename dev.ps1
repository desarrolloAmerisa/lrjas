$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot

function Ensure-Dependencies {
    param([string]$Path, [string]$Name)

    if (-not (Test-Path "$Path\node_modules")) {
        Write-Host "Instalando dependencias de $Name..." -ForegroundColor Yellow
        Push-Location $Path
        npm install
        Pop-Location
    }
}

Write-Host ""
Write-Host "LRJAS — levantando servidores" -ForegroundColor Green
Write-Host ""

Ensure-Dependencies $Root "raíz"
Ensure-Dependencies "$Root\backend" "backend"
Ensure-Dependencies "$Root\frontend" "frontend"

Write-Host "Backend:  http://localhost:3001/api" -ForegroundColor DarkGray
Write-Host "Frontend: http://localhost:5173" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Ctrl+C para detener ambos servicios." -ForegroundColor DarkGray
Write-Host ""

Set-Location $Root
npm run dev
