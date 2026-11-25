# 05 · Operations — Manual estimate

- **Version:** 1.7.0
- **CHANGELOG entry:** ☑
- **Deploy notes:** no rules, index or data change (the rules already take any estimate of 1 to
  8 characters). Pushing to `main` deploys through the project workflow to Azure Static Web Apps
  (`www.planningpoker.in`).
- **Monitoring:** the GitHub Actions deploy run and the Static Web App in the Azure portal.
- **Rollback:** redeploy 1.6.0 (`5940848`).
