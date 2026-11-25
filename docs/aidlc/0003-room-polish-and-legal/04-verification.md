# 04 · Verification — Room polish and legal

| Check                 | Result                                                                  |
| --------------------- | ----------------------------------------------------------------------- |
| `npm run verify`      | ✔ 264 unit tests; statements 99.63 %, branches 96.16 %; api 6 at 100 %   |
| `npm run e2e`         | ✔ 18/18 (desktop, tablet, mobile), axe clean on landing, room and terms |
| `npm run e2e:firebase`| ✔ 3/3 (page object changed)                                             |
| `npm run test:rules`  | not run: rules unchanged                                                |
| Sonar, Lighthouse     | not run                                                                 |

Checked by hand in the browser at 1400 px and 375 px: empty table, focus jump, story rows, deck
disclosure, footer, terms page, no horizontal scroll.
