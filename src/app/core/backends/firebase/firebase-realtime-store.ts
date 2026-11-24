import { inject } from '@angular/core';
import { type Observable, switchMap, throwError } from 'rxjs';
import {
  type IRealtimeStore,
  type IStoredDocument,
  type StoreFields,
  type StoreWrite,
} from '@core/interfaces/i-realtime-store';
import { FirestoreConnection } from './firestore-connection.service';
import { type IFirestoreGateway } from './i-firestore-gateway';

/** Cloud Firestore adapter for `IRealtimeStore` (ADR-0006); the SDK loads on first use. */
export class FirebaseRealtimeStore implements IRealtimeStore {
  private readonly gateway$ = inject(FirestoreConnection).gateway$;

  public watchDocument(path: string): Observable<StoreFields | null> {
    return this.call((gateway) => gateway.watchDocument(path));
  }

  public watchCollection(path: string, orderBy?: string): Observable<readonly IStoredDocument[]> {
    return this.call((gateway) => gateway.watchCollection(path, orderBy));
  }

  public commit(writes: readonly StoreWrite[]): Observable<void> {
    return this.call((gateway) => gateway.commit(writes));
  }

  /** Runs `request` once the gateway has loaded. */
  private call<T>(request: (gateway: IFirestoreGateway) => Observable<T>): Observable<T> {
    if (this.gateway$ === null) {
      return throwError(() => new Error('Firebase is not configured'));
    }
    // gateway$ emits exactly once, so switchMap only ever follows one inner stream.
    return this.gateway$.pipe(switchMap(request));
  }
}
