import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ICON_REGISTRY } from '@shared/constants/icon-registry.constants';
import { type IconName } from '@shared/enums/icon-name.enum';

/** The design's icon size. */
const DEFAULT_SIZE = 18;
/** The design's stroke width. */
const DEFAULT_STROKE = 2;

/**
 * A stroke icon from the design, drawn in `currentColor`. Decorative (`aria-hidden`) unless
 * given a `label`, in which case it is an image with that name.
 */
@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  /** Which icon. */
  public readonly name = input.required<IconName>();
  /** Width and height in pixels. */
  public readonly size = input(DEFAULT_SIZE);
  /** Stroke width on the 24 px grid. */
  public readonly stroke = input(DEFAULT_STROKE);
  /** Accessible name; empty means decorative. */
  public readonly label = input('');

  protected readonly shapes = computed(() => ICON_REGISTRY[this.name()]);
}
