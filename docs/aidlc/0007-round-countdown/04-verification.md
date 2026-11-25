# 04 · Verification — Round countdown

Run on 2026-11-25, before the 1.6.0 release.

| Check                  | Result                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| `npm run verify`       | ✔ 428 unit tests; statements 99.69 %, branches 95.8 %, functions 99.37 %, lines 99.81 %; api 6 at 100 % |
| `npm run e2e`          | ✔ 45/45 (desktop, tablet, mobile), including the countdown journey with Playwright's clock; axe clean   |
| `npm run test:rules`   | ✔ 19/19 in two files: the range, the lock at zero, reset and lengthening, the lock off, older rooms       |
| `npm run e2e:firebase` | ✔ 6/6: two browsers against the emulators, with the new rules                                           |

Covered end to end: the warning toast at 20 seconds, the time-up toast, the disabled deck and the
prompt at zero, "Reset timer" opening voting again, the stepper and its limits, and the lock
switch turned off (votes still count after zero).

Checked by hand at desktop and phone widths in the light theme: the amber and red timer, the
highlighted "Reset timer", the stepper and the lock switch.

Not run: Sonar (no server configured), Lighthouse, and a visual check of the dark theme.
