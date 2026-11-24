import { TestBed } from '@angular/core/testing';
import { ConfettiBurstComponent } from './confetti-burst.component';

describe('ConfettiBurstComponent', () => {
  it('should scatter 26 decorative pieces', () => {
    const fixture = TestBed.createComponent(ConfettiBurstComponent);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelectorAll('.piece')).toHaveLength(26);
    expect(element.getAttribute('aria-hidden')).toBe('true');
  });
});
