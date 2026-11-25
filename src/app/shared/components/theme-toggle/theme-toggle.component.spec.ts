import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { FakePreferenceStore } from '@core/backends/fake/fake-preference-store';
import { IPreferenceStore } from '@core/interfaces/i-preference-store';
import { THEME_ATTRIBUTE } from '@shared/constants/theme.constants';
import { ThemeToggleComponent } from './theme-toggle.component';

describe('ThemeToggleComponent', () => {
  function render(): HTMLButtonElement | null {
    TestBed.configureTestingModule({
      providers: [{ provide: IPreferenceStore, useValue: new FakePreferenceStore() }],
    });
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).querySelector('button');
  }

  afterEach(() => {
    TestBed.inject(DOCUMENT).documentElement.removeAttribute(THEME_ATTRIBUTE);
  });

  it('should name the current theme and the next one when it renders', () => {
    const button = render();

    expect(button?.getAttribute('aria-label')).toBe('Theme: System. Switch to Light.');
  });

  it('should switch to the next theme when pressed', async () => {
    const button = render();

    button?.click();
    await TestBed.inject(DOCUMENT).defaultView?.Promise.resolve();
    TestBed.tick();

    expect(button?.getAttribute('aria-label')).toBe('Theme: Light. Switch to Dark.');
    expect(TestBed.inject(DOCUMENT).documentElement.getAttribute(THEME_ATTRIBUTE)).toBe('light');
  });
});
