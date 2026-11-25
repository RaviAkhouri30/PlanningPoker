import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { type Subscription, throwError } from 'rxjs';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { IRealtimeStore } from '@core/interfaces/i-realtime-store';
import { LoggerService } from '@core/services/logger.service';
import { APP_ORIGIN } from '@core/tokens/app-origin.token';
import { ToastService } from '@shared/services/toast.service';
import { seed, stored, testBackendProviders } from '@shared/testing/test-backend';
import { LANDING_MESSAGES } from '../models/landing-messages.constants';
import { LandingViewModel } from './landing.view-model';

describe('LandingViewModel', () => {
  let model: LandingViewModel;
  let navigate: ReturnType<typeof vi.spyOn>;
  let subscription: Subscription;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...testBackendProviders(),
        provideRouter([]),
        { provide: APP_ORIGIN, useValue: 'https://planningpoker.test' },
        LandingViewModel,
      ],
    });
    vi.spyOn(TestBed.inject(LoggerService), 'error').mockImplementation(() => undefined);
    navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    model = TestBed.inject(LandingViewModel);
    subscription = model.init().subscribe();
  });

  afterEach(() => {
    subscription.unsubscribe();
    vi.restoreAllMocks();
  });

  it('should preview the link and the button from what is typed', () => {
    expect(model.linkPrefix).toBe('planningpoker.test/r/');
    expect(model.slugPreview()).toBe(LANDING_MESSAGES.slugPlaceholder);
    expect(model.createLabel()).toBe(LANDING_MESSAGES.createLabel);

    model.createForm.setValue({ name: 'Alex Kim', roomName: 'Sprint 42!', facilitate: false });

    expect(model.slugPreview()).toBe('sprint-42');
    expect(model.createLabel()).toBe('Create room as Alex');
  });

  it('should show the errors instead of creating when the name is blank', () => {
    model.createRoom();

    expect(model.createForm.controls.name.touched).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('should create the room with the guest as moderator and open it', async () => {
    model.createForm.setValue({ name: ' Alex Kim ', roomName: 'Sprint 42', facilitate: false });

    model.createRoom();

    await vi.waitFor(() => {
      expect(navigate).toHaveBeenCalledWith(['/', 'r', 'sprint-42-aaaaaa']);
    });
    await expect(
      stored('rooms/sprint-42-aaaaaa/participants/fake-guest-uid'),
    ).resolves.toMatchObject({
      displayName: 'Alex Kim',
    });
    expect(model.view().creating).toBe(false);
  });

  it('should seat the organiser as a non-voting facilitator when they choose to', async () => {
    model.createForm.setValue({ name: 'Sam Lee', roomName: 'Sprint 43', facilitate: true });

    model.createRoom();

    await vi.waitFor(() => {
      expect(navigate).toHaveBeenCalled();
    });
    await expect(
      stored('rooms/sprint-43-aaaaaa/participants/fake-guest-uid'),
    ).resolves.toMatchObject({ role: 'spectator' });
  });

  it('should say so when the room cannot be created', async () => {
    vi.spyOn(TestBed.inject(IRealtimeStore), 'commit').mockReturnValue(
      throwError(() => new Error('down')),
    );
    const show = vi.spyOn(TestBed.inject(ToastService), 'show');
    model.createForm.setValue({ name: 'Alex', roomName: '', facilitate: false });

    model.createRoom();

    await vi.waitFor(() => {
      expect(show).toHaveBeenCalledWith(LANDING_MESSAGES.createFailed, expect.anything());
    });
    expect(model.view().creating).toBe(false);
  });

  it('should explain the format of a malformed code', () => {
    model.codeForm.setValue({ code: 'nope' });

    model.joinByCode();

    expect(model.view().codeError).toBe(LANDING_MESSAGES.codeInvalid);
  });

  it('should open the room a code belongs to', async () => {
    await seed({ 'roomCodes/X7K2-92': { roomId: 'r1' } });
    model.codeForm.setValue({ code: 'x7k292' });

    model.joinByCode();

    await vi.waitFor(() => {
      expect(navigate).toHaveBeenCalledWith(['/', 'r', 'r1']);
    });
    expect(model.view()).toMatchObject({ joining: false, codeError: null });
  });

  it('should say when no room has the code', async () => {
    model.codeForm.setValue({ code: 'X7K2-92' });

    model.joinByCode();

    await vi.waitFor(() => {
      expect(model.view().codeError).toBe(LANDING_MESSAGES.codeUnknown);
    });
  });

  it('should say when the code cannot be looked up', async () => {
    vi.spyOn(TestBed.inject(IAuthService), 'signInAsGuest').mockReturnValue(
      throwError(() => new Error('offline')),
    );
    model.codeForm.setValue({ code: 'X7K2-92' });

    model.joinByCode();

    await vi.waitFor(() => {
      expect(model.view().codeError).toBe(LANDING_MESSAGES.codeFailed);
    });
  });
});
