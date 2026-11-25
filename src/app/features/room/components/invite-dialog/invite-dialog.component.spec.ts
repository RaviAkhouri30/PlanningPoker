import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { InviteDialogComponent } from './invite-dialog.component';

describe('InviteDialogComponent', () => {
  let fixture: ComponentFixture<InviteDialogComponent>;

  function render(open: boolean, canConfigure = true): HTMLDialogElement {
    fixture = TestBed.createComponent(InviteDialogComponent);
    fixture.componentRef.setInput('open', open);
    fixture.componentRef.setInput('link', 'planningpoker.test/r/r1');
    fixture.componentRef.setInput('code', 'X7K2-92');
    fixture.componentRef.setInput('canConfigure', canConfigure);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).querySelector('dialog')!;
  }

  it('should open and close through the open attribute without the dialog API', () => {
    const dialog = render(true);
    expect(dialog.hasAttribute('open')).toBe(true);

    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();

    expect(dialog.hasAttribute('open')).toBe(false);
  });

  it('should use the native modal API when there is one', () => {
    const prototype = HTMLDialogElement.prototype as unknown as Record<string, unknown>;
    const showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });
    const close = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    });
    prototype['showModal'] = showModal;
    prototype['close'] = close;
    try {
      render(true);
      fixture.componentRef.setInput('open', false);
      fixture.detectChanges();

      expect(showModal).toHaveBeenCalledTimes(1);
      expect(close).toHaveBeenCalledTimes(1);
    } finally {
      delete prototype['showModal'];
      delete prototype['close'];
    }
  });

  it('should show the link and code and emit its actions', () => {
    const dialog = render(true);
    const calls: string[] = [];
    fixture.componentInstance.copyLink.subscribe(() => calls.push('copy'));
    fixture.componentInstance.closed.subscribe(() => calls.push('close'));
    fixture.componentInstance.spectatorsToggle.subscribe(() => calls.push('spectators'));

    dialog.querySelector<HTMLButtonElement>('.btn--primary')?.click();
    dialog.querySelector<HTMLButtonElement>('.switch')?.click();
    dialog.querySelector<HTMLButtonElement>('[aria-label="Close"]')?.click();

    expect(dialog.textContent).toContain('planningpoker.test/r/r1');
    expect(dialog.textContent).toContain('X7K2-92');
    expect(calls).toEqual(['copy', 'spectators', 'close']);
  });

  it('should hide the join-role switch from non-moderators', () => {
    expect(render(true, false).querySelector('.switch')).toBeNull();
  });
});
