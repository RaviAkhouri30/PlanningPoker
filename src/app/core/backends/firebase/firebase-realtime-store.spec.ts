import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { FIRESTORE_GATEWAY_LOADER } from './firestore-gateway-loader.token';
import { FirebaseRealtimeStore } from './firebase-realtime-store';
import { type IFirestoreGateway } from './i-firestore-gateway';
import { TEST_FIREBASE_CONFIG, firebaseTestProviders } from './testing/firebase-test-config';

describe('FirebaseRealtimeStore', () => {
  const watchDocument = vi.fn(() => of({ name: 'A' }));
  const watchCollection = vi.fn(() => of([{ id: 'x', fields: {} }]));
  const commit = vi.fn(() => of(undefined));
  const gateway: IFirestoreGateway = { watchDocument, watchCollection, commit };

  function create(configured: boolean): FirebaseRealtimeStore {
    const load = vi.fn(() => of(gateway));
    TestBed.configureTestingModule({
      providers: [
        ...firebaseTestProviders(configured ? TEST_FIREBASE_CONFIG : null),
        { provide: FIRESTORE_GATEWAY_LOADER, useValue: load },
      ],
    });
    return TestBed.runInInjectionContext(() => new FirebaseRealtimeStore());
  }

  it('should watch a document through the gateway', async () => {
    await expect(firstValueFrom(create(true).watchDocument('rooms/a'))).resolves.toEqual({
      name: 'A',
    });
    expect(watchDocument).toHaveBeenCalledWith('rooms/a');
  });

  it('should watch a collection through the gateway', async () => {
    await firstValueFrom(create(true).watchCollection('rooms/a/stories', 'order'));

    expect(watchCollection).toHaveBeenCalledWith('rooms/a/stories', 'order');
  });

  it('should commit through the gateway', async () => {
    await firstValueFrom(create(true).commit([]), { defaultValue: undefined });

    expect(commit).toHaveBeenCalledWith([]);
  });

  it('should fail when Firebase is not configured', async () => {
    await expect(firstValueFrom(create(false).watchDocument('rooms/a'))).rejects.toThrow(
      'Firebase is not configured',
    );
  });
});
