import { firstValueFrom } from 'rxjs';
import { FakeServerClock } from './fake-server-clock';

describe('FakeServerClock', () => {
  it('should report no offset when none is given', async () => {
    await expect(firstValueFrom(new FakeServerClock().offset())).resolves.toBe(0);
  });

  it('should report the offset when one is given', async () => {
    await expect(firstValueFrom(new FakeServerClock(-90_000).offset())).resolves.toBe(-90_000);
  });
});
