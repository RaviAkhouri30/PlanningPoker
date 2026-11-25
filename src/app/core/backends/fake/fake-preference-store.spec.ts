import { FakePreferenceStore } from './fake-preference-store';

describe('FakePreferenceStore', () => {
  it('should return what was written and nothing for unknown keys', () => {
    const store = new FakePreferenceStore();

    store.write('tour', 'seen');

    expect(store.read('tour')).toBe('seen');
    expect(store.read('other')).toBeNull();
  });
});
