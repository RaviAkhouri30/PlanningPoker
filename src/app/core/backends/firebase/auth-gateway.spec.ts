import {
  connectAuthEmulator,
  getAuth,
  onAuthStateChanged,
  signInAnonymously,
  updateProfile,
} from 'firebase/auth';
import { firstValueFrom } from 'rxjs';
import { AuthGateway } from './auth-gateway';

vi.mock('firebase/app', async () => (await import('./testing/firebase-sdk.mock')).firebaseAppMock);
vi.mock(
  'firebase/auth',
  async () => (await import('./testing/firebase-sdk.mock')).firebaseAuthMock,
);

describe('AuthGateway', () => {
  const config = {
    apiKey: 'k',
    authDomain: 'd',
    projectId: 'p',
    storageBucket: 'b',
    messagingSenderId: 'm',
    appId: 'a',
  };
  const guest = { uid: 'g1', displayName: 'Alex', isAnonymous: true };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should connect the emulator when one is given', () => {
    expect(new AuthGateway(config, { host: '127.0.0.1', port: 9099 })).toBeInstanceOf(AuthGateway);

    expect(connectAuthEmulator).toHaveBeenCalledWith(expect.anything(), 'http://127.0.0.1:9099', {
      disableWarnings: true,
    });
  });

  it('should emit the signed-in user when the auth state reports one', async () => {
    vi.mocked(onAuthStateChanged).mockImplementationOnce(((
      _auth: unknown,
      next: (user: unknown) => void,
    ) => {
      next(guest);
      return () => undefined;
    }) as never);

    await expect(firstValueFrom(new AuthGateway(config, null).user$)).resolves.toEqual({
      uid: 'g1',
      displayName: 'Alex',
      isGuest: true,
    });
  });

  it('should emit null and an empty name fallback when signed out', async () => {
    vi.mocked(onAuthStateChanged).mockImplementationOnce(((
      _auth: unknown,
      next: (user: unknown) => void,
    ) => {
      next(null);
      return () => undefined;
    }) as never);

    await expect(firstValueFrom(new AuthGateway(config, null).user$)).resolves.toBeNull();
  });

  it('should fail the stream when the auth state listener fails', async () => {
    vi.mocked(onAuthStateChanged).mockImplementationOnce(((
      _auth: unknown,
      _next: unknown,
      fail: (error: unknown) => void,
    ) => {
      fail(new Error('broken'));
      return () => undefined;
    }) as never);

    await expect(firstValueFrom(new AuthGateway(config, null).user$)).rejects.toThrow('broken');
  });

  it('should sign in anonymously and set the name when nobody is signed in', async () => {
    vi.mocked(signInAnonymously).mockResolvedValueOnce({
      user: { ...guest, displayName: null },
    } as never);

    const user = await firstValueFrom(new AuthGateway(config, null).signInAsGuest('Sam'));

    expect(user).toEqual({ uid: 'g1', displayName: 'Sam', isGuest: true });
    expect(updateProfile).toHaveBeenCalledWith(expect.objectContaining({ uid: 'g1' }), {
      displayName: 'Sam',
    });
  });

  it('should rename the current user without a new sign-in when someone is signed in', async () => {
    vi.mocked(getAuth).mockReturnValueOnce({ currentUser: guest } as never);

    const user = await firstValueFrom(new AuthGateway(config, null).signInAsGuest('Sam'));

    expect(signInAnonymously).not.toHaveBeenCalled();
    expect(user.uid).toBe('g1');
  });
});
