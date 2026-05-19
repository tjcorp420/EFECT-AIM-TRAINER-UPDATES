param(
    [string]$PrivateKeyPath = "$env:USERPROFILE\.emx-aim-trainer\tauri-updater.key",
    [switch]$Force
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

if (Test-Path $PrivateKeyPath -PathType Leaf) {
    if (-not $Force) {
        throw "Private key already exists at $PrivateKeyPath. Rerun with -Force to overwrite it."
    }
}

$privateKeyDir = Split-Path -Parent $PrivateKeyPath
if (-not (Test-Path $privateKeyDir)) {
    New-Item -ItemType Directory -Path $privateKeyDir | Out-Null
}

Write-Host "This creates a NEW updater signing key and updates src-tauri/tauri.conf.json with the matching public key." -ForegroundColor Cyan
Write-Host "Keep the private key and password secret. Do not post them in Discord, GitHub, or screenshots." -ForegroundColor Yellow

$securePassword = Read-Host "New updater key password" -AsSecureString
$passwordPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPtr)

try {
    $generateArgs = @(
        "run",
        "tauri",
        "signer",
        "generate",
        "--",
        "--write-keys",
        $PrivateKeyPath,
        "--password",
        $plainPassword
    )

    if ($Force) {
        $generateArgs += "--force"
    }

    $output = & npm @generateArgs 2>&1
    if ($LASTEXITCODE -ne 0) {
        $output | ForEach-Object { Write-Host $_ }
        throw "Tauri key generation failed."
    }

    $outputText = ($output | Out-String)
    $publicKeyPath = "$PrivateKeyPath.pub"
    $publicKeyLine = ($outputText -split "`r?`n") |
        Where-Object { $_ -match "^Public:\s+" } |
        Select-Object -Last 1

    if ($publicKeyLine -match "^Public:\s+(.+)$") {
        $publicKeyPath = $Matches[1].Trim()
    }

    if (-not (Test-Path $publicKeyPath)) {
        Write-Host $outputText
        throw "Could not find generated public key file at $publicKeyPath"
    }

    $publicKey = (Get-Content $publicKeyPath -Raw).Trim()

    if ([string]::IsNullOrWhiteSpace($publicKey)) {
        throw "Generated public key file is empty: $publicKeyPath"
    }

    $configPath = ".\src-tauri\tauri.conf.json"
    $configText = Get-Content $configPath -Raw
    $escapedPublicKey = $publicKey.Replace("\", "\\").Replace('"', '\"')
    $updatedConfigText = [regex]::Replace(
        $configText,
        '("pubkey"\s*:\s*")[^"]+(")',
        "`${1}$escapedPublicKey`${2}",
        1
    )

    if ($updatedConfigText -eq $configText) {
        throw "Could not find updater pubkey in $configPath"
    }

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText((Resolve-Path $configPath), $updatedConfigText, $utf8NoBom)

    Write-Host "Updated src-tauri/tauri.conf.json with the new public key." -ForegroundColor Green
    Write-Host "Private key saved outside the repo at: $PrivateKeyPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "For this terminal session before deploy, run:" -ForegroundColor Cyan
    Write-Host "`$env:TAURI_SIGNING_PRIVATE_KEY_PATH = `"$PrivateKeyPath`""
    Write-Host '$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = "<the password you just entered>"'
    Write-Host ""
    Write-Host "Then commit src-tauri/tauri.conf.json so the released app trusts this new key." -ForegroundColor Cyan
}
finally {
    if ($passwordPtr -ne [IntPtr]::Zero) {
        [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPtr)
    }
}
