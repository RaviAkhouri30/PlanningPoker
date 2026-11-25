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
    target: TourTarget.Table,
    title: 'The table',
    text: 'Votes land here face down. Nobody sees a card until they all flip together.',
    moderatorOnly: false,
  },
  {
    target: TourTarget.Deck,
    title: 'Your cards',
    text: 'Pick a card to vote. Tap it again to take it back before the flip.',
    moderatorOnly: false,
  },
  {
    target: TourTarget.Moderator,
    title: 'Run the round',
    text: 'Flip the cards, clear votes, skip a story, change the deck or turn auto-reveal off.',
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
    title: 'The story list',
    text: 'What’s next, what’s settled and every estimate so far.',
    moderatorOnly: false,
  },
  {
    target: TourTarget.TourButton,
    title: 'That’s it',
    text: 'Replay this tour any time from here.',
    moderatorOnly: false,
  },
];

/** The preference that says this browser has shown the tour. */
export const TOUR_SEEN_KEY = 'planning-poker.room-tour';

/** Its value once shown; bump it to show a changed tour again. */
export const TOUR_SEEN_VALUE = 'v1';
