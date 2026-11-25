import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';
import { THEME_CYCLE, THEME_LABELS } from '@shared/constants/theme.constants';
import { IconName } from '@shared/enums/icon-name.enum';
import { ThemeMode } from '@shared/enums/theme-mode.enum';
import { ThemeService } from '@shared/services/theme.service';

const ICONS: ReadonlyMap<ThemeMode, IconName> = new Map([
  [ThemeMode.System, IconName.Monitor],
  [ThemeMode.Light, IconName.Sun],
  [ThemeMode.Dark, IconName.Moon],
]);

/**
 * The theme switch: one button that steps through system, light and dark. It talks to the root
 * `ThemeService` directly: the setting is app-wide and the button has no other state, so a view
 * model would only pass the call along.
 */
@Component({
  selector: 'app-theme-toggle',
  imports: [IconComponent],
  templateUrl: './theme-toggle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  protected readonly icon = computed(() => ICONS.get(this.theme.mode()) ?? IconName.Monitor);

  /** "Theme: System. Switch to Light." */
  protected readonly label = computed(() => {
    const mode = this.theme.mode();
    const next = THEME_CYCLE.at((THEME_CYCLE.indexOf(mode) + 1) % THEME_CYCLE.length) ?? mode;
    return `Theme: ${THEME_LABELS.get(mode) ?? ''}. Switch to ${THEME_LABELS.get(next) ?? ''}.`;
  });

  // Read lazily by the computeds above, so declaring it after them is safe.
  private readonly theme = inject(ThemeService);

  protected switch(): void {
    this.theme.cycle();
  }
}
