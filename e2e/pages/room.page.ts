import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

/** The planning room: stories, the table, the deck, results and the invite dialog. */
export class RoomPage extends BasePage {
  public readonly storyTitle: Locator;
  public readonly storyDialog: Locator;
  public readonly newStoryField: Locator;
  public readonly addStoryButton: Locator;
  public readonly addAnotherButton: Locator;
  public readonly closeStoryDialogButton: Locator;
  public readonly storiesTable: Locator;
  public readonly headerAddStoryButton: Locator;
  public readonly tableAddStoryButton: Locator;
  public readonly deckDisclosure: Locator;
  public readonly tour: Locator;
  public readonly tourButton: Locator;
  public readonly revealButton: Locator;
  public readonly results: Locator;
  public readonly inviteButton: Locator;
  public readonly inviteDialog: Locator;
  public readonly votingSwitch: Locator;
  public readonly downloadCsvButton: Locator;
  public readonly timer: Locator;
  public readonly toast: Locator;
  public readonly resetTimerButton: Locator;
  public readonly longerButton: Locator;
  public readonly shorterButton: Locator;
  public readonly countdownValue: Locator;
  public readonly lockSwitch: Locator;
  protected readonly path: string;

  /** @param roomPath The room's path, e.g. `/r/sprint-42-x7k2ab`. */
  public constructor(page: Page, roomPath = '/') {
    super(page);
    this.path = roomPath;
    this.storyTitle = page.locator('#story-title');
    this.storyDialog = page.getByRole('dialog', { name: 'Add a story' });
    this.newStoryField = this.storyDialog.getByLabel('Story', { exact: true });
    // Scoped: the header has an "Add story" button too, which opens this dialog.
    this.addStoryButton = this.storyDialog.getByRole('button', { name: 'Add story' });
    this.addAnotherButton = this.storyDialog.getByRole('button', { name: 'Add another' });
    // The red button in the actions row; the corner "×" is labelled "Close" too.
    this.closeStoryDialogButton = this.storyDialog
      .getByRole('button', { name: 'Close', exact: true })
      .last();
    this.storiesTable = page.getByRole('region', { name: /^Stories/ });
    this.headerAddStoryButton = page.getByRole('banner').getByRole('button', { name: 'Add story' });
    this.tableAddStoryButton = page.getByRole('button', { name: 'Add a story' });
    this.deckDisclosure = page.getByText('Card deck');
    this.tour = page.getByRole('dialog', { name: /./ }).filter({ hasText: /Step \d+ of \d+/ });
    this.tourButton = page.getByRole('button', { name: 'Take the room tour' });
    this.revealButton = page.getByRole('button', { name: 'Reveal cards' });
    this.results = page.getByRole('region', { name: 'Results' });
    this.inviteButton = page.getByRole('banner').getByRole('button', { name: /Invite/ });
    this.inviteDialog = page.getByRole('dialog', { name: 'Invite your team' });
    this.votingSwitch = page.getByRole('switch', { name: 'I vote too' });
    this.downloadCsvButton = page.getByRole('button', { name: 'Download the stories as CSV' });
    this.timer = page.getByRole('timer', { name: 'Time left' });
    this.toast = page.locator('.toast-region');
    this.resetTimerButton = page.getByRole('button', { name: 'Reset timer' });
    this.longerButton = page.getByRole('button', { name: '30 seconds longer' });
    this.shorterButton = page.getByRole('button', { name: '30 seconds shorter' });
    this.countdownValue = page.getByRole('group', { name: 'Countdown' });
    this.lockSwitch = page.getByRole('switch', { name: 'Lock voting at time up' });
  }

  /** Closes the guided tour, which opens for the moderator on the first visit. */
  public async skipTour(): Promise<void> {
    await this.tour.getByRole('button', { name: 'Skip tour' }).click();
    await this.tour.waitFor({ state: 'hidden' });
  }

  /** Adds a story through the header's "Add story" dialog, e.g. `PAY-214 Save cards`. */
  public async addStory(text: string): Promise<void> {
    await this.headerAddStoryButton.click();
    await this.newStoryField.fill(text);
    await this.addStoryButton.click();
    await this.storyDialog.waitFor({ state: 'hidden' });
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
