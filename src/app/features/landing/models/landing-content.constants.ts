import { IconName } from '@shared/enums/icon-name.enum';

/** One numbered step of "How it works". */
export interface IStep {
  readonly title: string;
  readonly text: string;
}

/** One feature card. */
export interface IFeature {
  readonly icon: IconName;
  readonly title: string;
  readonly text: string;
  readonly chips: readonly string[];
  /** Spans the grid's full width. */
  readonly wide: boolean;
}

/** One question of the FAQ. */
export interface IQuestion {
  readonly question: string;
  readonly answer: string;
}

/** One row of the comparison table. */
export interface IComparison {
  readonly feature: string;
  readonly ours: string;
  readonly typical: string;
}

/** Copy from the design's landing page (Main.dc.html). */
export const STEPS: readonly IStep[] = [
  {
    title: 'Enter your name',
    text: 'No email, no password. You become the moderator of a fresh room straight away.',
  },
  {
    title: 'Share the link',
    text: 'Paste it in Slack or Teams, or read out the six-character code. Teammates join as players or spectators.',
  },
  {
    title: 'Vote, flip, agree',
    text: 'Cards stay hidden until everyone has voted. Then they flip together and you accept the estimate in one click.',
  },
];

export const SMART_VOTING = {
  title: 'Smart voting',
  text: 'After the flip, PlanningPoker shows the average, the spread and an agreement score, suggests the nearest card, and names the two furthest-apart voters so the right people explain first.',
  chips: ['Average 5.5', '83% agreement', 'Suggested 5', 'Leo (3) vs Jonah (8): talk it out'],
} as const;

export const FEATURES: readonly IFeature[] = [
  {
    icon: IconName.Eye,
    title: 'Auto-reveal',
    text: 'Cards flip the moment the last player votes. Or turn it off and reveal when you are ready.',
    chips: [],
    wide: false,
  },
  {
    icon: IconName.Cards,
    title: 'Multiple scales',
    text: 'Switch decks mid-session without losing anyone.',
    chips: ['Modified Fibonacci', 'Fibonacci', 'T-shirt', 'Powers of 2'],
    wide: false,
  },
  {
    icon: IconName.Clock,
    title: 'Timer & moderator tools',
    text: 'Reset the timer, flip cards, clear votes or skip a story. Moderator controls stay out of everyone else’s way.',
    chips: [],
    wide: false,
  },
  {
    icon: IconName.Users,
    title: 'Players & spectators',
    text: 'Stakeholders can watch without a card in hand, and see who is still thinking at a glance.',
    chips: [],
    wide: false,
  },
];

export const GUEST_PERKS: readonly string[] = [
  'Create unlimited rooms instantly',
  'Shareable link and room code',
  'All decks, timer and smart voting',
  'Players and spectators',
];

export const ACCOUNT_PERKS: readonly string[] = [
  'Permanent rooms with the same link every sprint',
  'Full history of sessions and summaries',
  'Backlog and chat integrations',
  'Custom decks and team templates',
];

export const COMPARISONS: readonly IComparison[] = [
  { feature: 'Join without an account', ours: 'Yes', typical: 'Often requires sign-up' },
  {
    feature: 'Cards hidden until the flip',
    ours: 'Yes, enforced by the server',
    typical: 'Usually',
  },
  { feature: 'Smart voting & outlier hints', ours: 'Yes', typical: 'Rare' },
  { feature: 'Multiple scales', ours: 'Yes', typical: 'Usually' },
];

export const QUESTIONS: readonly IQuestion[] = [
  {
    question: 'Do I need an account?',
    answer:
      'No. Enter a name and you have a room and a link. Accounts, coming soon, add saved history and permanent rooms.',
  },
  {
    question: 'Can anyone see my vote before the reveal?',
    answer:
      'No. Others only see that you have voted, and the server refuses to hand out a card before its round is revealed.',
  },
  {
    question: 'Can people just watch?',
    answer: 'Yes. Join as a spectator to follow the session without a card in hand.',
  },
];
