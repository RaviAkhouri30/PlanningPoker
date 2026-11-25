import { type Locator, type Page } from '@playwright/test';

/** A file the app handed the browser to save. */
export interface ISavedDownload {
  readonly name: string;
  readonly content: string;
}

/**
 * Presses `button` and returns the file it downloads.
 * @param page The page the download starts from.
 * @param button The button that starts it.
 */
export async function downloadFrom(page: Page, button: Locator): Promise<ISavedDownload> {
  const [download] = await Promise.all([page.waitForEvent('download'), button.click()]);
  const chunks: Buffer[] = [];
  for await (const chunk of await download.createReadStream()) {
    chunks.push(chunk as Buffer);
  }
  return { name: download.suggestedFilename(), content: Buffer.concat(chunks).toString('utf8') };
}
