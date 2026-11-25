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

  test('should show the room link in the invite dialog', async ({ landing, page }) => {
    await landing.open();
    await landing.createRoom('Alex Kim', 'Sprint 42');
    const room = new RoomPage(page);
    const path = new URL(page.url()).pathname;

    expect(await room.inviteLink()).toContain(path);
    await page.keyboard.press('Escape');
    await expect(room.inviteDialog).toBeHidden();
  });
});
