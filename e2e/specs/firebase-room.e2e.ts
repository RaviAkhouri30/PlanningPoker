import { expect, test } from '../fixtures/test';
import { JoinPage } from '../pages/join.page';
import { RoomPage } from '../pages/room.page';

/**
 * The real Firestore and Auth SDKs against the emulators, in two browsers: the moderator creates
 * a room and a second person joins by its link, which the moderator is told about. Votes stay secret until the flip, then both see
 * the same result.
 */
test.describe('Firebase room', () => {
  test('should let a second browser join by link, vote and see the same result', async ({
    landing,
    page,
    browser,
  }) => {
    await landing.open();
    await landing.createRoom('Alex Kim', 'Sprint 42');
    const host = new RoomPage(page);
    await host.skipTour();
    await host.addStory('PAY-214 Save cards for later');
    await expect(host.storyTitle).toHaveText('Save cards for later');

    const guestContext = await browser.newContext({ reducedMotion: 'reduce' });
    try {
      const guestPage = await guestContext.newPage();
      // The room's link sends someone not yet in the room to the join form.
      const join = new JoinPage(guestPage, new URL(page.url()).pathname);
      await join.open();
      await expect(guestPage).toHaveURL(/\/join$/);
      await join.join('Maya Patel');
      const guest = new RoomPage(guestPage);
      await expect(guest.storyTitle).toHaveText('Save cards for later');
      // The tour opens by itself only for the moderator.
      await expect(guest.tour).toBeHidden();
      // The moderator hears about the real person who just took a seat.
      await expect(page.getByRole('status')).toContainText('Maya joined the room');

      await host.card('5').click();
      // One vote of two: the round stays open.
      await expect(host.results).toBeHidden();
      await guest.card('5').click();

      // Auto-reveal flips the cards in the moderator's browser once both have voted.
      for (const room of [host, guest]) {
        await expect(room.results).toBeVisible();
        await expect(room.results.getByLabel('100 percent agreement')).toBeVisible();
      }
      await expect(host.acceptButton('5')).toBeVisible();
      await expect(guest.acceptButton('5')).toHaveCount(0);
    } finally {
      await guestContext.close();
    }
  });

  test('should flip by itself once the players vote when the moderator only facilitates', async ({
    landing,
    page,
    browser,
  }) => {
    await landing.open();
    await landing.createRoom('Alex Kim', 'Sprint 43', true);
    const host = new RoomPage(page);
    await host.skipTour();
    await host.addStory('PAY-215 Export receipts');

    const guestContext = await browser.newContext({ reducedMotion: 'reduce' });
    try {
      const guestPage = await guestContext.newPage();
      const join = new JoinPage(guestPage, new URL(page.url()).pathname);
      await join.open();
      await join.join('Maya Patel');
      const guest = new RoomPage(guestPage);
      await expect(guest.storyTitle).toHaveText('Export receipts');

      // The only player votes; the facilitator never does, and the cards still flip.
      await guest.card('8').click();

      for (const room of [host, guest]) {
        await expect(room.results).toBeVisible();
      }
      await expect(host.acceptButton('8')).toBeVisible();
    } finally {
      await guestContext.close();
    }
  });
});
