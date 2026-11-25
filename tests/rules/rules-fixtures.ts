import { type Firestore, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { STORE_PATHS } from '@shared/constants/store-paths.constants';

/** Documents and the batches the services commit, shared by the rules specs. */

/** What the emulator rejects a read or write with when the rules don't allow it. */
export const DENIED = { code: 'permission-denied' };
/** The room every spec works in. */
export const ROOM = 'sprint-42-aaaaaa';
/** That room's join code. */
export const CODE = 'X7K2-92';
/** The round the specs vote in: the first story opens round 2. */
export const ROUND = 2;

/** A room document as `RoomsService.create` writes it. */
export function room(): Record<string, unknown> {
  return {
    name: 'Sprint 42',
    code: CODE,
    moderatorUid: 'mod',
    moderatorName: 'Alex Kim',
    deck: 'mfib',
    autoReveal: true,
    spectatorsByDefault: false,
    activeStoryId: null,
    round: 1,
    revealed: false,
    roundStartedAt: serverTimestamp(),
    timerSeconds: 60,
    lockOnTimeUp: true,
    createdAt: serverTimestamp(),
  };
}

/** A seat document as `ParticipantsService.join` writes it. */
export function seat(role = 'player'): Record<string, unknown> {
  return {
    displayName: 'Alex Kim',
    colour: 0,
    role,
    avatar: 'fox',
    votedRound: null,
    joinedAt: serverTimestamp(),
    lastSeenAt: serverTimestamp(),
  };
}

/** A story document as `StoriesService.add` writes it. */
export function story(): Record<string, unknown> {
  return {
    key: 'PAY-214',
    title: 'Save cards',
    description: '',
    order: 1,
    status: 'pending',
    estimate: null,
    rounds: 0,
    createdAt: serverTimestamp(),
  };
}

/** The batch `RoomsService.create` commits. */
export function createRoom(db: Firestore, uid = 'mod', data = room()): Promise<void> {
  const batch = writeBatch(db);
  batch.set(doc(db, STORE_PATHS.room(ROOM)), data);
  batch.set(doc(db, STORE_PATHS.roomCode(CODE)), { roomId: ROOM });
  batch.set(doc(db, STORE_PATHS.participant(ROOM, uid)), seat());
  return batch.commit();
}

/** The batch `VotesService.cast` commits. */
export function cast(db: Firestore, uid: string, card: string, round = ROUND): Promise<void> {
  const batch = writeBatch(db);
  batch.set(doc(db, STORE_PATHS.vote(ROOM, round, uid)), {
    value: card,
    castAt: serverTimestamp(),
  });
  batch.update(doc(db, STORE_PATHS.participant(ROOM, uid)), { votedRound: round });
  return batch.commit();
}

/** The batch `ModerationService.reveal` commits. */
export function reveal(db: Firestore, round = ROUND): Promise<void> {
  const batch = writeBatch(db);
  batch.set(doc(db, STORE_PATHS.round(ROOM, round)), {
    storyId: 's1',
    revealed: true,
    revealedAt: serverTimestamp(),
  });
  batch.update(doc(db, STORE_PATHS.room(ROOM)), { revealed: true });
  batch.update(doc(db, STORE_PATHS.story(ROOM, 's1')), { rounds: 1 });
  return batch.commit();
}
