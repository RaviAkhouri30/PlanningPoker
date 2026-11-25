import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { FAKE_GUEST_UID } from '@core/backends/fake/fake-auth.service';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { APP_ORIGIN } from '@core/tokens/app-origin.token';
import {
  TEST_NOW,
  participantFields,
  roomFields,
  seed,
  testBackendProviders,
  testClock,
} from '@shared/testing/test-backend';
import RoomPageComponent from './room-page.component';
import { ROOM_MESSAGES } from './models/room-messages.constants';
import { cardNamed, storyFields } from './testing/room-fixtures';

describe('RoomPageComponent', () => {
  let fixture: ComponentFixture<RoomPageComponent>;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function render(moderatorUid = FAKE_GUEST_UID, role = 'player'): Promise<HTMLElement> {
    TestBed.configureTestingModule({
      providers: [
        ...testBackendProviders(),
        provideRouter([]),
        { provide: APP_ORIGIN, useValue: 'https://planningpoker.test' },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ roomId: 'r1' }) } },
        },
      ],
    });
    await firstValueFrom(TestBed.inject(IAuthService).signInAsGuest('Alex Kim'));
    await seed({
      'rooms/r1': roomFields({ moderatorUid, activeStoryId: 's1' }),
      [`rooms/r1/participants/${FAKE_GUEST_UID}`]: participantFields({
        displayName: 'Alex Kim',
        role,
      }),
      'rooms/r1/stories/s1': storyFields(),
    });
    fixture = TestBed.createComponent(RoomPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function click(page: HTMLElement, selector: string): void {
    page.querySelector<HTMLButtonElement>(selector)?.click();
    fixture.detectChanges();
  }

  it('should show the moderator the story, table, deck and every panel', async () => {
    const page = await render();

    expect(page.querySelector('h1')?.textContent).toContain('Save cards');
    expect(page.querySelectorAll('app-table-seat')).toHaveLength(1);
    expect(page.querySelectorAll('.card')).toHaveLength(13);
    expect(page.textContent).toContain('Moderator controls');
    expect(page.textContent).toContain(ROOM_MESSAGES.pickCard);
  });

  it('should vote, reveal and show the results in place of the deck', async () => {
    const page = await render();

    cardNamed(page, 'Vote 5')?.click();
    fixture.detectChanges();
    expect(page.textContent).toContain(ROOM_MESSAGES.voteIn);
    click(page, '.status .btn--primary');

    expect(page.querySelector('app-results-panel')).not.toBeNull();
    expect(page.querySelector('app-card-deck')).toBeNull();
  });

  it('should open the invite dialog from the header', async () => {
    const page = await render();

    click(page, 'app-room-header .btn--primary');

    expect(page.querySelector('dialog')?.hasAttribute('open')).toBe(true);
  });

  it('should open the story dialog when the moderator clicks "Add story"', async () => {
    const page = await render();

    click(page, 'app-room-header .btn:not(.btn--primary)');

    expect(page.querySelector('app-add-story-dialog dialog')?.hasAttribute('open')).toBe(true);
  });

  it('should open the tour for the moderator on the first visit, and close it on skip', async () => {
    const page = await render();

    expect(page.querySelector('app-room-tour')?.textContent).toContain('Step 1 of');
    click(page, '.coach__skip');

    expect(page.querySelector('app-room-tour')).toBeNull();
  });

  it('should let someone who is not the moderator replay the tour', async () => {
    const page = await render('someone-else');
    expect(page.querySelector('app-room-tour')).toBeNull();

    click(page, '[aria-label="Take the room tour"]');
    click(page, '.coach .btn--primary');

    expect(page.querySelector('app-room-tour')?.textContent).toContain('Step 2 of');
  });

  it('should close voting and tell the moderator to reset the timer when time is up', async () => {
    vi.spyOn(testClock, 'now').mockReturnValue(TEST_NOW + 61_000);
    const page = await render();

    expect(page.textContent).toContain(ROOM_MESSAGES.votingClosedModerator);
    expect(cardNamed(page, 'Vote 5')?.disabled).toBe(true);
    expect(page.querySelector('[role="timer"]')?.getAttribute('data-phase')).toBe('up');
  });

  it('should tell a player that voting closed when time is up', async () => {
    vi.spyOn(testClock, 'now').mockReturnValue(TEST_NOW + 61_000);
    const page = await render('someone-else');

    expect(page.textContent).toContain(ROOM_MESSAGES.votingClosed);
  });

  it('should keep the room name as the main heading when no story is active', async () => {
    const page = await render();

    await seed({ 'rooms/r1': roomFields({ moderatorUid: FAKE_GUEST_UID, activeStoryId: null }) });
    fixture.detectChanges();

    expect(page.querySelector('h1')?.textContent).toContain('Sprint 42');
  });

  it('should hide moderator tools from others and tell spectators they are watching', async () => {
    const page = await render('someone-else', 'spectator');

    expect(page.textContent).not.toContain('Moderator controls');
    expect(page.querySelector('app-room-header')?.textContent).not.toContain('Add story');
    expect(page.textContent).toContain(ROOM_MESSAGES.spectating);
  });
});
