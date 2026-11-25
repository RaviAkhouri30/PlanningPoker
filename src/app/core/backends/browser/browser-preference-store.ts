import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { type IPreferenceStore } from '@core/interfaces/i-preference-store';

/** Keeps preferences in the browser's `localStorage`. */
export class BrowserPreferenceStore implements IPreferenceStore {
  private readonly window = inject(DOCUMENT).defaultView;

  public read(key: string): string | null {
    // Private windows and blocked site data throw on access; treat that as "nothing saved".
    try {
      return this.window?.localStorage.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  public write(key: string, value: string): void {
    // Same as read: a refused write only means the preference isn't remembered.
    try {
      this.window?.localStorage.setItem(key, value);
    } catch {
      // Nothing to do: the app works the same, it just asks again next time.
    }
  }
}
