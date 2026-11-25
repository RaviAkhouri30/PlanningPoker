/** What the "Add a story" dialog sends: the typed line and optional notes. */
export interface INewStory {
  /** e.g. "PAY-214 Save cards". */
  readonly text: string;
  readonly description: string;
}

/** A story as typed into "Add a story", split into its key and title, with its notes. */
export interface IStoryDraft {
  readonly key: string;
  readonly title: string;
  readonly description: string;
}

/** A tracker key at the start of the text, e.g. `PAY-214` or `#12`. */
const KEY_PATTERN = /^([A-Za-z][A-Za-z0-9]{0,9}-\d{1,6}|#\d{1,6})\s+(\S.*)$/;

/**
 * Reads "PAY-214 Save cards" as key `PAY-214` and title "Save cards". Text without a key gets
 * `#n`, where `n` is the story's place in the list.
 * @param text What was typed (already trimmed and not blank).
 * @param position The story's 1-based place in the list.
 * @param description Optional notes, kept as typed apart from trimming.
 */
export function parseStoryDraft(text: string, position: number, description = ''): IStoryDraft {
  const [, key, title] = KEY_PATTERN.exec(text) ?? [];
  return key !== undefined && title !== undefined
    ? { key: key.toUpperCase(), title, description: description.trim() }
    : { key: `#${String(position)}`, title: text, description: description.trim() };
}
