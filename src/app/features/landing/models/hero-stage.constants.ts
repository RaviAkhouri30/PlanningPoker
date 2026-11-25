/** One seat at the hero's demo table. */
export interface IStageSeat {
  readonly name: string;
  readonly colour: number;
  readonly card: string;
  /** When its card flips in the loop, in ms. */
  readonly delay: number;
}

/** One card of the fanned hand under the table. */
export interface IFanCard {
  readonly card: string;
  readonly picked: boolean;
  readonly delay: number;
}

/** The demo table's top row (the design's Main.dc.html hero). */
export const STAGE_TOP: readonly IStageSeat[] = [
  { name: 'Maya Chen', colour: 1, card: '5', delay: 0 },
  { name: 'Jonah Reed', colour: 2, card: '5', delay: 120 },
  { name: 'Priya Nair', colour: 3, card: '8', delay: 240 },
];

/** The demo table's bottom row. */
export const STAGE_BOTTOM: readonly IStageSeat[] = [
  { name: 'Leo Marsh', colour: 4, card: '5', delay: 360 },
  { name: 'Sam Okafor', colour: 5, card: '3', delay: 480 },
  { name: 'Alex Kim', colour: 0, card: '8', delay: 600 },
];

/** The hand fanned below the table, with 5 picked. */
export const FAN: readonly IFanCard[] = [
  { card: '2', picked: false, delay: 0 },
  { card: '3', picked: false, delay: 300 },
  { card: '5', picked: true, delay: 600 },
  { card: '8', picked: false, delay: 900 },
  { card: '13', picked: false, delay: 1200 },
];

/** How long each "joined" toast owns the corner before the next person arrives, in ms. */
export const JOIN_SLOT_MS = 2500;

/** One "X joined via link" toast in the hero's join loop. */
export interface IStageJoin {
  readonly seat: IStageSeat;
  readonly label: string;
  /** When this toast's slot starts in the loop, in ms. */
  readonly delay: number;
}

/** Everyone at the demo table joins in turn: one toast at a time, each shown then hidden. */
export const STAGE_JOINS: readonly IStageJoin[] = [...STAGE_TOP, ...STAGE_BOTTOM].map(
  (seat, index) => ({
    seat,
    label: `${seat.name.split(' ').at(0) ?? seat.name} joined via link`,
    delay: index * JOIN_SLOT_MS,
  }),
);
