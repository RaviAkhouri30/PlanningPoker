# 04 · Verification — Accessibility pass and a better room tour

Run on 2026-11-25, before the 1.8.0 release.

| Check                  | Result                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------- |
| Accessibility audit    | ✔ no axe violations (WCAG 2.2 A/AA + best practices) on 12 page states × light/dark × desktop/phone      |
| Keyboard and layout    | ✔ focus visible on every control; no horizontal scroll at 320 px or with 200 % text; reduced motion on   |
| Contrast by hand       | ✔ layered text pairs from the tokens: 5.4:1 to 10.3:1                                                    |
| `npm run verify`       | ✔ 437 unit tests; statements 99.75 %, branches 95.99 %; api 6 at 100 %                                   |
| `npm run e2e`          | ✔ 48/48 (desktop, tablet, mobile) with the wider axe scan; tour arrow keys and focus return covered     |
| `npm run e2e:firebase` | ✔ 6/6, now scanning the join page                                                                        |

Not run: a screen-reader session by a person (VoiceOver, NVDA), Lighthouse and Sonar.
`test:rules` not needed: no rules or data change.
