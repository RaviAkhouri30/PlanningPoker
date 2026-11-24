import { type Observable } from 'rxjs';
import { type StoreWriteKind } from '@core/enums/store-write-kind.enum';

/**
 * Stands for "the server's time" in a write. Adapters replace it with the store's own timestamp;
 * reads return times as milliseconds since the epoch.
 */
export const SERVER_TIME: unique symbol = Symbol('SERVER_TIME');

/** A stored document's fields, as plain values. */
export type StoreFields = Readonly<Record<string, unknown>>;

/** A document of a collection, with its id. */
export interface IStoredDocument {
  readonly id: string;
  readonly fields: StoreFields;
}

/** One write in an atomic commit. */
export type StoreWrite =
  | {
      readonly kind: StoreWriteKind.Set | StoreWriteKind.Update;
      readonly path: string;
      readonly fields: StoreFields;
    }
  | { readonly kind: StoreWriteKind.Delete; readonly path: string };

/**
 * Port for live data (ADR-0006): documents and collections that push every change, and atomic
 * commits. Abstract class, so it doubles as the DI token. Streams stay open until unsubscribed and
 * error when the store refuses the read (for example, a vote before its round is revealed).
 */
export abstract class IRealtimeStore {
  /**
   * @param path A document path, e.g. `rooms/abc`.
   * @returns The document's fields after every change, or `null` while it doesn't exist.
   */
  public abstract watchDocument(path: string): Observable<StoreFields | null>;

  /**
   * @param path A collection path, e.g. `rooms/abc/stories`.
   * @param orderBy A field to sort by, ascending; unsorted (by id) when omitted.
   * @returns The collection's documents after every change.
   */
  public abstract watchCollection(
    path: string,
    orderBy?: string,
  ): Observable<readonly IStoredDocument[]>;

  /**
   * @param writes The writes to apply.
   * @returns Completes once every write is stored; errors, with nothing stored, otherwise.
   */
  public abstract commit(writes: readonly StoreWrite[]): Observable<void>;
}
