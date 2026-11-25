import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { StoryTab } from './models/i-room-state';
import { type IRoomState, RoomStatus } from './models/i-room-state';
import { ROOM_MESSAGES } from './models/room-messages.constants';
import { RoomView } from './models/room-view.builder';
import { TourTarget } from './models/tour-target.enum';
import { AddStoryDialogComponent } from './components/add-story-dialog/add-story-dialog.component';
import { CardDeckComponent } from './components/card-deck/card-deck.component';
import { InviteDialogComponent } from './components/invite-dialog/invite-dialog.component';
import { ModeratorControlsComponent } from './components/moderator-controls/moderator-controls.component';
import { PlayersPanelComponent } from './components/players-panel/players-panel.component';
import { PokerTableComponent } from './components/poker-table/poker-table.component';
import { RoomHeaderComponent } from './components/room-header/room-header.component';
import { RoomTourComponent } from './components/room-tour/room-tour.component';
import { StoriesTableComponent } from './components/stories-table/stories-table.component';
import { StoryHeaderComponent } from './components/story-header/story-header.component';
import { RoomViewModel } from './view-models/room.view-model';

/** The live planning room. */
@Component({
  selector: 'app-room-page',
  imports: [
    RouterLink,
    RoomHeaderComponent,
    StoryHeaderComponent,
    PokerTableComponent,
    CardDeckComponent,
    ModeratorControlsComponent,
    PlayersPanelComponent,
    StoriesTableComponent,
    InviteDialogComponent,
    AddStoryDialogComponent,
    RoomTourComponent,
  ],
  templateUrl: './room-page.component.html',
  styleUrl: './room-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RoomViewModel],
})
export default class RoomPageComponent extends BaseComponent<IRoomState> {
  protected override readonly model = inject(RoomViewModel);
  protected readonly statuses = RoomStatus;
  protected readonly targets = TourTarget;

  protected readonly listed = computed(() =>
    RoomView.storiesFor(this.model.view(), this.model.view().storyTab),
  );
  protected readonly counts = computed(() => {
    const state = this.model.view();
    return {
      active: RoomView.storiesFor(state, StoryTab.Active).length,
      done: RoomView.storiesFor(state, StoryTab.Done).length,
      all: state.stories.length,
    };
  });
  // The deck is hidden once the cards flip, so its prompt only covers an open round.
  protected readonly prompt = computed(() => {
    if (this.model.activeStory() === null) {
      return ROOM_MESSAGES.addStory;
    }
    if (this.model.countdown.locked()) {
      return this.model.isModerator()
        ? ROOM_MESSAGES.votingClosedModerator
        : ROOM_MESSAGES.votingClosed;
    }
    if (!this.model.isVoting()) {
      return this.model.isModerator() ? ROOM_MESSAGES.facilitating : ROOM_MESSAGES.spectating;
    }
    return this.model.view().myCard === null ? ROOM_MESSAGES.pickCard : ROOM_MESSAGES.voteIn;
  });
}
