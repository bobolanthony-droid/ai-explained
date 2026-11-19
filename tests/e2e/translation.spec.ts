import { expect, test } from '@playwright/test';

/**
 * Browsers can translate a page by themselves (Safari and Chrome both offer
 * it when the page language differs from the phone's). They do it by
 * replacing the page's text with their own elements, behind React's back,
 * which used to crash the app ("removeChild: not a child of this node").
 *
 * The helper below imitates that: it swaps every text node for a "translated"
 * one wrapped in <font> tags, which is what browser translators insert.
 */
test.use({ serviceWorkers: 'block' });

async function translateLikeABrowser(page: import('@playwright/test').Page) {
  await page.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      if (node.textContent?.trim() && !node.parentElement?.closest('script,style')) nodes.push(node);
    }
    for (const node of nodes) {
      const outer = document.createElement('font');
      const inner = document.createElement('font');
      inner.textContent = node.textContent;
      outer.append(inner);
      node.replaceWith(outer);
    }
  });
}

test('the page asks browsers not to translate it', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('translate', 'no');
  await expect(page.locator('meta[name="google"]')).toHaveAttribute('content', 'notranslate');
});

test('the app keeps working even if a translator ignores that request', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await translateLikeABrowser(page);

  // Use the app the way the testers did: skip the questions, open a lesson, switch language.
  await page.getByRole('button', { name: /Skip/ }).click();
  await page.getByRole('link', { name: /Start the lesson/ }).click();
  await expect(page).toHaveURL(/learn\/not-late/);
  await page.getByRole('button', { name: /FR/ }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await page.getByRole('link', { name: 'Glossaire' }).click();
  await expect(page).toHaveURL(/glossary/);

  expect(errors).toEqual([]);
  await expect(page.getByText('Unexpected Application Error')).toHaveCount(0);
});

test.describe('on a phone set to French', () => {
  test.use({ locale: 'fr-FR' });

  test('the app offers its French version (in French), and switches in one tap', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en'); // still opens in English
    const offer = page.getByText('Cette appli existe aussi en français.');
    await expect(offer).toBeVisible();
    await page.getByRole('button', { name: 'Passer en français' }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(offer).toBeHidden();
    // The choice is remembered: no offer after a reload.
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.getByText('This app is also available in English.')).toBeHidden();
  });

  test('"No thanks" keeps English and hides the offer for good', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Non merci' }).click();
    await expect(page.getByText('Cette appli existe aussi en français.')).toBeHidden();
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('Cette appli existe aussi en français.')).toBeHidden();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  });
});

test('a phone set to English gets no offer', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByText(/also available|existe aussi/)).toHaveCount(0);
});
