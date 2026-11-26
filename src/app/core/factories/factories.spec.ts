import { TestBed } from '@angular/core/testing';
import { BrowserClipboardService } from '@core/backends/browser/browser-clipboard.service';
import { BrowserFileSaver } from '@core/backends/browser/browser-file-saver';
import { BrowserPreferenceStore } from '@core/backends/browser/browser-preference-store';
import { BrowserServerClock } from '@core/backends/browser/browser-server-clock';
import { FakeAuthService } from '@core/backends/fake/fake-auth.service';
import { FakeRealtimeStore } from '@core/backends/fake/fake-realtime-store';
import { FakeServerClock } from '@core/backends/fake/fake-server-clock';
import { FirebaseAuthService } from '@core/backends/firebase/firebase-auth.service';
import { FirebaseRealtimeStore } from '@core/backends/firebase/firebase-realtime-store';
import { BackendType } from '@core/enums/backend-type.enum';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { authServiceFactory } from './auth-service.factory';
import { clipboardServiceFactory } from './clipboard-service.factory';
import { fileSaverFactory } from './file-saver.factory';
import { preferenceStoreFactory } from './preference-store.factory';
import { realtimeStoreFactory } from './realtime-store.factory';
import { serverClockFactory } from './server-clock.factory';

describe('adapter factories', () => {
  function inEnvironment<T>(backend: BackendType, factory: () => T): T {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: APP_ENVIRONMENT,
          useValue: {
            production: false,
            backend,
            firebase: null,
            firestoreEmulator: null,
            authEmulator: null,
          },
        },
      ],
    });
    return TestBed.runInInjectionContext(factory);
  }

  it('should pick the fakes when the backend is Fake', () => {
    expect(inEnvironment(BackendType.Fake, authServiceFactory)).toBeInstanceOf(FakeAuthService);
    TestBed.resetTestingModule();
    expect(inEnvironment(BackendType.Fake, realtimeStoreFactory)).toBeInstanceOf(FakeRealtimeStore);
  });

  it('should pick Firebase when the backend is Firebase', () => {
    expect(inEnvironment(BackendType.Firebase, authServiceFactory)).toBeInstanceOf(
      FirebaseAuthService,
    );
    TestBed.resetTestingModule();
    expect(inEnvironment(BackendType.Firebase, realtimeStoreFactory)).toBeInstanceOf(
      FirebaseRealtimeStore,
    );
  });

  it('should provide the browser clipboard', () => {
    expect(inEnvironment(BackendType.Fake, clipboardServiceFactory)).toBeInstanceOf(
      BrowserClipboardService,
    );
  });

  it('should provide the browser preference store', () => {
    expect(inEnvironment(BackendType.Fake, preferenceStoreFactory)).toBeInstanceOf(
      BrowserPreferenceStore,
    );
  });

  it('should provide the browser file saver', () => {
    expect(inEnvironment(BackendType.Fake, fileSaverFactory)).toBeInstanceOf(BrowserFileSaver);
  });

  it('should read the server clock from the health function when the backend is Firebase', () => {
    expect(inEnvironment(BackendType.Firebase, serverClockFactory)).toBeInstanceOf(
      BrowserServerClock,
    );
  });

  it('should use no clock offset when the backend is Fake', () => {
    expect(inEnvironment(BackendType.Fake, serverClockFactory)).toBeInstanceOf(FakeServerClock);
  });
});
