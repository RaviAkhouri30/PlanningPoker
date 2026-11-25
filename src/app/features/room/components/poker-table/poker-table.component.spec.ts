import { TestBed } from '@angular/core/testing';
import { DeckType } from '@shared/enums/deck-type.enum';
import { Deck } from '@shared/models/deck.model';
import { VotingStats } from '@shared/models/voting-stats.model';
import { type ISeatView, SeatSlot } from '../../models/i-seat-view';
import { ROOM_MESSAGES } from '../../models/room-messages.constants';
import { PokerTableComponent } from './poker-table.component';

function seat(uid: string): ISeatView {
  return {
    uid,
    shortName: uid,
    fullName: uid,
    colour: 0,
    isMe: false,
    isPlayer: true,
    roleLabel: 'Player',
    online: true,
    slot: SeatSlot.Thinking,
    card: null,
    status: '',
    flipDelay: 0,
  };
}

describe('PokerTableComponent', () => {
  function render(inputs: Record<string, unknown>): {
    element: HTMLElement;
    reveal: ReturnType<typeof vi.fn>;
  } {
    const fixture = TestBed.createComponent(PokerTableComponent);
    fixture.componentRef.setInput('seats', ['a', 'b', 'c', 'd'].map(seat));
    fixture.componentRef.setInput('hasStory', true);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    const reveal = vi.fn();
    fixture.componentInstance.reveal.subscribe(reveal);
    fixture.detectChanges();
    return { element: fixture.nativeElement as HTMLElement, reveal };
  }

  it('should seat three on top and the rest below, and count votes', () => {
    const { element, reveal } = render({ isModerator: true, votedCount: 4 });

    element.querySelector<HTMLButtonElement>('.btn--primary')?.click();

    expect(
      element.querySelectorAll('.table__row')[0]?.querySelectorAll('app-table-seat'),
    ).toHaveLength(3);
    expect(element.textContent).toContain(ROOM_MESSAGES.everyone);
    expect(element.querySelectorAll('.dot--on')).toHaveLength(4);
    expect(reveal).toHaveBeenCalled();
  });

  it('should tell others who flips, with auto-reveal off', () => {
    const { element } = render({ autoReveal: false, votedCount: 1 });

    expect(element.textContent).toContain(ROOM_MESSAGES.waiting);
    expect(element.textContent).toContain(ROOM_MESSAGES.waitingModerator);
    expect(element.querySelector('.btn--primary')).toBeNull();
  });

  it('should tell the moderator auto-reveal is off', () => {
    expect(render({ autoReveal: false, isModerator: true }).element.textContent).toContain(
      ROOM_MESSAGES.autoOff,
    );
  });

  it('should show results once revealed', () => {
    const stats = new VotingStats(new Deck(DeckType.Fibonacci), [
      { voterName: 'a', isMine: false, card: '5' },
    ]);

    expect(
      render({ revealed: true, stats }).element.querySelector('app-results-panel'),
    ).not.toBeNull();
  });

  it('should explain an empty table, and a finished session', () => {
    expect(render({ hasStory: false, isModerator: true }).element.textContent).toContain(
      'Add the first story',
    );
    expect(render({ hasStory: false }).element.textContent).toContain(
      'The moderator is adding the first story.',
    );
    expect(render({ hasStory: false, settledCount: 3 }).element.textContent).toContain(
      'Every story has an estimate',
    );
  });

  it('should offer the moderator a button to add the first story when the table is empty', () => {
    const fixture = TestBed.createComponent(PokerTableComponent);
    fixture.componentRef.setInput('seats', []);
    fixture.componentRef.setInput('isModerator', true);
    const addStory = vi.fn();
    fixture.componentInstance.addStory.subscribe(addStory);
    fixture.detectChanges();
    const button = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.empty .btn',
    );

    button?.click();

    expect(button?.textContent).toContain(ROOM_MESSAGES.addFirstStory);
    expect(addStory).toHaveBeenCalled();
  });

  it('should offer another story when every story has an estimate', () => {
    const { element } = render({ hasStory: false, isModerator: true, settledCount: 2 });

    expect(element.querySelector('.empty .btn')?.textContent).toContain(
      ROOM_MESSAGES.addAnotherStory,
    );
  });

  it('should not offer to add stories when the viewer is not the moderator', () => {
    expect(render({ hasStory: false }).element.querySelector('.empty .btn')).toBeNull();
  });
});
