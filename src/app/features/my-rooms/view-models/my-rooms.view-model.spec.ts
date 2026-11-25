import { TestBed } from '@angular/core/testing';
import { CLOCK } from '@core/tokens/clock.token';
import { Animal } from '@shared/enums/animal.enum';
import { RoomRole } from '@shared/enums/room-role.enum';
import { LocalProfileService } from '@shared/services/local-profile.service';
import { MyRoomsService } from '@shared/services/my-rooms.service';
import { ToastService } from '@shared/services/toast.service';
import { testBackendProviders } from '@shared/testing/test-backend';
import { MY_ROOMS_MESSAGES } from '../models/my-rooms-messages.constants';
import { MyRoomsViewModel } from './my-rooms.view-model';

describe('MyRoomsViewModel', () => {
  const day = 24 * 60 * 60 * 1000;
  const now = 10 * day;

  function start(): MyRoomsViewModel {
    TestBed.configureTestingModule({
      providers: [
        ...testBackendProviders(),
        MyRoomsViewModel,
        { provide: CLOCK, useValue: { now: () => now } },
      ],
    });
    return TestBed.inject(MyRoomsViewModel);
  }

  it('should show each saved room as a card when the browser has rooms', () => {
    const model = start();
    TestBed.inject(MyRoomsService).remember({
      id: 'r1',
      name: '',
      code: 'X7K2-92',
      role: RoomRole.Moderator,
      lastVisit: now - day,
    });

    expect(model.cards()).toEqual([
      {
        id: 'r1',
        name: MY_ROOMS_MESSAGES.untitled,
        code: 'X7K2-92',
        roleLabel: 'Moderator',
        visitLabel: 'Opened yesterday',
        open: ['/', 'r', 'r1'],
      },
    ]);
  });

  it('should greet the guest by first name when this browser knows it', () => {
    const model = start();
    expect(model.title()).toBe(MY_ROOMS_MESSAGES.title);

    TestBed.inject(LocalProfileService).save({ name: 'Maya Chen', avatar: Animal.Owl });

    expect(model.title()).toBe('Welcome back, Maya');
  });

  it('should drop the room and say so when it is forgotten', () => {
    const model = start();
    const show = vi.spyOn(TestBed.inject(ToastService), 'show');
    TestBed.inject(MyRoomsService).remember({
      id: 'r1',
      name: 'Sprint',
      code: '',
      role: RoomRole.Player,
      lastVisit: now,
    });

    model.forget('r1');

    expect(model.cards()).toEqual([]);
    expect(show).toHaveBeenCalledWith(MY_ROOMS_MESSAGES.forgotten, expect.anything());
  });
});
