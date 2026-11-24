import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BackgroundDirective } from './background.directive';
import { DelayDirective } from './delay.directive';
import { WidthPercentDirective } from './width-percent.directive';

@Component({
  selector: 'app-probe',
  imports: [DelayDirective, WidthPercentDirective, BackgroundDirective],
  template: '<i [appDelay]="110" [appWidthPercent]="40" appBackground="#DCD8FF"></i>',
})
class ProbeComponent {}

describe('style directives', () => {
  it('should set the delay variable, width and background', () => {
    const fixture = TestBed.createComponent(ProbeComponent);
    fixture.detectChanges();
    const element = (fixture.nativeElement as HTMLElement).querySelector('i')!;

    expect(element.style.getPropertyValue('--delay')).toBe('110ms');
    expect(element.style.width).toBe('40%');
    expect(element.style.backgroundColor).toBe('rgb(220, 216, 255)');
  });
});
