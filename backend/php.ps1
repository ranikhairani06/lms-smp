. (Join-Path $PSScriptRoot 'runtime.ps1')
Push-Location (Join-Path $PSScriptRoot 'team')
try {
    & $backendPhp @args
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
