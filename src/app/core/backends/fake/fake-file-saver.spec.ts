import { firstValueFrom } from 'rxjs';
import { FakeFileSaver } from './fake-file-saver';

describe('FakeFileSaver', () => {
  it('should remember each file when one is saved', async () => {
    const saver = new FakeFileSaver();
    const file = { name: 'a.csv', content: 'x', type: 'text/csv' };

    await firstValueFrom(saver.save(file));

    expect(saver.saved).toEqual([file]);
  });
});
