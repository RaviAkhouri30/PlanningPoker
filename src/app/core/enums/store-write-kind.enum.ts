/** What one write in an atomic commit does. */
export enum StoreWriteKind {
  /** Creates or replaces the whole document. */
  Set = 'set',
  /** Changes only the given fields; fails when the document doesn't exist. */
  Update = 'update',
  /** Deletes the document (succeeds when it doesn't exist). */
  Delete = 'delete',
}
