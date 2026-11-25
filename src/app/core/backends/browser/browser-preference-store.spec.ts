import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { BrowserPreferenceStore } from './browser-preference-store';

describe('BrowserPreferenceStore', () => {
  function create(localStorage: unknown): BrowserPreferenceStore {
    TestBed.configureTestingModule({
      providers: [{ provide: DOCUMENT, useValue: { defaultView: { localStorage } } }],
    });
    return TestBed.runInInjectionContext(() => new BrowserPreferenceStore());
  }

  function blocked(): unknown {
    const refuse = (): never => {
      throw new Error('SecurityError');
    };
    return { getItem: refuse, setItem: refuse };
  }

  it('should read back what it wrote when storage is available', () => {
    const saved = new Map<string, string>();
    const store = create({
      getItem: (key: string) => saved.get(key) ?? null,
      setItem: (key: string, value: string) => saved.set(key, value),
    });

    store.write('tour', 'seen');

    expect(store.read('tour')).toBe('seen');
    expect(store.read('other')).toBeNull();
  });

  it('should read nothing and write nothing when the browser blocks storage', () => {
    const store = create(blocked());

    expect(() => {
      store.write('tour', 'seen');
    }).not.toThrow();
    expect(store.read('tour')).toBeNull();
  });

  it('should read nothing when there is no window', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: DOCUMENT, useValue: { defaultView: null } }],
    });
    const store = TestBed.runInInjectionContext(() => new BrowserPreferenceStore());

    store.write('tour', 'seen');

    expect(store.read('tour')).toBeNull();
  });
});
