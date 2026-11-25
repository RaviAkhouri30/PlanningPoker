import { TestBed } from '@angular/core/testing';
import {
  type ActivatedRouteSnapshot,
  Router,
  type RouterStateSnapshot,
  type UrlTree,
  provideRouter,
} from '@angular/router';
import { RoomRole } from '@shared/enums/room-role.enum';
import { MyRoomsService } from '@shared/services/my-rooms.service';
import { testBackendProviders } from '@shared/testing/test-backend';
import { returningGuestGuard } from './returning-guest.guard';

describe('returningGuestGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [...testBackendProviders(), provideRouter([])] });
  });

  function decide(): boolean | UrlTree {
    return TestBed.runInInjectionContext(
      () =>
        returningGuestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot) as
          boolean | UrlTree,
    );
  }

  function rememberARoom(): void {
    TestBed.inject(MyRoomsService).remember({
      id: 'r1',
      name: 'Sprint',
      code: 'X7K2-92',
      role: RoomRole.Player,
      lastVisit: 1,
    });
  }

  it('should show the home page when this browser has no rooms', () => {
    expect(decide()).toBe(true);
  });

  it('should send a returning guest to My rooms when they arrive with rooms saved', () => {
    rememberARoom();

    const decision = decide();

    expect(TestBed.inject(Router).serializeUrl(decision as UrlTree)).toBe('/rooms');
  });

  it('should show the home page when a link inside the app leads there', () => {
    rememberARoom();
    vi.spyOn(TestBed.inject(Router), 'navigated', 'get').mockReturnValue(true);

    expect(decide()).toBe(true);
  });
});
