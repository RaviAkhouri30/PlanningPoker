import { type IPreferenceStore } from '@core/interfaces/i-preference-store';

/** Keeps preferences in memory, for specs. */
export class FakePreferenceStore implements IPreferenceStore {
  private readonly saved = new Map<string, string>();

  public read(key: string): string | null {
    return this.saved.get(key) ?? null;
  }

  public write(key: string, value: string): void {
    this.saved.set(key, value);
  }
}
