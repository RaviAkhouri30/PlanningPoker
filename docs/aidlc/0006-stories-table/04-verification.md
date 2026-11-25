# 04 · Verification — Stories table

Run on 2026-11-25 for the 1.5.0 release.

| Check                  | Result                                                                                                   |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| `npm run verify`       | ✔ 407 unit tests; statements 99.68 %, branches 95.57 %, functions 99.36 %, lines 99.81 %; api 6 at 100 % |
| `npm run e2e`          | ✔ 39/39 (desktop, tablet, mobile); axe clean with the added-stories list open                            |
| `npm run e2e:firebase` | ✔ 6/6                                                                                                    |
| `npm run test:rules`   | not run: rules unchanged                                                                                 |

Checked in the browser at 1400 px (light and dark) and on a phone (Pixel 7): the table, the active
row, Vote and Re-estimate, the phone cards, the dialog's list with ticks and the red Close button.

Not run: Sonar (no server configured) and Lighthouse.
