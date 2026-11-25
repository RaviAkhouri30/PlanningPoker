import { LocalProfileService } from '@shared/services/local-profile.service';
import { Animal } from '@shared/enums/animal.enum';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { type Subscription, throwError } from 'rxjs';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { IRealtimeStore } from '@core/interfaces/i-realtime-store';
import { LoggerService } from '@core/services/logger.service';
import { APP_ORIGIN } from '@core/tokens/app-origin.token';
import { ParticipantRole } from '@shared/enums/participant-role.enum';
import { ToastService } from '@shared/services/toast.service';
import {
  participantFields,
  roomFields,
  seed,
  stored,
  testBackendProviders,
} from '@shared/testing/test-backend';
import { JoinStatus, JoinTab } from '../models/i-join-state';
import { JOIN_MESSAGES } from '../models/join-messages.constants';
import { JoinViewModel } from './join.view-model';

describe('JoinViewModel', () => {
  let navigate: ReturnType<typeof vi.spyOn>;
  let subscription: Subscription | undefined;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...testBackendProviders(),
        provideRouter([]),
        { provide: APP_ORIGIN, useValue: 'https://planningpoker.test' },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ roomId: 'r1' }) } },
        },
        JoinViewModel,
      ],
    });
    vi.spyOn(TestBed.inject(LoggerService), 'error').mockImplementation(() => undefined);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    subscription?.unsubscribe();
    vi.restoreAllMocks();
  });

  function start(): JoinViewModel {
    const model = TestBed.inject(JoinViewModel);
    subscription = model.init().subscribe();
    return model;
  }

  it('should show the room, its people and the link', async () => {
    await seed({
      'rooms/r1': roomFields(),
      'rooms/r1/participants/mod': participantFields({ colour: 0 }),
    });

    const model = start();

    await vi.waitFor(() => {
      expect(model.view().status).toBe(JoinStatus.Ready);
    });
    expect(model.view().room?.name).toBe('Sprint 42');
    expect(model.view().people.map((person) => person.uid)).toEqual(['mod']);
    expect(model.linkLabel).toBe('planningpoker.test/r/r1');
  });

  it('should default to a free colour and the room’s default role', async () => {
    await seed({
      'rooms/r1': roomFields({ spectatorsByDefault: true }),
      'rooms/r1/participants/mod': participantFields({ colour: 0 }),
    });

    const model = start();

    await vi.waitFor(() => {
      expect(model.form.getRawValue()).toMatchObject({
        colour: 1,
        role: ParticipantRole.Spectator,
      });
    });
  });

  it('should say when no room has the link', async () => {
    const model = start();

    await vi.waitFor(() => {
      expect(model.view().status).toBe(JoinStatus.Missing);
    });
  });

  it('should say when the room cannot be read', async () => {
    vi.spyOn(TestBed.inject(IRealtimeStore), 'watchDocument').mockReturnValue(
      throwError(() => new Error('denied')),
    );

    const model = start();

    await vi.waitFor(() => {
      expect(model.view().status).toBe(JoinStatus.Failed);
    });
  });

  it('should prefill the name of someone signed in before', async () => {
    await seed({ 'rooms/r1': roomFields() });
    TestBed.inject(IAuthService).signInAsGuest('Jordan Lee').subscribe();

    const model = start();

    await vi.waitFor(() => {
      expect(model.form.controls.name.value).toBe('Jordan Lee');
    });
  });

  it('should fill in the name and avatar this browser last used when there are some', () => {
    TestBed.inject(LocalProfileService).save({ name: 'Maya Chen', avatar: Animal.Owl });

    const model = start();

    expect(model.form.getRawValue()).toMatchObject({ name: 'Maya Chen', avatar: Animal.Owl });
  });

  it('should preview the seat and label the button from the form', () => {
    const model = start();

    model.form.controls.name.setValue(' Jordan Lee ');
    model.pickColour(3);
    model.pickRole(ParticipantRole.Spectator);
    model.pickAvatar(Animal.Whale);
    model.showTab(JoinTab.Account);

    expect(model.seat()).toEqual({
      displayName: 'Jordan Lee',
      colour: 3,
      role: ParticipantRole.Spectator,
      avatar: Animal.Whale,
    });
    expect(model.joinLabel()).toBe('Join as Jordan');
    expect(model.view().tab).toBe(JoinTab.Account);
  });

  it('should show the errors instead of joining without a name', () => {
    const model = start();

    model.join();

    expect(model.form.controls.name.touched).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('should take the seat and open the room', async () => {
    await seed({ 'rooms/r1': roomFields() });
    const model = start();
    model.form.setValue({
      name: 'Jordan',
      colour: 2,
      role: ParticipantRole.Player,
      avatar: Animal.Tiger,
    });

    model.join();

    await vi.waitFor(() => {
      expect(navigate).toHaveBeenCalledWith(['/', 'r', 'r1']);
    });
    await expect(stored('rooms/r1/participants/fake-guest-uid')).resolves.toMatchObject({
      displayName: 'Jordan',
      colour: 2,
      role: 'player',
      avatar: 'tiger',
    });
    expect(model.view().joining).toBe(false);
    expect(TestBed.inject(LocalProfileService).profile()).toEqual({
      name: 'Jordan',
      avatar: Animal.Tiger,
    });
  });

  it('should say so when the seat cannot be taken', async () => {
    const show = vi.spyOn(TestBed.inject(ToastService), 'show');
    const model = start();
    vi.spyOn(TestBed.inject(IRealtimeStore), 'commit').mockReturnValue(
      throwError(() => new Error('denied')),
    );
    model.form.controls.name.setValue('Jordan');

    model.join();

    await vi.waitFor(() => {
      expect(show).toHaveBeenCalledWith(JOIN_MESSAGES.joinFailed, expect.anything());
    });
  });
});
