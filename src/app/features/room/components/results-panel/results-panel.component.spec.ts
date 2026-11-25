import { TestBed } from '@angular/core/testing';
import { Deck } from '@shared/models/deck.model';
import { DeckType } from '@shared/enums/deck-type.enum';
import { VotingStats } from '@shared/models/voting-stats.model';
import { ResultsPanelComponent } from './results-panel.component';

describe('ResultsPanelComponent', () => {
  const deck = new Deck(DeckType.ModifiedFibonacci);

  function render(
    cards: string[],
    isModerator: boolean,
    noVoteCount = 0,
  ): { element: HTMLElement; accept: ReturnType<typeof vi.fn>; again: ReturnType<typeof vi.fn> } {
    const fixture = TestBed.createComponent(ResultsPanelComponent);
    const ballots = cards.map((card, index) => ({
      voterName: `P${String(index)}`,
      isMine: index === 0,
      card,
    }));
    fixture.componentRef.setInput('stats', new VotingStats(deck, ballots));
    fixture.componentRef.setInput('isModerator', isModerator);
    fixture.componentRef.setInput('noVoteCount', noVoteCount);
    const accept = vi.fn();
    const again = vi.fn();
    fixture.componentInstance.accept.subscribe(accept);
    fixture.componentInstance.voteAgain.subscribe(again);
    fixture.detectChanges();
    return { element: fixture.nativeElement as HTMLElement, accept, again };
  }

  it('should celebrate a consensus and let the moderator accept it', () => {
    const { element, accept } = render(['5', '5'], true);

    element.querySelector<HTMLButtonElement>('.btn--primary')?.click();

    expect(element.querySelector('app-confetti-burst')).not.toBeNull();
    expect(element.querySelector('svg')?.getAttribute('aria-label')).toBe('100 percent agreement');
    expect(accept).toHaveBeenCalledWith('5');
  });

  it('should offer alternatives, a hint and another vote on a split', () => {
    const { element, accept, again } = render(['3', '13', '5'], true);

    element.querySelector<HTMLButtonElement>('.chip-btn')?.click();
    [...element.querySelectorAll<HTMLButtonElement>('button')]
      .find((button) => button.textContent.includes('Vote again'))
      ?.click();

    expect(element.querySelector('app-confetti-burst')).toBeNull();
    expect(element.querySelector('.hint')).not.toBeNull();
    expect(accept).toHaveBeenCalled();
    expect(again).toHaveBeenCalled();
  });

  it('should accept an estimate the moderator types when the votes did not settle it', () => {
    const { element, accept } = render(['3', '13'], true);
    const field = element.querySelector<HTMLInputElement>('#custom-estimate');

    if (field !== null) {
      field.value = '6';
      field.dispatchEvent(new Event('input'));
    }
    element.querySelector<HTMLFormElement>('app-custom-estimate form')?.requestSubmit();

    expect(accept).toHaveBeenCalledWith('6');
  });

  it('should leave the decision to the moderator', () => {
    const { element } = render(['5'], false);

    expect(element.textContent).toContain('The moderator settles the estimate.');
    expect(element.querySelector('app-custom-estimate')).toBeNull();
  });

  it('should colour each card by its third of the deck when the cards are flipped', () => {
    const rows = render(['1', '5', '20', '?'], false).element.querySelectorAll('.bars__row');

    expect([...rows].map((row) => row.getAttribute('data-band'))).toEqual([
      'low',
      'mid',
      'high',
      'none',
    ]);
  });

  it('should add a grey bar, capped at the longest, for players without a card', () => {
    const element = render(['5'], false, 3).element;
    const row = element.querySelector('.bars__row[data-band="none"]');

    expect(row?.textContent).toContain('No vote');
    expect(row?.querySelector<HTMLElement>('.bars__fill')?.style.width).toBe('100%');
  });

  it('should leave the grey bar out when everyone voted', () => {
    expect(render(['5'], false).element.querySelector('.bars__row[data-band="none"]')).toBeNull();
  });
});
