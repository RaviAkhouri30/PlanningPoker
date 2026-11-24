import { TestBed } from '@angular/core/testing';
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

    deck.querySelector<HTMLButtonElement>('[aria-label="Vote 1"]')?.click();

    expect(deck.querySelector('.card--picked')?.getAttribute('aria-label')).toBe('Vote 2');
    expect(deck.querySelector('[aria-label="I need a break"] app-icon')).not.toBeNull();
    expect(pick).toHaveBeenCalledWith('1');
  });
});
