import { inject } from '@angular/core';
import { type CanActivateFn, Router, type UrlTree } from '@angular/router';
import { type Observable, catchError, map, of, switchMap, take } from 'rxjs';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { LoggerService } from '@core/services/logger.service';
import { ROOM_ID_PARAM, joinCommands } from '@shared/constants/routes.constants';
import { ParticipantsService } from '@shared/services/participants.service';

/**
 * A room's link shows the room to its participants and the join form to everyone else, so one
 * link works for the moderator, teammates and anyone it's forwarded to.
 */
export const roomMemberGuard: CanActivateFn = (route): Observable<boolean | UrlTree> => {
  const router = inject(Router);
  const participants = inject(ParticipantsService);
  const logger = inject(LoggerService);
  const roomId = route.paramMap.get(ROOM_ID_PARAM) ?? '';
  const toJoin = router.createUrlTree(joinCommands(roomId));
  return inject(IAuthService).user$.pipe(
    take(1),
    // take(1) on both: one decision per navigation, so no listener stays open.
    switchMap((user) =>
      user === null ? of(null) : participants.watchOne(roomId, user.uid).pipe(take(1)),
    ),
    map((seat) => (seat === null ? toJoin : true)),
    catchError((error: unknown) => {
      logger.error('Checking room membership', error);
      return of(toJoin);
    }),
  );
};
