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
  ): { element: HTMLElement; accept: ReturnType<typeof vi.fn>; again: ReturnType<typeof vi.fn> } {
    const fixture = TestBed.createComponent(ResultsPanelComponent);
    const ballots = cards.map((card, index) => ({
      voterName: `P${String(index)}`,
      isMine: index === 0,
      card,
    }));
    fixture.componentRef.setInput('stats', new VotingStats(deck, ballots));
    fixture.componentRef.setInput('isModerator', isModerator);
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
    element.querySelector<HTMLButtonElement>('.btn--ghost-dark')?.click();

    expect(element.querySelector('app-confetti-burst')).toBeNull();
    expect(element.querySelector('.hint')).not.toBeNull();
    expect(accept).toHaveBeenCalled();
    expect(again).toHaveBeenCalled();
  });

  it('should leave the decision to the moderator', () => {
    expect(render(['5'], false).element.textContent).toContain(
      'The moderator settles the estimate.',
    );
  });
});
