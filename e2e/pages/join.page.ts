import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

/** The join page a room link leads to for someone not yet in the room. */
export class JoinPage extends BasePage {
  public readonly nameField: Locator;
  public readonly joinButton: Locator;
  protected readonly path: string;

  /** @param roomPath The room's path, e.g. `/r/sprint-42-x7k2ab`. */
  public constructor(page: Page, roomPath = '/') {
    super(page);
    this.path = roomPath;
    this.nameField = page.getByLabel('Display name');
    this.joinButton = page.getByRole('button', { name: /^Join/ });
  }

  /** Joins as a player called `name` and waits for the room page. */
  public async join(name: string): Promise<void> {
    await this.nameField.fill(name);
    await this.joinButton.click();
    await this.page.waitForURL(/\/r\/[^/]+$/);
    await this.settle();
  }
}
