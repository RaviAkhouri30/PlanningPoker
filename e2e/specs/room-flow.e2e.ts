import { expect, test } from '../fixtures/test';
import { MyRoomsPage } from '../pages/my-rooms.page';
import { RoomPage } from '../pages/room.page';

/** The first slice on the Fake backend, in one browser: create, add a story, vote, flip, settle. */
test.describe('Room flow', () => {
  test('should have no accessibility violations on the landing page', async ({ landing, axe }) => {
    await landing.open();

    await expect(landing.heading).toBeVisible();
    expect((await axe().analyze()).violations).toEqual([]);
  });

  test('should create a room, vote, reveal and settle a story', async ({ landing, page, axe }) => {
    await landing.open();
    await landing.createRoom('Alex Kim', 'Sprint 42');
    const room = new RoomPage(page);
    await room.skipTour();

    await room.addStory('PAY-214 Save cards for later');
    await expect(room.storyTitle).toHaveText('Save cards for later');
    expect((await axe().analyze()).violations).toEqual([]);

    // Auto-reveal is on by default: the cards flip once everyone has voted.
    await room.card('5').click();
    await expect(room.results).toBeVisible();
    await expect(room.results.getByLabel('100 percent agreement')).toBeVisible();

    await room.acceptButton('5').click();
    await expect(room.results).toBeHidden();
  });

  test('should settle on an estimate the moderator types after the discussion', async ({
    landing,
    page,
    axe,
  }) => {
    await landing.open();
    await landing.createRoom('Alex Kim', 'Sprint 42');
    const room = new RoomPage(page);
    await room.skipTour();
    await room.addStory('PAY-214 Save cards for later');
    await room.card('5').click();
    await expect(room.results).toBeVisible();
    expect((await axe().analyze()).violations).toEqual([]);

    await room.setEstimateButton.click();
    await expect(room.results.getByText('up to 8 characters')).toBeVisible();
    await room.customEstimateField.fill('6');
    await room.customEstimateField.press('Enter');

    await expect(room.results).toBeHidden();
    await room.storiesTable.getByRole('tab', { name: /Completed/ }).click();
    await expect(room.storiesTable.getByRole('row', { name: /Save cards/ })).toContainText('6');
  });

  test('should add stories through the dialog from the empty table and the header', async ({
    landing,
    page,
    axe,
  }) => {
    await landing.open();
    await landing.createRoom('Alex Kim', 'Sprint 42');
    const room = new RoomPage(page);
    await room.skipTour();

    await room.tableAddStoryButton.click();
    await expect(room.newStoryField).toBeFocused();
    await page.keyboard.type('PAY-214 Save cards for later');
    await room.addAnotherButton.click();
    await expect(room.newStoryField).toBeFocused();
    await page.keyboard.type('PAY-215 Refunds');
    await room.addAnotherButton.click();
    const added = room.storyDialog
      .getByRole('list', { name: 'Stories added' })
      .getByRole('listitem');
    await expect(added).toHaveText(['PAY-214 Save cards for later', 'PAY-215 Refunds']);
    await expect(room.storyDialog.getByRole('status')).toContainText('2 stories added');
    expect((await axe().analyze()).violations).toEqual([]);
    await room.closeStoryDialogButton.click();
    await expect(room.storyDialog).toBeHidden();
    await expect(room.storyTitle).toHaveText('Save cards for later');

    // The table under the table of cards: the moderator picks the next story there.
    await expect(room.storiesTable.getByRole('row')).toHaveCount(3);
    await room.storiesTable.getByRole('button', { name: 'Vote: Refunds' }).click();
    await expect(room.storyTitle).toHaveText('Refunds');
    await expect(room.storiesTable.getByRole('row', { name: /Refunds/ })).toContainText('Voting');

    await room.headerAddStoryButton.click();
    await expect(room.newStoryField).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(room.storyDialog).toBeHidden();
    await expect(room.deckDisclosure).toBeVisible();
    await room.deckDisclosure.click();
    await expect(page.getByRole('button', { name: /T-shirt/ })).toBeVisible();
    expect((await axe().analyze()).violations).toEqual([]);
  });

  test('should walk the moderator through the room once, and replay on request', async ({
    landing,
    page,
    axe,
  }) => {
    await landing.open();
    await landing.createRoom('Alex Kim', 'Sprint 42');
    const room = new RoomPage(page);

    await expect(room.tour).toContainText('Step 1 of 8');
    expect((await axe().analyze()).violations).toEqual([]);
    for (let step = 1; step < 8; step += 1) {
      await room.tour.getByRole('button', { name: 'Next' }).click();
    }
    await expect(room.tour).toContainText('Step 8 of 8');
    await room.tour.getByRole('button', { name: 'Done' }).click();
    await expect(room.tour).toBeHidden();

    // Shown once per browser: a second room doesn't bring it back, the tour button does. Coming
    // back to the home page with a room saved opens My rooms, whose "New room" leads to the form.
    await landing.open();
    await new MyRoomsPage(page).newRoomLink.click();
    await landing.createRoom('Alex Kim', 'Sprint 43');
    await expect(page.getByText('No story yet')).toBeVisible();
    await expect(room.tour).toBeHidden();
    await room.tourButton.click();
    await expect(room.tour).toContainText('Step 1 of 8');
    await page.keyboard.press('Escape');
    await expect(room.tour).toBeHidden();
  });

  test('should show the room link in the invite dialog', async ({ landing, page }) => {
    await landing.open();
    await landing.createRoom('Alex Kim', 'Sprint 42');
    const room = new RoomPage(page);
    await room.skipTour();
    const path = new URL(page.url()).pathname;

    expect(await room.inviteLink()).toContain(path);
    await page.keyboard.press('Escape');
    await expect(room.inviteDialog).toBeHidden();
  });

  test('should seat the organiser with the animal they picked', async ({ landing, page }) => {
    await landing.open();

    await landing.pickAvatar('Owl');
    await landing.createRoom('Alex Kim', 'Sprint 42');

    await expect(new RoomPage(page).avatarOf('Alex Kim')).toHaveAttribute('data-animal', 'owl');
  });

  test('should let the organiser facilitate without voting, then join the vote', async ({
    landing,
    page,
  }) => {
    await landing.open();
    await landing.createRoom('Alex Kim', 'Sprint 42', true);
    const room = new RoomPage(page);
    await room.skipTour();
    await room.addStory('PAY-214 Save cards for later');

    await expect(page.getByText('You are facilitating. The players vote.')).toBeVisible();
    await expect(room.card('5')).toBeDisabled();
    await expect(room.votingSwitch).toHaveAttribute('aria-checked', 'false');

    await room.votingSwitch.click();

    await expect(room.card('5')).toBeEnabled();
  });
});
