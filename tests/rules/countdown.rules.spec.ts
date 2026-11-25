import { readFileSync } from 'node:fs';
import { type RulesTestEnvironment, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import {
  type Firestore,
  Timestamp,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { STORE_PATHS } from '@shared/constants/store-paths.constants';
import { DENIED, ROOM, cast, createRoom, seat, story } from './rules-fixtures';

/**
 * The round countdown: votes close at zero while the room's lock is on, until the moderator
 * resets or lengthens the timer. Runs on the emulator (`npm run test:rules`).
 */
describe('firestore.rules · countdown', () => {
  let env: RulesTestEnvironment;
  let mod: Firestore;
  let maya: Firestore;

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
    await createRoom(mod);
    await setDoc(doc(maya, STORE_PATHS.participant(ROOM, 'maya')), seat());
    // The first story, made active in a new round (StoriesService.add + activationWrites).
    const batch = writeBatch(mod);
    batch.set(doc(mod, STORE_PATHS.story(ROOM, 's1')), story());
    batch.update(doc(mod, STORE_PATHS.room(ROOM)), {
      activeStoryId: 's1',
      round: 2,
      revealed: false,
      roundStartedAt: serverTimestamp(),
    });
    await batch.commit();
  });

  afterAll(async () => {
    await env.cleanup();
  });

  /** Moves the round's start back, as if `seconds` had passed (rules off: a test setup). */
  async function age(seconds: number): Promise<void> {
    await env.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore() as unknown as Firestore;
      await updateDoc(doc(db, STORE_PATHS.room(ROOM)), {
        roundStartedAt: Timestamp.fromMillis(Date.now() - seconds * 1000),
      });
    });
  }

  it('should let only the moderator set the countdown and the lock, within range', async () => {
    const ref = doc(mod, STORE_PATHS.room(ROOM));
    await expect(updateDoc(ref, { timerSeconds: 120, lockOnTimeUp: false })).resolves.not.toEqual(
      DENIED,
    );
    await expect(updateDoc(ref, { timerSeconds: 10 })).rejects.toMatchObject(DENIED);
    await expect(updateDoc(ref, { timerSeconds: 601 })).rejects.toMatchObject(DENIED);
    await expect(updateDoc(ref, { timerSeconds: 90.5 })).rejects.toMatchObject(DENIED);
    await expect(updateDoc(ref, { lockOnTimeUp: 'yes' })).rejects.toMatchObject(DENIED);
    await expect(
      updateDoc(doc(maya, STORE_PATHS.room(ROOM)), { timerSeconds: 300 }),
    ).rejects.toMatchObject(DENIED);
  });

  it('should close voting when the countdown runs out with the lock on', async () => {
    await cast(maya, 'maya', '5');
    await age(90);

    await expect(cast(maya, 'maya', '8')).rejects.toMatchObject(DENIED);
    await expect(deleteDoc(doc(maya, STORE_PATHS.vote(ROOM, 2, 'maya')))).rejects.toMatchObject(
      DENIED,
    );
  });

  it('should open voting again when the moderator resets or lengthens the timer', async () => {
    await age(90);
    const ref = doc(mod, STORE_PATHS.room(ROOM));

    await updateDoc(ref, { timerSeconds: 600 });
    await expect(cast(maya, 'maya', '5')).resolves.not.toEqual(DENIED);
    await updateDoc(ref, { timerSeconds: 60 });
    await expect(cast(maya, 'maya', '8')).rejects.toMatchObject(DENIED);
    await updateDoc(ref, { roundStartedAt: serverTimestamp() });
    await expect(cast(maya, 'maya', '8')).resolves.not.toEqual(DENIED);
  });

  it('should keep voting open after zero when the lock is off', async () => {
    await updateDoc(doc(mod, STORE_PATHS.room(ROOM)), { lockOnTimeUp: false });
    await age(90);

    await expect(cast(maya, 'maya', '5')).resolves.not.toEqual(DENIED);
  });
});
