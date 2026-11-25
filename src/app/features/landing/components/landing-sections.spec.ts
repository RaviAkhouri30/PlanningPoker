import { type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FEATURES, QUESTIONS, STEPS } from '../models/landing-content.constants';
import { FaqListComponent } from './faq-list/faq-list.component';
import { FeatureGridComponent } from './feature-grid/feature-grid.component';
import { GuestAccountComponent } from './guest-account/guest-account.component';
import { HeroStageComponent } from './hero-stage/hero-stage.component';
import { HowItWorksComponent } from './how-it-works/how-it-works.component';
import { LandingFooterComponent } from './landing-footer/landing-footer.component';

/** The landing page's static sections, rendered from their content constants. */
describe('Landing sections', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  function render(component: Type<unknown>): HTMLElement {
    const fixture = TestBed.createComponent(component);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should number the steps', () => {
    expect(render(HowItWorksComponent).querySelectorAll('.step')).toHaveLength(STEPS.length);
  });

  it('should show smart voting and every feature', () => {
    const grid = render(FeatureGridComponent);

    expect(grid.querySelectorAll('.feature')).toHaveLength(FEATURES.length + 1);
    expect(grid.querySelector('.chip--accent')?.textContent).toContain('Suggested 5');
  });

  it('should compare guest and account and the typical tool', () => {
    const section = render(GuestAccountComponent);

    expect(section.querySelectorAll('.plan')).toHaveLength(2);
    expect(section.querySelector('caption')?.textContent).toContain('How PlanningPoker compares');
  });

  it('should list the questions with the first open', () => {
    const faq = render(FaqListComponent);

    expect(faq.querySelectorAll('details')).toHaveLength(QUESTIONS.length);
    expect(faq.querySelector('details')?.open).toBe(true);
  });

  it('should draw a decorative table and a footer', () => {
    expect(render(HeroStageComponent).getAttribute('aria-hidden')).toBe('true');
    expect(render(LandingFooterComponent).querySelectorAll('.footer__link')).toHaveLength(2);
  });
});
