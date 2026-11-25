import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IconComponent } from '@shared/components/icon/icon.component';
import { LIMITS } from '@shared/constants/limits.constants';
import { ModalDirective } from '@shared/directives/modal.directive';
import { IconName } from '@shared/enums/icon-name.enum';
import { TextValidators } from '@shared/validators/text.validators';
import { type INewStory } from '../../models/story-draft.util';

/**
 * The moderator's "Add a story" dialog: one line (a ticket key and title) and optional notes.
 * "Add another" keeps it open for the next story. The draft is this dialog's own UI state; the
 * page decides what adding means.
 */
@Component({
  selector: 'app-add-story-dialog',
  imports: [ReactiveFormsModule, IconComponent, ModalDirective],
  templateUrl: './add-story-dialog.component.html',
  styleUrl: './add-story-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddStoryDialogComponent {
  /** Whether the dialog shows. */
  public readonly open = input(false);

  /** The dialog was closed (button, Escape or after "Add story"). */
  public readonly closed = output();
  /** A story to add. */
  public readonly add = output<INewStory>();

  protected readonly form = new FormGroup({
    text: new FormControl('', {
      nonNullable: true,
      validators: [TextValidators.notBlank, TextValidators.maxTrimmed(LIMITS.storyTitle)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [TextValidators.maxTrimmed(LIMITS.storyDescription)],
    }),
  });
  /** The last story added while the dialog stayed open, for the status line. */
  protected readonly lastAdded = signal('');
  protected readonly limits = LIMITS;
  protected readonly closeIcon = IconName.Close;

  private readonly textField = viewChild.required<ElementRef<HTMLInputElement>>('textField');

  /**
   * Sends the story, or shows what is wrong.
   * @param keepOpen "Add another": stay open with an empty field for the next story.
   */
  protected submit(keepOpen: boolean): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const story = this.form.getRawValue();
    this.add.emit(story);
    this.form.reset();
    if (keepOpen) {
      this.lastAdded.set(story.text.trim());
      this.textField().nativeElement.focus();
    } else {
      this.close();
    }
  }

  protected close(): void {
    this.lastAdded.set('');
    this.closed.emit();
  }
}
