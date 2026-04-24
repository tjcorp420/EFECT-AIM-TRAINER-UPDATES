# EFECT RAPID DEPLOYMENT - NO BS EDITION
$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# --- INJECT KEYS ---
$env:TAURI_SIGNING_PRIVATE_KEY = "dW50cnVzdGVkIGNvbW1lbnQ6IHJzaWduIGVuY3J5cHRlZCBzZWNyZXQga2V5ClJXUlRZMEl5NnBvU3psU01Td3o3dVBTR2FqaC82T0V0MjJXWkpyVkRlM1VkT3BJZ3dHY0FBQkFBQUFBQUFBQUFBQUlBQUFBQU1VQTNCMkRPdFhWc1pQeHVMZEIrOXdub1JQSjJNUGpMbCtxTjVMMXgxWkJFRERXam41eC95clVFRVZ4MjA4enR5SFRFU1VvTWo2c2dmaFNMLzg0bk1VSEM5SHZKckxhN2YwaVpVNnlQLzhZSFZJdXRUd0ovb3FaeDRlQi9UMXdlKzhuNWgyWFVJd009Cg=="
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = "efect123"

$repo = "tjcorp420/EFECT-AIM-TRAINER-UPDATES"
$config = Get-Content .\src-tauri\tauri.conf.json | ConvertFrom-Json
$version = $config.version

Write-Host ">>> INITIATING DEPLOYMENT FOR v$version..." -ForegroundColor Cyan
Write-Host ">>> Compiling & Signing Tauri App..." -ForegroundColor Yellow

npm run tauri build

# --- EXTRACT SIGNATURE ---
$exeName = "efect-aim-trainer_$($version)_x64-setup.exe"
$exePath = ".\src-tauri\target\release\bundle\nsis\$exeName"
$sigPath = "$exePath.sig"

if (-Not (Test-Path $sigPath)) {
    Write-Host "---" -ForegroundColor Gray
    Write-Host "❌ ERROR: SIGNATURE NOT GENERATED." -ForegroundColor Red
    exit 1
}

$sig = (Get-Content $sigPath -Raw).Trim()
Write-Host "✅ SIGNATURE GENERATED: $($sig.Substring(0,20))..." -ForegroundColor Green

# --- MANIFEST & PUSH ---
Write-Host ">>> Updating Manifest..." -ForegroundColor Yellow
$url = "https://github.com/$repo/releases/download/v$version/$exeName"
$updater = @{
    version = $version
    notes = "Automated EFECT v$version Deployment"
    pub_date = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    platforms = @{
        "windows-x86_64" = @{
            signature = $sig
            url = $url
        }
    }
}
$updater | ConvertTo-Json -Depth 5 | Out-File "updater.json" -Encoding utf8

Write-Host ">>> Syncing with GitHub..." -ForegroundColor Yellow
git add updater.json src-tauri/tauri.conf.json
git commit -m "Live Deploy v$version"
git push origin main

Write-Host ">>> Uploading to Releases..." -ForegroundColor Yellow
gh release create "v$version" --title "v$version" --notes "Official EFECT Build" 2>$null
gh release upload "v$version" $exePath --clobber

Write-Host "🚀 DEPLOYMENT SUCCESSFUL. v$version IS LIVE." -ForegroundColor Green