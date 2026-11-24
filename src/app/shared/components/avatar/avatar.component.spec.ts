import { TestBed } from '@angular/core/testing';
import { AvatarComponent } from './avatar.component';

describe('AvatarComponent', () => {
  function render(inputs: Record<string, unknown>): HTMLElement {
    const fixture = TestBed.createComponent(AvatarComponent);
    for (const [key, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(key, value);
    }
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should show the initials in the chosen colour', () => {
    const avatar = render({ name: 'Maya Chen', colourIndex: 1, isMe: true, size: 'lg' });

    expect(avatar.textContent.trim()).toBe('MC');
    expect(avatar.style.getPropertyValue('--avatar-bg')).toBe('#FFE1D3');
    expect(avatar.classList).toContain('avatar--me');
    expect(avatar.classList).toContain('avatar--lg');
    expect(avatar.title).toBe('Maya Chen');
  });

  it('should use the first colour when the index is out of range', () => {
    expect(render({ name: 'A', colourIndex: 42 }).style.getPropertyValue('--avatar-bg')).toBe(
      '#DCD8FF',
    );
  });
});
