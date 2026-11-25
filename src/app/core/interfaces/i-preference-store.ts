/**
 * Port for small per-browser settings, like "the room tour has been seen" (CLAUDE.md §3). Also the
 * DI token; `preferenceStoreFactory` provides the browser adapter, and specs provide
 * `FakePreferenceStore`. Reads and writes are synchronous and never throw: a browser that blocks
 * storage just forgets.
 */
export abstract class IPreferenceStore {
  /** @returns The value saved under `key`, or `null` when there is none. */
  public abstract read(key: string): string | null;

  /** Saves `value` under `key`, when the browser allows it. */
  public abstract write(key: string, value: string): void;
}
