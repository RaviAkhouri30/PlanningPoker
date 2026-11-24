import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LogoComponent } from './logo.component';

describe('LogoComponent', () => {
  it('should link home with an accessible name', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(LogoComponent);
    fixture.componentRef.setInput('compact', true);
    fixture.detectChanges();

    const link = (fixture.nativeElement as HTMLElement).querySelector('a')!;
    expect(link.getAttribute('href')).toBe('/');
    expect(link.getAttribute('aria-label')).toBe('Ante home');
    expect(link.classList).toContain('logo--compact');
  });
});
