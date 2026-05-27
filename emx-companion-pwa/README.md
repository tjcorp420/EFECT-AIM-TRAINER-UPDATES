# EMX Aim Companion PWA

Static Vercel-ready companion app for EMX Aim Trainer players.

## Features

- Global leaderboard viewer backed by the existing Firebase leaderboard collection.
- GitHub updater and release feed for the public EMX release repo.
- Mouse sensitivity converter using cm/360 preservation.
- Local player tracker and practice stack notes saved in the browser.
- Installable PWA shell with offline cache for the app UI.

## Deploy

From this folder:

```powershell
vercel --prod
```

The app is static, so Vercel does not need a build command. The project root should be this `emx-companion-pwa` folder.
