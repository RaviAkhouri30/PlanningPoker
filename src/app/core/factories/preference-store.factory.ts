import { BrowserPreferenceStore } from '@core/backends/browser/browser-preference-store';
import { type IPreferenceStore } from '@core/interfaces/i-preference-store';

/**
 * Provides the preference adapter. Like the clipboard, there is one real technology; specs provide
 * `FakePreferenceStore` instead.
 * @returns The browser `localStorage` adapter.
 */
export function preferenceStoreFactory(): IPreferenceStore {
  return new BrowserPreferenceStore();
}
