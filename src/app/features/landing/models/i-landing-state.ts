/** What the landing page's forms are doing. */
export interface ILandingState {
  /** A room is being created. */
  readonly creating: boolean;
  /** A code is being looked up. */
  readonly joining: boolean;
  /** Why the code can't be used, or `null`. */
  readonly codeError: string | null;
}

/** Nothing in progress, no errors. */
export const IDLE_LANDING: ILandingState = { creating: false, joining: false, codeError: null };
