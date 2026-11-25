import { type Observable, of } from 'rxjs';
import { type IFileSaver, type ISavedFile } from '@core/interfaces/i-file-saver';

/** Remembers the files it was given, for specs. */
export class FakeFileSaver implements IFileSaver {
  /** Every file saved, oldest first. */
  public readonly saved: ISavedFile[] = [];

  public save(file: ISavedFile): Observable<void> {
    this.saved.push(file);
    return of(undefined);
  }
}
