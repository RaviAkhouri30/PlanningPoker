import { BrowserFileSaver } from '@core/backends/browser/browser-file-saver';
import { type IFileSaver } from '@core/interfaces/i-file-saver';

/**
 * Provides the file adapter. Like the clipboard, there is one real technology; specs provide
 * `FakeFileSaver` instead.
 * @returns The browser download adapter.
 */
export function fileSaverFactory(): IFileSaver {
  return new BrowserFileSaver();
}
