import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { IconName } from '@shared/enums/icon-name.enum';

/** "Invite your team": the link to copy, the code, and the join-as-spectator default. */
@Component({
  selector: 'app-invite-dialog',
  imports: [IconComponent],
  templateUrl: './invite-dialog.component.html',
  styleUrl: './invite-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InviteDialogComponent {
  public readonly open = input(false);
  /** The link without its scheme. */
  public readonly link = input.required<string>();
  public readonly code = input.required<string>();
  public readonly spectatorsByDefault = input(false);
  /** Whether the spectator switch shows (moderators only). */
  public readonly canConfigure = input(false);

  public readonly closed = output();
  public readonly copyLink = output();
  public readonly spectatorsToggle = output();

  protected readonly copyIcon = IconName.Copy;
  protected readonly closeIcon = IconName.Close;

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  public constructor() {
    // The native dialog traps focus and closes on Escape; it is opened through its API.
    effect(() => {
      const element = this.dialog().nativeElement;
      if (this.open() && !element.open) {
        InviteDialogComponent.show(element);
      } else if (!this.open() && element.open) {
        InviteDialogComponent.hide(element);
      }
    });
  }

  // Browsers without the dialog API (and jsdom) fall back to the `open` attribute.
  private static show(element: HTMLDialogElement): void {
    if (typeof element.showModal === 'function') {
      element.showModal();
    } else {
      element.setAttribute('open', '');
    }
  }

  private static hide(element: HTMLDialogElement): void {
    if (typeof element.close === 'function') {
      element.close();
    } else {
      element.removeAttribute('open');
    }
  }
}
