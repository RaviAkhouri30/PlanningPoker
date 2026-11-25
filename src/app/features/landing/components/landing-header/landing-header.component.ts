import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LogoComponent } from '@shared/components/logo/logo.component';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle.component';
import { MY_ROOMS_COMMANDS } from '@shared/constants/routes.constants';

/** The landing page's sticky header: logo, section links, My rooms and "Start a room". */
@Component({
  selector: 'app-landing-header',
  imports: [RouterLink, LogoComponent, ThemeToggleComponent],
  templateUrl: './landing-header.component.html',
  styleUrl: './landing-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingHeaderComponent {
  /** Show "My rooms": this browser has rooms to go back to. */
  public readonly hasRooms = input(false);

  protected readonly myRooms = MY_ROOMS_COMMANDS;
}
