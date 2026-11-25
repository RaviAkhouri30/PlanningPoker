import { Service, type Signal, inject, signal } from '@angular/core';
import { IPreferenceStore } from '@core/interfaces/i-preference-store';
import { PROFILE_STORAGE_KEY } from '@shared/constants/local-data.constants';
import { type ILocalProfile } from '@shared/interfaces/i-local-profile';
import { parseProfile } from '@shared/utils/local-data.util';

/**
 * The name and avatar a guest last used, kept in this browser so the next form starts filled in.
 * Guests have no account yet (ADR-0007), so this browser is the only place it lives.
 */
@Service()
export class LocalProfileService {
  /** The saved profile, or `null` before the first room. */
  public readonly profile: Signal<ILocalProfile | null>;

  private readonly preferences = inject(IPreferenceStore);
  private readonly saved = signal(parseProfile(this.preferences.read(PROFILE_STORAGE_KEY)));

  public constructor() {
    // Assigned here because it reads `saved`, a private field declared after the public one.
    this.profile = this.saved.asReadonly();
  }

  /** Remembers `profile` in this browser. */
  public save(profile: ILocalProfile): void {
    const trimmed = { name: profile.name.trim(), avatar: profile.avatar };
    this.saved.set(trimmed);
    this.preferences.write(PROFILE_STORAGE_KEY, JSON.stringify(trimmed));
  }
}
