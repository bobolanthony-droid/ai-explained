import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Automated accessibility checks (axe-core) on every kind of screen, in both
 * languages and both colour themes, against WCAG 2.2 level AA.
 * Automated tools catch contrast, labels, roles and structure; they do not
 * replace a test with a real screen reader.
 */
const PAGES = [
  '/',
  '/welcome',
  '/learn/not-late',
  '/learn/keeping-up',
  '/glossary',
  '/glossary/prompt',
  '/prompts',
  '/prompts/recipe',
  '/prompts/builder',
  '/prompts/checklist',
  '/prompts/gallery',
  '/prompts/templates',
  '/prompts/tips',
  '/prompts/mine',
  '/practice',
  '/practice/summarise-email',
  '/me',
  '/me/settings',
  '/me/plan',
  '/me/why',
  '/me/install',
  '/feedback',
];

test.use({ serviceWorkers: 'block' });

/** Start as a returning user (welcome done), with a chosen language, theme and text size. */
async function prepare(page: import('@playwright/test').Page, locale: string, theme: string, textSize = 'standard') {
  await page.addInitScript(
    ([l, t, s]) => {
      localStorage.setItem('ai-explained:settings', JSON.stringify({ state: { locale: l, theme: t, textSize: s, reduceMotion: true }, version: 1 }));
      localStorage.setItem(
        'ai-explained:progress',
        JSON.stringify({
          state: { completed: { 'not-late': '2026-01-01' }, lastLesson: 'not-late', bookmarks: ['term:prompt'], notes: { 'not-late': 'A note' }, exercises: {}, plan: ['week-1'], welcome: { done: true } },
          version: 1,
        }),
      );
    },
    [locale, theme, textSize],
  );
}

for (const [locale, theme] of [
  ['en', 'light'],
  ['fr', 'dark'],
] as const) {
  test(`no accessibility violations (${locale}, ${theme})`, async ({ page }) => {
    test.setTimeout(120_000);
    await prepare(page, locale, theme);
    for (const path of PAGES) {
      await page.goto(path === '/welcome' ? path : path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
      const summary = results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length}) e.g. ${v.nodes[0].html.slice(0, 120)}`);
      expect(summary, `violations on ${path}`).toEqual([]);
    }
  });
}

test('the term sheet has no accessibility violations', async ({ page }) => {
  await prepare(page, 'en', 'light');
  await page.goto('/learn/not-late');
  await page.getByRole('button', { name: 'Machine learning' }).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const results = await new AxeBuilder({ page }).include('dialog').withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});

test('nothing overflows sideways at the largest text size, in French', async ({ page }) => {
  test.setTimeout(120_000);
  await prepare(page, 'fr', 'light', 'largest');
  for (const path of PAGES) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `horizontal overflow on ${path}`).toBeLessThanOrEqual(0);
  }
});

test('the whole lesson can be done with the keyboard', async ({ page }) => {
  await prepare(page, 'en', 'light');
  await page.goto('/learn/not-late');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  // The skip link is the first stop.
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  // "Explain it even simpler" opens with the keyboard and says so to assistive tech.
  const toggle = page.getByRole('button', { name: 'Explain it even simpler' });
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Hide the simpler version' })).toHaveAttribute('aria-expanded', 'true');
  // A term opens in a sheet; Escape closes it and focus returns to the word.
  const term = page.getByRole('button', { name: 'Machine learning' }).first();
  await term.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(term).toBeFocused();
});
