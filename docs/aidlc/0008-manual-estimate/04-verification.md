# 04 · Verification — Manual estimate

Run on 2026-11-25, before the 1.7.0 release.

| Check            | Result                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------- |
| `npm run verify` | ✔ 432 unit tests; statements 99.69 %, branches 95.86 %, functions 99.38 %, lines 99.81 %; api 6 at 100 % |
| `npm run e2e`    | ✔ 48/48 (desktop, tablet, mobile), including setting "6" by hand; axe clean with the results open        |

Not run: `test:rules` and `e2e:firebase` (no rules or data-layer change), Sonar, Lighthouse, and
a visual check of the dark theme.
