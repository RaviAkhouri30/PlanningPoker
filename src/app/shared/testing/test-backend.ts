import { type Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { FakeAuthService } from '@core/backends/fake/fake-auth.service';
import { FakeClipboardService } from '@core/backends/fake/fake-clipboard.service';
import { FakeFileSaver } from '@core/backends/fake/fake-file-saver';
import { FakePreferenceStore } from '@core/backends/fake/fake-preference-store';
import { FakeRealtimeStore } from '@core/backends/fake/fake-realtime-store';
import { FakeServerClock } from '@core/backends/fake/fake-server-clock';
import { StoreWriteKind } from '@core/enums/store-write-kind.enum';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { IClipboardService } from '@core/interfaces/i-clipboard-service';
import { IFileSaver } from '@core/interfaces/i-file-saver';
import { IPreferenceStore } from '@core/interfaces/i-preference-store';
import { IRealtimeStore, type StoreFields } from '@core/interfaces/i-realtime-store';
import { IServerClock } from '@core/interfaces/i-server-clock';
import { CLOCK } from '@core/tokens/clock.token';
import { RANDOM } from '@core/tokens/random.token';

/** The time the test clock reports, unless a spec moves it. */
export const TEST_NOW = Date.UTC(2026, 10, 25, 9, 0, 0);

/** A clock specs can move. */
export const testClock = { now: (): number => TEST_NOW };

/**
 * @returns Providers wiring every port to its fake, with a fixed clock and random source
 * (the first character of the alphabet every time).
 */
export function testBackendProviders(): Provider[] {
  return [
    { provide: CLOCK, useValue: testClock },
    { provide: RANDOM, useValue: () => 0 },
    { provide: IRealtimeStore, useFactory: () => new FakeRealtimeStore() },
    { provide: IAuthService, useFactory: () => new FakeAuthService() },
    { provide: IClipboardService, useFactory: () => new FakeClipboardService() },
    { provide: IPreferenceStore, useFactory: () => new FakePreferenceStore() },
    { provide: IFileSaver, useFactory: () => new FakeFileSaver() },
    { provide: IServerClock, useFactory: () => new FakeServerClock() },
  ];
}

/** Stores documents straight into the fake store, standing in for data already there. */
export async function seed(documents: Readonly<Record<string, StoreFields>>): Promise<void> {
  const store = TestBed.inject(IRealtimeStore);
  await firstValueFrom(
    store.commit(
      Object.entries(documents).map(([path, fields]) => ({
        kind: StoreWriteKind.Set,
        path,
        fields,
      })),
    ),
    { defaultValue: undefined },
  );
}

/** Reads one document from the fake store. */
export function stored(path: string): Promise<StoreFields | null> {
  return firstValueFrom(TestBed.inject(IRealtimeStore).watchDocument(path));
}

/** A room document as `RoomsService.create` writes it, with overrides. */
export function roomFields(change: StoreFields = {}): StoreFields {
  return {
    name: 'Sprint 42',
    code: 'AAAA-AA',
    moderatorUid: 'mod',
    moderatorName: 'Alex Kim',
    deck: 'mfib',
    autoReveal: true,
    spectatorsByDefault: false,
    timerSeconds: 60,
    lockOnTimeUp: true,
    activeStoryId: null,
    round: 1,
    revealed: false,
    roundStartedAt: TEST_NOW,
    createdAt: TEST_NOW,
    ...change,
  };
}

/** A participant document, with overrides. */
export function participantFields(change: StoreFields = {}): StoreFields {
  return {
    displayName: 'Alex Kim',
    colour: 0,
    role: 'player',
    votedRound: null,
    joinedAt: TEST_NOW,
    lastSeenAt: TEST_NOW,
    ...change,
  };
}
