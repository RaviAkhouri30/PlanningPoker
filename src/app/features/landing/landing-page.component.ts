import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { ClosingCtaComponent } from './components/closing-cta/closing-cta.component';
import { FaqListComponent } from './components/faq-list/faq-list.component';
import { FeatureGridComponent } from './components/feature-grid/feature-grid.component';
import { GuestAccountComponent } from './components/guest-account/guest-account.component';
import { HeroFormComponent } from './components/hero-form/hero-form.component';
import { HeroStageComponent } from './components/hero-stage/hero-stage.component';
import { HowItWorksComponent } from './components/how-it-works/how-it-works.component';
import { LandingFooterComponent } from './components/landing-footer/landing-footer.component';
import { LandingHeaderComponent } from './components/landing-header/landing-header.component';
import { type ILandingState } from './models/i-landing-state';
import { LandingViewModel } from './view-models/landing.view-model';

/** The landing page: create a room as a guest, or join one by code. */
@Component({
  selector: 'app-landing-page',
  imports: [
    LandingHeaderComponent,
    HeroFormComponent,
    HeroStageComponent,
    HowItWorksComponent,
    FeatureGridComponent,
    GuestAccountComponent,
    FaqListComponent,
    ClosingCtaComponent,
    LandingFooterComponent,
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [LandingViewModel],
})
export default class LandingPageComponent extends BaseComponent<ILandingState> {
  protected override readonly model = inject(LandingViewModel);
  protected readonly forms = { create: this.model.createForm, code: this.model.codeForm };
}
