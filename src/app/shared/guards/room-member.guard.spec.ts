import { TestBed } from '@angular/core/testing';
import {
  type ActivatedRouteSnapshot,
  Router,
  type RouterStateSnapshot,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { type Observable, firstValueFrom, throwError } from 'rxjs';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { LoggerService } from '@core/services/logger.service';
import { ParticipantsService } from '@shared/services/participants.service';
import { participantFields, seed, testBackendProviders } from '@shared/testing/test-backend';
import { roomMemberGuard } from './room-member.guard';

describe('roomMemberGuard', () => {
  const route = { paramMap: convertToParamMap({ roomId: 'r1' }) } as ActivatedRouteSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [...testBackendProviders(), provideRouter([])] });
  });

  function decide(): Promise<unknown> {
    return firstValueFrom(
      TestBed.runInInjectionContext(
        () => roomMemberGuard(route, {} as RouterStateSnapshot) as Observable<unknown>,
      ),
    );
  }

  function joinUrl(): string {
    return TestBed.inject(Router).serializeUrl(
      TestBed.inject(Router).createUrlTree(['/r', 'r1', 'join']),
    );
  }

  it('should send someone signed out to the join form', async () => {
    const decision = await decide();

    expect(TestBed.inject(Router).serializeUrl(decision as never)).toBe(joinUrl());
  });

  it('should send a signed-in non-participant to the join form', async () => {
    await firstValueFrom(TestBed.inject(IAuthService).signInAsGuest('Sam'));

    expect(TestBed.inject(Router).serializeUrl((await decide()) as never)).toBe(joinUrl());
  });

  it('should let a participant into the room', async () => {
    const user = await firstValueFrom(TestBed.inject(IAuthService).signInAsGuest('Sam'));
    await seed({ [`rooms/r1/participants/${user.uid}`]: participantFields() });

    await expect(decide()).resolves.toBe(true);
  });

  it('should log and send to the join form when the check fails', async () => {
    await firstValueFrom(TestBed.inject(IAuthService).signInAsGuest('Sam'));
    vi.spyOn(TestBed.inject(ParticipantsService), 'watchOne').mockReturnValue(
      throwError(() => new Error('x')),
    );
    const error = vi
      .spyOn(TestBed.inject(LoggerService), 'error')
      .mockImplementation(() => undefined);

    expect(TestBed.inject(Router).serializeUrl((await decide()) as never)).toBe(joinUrl());
    expect(error).toHaveBeenCalled();
  });
});
