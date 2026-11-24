import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { aPerson, aRoom } from '../../testing/room-fixtures';
import { RoomHeaderComponent } from './room-header.component';

describe('RoomHeaderComponent', () => {
  it('should show the room, presence, code and timer, and ask for the invite', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(RoomHeaderComponent);
    fixture.componentRef.setInput('room', aRoom());
    fixture.componentRef.setInput('me', aPerson('mod'));
    fixture.componentRef.setInput('onlineCount', 3);
    fixture.componentRef.setInput('timer', '01:05');
    const invite = vi.fn();
    fixture.componentInstance.invite.subscribe(invite);
    fixture.detectChanges();
    const header = fixture.nativeElement as HTMLElement;

    header.querySelector<HTMLButtonElement>('.btn')?.click();

    expect(header.textContent).toContain('Sprint 42');
    expect(header.textContent).toContain('3 online · code AAAA-AA');
    expect(header.querySelector('[role="timer"]')?.textContent).toContain('01:05');
    expect(header.querySelector('app-avatar')).not.toBeNull();
    expect(invite).toHaveBeenCalled();
  });
});
