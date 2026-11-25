import { TestBed } from '@angular/core/testing';
import { FakePreferenceStore } from '@core/backends/fake/fake-preference-store';
import { IPreferenceStore } from '@core/interfaces/i-preference-store';
import { PROFILE_STORAGE_KEY } from '@shared/constants/local-data.constants';
import { Animal } from '@shared/enums/animal.enum';
import { LocalProfileService } from './local-profile.service';

describe('LocalProfileService', () => {
  let preferences: FakePreferenceStore;

  function create(saved: string | null = null): LocalProfileService {
    preferences = new FakePreferenceStore();
    if (saved !== null) {
      preferences.write(PROFILE_STORAGE_KEY, saved);
    }
    TestBed.configureTestingModule({
      providers: [{ provide: IPreferenceStore, useValue: preferences }],
    });
    return TestBed.inject(LocalProfileService);
  }

  it('should have no profile when this browser has none', () => {
    expect(create().profile()).toBeNull();
  });

  it('should read the saved profile when there is one', () => {
    expect(create('{"name":"Maya","avatar":"owl"}').profile()).toEqual({
      name: 'Maya',
      avatar: Animal.Owl,
    });
  });

  it('should keep a trimmed profile and save it when asked to', () => {
    const profiles = create();

    profiles.save({ name: ' Alex Kim ', avatar: Animal.Fox });

    expect(profiles.profile()).toEqual({ name: 'Alex Kim', avatar: Animal.Fox });
    expect(preferences.read(PROFILE_STORAGE_KEY)).toBe('{"name":"Alex Kim","avatar":"fox"}');
  });
});
