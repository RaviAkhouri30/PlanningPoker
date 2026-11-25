import { inject } from '@angular/core';
import { EMPTY, type Observable, tap } from 'rxjs';
import { IClipboardService } from '@core/interfaces/i-clipboard-service';
import { APP_ORIGIN } from '@core/tokens/app-origin.token';
import { type DeckType } from '@shared/enums/deck-type.enum';
import { ParticipantRole } from '@shared/enums/participant-role.enum';
import { ToastTone } from '@shared/enums/toast-tone.enum';
import { type Room } from '@shared/models/room.model';
import { type Story } from '@shared/models/story.model';
import { ParticipantsService } from '@shared/services/participants.service';
import { ToastService } from '@shared/services/toast.service';
import { type IRoomState, type StoryTab } from '../models/i-room-state';
import { ROOM_MESSAGES } from '../models/room-messages.constants';
import { RoomView } from '../models/room-view.builder';
import { parseStoryDraft } from '../models/story-draft.util';
import { ModerationService, activationWrites } from '../services/moderation.service';
import { StoriesService } from '../services/stories.service';
import { VotesService } from '../services/votes.service';
import { type IRoomAction } from './room.view-model';

/** What the commands read from and write to. */
export interface IRoomCommandHost {
  readonly roomId: string;
  readonly view: () => IRoomState;
  patch(change: Partial<IRoomState>): void;
}

/**
 * Every write the room page offers. Each checks the current state, then queues one action, so
 * a stale click (the round moved on) does nothing. Built in the view model's injection context.
 */
export class RoomCommands {
  private readonly votes = inject(VotesService);
  private readonly moderation = inject(ModerationService);
  private readonly stories = inject(StoriesService);
  private readonly participants = inject(ParticipantsService);
  private readonly clipboard = inject(IClipboardService);
  private readonly toast = inject(ToastService);
  private readonly origin = inject(APP_ORIGIN);

  /**
   * @param host The view model.
   * @param queue Runs an action after the ones before it.
   */
  public constructor(
    private readonly host: IRoomCommandHost,
    private readonly queue: (action: IRoomAction) => void,
  ) {}

  /** Plays `card`, or takes the vote back when it's the card already played. */
  public pick(card: string): void {
    const state = this.host.view();
    const room = state.room;
    if (
      room === null ||
      room.revealed ||
      RoomView.activeStory(state) === null ||
      !room.deck.has(card)
    ) {
      return;
    }
    const run =
      state.myCard === card
        ? (): Observable<void> => this.votes.retract(room.id, room.round, state.uid)
        : (): Observable<void> => this.votes.cast(room.id, room.round, state.uid, card);
    this.queue({ label: 'Voting', run });
  }

  /** Flips the cards. */
  public reveal(): void {
    this.moderate('Revealing', (room, state) => {
      const story = RoomView.activeStory(state);
      return story === null || room.revealed ? EMPTY : this.moderation.reveal(room, story);
    });
  }

  /** Clears the table for another vote on the same story. */
  public voteAgain(): void {
    this.moderate('Starting a new round', (room) => this.moderation.voteAgain(room));
  }

  /** Accepts `card` as the story's estimate and moves to the next story. */
  public accept(card: string): void {
    this.settle(card);
  }

  /** Skips the current story. */
  public skip(): void {
    this.settle(null);
  }

  /** Votes on `story` next. */
  public select(story: Story): void {
    this.moderate('Selecting a story', (room) =>
      room.activeStoryId === story.id ? EMPTY : this.moderation.select(room, story),
    );
  }

  /** Switches the deck. */
  public setDeck(deck: DeckType): void {
    this.moderate('Switching the deck', (room) =>
      room.deckType === deck ? EMPTY : this.moderation.setDeck(room, deck),
    );
  }

  /** Turns auto-reveal on or off. */
  public toggleAutoReveal(): void {
    this.moderate('Changing auto-reveal', (room) =>
      this.moderation.setAutoReveal(room, !room.autoReveal),
    );
  }

  /**
   * The moderator votes too, or only facilitates: as a spectator they don't vote, so auto-reveal
   * waits for the players alone.
   */
  public toggleVoting(): void {
    this.moderate('Changing how you take part', (room, state) => {
      const me = RoomView.me(state);
      if (me === null) {
        return EMPTY;
      }
      const role = me.isPlayer ? ParticipantRole.Spectator : ParticipantRole.Player;
      return this.participants.setRole(room.id, me.uid, role);
    });
  }

  /** Chooses whether new people join as spectators. */
  public toggleSpectatorsByDefault(): void {
    this.moderate('Changing the join role', (room) =>
      this.moderation.setSpectatorsByDefault(room, !room.spectatorsByDefault),
    );
  }

  /** Starts the timer again. */
  public resetTimer(): void {
    this.moderate('Resetting the timer', (room) => this.moderation.resetTimer(room));
  }

  /** Adds a story from "Add a story…"; the first one added becomes the current story. */
  public addStory(text: string): void {
    const title = text.trim();
    this.moderate('Adding a story', (room, state) => {
      if (title === '') {
        return EMPTY;
      }
      const draft = parseStoryDraft(title, state.stories.length + 1);
      const order = Math.max(0, ...state.stories.map((story) => story.order)) + 1;
      const needsActive = RoomView.activeStory(state) === null;
      return this.stories.add(room.id, draft, order, (id) =>
        needsActive ? activationWrites(room, id) : [],
      );
    });
  }

  /** Shows which stories the panel lists. */
  public showTab(storyTab: StoryTab): void {
    this.host.patch({ storyTab });
  }

  /** Opens or closes the invite dialog. */
  public setInviteOpen(inviteOpen: boolean): void {
    this.host.patch({ inviteOpen });
  }

  /** Copies the room's link. */
  public copyLink(): void {
    const url = `${this.origin}/r/${this.host.roomId}`;
    this.queue({
      label: 'Copying the link',
      run: () =>
        this.clipboard.copy(url).pipe(
          tap({
            next: () => {
              this.toast.show(ROOM_MESSAGES.linkCopied, ToastTone.Success);
            },
            error: () => {
              this.toast.show(ROOM_MESSAGES.copyFailed, ToastTone.Error);
            },
          }),
        ),
    });
  }

  private settle(card: string | null): void {
    this.moderate(card === null ? 'Skipping a story' : 'Accepting an estimate', (room, state) => {
      const story = RoomView.activeStory(state);
      return story === null
        ? EMPTY
        : this.moderation.settle(room, story, card, RoomView.nextStory(state));
    });
  }

  /** Queues a moderator-only write, reading the state when it runs, not when it was clicked. */
  private moderate(
    label: string,
    write: (room: Room, state: IRoomState) => Observable<unknown>,
  ): void {
    this.queue({
      label,
      run: () => {
        const state = this.host.view();
        const room = state.room;
        return room?.isModeratedBy(state.uid) === true ? write(room, state) : EMPTY;
      },
    });
  }
}
