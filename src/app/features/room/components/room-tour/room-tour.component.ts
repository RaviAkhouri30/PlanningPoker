import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  type ElementRef,
  afterRenderEffect,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { type IViewportRect, RectDirective } from '@shared/directives/rect.directive';
import { type ITourStep } from '../../models/tour-steps.constants';
import { TourTarget } from '../../models/tour-target.enum';

/** Room around the highlighted part, in px. */
const SPOT_PADDING = 8;

/** The padding on both sides of the part. */
const SPOT_GROWTH = SPOT_PADDING + SPOT_PADDING;

/** Half a box, to find its middle. */
const HALF = 0.5;

/** Past this share of the screen's height, the card moves to the top so it doesn't cover the part. */
const CARD_FLIP_RATIO = 0.55;

/** Fields where the arrow keys move the caret, so they don't turn the tour's page. */
const TYPING_TAGS: ReadonlySet<string> = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

/**
 * The guided tour's overlay: a spotlight on one part of the room and a card explaining it. The
 * spotlight follows the part on scroll and resize; the arrow keys move between steps and Escape
 * closes the tour, which hands focus back to where it was (or to the tour button). DOM measuring
 * and focus are view work, so they live here; the step itself comes from the view model.
 */
@Component({
  selector: 'app-room-tour',
  imports: [RectDirective],
  templateUrl: './room-tour.component.html',
  styleUrl: './room-tour.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:resize)': 'measure()',
    '(window:scroll)': 'measure()',
    '(document:keydown.escape)': 'skip.emit()',
    '(document:keydown.arrowright)': 'arrow($event, true)',
    '(document:keydown.arrowleft)': 'arrow($event, false)',
  },
})
export class RoomTourComponent {
  public readonly step = input.required<ITourStep>();
  /** 1-based position of the step. */
  public readonly number = input.required<number>();
  public readonly total = input.required<number>();

  public readonly back = output();
  public readonly next = output();
  /** Closes the tour from any step. */
  public readonly skip = output();

  protected readonly spot = signal<IViewportRect | null>(null);
  protected readonly cardAtTop = signal(false);
  protected readonly isFirst = computed(() => this.number() === 1);
  protected readonly nextLabel = computed(() => (this.number() === this.total() ? 'Done' : 'Next'));
  /** One dot per step, the current one filled. */
  protected readonly dots = computed(() =>
    Array.from({ length: this.total() }, (_, index) => index + 1 === this.number()),
  );

  private readonly document = inject(DOCUMENT);
  private readonly nextButton = viewChild<ElementRef<HTMLButtonElement>>('nextButton');

  public constructor() {
    // Opened from a button, focus goes back to it; opened by itself, to the tour button.
    const opener = this.document.activeElement;
    inject(DestroyRef).onDestroy(() => {
      this.restoreFocus(opener);
    });
    // After each render of a new step: bring its part into view, light it and focus "Next".
    afterRenderEffect(() => {
      const target = this.findTarget(this.step());
      // jsdom has no scrollIntoView. Instant, so the spotlight measures where the part ends up and
      // people who ask for less motion get none.
      if (typeof target?.scrollIntoView === 'function') {
        target.scrollIntoView({ block: 'center', inline: 'nearest' });
      }
      this.measure();
      this.nextButton()?.nativeElement.focus();
    });
  }

  /** Puts the spotlight back over the step's part, e.g. after a scroll. */
  protected measure(): void {
    const target = this.findTarget(this.step());
    if (target === null) {
      this.spot.set(null);
      return;
    }
    const box = target.getBoundingClientRect();
    this.spot.set({
      top: box.top - SPOT_PADDING,
      left: box.left - SPOT_PADDING,
      width: box.width + SPOT_GROWTH,
      height: box.height + SPOT_GROWTH,
    });
    const viewportHeight = this.document.defaultView?.innerHeight ?? 0;
    const middle = box.top + box.height * HALF;
    this.cardAtTop.set(middle > viewportHeight * CARD_FLIP_RATIO);
  }

  /**
   * The arrow keys turn the page, unless the person is typing in a field.
   * @param forward → for the next step, ← for the one before.
   */
  protected arrow(event: Event, forward: boolean): void {
    const target = event.target;
    if (target instanceof HTMLElement && TYPING_TAGS.has(target.tagName)) {
      return;
    }
    if (forward) {
      this.next.emit();
    } else if (!this.isFirst()) {
      this.back.emit();
    }
  }

  private restoreFocus(opener: Element | null): void {
    const fallback = this.document.querySelector<HTMLElement>(
      `[data-tour="${TourTarget.TourButton}"]`,
    );
    const back =
      opener instanceof HTMLElement && opener !== this.document.body && opener.isConnected
        ? opener
        : fallback;
    back?.focus();
  }

  private findTarget(step: ITourStep): HTMLElement | null {
    return this.document.querySelector<HTMLElement>(`[data-tour="${step.target}"]`);
  }
}
