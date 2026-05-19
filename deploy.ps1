# EFECT rapid deployment
param(
    [string]$ReleaseNotes = "",
    [switch]$AllowDirty
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$repo = "tjcorp420/EFECT-AIM-TRAINER-UPDATES"
$branch = (git branch --show-current).Trim()
$package = Get-Content .\package.json | ConvertFrom-Json
$config = Get-Content .\src-tauri\tauri.conf.json | ConvertFrom-Json
$version = $config.version

if (-not $env:EMX_USE_GITHUB_TOKEN_AUTH) {
    Remove-Item Env:\GITHUB_TOKEN -ErrorAction SilentlyContinue
    Remove-Item Env:\GH_TOKEN -ErrorAction SilentlyContinue
}

if ($branch -ne "main") {
    throw "Deploy only runs from the main branch. Current branch is '$branch'. Merge/test first, then deploy from main."
}

if ($package.version -ne $version) {
    throw "Version mismatch: package.json is $($package.version), tauri.conf.json is $version."
}

if (-not $AllowDirty) {
    $dirty = git status --porcelain
    if ($dirty) {
        throw "Working tree has uncommitted changes. Commit first, or rerun with -AllowDirty if you are intentionally deploying current files."
    }
}

if ([string]::IsNullOrWhiteSpace($env:TAURI_SIGNING_PRIVATE_KEY) -and
    -not [string]::IsNullOrWhiteSpace($env:TAURI_SIGNING_PRIVATE_KEY_PATH)) {
    if (-not (Test-Path $env:TAURI_SIGNING_PRIVATE_KEY_PATH)) {
        throw "TAURI_SIGNING_PRIVATE_KEY_PATH does not exist: $env:TAURI_SIGNING_PRIVATE_KEY_PATH"
    }

    $env:TAURI_SIGNING_PRIVATE_KEY = (Get-Content $env:TAURI_SIGNING_PRIVATE_KEY_PATH -Raw).Trim()
}

if ([string]::IsNullOrWhiteSpace($env:TAURI_SIGNING_PRIVATE_KEY) -or
    [string]::IsNullOrWhiteSpace($env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD)) {
    throw "Missing Tauri updater signing env vars. Set TAURI_SIGNING_PRIVATE_KEY or TAURI_SIGNING_PRIVATE_KEY_PATH, plus TAURI_SIGNING_PRIVATE_KEY_PASSWORD."
}

$previousNativeErrorPreference = $null
$previousErrorActionPreference = $ErrorActionPreference
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -Scope Global -ErrorAction SilentlyContinue) {
    $previousNativeErrorPreference = $PSNativeCommandUseErrorActionPreference
    $PSNativeCommandUseErrorActionPreference = $false
}

try {
    $ErrorActionPreference = "Continue"
    gh auth status *> $null
    $ghAuthExitCode = $LASTEXITCODE
}
finally {
    $ErrorActionPreference = $previousErrorActionPreference
    if ($null -ne $previousNativeErrorPreference) {
        $PSNativeCommandUseErrorActionPreference = $previousNativeErrorPreference
    }
}

if ($ghAuthExitCode -ne 0) {
    throw "GitHub CLI is not authenticated. Run: gh auth login"
}

$notes = if ([string]::IsNullOrWhiteSpace($ReleaseNotes)) {
    "Automated EFECT v$version deployment"
} else {
    $ReleaseNotes
}

Write-Host ">>> Initiating deployment for v$version..." -ForegroundColor Cyan
Write-Host ">>> Compiling and signing Tauri app..." -ForegroundColor Yellow

npm run tauri build

$exeName = "$($config.productName)_$($version)_x64-setup.exe"
$exePath = ".\src-tauri\target\release\bundle\nsis\$exeName"
$sigPath = "$exePath.sig"

if (-not (Test-Path $exePath)) {
    throw "Installer not found at $exePath"
}

if (-not (Test-Path $sigPath)) {
    throw "Signature not generated at $sigPath"
}

$sig = (Get-Content $sigPath -Raw).Trim()
Write-Host "Signature generated: $($sig.Substring(0, [Math]::Min(20, $sig.Length)))..." -ForegroundColor Green

Write-Host ">>> Updating updater manifest..." -ForegroundColor Yellow
$assetName = [System.Uri]::EscapeDataString($exeName)
$url = "https://github.com/$repo/releases/download/v$version/$assetName"
$updater = @{
    version = $version
    notes = $notes
    pub_date = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    platforms = @{
        "windows-x86_64" = @{
            signature = $sig
            url = $url
            format = "nsis"
        }
    }
}

$updater | ConvertTo-Json -Depth 5 | Out-File "updater.json" -Encoding utf8

Write-Host ">>> Syncing manifest with GitHub..." -ForegroundColor Yellow
git add updater.json src-tauri/tauri.conf.json
git diff --cached --quiet

if ($LASTEXITCODE -ne 0) {
    git commit -m "Live deploy v$version"
} else {
    Write-Host "No manifest or config changes to commit." -ForegroundColor DarkYellow
}

git push origin main

Write-Host ">>> Uploading installer to GitHub release..." -ForegroundColor Yellow
gh release view "v$version" *> $null

if ($LASTEXITCODE -ne 0) {
    gh release create "v$version" --title "v$version" --notes $notes
} else {
    Write-Host "Release v$version already exists. Uploading installer with --clobber." -ForegroundColor DarkYellow
}

gh release upload "v$version" $exePath --clobber
gh release upload "v$version" $sigPath --clobber

Write-Host "Deployment successful. v$version is live." -ForegroundColor Green
