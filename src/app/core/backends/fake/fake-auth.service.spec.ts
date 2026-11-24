import { firstValueFrom } from 'rxjs';
import { FAKE_GUEST_UID, FakeAuthService } from './fake-auth.service';

describe('FakeAuthService', () => {
  it('should start signed out', async () => {
    await expect(firstValueFrom(new FakeAuthService().user$)).resolves.toBeNull();
  });

  it('should sign a guest in with the name when asked', async () => {
    const auth = new FakeAuthService();

    const user = await firstValueFrom(auth.signInAsGuest('Alex'));

    expect(user).toEqual({ uid: FAKE_GUEST_UID, displayName: 'Alex', isGuest: true });
    await expect(firstValueFrom(auth.user$)).resolves.toEqual(user);
  });

  it('should keep the uid when a signed-in guest is renamed', async () => {
    const auth = new FakeAuthService();
    await firstValueFrom(auth.signInAsGuest('Alex'));

    const renamed = await firstValueFrom(auth.signInAsGuest('Sam'));

    expect(renamed.uid).toBe(FAKE_GUEST_UID);
    expect(renamed.displayName).toBe('Sam');
  });
});
