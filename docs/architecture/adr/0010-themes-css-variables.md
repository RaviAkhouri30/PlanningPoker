# ADR-0010: Light and dark themes through CSS custom properties

- **Status:** Accepted
- **Date:** 2026-11-25
- **Version:** 1.4.0

## Context

The owner asked for a light and a dark theme that follow the system or can be forced. Every colour
already comes from one Sass map (`_tokens.scss`), read through `t.color()` about 400 times, and
no style does Sass colour maths on those values.

## Decision

- `t.color(name)` returns `var(--pp-name)`. `styles/_theme.scss` writes the light map on `:root`
  and the dark overrides (`$palette-dark`) for `[data-theme='dark']` and for a dark system unless
  the page is forced light. Bootstrap's Sass, which does colour maths, reads `t.raw()`.
- Tokens that mean different things in the two themes are split: `surface` (panels) vs `white`
  (always white), `accent` (fills under white text) vs `accent-text` (text on surfaces),
  `contrast` / `on-contrast` (the strongest fill and its text), `card-ink` (text on white cards).
- `ThemeService` (root) keeps the choice (`system`, `light`, `dark`) in `IPreferenceStore` and
  sets `data-theme` on `<html>`. A small inline script in `index.html` applies a saved forced
  theme before the first paint; the production CSP hashes it (`security.autoCsp`).

## Consequences

- No component changes to add a theme: only token values.
- New colours must be added to `$palette` (and to `$palette-dark` when they change), and be
  checked for contrast in both themes; the e2e suite runs axe in dark as well as light.
- The theme key lives in two places (`theme.constants.ts` and `index.html`); both say so.
