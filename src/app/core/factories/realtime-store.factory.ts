import { inject } from '@angular/core';
import { FakeRealtimeStore } from '@core/backends/fake/fake-realtime-store';
import { FirebaseRealtimeStore } from '@core/backends/firebase/firebase-realtime-store';
import { BackendType } from '@core/enums/backend-type.enum';
import { type IRealtimeStore } from '@core/interfaces/i-realtime-store';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';

/**
 * Picks the live data adapter (ADR-0002, ADR-0006). Runs in an injection context.
 * @returns Firestore in Firebase builds; the in-memory store otherwise.
 */
export function realtimeStoreFactory(): IRealtimeStore {
  return inject(APP_ENVIRONMENT).backend === BackendType.Firebase
    ? new FirebaseRealtimeStore()
    : new FakeRealtimeStore();
}
