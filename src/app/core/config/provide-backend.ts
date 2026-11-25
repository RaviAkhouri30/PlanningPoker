import { type Provider } from '@angular/core';
import { authServiceFactory } from '@core/factories/auth-service.factory';
import { clipboardServiceFactory } from '@core/factories/clipboard-service.factory';
import { preferenceStoreFactory } from '@core/factories/preference-store.factory';
import { realtimeStoreFactory } from '@core/factories/realtime-store.factory';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { IClipboardService } from '@core/interfaces/i-clipboard-service';
import { IPreferenceStore } from '@core/interfaces/i-preference-store';
import { IRealtimeStore } from '@core/interfaces/i-realtime-store';

/**
 * Registers the adapters behind the `IAuthService`, `IRealtimeStore`, `IClipboardService` and
 * `IPreferenceStore` ports.
 */
export function provideBackend(): Provider[] {
  return [
    { provide: IAuthService, useFactory: authServiceFactory },
    { provide: IRealtimeStore, useFactory: realtimeStoreFactory },
    { provide: IClipboardService, useFactory: clipboardServiceFactory },
    { provide: IPreferenceStore, useFactory: preferenceStoreFactory },
  ];
}
