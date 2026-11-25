import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '@shared/components/icon/icon.component';
import { LIMITS } from '@shared/constants/limits.constants';
import { IconName } from '@shared/enums/icon-name.enum';
import { TextValidators } from '@shared/validators/text.validators';

/**
 * The moderator's own estimate, for when the discussion settles on a value the votes didn't
 * suggest (another card, or one outside the deck such as "6"). Up to `LIMITS.estimate`
 * characters, the rules' limit too.
 */
@Component({
  selector: 'app-custom-estimate',
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './custom-estimate.component.html',
  styleUrl: './custom-estimate.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomEstimateComponent {
  /** The estimate typed, trimmed. */
  public readonly estimateSet = output<string>();

  protected readonly form = new FormGroup({
    value: new FormControl('', {
      nonNullable: true,
      validators: [TextValidators.notBlank, TextValidators.maxTrimmed(LIMITS.estimate)],
    }),
  });
  protected readonly value = this.form.controls.value;
  protected readonly limits = LIMITS;
  protected readonly checkIcon = IconName.Check;

  /** Sends the estimate, or shows what is wrong. */
  protected submit(): void {
    if (this.value.invalid) {
      this.value.markAsTouched();
      return;
    }
    this.estimateSet.emit(this.value.value.trim());
    this.form.reset();
  }
}
