import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  AVATAR_PALETTE,
  DEFAULT_AVATAR_COLOUR,
  type IAvatarColour,
} from '@shared/constants/palette.constants';
import { initialsOf } from '@shared/utils/display.util';

/** A round avatar with initials in one of the six seat colours. */
@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.avatar--me]': 'isMe()',
    '[class]': "'avatar avatar--' + size()",
    '[style.--avatar-bg]': 'colour().background',
    '[style.--avatar-fg]': 'colour().foreground',
    '[attr.title]': 'name()',
  },
})
export class AvatarComponent {
  /** The person's display name. */
  public readonly name = input.required<string>();
  /** Index into the palette. */
  public readonly colourIndex = input(0);
  /** Ring the avatar as the current person's. */
  public readonly isMe = input(false);
  /** `sm` 28 px, `md` 36 px, `lg` 52 px. */
  public readonly size = input<'sm' | 'md' | 'lg'>('md');

  protected readonly initials = computed(() => initialsOf(this.name()));
  protected readonly colour = computed(
    (): IAvatarColour => AVATAR_PALETTE[this.colourIndex()] ?? DEFAULT_AVATAR_COLOUR,
  );
}
