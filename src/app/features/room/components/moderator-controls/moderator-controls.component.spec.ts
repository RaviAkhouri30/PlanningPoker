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
    element.querySelector<HTMLButtonElement>('[aria-label="Auto-reveal"]')?.click();

    expect(calls).toEqual(['timer', 'reveal', 'again', 'skip', DeckType.TShirt, 'auto']);
    expect(element.querySelector('.deck--on')?.textContent).toContain('Modified Fibonacci');
    expect(element.querySelector('[aria-label="Auto-reveal"]')?.getAttribute('aria-checked')).toBe(
      'true',
    );
  });

  it('should ask for a countdown a step shorter or longer when the stepper is pressed', () => {
    const fixture = TestBed.createComponent(ModeratorControlsComponent);
    fixture.componentRef.setInput('room', aRoom({ timerSeconds: 90 }));
    const asked: number[] = [];
    fixture.componentInstance.timerChange.subscribe((seconds) => asked.push(seconds));
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    element.querySelector<HTMLButtonElement>('[aria-label="30 seconds shorter"]')?.click();
    element.querySelector<HTMLButtonElement>('[aria-label="30 seconds longer"]')?.click();

    expect(asked).toEqual([60, 120]);
    expect(element.querySelector('.stepper__value')?.textContent).toContain('01:30');
  });

  it('should disable the stepper at its limits when the countdown is shortest or longest', () => {
    const fixture = TestBed.createComponent(ModeratorControlsComponent);
    fixture.componentRef.setInput('room', aRoom({ timerSeconds: 30 }));
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const button = (label: string): HTMLButtonElement | null =>
      element.querySelector<HTMLButtonElement>(`[aria-label="30 seconds ${label}"]`);

    expect(button('shorter')?.disabled).toBe(true);
    expect(button('longer')?.disabled).toBe(false);
    fixture.componentRef.setInput('room', aRoom({ timerSeconds: 600 }));
    fixture.detectChanges();
    expect(button('longer')?.disabled).toBe(true);
  });

  it('should show the lock at time up and highlight "Reset timer" when time ran out', () => {
    const fixture = TestBed.createComponent(ModeratorControlsComponent);
    fixture.componentRef.setInput('room', aRoom({ lockOnTimeUp: false }));
    fixture.componentRef.setInput('timeUp', true);
    const toggled = vi.fn();
    fixture.componentInstance.lockToggle.subscribe(toggled);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const lock = element.querySelector<HTMLButtonElement>('[aria-label="Lock voting at time up"]');

    lock?.click();

    expect(lock?.getAttribute('aria-checked')).toBe('false');
    expect(toggled).toHaveBeenCalled();
    expect(element.querySelector('.control')?.classList).toContain('control--alert');
  });

  it('should keep the deck choice collapsed and name the current deck when first shown', () => {
    const fixture = TestBed.createComponent(ModeratorControlsComponent);
    fixture.componentRef.setInput('room', aRoom());
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    const details = element.querySelector('details');

    expect(details?.open).toBe(false);
    expect(details?.querySelector('summary')?.textContent).toContain('Modified Fibonacci');
  });

  it('should show whether the moderator votes and ask to switch', () => {
    const fixture = TestBed.createComponent(ModeratorControlsComponent);
    fixture.componentRef.setInput('room', aRoom());
    fixture.componentRef.setInput('voting', false);
    const toggled = vi.fn();
    fixture.componentInstance.votingToggle.subscribe(toggled);
    fixture.detectChanges();
    const voting = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '[aria-label="I vote too"]',
    );

    voting?.click();

    expect(voting?.getAttribute('aria-checked')).toBe('false');
    expect(toggled).toHaveBeenCalled();
  });
});
