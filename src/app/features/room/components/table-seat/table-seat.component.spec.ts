import { TestBed } from '@angular/core/testing';
import { ScoreBand } from '@shared/enums/score-band.enum';
import { type ISeatView, SeatSlot } from '../../models/i-seat-view';
import { TableSeatComponent } from './table-seat.component';

describe('TableSeatComponent', () => {
  const seat: ISeatView = {
    uid: 'maya',
    shortName: 'Maya',
    fullName: 'Maya Chen',
    colour: 1,
    avatar: null,
    isMe: false,
    isPlayer: true,
    roleLabel: 'Player',
    online: true,
    slot: SeatSlot.Card,
    card: '5',
    band: ScoreBand.Mid,
    status: 'Voted 5',
    flipDelay: 110,
  };

  function render(change: Partial<ISeatView>, revealed = true): HTMLElement {
    const fixture = TestBed.createComponent(TableSeatComponent);
    fixture.componentRef.setInput('seat', { ...seat, ...change });
    fixture.componentRef.setInput('revealed', revealed);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should flip a revealed card face up', () => {
    const element = render({});

    expect(element.querySelector('.flip--up')?.textContent).toContain('5');
    expect(element.textContent).toContain('Maya');
  });

  it('should mark the seat with the colour band of its card when revealed', () => {
    expect(render({ band: ScoreBand.High }).dataset['band']).toBe('high');
  });

  it('should show the break card as a coffee cup', () => {
    expect(render({ card: 'break' }).querySelector('app-icon')).not.toBeNull();
  });

  it('should show thinking dots or a dash without a card', () => {
    expect(
      render({ slot: SeatSlot.Thinking, card: null }, false).querySelector('.dots'),
    ).not.toBeNull();
    expect(
      render({ slot: SeatSlot.Empty, card: null }).querySelector('.slot__empty')?.textContent,
    ).toContain('–');
  });
});
