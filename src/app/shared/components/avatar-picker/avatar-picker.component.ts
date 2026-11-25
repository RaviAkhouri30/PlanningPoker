import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { ANIMAL_FACES, animalFace } from '@shared/constants/animals.constants';
import { type Animal } from '@shared/enums/animal.enum';

/**
 * "Your avatar": the picked animal with a "Change" button that opens a grid of all sixteen.
 * Presentational: the form's view model owns the value, this only shows it and reports picks.
 */
@Component({
  selector: 'app-avatar-picker',
  imports: [AvatarComponent],
  templateUrl: './avatar-picker.component.html',
  styleUrl: './avatar-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarPickerComponent {
  /** The picked animal. */
  public readonly animal = input.required<Animal>();
  /** The seat colour behind every face. */
  public readonly colourIndex = input(0);
  /** The person's name, for the big avatar's tooltip. */
  public readonly name = input('');
  /** Makes the ids unique when two pickers share a page. */
  public readonly idPrefix = input('avatar');

  /** An animal was picked. */
  public readonly animalPick = output<Animal>();

  protected readonly faces = ANIMAL_FACES;
  protected readonly open = signal(false);
  protected readonly label = computed(() => animalFace(this.animal())?.label ?? '');

  /** Shows or hides the grid. */
  protected toggle(): void {
    this.open.update((open) => !open);
  }

  /** Reports the pick and folds the grid away: one pick is the usual case. */
  protected pick(animal: Animal): void {
    this.animalPick.emit(animal);
    this.open.set(false);
  }
}
