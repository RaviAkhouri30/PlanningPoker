import { Directive, ElementRef, effect, inject, input } from '@angular/core';

/**
 * Opens and closes a native `<dialog>` as a modal from a boolean, so a component can drive it
 * from state. The native modal traps focus, honours `autofocus` and closes on Escape.
 */
@Directive({ selector: 'dialog[appModal]' })
export class ModalDirective {
  /** Whether the dialog shows. */
  public readonly appModal = input(false);

  private readonly element: HTMLDialogElement =
    inject<ElementRef<HTMLDialogElement>>(ElementRef).nativeElement;

  public constructor() {
    effect(() => {
      if (this.appModal() && !this.element.open) {
        this.show();
      } else if (!this.appModal() && this.element.open) {
        this.hide();
      }
    });
  }

  // Browsers without the dialog API (and jsdom) fall back to the `open` attribute.
  private show(): void {
    if (typeof this.element.showModal === 'function') {
      this.element.showModal();
    } else {
      this.element.setAttribute('open', '');
    }
  }

  private hide(): void {
    if (typeof this.element.close === 'function') {
      this.element.close();
    } else {
      this.element.removeAttribute('open');
    }
  }
}
