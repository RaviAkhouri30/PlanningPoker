import { computed, inject } from '@angular/core';
import { IPreferenceStore } from '@core/interfaces/i-preference-store';
import { type IRoomState } from '../models/i-room-state';
import {
  type ITourStep,
  TOUR_SEEN_KEY,
  TOUR_SEEN_VALUE,
  TOUR_STEPS,
} from '../models/tour-steps.constants';

/** What the tour reads from and writes to. */
export interface IRoomTourHost {
  readonly view: () => IRoomState;
  readonly isModerator: () => boolean;
  patch(change: Partial<IRoomState>): void;
}

/** The step on screen, with its place in the tour. */
export interface ITourProgress {
  readonly step: ITourStep;
  /** 1-based. */
  readonly number: number;
  readonly total: number;
}

/**
 * The guided room tour. It opens by itself once per browser, for the moderator only (the owner's
 * choice, AIDLC 0004); anyone can replay it. Built in the view model's injection context.
 */
export class RoomTour {
  /** The steps for this person: players skip the moderator's. */
  public readonly steps = computed(() =>
    TOUR_STEPS.filter((step) => !step.moderatorOnly || this.host.isModerator()),
  );

  /** The step on screen, or `null` when the tour is closed. */
  public readonly progress = computed((): ITourProgress | null => {
    const index = this.host.view().tourStep;
    const step = index === null ? undefined : this.steps().at(index);
    return index === null || step === undefined
      ? null
      : { step, number: index + 1, total: this.steps().length };
  });

  private readonly preferences = inject(IPreferenceStore);
  /** Whether the first-visit check has run on this page. */
  private offered = false;

  /** @param host The view model. */
  public constructor(private readonly host: IRoomTourHost) {}

  /** Opens the tour the first time the moderator is in a room in this browser. */
  public offer(): void {
    if (this.offered || this.host.view().room === null) {
      return;
    }
    this.offered = true;
    if (this.host.isModerator() && this.preferences.read(TOUR_SEEN_KEY) !== TOUR_SEEN_VALUE) {
      this.start();
    }
  }

  /** Opens the tour at its first step, and remembers that it was shown. */
  public start(): void {
    this.preferences.write(TOUR_SEEN_KEY, TOUR_SEEN_VALUE);
    this.host.patch({ tourStep: 0 });
  }

  /** Goes to the next step, or closes the tour after the last one. */
  public next(): void {
    const index = this.host.view().tourStep;
    if (index === null) {
      return;
    }
    this.host.patch({ tourStep: index + 1 < this.steps().length ? index + 1 : null });
  }

  /** Goes back a step. */
  public back(): void {
    const index = this.host.view().tourStep;
    if (index !== null && index > 0) {
      this.host.patch({ tourStep: index - 1 });
    }
  }

  /** Closes the tour. */
  public close(): void {
    this.host.patch({ tourStep: null });
  }
}
