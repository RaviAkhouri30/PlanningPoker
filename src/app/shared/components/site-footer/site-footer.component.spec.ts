import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { COPYRIGHT_NOTICE } from '@shared/constants/legal.constants';
import { SiteFooterComponent } from './site-footer.component';

describe('SiteFooterComponent', () => {
  it('should show the copyright and link to the terms when rendered', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });

    const fixture = TestBed.createComponent(SiteFooterComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain(COPYRIGHT_NOTICE);
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/terms');
  });
});
