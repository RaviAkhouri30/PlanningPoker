import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { APP_ENVIRONMENT } from './app-environment.token';
import { APP_ORIGIN } from './app-origin.token';
import { CLOCK } from './clock.token';
import { FIREBASE_CONFIG } from './firebase-config.token';
import { RANDOM } from './random.token';

describe('tokens', () => {
  it('should read the origin from the document', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: DOCUMENT, useValue: { location: { origin: 'https://ante.test' } } }],
    });

    expect(TestBed.inject(APP_ORIGIN)).toBe('https://ante.test');
  });

  it('should tell the time and draw numbers in [0, 1)', () => {
    expect(TestBed.inject(CLOCK).now()).toBeGreaterThan(0);
    const value = TestBed.inject(RANDOM)();
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThan(1);
  });

  it('should take the Firebase config from the environment when it has one', () => {
    const firebase = {
      apiKey: 'k',
      authDomain: 'd',
      projectId: 'p',
      storageBucket: 'b',
      messagingSenderId: 'm',
      appId: 'a',
    };
    TestBed.configureTestingModule({
      providers: [{ provide: APP_ENVIRONMENT, useValue: { firebase } }],
    });

    expect(TestBed.inject(FIREBASE_CONFIG)).toBe(firebase);
  });

  it('should fall back to runtime-config.js when the environment has none', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: APP_ENVIRONMENT, useValue: { firebase: null } }],
    });

    expect(TestBed.inject(FIREBASE_CONFIG)).toBeNull();
  });

  it('should provide the build environment by default', () => {
    expect(TestBed.inject(APP_ENVIRONMENT).backend).toBeDefined();
  });
});
