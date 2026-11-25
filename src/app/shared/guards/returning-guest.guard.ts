import { inject } from '@angular/core';
import { type CanActivateFn, Router, type UrlTree } from '@angular/router';
import { MY_ROOMS_COMMANDS } from '@shared/constants/routes.constants';
import { MyRoomsService } from '@shared/services/my-rooms.service';

/**
 * A guest who comes back to the home page with rooms in this browser lands on My rooms instead.
 * Only on arrival (an address typed, a bookmark): links inside the app, like "New room" or the
 * logo, still reach the home page, so its create form stays one click away.
 */
export const returningGuestGuard: CanActivateFn = (): boolean | UrlTree => {
  const router = inject(Router);
  const arriving = !router.navigated;
  return arriving && inject(MyRoomsService).rooms().length > 0
    ? router.createUrlTree(MY_ROOMS_COMMANDS)
    : true;
};
