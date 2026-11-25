# 05 · Operations — Rooms, themes and avatars

- **Version:** 1.4.0, then 1.4.1 (patch: a smaller landing page hero title and introduction;
  verify and e2e re-run and passing, no rules or data change)
- **CHANGELOG entry:** ☑
- **Deploy notes:**
  - Rules: the avatar change to `firestore.rules` (`validSeat` accepts the 16 avatar ids) was
    deployed with `npm run deploy:rules`, with the owner's OK, before the app that writes avatars.
    No other rules or index change in this release.
  - App: each feature was pushed to `main` and deployed through the project workflow to Azure
    Static Web Apps; the release commit deploys the same way.
  - Domain: `www.planningpoker.in` is the default custom domain (CNAME at GoDaddy to the app's
    `azurestaticapps.net` host); `planningpoker.in` forwards to it with a 301 at GoDaddy, because
    this Static Web App doesn't accept A records at the apex.
- **Data:** guest profile and room list are kept in the browser's `localStorage`
  (`planning-poker.profile`, `planning-poker.rooms`, `planning-poker.theme`); nothing to migrate.
  Seats written before 1.4.0 have no avatar and show initials.
- **Monitoring:** the GitHub Actions deploy run, the Static Web App in the Azure portal, and
  Firestore usage in the Firebase console (a CSV backup costs one read per document it reads).
  Application Insights is not set up yet.
- **Rollback:** redeploy 1.3.0 (`445e92d`). The deployed rules stay compatible: the avatar field is
  optional, so 1.3.0 clients keep writing seats without it.
