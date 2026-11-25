import { readFileSync } from 'node:fs';
import { type RulesTestEnvironment, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import {
  type Firestore,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { STORE_PATHS } from '@shared/constants/store-paths.constants';

/** What the emulator rejects a read or write with when the rules don't allow it. */
const DENIED = { code: 'permission-denied' };

/** Runs against the emulator started by `npm run test:rules` (project `demo-planning-poker`). */
describe('firestore.rules · rooms', () => {
  const ROOM = 'sprint-42-aaaaaa';
  const CODE = 'X7K2-92';
  let env: RulesTestEnvironment;

  /** Signed-in clients: the moderator, a player, a spectator and a stranger (not in the room). */
  let mod: Firestore;
  let maya: Firestore;
  let sam: Firestore;
  let stranger: Firestore;
  let visitor: Firestore;

  function room(): Record<string, unknown> {
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
      createdAt: serverTimestamp(),
    };
  }

  function seat(role = 'player'): Record<string, unknown> {
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

  function story(): Record<string, unknown> {
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
  function createRoom(db: Firestore, uid = 'mod', data = room()): Promise<void> {
    const batch = writeBatch(db);
    batch.set(doc(db, STORE_PATHS.room(ROOM)), data);
    batch.set(doc(db, STORE_PATHS.roomCode(CODE)), { roomId: ROOM });
    batch.set(doc(db, STORE_PATHS.participant(ROOM, uid)), seat());
    return batch.commit();
  }

  /** The batch `VotesService.cast` commits. */
  function cast(db: Firestore, uid: string, card: string, round = 2): Promise<void> {
    const batch = writeBatch(db);
    batch.set(doc(db, STORE_PATHS.vote(ROOM, round, uid)), {
      value: card,
      castAt: serverTimestamp(),
    });
    batch.update(doc(db, STORE_PATHS.participant(ROOM, uid)), { votedRound: round });
    return batch.commit();
  }

  /** The batch `ModerationService.reveal` commits. */
  function reveal(db: Firestore, round = 2): Promise<void> {
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

  beforeAll(async () => {
    env = await initializeTestEnvironment({
      projectId: 'demo-planning-poker',
      firestore: { rules: readFileSync('firestore.rules', 'utf8') },
    });
  });

  beforeEach(async () => {
    await env.clearFirestore();
    mod = env.authenticatedContext('mod').firestore() as unknown as Firestore;
    maya = env.authenticatedContext('maya').firestore() as unknown as Firestore;
    sam = env.authenticatedContext('sam').firestore() as unknown as Firestore;
    stranger = env.authenticatedContext('stranger').firestore() as unknown as Firestore;
    visitor = env.unauthenticatedContext().firestore() as unknown as Firestore;
  });

  afterAll(async () => {
    await env.cleanup();
  });

  describe('creating a room', () => {
    it('should let a guest create a room with its code and their seat', async () => {
      await expect(createRoom(mod)).resolves.not.toEqual(DENIED);
      await expect(getDoc(doc(stranger, STORE_PATHS.roomCode(CODE)))).resolves.not.toEqual(DENIED);
      await expect(getDoc(doc(stranger, STORE_PATHS.room(ROOM)))).resolves.not.toEqual(DENIED);
    });

    it('should refuse a room for someone else, a bad shape or without its code', async () => {
      await expect(
        createRoom(mod, 'mod', { ...room(), moderatorUid: 'maya' }),
      ).rejects.toMatchObject(DENIED);
      await expect(createRoom(mod, 'mod', { ...room(), round: 2 })).rejects.toMatchObject(DENIED);
      await expect(createRoom(mod, 'mod', { ...room(), deck: 'tarot' })).rejects.toMatchObject(
        DENIED,
      );
      await expect(createRoom(mod, 'mod', { ...room(), extra: true })).rejects.toMatchObject(
        DENIED,
      );
      await expect(setDoc(doc(mod, STORE_PATHS.room(ROOM)), room())).rejects.toMatchObject(DENIED);
    });

    it('should refuse visitors, room listing and taking over a code', async () => {
      await expect(createRoom(visitor)).rejects.toMatchObject(DENIED);
      await createRoom(mod);
      await expect(getDoc(doc(visitor, STORE_PATHS.room(ROOM)))).rejects.toMatchObject(DENIED);
      await expect(getDocs(collection(stranger, 'rooms'))).rejects.toMatchObject(DENIED);
      await expect(
        setDoc(doc(stranger, STORE_PATHS.roomCode(CODE)), { roomId: 'mine' }),
      ).rejects.toMatchObject(DENIED);
    });
  });

  describe('in a room', () => {
    beforeEach(async () => {
      await createRoom(mod);
      await expect(
        setDoc(doc(maya, STORE_PATHS.participant(ROOM, 'maya')), seat()),
      ).resolves.not.toEqual(DENIED);
      await expect(
        setDoc(doc(sam, STORE_PATHS.participant(ROOM, 'sam')), seat('spectator')),
      ).resolves.not.toEqual(DENIED);
      // The first story, made active in a new round (StoriesService.add + activationWrites).
      const batch = writeBatch(mod);
      batch.set(doc(mod, STORE_PATHS.story(ROOM, 's1')), story());
      batch.update(doc(mod, STORE_PATHS.room(ROOM)), {
        activeStoryId: 's1',
        round: 2,
        revealed: false,
        roundStartedAt: serverTimestamp(),
      });
      await expect(batch.commit()).resolves.not.toEqual(DENIED);
    });

    it('should let anyone signed in see who is in the room, and only people in it read stories', async () => {
      await expect(
        getDocs(collection(stranger, STORE_PATHS.participants(ROOM))),
      ).resolves.not.toEqual(DENIED);
      await expect(getDocs(collection(maya, STORE_PATHS.stories(ROOM)))).resolves.not.toEqual(
        DENIED,
      );
      await expect(getDocs(collection(stranger, STORE_PATHS.stories(ROOM)))).rejects.toMatchObject(
        DENIED,
      );
    });

    it('should let people change only their own seat', async () => {
      const mine = doc(maya, STORE_PATHS.participant(ROOM, 'maya'));
      await expect(
        updateDoc(mine, { displayName: 'Maya', colour: 3, lastSeenAt: serverTimestamp() }),
      ).resolves.not.toEqual(DENIED);
      await expect(updateDoc(mine, { colour: 9 })).rejects.toMatchObject(DENIED);
      await expect(updateDoc(mine, { joinedAt: serverTimestamp() })).rejects.toMatchObject(DENIED);
      await expect(
        updateDoc(doc(maya, STORE_PATHS.participant(ROOM, 'sam')), { displayName: 'Hacked' }),
      ).rejects.toMatchObject(DENIED);
      await expect(
        setDoc(doc(maya, STORE_PATHS.participant(ROOM, 'other')), seat()),
      ).rejects.toMatchObject(DENIED);
    });

    it('should take an avatar from the animal list only, and seats without one', async () => {
      const mine = doc(maya, STORE_PATHS.participant(ROOM, 'maya'));
      await expect(updateDoc(mine, { avatar: 'owl' })).resolves.not.toEqual(DENIED);
      await expect(updateDoc(mine, { avatar: 'dragon' })).rejects.toMatchObject(DENIED);
      await expect(updateDoc(mine, { avatar: 7 })).rejects.toMatchObject(DENIED);
      // A seat from before avatars: no avatar field at all.
      const older = seat();
      delete older['avatar'];
      await expect(
        setDoc(doc(stranger, STORE_PATHS.participant(ROOM, 'stranger')), older),
      ).resolves.not.toEqual(DENIED);
      await expect(
        setDoc(doc(stranger, STORE_PATHS.participant(ROOM, 'stranger')), {
          ...seat(),
          avatar: '<img>',
        }),
      ).rejects.toMatchObject(DENIED);
    });

    it('should let the moderator change a role, and no one else change the room', async () => {
      await expect(
        updateDoc(doc(mod, STORE_PATHS.participant(ROOM, 'sam')), { role: 'player' }),
      ).resolves.not.toEqual(DENIED);
      await expect(
        updateDoc(doc(maya, STORE_PATHS.room(ROOM)), { autoReveal: false }),
      ).rejects.toMatchObject(DENIED);
      await expect(setDoc(doc(maya, STORE_PATHS.story(ROOM, 's2')), story())).rejects.toMatchObject(
        DENIED,
      );
      await expect(
        updateDoc(doc(mod, STORE_PATHS.room(ROOM)), { autoReveal: false }),
      ).resolves.not.toEqual(DENIED);
    });

    it('should keep the room’s identity and its round order', async () => {
      const ref = doc(mod, STORE_PATHS.room(ROOM));
      await expect(updateDoc(ref, { code: 'AAAA-AA' })).rejects.toMatchObject(DENIED);
      await expect(updateDoc(ref, { moderatorUid: 'maya' })).rejects.toMatchObject(DENIED);
      await expect(
        updateDoc(ref, { round: 5, revealed: false, roundStartedAt: serverTimestamp() }),
      ).rejects.toMatchObject(DENIED);
      await expect(updateDoc(ref, { revealed: true })).rejects.toMatchObject(DENIED);
      await expect(updateDoc(ref, { activeStoryId: 'missing' })).rejects.toMatchObject(DENIED);
      await expect(updateDoc(ref, { roundStartedAt: serverTimestamp() })).resolves.not.toEqual(
        DENIED,
      );
    });

    it('should let players vote with a card of the deck, marking their seat', async () => {
      // A vote must mark the seat with its round in the same batch.
      await expect(
        setDoc(doc(maya, STORE_PATHS.vote(ROOM, 2, 'maya')), {
          value: '5',
          castAt: serverTimestamp(),
        }),
      ).rejects.toMatchObject(DENIED);
      await expect(cast(maya, 'maya', '5')).resolves.not.toEqual(DENIED);
      await expect(cast(maya, 'maya', '8')).resolves.not.toEqual(DENIED);
      await expect(cast(maya, 'maya', 'XL')).rejects.toMatchObject(DENIED);
      await expect(cast(maya, 'maya', '5', 1)).rejects.toMatchObject(DENIED);
      await expect(cast(sam, 'sam', '5')).rejects.toMatchObject(DENIED);
      await expect(cast(maya, 'mod', '5')).rejects.toMatchObject(DENIED);
    });

    it('should keep votes secret until the round is revealed', async () => {
      await cast(maya, 'maya', '5');
      await cast(mod, 'mod', '8');

      await expect(getDoc(doc(maya, STORE_PATHS.vote(ROOM, 2, 'maya')))).resolves.not.toEqual(
        DENIED,
      );
      await expect(getDoc(doc(mod, STORE_PATHS.vote(ROOM, 2, 'maya')))).rejects.toMatchObject(
        DENIED,
      );
      await expect(getDocs(collection(mod, STORE_PATHS.votes(ROOM, 2)))).rejects.toMatchObject(
        DENIED,
      );

      await expect(reveal(mod)).resolves.not.toEqual(DENIED);

      await expect(getDocs(collection(mod, STORE_PATHS.votes(ROOM, 2)))).resolves.not.toEqual(
        DENIED,
      );
      await expect(getDocs(collection(sam, STORE_PATHS.votes(ROOM, 2)))).resolves.not.toEqual(
        DENIED,
      );
      await expect(getDocs(collection(stranger, STORE_PATHS.votes(ROOM, 2)))).rejects.toMatchObject(
        DENIED,
      );
    });

    it('should close a round once it is revealed', async () => {
      await cast(maya, 'maya', '5');
      await reveal(mod);

      await expect(cast(maya, 'maya', '8')).rejects.toMatchObject(DENIED);
      await expect(deleteDoc(doc(maya, STORE_PATHS.vote(ROOM, 2, 'maya')))).rejects.toMatchObject(
        DENIED,
      );
      await expect(reveal(mod)).rejects.toMatchObject(DENIED);
    });

    it('should let only the moderator reveal, and only the current round', async () => {
      await expect(reveal(maya)).rejects.toMatchObject(DENIED);
      await expect(reveal(mod, 1)).rejects.toMatchObject(DENIED);
    });

    it('should let players take a vote back while the round is open', async () => {
      await cast(maya, 'maya', '5');

      const batch = writeBatch(maya);
      batch.delete(doc(maya, STORE_PATHS.vote(ROOM, 2, 'maya')));
      batch.update(doc(maya, STORE_PATHS.participant(ROOM, 'maya')), { votedRound: null });
      await expect(batch.commit()).resolves.not.toEqual(DENIED);
    });

    it('should let the moderator settle a story and start the next round', async () => {
      await cast(maya, 'maya', '5');
      await reveal(mod);

      const batch = writeBatch(mod);
      batch.update(doc(mod, STORE_PATHS.story(ROOM, 's1')), { status: 'done', estimate: '5' });
      batch.update(doc(mod, STORE_PATHS.room(ROOM)), {
        activeStoryId: null,
        round: 3,
        revealed: false,
        roundStartedAt: serverTimestamp(),
      });
      await expect(batch.commit()).resolves.not.toEqual(DENIED);
      await expect(cast(maya, 'maya', '3', 3)).resolves.not.toEqual(DENIED);
    });
  });
});
