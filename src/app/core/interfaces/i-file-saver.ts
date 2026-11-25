import { type Observable } from 'rxjs';

/** A file to hand to the person, e.g. a CSV backup. */
export interface ISavedFile {
  /** e.g. `planning-poker-sprint-42.csv`. */
  readonly name: string;
  readonly content: string;
  /** e.g. `text/csv;charset=utf-8`. */
  readonly type: string;
}

/**
 * Port for giving the person a file to keep (CLAUDE.md §3). Also the DI token; `fileSaverFactory`
 * provides the browser adapter, and specs provide `FakeFileSaver`.
 */
export abstract class IFileSaver {
  /** Saves `file`; emits once and completes when it was handed over, errors when it can't be. */
  public abstract save(file: ISavedFile): Observable<void>;
}
