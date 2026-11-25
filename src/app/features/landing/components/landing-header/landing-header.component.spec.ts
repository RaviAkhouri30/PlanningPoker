import { testBackendProviders } from '@shared/testing/test-backend';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LandingHeaderComponent } from './landing-header.component';

describe('LandingHeaderComponent', () => {
  it('should link to each section and to the room form', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), testBackendProviders()] });
    const fixture = TestBed.createComponent(LandingHeaderComponent);
    fixture.detectChanges();

    const links = [...(fixture.nativeElement as HTMLElement).querySelectorAll('nav a')].map(
      (link) => link.getAttribute('href'),
    );
    expect(links).toEqual(['/', '#how', '#features', '#guest', '#faq', '#start']);
  });

  it('should link to My rooms when this browser has rooms', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([]), testBackendProviders()] });
    const fixture = TestBed.createComponent(LandingHeaderComponent);
    fixture.componentRef.setInput('hasRooms', true);
    fixture.detectChanges();

    const link = (fixture.nativeElement as HTMLElement).querySelector('a[href="/rooms"]');
    expect(link?.textContent).toBe('My rooms');
  });
});
