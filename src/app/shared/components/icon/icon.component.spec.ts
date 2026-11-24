import { TestBed } from '@angular/core/testing';
import { IconName } from '@shared/enums/icon-name.enum';
import { IconComponent } from './icon.component';

describe('IconComponent', () => {
  function render(name: IconName, label = '') {
    const fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('name', name);
    fixture.componentRef.setInput('label', label);
    fixture.detectChanges();
    return (fixture.nativeElement as HTMLElement).querySelector('svg') as SVGElement;
  }

  it('should draw paths, circles and rects and hide a decorative icon', () => {
    const clock = render(IconName.Clock);
    expect(clock.querySelectorAll('circle, path')).toHaveLength(2);
    expect(clock.getAttribute('aria-hidden')).toBe('true');

    expect(render(IconName.Cards).querySelectorAll('rect')).toHaveLength(2);
  });

  it('should name the icon as an image when given a label', () => {
    const icon = render(IconName.Coffee, 'Break');

    expect(icon.getAttribute('role')).toBe('img');
    expect(icon.getAttribute('aria-label')).toBe('Break');
    expect(icon.getAttribute('aria-hidden')).toBeNull();
  });
});
