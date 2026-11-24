import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Confetti pieces; the styles place and colour each one. */
const PIECES = 26;

/** A short burst of confetti when the whole table agrees. Decorative only. */
@Component({
  selector: 'app-confetti-burst',
  template: `@for (piece of pieces; track piece) {
    <span class="piece"></span>
  }`,
  styleUrl: './confetti-burst.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class ConfettiBurstComponent {
  protected readonly pieces = Array.from({ length: PIECES }, (_, index) => index);
}
