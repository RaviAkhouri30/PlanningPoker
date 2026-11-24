import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** The Ante mark (two tilted cards) and word mark, linking home. */
@Component({
  selector: 'app-logo',
  imports: [RouterLink],
  templateUrl: './logo.component.html',
  styleUrl: './logo.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoComponent {
  /** Smaller word mark, for dense headers. */
  public readonly compact = input(false);
}
