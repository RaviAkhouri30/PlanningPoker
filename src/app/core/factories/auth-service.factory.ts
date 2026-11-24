import { inject } from '@angular/core';
import { FakeAuthService } from '@core/backends/fake/fake-auth.service';
import { FirebaseAuthService } from '@core/backends/firebase/firebase-auth.service';
import { BackendType } from '@core/enums/backend-type.enum';
import { type IAuthService } from '@core/interfaces/i-auth-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';

/**
 * Picks the sign-in adapter (ADR-0002). Runs in an injection context, so adapters may `inject()`.
 * @returns Firebase Auth in Firebase builds; the fake otherwise.
 */
export function authServiceFactory(): IAuthService {
  return inject(APP_ENVIRONMENT).backend === BackendType.Firebase
    ? new FirebaseAuthService()
    : new FakeAuthService();
}
