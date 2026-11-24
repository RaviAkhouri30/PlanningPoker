import { firstValueFrom } from 'rxjs';
import { FakeClipboardService } from './fake-clipboard.service';

describe('FakeClipboardService', () => {
  it('should remember the text when it is copied', async () => {
    const clipboard = new FakeClipboardService();

    await firstValueFrom(clipboard.copy('link'));

    expect(clipboard.copied).toEqual(['link']);
  });
});
