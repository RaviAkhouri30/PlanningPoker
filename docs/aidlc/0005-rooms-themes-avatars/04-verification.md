# 04 · Verification — Rooms, themes and avatars

Run on 2026-11-25 for the 1.4.0 release.

| Check                  | Result                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| `npm run verify`       | ✔ 398 unit tests; statements 99.68 %, branches 95.5 %, functions 99.35 %, lines 99.8 %; api 6 at 100 % |
| `npm run e2e`          | ✔ 39/39 (desktop, tablet, mobile); axe clean in light and dark, with the dialogs open            |
| `npm run test:rules`   | ✔ 14/14, including the avatar id check                                                           |
| `npm run e2e:firebase` | ✔ 6/6: two browsers, avatars reach the moderator, auto-reveal with a facilitator                 |

Covered end to end: theme switch, facilitator default and switch, avatar pick, Add story dialog,
My rooms (redirect, open, forget), and the CSV backup (the downloaded file's name and rows, in the
room and from My rooms, including on WebKit).

Checked by hand in the browser at desktop and phone widths: the light stage and results colours,
both themes, the Add story dialog, My rooms and its buttons.

Not run: Sonar (no server configured) and Lighthouse.
