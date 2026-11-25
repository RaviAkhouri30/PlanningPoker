import { type Provider } from '@angular/core';
import { authServiceFactory } from '@core/factories/auth-service.factory';
import { clipboardServiceFactory } from '@core/factories/clipboard-service.factory';
import { fileSaverFactory } from '@core/factories/file-saver.factory';
import { preferenceStoreFactory } from '@core/factories/preference-store.factory';
import { realtimeStoreFactory } from '@core/factories/realtime-store.factory';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { IClipboardService } from '@core/interfaces/i-clipboard-service';
import { IFileSaver } from '@core/interfaces/i-file-saver';
import { IPreferenceStore } from '@core/interfaces/i-preference-store';
import { IRealtimeStore } from '@core/interfaces/i-realtime-store';

/**
 * Registers the adapters behind the `IAuthService`, `IRealtimeStore`, `IClipboardService`,
 * `IPreferenceStore` and `IFileSaver` ports.
 */
export function provideBackend(): Provider[] {
  return [
    { provide: IAuthService, useFactory: authServiceFactory },
    { provide: IRealtimeStore, useFactory: realtimeStoreFactory },
    { provide: IClipboardService, useFactory: clipboardServiceFactory },
    { provide: IPreferenceStore, useFactory: preferenceStoreFactory },
    { provide: IFileSaver, useFactory: fileSaverFactory },
  ];
}
