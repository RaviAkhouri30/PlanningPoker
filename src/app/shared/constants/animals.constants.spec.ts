import { Animal } from '@shared/enums/animal.enum';
import { AnimalTone } from '@shared/enums/animal-tone.enum';
import { ANIMAL_FACES, ANIMALS, animalAt, animalFace } from './animals.constants';

describe('animals.constants', () => {
  it('should hold one face per animal when the list is built', () => {
    expect(new Set(ANIMALS)).toEqual(new Set(Object.values(Animal)));
    expect(ANIMAL_FACES).toHaveLength(Object.values(Animal).length);
  });

  it('should parse every layer into a known tone and a path when the faces load', () => {
    const tones = new Set<string>(Object.values(AnimalTone));
    const layers = ANIMAL_FACES.flatMap((face) => face.layers);

    expect(layers.every((layer) => tones.has(layer.tone) && layer.d.startsWith('M'))).toBe(true);
  });

  it('should mark the stroked layers as lines when the source starts with a tilde', () => {
    const cat = animalFace(Animal.Cat);

    expect(cat?.layers.some((layer) => layer.line && layer.tone === AnimalTone.Dark)).toBe(true);
  });

  it('should find no face when there is no animal', () => {
    expect(animalFace(null)).toBeUndefined();
  });

  it('should pick the animal at the random point when given a number in [0, 1)', () => {
    expect(animalAt(0)).toBe(ANIMALS.at(0));
    expect(animalAt(0.999)).toBe(ANIMALS.at(-1));
  });

  it('should fall back to the fox when the random number is out of range', () => {
    expect(animalAt(2)).toBe(Animal.Fox);
  });
});
