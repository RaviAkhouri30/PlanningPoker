import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

/** The landing page: the hero form that creates a room or joins one by code. */
export class LandingPage extends BasePage {
  public readonly heading: Locator;
  public readonly nameField: Locator;
  public readonly roomNameField: Locator;
  public readonly createButton: Locator;
  protected readonly path = '/';

  public constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1 });
    // The closing call to action repeats the name field; the hero form comes first.
    this.nameField = page.getByLabel('Your name').first();
    this.roomNameField = page.getByLabel(/Room name/);
    this.createButton = page.getByRole('button', { name: /Create (my )?room/ }).first();
  }

  /** Creates a room as `name` and waits for the room page. */
  public async createRoom(name: string, roomName: string): Promise<void> {
    await this.nameField.fill(name);
    await this.roomNameField.fill(roomName);
    await this.createButton.click();
    await this.page.waitForURL(/\/r\/[^/]+$/);
    await this.settle();
  }
}
