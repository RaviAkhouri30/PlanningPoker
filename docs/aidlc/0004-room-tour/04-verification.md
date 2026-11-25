# 04 · Verification — Room tour

| Check                  | Result                                                              |
| ---------------------- | ------------------------------------------------------------------- |
| `npm run verify`       | ✔ 289 unit tests; statements 99.51 %, branches 96.27 %; api 6 at 100 % |
| `npm run e2e`          | ✔ 21/21 (desktop, tablet, mobile), axe clean with the tour open     |
| `npm run e2e:firebase` | ✔ 3/3; the guest gets no tour                                       |
| `npm run test:rules`   | not run: rules unchanged                                            |

Checked by hand at 1400 px and 375 px: tour steps, spotlight, card at top and bottom, footer.
