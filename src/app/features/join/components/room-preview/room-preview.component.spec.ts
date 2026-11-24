import { TestBed } from '@angular/core/testing';
import { ParticipantRole } from '@shared/enums/participant-role.enum';
import { Participant } from '@shared/models/participant.model';
import { Room } from '@shared/models/room.model';
import { participantFields, roomFields } from '@shared/testing/test-backend';
import { RoomPreviewComponent } from './room-preview.component';

describe('RoomPreviewComponent', () => {
  function render(people: number, displayName: string, role: ParticipantRole): HTMLElement {
    const fixture = TestBed.createComponent(RoomPreviewComponent);
    fixture.componentRef.setInput('room', new Room('r1', roomFields()));
    fixture.componentRef.setInput(
      'people',
      Array.from(
        { length: people },
        (_, index) => new Participant(`p${String(index)}`, participantFields()),
      ),
    );
    fixture.componentRef.setInput('seat', { displayName, colour: 2, role });
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should stack at most five faces and count everyone', () => {
    const preview = render(7, 'Jordan', ParticipantRole.Player);

    expect(preview.querySelectorAll('.preview__face')).toHaveLength(5);
    expect(preview.textContent).toContain('7 people are in the room');
    expect(preview.querySelector('.seat-card')?.textContent).toContain('Player');
  });

  it('should read well for one person, no name yet and a spectator', () => {
    const preview = render(1, '', ParticipantRole.Spectator);

    expect(preview.textContent).toContain('1 person is in the room');
    expect(preview.querySelector('.seat-card')?.textContent).toContain('Your name');
    expect(preview.querySelector('.seat-card')?.textContent).toContain('Spectator');
  });

  it('should leave out the faces of an empty room', () => {
    expect(
      render(0, 'Jordan', ParticipantRole.Player).querySelector('.preview__people'),
    ).toBeNull();
  });
});
