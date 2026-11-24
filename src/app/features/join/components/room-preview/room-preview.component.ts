import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AvatarComponent } from '@shared/components/avatar/avatar.component';
import { ParticipantRole } from '@shared/enums/participant-role.enum';
import { type ISeatProfile } from '@shared/interfaces/i-seat-profile';
import { type Participant } from '@shared/models/participant.model';
import { type Room } from '@shared/models/room.model';
import { JOIN_MESSAGES, PREVIEW_FACES } from '../../models/join-messages.constants';

/** The dark card on the join page: the room, who is in it, and the seat being chosen. */
@Component({
  selector: 'app-room-preview',
  imports: [AvatarComponent],
  templateUrl: './room-preview.component.html',
  styleUrl: './room-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomPreviewComponent {
  /** The room being joined. */
  public readonly room = input.required<Room>();
  /** Everyone already in it. */
  public readonly people = input.required<readonly Participant[]>();
  /** The seat as chosen so far. */
  public readonly seat = input.required<ISeatProfile>();

  protected readonly faces = computed(() => this.people().slice(0, PREVIEW_FACES));
  protected readonly headcount = computed(() => {
    const count = this.people().length;
    return count === 1 ? '1 person is in the room' : `${String(count)} people are in the room`;
  });
  protected readonly seatName = computed(
    () => this.seat().displayName || JOIN_MESSAGES.namePlaceholder,
  );
  protected readonly roleLabel = computed(() =>
    this.seat().role === ParticipantRole.Spectator ? JOIN_MESSAGES.spectator : JOIN_MESSAGES.player,
  );
}
