import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { type FormControl, type FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '@shared/components/icon/icon.component';
import { AVATAR_PALETTE } from '@shared/constants/palette.constants';
import { BackgroundDirective } from '@shared/directives/background.directive';
import { IconName } from '@shared/enums/icon-name.enum';
import { ParticipantRole } from '@shared/enums/participant-role.enum';
import { JoinTab } from '../../models/i-join-state';

/** The join form's controls. */
export type JoinForm = FormGroup<{
  name: FormControl<string>;
  colour: FormControl<number>;
  role: FormControl<ParticipantRole>;
}>;

/** The white card: "Join as guest" (name, colour, role) and the "Sign in" tab. */
@Component({
  selector: 'app-guest-join-form',
  imports: [ReactiveFormsModule, IconComponent, BackgroundDirective],
  templateUrl: './guest-join-form.component.html',
  styleUrl: './guest-join-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuestJoinFormComponent {
  /** The form, owned by the view model. */
  public readonly form = input.required<JoinForm>();
  /** The showing tab. */
  public readonly tab = input.required<JoinTab>();
  /** The join button's words. */
  public readonly joinLabel = input.required<string>();
  /** The seat is being taken. */
  public readonly joining = input(false);

  /** Asked for another tab. */
  public readonly tabPick = output<JoinTab>();
  /** A colour was picked. */
  public readonly colourPick = output<number>();
  /** A role was picked. */
  public readonly rolePick = output<ParticipantRole>();
  /** Asked to join. */
  public readonly join = output();

  protected readonly palette = AVATAR_PALETTE;
  protected readonly tabs = JoinTab;
  protected readonly roles = ParticipantRole;
  protected readonly arrowIcon = IconName.ArrowRight;
}
