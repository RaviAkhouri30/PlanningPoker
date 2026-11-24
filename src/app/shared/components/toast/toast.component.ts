import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { IconName } from '@shared/enums/icon-name.enum';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { type IToast } from '@shared/interfaces/i-toast';
import { ToastViewModel } from './toast.view-model';

/** A short message near the bottom of the screen, announced politely to screen readers. */
@Component({
  selector: 'app-toast',
  imports: [IconComponent],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ToastViewModel],
})
export class ToastComponent extends BaseComponent<IToast | null> {
  protected override readonly model = inject(ToastViewModel);
  protected readonly error = ToastTone.Error;
  protected readonly checkIcon = IconName.Check;
  protected readonly alertIcon = IconName.Alert;
}
