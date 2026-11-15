import { expect, test } from '@playwright/test';

test.describe('learning flow', () => {
  // The service worker is tested separately below; here it would only add an
  // "offline ready" notice on top of the page.
  test.use({ serviceWorkers: 'block' });

  test('a first-time user finishes lesson 1, looks up a word, and keeps progress in French', async ({ page }) => {
    // First visit: welcome questions, skippable.
    await page.goto('/');
    await expect(page).toHaveURL(/\/welcome$/);
    await page.getByRole('button', { name: 'Skip for now' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText("Hello. You're not late.");
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    // Open lesson 1.
    await page.getByRole('link', { name: 'Start the lesson' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText("You're not late");

    // Tap a term: the definition opens in a sheet, without leaving the lesson.
    await page.getByRole('button', { name: 'Machine learning' }).first().click();
    const sheet = page.getByRole('dialog');
    await expect(sheet.getByRole('heading', { name: 'Machine learning' })).toBeVisible();
    await sheet.getByRole('button', { name: 'Close' }).click();
    await expect(sheet).toBeHidden();
    await expect(page).toHaveURL(/\/learn\/not-late$/);

    // Quick check: a wrong answer gets a kind reply, then pick again.
    await page.getByRole('button', { name: 'A light switch' }).click();
    await expect(page.getByText('Not quite')).toBeVisible();
    await page.getByRole('button', { name: /A spam filter/ }).click();
    await expect(page.getByText("Yes, that's it")).toBeVisible();

    // Write a note, then finish.
    await page.getByLabel(/Write anything you want to remember/).fill('Check my spam filter');
    await page.getByRole('button', { name: 'Done. Next lesson' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('How chatbots');

    // Back on the journey: one lesson done, and "continue" points at lesson 2.
    await page.getByRole('link', { name: 'Learn', exact: true }).click();
    await expect(page.getByText('1 of 8 lessons done').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Continue the lesson' })).toBeVisible();

    // Switch to French: instant, and progress is kept.
    await page.getByRole('button', { name: /FR/ }).click();
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.getByText('Leçons terminées : 1 sur 8')).toBeVisible();

    // The choice survives a reload.
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.getByText('Leçons terminées : 1 sur 8')).toBeVisible();

    // Look up a glossary term, searching without accents.
    await page.getByRole('link', { name: 'Glossaire' }).click();
    await page.getByLabel('Chercher un mot').fill('requete');
    await page.getByRole('link', { name: /requête, instruction/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Prompt');

    // The note is listed under Me.
    await page.getByRole('link', { name: 'Moi', exact: true }).click();
    await expect(page.getByText('Check my spam filter')).toBeVisible();
  });

  test('a user builds a prompt, copies it, saves it, and copies an exercise prompt in French', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    // Windows hands text back with \r\n line endings; compare with plain \n.
    const clipboard = async () => (await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n');

    // Prompt builder: only two boxes filled in; the rest are optional.
    await page.goto('/prompts/builder');
    await page.getByLabel('Task', { exact: true }).fill('Write a short note about the office move');
    await page.getByLabel('Format', { exact: true }).fill('An email under 100 words');
    const built = 'Task: Write a short note about the office move\n\nFormat: An email under 100 words';
    await page.getByRole('button', { name: 'Copy', exact: true }).click();
    expect(await clipboard()).toBe(built);

    // Save it, then find it under My prompts (also after a reload).
    await page.getByRole('button', { name: 'Save to My prompts' }).click();
    await page.getByRole('link', { name: /See My prompts/ }).click();
    await expect(page.getByRole('heading', { name: /Task: Write a short note about/ })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { name: /Task: Write a short note about/ })).toBeVisible();

    // Add a template to favourites: it shows up under My prompts.
    await page.goto('/prompts/templates');
    await page.getByRole('button', { name: 'Add to favourites' }).first().click();
    await page.goto('/prompts/mine');
    await expect(page.getByRole('heading', { name: 'Summarise a document' })).toBeVisible();

    // Practice: the safety reminder is there, and the prompt can be copied in French.
    await page.goto('/practice');
    await expect(page.getByText('Before you paste anything')).toBeVisible();
    await page.getByRole('link', { name: /Summarise a long email/ }).click();
    await page.getByRole('button', { name: 'Copy in Français' }).nth(1).click();
    expect(await clipboard()).toContain('Résume l’e-mail ci-dessous');
    await page.getByRole('button', { name: 'I tried this' }).click();
    await expect(page.getByText('You tried this one.')).toBeVisible();
  });
});

test('works offline after the first visit', async ({ page, context }) => {
  await page.goto('/glossary');
  // Wait until the service worker has stored the app.
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect(page.getByText('Ready to use offline.')).toBeVisible();

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Glossary');
  // A page never visited before also loads, including the other language.
  await page.getByRole('button', { name: /FR/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Glossaire');
});
