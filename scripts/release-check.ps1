param(
    [switch]$RequireMain,
    [switch]$RequireCleanGit,
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$failures = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]

function Add-Failure([string]$Message) {
    $failures.Add($Message) | Out-Null
    Write-Host "[FAIL] $Message" -ForegroundColor Red
}

function Add-Warning([string]$Message) {
    $warnings.Add($Message) | Out-Null
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Add-Pass([string]$Message) {
    Write-Host "[ OK ] $Message" -ForegroundColor Green
}

if (-not $env:EMX_USE_GITHUB_TOKEN_AUTH) {
    Remove-Item Env:\GITHUB_TOKEN -ErrorAction SilentlyContinue
    Remove-Item Env:\GH_TOKEN -ErrorAction SilentlyContinue
}

$branch = (git branch --show-current).Trim()
if ($RequireMain -and $branch -ne "main") {
    Add-Failure "Current branch is '$branch'. Release deploy should run from main."
} else {
    Add-Pass "Current branch: $branch"
}

$dirty = git status --porcelain
if ($RequireCleanGit -and $dirty) {
    Add-Failure "Working tree has uncommitted changes."
} elseif ($dirty) {
    Add-Warning "Working tree has uncommitted changes. Commit before final deploy."
} else {
    Add-Pass "Working tree clean"
}

$package = Get-Content .\package.json | ConvertFrom-Json
$config = Get-Content .\src-tauri\tauri.conf.json | ConvertFrom-Json

if ($package.version -ne $config.version) {
    Add-Failure "Version mismatch: package.json=$($package.version), tauri.conf.json=$($config.version)"
} else {
    Add-Pass "Version matches: $($config.version)"
}

if ([string]::IsNullOrWhiteSpace($config.plugins.updater.pubkey)) {
    Add-Failure "Missing Tauri updater public key in src-tauri/tauri.conf.json"
} else {
    Add-Pass "Updater public key configured"
}

if (-not $config.plugins.updater.endpoints -or $config.plugins.updater.endpoints.Count -eq 0) {
    Add-Failure "Missing updater endpoint"
} else {
    Add-Pass "Updater endpoint: $($config.plugins.updater.endpoints[0])"
}

if (-not [string]::IsNullOrWhiteSpace($env:TAURI_SIGNING_PRIVATE_KEY_PATH)) {
    if (Test-Path $env:TAURI_SIGNING_PRIVATE_KEY_PATH) {
        Add-Pass "Signing private key path exists"
        $env:TAURI_SIGNING_PRIVATE_KEY = (Get-Content $env:TAURI_SIGNING_PRIVATE_KEY_PATH -Raw).Trim()
        Remove-Item Env:\TAURI_SIGNING_PRIVATE_KEY_PATH -ErrorAction SilentlyContinue
    } else {
        Add-Failure "TAURI_SIGNING_PRIVATE_KEY_PATH does not exist"
    }
} elseif (-not [string]::IsNullOrWhiteSpace($env:TAURI_SIGNING_PRIVATE_KEY)) {
    Add-Pass "Signing private key env var is set"
} else {
    Add-Warning "No signing private key env var/path set. Deploy will fail until you set it."
}

if ([string]::IsNullOrWhiteSpace($env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD)) {
    Add-Warning "TAURI_SIGNING_PRIVATE_KEY_PASSWORD is not set. Deploy will fail until you set it."
} else {
    Add-Pass "Signing password env var is set"
}

if (-not [string]::IsNullOrWhiteSpace($env:TAURI_SIGNING_PRIVATE_KEY) -and
    -not [string]::IsNullOrWhiteSpace($env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD)) {
    $probePath = Join-Path $env:TEMP "emx-updater-sign-probe-$PID.txt"
    Set-Content -LiteralPath $probePath -Value "emx updater signing probe" -Encoding ascii

    $previousNativeErrorPreference = $null
    $previousErrorActionPreference = $ErrorActionPreference
    if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -Scope Global -ErrorAction SilentlyContinue) {
        $previousNativeErrorPreference = $PSNativeCommandUseErrorActionPreference
        $PSNativeCommandUseErrorActionPreference = $false
    }

    try {
        $ErrorActionPreference = "Continue"
        $signOutput = & npm run tauri signer sign -- $probePath 2>&1
        $signExitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousErrorActionPreference
        if ($null -ne $previousNativeErrorPreference) {
            $PSNativeCommandUseErrorActionPreference = $previousNativeErrorPreference
        }
        Remove-Item -LiteralPath $probePath -ErrorAction SilentlyContinue
    }

    if ($signExitCode -ne 0) {
        $signOutput | Select-Object -Last 8 | ForEach-Object { Write-Host $_ -ForegroundColor Red }
        Add-Failure "Updater signing key/password validation failed."
    } else {
        Add-Pass "Updater signing key/password validated"
    }
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
    Add-Warning "GitHub CLI is not authenticated. Run: gh auth login"
} else {
    Add-Pass "GitHub CLI authenticated"
}

if (-not (Test-Path .\firestore.rules)) {
    Add-Warning "firestore.rules not found"
} else {
    Add-Pass "Firestore rules file exists"
}

if (-not $SkipBuild) {
    Write-Host ""
    Write-Host "Running production build..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Add-Failure "npm run build failed"
    } else {
        Add-Pass "npm run build passed"
    }
}

Write-Host ""
if ($failures.Count -gt 0) {
    Write-Host "Release check failed with $($failures.Count) blocking issue(s)." -ForegroundColor Red
    exit 1
}

if ($warnings.Count -gt 0) {
    Write-Host "Release check passed with $($warnings.Count) warning(s)." -ForegroundColor Yellow
    exit 0
}

Write-Host "Release check passed clean." -ForegroundColor Green
