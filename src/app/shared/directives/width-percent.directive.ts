import { Directive, input } from '@angular/core';

/** Sets an element's width as a percentage, e.g. a bar of a chart (see `DelayDirective`). */
@Directive({
  selector: '[appWidthPercent]',
  host: { '[style.width.%]': 'appWidthPercent()' },
})
export class WidthPercentDirective {
  /** Width, 0–100. */
  public readonly appWidthPercent = input.required<number>();
}
