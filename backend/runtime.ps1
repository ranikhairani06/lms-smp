$ErrorActionPreference = 'Stop'
# Override this with a supported PHP 8.3/8.4 executable on another machine.
$backendPhp = $env:LMS_PHP_BIN
if (-not $backendPhp) {
    $localPhp = Join-Path $PSScriptRoot '.runtime/php/php.exe'
    if (Test-Path $localPhp) {
        $backendPhp = $localPhp
    } else {
        $backendPhp = (Get-Command php).Source
    }
}
$version = & $backendPhp -n -r 'echo PHP_VERSION_ID;'
if ([int]$version -lt 80300 -or [int]$version -ge 80500) {
    throw 'composer.lock membutuhkan PHP 8.3-8.4. Atur LMS_PHP_BIN ke lokasi php.exe yang sesuai.'
}
$runtimeDirectory = Join-Path $PSScriptRoot '.runtime/conf'
New-Item -ItemType Directory -Force -Path $runtimeDirectory | Out-Null
$extensionDirectory = ((Join-Path (Split-Path $backendPhp) 'ext') -replace '\\', '/')
$settings = 'extension_dir="' + $extensionDirectory + '"'
Set-Content -LiteralPath (Join-Path $runtimeDirectory 'extensions.ini') -Value $settings -Encoding ASCII
$env:PHPRC = Join-Path $PSScriptRoot 'php-conf/php.ini'
$env:PHP_INI_SCAN_DIR = $runtimeDirectory
# Laravel needs these empty runtime directories even on a fresh Git clone.
foreach ($relativePath in @('storage/framework/views', 'storage/framework/sessions', 'storage/framework/cache/data', 'storage/logs', 'bootstrap/cache')) {
    New-Item -ItemType Directory -Force -Path (Join-Path $PSScriptRoot ('team/' + $relativePath)) | Out-Null
}
