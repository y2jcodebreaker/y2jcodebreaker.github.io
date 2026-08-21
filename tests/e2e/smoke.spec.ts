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

test('the preprint shows no venue or review status', async ({ page }) => {
  await page.goto('/papers/cad');
  const body = await page.locator('body').innerText();
  expect(body.toLowerCase()).not.toContain('aaai');
  expect(body.toLowerCase()).not.toContain('under review');
  expect(body.toLowerCase()).not.toContain('submitted');
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
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto('/');
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});
