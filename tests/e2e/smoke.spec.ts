import { test, expect } from '@playwright/test';

test('homepage renders identity and research', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Kedar Joshi');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByText('Do models reason, or pattern-match?')).toBeVisible();
});

test('the unrendered paper does not appear', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Perturbation-Aware Fine-Tuning')).toHaveCount(0);
});

// Two papers are under review at venues with anonymity expectations, and the
// site must disclose nothing about their submission status. Scoped to a single
// page this guard once passed while a leak sat on a different one, so it now
// covers every route.
const REVIEW_STATUS_TERMS = [
  'aaai',
  'iclr',
  'emnlp',
  'under review',
  'submitted for',
  'in submission',
  'camera-ready',
  'camera ready',
  'anonymity period',
];

for (const path of ['/', '/cv', '/papers/cad', '/papers/logiqate', '/papers/quantization-probe']) {
  test(`no review-status disclosure anywhere in ${path}`, async ({ page }) => {
    await page.goto(path);

    // Full serialised HTML — includes <head>, meta tags and JSON-LD,
    // which body.innerText() silently excludes.
    const html = (await page.content()).toLowerCase();
    for (const forbidden of REVIEW_STATUS_TERMS) {
      expect(html, `forbidden string "${forbidden}" found in ${path}`).not.toContain(forbidden);
    }
  });
}

test('the preprint renders its status label', async ({ page }) => {
  await page.goto('/papers/cad');
  await expect(page.getByText('Preprint')).toBeVisible();
});

test('paper detail pages resolve', async ({ page }) => {
  for (const slug of ['logiqate', 'cad']) {
    const response = await page.goto(`/papers/${slug}`);
    expect(response?.status()).toBe(200);
  }
});

test('cv page and pdf both resolve', async ({ page }) => {
  const html = await page.goto('/cv');
  expect(html?.status()).toBe(200);
  const pdf = await page.request.get('/cv.pdf');
  expect(pdf.status()).toBe(200);
});

test('no horizontal scroll at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});
