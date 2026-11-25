# Tooling

| Tool                 | Config                                              | Runs with                         |
| -------------------- | --------------------------------------------------- | --------------------------------- |
| ESLint 10            | `eslint.config.mjs` (flat)                          | `npm run lint` (0 warnings)       |
| Prettier             | `.prettierrc`                                       | `npm run format:check`            |
| TypeScript           | `tsconfig*.json` (app, spec, e2e, rules, api)       | `npm run typecheck`               |
| Vitest (unit)        | `angular.json` → `test` (jsdom, coverage ≥ 90 %)    | `npm test`, `npm run test:coverage` |
| Vitest (rules)       | `vitest.rules.config.ts` (node, one file at a time) | `npm run test:rules` (emulator)   |
| Vitest (api)         | `api/vitest.config.ts`                              | `npm run test:api`                |
| Playwright (Fake)    | `playwright.config.ts`, port 4210                   | `npm run e2e`                     |
| Playwright (Firebase)| `playwright.firebase.config.ts`, port 4310          | `npm run e2e:firebase` (emulator) |
| Mermaid check        | `scripts/check-diagrams.mjs`                        | `npm run check:diagrams`          |
| SonarQube            | `sonar-project.properties`                          | `npm run sonar`                   |

`npm run verify` chains format, lint, diagrams, typecheck, unit coverage, api tests and the build.
CI also runs `npm run test:rules`.

## First-time setup

```bash
nvm use                 # Node from .nvmrc
npm ci
npm --prefix api ci
npm run e2e:install     # Playwright's Chromium
```

The rules tests and the Firebase e2e suite start the Firestore and Auth emulators, which need
Java 21 or newer. They use the `demo-planning-poker` project: a `demo-` project never talks to a
real Firebase project.

## Running against a real Firebase project

1. Copy `public/runtime-config.example.js` to `public/runtime-config.js` (git-ignored) and fill in
   the web app config from Firebase console → Project settings → Your apps.
2. Turn on Authentication → Sign-in method → Anonymous.
3. Deploy the rules with `npm run deploy:rules` (after `firebase login`, with the owner's OK).

## Notes

- E2E tests wait for `load` and fonts, not `networkidle`: Firestore keeps a listen channel open.
- The Firebase e2e config stops the emulator with SIGINT so its Java process doesn't linger on
  port 8080.
- jsdom has no `HTMLDialogElement.showModal`/`close`; the invite dialog guards both calls.
