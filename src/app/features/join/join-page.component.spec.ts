import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { APP_ORIGIN } from '@core/tokens/app-origin.token';
import {
  participantFields,
  roomFields,
  seed,
  testBackendProviders,
} from '@shared/testing/test-backend';
import JoinPageComponent from './join-page.component';
import { JoinViewModel } from './view-models/join.view-model';

describe('JoinPageComponent', () => {
  let fixture: ComponentFixture<JoinPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ...testBackendProviders(),
        provideRouter([]),
        { provide: APP_ORIGIN, useValue: 'https://ante.test' },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ roomId: 'r1' }) } },
        },
      ],
    });
  });

  async function render(): Promise<HTMLElement> {
    fixture = TestBed.createComponent(JoinPageComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should show the room and the guest form', async () => {
    await seed({
      'rooms/r1': roomFields(),
      'rooms/r1/participants/mod': participantFields(),
      'rooms/r1/participants/p2': participantFields({ displayName: 'Maya Chen', colour: 1 }),
    });

    const page = await render();

    expect(page.querySelector('h1')?.textContent).toContain('Sprint 42');
    expect(page.textContent).toContain('Alex Kim invited you to');
    expect(page.textContent).toContain('2 people are in the room');
    expect(page.querySelectorAll('.swatch')).toHaveLength(6);
  });

  it('should pass picks and the submit to the view model', async () => {
    await seed({ 'rooms/r1': roomFields() });
    const page = await render();
    const model = fixture.debugElement.injector.get(JoinViewModel);
    const join = vi.spyOn(model, 'join');

    page.querySelectorAll<HTMLButtonElement>('.swatch')[4]?.click();
    page.querySelectorAll<HTMLButtonElement>('.role')[1]?.click();
    page.querySelector('form')?.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(model.seat()).toMatchObject({ colour: 4, role: 'spectator' });
    expect(join).toHaveBeenCalledTimes(1);
    expect(page.querySelector('.seat-card')?.textContent).toContain('Spectator');
  });

  it('should switch to the account tab and back', async () => {
    await seed({ 'rooms/r1': roomFields() });
    const page = await render();

    page.querySelectorAll<HTMLButtonElement>('[role="tab"]')[1]?.click();
    fixture.detectChanges();
    expect(page.textContent).toContain('Accounts are coming soon');

    page.querySelector<HTMLButtonElement>('#pane-account button')?.click();
    fixture.detectChanges();
    expect(page.querySelector('#join-name')).not.toBeNull();
  });

  it('should say when the room does not exist', async () => {
    const page = await render();

    expect(page.querySelector('h1')?.textContent).toContain('doesn’t exist');
  });
});
