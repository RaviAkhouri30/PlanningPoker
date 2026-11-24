import { type Observable, of } from 'rxjs';
import { type IClipboardService } from '@core/interfaces/i-clipboard-service';

/** Remembers what was copied, for specs and the Fake e2e suite. */
export class FakeClipboardService implements IClipboardService {
  /** Every text copied, oldest first. */
  public readonly copied: string[] = [];

  public copy(text: string): Observable<void> {
    this.copied.push(text);
    return of(undefined);
  }
}
