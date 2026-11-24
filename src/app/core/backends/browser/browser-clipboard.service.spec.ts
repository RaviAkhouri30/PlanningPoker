import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { BrowserClipboardService } from './browser-clipboard.service';

describe('BrowserClipboardService', () => {
  function create(clipboard: unknown): BrowserClipboardService {
    TestBed.configureTestingModule({
      providers: [{ provide: DOCUMENT, useValue: { defaultView: { navigator: { clipboard } } } }],
    });
    return TestBed.runInInjectionContext(() => new BrowserClipboardService());
  }

  it('should write the text when the Clipboard API exists', async () => {
    const writeText = vi.fn(() => Promise.resolve());

    await firstValueFrom(create({ writeText }).copy('hello'), { defaultValue: undefined });

    expect(writeText).toHaveBeenCalledWith('hello');
  });

  it('should fail when the Clipboard API is missing', async () => {
    await expect(firstValueFrom(create(undefined).copy('hello'))).rejects.toThrow(
      'Clipboard API unavailable',
    );
  });
});
