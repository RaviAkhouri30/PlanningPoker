import { Injectable, type Signal, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import {
  EMPTY,
  type Observable,
  Subject,
  catchError,
  exhaustMap,
  finalize,
  merge,
  switchMap,
  tap,
} from 'rxjs';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { LoggerService } from '@core/services/logger.service';
import { APP_ORIGIN } from '@core/tokens/app-origin.token';
import { ViewModel } from '@shared/base/view-model';
import { LIMITS } from '@shared/constants/limits.constants';
import { ROOM_ROUTE_SEGMENT, roomCommands } from '@shared/constants/routes.constants';
import { ParticipantRole } from '@shared/enums/participant-role.enum';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { GuestSessionService } from '@shared/services/guest-session.service';
import { RoomsService } from '@shared/services/rooms.service';
import { ToastService } from '@shared/services/toast.service';
import { firstNameOf } from '@shared/utils/display.util';
import { normaliseRoomCode, slugify } from '@shared/utils/room-id.util';
import { TextValidators } from '@shared/validators/text.validators';
import { IDLE_LANDING, type ILandingState } from '../models/i-landing-state';
import { LANDING_MESSAGES } from '../models/landing-messages.constants';

/**
 * The landing page: create a room as a guest (you become its moderator), or find one by code.
 * Owns both forms and their commands; navigation happens once the room exists.
 */
@Injectable()
export class LandingViewModel extends ViewModel<ILandingState> {
  /** "Your name", the optional room name, and whether the organiser only facilitates. */
  public readonly createForm = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [TextValidators.notBlank, TextValidators.maxTrimmed(LIMITS.displayName)],
    }),
    roomName: new FormControl('', {
      nonNullable: true,
      validators: [TextValidators.maxTrimmed(LIMITS.roomName)],
    }),
    /** The organiser runs the session without voting (a scrum master, say). */
    facilitate: new FormControl(false, { nonNullable: true }),
  });

  /** "Got a code?" */
  public readonly codeForm = new FormGroup({
    code: new FormControl('', { nonNullable: true }),
  });

  /** The forms' progress and errors, never undefined. */
  public readonly view = computed(() => this.data() ?? IDLE_LANDING);

  /** The start of every room link, e.g. `planningpoker.example.com/r/`. */
  public readonly linkPrefix = `${inject(APP_ORIGIN).replace(/^https?:\/\//, '')}/${ROOM_ROUTE_SEGMENT}/`;

  /** The room link's slug as it will look, from the room name typed so far. */
  public readonly slugPreview: Signal<string>;

  /** The create button's words: "Create room as Alex" once a name is typed. */
  public readonly createLabel: Signal<string>;

  private readonly auth = inject(IAuthService);
  private readonly session = inject(GuestSessionService);
  private readonly rooms = inject(RoomsService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly logger = inject(LoggerService);
  private readonly creates = new Subject<void>();
  private readonly codeLookups = new Subject<string>();

  public constructor() {
    super();
    this.setData(IDLE_LANDING);
    const form = this.createForm.controls;
    const roomName = toSignal(form.roomName.valueChanges, { initialValue: '' });
    const name = toSignal(form.name.valueChanges, { initialValue: '' });
    this.slugPreview = computed(() => slugify(roomName()) || LANDING_MESSAGES.slugPlaceholder);
    this.createLabel = computed(() => {
      const first = firstNameOf(name());
      return first ? LANDING_MESSAGES.createAsPrefix + first : LANDING_MESSAGES.createLabel;
    });
  }

  /** Creates the room, or shows the form's errors when it isn't valid. */
  public createRoom(): void {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.creates.next();
  }

  /** Looks the typed code up, or explains what a code looks like. */
  public joinByCode(): void {
    const code = normaliseRoomCode(this.codeForm.controls.code.value);
    if (code === null) {
      this.patch({ codeError: LANDING_MESSAGES.codeInvalid });
      return;
    }
    this.codeLookups.next(code);
  }

  protected override attachCommandHandler(): Observable<unknown> {
    return merge(
      // exhaustMap: a second click while a room is being created is ignored, not queued.
      this.creates.pipe(exhaustMap(() => this.create())),
      this.codeLookups.pipe(exhaustMap((code) => this.lookUp(code))),
    );
  }

  private create(): Observable<string> {
    const { name, roomName, facilitate } = this.createForm.getRawValue();
    // A facilitator sits as a spectator, so auto-reveal waits only for the players.
    const role = facilitate ? ParticipantRole.Spectator : ParticipantRole.Player;
    const displayName = name.trim();
    this.patch({ creating: true });
    return this.auth.signInAsGuest(displayName).pipe(
      // One user arrives, so switchMap only ever follows one creation.
      switchMap((user) =>
        this.rooms.create({
          name: roomName,
          moderatorUid: user.uid,
          moderator: { displayName, colour: 0, role },
        }),
      ),
      tap((roomId) => {
        void this.router.navigate(roomCommands(roomId));
      }),
      catchError((error: unknown) => {
        this.logger.error('Creating a room', error);
        this.toast.show(LANDING_MESSAGES.createFailed, ToastTone.Error);
        return EMPTY;
      }),
      finalize(() => {
        this.patch({ creating: false });
      }),
    );
  }

  private lookUp(code: string): Observable<string | null> {
    this.patch({ joining: true, codeError: null });
    return this.session.ensureSignedIn().pipe(
      switchMap(() => this.rooms.findRoomId(code)),
      tap((roomId) => {
        if (roomId === null) {
          this.patch({ codeError: LANDING_MESSAGES.codeUnknown });
        } else {
          void this.router.navigate(roomCommands(roomId));
        }
      }),
      catchError((error: unknown) => {
        this.logger.error('Looking up a room code', error);
        this.patch({ codeError: LANDING_MESSAGES.codeFailed });
        return EMPTY;
      }),
      finalize(() => {
        this.patch({ joining: false });
      }),
    );
  }

  private patch(change: Partial<ILandingState>): void {
    this.updateData((current) => ({ ...(current ?? IDLE_LANDING), ...change }));
  }
}
