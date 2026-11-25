# 04 · Verification — First room

Run on 2026-11-25, locally (macOS, Node from `.nvmrc`).

| Check                  | Result                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------- |
| `npm run verify`       | ✔ format, lint (0 warnings), 9 diagrams, typecheck, build                               |
| Unit tests             | ✔ 253 passed; statements 99.69 %, branches 96.05 %, functions 99.34 %, lines 99.81 %    |
| API tests              | ✔ 6 passed; 100 % coverage                                                              |
| `npm run test:rules`   | ✔ 13 passed on the emulator                                                             |
| `npm run e2e`          | ✔ 9 passed (3 specs × desktop, tablet, mobile), axe WCAG 2.2 AA clean                    |
| `npm run e2e:firebase` | ✔ 6 passed (two browsers × 3 viewports, each run twice)                                 |
| Sonar                  | Not run (no server configured)                                                          |
| Lighthouse             | Not run yet                                                                             |
