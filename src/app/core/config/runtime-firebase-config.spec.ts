import { isFirebaseConfig, readRuntimeFirebaseConfig } from './runtime-firebase-config';

describe('runtime Firebase config', () => {
  const config = {
    apiKey: 'k',
    authDomain: 'd',
    projectId: 'p',
    storageBucket: 'b',
    messagingSenderId: 'm',
    appId: 'a',
  };

  it('should accept a config when every setting is a non-empty string', () => {
    expect(isFirebaseConfig(config)).toBe(true);
  });

  it.each([null, 'text', { ...config, appId: '' }, { ...config, apiKey: 1 }])(
    'should reject %o when it is not a full config',
    (value) => {
      expect(isFirebaseConfig(value)).toBe(false);
    },
  );

  it('should read the global when runtime-config.js set it', () => {
    expect(readRuntimeFirebaseConfig({ __FIREBASE_CONFIG__: config })).toEqual(config);
  });

  it('should return null when the global is missing', () => {
    expect(readRuntimeFirebaseConfig({})).toBeNull();
  });
});
