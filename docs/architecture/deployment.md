# Deployment

Nothing in this document is created or deployed without the owner's explicit OK.

```mermaid
flowchart LR
  dev[Push / PR to main] --> gha[GitHub Actions]
  gha --> ci["npm ci · Java 21 · test:rules · build · api tests + build"]
  ci --> cfg["write-runtime-config.mjs from FIREBASE_* secrets"]
  cfg --> swa[Azure Static Web Apps: app + managed Functions]
  rules[firestore.rules] -- npm run deploy:rules, by hand --> fs[(Firebase project)]
  swa -- browsers talk directly to --> fs
```

| Environment | Backend                      | How to run                                     |
| ----------- | ---------------------------- | ---------------------------------------------- |
| Local       | Fake (in memory)             | `npm start`                                    |
| Emulator    | Firestore + Auth emulators, project `demo-planning-poker` | `npm run emulators`, then `npm run start:emulator` |
| Live (local) | The real Firebase project, alias `live`, config from `public/runtime-config.js` | `npm run start:live` |
| Production  | The real Firebase project    | Azure Static Web Apps, config from GitHub secrets |

- `public/staticwebapp.config.json` falls back to `/index.html`, so `/r/<id>` links work, and serves
  `runtime-config.js` without caching.
- The Firebase web config is never committed: CI writes `runtime-config.js` from the `FIREBASE_*`
  secrets; locally copy `public/runtime-config.example.js`.
- The Static Web App is `brave-pond-019ab0610` (Free plan, linked to `RaviAkhouri30/PlanningPoker`,
  branch `main`). Its deployment token is the `AZURE_STATIC_WEB_APPS_API_TOKEN_BRAVE_POND_019AB0610`
  secret. `azure-static-web-apps.yml` is the only deploy workflow: Azure's generated one was removed
  because its Oryx build can't run Angular 22 and doesn't write `runtime-config.js`.
- Before going live: deploy the rules, turn on Anonymous sign-in, add the site's domain to Auth's
  authorised domains, and consider App Check.
