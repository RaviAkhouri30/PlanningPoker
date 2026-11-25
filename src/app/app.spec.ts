import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  it('should host the router outlet, the footer and the toast', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('router-outlet')).not.toBeNull();
    expect(element.querySelector('app-site-footer')).not.toBeNull();
    expect(element.querySelector('app-toast')).not.toBeNull();
  });
});
