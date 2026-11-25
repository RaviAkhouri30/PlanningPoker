import { type Animal } from '@shared/enums/animal.enum';

/** The name and avatar this browser last used, offered again on the next form. */
export interface ILocalProfile {
  readonly name: string;
  readonly avatar: Animal;
}
