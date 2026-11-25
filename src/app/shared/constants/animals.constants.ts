import { Animal } from '@shared/enums/animal.enum';
import { AnimalTone } from '@shared/enums/animal-tone.enum';

/** One layer of a face: a filled shape, or a stroked line, in one colour. */
export interface IFaceLayer {
  readonly d: string;
  readonly tone: AnimalTone;
  /** A stroke (mouths, whiskers) rather than a fill. */
  readonly line: boolean;
}

/** An avatar animal: its name, its usual seat colour and its face on a 64 × 64 grid. */
export interface IAnimalFace {
  readonly animal: Animal;
  readonly label: string;
  /** Index into `AVATAR_PALETTE`: the background it looks best on. */
  readonly colour: number;
  readonly layers: readonly IFaceLayer[];
}

/** Separates the layers of a face in `FACE_SOURCES`. */
const LAYER_SEPARATOR = ' | ';
/** Marks a stroked layer. */
const LINE_MARK = '~';
const TONES: ReadonlyMap<string, AnimalTone> = new Map(
  Object.values(AnimalTone).map((tone) => [tone, tone]),
);

/**
 * @param source Layers back to front, each `tone path` (`~tone path` for a line).
 * @returns The layers, in drawing order.
 */
function parseLayers(source: string): IFaceLayer[] {
  return source.split(LAYER_SEPARATOR).map((layer) => {
    const space = layer.indexOf(' ');
    const name = layer.slice(0, space);
    const line = name.startsWith(LINE_MARK);
    const toneName = line ? name.slice(LINE_MARK.length) : name;
    const tone = TONES.get(toneName) ?? AnimalTone.Dark;
    return { tone, line, d: layer.slice(space + 1) };
  });
}

/** A face before its layers are parsed. */
interface IFaceSource {
  readonly animal: Animal;
  readonly label: string;
  readonly colour: number;
  readonly source: string;
}

/**
 * The 16 faces, drawn as flat shapes on a 64 × 64 grid (circles and ellipses written as arcs,
 * one path per colour layer). Shapes, not markup, so avatars never need `innerHTML`.
 */
const FACE_SOURCES: readonly IFaceSource[] = [
  {
    animal: Animal.Fox,
    label: 'Fox',
    colour: 1,
    source:
      'orange M10 8L26 20L12 32ZM54 8L38 20L52 32Z | dark M14 14L22 21L15 27ZM50 14L42 21L49 27Z | orange M11 37a21 21 0 1 0 42 0a21 21 0 1 0 -42 0Z | cream M11 38Q32 32 53 38Q48 58 32 59Q16 58 11 38Z | dark M19.8 31a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0ZM37.8 31a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0Z | white M23 29.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0ZM41 29.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0Z | dark M28.8 43a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0Z',
  },
  {
    animal: Animal.Panda,
    label: 'Panda',
    colour: 2,
    source:
      'dark M7 17a8 8 0 1 0 16 0a8 8 0 1 0 -16 0ZM41 17a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z | white M9 36a23 23 0 1 0 46 0a23 23 0 1 0 -46 0Z | dark M16.5 34a6.5 8.5 0 1 0 13 0a6.5 8.5 0 1 0 -13 0ZM34.5 34a6.5 8.5 0 1 0 13 0a6.5 8.5 0 1 0 -13 0Z | white M20.6 33a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0ZM38.6 33a2.4 2.4 0 1 0 4.8 0a2.4 2.4 0 1 0 -4.8 0Z | dark M28 44a4 3 0 1 0 8 0a4 3 0 1 0 -8 0Z | pink M14 45a3 2 0 1 0 6 0a3 2 0 1 0 -6 0ZM44 45a3 2 0 1 0 6 0a3 2 0 1 0 -6 0Z',
  },
  {
    animal: Animal.Owl,
    label: 'Owl',
    colour: 3,
    source:
      'brown M10 10L25 18L14 27ZM54 10L39 18L50 27ZM9 37a23 24 0 1 0 46 0a23 24 0 1 0 -46 0Z | tan M18 45a14 13 0 1 0 28 0a14 13 0 1 0 -28 0Z | cream M14 31a9 9 0 1 0 18 0a9 9 0 1 0 -18 0ZM32 31a9 9 0 1 0 18 0a9 9 0 1 0 -18 0Z | dark M18.8 31a4.2 4.2 0 1 0 8.4 0a4.2 4.2 0 1 0 -8.4 0ZM36.8 31a4.2 4.2 0 1 0 8.4 0a4.2 4.2 0 1 0 -8.4 0Z | white M23 29.7a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0ZM41 29.7a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0Z | yellow M28.5 39L35.5 39L32 45Z',
  },
  {
    animal: Animal.Cat,
    label: 'Cat',
    colour: 4,
    source:
      'grey M11 10L28 22L12 34ZM53 10L36 22L52 34Z | pink M15 16L23 22L16 28ZM49 16L41 22L48 28Z | grey M11 38a21 21 0 1 0 42 0a21 21 0 1 0 -42 0Z | dark M20.8 35a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0ZM36.8 35a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0Z | white M24 33.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0ZM40 33.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0Z | pink M29 42L35 42L32 45.5Z | ~dark M32 45.5Q29 49 26 47.5M32 45.5Q35 49 38 47.5M13 41L21 42M13 46L21 45M51 41L43 42M51 46L43 45',
  },
  {
    animal: Animal.Frog,
    label: 'Frog',
    colour: 3,
    source:
      'green M10 22a10 10 0 1 0 20 0a10 10 0 1 0 -20 0ZM34 22a10 10 0 1 0 20 0a10 10 0 1 0 -20 0ZM7 40a25 18 0 1 0 50 0a25 18 0 1 0 -50 0Z | white M13.5 22a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0 -13 0ZM37.5 22a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0 -13 0Z | dark M16.6 23a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0ZM40.6 23a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0Z | pink M12 42a3 2 0 1 0 6 0a3 2 0 1 0 -6 0ZM46 42a3 2 0 1 0 6 0a3 2 0 1 0 -6 0Z | ~dark M21 44Q32 52 43 44',
  },
  {
    animal: Animal.Koala,
    label: 'Koala',
    colour: 0,
    source:
      'grey M2 25a11 11 0 1 0 22 0a11 11 0 1 0 -22 0ZM40 25a11 11 0 1 0 22 0a11 11 0 1 0 -22 0Z | grey-light M6.5 25a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0 -13 0ZM44.5 25a6.5 6.5 0 1 0 13 0a6.5 6.5 0 1 0 -13 0Z | grey M12 38a20 20 0 1 0 40 0a20 20 0 1 0 -40 0Z | dark M20.8 33a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0ZM36.8 33a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0Z | white M24 31.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0ZM40 31.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0Z | dark M27 43a5 6.5 0 1 0 10 0a5 6.5 0 1 0 -10 0Z',
  },
  {
    animal: Animal.Bear,
    label: 'Bear',
    colour: 2,
    source:
      'brown M7 17a8 8 0 1 0 16 0a8 8 0 1 0 -16 0ZM41 17a8 8 0 1 0 16 0a8 8 0 1 0 -16 0Z | tan M11 17a4 4 0 1 0 8 0a4 4 0 1 0 -8 0ZM45 17a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z | brown M10 37a22 22 0 1 0 44 0a22 22 0 1 0 -44 0Z | tan M22 45a10 7.5 0 1 0 20 0a10 7.5 0 1 0 -20 0Z | dark M19.8 33a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0ZM37.8 33a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0Z | white M23 31.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0ZM41 31.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0Z | dark M28.4 41.5a3.6 2.6 0 1 0 7.2 0a3.6 2.6 0 1 0 -7.2 0Z | ~dark M32 44L32 46.5M29 48Q32 50 35 48',
  },
  {
    animal: Animal.Rabbit,
    label: 'Rabbit',
    colour: 5,
    source:
      'grey-light M17.5 15a5.5 14 0 1 0 11 0a5.5 14 0 1 0 -11 0ZM35.5 15a5.5 14 0 1 0 11 0a5.5 14 0 1 0 -11 0Z | pink M20.4 15a2.6 10 0 1 0 5.2 0a2.6 10 0 1 0 -5.2 0ZM38.4 15a2.6 10 0 1 0 5.2 0a2.6 10 0 1 0 -5.2 0Z | grey-light M13 40a19 19 0 1 0 38 0a19 19 0 1 0 -38 0Z | dark M21.8 37a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0ZM35.8 37a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0Z | white M25 35.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0ZM39 35.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0Z | pink M17 44a3 2 0 1 0 6 0a3 2 0 1 0 -6 0ZM41 44a3 2 0 1 0 6 0a3 2 0 1 0 -6 0ZM29.5 43L34.5 43L32 46Z | ~dark M32 46Q30 49 28 48M32 46Q34 49 36 48',
  },
  {
    animal: Animal.Penguin,
    label: 'Penguin',
    colour: 4,
    source:
      'dark M8 36a24 24 0 1 0 48 0a24 24 0 1 0 -48 0Z | white M15 38a10 10 0 1 0 20 0a10 10 0 1 0 -20 0ZM29 38a10 10 0 1 0 20 0a10 10 0 1 0 -20 0ZM19 46a13 10 0 1 0 26 0a13 10 0 1 0 -26 0Z | dark M21.8 36a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0ZM35.8 36a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0Z | white M25 34.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0ZM39 34.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0Z | pink M16 45a3 2 0 1 0 6 0a3 2 0 1 0 -6 0ZM42 45a3 2 0 1 0 6 0a3 2 0 1 0 -6 0Z | orange M28 42L36 42L32 48Z',
  },
  {
    animal: Animal.Tiger,
    label: 'Tiger',
    colour: 2,
    source:
      'orange M8 17a7 7 0 1 0 14 0a7 7 0 1 0 -14 0ZM42 17a7 7 0 1 0 14 0a7 7 0 1 0 -14 0Z | dark M11.5 17a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0ZM45.5 17a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0Z | orange M10 37a22 22 0 1 0 44 0a22 22 0 1 0 -44 0Z | dark M28 15L32 24L36 15ZM10 32L19 35L10 38ZM54 32L45 35L54 38Z | cream M21 46a11 8 0 1 0 22 0a11 8 0 1 0 -22 0Z | dark M19.8 33a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0ZM37.8 33a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0Z | white M23 31.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0ZM41 31.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0Z | pink M29 42L35 42L32 45Z',
  },
  {
    animal: Animal.Lion,
    label: 'Lion',
    colour: 0,
    source:
      'mane M4 35a28 28 0 1 0 56 0a28 28 0 1 0 -56 0Z | yellow M13 22a5 5 0 1 0 10 0a5 5 0 1 0 -10 0ZM41 22a5 5 0 1 0 10 0a5 5 0 1 0 -10 0ZM13 37a19 19 0 1 0 38 0a19 19 0 1 0 -38 0Z | cream M23 45a9 6.5 0 1 0 18 0a9 6.5 0 1 0 -18 0Z | dark M21.8 34a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0ZM35.8 34a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0Z | white M25 32.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0ZM39 32.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0Z | dark M28.6 42a3.4 2.4 0 1 0 6.8 0a3.4 2.4 0 1 0 -6.8 0Z',
  },
  {
    animal: Animal.Monkey,
    label: 'Monkey',
    colour: 1,
    source:
      'brown M3.5 36a7.5 7.5 0 1 0 15 0a7.5 7.5 0 1 0 -15 0ZM45.5 36a7.5 7.5 0 1 0 15 0a7.5 7.5 0 1 0 -15 0Z | tan M7 36a4 4 0 1 0 8 0a4 4 0 1 0 -8 0ZM49 36a4 4 0 1 0 8 0a4 4 0 1 0 -8 0Z | brown M11 35a21 21 0 1 0 42 0a21 21 0 1 0 -42 0Z | tan M17 32a8 8 0 1 0 16 0a8 8 0 1 0 -16 0ZM31 32a8 8 0 1 0 16 0a8 8 0 1 0 -16 0ZM19 44a13 10 0 1 0 26 0a13 10 0 1 0 -26 0Z | dark M21.8 32a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0ZM35.8 32a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0Z | white M25 30.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0ZM39 30.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0Z | dark M28.3 42a1.2 1.6 0 1 0 2.4 0a1.2 1.6 0 1 0 -2.4 0ZM33.3 42a1.2 1.6 0 1 0 2.4 0a1.2 1.6 0 1 0 -2.4 0Z | ~dark M26 48Q32 52 38 48',
  },
  {
    animal: Animal.Pig,
    label: 'Pig',
    colour: 4,
    source:
      'pink M12 12L26 18L14 28ZM52 12L38 18L50 28ZM10 37a22 22 0 1 0 44 0a22 22 0 1 0 -44 0Z | pink-dark M22 45a10 7 0 1 0 20 0a10 7 0 1 0 -20 0Z | dark M26.7 45a1.8 2.6 0 1 0 3.6 0a1.8 2.6 0 1 0 -3.6 0ZM33.7 45a1.8 2.6 0 1 0 3.6 0a1.8 2.6 0 1 0 -3.6 0ZM19.8 33a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0ZM37.8 33a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0Z | white M23 31.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0ZM41 31.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0Z',
  },
  {
    animal: Animal.Whale,
    label: 'Whale',
    colour: 3,
    source:
      '~blue M32 18L32 9M32 13Q27 7 23 10M32 13Q37 7 41 10 | blue M6 40a26 18 0 1 0 52 0a26 18 0 1 0 -52 0Z | sky M14 48a18 8 0 1 0 36 0a18 8 0 1 0 -36 0Z | dark M18.8 37a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0ZM38.8 37a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0Z | white M22 35.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0ZM42 35.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0Z | pink M13 44a3 2 0 1 0 6 0a3 2 0 1 0 -6 0ZM45 44a3 2 0 1 0 6 0a3 2 0 1 0 -6 0Z | ~dark M26 44Q32 48 38 44',
  },
  {
    animal: Animal.Hedgehog,
    label: 'Hedgehog',
    colour: 5,
    source:
      'brown M6 44L9 28L15 32L17 16L25 24L32 10L39 24L47 16L49 32L55 28L58 44Z | tan M13 43a19 15 0 1 0 38 0a19 15 0 1 0 -38 0Z | dark M21.8 39a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0ZM35.8 39a3.2 3.2 0 1 0 6.4 0a3.2 3.2 0 1 0 -6.4 0Z | white M25 37.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0ZM39 37.8a1 1 0 1 0 2 0a1 1 0 1 0 -2 0Z | pink M17 46a3 2 0 1 0 6 0a3 2 0 1 0 -6 0ZM41 46a3 2 0 1 0 6 0a3 2 0 1 0 -6 0Z | dark M29 46a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z',
  },
  {
    animal: Animal.Raccoon,
    label: 'Raccoon',
    colour: 1,
    source:
      'grey M12 12L26 20L14 30ZM52 12L38 20L50 30ZM10 37a22 22 0 1 0 44 0a22 22 0 1 0 -44 0Z | dark M10 34Q20 26 32 32Q44 26 54 34Q50 42 42 40Q36 38 32 36Q28 38 22 40Q14 42 10 34Z | white M19.6 34a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0ZM37.6 34a3.4 3.4 0 1 0 6.8 0a3.4 3.4 0 1 0 -6.8 0Z | dark M21 34a2 2 0 1 0 4 0a2 2 0 1 0 -4 0ZM39 34a2 2 0 1 0 4 0a2 2 0 1 0 -4 0Z | white M23 46a9 7 0 1 0 18 0a9 7 0 1 0 -18 0Z | dark M29 43a3 3 0 1 0 6 0a3 3 0 1 0 -6 0Z',
  },
];

/** Every animal face, in picker order. */
export const ANIMAL_FACES: readonly IAnimalFace[] = FACE_SOURCES.map(
  ({ animal, label, colour, source }) => ({ animal, label, colour, layers: parseLayers(source) }),
);

/** Every animal, in picker order. */
export const ANIMALS: readonly Animal[] = ANIMAL_FACES.map((face) => face.animal);

/** @returns The face for `animal`, or `undefined` when there is none. */
export function animalFace(animal: Animal | null): IAnimalFace | undefined {
  return ANIMAL_FACES.find((face) => face.animal === animal);
}

/**
 * @param random A number in [0, 1), e.g. from `RANDOM`.
 * @returns The animal at that point of the list: a random default avatar.
 */
export function animalAt(random: number): Animal {
  return ANIMALS.at(Math.floor(random * ANIMALS.length)) ?? Animal.Fox;
}
