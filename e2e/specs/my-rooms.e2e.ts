import { expect, test } from '../fixtures/test';
import { downloadFrom } from '../pages/backup';
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

    // Forget warns first, since a guest has no account to get the room back from.
    await myRooms.askToForget('Sprint 42');
    await expect(myRooms.forgetDialog).toContainText("can't be undone");
    expect((await axe().analyze()).violations).toEqual([]);
    await myRooms.forgetDialog.getByRole('button', { name: 'Keep it' }).click();
    await expect(myRooms.room('Sprint 42')).toBeVisible();

    await myRooms.forget('Sprint 42');

    await expect(myRooms.emptyState).toBeVisible();
  });

  test('should save a room, then all rooms, as CSV files', async ({ landing, page }) => {
    await landing.open();
    await landing.createRoom('Alex Kim', 'Sprint 42');
    const room = new RoomPage(page);
    await room.skipTour();
    await room.addStory('PAY-214 =Save cards');
    await room.card('5').click();
    await room.acceptButton('5').click();

    const one = await downloadFrom(page, room.downloadCsvButton);

    expect(one.name).toMatch(/^planning-poker-sprint-42-\w+-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(one.content).toContain('"Room","Room code","Key","Story"');
    expect(one.content).toContain(`"PAY-214","'=Save cards","","Estimated","5","1","5"`);
    await expect(page.getByText(`Backup saved: ${one.name}`)).toBeVisible();

    // In-app links only (no reload): the Fake backend keeps rooms in memory.
    await page.getByRole('link', { name: 'PlanningPoker home' }).click();
    await page.getByRole('link', { name: 'My rooms' }).click();
    const all = await downloadFrom(page, new MyRoomsPage(page).backUpAllButton);

    // One room on the list: the file is named after it, as from the room.
    expect(all.name).toBe(one.name);
    expect(all.content).toBe(one.content);
  });
});
