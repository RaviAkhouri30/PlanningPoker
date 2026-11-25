import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

/** The terms of use: copyright and accounts. */
export class TermsPage extends BasePage {
  public readonly heading: Locator;
  public readonly accountsHeading: Locator;
  protected readonly path = '/terms';

  public constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1, name: 'Terms of use' });
    this.accountsHeading = page.getByRole('heading', { name: 'Do I need an account?' });
  }
}
