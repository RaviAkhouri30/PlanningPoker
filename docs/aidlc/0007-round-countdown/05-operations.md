# 05 · Operations — Round countdown

- **Version:** 1.6.0
- **CHANGELOG entry:** ☑
- **Deploy notes:** the Firestore rules changed (`validTimer`, `beforeTimeUp`), so
  `npm run deploy:rules` runs **before** the app: the new app writes `timerSeconds` and
  `lockOnTimeUp` on create, which the old rules refuse. The new rules accept rooms with or
  without those fields, so the app still running at that moment keeps working. Pushing to `main`
  then deploys the app through the project workflow to Azure Static Web Apps
  (`www.planningpoker.in`). No data migration: older rooms read 60 seconds with the lock on.
- **Monitoring:** the GitHub Actions deploy run, the Static Web App in the Azure portal, and
  permission-denied errors on votes in the browser console (late votes are refused by design).
- **Rollback:** redeploy 1.5.0 (`8d40f71`). The 1.6.0 rules can stay: they accept 1.5.0's writes.
  Reverting the rules too would need 1.5.0's `firestore.rules` and `npm run deploy:rules`.
