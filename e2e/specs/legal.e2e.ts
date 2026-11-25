import { expect, test } from '../fixtures/test';
import { TermsPage } from '../pages/terms.page';

/** The copyright footer on every page and the terms it links to. */
test.describe('Legal', () => {
  test('should link every page to the terms through the copyright footer', async ({
    landing,
    page,
  }) => {
    await landing.open();
    const footer = page.getByRole('contentinfo').filter({ hasText: 'All rights reserved' });

    await expect(footer).toContainText('© 2026 Ravi Akhouri');
    await footer.getByRole('link', { name: 'Terms of use' }).click();

    await expect(new TermsPage(page).heading).toBeVisible();
  });

  test('should say no account is needed, with no accessibility violations', async ({
    page,
    axe,
  }) => {
    const terms = new TermsPage(page);

    await terms.open();

    await expect(terms.accountsHeading).toBeVisible();
    expect((await axe().analyze()).violations).toEqual([]);
  });
});
