import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

/** The planning room: stories, the table, the deck, results and the invite dialog. */
export class RoomPage extends BasePage {
  public readonly storyTitle: Locator;
  public readonly newStoryField: Locator;
  public readonly addStoryButton: Locator;
  public readonly headerAddStoryButton: Locator;
  public readonly tableAddStoryButton: Locator;
  public readonly deckDisclosure: Locator;
  public readonly revealButton: Locator;
  public readonly results: Locator;
  public readonly inviteButton: Locator;
  public readonly inviteDialog: Locator;
  protected readonly path: string;

  /** @param roomPath The room's path, e.g. `/r/sprint-42-x7k2ab`. */
  public constructor(page: Page, roomPath = '/') {
    super(page);
    this.path = roomPath;
    this.storyTitle = page.locator('#story-title');
    this.newStoryField = page.getByLabel('New story title');
    // Scoped: the header has an "Add story" button too, for the moderator.
    this.addStoryButton = page
      .getByRole('region', { name: 'Stories' })
      .getByRole('button', { name: 'Add story' });
    this.headerAddStoryButton = page.getByRole('banner').getByRole('button', { name: 'Add story' });
    this.tableAddStoryButton = page.getByRole('button', { name: 'Add a story' });
    this.deckDisclosure = page.getByText('Card deck');
    this.revealButton = page.getByRole('button', { name: 'Reveal cards' });
    this.results = page.getByRole('region', { name: 'Results' });
    this.inviteButton = page.getByRole('banner').getByRole('button', { name: /Invite/ });
    this.inviteDialog = page.getByRole('dialog', { name: 'Invite your team' });
  }

  /** Adds a story, e.g. `PAY-214 Save cards`. */
  public async addStory(text: string): Promise<void> {
    await this.newStoryField.fill(text);
    await this.addStoryButton.click();
  }

  /** The button that plays `card`. */
  public card(card: string): Locator {
    return this.page.getByRole('button', { name: `Vote ${card}`, exact: true });
  }

  /** The moderator's button that settles the estimate on `card`. */
  public acceptButton(card: string): Locator {
    return this.results.getByRole('button', { name: `Accept ${card}`, exact: true });
  }

  /** Opens the invite dialog and returns the link it shows. */
  public async inviteLink(): Promise<string> {
    await this.inviteButton.click();
    return (await this.inviteDialog.locator('.link__text').textContent())?.trim() ?? '';
  }
}
