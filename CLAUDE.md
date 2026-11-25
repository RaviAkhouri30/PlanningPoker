# PlanningPoker — Engineering Rules & Architecture

These rules are **mandatory**. Every change — feature, fix, refactor, test — must comply.
If a request conflicts with a rule, stop and raise the conflict instead of silently breaking it.
Most rules are enforced by tooling (`eslint.config.mjs`, `tsconfig.json`, `angular.json`); the
rest are enforced by review. Background and diagrams live in [`docs/`](docs/README.md).

PlanningPoker is a real-time planning poker app: a moderator creates a room, shares a link, the
team votes in private, the cards flip together and the room settles an estimate. The rules,
tooling and layout follow the owner's `taal-yatra` repository; the deliberate differences are
recorded as ADRs (real-time Firestore, anonymous guests).

---

## 1. Tech Stack (exact versions pinned in `package.json`)

| Concern           | Choice                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------- |
| Framework         | Angular 22: standalone, zoneless, **signals** for state                                       |
| UI / Layout       | Bootstrap **5.3.8** grid + utilities only (SCSS, imported selectively), tokens in `src/styles` |
| Async / Data flow | RxJS 7 for **all** asynchronous work                                                          |
| Database          | Firestore 13 **with real-time listeners**, behind the `IRealtimeStore` port (ADR-0006)        |
| Authentication    | Firebase Auth, anonymous guests for now, behind the `IAuthService` port (ADR-0007)            |
| Hosting           | Azure Static Web Apps + managed Azure Functions in `api/` (ADR-0009)                          |
| Unit tests        | Vitest 4 (`@angular/build:unit-test`) + `@vitest/coverage-v8`                                 |
| Rules tests       | `@firebase/rules-unit-testing` on the Firestore emulator (`tests/rules`)                      |
| E2E tests         | Playwright 1.64 + `@axe-core/playwright`                                                      |
| Static analysis   | ESLint 10 (`angular-eslint`, `typescript-eslint`, `sonarjs`, `security`), SonarQube, Prettier |

- **Bootstrap 6** is still in alpha. Upgrading to it requires a stable release and an ADR.
- **TSLint** is deprecated. `typescript-eslint` covers its rules. Never install `tslint` or `codelyzer`.

---

## 2. Commands

```bash
npm start              # dev server on :4200, Fake backend (no Firebase needed)
npm run emulators      # Firestore + Auth emulators, project demo-planning-poker (needs Java)
npm run start:emulator # dev server against the running emulators
npm run start:live     # dev server against the real project (public/runtime-config.js)
npm run build          # production build (budgets + auto strict CSP)
npm run lint           # ESLint, 0 errors / 0 warnings      (lint:fix to autofix)
npm run format:check   # Prettier check                      (format to write)
npm run typecheck      # tsc for app, spec, e2e, rules and api configs
npm test               # Vitest, single run                  (test:watch for watch mode)
npm run test:coverage  # Vitest + coverage, fails below 90%  → coverage/planning-poker/
npm run test:api       # the Azure Functions' tests, fails below 90% (needs `npm --prefix api ci` once)
npm run test:rules     # firestore.rules tests on the emulator (needs Java)
npm run e2e            # Playwright on the Fake backend: desktop, tablet, mobile (e2e:install once)
npm run e2e:firebase   # two-browser journey against the emulators, 3 viewports (needs Java)
npm run deploy:rules   # deploy firestore.rules + indexes (only with the owner's OK: real project)
npm run sonar          # SonarQube scan (needs SONAR_HOST_URL and SONAR_TOKEN env vars)
npm run check:diagrams # render every Mermaid diagram in the Markdown, fail on a broken one
npm run verify         # format:check + lint + check:diagrams + typecheck + test:coverage + test:api + build
```

**Definition of done:** `npm run verify` ✔ · `npm run e2e` ✔ · `npm run test:rules` ✔ and
`npm run e2e:firebase` ✔ when rules or the data layer change · docs and diagrams updated ·
version bumped and CHANGELOG entry added (§12).

---

## 3. Architecture: MVVM

```
Component ──► ViewModel ──────────► Service ──────────────► IRealtimeStore (abstract class = DI token)
 (view)       @Injectable()         @Service() (root)         ├─ FirebaseRealtimeStore (onSnapshot, batches)
              component-scoped      paths + DTO mapping       └─ FakeRealtimeStore (in memory: tests, npm start)
              signals + RxJS
```

| Layer         | Does                                                                    | Never does                                  |
| ------------- | ----------------------------------------------------------------------- | ------------------------------------------- |
| **Component** | Renders VM signals, forwards user events to the VM                      | Business logic, data access, mapping        |
| **ViewModel** | Composes RxJS streams, maps documents to models, owns state as signals  | Touch the DOM, know about Firebase          |
| **Service**   | Knows document paths, builds batched writes, returns `Observable<T>`    | Hold UI state, know about components        |
| **Backend**   | Implements one port for one technology, wraps SDK Promises with `defer` | Leak SDK types outside `core/backends`      |
| **Model**     | Pure functions and typed models (decks, voting stats)                   | Depend on Angular                           |

### Base classes (`shared/base`)

- `ViewModel<T>` keeps a **private** `state` signal and exposes `data` (read-only). `init()` merges
  `attachViewHandler()` and `attachCommandHandler()`; concrete VMs override those and call
  `setData()` / `updateData()`. The base already owns the name `state`: expose the page's state
  as `view = computed(() => this.data() ?? DEFAULT)` instead.
- `BaseComponent<T>.ngOnInit()` subscribes to `model.init()` with `takeUntilDestroyed`: the only
  subscription in the view layer.
- Pages are lazily loaded **default exports**. Each page provides its view model in `providers`.

### Ports, adapters and factory

Feature code depends only on **ports** (`core/interfaces`). A port is an abstract class that also
serves as the DI token. A **factory** (`core/factories`) picks the adapter from
`APP_ENVIRONMENT.backend`. Only `core/backends` may import `firebase/*`.

| Port                | Adapters                                         | Contract                                                                |
| ------------------- | ------------------------------------------------ | ----------------------------------------------------------------------- |
| `IRealtimeStore`    | `FirebaseRealtimeStore`, `FakeRealtimeStore`     | `watchDocument`, `watchCollection(path, orderBy?)` (live), `commit(writes)` (one atomic batch) |
| `IAuthService`      | `FirebaseAuthService`, `FakeAuthService`         | `user$` (waits for the saved session), `signInAsGuest(name)`            |
| `IClipboardService` | `BrowserClipboardService`, `FakeClipboardService`| `copy(text)`                                                            |

- The Firebase SDK is loaded lazily through the `*_GATEWAY_LOADER` tokens, so the landing page
  never downloads it.
- `SERVER_TIME` is a port-level sentinel for server timestamps, so no SDK type leaks into features.
- Listeners are cold `Observable`s: subscribing starts `onSnapshot`, unsubscribing stops it.
- Every adapter honours the same contract (Liskov). Fakes return valid empty results.

### Real-time rules of thumb (ADR-0006)

- A room is a few small documents watched live: the room, its participants, its stories, your own
  vote, and — only after the flip — the round's votes. Combine them with `combineLatest` in the VM.
- Every multi-document change is **one `commit`** (e.g. a vote and the seat's `votedRound`, or the
  flip and its `rounds/{round}` marker). The rules check the batch with `getAfter`/`existsAfter`.
- Never trust the client for secrecy: votes are hidden by `firestore.rules`, not by the UI.
- Work only one client can do (auto-reveal) runs in the moderator's tab; document such limits.

---

## 4. Folder Structure & Imports

```
src/app/
├── app.ts · app.config.ts · app.routes.ts
├── core/          tokens/ factories/ interfaces/(ports) backends/{firebase,fake,browser}/(adapters)
│                  services/ config/(provideXxx helpers) enums/
├── shared/        base/ components/ directives/ guards/ enums/ constants/ models/ interfaces/
│                  services/ utils/ validators/ testing/
└── features/<feature>/
    ├── components/<name>/   *.component.ts|html|scss|spec.ts
    ├── view-models/         *.view-model.ts (+ spec)
    ├── services/            *.service.ts (+ spec)
    ├── models/              i-*.ts, *.constants.ts, pure helpers
    ├── testing/             spec fixtures
    └── <feature>-page.component.*   the lazily loaded page (default export)
src/styles/        design tokens and global partials (_tokens, _base, _sections, _panels…)
tests/rules/       firestore.rules tests (emulator)
e2e/               specs/*.e2e.ts, pages/ (Page Objects), fixtures/
api/               Azure Functions (own package and tests)
docs/              architecture, ADRs, AIDLC records
```

- Path aliases: `@core/*`, `@shared/*`, `@features/*`, `@env/*`. Use them instead of `../../`.
- Dependencies flow one way: `features → shared → core/interfaces`. Features never import
  other features. `core/backends` is referenced only by factories.

---

## 5. SOLID & OOP (strict)

- **S**: one reason to change per class. If you need "and" to describe a class, split it.
- **O**: extend by adding classes or strategies, not by adding branches. `switch` on a type
  is allowed only inside a factory.
- **L**: subtypes honour their base contract. Production adapters never throw
  `Not implemented`, and fakes return valid empty results.
- **I**: small ports. No god interfaces.
- **D**: depend on abstractions (abstract classes or `InjectionToken`s), never on SDKs.
- OOP: encapsulation (`private readonly` by default, expose read-only signals), composition
  over inheritance (at most 2 levels below a base class), explicit access modifiers on every
  member (lint-enforced).

---

## 6. Angular Practices

- **Standalone only.** No `NgModule`, no `standalone: false` (lint-enforced).
- `OnPush` on every component, zoneless app, `inject()` only (lint-enforced).
- `@Service()` for root singletons, `@Injectable()` + component `providers` for view models.
- Signal APIs only: `input()`, `output()`, `model()`, `viewChild()`, `computed()`, `linkedSignal()`.
- Outputs never use DOM event names (`copy`, `select`, `close`…) and never pair as `xChange`
  with an input of the same name (lint-enforced): name them for what happened (`copyLink`, `storyPick`).
- Control flow `@if` / `@for` (with `track`) / `@switch` / `@defer`. No `*ngIf` / `*ngFor`.
- Templates contain bindings only. Logic goes in `computed()` or pure pipes. **No style bindings
  or inline styles**: dynamic values go through directive host bindings (`appDelay`,
  `appWidthPercent`, `appBackground`).
- Lazy-load every route. Functional guards (`roomMemberGuard`). Typed Reactive Forms, with
  validators in `shared/validators`.
- `host: {}` metadata instead of `@HostBinding` / `@HostListener` (lint-enforced).
- **Segregate the UI**: a smart page plus small presentational children. A component that grows
  past one responsibility, or past the 4 kB style budget, gets split.
- **Injection tokens** (`core/tokens`) for every non-class dependency: `APP_ENVIRONMENT`,
  `FIREBASE_CONFIG`, `APP_ORIGIN` (room links), `CLOCK`, `RANDOM`, and the lazy `*_LOADER` tokens.

---

## 7. Signals & RxJS (no Promises)

- **Signals hold state; RxJS moves data.** VMs expose state as read-only signals. Listeners,
  commands, timers and retries are RxJS streams.
- Bridge the two only inside VMs.
- **No `Promise`, `async`, `await`, `.then()` or `new Promise` in production code.** ESLint
  enforces this. Promise-based SDK calls are wrapped **only in `core/backends`** with
  `defer(() => sdkCall())`. `main.ts` and the Azure Functions entry points are the other exceptions.
- Never nest `subscribe()`. Pick `switchMap` / `concatMap` / `mergeMap` / `exhaustMap` on
  purpose and comment why (room commands use `concatMap` so writes keep their order).
- Subscribe only in `BaseComponent`. Long-lived streams `catchError` so one failure can't kill
  them; a failed command shows a toast.
- **Tests** (Vitest, Playwright, rules) may use `async`/`await` and Promises.

---

## 8. Clean Code & Comments

- **No file over 300 lines of code**, for both `.ts` and `.html` (lint-enforced).
- Lint limits: functions ≤ 30 lines, complexity ≤ 10, cognitive complexity ≤ 15, depth ≤ 3,
  params ≤ 4.
- `strict` TypeScript with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
  No `any` (use `unknown` plus type guards).
- No magic numbers or strings. Put them in `constants/` and `enums/`. Look up dynamic keys with
  `Map.get()`, `.at()` or a helper (`deckDefinition`), not `obj[key]` (`security/detect-object-injection`).
- No `console.*` (use `LoggerService`), no dead or commented-out code. Prefer early returns.
- Naming: kebab-case files with type suffixes (`.component`, `.view-model`, `.service`,
  `.token`, `.factory`, `.guard`, `.directive`, `.constants`, `.util`), `I`-prefixed ports and
  interfaces, `UPPER_CASE` tokens and constants.
- **TSDoc** on every exported class, public member, input/output and token.
- Inline comments say **why**, not what. Comment every non-obvious RxJS operator choice,
  security decision and workaround.

---

## 9. Testing

**Unit (Vitest):**

- **≥ 90 % statements, branches, functions and lines.** The run fails below that
  (thresholds in `angular.json`).
- Every `.ts` file in `src/app` has a co-located `.spec.ts`. Exempt: `*.routes.ts`,
  `app.config.ts`, environments, enums, `testing/`.
- Mock ports through DI with the Fake adapters, never by patching SDK modules.
- One behaviour per `it`, in Arrange / Act / Assert order, named `should … when …`.
- jsdom has no `HTMLDialogElement.showModal`/`close`: code guards them, specs cover both paths.

**Rules (`tests/rules`):**

- Every allow and every deny in `firestore.rules` has a test. Write the same batches the
  services commit. Assert with `resolves.not.toEqual(DENIED)` / `rejects.toMatchObject(DENIED)`.

**E2E (Playwright):**

- Specs live in `e2e/specs/*.e2e.ts` and use Page Objects from `e2e/pages` through fixtures.
- Every spec runs on desktop, tablet and mobile.
- The Fake backend serves deterministic one-browser journeys; `firebase-*.e2e.ts` runs against the
  emulators and holds the two-browser journey.
- Use role and label locators. Run an axe WCAG 2.2 AA scan per page.
- Wait for `load` and fonts, never `networkidle`: Firestore keeps a listen channel open.

---

## 10. Security & Performance

**Security:**

- No secrets in source. The Firebase web config is injected at runtime
  (`public/runtime-config.js`, git-ignored). Service-account JSON files are never committed.
- `firestore.rules` lives in the repo, denies by default, and is tested. Votes stay unreadable
  to others until `rounds/{round}` exists (the flip). Enable App Check before going public.
- Strict CSP: `security.autoCsp` is on for production. No `bypassSecurityTrust*`
  without a commented review.
- Validate input on the client **and** in rules (limits mirror `limits.constants.ts`).
  `npm audit` must show no high or critical issues. Pin dependency versions exactly (`--save-exact`).
- **No cloud resources (Firebase projects, Azure resources) are created or deployed without the
  owner's explicit OK.** Local work uses the `demo-planning-poker` emulator project only.

**Performance / design:**

- Lighthouse: Performance ≥ 95, Accessibility 100, Best Practices 100, SEO ≥ 95.
- The `angular.json` budgets are hard limits (component styles 4 kB warning, 8 kB error).
- All colours, spacing and type come from `src/styles/_tokens.scss`. Never hard-code them.
- Honour `prefers-reduced-motion`. Semantic HTML and WCAG 2.2 AA throughout.

---

## 11. AIDLC & Documentation

Every feature follows the **AI-Driven Development Lifecycle**, recorded in
`docs/aidlc/<NNNN-feature>/` (copy `docs/aidlc/_template`). Each phase ends with **human
approval** before the next one starts:

1. **Inception** (`01-inception.md`): requirements, user stories with acceptance criteria, risks.
2. **Design** (`02-design.md`): domain model, component tree, and class, sequence and flow diagrams.
3. **Construction** (`03-construction.md`): code and tests in small increments, plus a decision log.
4. **Verification** (`04-verification.md`): results from verify, e2e, rules tests, Sonar and Lighthouse.
5. **Operations** (`05-operations.md`): release version, deploy notes, monitoring, rollback.

Diagrams are Mermaid in Markdown, kept in `docs/architecture/`. **Update them in the same change**
that alters the architecture, the data model or a flow. Significant decisions get an ADR
(`adr/NNNN-title.md`).

---

## 12. Versioning & Releases

- **Semantic Versioning**, starting at **1.0.0** (the foundation release). The single source of
  truth is the `version` field in `package.json`.
- **Every feature release bumps MINOR** (`npm run release:minor`). Bug fixes bump PATCH
  (`release:patch`). Breaking changes bump MAJOR (`release:major`).
- Every release adds a `CHANGELOG.md` entry (Keep a Changelog format) and is recorded in the
  feature's `05-operations.md`.
- Commits follow **Conventional Commits** (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`,
  `chore:`). Details are in [`docs/versioning.md`](docs/versioning.md).

---

## 13. Working Agreement for Claude

- Read this file and the relevant `docs/` before coding. Mirror the nearest existing feature.
- Run `npm run verify` (plus `npm run e2e` for UI changes, and `npm run test:rules` /
  `npm run e2e:firebase` for rules or data changes) before calling work done, and report the
  real output. Never claim a pass you did not see.
- State why before adding any dependency, and install it with `--save-exact`.
- No `eslint-disable` without a comment explaining why **and** user approval.
- If a rule truly cannot be met, say so and record the exception in an ADR.
- **Never commit or push automatically.** Leave changes uncommitted, report the results and how
  to try them (`npm start`), and propose a Conventional Commit message. The owner reviews the
  diff, tests locally and makes the commit; push only after they say so.
  _One-off exception:_ the initial setup (foundation and first room) was committed locally in
  small steps at the owner's request. That exception does not carry over to later work.
