import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { type FormControl, ReactiveFormsModule } from '@angular/forms';

/** The closing band: the same name field as the hero, and "Create room". */
@Component({
  selector: 'app-closing-cta',
  imports: [ReactiveFormsModule],
  templateUrl: './closing-cta.component.html',
  styleUrl: './closing-cta.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClosingCtaComponent {
  /** The hero's name control, shared so both fields stay in step. */
  public readonly name = input.required<FormControl<string>>();
  /** A room is being created. */
  public readonly creating = input(false);
  /** Asked to create the room. */
  public readonly create = output();

  /** The field has no form group (it shares the hero's control), so the page submit is stopped here. */
  protected submit(event: Event): void {
    event.preventDefault();
    this.create.emit();
  }
}
