import { expect, test } from '@playwright/test';

test('homepage loads and opens the destination board', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Hoppskutt' })).toBeVisible();
  await expect(
    page.getByText("A game dedicated to Chloe's many adventures."),
  ).toBeVisible();

  await page.getByRole('button', { name: /choose route/i }).click();

  await expect(page).toHaveURL(/view=destinations/);
  await expect(
    page.getByRole('heading', { name: 'Choose a route.' }),
  ).toBeVisible();
  await expect(
    page.locator('.destination-play-card').getByRole('button', { name: /run route/i }),
  ).toBeVisible();
  await expect(page.locator('.destination-hero-panel').getByText('Lv. 1')).toBeVisible();
  await expect(page.locator('.destination-hero-panel__copy p')).toHaveCount(1);
  await expect(page.locator('.destination-topbar .destination-stop-card')).toHaveCount(8);
  await expect(
    page.locator('.destination-topbar .destination-stop-card[aria-current="true"]'),
  ).toContainText('Home Greenway');
  await expect(
    page.locator('.destination-challenge-preview__tips').getByText('Path right', {
      exact: true,
    }),
  ).toBeVisible();
});

test('homepage menu keeps the trip guidance short', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /menu/i }).click();

  const tripPanel = page.locator('.start-menu-panel');
  await expect(tripPanel.getByText('Choose any open stop.')).toBeVisible();
  await expect(tripPanel.getByText("Clear routes to fill Chloe's book.")).toBeVisible();
  await expect(tripPanel.getByText('Helpers unlock as the trip grows.')).toBeVisible();
  await expect(tripPanel).not.toContainText('Maryland');
  await expect(tripPanel).not.toContainText('Rainbow Bridge');
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
    page.getByRole('heading', { name: 'Choose a route.' }),
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

  await page.locator('.destination-play-card').getByRole('button', { name: /run route/i }).click();

  await expect(page.locator('canvas.run-screen__canvas')).toBeVisible();
  await expect(page.getByText('Loading the route...')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^exit$/i })).toBeVisible();
  await expect(page.getByText('Tandborste', { exact: true })).toBeVisible();
  await expect(page.getByText('Run Note')).toBeVisible();
  await expect(page.getByText('Lv. 1')).toBeVisible();
  await expect(page.getByText('Home Greenway')).toBeVisible();

  await page.getByRole('button', { name: /^exit$/i }).click();
  await expect(page).toHaveURL(/view=destinations/);
  await page.locator('.destination-play-card').getByRole('button', { name: /run route/i }).click();
  await expect(page.locator('canvas.run-screen__canvas')).toBeVisible();
  await page.getByRole('button', { name: /^exit$/i }).click();
  await expect(page).toHaveURL(/view=destinations/);
  await expect(
    page.getByRole('heading', { name: 'Choose a route.' }),
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
});
