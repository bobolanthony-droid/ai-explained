import { expect, test } from '@playwright/test';

test.use({ serviceWorkers: 'block' });

test('the browser shows how to install the app, and "Not now" hides the invitation for good', async ({ page }) => {
  // First visit, in a phone browser (the test device is an Android phone).
  await page.goto('/');
  const card = page.getByRole('heading', { name: 'Add this app to your phone' });
  await expect(card).toBeVisible();

  // The steps for this kind of phone come first.
  await page.getByRole('link', { name: 'Show me how' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Install the app');
  await expect(page.getByRole('heading', { level: 2 }).first()).toHaveText('On Android');
  await expect(page.getByText('Tap the three dots at the top right.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'On iPhone or iPad' })).toBeVisible();

  // The same page in French.
  await page.getByRole('button', { name: /FR/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Installer l’appli');
  await expect(page.getByText('Touchez les trois points en haut à droite.')).toBeVisible();
  await page.getByRole('button', { name: /EN/ }).click();

  // "Not now" removes the invitation, and it stays away after a reload...
  await page.goto('/');
  await page.getByRole('button', { name: 'Not now' }).click();
  await expect(card).toBeHidden();
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(card).toBeHidden();

  // ...but the instructions are still one tap away under Me.
  await page.getByRole('button', { name: 'Skip for now' }).click();
  await page.getByRole('link', { name: 'Me', exact: true }).click();
  await page.getByRole('link', { name: 'Install the app' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Install the app');
});

test('the installed app does not show the invitation', async ({ page }) => {
  // Pretend the app was opened from the home screen icon.
  await page.addInitScript(() => {
    const real = window.matchMedia.bind(window);
    window.matchMedia = (query: string) =>
      query.includes('display-mode: standalone') ? ({ ...real(query), matches: true } as MediaQueryList) : real(query);
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Add this app to your phone' })).toBeHidden();
});
