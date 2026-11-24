import { type Observable } from 'rxjs';
import { type IEmulatorAddress, type IFirebaseConfig } from '@core/interfaces/i-firebase-config';
import {
  type IStoredDocument,
  type StoreFields,
  type StoreWrite,
} from '@core/interfaces/i-realtime-store';

/** The SDK operations `FirebaseRealtimeStore` needs; implemented by `FirestoreGateway`. */
export interface IFirestoreGateway {
  watchDocument(path: string): Observable<StoreFields | null>;
  watchCollection(path: string, orderBy?: string): Observable<readonly IStoredDocument[]>;
  commit(writes: readonly StoreWrite[]): Observable<void>;
}

/** Creates a gateway, loading the SDK chunk first. */
export type FirestoreGatewayLoader = (
  config: IFirebaseConfig,
  emulator: IEmulatorAddress | null,
) => Observable<IFirestoreGateway>;
