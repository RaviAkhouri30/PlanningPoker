import { type Locator, type Page } from '@playwright/test';

/**
 * Base Page Object: shared navigation helpers for every page object.
 * Specs talk to page objects, never to raw selectors.
 */
export abstract class BasePage {
  /** Path of the page relative to baseURL. */
  protected abstract readonly path: string;

  protected constructor(public readonly page: Page) {}

  /**
   * Navigates to the page and waits until it is visually settled: the page loaded and web fonts
   * ready. Not `networkidle`: on the Firebase suite Firestore keeps a listen channel open, so the
   * network never goes idle.
   */
  public async open(): Promise<void> {
    await this.page.goto(this.path);
    await this.settle();
  }

  /** Opens the avatar picker and picks the animal called `label`, e.g. "Owl". */
  public async pickAvatar(label: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Change' }).click();
    await this.page.getByRole('radio', { name: label, exact: true }).click();
  }

  /** The avatar of the person called `name` (the first, when several show it). */
  public avatarOf(name: string): Locator {
    // The avatar is decorative (aria-hidden), so it has no role; its tooltip names the person.
    return this.page
      .locator('app-avatar')
      .and(this.page.getByTitle(name, { exact: true }))
      .first();
  }

  /** Waits for the current page to load and its fonts to be ready. */
  public async settle(): Promise<void> {
    await this.page.waitForLoadState('load');
    await this.page.evaluate(async () => document.fonts.ready);
  }
}
