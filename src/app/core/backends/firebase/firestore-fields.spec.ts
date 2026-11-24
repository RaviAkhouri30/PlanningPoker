import { SERVER_TIME } from '@core/interfaces/i-realtime-store';
import { fromFirestoreFields, toFirestoreFields } from './firestore-fields';

describe('Firestore fields', () => {
  it('should swap SERVER_TIME for the SDK sentinel when writing', () => {
    expect(toFirestoreFields({ at: SERVER_TIME, name: 'A' }, 'sentinel')).toEqual({
      at: 'sentinel',
      name: 'A',
    });
  });

  it('should turn timestamps into milliseconds when reading', () => {
    expect(fromFirestoreFields({ at: { toMillis: () => 5 }, name: 'A', none: null })).toEqual({
      at: 5,
      name: 'A',
      none: null,
    });
  });
});
