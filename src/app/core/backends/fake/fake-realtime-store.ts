import { inject } from '@angular/core';
import {
  BehaviorSubject,
  type Observable,
  defer,
  distinctUntilChanged,
  map,
  of,
  throwError,
} from 'rxjs';
import { StoreWriteKind } from '@core/enums/store-write-kind.enum';
import {
  type IRealtimeStore,
  type IStoredDocument,
  SERVER_TIME,
  type StoreFields,
  type StoreWrite,
} from '@core/interfaces/i-realtime-store';
import { CLOCK } from '@core/tokens/clock.token';

type Documents = ReadonlyMap<string, StoreFields>;

/**
 * In-memory live store for development, unit tests and the Fake e2e suite. Every commit replaces
 * the whole map, so watchers see one consistent state per commit, as with Firestore.
 * Enforces no rules: the rules are tested against the emulator (`npm run test:rules`).
 */
export class FakeRealtimeStore implements IRealtimeStore {
  private readonly clock = inject(CLOCK);
  private readonly documents = new BehaviorSubject<Documents>(new Map());

  public watchDocument(path: string): Observable<StoreFields | null> {
    return this.documents.pipe(
      map((documents) => documents.get(path) ?? null),
      distinctUntilChanged(),
    );
  }

  public watchCollection(path: string, orderBy?: string): Observable<readonly IStoredDocument[]> {
    const prefix = `${path}/`;
    return this.documents.pipe(
      map((documents) =>
        [...documents]
          .filter(([key]) => key.startsWith(prefix) && !key.slice(prefix.length).includes('/'))
          .map(([key, fields]) => ({ id: key.slice(prefix.length), fields }))
          .sort((a, b) => compareDocuments(a, b, orderBy)),
      ),
    );
  }

  public commit(writes: readonly StoreWrite[]): Observable<void> {
    // defer: the writes apply on subscribe, like a real commit, and a failure stores nothing.
    return defer(() => {
      const next = new Map(this.documents.value);
      for (const write of writes) {
        const failure = this.apply(next, write);
        if (failure !== null) {
          return throwError(() => failure);
        }
      }
      this.documents.next(next);
      return of(undefined);
    });
  }

  /** @returns An error when the write can't apply, else `null` (and `documents` is changed). */
  private apply(documents: Map<string, StoreFields>, write: StoreWrite): Error | null {
    if (write.kind === StoreWriteKind.Delete) {
      documents.delete(write.path);
      return null;
    }
    const current = documents.get(write.path);
    if (write.kind === StoreWriteKind.Update && current === undefined) {
      return new Error(`No document to update: ${write.path}`);
    }
    const fields = this.withTimes(write.fields);
    documents.set(
      write.path,
      write.kind === StoreWriteKind.Update ? { ...current, ...fields } : fields,
    );
    return null;
  }

  /** @returns The fields with every `SERVER_TIME` replaced by the clock's time. */
  private withTimes(fields: StoreFields): StoreFields {
    const now = this.clock.now();
    return Object.fromEntries(
      Object.entries(fields).map(([key, value]) => [key, value === SERVER_TIME ? now : value]),
    );
  }
}

/** Reads an own field only, never one inherited from the prototype. */
function ownValue(fields: StoreFields, key: string): unknown {
  return Object.getOwnPropertyDescriptor(fields, key)?.value as unknown;
}

/** Sorts by `orderBy` when given (numbers, then strings), else by id. */
function compareDocuments(a: IStoredDocument, b: IStoredDocument, orderBy?: string): number {
  const left = orderBy === undefined ? a.id : ownValue(a.fields, orderBy);
  const right = orderBy === undefined ? b.id : ownValue(b.fields, orderBy);
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right;
  }
  return String(left).localeCompare(String(right));
}
