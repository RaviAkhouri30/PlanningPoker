import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { BrowserFileSaver } from './browser-file-saver';

describe('BrowserFileSaver', () => {
  const file = { name: 'backup.csv', content: 'a,b', type: 'text/csv' };

  const click = vi.fn();

  function create(url: unknown): { saver: BrowserFileSaver; link: HTMLAnchorElement } {
    const link = document.createElement('a');
    link.click = click;
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DOCUMENT,
          useValue: {
            defaultView: url === undefined ? {} : { URL: url },
            createElement: () => link,
          },
        },
      ],
    });
    return { saver: TestBed.runInInjectionContext(() => new BrowserFileSaver()), link };
  }

  it('should download the file through a blob link when the browser can', async () => {
    const url = { createObjectURL: vi.fn(() => 'blob:1'), revokeObjectURL: vi.fn() };
    const { saver, link } = create(url);

    await firstValueFrom(saver.save(file));

    expect(link.download).toBe('backup.csv');
    expect(link.href).toBe('blob:1');
    expect(click).toHaveBeenCalled();
    expect(url.revokeObjectURL).not.toHaveBeenCalled();
  });

  it('should release the previous blob when the next file is saved', async () => {
    const url = {
      createObjectURL: vi.fn().mockReturnValueOnce('blob:1').mockReturnValueOnce('blob:2'),
      revokeObjectURL: vi.fn(),
    };
    const { saver } = create(url);

    await firstValueFrom(saver.save(file));
    await firstValueFrom(saver.save(file));

    expect(url.revokeObjectURL).toHaveBeenCalledExactlyOnceWith('blob:1');
  });

  it('should fail when the browser has no blob URLs', async () => {
    await expect(firstValueFrom(create(undefined).saver.save(file))).rejects.toThrow(
      'Downloads unavailable',
    );
  });
});
