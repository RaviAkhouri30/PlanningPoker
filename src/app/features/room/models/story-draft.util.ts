/** A story as typed into "Add a story…", split into its key and title. */
export interface IStoryDraft {
  readonly key: string;
  readonly title: string;
}

/** A tracker key at the start of the text, e.g. `PAY-214` or `#12`. */
const KEY_PATTERN = /^([A-Za-z][A-Za-z0-9]{0,9}-\d{1,6}|#\d{1,6})\s+(\S.*)$/;

/**
 * Reads "PAY-214 Save cards" as key `PAY-214` and title "Save cards". Text without a key gets
 * `#n`, where `n` is the story's place in the list.
 * @param text What was typed (already trimmed and not blank).
 * @param position The story's 1-based place in the list.
 */
export function parseStoryDraft(text: string, position: number): IStoryDraft {
  const [, key, title] = KEY_PATTERN.exec(text) ?? [];
  return key !== undefined && title !== undefined
    ? { key: key.toUpperCase(), title }
    : { key: `#${String(position)}`, title: text };
}
