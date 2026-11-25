import {
  type Firestore,
  type Query,
  collection,
  connectFirestoreEmulator,
  doc,
  getFirestore,
  onSnapshot,
  orderBy as byField,
  query,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { Observable, defer } from 'rxjs';
import { StoreWriteKind } from '@core/enums/store-write-kind.enum';
import { type IEmulatorAddress, type IFirebaseConfig } from '@core/interfaces/i-firebase-config';
import {
  type IStoredDocument,
  type StoreFields,
  type StoreWrite,
} from '@core/interfaces/i-realtime-store';
import { getFirebaseApp } from './firebase-app';
import { fromFirestoreFields, toFirestoreFields } from './firestore-fields';
import { type IFirestoreGateway } from './i-firestore-gateway';

/** Pending server timestamps read as the local estimate, not `null`, until the server confirms. */
const SNAPSHOT_OPTIONS = { serverTimestamps: 'estimate' } as const;

/**
 * The only file that imports `firebase/firestore`. `FIRESTORE_GATEWAY_LOADER` loads it with a
 * dynamic `import()` on first use, so the SDK is its own lazy chunk. Uses the full SDK, not Lite,
 * because rooms need live listeners (ADR-0006).
 *
 * Listeners become Observables whose teardown unsubscribes; SDK Promises are wrapped with `defer`
 * so calls stay lazy and cold (CLAUDE.md §7).
 */
export class FirestoreGateway implements IFirestoreGateway {
  private readonly db: Firestore;

  /**
   * @param config Firebase web settings.
   * @param emulator Local emulator to use instead of the real service, or `null`.
   */
  public constructor(config: IFirebaseConfig, emulator: IEmulatorAddress | null) {
    // Shared default app; starts App Check when the config carries a site key.
    this.db = getFirestore(getFirebaseApp(config));
    if (emulator !== null) {
      connectFirestoreEmulator(this.db, emulator.host, emulator.port);
    }
  }

  public watchDocument(path: string): Observable<StoreFields | null> {
    const reference = doc(this.db, path);
    // onSnapshot returns its unsubscribe function, which becomes the teardown.
    return new Observable<StoreFields | null>((subscriber) =>
      onSnapshot(
        reference,
        (snapshot) => {
          const data = snapshot.data(SNAPSHOT_OPTIONS);
          subscriber.next(data === undefined ? null : fromFirestoreFields(data));
        },
        (error) => {
          subscriber.error(error);
        },
      ),
    );
  }

  public watchCollection(path: string, orderBy?: string): Observable<readonly IStoredDocument[]> {
    const reference = collection(this.db, path);
    const source: Query = orderBy === undefined ? reference : query(reference, byField(orderBy));
    return new Observable<readonly IStoredDocument[]>((subscriber) =>
      onSnapshot(
        source,
        (snapshot) => {
          subscriber.next(
            snapshot.docs.map((item) => ({
              id: item.id,
              fields: fromFirestoreFields(item.data(SNAPSHOT_OPTIONS)),
            })),
          );
        },
        (error) => {
          subscriber.error(error);
        },
      ),
    );
  }

  public commit(writes: readonly StoreWrite[]): Observable<void> {
    // defer: the batch is built and committed only on subscribe, so the call stays lazy and cold.
    return defer(() => {
      const batch = writeBatch(this.db);
      for (const write of writes) {
        const reference = doc(this.db, write.path);
        if (write.kind === StoreWriteKind.Delete) {
          batch.delete(reference);
        } else if (write.kind === StoreWriteKind.Update) {
          batch.update(reference, toFirestoreFields(write.fields, serverTimestamp()));
        } else {
          batch.set(reference, toFirestoreFields(write.fields, serverTimestamp()));
        }
      }
      return batch.commit();
    });
  }
}
