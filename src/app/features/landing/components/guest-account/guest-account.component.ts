import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { IconName } from '@shared/enums/icon-name.enum';
import { ACCOUNT_PERKS, COMPARISONS, GUEST_PERKS } from '../../models/landing-content.constants';

/** "Your choice": guest versus free account, and how Ante compares with a typical tool. */
@Component({
  selector: 'app-guest-account',
  imports: [IconComponent],
  templateUrl: './guest-account.component.html',
  styleUrl: './guest-account.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuestAccountComponent {
  protected readonly guestPerks = GUEST_PERKS;
  protected readonly accountPerks = ACCOUNT_PERKS;
  protected readonly comparisons = COMPARISONS;
  protected readonly checkIcon = IconName.Check;
}
