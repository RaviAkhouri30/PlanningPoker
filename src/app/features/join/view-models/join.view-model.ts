import { Injectable, type Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  EMPTY,
  type Observable,
  Subject,
  catchError,
  combineLatest,
  exhaustMap,
  finalize,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { LoggerService } from '@core/services/logger.service';
import { APP_ORIGIN } from '@core/tokens/app-origin.token';
import { ViewModel } from '@shared/base/view-model';
import { LIMITS } from '@shared/constants/limits.constants';
import { AVATAR_PALETTE } from '@shared/constants/palette.constants';
import {
  ROOM_ID_PARAM,
  ROOM_ROUTE_SEGMENT,
  roomCommands,
} from '@shared/constants/routes.constants';
import { ParticipantRole } from '@shared/enums/participant-role.enum';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { type ISeatProfile } from '@shared/interfaces/i-seat-profile';
import { type Participant } from '@shared/models/participant.model';
import { type Room } from '@shared/models/room.model';
import { GuestSessionService } from '@shared/services/guest-session.service';
import { ParticipantsService } from '@shared/services/participants.service';
import { RoomsService } from '@shared/services/rooms.service';
import { ToastService } from '@shared/services/toast.service';
import { firstNameOf } from '@shared/utils/display.util';
import { TextValidators } from '@shared/validators/text.validators';
import { type IJoinState, JoinStatus, type JoinTab, LOADING_JOIN } from '../models/i-join-state';
import { JOIN_MESSAGES } from '../models/join-messages.constants';

/**
 * The join form behind a room's link: shows the room, then seats the visitor as a guest with
 * the name, colour and role they pick, and opens the room.
 */
@Injectable()
export class JoinViewModel extends ViewModel<IJoinState> {
  /** The room in the link. */
  public readonly roomId: string =
    inject(ActivatedRoute).snapshot.paramMap.get(ROOM_ID_PARAM) ?? '';

  /** Name, colour and role. */
  public readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [TextValidators.notBlank, TextValidators.maxTrimmed(LIMITS.displayName)],
    }),
    colour: new FormControl(0, { nonNullable: true }),
    role: new FormControl(ParticipantRole.Player, { nonNullable: true }),
  });

  /** The page's state, never undefined. */
  public readonly view = computed(() => this.data() ?? LOADING_JOIN);

  /** The link as people see it, e.g. `planningpoker.example.com/r/sprint-42-x7k2ab`. */
  public readonly linkLabel = `${inject(APP_ORIGIN).replace(/^https?:\/\//, '')}/${ROOM_ROUTE_SEGMENT}/${this.roomId}`;

  /** The seat as it will look, from the form so far. */
  public readonly seat: Signal<ISeatProfile>;

  /** The join button's words: "Join as Jordan" once a name is typed. */
  public readonly joinLabel: Signal<string>;

  private readonly auth = inject(IAuthService);
  private readonly session = inject(GuestSessionService);
  private readonly rooms = inject(RoomsService);
  private readonly participants = inject(ParticipantsService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly logger = inject(LoggerService);
  private readonly joins = new Subject<void>();
  private defaultsApplied = false;

  public constructor() {
    super();
    this.setData(LOADING_JOIN);
    const values = toSignal(this.form.valueChanges.pipe(map(() => this.form.getRawValue())), {
      initialValue: this.form.getRawValue(),
    });
    this.seat = computed(() => {
      const { name, colour, role } = values();
      return { displayName: name.trim(), colour, role };
    });
    this.joinLabel = computed(() => {
      const first = firstNameOf(this.seat().displayName);
      return first ? JOIN_MESSAGES.joinAsPrefix + first : JOIN_MESSAGES.joinLabel;
    });
  }

  /** Shows the guest form or the account tab. */
  public showTab(tab: JoinTab): void {
    this.patch({ tab });
  }

  /** Picks a seat colour. */
  public pickColour(index: number): void {
    this.form.controls.colour.setValue(index);
  }

  /** Picks player or spectator. */
  public pickRole(role: ParticipantRole): void {
    this.form.controls.role.setValue(role);
  }

  /** Takes the seat, or shows the form's errors when it isn't valid. */
  public join(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.joins.next();
  }

  protected override attachViewHandler(): Observable<unknown> {
    return this.session.ensureSignedIn().pipe(
      tap((user) => {
        this.prefillName(user.displayName);
      }),
      switchMap(() =>
        combineLatest([this.rooms.watch(this.roomId), this.participants.watchAll(this.roomId)]),
      ),
      tap(([room, people]) => {
        this.show(room, people);
      }),
      catchError((error: unknown) => {
        this.logger.error('Loading the room to join', error);
        this.patch({ status: JoinStatus.Failed });
        return of(null);
      }),
    );
  }

  protected override attachCommandHandler(): Observable<unknown> {
    // exhaustMap: a second click while the seat is being taken is ignored, not queued.
    return this.joins.pipe(exhaustMap(() => this.takeSeat()));
  }

  private show(room: Room | null, people: readonly Participant[]): void {
    this.patch({ status: room === null ? JoinStatus.Missing : JoinStatus.Ready, room, people });
    if (!this.defaultsApplied && room !== null) {
      this.defaultsApplied = true;
      this.applyDefaults(room, people);
    }
  }

  /** Once, when the room first shows: the room's default role and a colour nobody has yet. */
  private applyDefaults(room: Room, people: readonly Participant[]): void {
    const taken = new Set(people.map((person) => person.colourIndex));
    const free = AVATAR_PALETTE.findIndex((_, index) => !taken.has(index));
    this.form.patchValue({
      colour: Math.max(free, 0),
      role: room.spectatorsByDefault ? ParticipantRole.Spectator : ParticipantRole.Player,
    });
  }

  private prefillName(displayName: string): void {
    if (displayName !== '' && this.form.controls.name.value === '') {
      this.form.controls.name.setValue(displayName);
    }
  }

  private takeSeat(): Observable<void> {
    const profile = this.seat();
    this.patch({ joining: true });
    return this.auth.signInAsGuest(profile.displayName).pipe(
      // One user arrives, so switchMap only ever follows one join.
      switchMap((user) => this.participants.join(this.roomId, user.uid, profile)),
      tap(() => {
        void this.router.navigate(roomCommands(this.roomId));
      }),
      catchError((error: unknown) => {
        this.logger.error('Joining a room', error);
        this.toast.show(JOIN_MESSAGES.joinFailed, ToastTone.Error);
        return EMPTY;
      }),
      finalize(() => {
        this.patch({ joining: false });
      }),
    );
  }

  private patch(change: Partial<IJoinState>): void {
    this.updateData((current) => ({ ...(current ?? LOADING_JOIN), ...change }));
  }
}
