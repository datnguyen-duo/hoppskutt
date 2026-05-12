import { expect, test, type Page } from '@playwright/test';

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => (
    Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth
  ));

  expect(overflow).toBeLessThanOrEqual(1);
}

test('homepage loads and opens the destination board', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Hoppskutt' })).toBeVisible();
  await expect(page).toHaveTitle('Hoppskutt | A Game for Chloe');
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
  await expect(
    page.locator('.destination-topbar .topbar__actions').getByRole('button', { name: /run route/i }),
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

  await page.getByRole('button', { name: /^story$/i }).click();
  await expect(page.getByText('RIP Chloe. I love and miss you everyday.')).toBeVisible();
  await expect(page.getByText('RIP Chloe 5/4/2026.')).toHaveCount(0);

  await page.getByRole('button', { name: /^credits$/i }).click();
  await expect(page.getByText('Traditional greek music by ckotty3')).toBeVisible();
  await expect(page.getByText('Funky Menu Loop by iamoneabe')).toBeVisible();
  await expect(page.getByText('Ganglat - SMV - MMF7 0662 08')).toBeVisible();
  await expect(page.getByText('Vietnam Bamboo Flute by VPRODMUSIC_Asia_BGM')).toBeVisible();
  await expect(page.getByText('Heavenly Loop by isaiah658')).toBeVisible();
  await expect(page.getByText('Path to Lake Land by HorrorPen')).toHaveCount(0);
  await expect(page.getByText('Invincibility Loop by Zane Little Music Sun')).toHaveCount(0);
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

  await page.getByRole('button', { name: /^pause$/i }).click();
  const pauseDialog = page.getByRole('dialog', { name: 'Run paused' });
  await expect(pauseDialog).toBeVisible();
  await expect(pauseDialog.getByRole('button', { name: /^resume$/i })).toBeVisible();
  await pauseDialog.getByRole('button', { name: /^resume$/i }).click();
  await expect(pauseDialog).toHaveCount(0);

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

test('phone layout keeps route picker and runner compact', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  await expectNoHorizontalOverflow(page);
  await page.getByRole('button', { name: /^choose route$/i }).click();
  await expect(page).toHaveURL(/view=destinations/);

  await expectNoHorizontalOverflow(page);
  const routeTrack = page.locator('.destination-route-track--top');
  await expect(routeTrack).toBeVisible();
  await expect(page.locator('.destination-hero-panel')).toBeVisible();

  const routeMetrics = await routeTrack.evaluate((element) => ({
    clientWidth: element.clientWidth,
    height: Math.round(element.getBoundingClientRect().height),
    scrollWidth: element.scrollWidth,
  }));
  expect(routeMetrics.scrollWidth).toBeGreaterThan(routeMetrics.clientWidth + 200);
  expect(routeMetrics.height).toBeLessThan(230);

  const destinationHeroTop = await page.locator('.destination-hero-panel').evaluate((element) => (
    Math.round(element.getBoundingClientRect().top)
  ));
  expect(destinationHeroTop).toBeLessThan(560);

  await page.locator('.destination-play-card').getByRole('button', { name: /run route/i }).click();
  await expect(page.locator('canvas.run-screen__canvas')).toBeVisible();
  await page.waitForTimeout(250);

  await expectNoHorizontalOverflow(page);
  const runMetrics = await page.evaluate(() => {
    const topbar = document.querySelector('.run-topbar')?.getBoundingClientRect();
    const tip = document.querySelector('.run-tip')?.getBoundingClientRect();
    const canvas = document.querySelector('canvas.run-screen__canvas')?.getBoundingClientRect();

    return {
      canvasHeight: Math.round(canvas?.height ?? 0),
      openPlayfield: Math.round((tip?.top ?? window.innerHeight) - (topbar?.bottom ?? 0)),
      tipCenter: Math.round((tip?.left ?? 0) + (tip?.width ?? 0) / 2),
      tipHeight: Math.round(tip?.height ?? 0),
      topbarBottom: Math.round(topbar?.bottom ?? 0),
      viewportCenter: Math.round(window.innerWidth / 2),
      viewportHeight: window.innerHeight,
    };
  });

  expect(runMetrics.canvasHeight).toBeGreaterThanOrEqual(runMetrics.viewportHeight - 1);
  expect(runMetrics.topbarBottom).toBeLessThan(130);
  expect(runMetrics.tipHeight).toBeLessThan(100);
  expect(Math.abs(runMetrics.tipCenter - runMetrics.viewportCenter)).toBeLessThanOrEqual(1);
  expect(runMetrics.openPlayfield).toBeGreaterThan(330);
});

test('tablet runner controls sit centered below the playfield', async ({ page }) => {
  await page.setViewportSize({ width: 820, height: 1180 });
  await page.goto('/');
  await page.getByRole('button', { name: /^choose route$/i }).click();
  await expect(page).toHaveURL(/view=destinations/);

  await page.locator('.destination-play-card').getByRole('button', { name: /run route/i }).click();
  await expect(page.locator('canvas.run-screen__canvas')).toBeVisible();
  await page.waitForTimeout(250);
  await expectNoHorizontalOverflow(page);

  const runTipMetrics = await page.locator('.run-tip').evaluate((element) => {
    const rect = element.getBoundingClientRect();

    return {
      center: Math.round(rect.left + rect.width / 2),
      viewportCenter: Math.round(window.innerWidth / 2),
    };
  });

  expect(Math.abs(runTipMetrics.center - runTipMetrics.viewportCenter)).toBeLessThanOrEqual(1);
});

test('landscape phone route strip keeps the selected route within reach', async ({ page }) => {
  await page.setViewportSize({ width: 667, height: 375 });
  await page.goto('/');
  await page.getByRole('button', { name: /^choose route$/i }).click();
  await expect(page).toHaveURL(/view=destinations/);

  await expectNoHorizontalOverflow(page);
  const routeTrack = page.locator('.destination-route-track--top');
  await expect(routeTrack).toBeVisible();
  await expect(page.locator('.destination-hero-panel')).toBeVisible();

  const landscapeMetrics = await routeTrack.evaluate((track) => {
    const hero = document.querySelector('.destination-hero-panel')?.getBoundingClientRect();
    const topbar = document.querySelector('.destination-topbar')?.getBoundingClientRect();

    return {
      heroTop: Math.round(hero?.top ?? 0),
      routeHeight: Math.round(track.getBoundingClientRect().height),
      routeScrollWidth: track.scrollWidth,
      routeWidth: track.clientWidth,
      topbarHeight: Math.round(topbar?.height ?? 0),
    };
  });

  expect(landscapeMetrics.routeScrollWidth).toBeGreaterThan(landscapeMetrics.routeWidth + 200);
  expect(landscapeMetrics.routeHeight).toBeLessThan(140);
  expect(landscapeMetrics.topbarHeight).toBeLessThan(275);
  expect(landscapeMetrics.heroTop).toBeLessThan(320);
});
