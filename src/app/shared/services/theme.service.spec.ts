import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { FakePreferenceStore } from '@core/backends/fake/fake-preference-store';
import { IPreferenceStore } from '@core/interfaces/i-preference-store';
import { THEME_ATTRIBUTE, THEME_STORAGE_KEY } from '@shared/constants/theme.constants';
import { ThemeMode } from '@shared/enums/theme-mode.enum';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let preferences: FakePreferenceStore;
  let root: HTMLElement;

  function create(saved: string | null = null): ThemeService {
    preferences = new FakePreferenceStore();
    if (saved !== null) {
      preferences.write(THEME_STORAGE_KEY, saved);
    }
    TestBed.configureTestingModule({
      providers: [{ provide: IPreferenceStore, useValue: preferences }],
    });
    root = TestBed.inject(DOCUMENT).documentElement;
    return TestBed.inject(ThemeService);
  }

  afterEach(() => {
    root.removeAttribute(THEME_ATTRIBUTE);
  });

  it('should follow the system when nothing is saved', () => {
    const theme = create();

    expect(theme.mode()).toBe(ThemeMode.System);
    expect(root.hasAttribute(THEME_ATTRIBUTE)).toBe(false);
  });

  it('should apply the saved theme when the app starts', () => {
    const theme = create(ThemeMode.Dark);

    expect(theme.mode()).toBe(ThemeMode.Dark);
    expect(root.getAttribute(THEME_ATTRIBUTE)).toBe('dark');
  });

  it('should fall back to the system when the saved value is unknown', () => {
    const theme = create('sepia');

    expect(theme.mode()).toBe(ThemeMode.System);
  });

  it('should step through light, dark and back to system, remembering each', () => {
    const theme = create();
    const seen: (string | null)[] = [];

    for (let step = 0; step < 3; step += 1) {
      theme.cycle();
      seen.push(root.getAttribute(THEME_ATTRIBUTE));
    }

    expect(seen).toEqual(['light', 'dark', null]);
    expect(preferences.read(THEME_STORAGE_KEY)).toBe(ThemeMode.System);
  });
});
