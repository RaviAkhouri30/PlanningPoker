import { Component, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalDirective } from './modal.directive';

@Component({
  selector: 'app-modal-probe',
  imports: [ModalDirective],
  template: `<dialog [appModal]="open()"></dialog>`,
})
class ModalProbeComponent {
  public readonly open = signal(true);
}

describe('ModalDirective', () => {
  function render(): { fixture: ComponentFixture<ModalProbeComponent>; dialog: HTMLDialogElement } {
    const fixture = TestBed.createComponent(ModalProbeComponent);
    fixture.detectChanges();
    const dialog = (fixture.nativeElement as HTMLElement).querySelector('dialog')!;
    return { fixture, dialog };
  }

  function close(fixture: ComponentFixture<ModalProbeComponent>): void {
    fixture.componentInstance.open.set(false);
    fixture.detectChanges();
  }

  it('should open and close through the open attribute when there is no dialog API', () => {
    const { fixture, dialog } = render();
    expect(dialog.hasAttribute('open')).toBe(true);

    close(fixture);

    expect(dialog.hasAttribute('open')).toBe(false);
  });

  it('should use the native modal API when the browser has one', () => {
    const prototype = HTMLDialogElement.prototype as unknown as Record<string, unknown>;
    const showModal = vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute('open', '');
    });
    const hide = vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute('open');
    });
    prototype['showModal'] = showModal;
    prototype['close'] = hide;
    try {
      const { fixture } = render();

      close(fixture);

      expect(showModal).toHaveBeenCalledTimes(1);
      expect(hide).toHaveBeenCalledTimes(1);
    } finally {
      delete prototype['showModal'];
      delete prototype['close'];
    }
  });
});
