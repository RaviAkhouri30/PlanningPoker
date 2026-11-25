import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { COPYRIGHT_NOTICE } from '@shared/constants/legal.constants';
import TermsPageComponent from './terms-page.component';

describe('TermsPageComponent', () => {
  function render(): HTMLElement {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(TermsPageComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should state the copyright when the terms are shown', () => {
    const element = render();

    expect(element.querySelector('h1')?.textContent).toContain('Terms of use');
    expect(element.textContent).toContain(COPYRIGHT_NOTICE);
  });

  it('should say no account is needed when the terms are shown', () => {
    const element = render();

    const headings = Array.from(element.querySelectorAll('h2'), (heading) => heading.textContent);
    expect(headings).toContain('Do I need an account?');
    expect(element.textContent).toContain('as a guest');
  });
});
