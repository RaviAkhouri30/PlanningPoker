import { initializeApp } from 'firebase/app';
import { ReCaptchaV3Provider, initializeAppCheck } from 'firebase/app-check';
import { getFirebaseApp } from './firebase-app';

vi.mock('firebase/app', async () => (await import('./testing/firebase-sdk.mock')).firebaseAppMock);
vi.mock(
  'firebase/app-check',
  async () => (await import('./testing/firebase-sdk.mock')).appCheckMock,
);

describe('getFirebaseApp', () => {
  const config = {
    apiKey: 'k',
    authDomain: 'd',
    projectId: 'p',
    storageBucket: 'b',
    messagingSenderId: 'm',
    appId: 'a',
  };
  // A fresh app object per test, so the module's "already started" set never carries over.
  let app: { name: string };

  beforeEach(() => {
    vi.clearAllMocks();
    app = { name: '[DEFAULT]' };
    vi.mocked(initializeApp).mockReturnValue(app as never);
  });

  it('should pass only the SDK fields to initializeApp when a site key is present', () => {
    getFirebaseApp({ ...config, appCheckSiteKey: 'site-key' });

    expect(initializeApp).toHaveBeenCalledWith(config);
  });

  it('should start App Check with the reCAPTCHA v3 site key', () => {
    getFirebaseApp({ ...config, appCheckSiteKey: 'site-key' });

    expect(ReCaptchaV3Provider).toHaveBeenCalledWith('site-key');
    const call = vi.mocked(initializeAppCheck).mock.calls[0];
    expect(call?.[0]).toBe(app);
    expect(call?.[1].isTokenAutoRefreshEnabled).toBe(true);
    expect(call?.[1].provider).toBeInstanceOf(ReCaptchaV3Provider);
  });

  it('should start App Check only once for the same app', () => {
    getFirebaseApp({ ...config, appCheckSiteKey: 'site-key' });
    getFirebaseApp({ ...config, appCheckSiteKey: 'site-key' });

    expect(initializeAppCheck).toHaveBeenCalledTimes(1);
  });

  it('should not start App Check when no site key is given', () => {
    getFirebaseApp(config);

    expect(initializeAppCheck).not.toHaveBeenCalled();
  });

  it('should not start App Check when the site key is empty', () => {
    getFirebaseApp({ ...config, appCheckSiteKey: '' });

    expect(initializeAppCheck).not.toHaveBeenCalled();
  });
});
