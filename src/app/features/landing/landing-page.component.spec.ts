import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { APP_ORIGIN } from '@core/tokens/app-origin.token';
import { testBackendProviders } from '@shared/testing/test-backend';
import LandingPageComponent from './landing-page.component';
import { LandingViewModel } from './view-models/landing.view-model';

describe('LandingPageComponent', () => {
  let fixture: ComponentFixture<LandingPageComponent>;

  function render(): HTMLElement {
    TestBed.configureTestingModule({
      providers: [
        ...testBackendProviders(),
        provideRouter([]),
        { provide: APP_ORIGIN, useValue: 'https://planningpoker.test' },
      ],
    });
    fixture = TestBed.createComponent(LandingPageComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should render the hero, every section and the footer', () => {
    const page = render();

    expect(page.querySelector('h1')?.textContent).toContain('Estimate the sprint');
    expect([...page.querySelectorAll('section[id]')].map((section) => section.id)).toEqual([
      'how',
      'features',
      'guest',
      'faq',
    ]);
    expect(page.querySelectorAll('.flip')).toHaveLength(6);
    expect(page.querySelector('details')?.open).toBe(true);
    expect(page.querySelector('footer')).not.toBeNull();
  });

  it('should send both create forms and the code form to the view model', () => {
    const page = render();
    const model = fixture.debugElement.injector.get(LandingViewModel);
    const createRoom = vi.spyOn(model, 'createRoom').mockImplementation(() => undefined);
    const joinByCode = vi.spyOn(model, 'joinByCode').mockImplementation(() => undefined);

    const [hero, code, closing] = [...page.querySelectorAll('form')];
    hero?.dispatchEvent(new Event('submit'));
    code?.dispatchEvent(new Event('submit'));
    closing?.dispatchEvent(new Event('submit'));

    expect(createRoom).toHaveBeenCalledTimes(2);
    expect(joinByCode).toHaveBeenCalledTimes(1);
  });

  it('should share the name between the hero and the closing field', () => {
    const page = render();
    const model = fixture.debugElement.injector.get(LandingViewModel);

    model.createForm.controls.name.setValue('Alex');
    fixture.detectChanges();

    expect(page.querySelector<HTMLInputElement>('#cta-name')?.value).toBe('Alex');
  });
});
