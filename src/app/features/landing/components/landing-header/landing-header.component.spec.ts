import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LandingHeaderComponent } from './landing-header.component';

describe('LandingHeaderComponent', () => {
  it('should link to each section and to the room form', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(LandingHeaderComponent);
    fixture.detectChanges();

    const links = [...(fixture.nativeElement as HTMLElement).querySelectorAll('nav a')].map(
      (link) => link.getAttribute('href'),
    );
    expect(links).toEqual(['/', '#how', '#features', '#guest', '#faq', '#start']);
  });
});
