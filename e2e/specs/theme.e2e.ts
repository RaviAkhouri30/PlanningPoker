import { expect, test } from '../fixtures/test';
import { RoomPage } from '../pages/room.page';
import { TermsPage } from '../pages/terms.page';

/** Light and dark themes: the header switch, the saved choice, and accessibility in dark. */
test.describe('Theme', () => {
  test('should switch to dark from the header and keep it after a reload', async ({
    landing,
    page,
  }) => {
    await landing.open();
    const toggle = page.getByRole('button', { name: /^Theme:/ }).first();

    await toggle.click();
    await toggle.click();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAccessibleName('Theme: Dark. Switch to System.');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('should have no accessibility violations in a dark system theme', async ({
    landing,
    page,
    axe,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await landing.open();
    expect((await axe().analyze()).violations).toEqual([]);

    await landing.createRoom('Alex Kim', 'Sprint 42');
    const room = new RoomPage(page);
    await room.skipTour();
    await room.addStory('PAY-214 Save cards for later');
    expect((await axe().analyze()).violations).toEqual([]);
    await room.card('5').click();
    await expect(room.results).toBeVisible();
    expect((await axe().analyze()).violations).toEqual([]);

    const terms = new TermsPage(page);
    await terms.open();
    await expect(terms.heading).toBeVisible();
    expect((await axe().analyze()).violations).toEqual([]);
  });
});
