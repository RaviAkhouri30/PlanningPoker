import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteFooterComponent } from '@shared/components/site-footer/site-footer.component';
import { ToastComponent } from '@shared/components/toast/toast.component';

/** Root component. Holds no state or logic: it hosts the routed page, the copyright footer and the toast. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteFooterComponent, ToastComponent],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
