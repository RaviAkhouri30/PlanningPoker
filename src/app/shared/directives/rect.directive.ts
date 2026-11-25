import { Directive, input } from '@angular/core';

/** A box in viewport pixels, e.g. from `getBoundingClientRect()`. */
export interface IViewportRect {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

/** Places a `position: fixed` element over a box, e.g. the tour's spotlight (see `DelayDirective`). */
@Directive({
  selector: '[appRect]',
  host: {
    '[style.top.px]': 'appRect().top',
    '[style.left.px]': 'appRect().left',
    '[style.width.px]': 'appRect().width',
    '[style.height.px]': 'appRect().height',
  },
})
export class RectDirective {
  /** Where the element goes. */
  public readonly appRect = input.required<IViewportRect>();
}
