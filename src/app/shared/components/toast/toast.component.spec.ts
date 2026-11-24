import { TestBed } from '@angular/core/testing';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { ToastService } from '@shared/services/toast.service';
import { ToastComponent } from './toast.component';

describe('ToastComponent', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function render() {
    const fixture = TestBed.createComponent(ToastComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('should show a message, then hide it after the duration', () => {
    const fixture = render();
    const element = fixture.nativeElement as HTMLElement;

    TestBed.inject(ToastService).show('Invite link copied');
    fixture.detectChanges();
    expect(element.textContent).toContain('Invite link copied');

    vi.advanceTimersByTime(2400);
    fixture.detectChanges();
    expect(element.querySelector('.toast')).toBeNull();
  });

  it('should replace the toast on screen when a new one arrives', () => {
    const fixture = render();
    const toasts = TestBed.inject(ToastService);

    toasts.show('First');
    toasts.show('Second', ToastTone.Error);
    fixture.detectChanges();

    const shown = (fixture.nativeElement as HTMLElement).querySelectorAll('.toast');
    expect(shown).toHaveLength(1);
    expect(shown[0]?.textContent).toContain('Second');
    expect(shown[0]?.classList).toContain('toast--error');
  });
});
