import { SERVER_TIME, type StoreFields } from '@core/interfaces/i-realtime-store';
import { type ISeatProfile } from '@shared/interfaces/i-seat-profile';

/**
 * @param profile The seat as chosen on the join form.
 * @returns A new participant document: not voted yet, joined and seen now.
 */
export function participantFields(profile: ISeatProfile): StoreFields {
  return {
    displayName: profile.displayName,
    colour: profile.colour,
    role: profile.role,
    avatar: profile.avatar,
    votedRound: null,
    joinedAt: SERVER_TIME,
    lastSeenAt: SERVER_TIME,
  };
}
