import { TestBed } from '@angular/core/testing';
import { accessibleName, cardNamed } from '../../testing/room-fixtures';
import { CardDeckComponent } from './card-deck.component';

describe('CardDeckComponent', () => {
  it('should lift the picked card and emit picks', () => {
    const fixture = TestBed.createComponent(CardDeckComponent);
    fixture.componentRef.setInput('cards', ['1', '2', 'break']);
    fixture.componentRef.setInput('picked', '2');
    fixture.componentRef.setInput('enabled', true);
    fixture.componentRef.setInput('prompt', 'Pick your card');
    const pick = vi.fn();
    fixture.componentInstance.pick.subscribe(pick);
    fixture.detectChanges();
    const deck = fixture.nativeElement as HTMLElement;

    cardNamed(deck, 'Vote 1')?.click();
    const picked = deck.querySelector('.card--picked');

    expect(picked === null ? null : accessibleName(picked)).toBe('Vote 2');
    // The visible value is part of the name, for voice control (WCAG 2.5.3).
    expect(picked?.hasAttribute('aria-label')).toBe(false);
    expect(deck.querySelector('[aria-label="I need a break"] app-icon')).not.toBeNull();
    expect(pick).toHaveBeenCalledWith('1');
  });
});
