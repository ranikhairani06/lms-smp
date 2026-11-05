. (Join-Path $PSScriptRoot 'runtime.ps1')
$composerPhar = $env:LMS_COMPOSER_PHAR
if (-not $composerPhar) {
    $composerPhar = Join-Path (Split-Path (Get-Command composer).Source) 'composer.phar'
}
if (-not (Test-Path $composerPhar)) {
    throw 'Atur LMS_COMPOSER_PHAR ke lokasi composer.phar Anda.'
}
Push-Location (Join-Path $PSScriptRoot 'team')
try {
    & $backendPhp $composerPhar @args
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
