import { expect, test } from '../fixtures/test';
import { MyRoomsPage } from '../pages/my-rooms.page';
import { RoomPage } from '../pages/room.page';

/** My rooms on the Fake backend: the list lives in this browser's storage. */
test.describe('My rooms', () => {
  test('should land a returning guest on their rooms, and let them forget one', async ({
    landing,
    page,
    axe,
  }) => {
    await landing.open();
    await landing.createRoom('Alex Kim', 'Sprint 42');
    await new RoomPage(page).skipTour();

    // Coming back to the home page's address with a room saved opens My rooms instead.
    await landing.open();
    await expect(page).toHaveURL(/\/rooms$/);
    const myRooms = new MyRoomsPage(page);
    await expect(myRooms.heading).toHaveText('Welcome back, Alex');
    await expect(myRooms.notice).toBeVisible();
    await expect(myRooms.room('Sprint 42')).toContainText('Moderator');
    await expect(
      myRooms.room('Sprint 42').getByRole('link', { name: 'Open Sprint 42' }),
    ).toHaveAttribute('href', /^\/r\/sprint-42-/);
    expect((await axe().analyze()).violations).toEqual([]);

    // "New room" reaches the home page's form, with the name this browser last used.
    await myRooms.newRoomLink.click();
    await expect(landing.nameField).toHaveValue('Alex Kim');
    await page.getByRole('link', { name: 'My rooms' }).click();

    await myRooms.forget('Sprint 42');

    await expect(myRooms.emptyState).toBeVisible();
  });
});
