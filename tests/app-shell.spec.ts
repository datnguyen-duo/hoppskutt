import { expect, test } from '@playwright/test';

test('homepage loads and opens the destination board', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Hoppskutt' })).toBeVisible();
  await expect(
    page.getByText('Dash from Maryland to Rainbow Bridge, one bright Chloe run at a time.'),
  ).toBeVisible();

  await page.getByRole('button', { name: /start run/i }).click();

  await expect(page).toHaveURL(/view=destinations/);
  await expect(
    page.getByRole('heading', { name: "Pick Chloe's next stage." }),
  ).toBeVisible();
  await expect(
    page.locator('.destination-topbar').getByRole('button', { name: /start run/i }),
  ).toBeVisible();
  await expect(
    page.locator('.destination-hero-panel').getByText('Level 1: Open Lanes'),
  ).toBeVisible();
  await expect(page.getByText('Open center lane')).toBeVisible();
});

test('route book navigation respects browser back', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /^start run$/i }).click();
  await expect(page).toHaveURL(/view=destinations/);

  await page.getByRole('button', { name: /sticker book/i }).click();
  await expect(page).toHaveURL(/view=collection/);
  await expect(page.getByRole('heading', { name: "Chloe's sticker book." })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/view=destinations/);
  await expect(
    page.getByRole('heading', { name: "Pick Chloe's next stage." }),
  ).toBeVisible();

  await page.goBack();
  await expect(page).not.toHaveURL(/view=/);
  await expect(page.getByRole('heading', { name: 'Hoppskutt' })).toBeVisible();
});

test('route run loads the canvas and HUD without crashing', async ({ page }) => {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on('pageerror', (error) => {
    pageErrors.push(error.message);
  });
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  await page.goto('/');
  await page.getByRole('button', { name: /^start run$/i }).click();
  await expect(page).toHaveURL(/view=destinations/);

  await page.locator('.destination-topbar').getByRole('button', { name: /start run/i }).click();

  await expect(page.locator('canvas.run-screen__canvas')).toBeVisible();
  await expect(page.getByText('Loading the stage ahead...')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /exit run/i })).toBeVisible();
  await expect(page.getByText('Tandborste', { exact: true })).toBeVisible();
  await expect(page.getByText('Stage Notes')).toBeVisible();
  await expect(page.getByText('Level 1')).toBeVisible();
  await expect(page.getByText('Open Lanes')).toBeVisible();

  await page.getByRole('button', { name: /exit run/i }).click();
  await expect(page).toHaveURL(/view=destinations/);
  await page.locator('.destination-topbar').getByRole('button', { name: /start run/i }).click();
  await expect(page.locator('canvas.run-screen__canvas')).toBeVisible();
  await page.getByRole('button', { name: /exit run/i }).click();
  await expect(page).toHaveURL(/view=destinations/);
  await expect(
    page.getByRole('heading', { name: "Pick Chloe's next stage." }),
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
