import { expect, test } from '@playwright/test';

test('homepage loads and opens the destination board', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Hoppskutt' })).toBeVisible();
  await expect(
    page.getByText("Chloe's little arcade trip, from Maryland to Rainbow Bridge."),
  ).toBeVisible();

  await page.getByRole('button', { name: /choose route/i }).click();

  await expect(page).toHaveURL(/view=destinations/);
  await expect(
    page.getByRole('heading', { name: "Choose Chloe's route." }),
  ).toBeVisible();
  await expect(
    page.locator('.destination-topbar').getByRole('button', { name: /run route/i }),
  ).toBeVisible();
  await expect(
    page.locator('.destination-hero-panel').getByText('Level 1'),
  ).toBeVisible();
  await expect(
    page.locator('.destination-challenge-preview__tips').getByText('Easy lanes', {
      exact: true,
    }),
  ).toBeVisible();
});

test('route book navigation respects browser back', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /^choose route$/i }).click();
  await expect(page).toHaveURL(/view=destinations/);

  await page.getByRole('button', { name: /^book$/i }).click();
  await expect(page).toHaveURL(/view=collection/);
  await expect(page.getByRole('heading', { name: "Chloe's book." })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/view=destinations/);
  await expect(
    page.getByRole('heading', { name: "Choose Chloe's route." }),
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
  await page.getByRole('button', { name: /^choose route$/i }).click();
  await expect(page).toHaveURL(/view=destinations/);

  await page.locator('.destination-topbar').getByRole('button', { name: /run route/i }).click();

  await expect(page.locator('canvas.run-screen__canvas')).toBeVisible();
  await expect(page.getByText('Loading the route...')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^routes$/i })).toBeVisible();
  await expect(page.getByText('Tandborste', { exact: true })).toBeVisible();
  await expect(page.getByText('Run Note')).toBeVisible();
  await expect(page.getByText('Lv. 1')).toBeVisible();
  await expect(page.getByText('Open Lanes')).toBeVisible();

  await page.getByRole('button', { name: /^routes$/i }).click();
  await expect(page).toHaveURL(/view=destinations/);
  await page.locator('.destination-topbar').getByRole('button', { name: /run route/i }).click();
  await expect(page.locator('canvas.run-screen__canvas')).toBeVisible();
  await page.getByRole('button', { name: /^routes$/i }).click();
  await expect(page).toHaveURL(/view=destinations/);
  await expect(
    page.getByRole('heading', { name: "Choose Chloe's route." }),
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
