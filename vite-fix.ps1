Write-Host "Reparam React Router CLI..."

$cliUrl = "https://raw.githubusercontent.com/remix-run/react-router/main/packages/dev/dist/cli.mjs"
$cliPath = "node_modules/@react-router/dev/dist/cli.mjs"

if (-Not (Test-Path "node_modules/@react-router/dev/dist")) {
    New-Item -ItemType Directory -Path "node_modules/@react-router/dev/dist" -Force | Out-Null
}

Invoke-WebRequest -Uri $cliUrl -OutFile $cliPath

if (Test-Path $cliPath) {
    Write-Host "cli.mjs a fost adaugat cu succes!"
} else {
    Write-Host "Eroare: fisierul nu s-a putut copia!"
}

Write-Host "Pornim proiectul..."
npm run dev
