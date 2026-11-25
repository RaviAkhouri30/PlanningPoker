import { test as base, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { LandingPage } from '../pages/landing.page';

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
    await use(() =>
      new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']),
    );
  },
});

export { expect };
