import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { testBackendProviders } from '@shared/testing/test-backend';
import { GuestSessionService } from './guest-session.service';

describe('GuestSessionService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: testBackendProviders() });
  });

  it('should sign a nameless guest in when nobody is signed in', async () => {
    const user = await firstValueFrom(TestBed.inject(GuestSessionService).ensureSignedIn());

    expect(user.displayName).toBe('');
  });

  it('should keep the person already signed in', async () => {
    await firstValueFrom(TestBed.inject(IAuthService).signInAsGuest('Alex'));

    const user = await firstValueFrom(TestBed.inject(GuestSessionService).ensureSignedIn());

    expect(user.displayName).toBe('Alex');
  });
});
