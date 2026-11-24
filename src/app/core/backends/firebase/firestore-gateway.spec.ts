import { connectFirestoreEmulator, onSnapshot, writeBatch } from 'firebase/firestore';
import { firstValueFrom } from 'rxjs';
import { StoreWriteKind } from '@core/enums/store-write-kind.enum';
import { SERVER_TIME } from '@core/interfaces/i-realtime-store';
import { FirestoreGateway } from './firestore-gateway';

vi.mock('firebase/app', async () => (await import('./testing/firebase-sdk.mock')).firebaseAppMock);
vi.mock(
  'firebase/firestore',
  async () => (await import('./testing/firebase-sdk.mock')).firestoreMock,
);

type Listener = (snapshot: unknown) => void;
type Failure = (error: unknown) => void;

describe('FirestoreGateway', () => {
  const config = {
    apiKey: 'k',
    authDomain: 'd',
    projectId: 'p',
    storageBucket: 'b',
    messagingSenderId: 'm',
    appId: 'a',
  };

  /** Makes the next onSnapshot call answer with `snapshot` (or fail with `error`). */
  function answer(snapshot: unknown, error?: unknown): void {
    vi.mocked(onSnapshot).mockImplementationOnce(((
      _ref: unknown,
      next: Listener,
      fail: Failure,
    ) => {
      if (error === undefined) {
        next(snapshot);
      } else {
        fail(error);
      }
      return () => undefined;
    }) as never);
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should connect the emulator when one is given', () => {
    expect(new FirestoreGateway(config, { host: '127.0.0.1', port: 8080 })).toBeInstanceOf(
      FirestoreGateway,
    );

    expect(connectFirestoreEmulator).toHaveBeenCalledWith(expect.anything(), '127.0.0.1', 8080);
  });

  it('should emit a document with times as milliseconds when it exists', async () => {
    answer({ data: () => ({ name: 'A', at: { toMillis: () => 9 } }) });

    const fields = await firstValueFrom(
      new FirestoreGateway(config, null).watchDocument('rooms/a'),
    );

    expect(fields).toEqual({ name: 'A', at: 9 });
  });

  it('should emit null when the document does not exist', async () => {
    answer({ data: () => undefined });

    await expect(
      firstValueFrom(new FirestoreGateway(config, null).watchDocument('rooms/a')),
    ).resolves.toBeNull();
  });

  it('should fail the stream when the listener fails', async () => {
    answer(null, new Error('permission-denied'));

    await expect(
      firstValueFrom(new FirestoreGateway(config, null).watchDocument('rooms/a')),
    ).rejects.toThrow('permission-denied');
  });

  it('should emit a collection with ids, sorted when a field is given', async () => {
    answer({ docs: [{ id: 'x', data: () => ({ order: 1 }) }] });

    const documents = await firstValueFrom(
      new FirestoreGateway(config, null).watchCollection('rooms/a/stories', 'order'),
    );

    expect(documents).toEqual([{ id: 'x', fields: { order: 1 } }]);
    expect(vi.mocked(onSnapshot).mock.calls[0]?.[0]).toEqual({
      reference: { path: 'rooms/a/stories' },
      constraints: [{ orderBy: 'order' }],
    });
  });

  it('should listen to the bare collection when no field is given', async () => {
    answer({ docs: [] });

    await firstValueFrom(new FirestoreGateway(config, null).watchCollection('rooms'));

    expect(vi.mocked(onSnapshot).mock.calls[0]?.[0]).toEqual({ path: 'rooms' });
  });

  it('should fail a collection stream when the listener fails', async () => {
    answer(null, new Error('denied'));

    await expect(
      firstValueFrom(new FirestoreGateway(config, null).watchCollection('rooms')),
    ).rejects.toThrow('denied');
  });

  it('should apply every write in one batch with server timestamps when committed', async () => {
    const batch = {
      set: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      commit: vi.fn(() => Promise.resolve()),
    };
    vi.mocked(writeBatch).mockReturnValueOnce(batch as never);

    await firstValueFrom(
      new FirestoreGateway(config, null).commit([
        { kind: StoreWriteKind.Set, path: 'a/1', fields: { at: SERVER_TIME } },
        { kind: StoreWriteKind.Update, path: 'a/2', fields: { n: 1 } },
        { kind: StoreWriteKind.Delete, path: 'a/3' },
      ]),
      { defaultValue: undefined },
    );

    expect(batch.set).toHaveBeenCalledWith({ path: 'a/1' }, { at: 'SERVER_TIMESTAMP' });
    expect(batch.update).toHaveBeenCalledWith({ path: 'a/2' }, { n: 1 });
    expect(batch.delete).toHaveBeenCalledWith({ path: 'a/3' });
    expect(batch.commit).toHaveBeenCalledOnce();
  });
});
