import { TestBed } from '@angular/core/testing';
import { CLOCK } from '@core/tokens/clock.token';
import { JOIN_NOTICE_WINDOW_MS } from '@shared/constants/room.constants';
import { type IToastMessage } from '@shared/interfaces/i-toast';
import { ToastService } from '@shared/services/toast.service';
import { aPerson } from '../testing/room-fixtures';
import { JoinNotices } from './join-notices';

describe('JoinNotices', () => {
  const NOW = 1_000_000;
  let shown: string[];

  function create(): JoinNotices {
    shown = [];
    TestBed.configureTestingModule({
      providers: [{ provide: CLOCK, useValue: { now: () => NOW } }],
    });
    TestBed.inject(ToastService).messages$.subscribe((message: IToastMessage) => {
      shown.push(message.text);
    });
    return TestBed.runInInjectionContext(() => new JoinNotices());
  }

  it('should announce nobody when the room first loads', () => {
    const notices = create();

    notices.see([aPerson('mod'), aPerson('ana')], 'mod');

    expect(shown).toEqual([]);
  });

  it('should announce someone by first name when they take a seat', () => {
    const notices = create();
    notices.see([aPerson('mod')], 'mod');

    notices.see(
      [aPerson('mod'), aPerson('priya', { displayName: 'Priya Nair', joinedAt: NOW })],
      'mod',
    );

    expect(shown).toEqual(['Priya joined the room']);
  });

  it('should announce people who arrive together in one message', () => {
    const notices = create();
    notices.see([aPerson('mod')], 'mod');

    notices.see([aPerson('mod'), aPerson('leo'), aPerson('sam')], 'mod');

    expect(shown).toEqual(['leo, sam joined the room']);
  });

  it('should stay quiet when the new seat is mine, old or nameless', () => {
    const notices = create();
    notices.see([aPerson('ana')], 'mod');

    notices.see(
      [
        aPerson('ana'),
        aPerson('mod'),
        aPerson('old', { joinedAt: NOW - JOIN_NOTICE_WINDOW_MS - 1 }),
        aPerson('blank', { displayName: ' ' }),
      ],
      'mod',
    );

    expect(shown).toEqual([]);
  });
});
