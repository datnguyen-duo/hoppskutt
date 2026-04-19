import { expect, test } from '@playwright/test';

test('homepage loads and opens the destination board', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Hoppskutt' })).toBeVisible();
  await expect(
    page.getByText('Start in Maryland and keep rolling all the way to Vietnam.'),
  ).toBeVisible();

  await page.getByRole('button', { name: /play/i }).first().click();

  await expect(page).toHaveURL(/view=destinations/);
  await expect(
    page.getByRole('heading', { name: 'Choose the next trailhead.' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: /play route/i })).toBeVisible();
});

test('route book navigation respects browser back', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /^play$/i }).first().click();
  await expect(page).toHaveURL(/view=destinations/);

  await page.getByRole('button', { name: /route book/i }).click();
  await expect(page).toHaveURL(/view=collection/);
  await expect(page.getByRole('heading', { name: "Chloe's route book." })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/view=destinations/);
  await expect(
    page.getByRole('heading', { name: 'Choose the next trailhead.' }),
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
  await page.getByRole('button', { name: /^play$/i }).first().click();
  await expect(page).toHaveURL(/view=destinations/);

  await page.getByRole('button', { name: /play route/i }).click();

  await expect(page.locator('canvas.run-screen__canvas')).toBeVisible();
  await expect(page.getByText('Loading the trail ahead...')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /exit run/i })).toBeVisible();
  await expect(page.getByText('Tandborste')).toBeVisible();
  await expect(page.getByText('Trail Notes')).toBeVisible();

  await page.getByRole('button', { name: /exit run/i }).click();
  await expect(page).toHaveURL(/view=destinations/);
  await page.getByRole('button', { name: /play route/i }).click();
  await expect(page.locator('canvas.run-screen__canvas')).toBeVisible();
  await page.getByRole('button', { name: /exit run/i }).click();
  await expect(page).toHaveURL(/view=destinations/);
  await expect(
    page.getByRole('heading', { name: 'Choose the next trailhead.' }),
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
