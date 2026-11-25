import { TestBed } from '@angular/core/testing';
import { BrowserDataNoticeComponent } from './browser-data-notice.component';

describe('BrowserDataNoticeComponent', () => {
  it('should warn that the guest data lives in this browser when it renders', () => {
    const fixture = TestBed.createComponent(BrowserDataNoticeComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('aside')?.getAttribute('aria-label')).toBe(
      'Saved in this browser',
    );
    expect(element.textContent).toContain('Clearing browser data');
  });
});
