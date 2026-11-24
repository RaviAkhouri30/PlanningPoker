import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { StoreWriteKind } from '@core/enums/store-write-kind.enum';
import { SERVER_TIME } from '@core/interfaces/i-realtime-store';
import { CLOCK } from '@core/tokens/clock.token';
import { FakeRealtimeStore } from './fake-realtime-store';

describe('FakeRealtimeStore', () => {
  let store: FakeRealtimeStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: CLOCK, useValue: { now: () => 42 } }],
    });
    store = TestBed.runInInjectionContext(() => new FakeRealtimeStore());
  });

  it('should emit null when a document does not exist', async () => {
    await expect(firstValueFrom(store.watchDocument('rooms/a'))).resolves.toBeNull();
  });

  it('should store a set and stamp the server time when committed', async () => {
    await firstValueFrom(
      store.commit([
        { kind: StoreWriteKind.Set, path: 'rooms/a', fields: { name: 'A', at: SERVER_TIME } },
      ]),
      { defaultValue: undefined },
    );

    await expect(firstValueFrom(store.watchDocument('rooms/a'))).resolves.toEqual({
      name: 'A',
      at: 42,
    });
  });

  it('should merge fields when updated', async () => {
    await firstValueFrom(
      store.commit([
        { kind: StoreWriteKind.Set, path: 'rooms/a', fields: { name: 'A', round: 1 } },
        { kind: StoreWriteKind.Update, path: 'rooms/a', fields: { round: 2 } },
      ]),
    );

    await expect(firstValueFrom(store.watchDocument('rooms/a'))).resolves.toEqual({
      name: 'A',
      round: 2,
    });
  });

  it('should fail and store nothing when an update has no document', async () => {
    const commit = store.commit([
      { kind: StoreWriteKind.Set, path: 'rooms/b', fields: {} },
      { kind: StoreWriteKind.Update, path: 'rooms/a', fields: { round: 2 } },
    ]);

    await expect(firstValueFrom(commit)).rejects.toThrow('No document to update: rooms/a');
    await expect(firstValueFrom(store.watchDocument('rooms/b'))).resolves.toBeNull();
  });

  it('should remove a document when deleted', async () => {
    await firstValueFrom(store.commit([{ kind: StoreWriteKind.Set, path: 'rooms/a', fields: {} }]));

    await firstValueFrom(store.commit([{ kind: StoreWriteKind.Delete, path: 'rooms/a' }]));

    await expect(firstValueFrom(store.watchDocument('rooms/a'))).resolves.toBeNull();
  });

  it('should list only direct children, sorted by the field when one is given', async () => {
    await firstValueFrom(
      store.commit([
        { kind: StoreWriteKind.Set, path: 'rooms/a/stories/x', fields: { order: 2 } },
        { kind: StoreWriteKind.Set, path: 'rooms/a/stories/y', fields: { order: 1 } },
        { kind: StoreWriteKind.Set, path: 'rooms/a/stories/y/comments/c', fields: { order: 0 } },
      ]),
    );

    const stories = await firstValueFrom(store.watchCollection('rooms/a/stories', 'order'));

    expect(stories.map((story) => story.id)).toEqual(['y', 'x']);
  });

  it('should sort by id when no field is given', async () => {
    await firstValueFrom(
      store.commit([
        { kind: StoreWriteKind.Set, path: 'c/b', fields: {} },
        { kind: StoreWriteKind.Set, path: 'c/a', fields: {} },
      ]),
    );

    const documents = await firstValueFrom(store.watchCollection('c'));

    expect(documents.map((document) => document.id)).toEqual(['a', 'b']);
  });
});
