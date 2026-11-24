import { Directive, input } from '@angular/core';

/** Sets an element's background colour from data, e.g. a colour swatch (see `DelayDirective`). */
@Directive({
  selector: '[appBackground]',
  host: { '[style.background-color]': 'appBackground()' },
})
export class BackgroundDirective {
  /** A CSS colour from the design tokens' palette. */
  public readonly appBackground = input.required<string>();
}
