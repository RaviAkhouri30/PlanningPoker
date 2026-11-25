import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { type Observable, of, throwError } from 'rxjs';
import { type IFileSaver, type ISavedFile } from '@core/interfaces/i-file-saver';

/** Downloads a file through a temporary link to an in-memory blob; nothing is uploaded. */
export class BrowserFileSaver implements IFileSaver {
  private readonly document = inject(DOCUMENT);
  /** The last file's blob, kept until the next save (see below). */
  private lastHref: string | null = null;

  public save(file: ISavedFile): Observable<void> {
    const url = this.document.defaultView?.URL;
    if (url === undefined) {
      return throwError(() => new Error('Downloads unavailable'));
    }
    // Safari reads the blob after the click returns, so revoking it at once can cancel the
    // download. Releasing the previous file's blob instead keeps at most one in memory.
    if (this.lastHref !== null) {
      url.revokeObjectURL(this.lastHref);
    }
    const href = url.createObjectURL(new Blob([file.content], { type: file.type }));
    this.lastHref = href;
    const link = this.document.createElement('a');
    link.href = href;
    link.download = file.name;
    link.click();
    return of(undefined);
  }
}
