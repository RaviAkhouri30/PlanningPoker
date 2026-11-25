import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { type FormControl, type FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AvatarPickerComponent } from '@shared/components/avatar-picker/avatar-picker.component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { type Animal } from '@shared/enums/animal.enum';
import { IconName } from '@shared/enums/icon-name.enum';
import { type ILandingState } from '../../models/i-landing-state';

/** The two form groups the hero edits. */
export interface IHeroForms {
  readonly create: FormGroup<{
    name: FormControl<string>;
    roomName: FormControl<string>;
    avatar: FormControl<Animal>;
    facilitate: FormControl<boolean>;
  }>;
  readonly code: FormGroup<{ code: FormControl<string> }>;
}

/** The hero's card: name, avatar and room name to create a room, and "Got a code?" to join one. */
@Component({
  selector: 'app-hero-form',
  imports: [ReactiveFormsModule, IconComponent, AvatarPickerComponent],
  templateUrl: './hero-form.component.html',
  styleUrl: './hero-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroFormComponent {
  /** The forms, owned by the view model. */
  public readonly forms = input.required<IHeroForms>();
  /** What the forms are doing. */
  public readonly state = input.required<ILandingState>();
  /** The start of the room link, e.g. `planningpoker.example.com/r/`. */
  public readonly linkPrefix = input.required<string>();
  /** The link's slug from the room name so far. */
  public readonly slug = input.required<string>();
  /** The create button's words. */
  public readonly createLabel = input.required<string>();
  /** The organiser's animal. */
  public readonly avatar = input.required<Animal>();
  /** The seat colour behind the animal. */
  public readonly avatarColour = input(0);

  /** Asked to create the room. */
  public readonly create = output();
  /** An avatar was picked. */
  public readonly avatarPick = output<Animal>();
  /** Asked to join by the typed code. */
  public readonly joinCode = output();

  protected readonly arrowIcon = IconName.ArrowRight;
  protected readonly linkIcon = IconName.Link;
}
