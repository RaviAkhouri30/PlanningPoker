import { expect, test } from '../fixtures/test';
import { RoomPage } from '../pages/room.page';

/**
 * The round countdown on the Fake backend. Playwright's clock moves time on, so a minute-long
 * countdown runs in a moment: the warning, time up, the locked deck and the reset.
 */
test.describe('Round countdown', () => {
  test.beforeEach(async ({ page, landing }) => {
    await page.clock.install();
    await landing.open();
    await landing.createRoom('Alex Kim', 'Sprint 42');
    const room = new RoomPage(page);
    await room.skipTour();
    await room.addStory('PAY-214 Save cards for later');
    // One tick with the round running, so the countdown has a second to count down from.
    await page.clock.runFor(1000);
  });

  test('should warn, close voting at zero and open it again on reset', async ({ page, axe }) => {
    const room = new RoomPage(page);
    await expect(room.timer).toHaveText(/00:[56]\d|01:00/);

    await page.clock.fastForward('00:41');
    await expect(room.toast).toContainText('20 seconds left to vote');
    await expect(room.timer).toHaveAttribute('data-phase', 'warning');

    await page.clock.fastForward('00:20');
    await expect(room.toast).toContainText('Time’s up. Voting is closed');
    await expect(room.timer).toHaveText('00:00');
    await expect(room.card('5')).toBeDisabled();
    await expect(page.getByText('Reset the timer to open voting again.')).toBeVisible();
    expect((await axe().analyze()).violations).toEqual([]);

    await room.resetTimerButton.click();
    await expect(room.card('5')).toBeEnabled();
    await room.card('5').click();
    await expect(room.results).toBeVisible();
  });

  test('should lengthen the countdown and keep voting open at zero when unlocked', async ({
    page,
    axe,
  }) => {
    const room = new RoomPage(page);

    await room.longerButton.click();
    await expect(room.countdownValue).toContainText('01:30');
    await room.shorterButton.click();
    await room.shorterButton.click();
    await expect(room.countdownValue).toContainText('00:30');
    await expect(room.shorterButton).toBeDisabled();
    await room.lockSwitch.click();
    await expect(room.lockSwitch).toHaveAttribute('aria-checked', 'false');
    expect((await axe().analyze()).violations).toEqual([]);
    await page.clock.runFor(1000);

    await page.clock.fastForward('00:30');
    await expect(room.toast).toContainText('Votes still count');
    await expect(room.card('5')).toBeEnabled();
  });
});
