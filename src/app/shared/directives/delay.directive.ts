import { Directive, computed, input } from '@angular/core';

/**
 * Staggers an animation or transition: sets `--delay` on the element, which its styles read as
 * `animation-delay: var(--delay)` or `transition-delay: var(--delay)`. Templates may not bind
 * styles directly (CLAUDE.md §6), so dynamic values go through a directive's host binding.
 */
@Directive({
  selector: '[appDelay]',
  host: { '[style.--delay]': 'value()' },
})
export class DelayDirective {
  /** The delay in milliseconds. */
  public readonly appDelay = input.required<number>();

  protected readonly value = computed(() => `${String(this.appDelay())}ms`);
}
