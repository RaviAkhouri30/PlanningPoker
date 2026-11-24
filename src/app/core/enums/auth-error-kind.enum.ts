/** Why a sign-in failed, independent of the provider. */
export enum AuthErrorKind {
  /** No Firebase configuration, so sign-in can't be reached. */
  Unavailable = 'unavailable',
  /** The network failed or timed out. */
  Network = 'network',
  /** Anything else. */
  Unknown = 'unknown',
}
