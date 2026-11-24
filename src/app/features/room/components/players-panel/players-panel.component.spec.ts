import { TestBed } from '@angular/core/testing';
import { TEST_NOW } from '@shared/testing/test-backend';
import { RoomView } from '../../models/room-view.builder';
import { aPerson, aState } from '../../testing/room-fixtures';
import { PlayersPanelComponent } from './players-panel.component';

describe('PlayersPanelComponent', () => {
  it('should list everyone with their status and who is away', () => {
    const state = aState({
      people: [
        aPerson('mod', { displayName: 'Alex Kim', votedRound: 1 }),
        aPerson('maya', { lastSeenAt: 0 }),
      ],
    });
    const fixture = TestBed.createComponent(PlayersPanelComponent);
    fixture.componentRef.setInput('seats', RoomView.seats(state, TEST_NOW));
    fixture.componentRef.setInput('votedCount', 1);
    fixture.componentRef.setInput('playerCount', 2);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('1 of 2 voted');
    expect(element.textContent).toContain('Alex Kim (you)');
    expect(element.querySelector('.person__status--voted app-icon')).not.toBeNull();
    expect(element.querySelector('.person--away')?.textContent).toContain('away');
  });
});
