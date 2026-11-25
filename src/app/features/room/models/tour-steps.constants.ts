import { TourTarget } from './tour-target.enum';

/** One stop on the room tour. */
export interface ITourStep {
  readonly target: TourTarget;
  readonly title: string;
  readonly text: string;
  /** Only the moderator has this part of the room. */
  readonly moderatorOnly: boolean;
}

/** The tour, in order. Players see the steps that aren't moderator-only. */
export const TOUR_STEPS: readonly ITourStep[] = [
  {
    target: TourTarget.Invite,
    title: 'Bring your team in',
    text: 'Share the link or the room code. People join with just a name, no account.',
    moderatorOnly: false,
  },
  {
    target: TourTarget.AddStory,
    title: 'Add what to estimate',
    text: 'Add stories here, one after another. Start with a ticket key, like PAY-214, to keep it.',
    moderatorOnly: true,
  },
  {
    target: TourTarget.Timer,
    title: 'The countdown',
    text: 'Each round counts down from a minute. A toast warns at 20 seconds, and at 00:00 voting closes until the moderator resets the timer.',
    moderatorOnly: false,
  },
  {
    target: TourTarget.Table,
    title: 'The table',
    text: 'Votes land here face down and flip together. Then everyone sees the average and how much the team agrees.',
    moderatorOnly: false,
  },
  {
    target: TourTarget.Deck,
    title: 'Your cards',
    text: 'Pick a card to vote, or the cup for a break. Pick it again to take it back before the flip.',
    moderatorOnly: false,
  },
  {
    target: TourTarget.Table,
    title: 'Settle the estimate',
    text: 'After the flip, accept the suggested card, pick another one, or type the value the team agreed on. Or vote again.',
    moderatorOnly: true,
  },
  {
    target: TourTarget.Moderator,
    title: 'Run the round',
    text: 'Reset the timer, flip, clear votes or skip a story. Set the countdown’s length, whether voting locks at 00:00, the deck and auto-reveal.',
    moderatorOnly: true,
  },
  {
    target: TourTarget.People,
    title: 'Who’s here',
    text: 'See who’s online and who has voted, without seeing their cards.',
    moderatorOnly: false,
  },
  {
    target: TourTarget.Stories,
    title: 'The stories',
    text: 'What’s next, what’s settled and every estimate so far. The moderator adds stories and picks the next one here.',
    moderatorOnly: false,
  },
  {
    target: TourTarget.TourButton,
    title: 'That’s it',
    text: 'Replay this tour any time from here. In the tour, the arrow keys move between steps and Escape closes it.',
    moderatorOnly: false,
  },
];

/** The preference that says this browser has shown the tour. */
export const TOUR_SEEN_KEY = 'planning-poker.room-tour';

/** Its value once shown; bump it to show a changed tour again. */
export const TOUR_SEEN_VALUE = 'v2';
