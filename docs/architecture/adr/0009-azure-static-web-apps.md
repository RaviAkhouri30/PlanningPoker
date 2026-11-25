# ADR-0009: Azure Static Web Apps and Azure Functions for hosting

- **Status:** Accepted
- **Date:** 2026-11-25
- **Version:** 1.0.0

## Context

The owner hosts their apps on Azure; Firebase provides only the database and auth.

## Decision

Deploy the built app to Azure Static Web Apps from GitHub Actions, with managed Azure Functions in `api/` (a health function now, integrations later). The Firebase web config is written to `runtime-config.js` from secrets at deploy time. Rules are deployed by hand with `npm run deploy:rules`.

## Consequences

- One pipeline runs the rules tests, the app build and the API tests before deploying.
- No Firebase Hosting.
- No cloud resource is created without the owner's OK; the workflow is ready but needs the deployment token.
