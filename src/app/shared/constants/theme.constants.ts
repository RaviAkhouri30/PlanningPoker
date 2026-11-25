import { ThemeMode } from '@shared/enums/theme-mode.enum';

/**
 * Where the choice is kept in this browser. `index.html` reads the same key before the app boots,
 * so a forced theme paints from the first frame; keep the two in step.
 */
export const THEME_STORAGE_KEY = 'planning-poker.theme';

/** The attribute on `<html>` that forces a theme; `styles/_theme.scss` reads it. */
export const THEME_ATTRIBUTE = 'data-theme';

/** The toggle's order: each press moves to the next mode. */
export const THEME_CYCLE: readonly ThemeMode[] = [
  ThemeMode.System,
  ThemeMode.Light,
  ThemeMode.Dark,
];

/** What each mode is called on the toggle. */
export const THEME_LABELS: ReadonlyMap<ThemeMode, string> = new Map([
  [ThemeMode.System, 'System'],
  [ThemeMode.Light, 'Light'],
  [ThemeMode.Dark, 'Dark'],
]);
