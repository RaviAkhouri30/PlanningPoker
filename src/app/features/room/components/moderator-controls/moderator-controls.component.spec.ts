import { TestBed } from '@angular/core/testing';
import { DeckType } from '@shared/enums/deck-type.enum';
import { aRoom } from '../../testing/room-fixtures';
import { ModeratorControlsComponent } from './moderator-controls.component';

describe('ModeratorControlsComponent', () => {
  it('should emit each control, the deck pick and the auto-reveal switch', () => {
    const fixture = TestBed.createComponent(ModeratorControlsComponent);
    fixture.componentRef.setInput('room', aRoom());
    fixture.componentRef.setInput('hasStory', true);
    fixture.componentRef.setInput('votedCount', 1);
    const calls: string[] = [];
    const component = fixture.componentInstance;
    component.resetTimer.subscribe(() => calls.push('timer'));
    component.reveal.subscribe(() => calls.push('reveal'));
    component.voteAgain.subscribe(() => calls.push('again'));
    component.skip.subscribe(() => calls.push('skip'));
    component.deckPick.subscribe((deck) => calls.push(deck));
    component.autoRevealToggle.subscribe(() => calls.push('auto'));
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    element.querySelectorAll<HTMLButtonElement>('.control').forEach((button) => {
      button.click();
    });
    element.querySelectorAll<HTMLButtonElement>('.deck')[2]?.click();
    element.querySelector<HTMLButtonElement>('.switch')?.click();

    expect(calls).toEqual(['timer', 'reveal', 'again', 'skip', DeckType.TShirt, 'auto']);
    expect(element.querySelector('.deck--on')?.textContent).toContain('Modified Fibonacci');
    expect(element.querySelector('.switch')?.getAttribute('aria-checked')).toBe('true');
  });
});
