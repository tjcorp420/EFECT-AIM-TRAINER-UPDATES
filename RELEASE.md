# EMX Aim Trainer Release Checklist

Use this when shipping a real installer/update.

## 1. Test The Desktop App

```powershell
cd C:\Users\terrell\Downloads\efect-aim-trainer
npm run tauri dev
```

Check offline play, login, customizer saves after restart, scenario launch, gun sound/effects, performance report buttons, leaderboard, and updater check.

## 2. Rotate The Updater Key Before First Public Release

Only do this before the first real public release, or when you intentionally want to replace the updater trust key.

```powershell
.\scripts\rotate-updater-key.ps1
```

The script saves the private key outside the repo by default:

```text
C:\Users\terrell\.emx-aim-trainer\tauri-updater.key
```

Do not commit or share the private key/password. Commit only the changed public key in `src-tauri/tauri.conf.json`.

## 3. Set Signing Env Vars

Use the same password you entered when rotating the key.

```powershell
$env:TAURI_SIGNING_PRIVATE_KEY_PATH = "$env:USERPROFILE\.emx-aim-trainer\tauri-updater.key"
$env:TAURI_SIGNING_PRIVATE_KEY_PASSWORD = "YOUR_KEY_PASSWORD"
```

## 4. Run Release Check

Before final deploy:

```powershell
.\scripts\release-check.ps1 -RequireMain -RequireCleanGit
```

During testing on a feature branch:

```powershell
.\scripts\release-check.ps1
```

## 5. Commit And Merge To Main

```powershell
git add .
git commit -m "Prepare EMX Aim Trainer v0.3.0 release"
git checkout main
git merge premium-polish-safe
git push origin main
```

## 6. Deploy Installer And Updater Manifest

Run this from `main` after the release check passes:

```powershell
.\deploy.ps1 -ReleaseNotes "EMX Aim Trainer v0.3.0 release"
```

The deploy script builds/signs the installer, writes `updater.json`, commits the updater manifest when needed, pushes `main`, and uploads the installer/signature to the GitHub release.
