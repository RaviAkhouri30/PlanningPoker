import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { FAKE_GUEST_UID } from '@core/backends/fake/fake-auth.service';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { APP_ORIGIN } from '@core/tokens/app-origin.token';
import {
  participantFields,
  roomFields,
  seed,
  testBackendProviders,
} from '@shared/testing/test-backend';
import RoomPageComponent from './room-page.component';
import { ROOM_MESSAGES } from './models/room-messages.constants';
import { storyFields } from './testing/room-fixtures';

describe('RoomPageComponent', () => {
  let fixture: ComponentFixture<RoomPageComponent>;

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

  it('should vote, reveal and show the results', async () => {
    const page = await render();

    click(page, 'button[aria-label="Vote 5"]');
    expect(page.textContent).toContain(ROOM_MESSAGES.voteIn);
    click(page, '.waiting .btn--primary');

    expect(page.querySelector('app-results-panel')).not.toBeNull();
    expect(page.textContent).toContain(ROOM_MESSAGES.revealed);
  });

  it('should open the invite dialog from the header', async () => {
    const page = await render();

    click(page, 'app-room-header .btn--primary');

    expect(page.querySelector('dialog')?.hasAttribute('open')).toBe(true);
  });

  it('should hide moderator tools from others and tell spectators they are watching', async () => {
    const page = await render('someone-else', 'spectator');

    expect(page.textContent).not.toContain('Moderator controls');
    expect(page.textContent).toContain(ROOM_MESSAGES.spectating);
  });
});
