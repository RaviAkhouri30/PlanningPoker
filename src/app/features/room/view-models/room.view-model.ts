import { Injectable, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  EMPTY,
  type Observable,
  Subject,
  catchError,
  combineLatest,
  concatMap,
  distinctUntilChanged,
  exhaustMap,
  filter,
  map,
  merge,
  of,
  shareReplay,
  switchMap,
  take,
  tap,
  timer,
} from 'rxjs';
import { IAuthService, type IAuthUser } from '@core/interfaces/i-auth-service';
import { LoggerService } from '@core/services/logger.service';
import { APP_ORIGIN } from '@core/tokens/app-origin.token';
import { CLOCK } from '@core/tokens/clock.token';
import { ViewModel } from '@shared/base/view-model';
import {
  AUTO_REVEAL_DELAY_MS,
  HEARTBEAT_INTERVAL_MS,
  TIMER_TICK_MS,
} from '@shared/constants/room.constants';
import { ROOM_ID_PARAM, ROOM_ROUTE_SEGMENT } from '@shared/constants/routes.constants';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { type Room } from '@shared/models/room.model';
import { ParticipantsService } from '@shared/services/participants.service';
import { RoomsService } from '@shared/services/rooms.service';
import { ToastService } from '@shared/services/toast.service';
import { formatClock } from '@shared/utils/display.util';
import { type IRoomState, LOADING_ROOM, NO_VOTES, RoomStatus } from '../models/i-room-state';
import { ROOM_MESSAGES } from '../models/room-messages.constants';
import { RoomView } from '../models/room-view.builder';
import { StoriesService } from '../services/stories.service';
import { type RoundVotes, VotesService } from '../services/votes.service';
import { JoinNotices } from './join-notices';
import { RoomCommands } from './room-commands';
import { RoomTour } from './room-tour';

/** One write the page asked for, run in order with the others. */
export interface IRoomAction {
  /** What it does, for the log. */
  readonly label: string;
  readonly run: () => Observable<unknown>;
}

/**
 * The live room: merges the room, its people, stories and votes into one state, derives the
 * table from it, and runs every write in order. The moderator's tab also flips the cards
 * automatically once every player has voted (the rules can't count votes, ADR-0008).
 */
@Injectable()
export class RoomViewModel extends ViewModel<IRoomState> {
  /** The room in the link. */
  public readonly roomId: string =
    inject(ActivatedRoute).snapshot.paramMap.get(ROOM_ID_PARAM) ?? '';

  /** The room's link, without the scheme. */
  public readonly link = `${inject(APP_ORIGIN).replace(/^https?:\/\//, '')}/${ROOM_ROUTE_SEGMENT}/${this.roomId}`;

  /** The page's state, never undefined. */
  public readonly view = computed(() => this.data() ?? LOADING_ROOM);

  /** The current time, ticking once a second for the timer and presence. */
  public readonly now = signal(inject(CLOCK).now());

  public readonly me = computed(() => RoomView.me(this.view()));
  /** Whether this person votes (a moderator may only facilitate). */
  public readonly isVoting = computed(() => this.me()?.isPlayer ?? false);
  public readonly isModerator = computed(
    () => this.view().room?.isModeratedBy(this.view().uid) ?? false,
  );
  public readonly activeStory = computed(() => RoomView.activeStory(this.view()));
  public readonly seats = computed(() => RoomView.seats(this.view(), this.now()));
  public readonly tableSeats = computed(() => this.seats().filter((seat) => seat.isPlayer));
  public readonly stats = computed(() => RoomView.stats(this.view()));
  public readonly votedCount = computed(() => RoomView.votedCount(this.view()));
  public readonly playerCount = computed(() => RoomView.players(this.view()).length);
  public readonly onlineCount = computed(() => RoomView.onlineCount(this.view(), this.now()));
  public readonly canVote = computed(
    () =>
      (this.me()?.isPlayer ?? false) &&
      this.activeStory() !== null &&
      this.view().room?.revealed === false,
  );
  public readonly timerLabel = computed(() => {
    const startedAt = this.view().room?.roundStartedAt ?? null;
    return startedAt === null ? formatClock(0) : formatClock(this.now() - startedAt);
  });

  /** Every write the page offers, bound to this view model's state. */
  public readonly commands: RoomCommands;

  /** The guided tour. */
  public readonly tour: RoomTour;

  private readonly auth = inject(IAuthService);
  private readonly rooms = inject(RoomsService);
  private readonly participants = inject(ParticipantsService);
  private readonly stories = inject(StoriesService);
  private readonly votes = inject(VotesService);
  private readonly clock = inject(CLOCK);
  private readonly toast = inject(ToastService);
  private readonly logger = inject(LoggerService);
  private readonly actions = new Subject<IRoomAction>();
  private readonly changes = new Subject<IRoomState>();
  private readonly joins = new JoinNotices();

  public constructor() {
    super();
    this.setData(LOADING_ROOM);
    this.commands = new RoomCommands(this, (action) => {
      this.actions.next(action);
    });
    this.tour = new RoomTour(this);
  }

  /** Changes only this person's view (dialogs, tabs). */
  public patch(change: Partial<IRoomState>): void {
    this.updateData((current) => ({ ...(current ?? LOADING_ROOM), ...change }));
  }

  protected override attachViewHandler(): Observable<unknown> {
    return this.auth.user$.pipe(
      filter((user): user is IAuthUser => user !== null),
      take(1),
      // take(1): one person per page, so switchMap only ever runs one set of listeners.
      switchMap((user) => {
        this.patch({ uid: user.uid });
        return merge(
          this.watchRoom(user.uid),
          this.tick(),
          this.heartbeat(user.uid),
          this.autoReveal(),
        );
      }),
      catchError((error: unknown) => {
        this.logger.error('Loading the room', error);
        this.patch({ status: RoomStatus.Failed });
        return EMPTY;
      }),
    );
  }

  protected override attachCommandHandler(): Observable<unknown> {
    // concatMap: writes land in the order they were asked for.
    return this.actions.pipe(
      concatMap((action) =>
        action.run().pipe(
          catchError((error: unknown) => {
            this.logger.error(action.label, error);
            this.toast.show(ROOM_MESSAGES.actionFailed, ToastTone.Error);
            return EMPTY;
          }),
        ),
      ),
    );
  }

  private watchRoom(uid: string): Observable<unknown> {
    const room$ = this.rooms
      .watch(this.roomId)
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
    const round$ = room$.pipe(
      map((room) => (room === null ? null : { round: room.round, revealed: room.revealed })),
      distinctUntilChanged((a, b) => a?.round === b?.round && a?.revealed === b?.revealed),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
    return combineLatest([
      room$,
      this.participants.watchAll(this.roomId),
      this.stories.watchAll(this.roomId),
      // switchMap: a new round drops the old round's listener.
      round$.pipe(
        switchMap((round) =>
          round === null ? of(null) : this.votes.watchMine(this.roomId, round.round, uid),
        ),
      ),
      round$.pipe(switchMap((round) => this.roundVotes(round))),
    ]).pipe(
      tap(([room, people, stories, myCard, roundVotes]) => {
        this.apply(room, { people, stories, myCard, roundVotes });
      }),
    );
  }

  private roundVotes(round: { round: number; revealed: boolean } | null): Observable<RoundVotes> {
    return round?.revealed === true
      ? this.votes.watchRound(this.roomId, round.round)
      : of(NO_VOTES);
  }

  private apply(room: Room | null, change: Partial<IRoomState>): void {
    this.patch({ ...change, room, status: room === null ? RoomStatus.Missing : RoomStatus.Ready });
    this.tour.offer();
    this.joins.see(change.people ?? [], this.view().uid);
    this.changes.next(this.view());
  }

  private tick(): Observable<unknown> {
    return timer(0, TIMER_TICK_MS).pipe(
      tap(() => {
        this.now.set(this.clock.now());
      }),
    );
  }

  private heartbeat(uid: string): Observable<unknown> {
    // exhaustMap: a slow write is never stacked behind another.
    return timer(HEARTBEAT_INTERVAL_MS, HEARTBEAT_INTERVAL_MS).pipe(
      exhaustMap(() => this.participants.heartbeat(this.roomId, uid).pipe(catchError(() => EMPTY))),
    );
  }

  /** Waits a moment after the last vote (people often change their mind), then flips. */
  private autoReveal(): Observable<unknown> {
    return this.changes.pipe(
      map((state) => RoomView.autoRevealRound(state)),
      distinctUntilChanged(),
      // switchMap: a vote taken back during the pause cancels the flip.
      switchMap((round) =>
        round === null
          ? EMPTY
          : timer(AUTO_REVEAL_DELAY_MS).pipe(
              tap(() => {
                this.commands.reveal();
              }),
            ),
      ),
    );
  }
}
