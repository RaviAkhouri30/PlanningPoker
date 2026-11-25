import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

/** My rooms: the rooms this browser has been in. */
export class MyRoomsPage extends BasePage {
  public readonly heading: Locator;
  public readonly newRoomLink: Locator;
  public readonly notice: Locator;
  public readonly emptyState: Locator;
  protected readonly path = '/rooms';

  public constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1 });
    this.newRoomLink = page.getByRole('link', { name: 'New room' });
    this.notice = page.getByRole('complementary', { name: 'Saved in this browser' });
    this.emptyState = page.getByRole('heading', { name: 'No rooms yet' });
  }

  /** The card of the room called `name`. */
  public room(name: string): Locator {
    return this.page
      .getByRole('listitem')
      .filter({ has: this.page.getByRole('heading', { name }) });
  }

  /** Takes the room called `name` off the list. */
  public async forget(name: string): Promise<void> {
    await this.page.getByRole('button', { name: `Forget ${name}` }).click();
  }
}
