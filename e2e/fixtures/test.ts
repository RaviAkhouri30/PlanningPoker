import { type Page, test as base, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { LandingPage } from '../pages/landing.page';

/**
 * An accessibility scan of `page`: WCAG 2.2 A and AA, plus axe's best practices (landmarks, one
 * main heading, names that match what is on screen).
 */
export function axeFor(page: Page): AxeBuilder {
  return new AxeBuilder({ page }).withTags([
    'wcag2a',
    'wcag2aa',
    'wcag21a',
    'wcag21aa',
    'wcag22aa',
    'best-practice',
  ]);
}

/** Custom fixtures: page objects plus an accessibility scanner, injected into every spec. */
interface Fixtures {
  landing: LandingPage;
  axe: () => AxeBuilder;
}

export const test = base.extend<Fixtures>({
  landing: async ({ page }, use) => {
    await use(new LandingPage(page));
  },
  axe: async ({ page }, use) => {
    await use(() => axeFor(page));
  },
});

export { expect };
