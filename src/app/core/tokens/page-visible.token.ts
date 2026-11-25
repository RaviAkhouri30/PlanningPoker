import { DOCUMENT } from '@angular/common';
import { InjectionToken, inject } from '@angular/core';
import { type Observable, distinctUntilChanged, fromEvent, map, startWith } from 'rxjs';

/** The event the document fires when its tab is shown or hidden. */
const VISIBILITY_CHANGE = 'visibilitychange';

/** `document.visibilityState` for a tab behind another one or in a minimised window. */
const HIDDEN = 'hidden';

/**
 * Whether this tab is on screen: `true` now and whenever it comes back to the front, `false`
 * while it is hidden. Emits the current state first. Override in tests with
 * `{ provide: PAGE_VISIBLE, useValue: subject }`.
 */
export const PAGE_VISIBLE = new InjectionToken<Observable<boolean>>('PAGE_VISIBLE', {
  providedIn: 'root',
  factory: () => {
    const document = inject(DOCUMENT);
    return fromEvent(document, VISIBILITY_CHANGE).pipe(
      startWith(null),
      map(() => document.visibilityState !== HIDDEN),
      distinctUntilChanged(),
    );
  },
});
