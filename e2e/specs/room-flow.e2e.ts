import { expect, test } from '../fixtures/test';
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

  test('should take the moderator to the story field from the empty table and the header', async ({
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
    await page.keyboard.press('Enter');
    await expect(room.storyTitle).toHaveText('Save cards for later');

    await room.headerAddStoryButton.click();
    await expect(room.newStoryField).toBeFocused();
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

    // Shown once per browser: a second room doesn't bring it back, the tour button does. (Not a
    // reload: the Fake backend keeps rooms in the tab's memory.)
    await landing.open();
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
