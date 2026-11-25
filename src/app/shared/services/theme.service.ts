import { DOCUMENT } from '@angular/common';
import { Service, type Signal, inject, signal } from '@angular/core';
import { IPreferenceStore } from '@core/interfaces/i-preference-store';
import { THEME_ATTRIBUTE, THEME_CYCLE, THEME_STORAGE_KEY } from '@shared/constants/theme.constants';
import { ThemeMode } from '@shared/enums/theme-mode.enum';

const MODES: readonly ThemeMode[] = Object.values(ThemeMode);

/**
 * The app's colour theme, one for the whole browser. It is an app-wide setting rather than a
 * page's state, so it lives in a root service, and it sets the theme on `<html>` because the
 * whole document's colours hang off it (`styles/_theme.scss`). Remembered per browser.
 */
@Service()
export class ThemeService {
  /** The chosen mode; `System` follows the operating system or browser. */
  public readonly mode: Signal<ThemeMode>;

  private readonly preferences = inject(IPreferenceStore);
  private readonly root = inject(DOCUMENT).documentElement;
  private readonly chosen = signal(ThemeService.parse(this.preferences.read(THEME_STORAGE_KEY)));

  public constructor() {
    // Assigned here because it reads `chosen`, a private field declared after the public one.
    this.mode = this.chosen.asReadonly();
    this.apply(this.chosen());
  }

  /** A saved value from an older or edited browser falls back to the system's choice. */
  private static parse(saved: string | null): ThemeMode {
    return MODES.find((mode) => mode === saved) ?? ThemeMode.System;
  }

  /** Moves to the next mode: system, light, dark, then system again. */
  public cycle(): void {
    const index = THEME_CYCLE.indexOf(this.chosen());
    this.set(THEME_CYCLE.at((index + 1) % THEME_CYCLE.length) ?? ThemeMode.System);
  }

  /** Uses `mode` from now on, and remembers it in this browser. */
  public set(mode: ThemeMode): void {
    this.chosen.set(mode);
    this.preferences.write(THEME_STORAGE_KEY, mode);
    this.apply(mode);
  }

  private apply(mode: ThemeMode): void {
    if (mode === ThemeMode.System) {
      this.root.removeAttribute(THEME_ATTRIBUTE);
    } else {
      this.root.setAttribute(THEME_ATTRIBUTE, mode);
    }
  }
}
