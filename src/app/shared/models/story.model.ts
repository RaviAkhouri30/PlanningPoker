import { type StoreFields } from '@core/interfaces/i-realtime-store';
import { StoryStatus } from '@shared/enums/story-status.enum';
import { FieldReader } from '@shared/utils/fields.util';

const STATUSES = Object.values(StoryStatus);

/** A story to estimate (`rooms/{roomId}/stories/{storyId}`). */
export class Story {
  public readonly key: string;
  public readonly title: string;
  public readonly description: string;
  public readonly order: number;
  public readonly status: StoryStatus;
  /** The accepted card, or `null` until accepted. */
  public readonly estimate: string | null;
  /** How many times its cards were revealed. */
  public readonly rounds: number;

  /**
   * @param id The story's id.
   * @param fields The stored document.
   */
  public constructor(
    public readonly id: string,
    fields: StoreFields,
  ) {
    this.key = FieldReader.text(fields, 'key');
    this.title = FieldReader.text(fields, 'title');
    this.description = FieldReader.text(fields, 'description');
    this.order = FieldReader.number(fields, 'order');
    this.status = FieldReader.oneOf(fields, 'status', STATUSES, StoryStatus.Pending);
    this.estimate = FieldReader.textOrNull(fields, 'estimate');
    this.rounds = FieldReader.number(fields, 'rounds');
  }

  /** Whether it still needs an estimate. */
  public get isPending(): boolean {
    return this.status === StoryStatus.Pending;
  }
}
