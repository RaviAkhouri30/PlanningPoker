import { ChangeDetectionStrategy, Component, computed, inject, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { StoryTab } from './models/i-room-state';
import { type IRoomState, RoomStatus } from './models/i-room-state';
import { ROOM_MESSAGES } from './models/room-messages.constants';
import { RoomView } from './models/room-view.builder';
import { CardDeckComponent } from './components/card-deck/card-deck.component';
import { InviteDialogComponent } from './components/invite-dialog/invite-dialog.component';
import { ModeratorControlsComponent } from './components/moderator-controls/moderator-controls.component';
import { PlayersPanelComponent } from './components/players-panel/players-panel.component';
import { PokerTableComponent } from './components/poker-table/poker-table.component';
import { RoomHeaderComponent } from './components/room-header/room-header.component';
import { StoriesPanelComponent } from './components/stories-panel/stories-panel.component';
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
    StoriesPanelComponent,
    InviteDialogComponent,
  ],
  templateUrl: './room-page.component.html',
  styleUrl: './room-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [RoomViewModel],
})
export default class RoomPageComponent extends BaseComponent<IRoomState> {
  protected override readonly model = inject(RoomViewModel);
  protected readonly statuses = RoomStatus;

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
  protected readonly prompt = computed(() => {
    const room = this.model.view().room;
    if (this.model.activeStory() === null) {
      return ROOM_MESSAGES.addStory;
    }
    if (this.model.me()?.isPlayer !== true) {
      return ROOM_MESSAGES.spectating;
    }
    if (room?.revealed === true) {
      return ROOM_MESSAGES.revealed;
    }
    return this.model.view().myCard === null ? ROOM_MESSAGES.pickCard : ROOM_MESSAGES.voteIn;
  });

  private readonly storiesPanel = viewChild(StoriesPanelComponent);

  /** "Add story" in the header or on the empty table: a view-only jump to the story field. */
  protected focusStoryField(): void {
    this.storiesPanel()?.focusDraft();
  }
}
