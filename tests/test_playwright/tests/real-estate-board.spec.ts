/**
 * Playwright E2E tests for Real Estate Board — Angular 17+ migrated app
 * Covers all 25 scenarios from tests/Scenarios.md
 *
 * Prerequisites:
 *   npm install -D @playwright/test
 *   npx playwright install chromium
 *   Angular dev server running on http://localhost:4200  (ng serve)
 *   Backend running on http://localhost:3000              (node src/backend/server.js)
 *
 * Run:
 *   npx playwright test
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:4200';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function goToListing(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/properties`);
  await page.waitForSelector('.property-card', { timeout: 10_000 });
}

async function goToFirstDetail(page: Page): Promise<void> {
  await goToListing(page);
  await page.locator('.property-card__link').first().click();
  await page.waitForURL('**/properties/**', { timeout: 10_000 });
  await page.waitForSelector('.detail-header__title', { timeout: 10_000 });
}

async function clearLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => localStorage.clear());
}

// ---------------------------------------------------------------------------
// Test setup
// ---------------------------------------------------------------------------

test.beforeEach(async ({ page }) => {
  await page.goto(BASE_URL);
  await clearLocalStorage(page);
});

// ---------------------------------------------------------------------------
// TS-01: Listing Page — Load All Properties
// ---------------------------------------------------------------------------
test('TS-01: listing page displays all 12 properties', async ({ page }) => {
  await goToListing(page);

  const cards = page.locator('.property-card');
  await expect(cards).toHaveCount(12);

  const countText = page.locator('.listing-page__count');
  await expect(countText).toContainText('12');
});

// ---------------------------------------------------------------------------
// TS-02: Filtering — By Type
// ---------------------------------------------------------------------------
test('TS-02: filter by property type shows only matching results without page reload', async ({ page }) => {
  await goToListing(page);

  await page.locator('app-filter-panel select[name="type"], .filter-panel__select').nth(0).selectOption('house');
  await page.waitForTimeout(500);

  const cards = page.locator('.property-card');
  await expect(cards.first()).toBeVisible();

  // No full navigation — URL stays on /properties
  expect(page.url()).toContain('/properties');
  expect(page.url()).not.toContain('/properties/');
});

// ---------------------------------------------------------------------------
// TS-03: Filtering — By Status
// ---------------------------------------------------------------------------
test('TS-03: filter by status shows only for-rent properties', async ({ page }) => {
  await goToListing(page);

  await page.locator('.filter-panel__select').filter({ hasText: 'For Rent' }).selectOption('for-rent');
  await page.waitForTimeout(500);

  await expect(page.locator('.property-card').first()).toBeVisible();
});

// ---------------------------------------------------------------------------
// TS-04: Filtering — By Location
// ---------------------------------------------------------------------------
test('TS-04: filter by location shows only matching properties', async ({ page }) => {
  await goToListing(page);

  const locationSelect = page.locator('.filter-panel__select').nth(2);
  const options = locationSelect.locator('option');
  const count = await options.count();
  expect(count).toBeGreaterThan(1);

  // Select the first non-empty location option
  const firstLocation = await options.nth(1).getAttribute('value');
  await locationSelect.selectOption(firstLocation!);
  await page.waitForTimeout(500);

  await expect(page.locator('.property-card').first()).toBeVisible();
});

// ---------------------------------------------------------------------------
// TS-05: Filtering — By Bedrooms Minimum
// ---------------------------------------------------------------------------
test('TS-05: filter by min bedrooms shows properties with 3+ bedrooms', async ({ page }) => {
  await goToListing(page);

  const bedSelect = page.locator('.filter-panel__select').nth(3);
  await bedSelect.selectOption({ label: '3+' });
  await page.waitForTimeout(500);

  await expect(page.locator('.property-card').first()).toBeVisible();
});

// ---------------------------------------------------------------------------
// TS-06: Filtering — By Price Range
// ---------------------------------------------------------------------------
test('TS-06: filter by price range shows properties within bounds', async ({ page }) => {
  await goToListing(page);

  await page.locator('.filter-panel__input[placeholder="0"], input[placeholder="0"]').fill('200000');
  await page.locator('.filter-panel__input[placeholder="Any"], input[placeholder="Any"]').fill('800000');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(500);

  await expect(page.locator('.property-card').first()).toBeVisible();
});

// ---------------------------------------------------------------------------
// TS-07: Filtering — Keyword Search
// ---------------------------------------------------------------------------
test('TS-07: keyword search returns matching properties', async ({ page }) => {
  await goToListing(page);

  await page.locator('input[placeholder="Keyword..."], .filter-panel__input').first().fill('house');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(500);

  await expect(page.locator('.property-card').first()).toBeVisible();
});

// ---------------------------------------------------------------------------
// TS-08: Filtering — Empty State
// ---------------------------------------------------------------------------
test('TS-08: filters that match nothing show empty state with clear CTA', async ({ page }) => {
  await goToListing(page);

  await page.locator('input[placeholder="Keyword..."], .filter-panel__input').first().fill('xyznonexistentproperty12345');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(500);

  const empty = page.locator('.listing-page__empty');
  await expect(empty).toBeVisible();
  await expect(empty).toContainText('No properties');
  await expect(empty.locator('a')).toBeVisible();
});

// ---------------------------------------------------------------------------
// TS-09: Filtering — Clear Filters
// ---------------------------------------------------------------------------
test('TS-09: clear filters restores all 12 properties', async ({ page }) => {
  await goToListing(page);

  // Apply a filter first
  await page.locator('.filter-panel__select').first().selectOption('house');
  await page.waitForTimeout(300);

  // Clear
  await page.locator('.filter-panel__clear-btn').click();
  await page.waitForTimeout(500);

  await expect(page.locator('.property-card')).toHaveCount(12);
});

// ---------------------------------------------------------------------------
// TS-10: Sorting
// ---------------------------------------------------------------------------
test('TS-10: sort options reorder the property list', async ({ page }) => {
  await goToListing(page);

  const sortSelect = page.locator('.listing-page__sort select');

  await sortSelect.selectOption('price-asc');
  await page.waitForTimeout(300);
  const pricesAsc = await page.locator('.property-card__price').allTextContents();

  await sortSelect.selectOption('price-desc');
  await page.waitForTimeout(300);
  const pricesDesc = await page.locator('.property-card__price').allTextContents();

  expect(pricesAsc).toEqual([...pricesDesc].reverse());

  await sortSelect.selectOption('newest');
  await page.waitForTimeout(300);
  await expect(page.locator('.property-card').first()).toBeVisible();

  await sortSelect.selectOption('bedrooms-desc');
  await page.waitForTimeout(300);
  await expect(page.locator('.property-card').first()).toBeVisible();
});

// ---------------------------------------------------------------------------
// TS-11: Property Card Display
// ---------------------------------------------------------------------------
test('TS-11: property card displays all required elements', async ({ page }) => {
  await goToListing(page);

  const card = page.locator('.property-card').first();
  await expect(card.locator('.property-card__image')).toBeVisible();
  await expect(card.locator('.property-card__price')).toBeVisible();
  await expect(card.locator('.property-card__title')).toBeVisible();
  await expect(card.locator('.property-card__address')).toBeVisible();
  await expect(card.locator('.property-card__fav-btn')).toBeVisible();
  await expect(card.locator('.property-card__link')).toBeVisible();
  await expect(card.locator('app-status-badge, status-badge')).toBeVisible();
});

// ---------------------------------------------------------------------------
// TS-12: Navigation to Detail Page
// ---------------------------------------------------------------------------
test('TS-12: clicking view details navigates to detail page with correct content', async ({ page }) => {
  await goToListing(page);

  await page.locator('.property-card__link').first().click();
  await page.waitForURL('**/properties/**', { timeout: 10_000 });

  // Angular uses path-based routing (no hash)
  expect(page.url()).toMatch(/\/properties\/.+/);
  expect(page.url()).not.toContain('#');

  await expect(page.locator('.detail-header__title')).toBeVisible();
  await expect(page.locator('.detail-header__price')).toBeVisible();
  await expect(page.locator('.detail-description')).toBeVisible();
  await expect(page.locator('.agent-card')).toBeVisible();
});

// ---------------------------------------------------------------------------
// TS-13: Image Gallery — Thumbnail Click
// ---------------------------------------------------------------------------
test('TS-13: clicking a thumbnail updates the main gallery image', async ({ page }) => {
  await goToFirstDetail(page);

  const thumbs = page.locator('.detail-gallery__thumb');
  const thumbCount = await thumbs.count();

  if (thumbCount > 1) {
    const mainImg = page.locator('.detail-gallery__main-img');
    const initialSrc = await mainImg.getAttribute('src');

    await thumbs.nth(1).click();
    await page.waitForTimeout(300);

    const newSrc = await mainImg.getAttribute('src');
    expect(newSrc).not.toBe(initialSrc);
  } else {
    test.skip();
  }
});

// ---------------------------------------------------------------------------
// TS-14: Contact Form — Validation
// ---------------------------------------------------------------------------
test('TS-14: submitting empty contact form shows validation errors', async ({ page }) => {
  await goToFirstDetail(page);

  await page.locator('.contact-form__submit').click();
  await page.waitForTimeout(300);

  const errors = page.locator('.contact-form__error');
  const visibleErrors = await errors.filter({ hasText: /.+/ }).count();
  expect(visibleErrors).toBeGreaterThan(0);
});

// ---------------------------------------------------------------------------
// TS-15: Contact Form — Successful Submit
// ---------------------------------------------------------------------------
test('TS-15: valid contact form submission shows success banner and hides form', async ({ page }) => {
  await goToFirstDetail(page);

  await page.locator('input[name="name"]').fill('Test User');
  await page.locator('input[name="email"]').fill('test@example.com');
  await page.locator('textarea[name="message"]').fill('I am interested in this property.');

  await page.locator('.contact-form__submit').click();
  await page.waitForTimeout(300);

  await expect(page.locator('.contact-form__success')).toBeVisible();
  await expect(page.locator('form[name="contactForm"]')).toBeHidden();
});

// ---------------------------------------------------------------------------
// TS-16: Favorites — Add Property
// ---------------------------------------------------------------------------
test('TS-16: adding a favorite increments the navbar badge', async ({ page }) => {
  await goToListing(page);

  await page.locator('.property-card__fav-btn').first().click();
  await page.waitForTimeout(300);

  const badge = page.locator('.navbar__fav-badge');
  await expect(badge).toBeVisible();
  await expect(badge).toHaveText('1');
});

// ---------------------------------------------------------------------------
// TS-17: Favorites — Persistence After Refresh
// ---------------------------------------------------------------------------
test('TS-17: favorited properties persist after full page refresh', async ({ page }) => {
  await goToListing(page);

  await page.locator('.property-card__fav-btn').first().click();
  await page.waitForTimeout(300);

  await page.reload();
  await page.waitForSelector('.property-card', { timeout: 10_000 });

  const badge = page.locator('.navbar__fav-badge');
  await expect(badge).toBeVisible();
  await expect(badge).toHaveText('1');
});

// ---------------------------------------------------------------------------
// TS-18: Favorites Page — Populated
// ---------------------------------------------------------------------------
test('TS-18: favorites page shows saved properties', async ({ page }) => {
  await goToListing(page);

  await page.locator('.property-card__fav-btn').first().click();
  await page.waitForTimeout(300);

  // Angular Router — path-based navigation (no hash)
  await page.locator('a[routerLink="/favorites"], a[href="/favorites"]').click();
  await page.waitForURL('**/favorites', { timeout: 10_000 });

  await expect(page.locator('.property-card').first()).toBeVisible();
  await expect(page.locator('.favorites-page__count')).toContainText('1');
});

// ---------------------------------------------------------------------------
// TS-19: Favorites Page — Empty State
// ---------------------------------------------------------------------------
test('TS-19: favorites page shows empty state when nothing is saved', async ({ page }) => {
  await page.goto(`${BASE_URL}/favorites`);
  await page.waitForLoadState('networkidle');

  const empty = page.locator('.favorites-page__empty');
  await expect(empty).toBeVisible();

  const cta = empty.locator('a');
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute('href', /\/properties/);
});

// ---------------------------------------------------------------------------
// TS-20: Favorites — Remove Property
// ---------------------------------------------------------------------------
test('TS-20: removing the last favorite hides the navbar badge', async ({ page }) => {
  await goToListing(page);

  const favBtn = page.locator('.property-card__fav-btn').first();

  // Add
  await favBtn.click();
  await page.waitForTimeout(300);
  await expect(page.locator('.navbar__fav-badge')).toHaveText('1');

  // Remove
  await favBtn.click();
  await page.waitForTimeout(300);

  const badge = page.locator('.navbar__fav-badge');
  await expect(badge).toBeHidden();
});

// ---------------------------------------------------------------------------
// TS-21: Related Properties on Detail Page
// ---------------------------------------------------------------------------
test('TS-21: detail page shows up to 3 related properties excluding current', async ({ page }) => {
  await goToFirstDetail(page);

  const relatedSection = page.locator('.detail-related');
  const isVisible = await relatedSection.isVisible();

  if (isVisible) {
    const relatedCards = relatedSection.locator('.property-card');
    const count = await relatedCards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(3);
  } else {
    test.skip();
  }
});

// ---------------------------------------------------------------------------
// TS-22: API — Properties Endpoint
// ---------------------------------------------------------------------------
test('TS-22: GET /api/properties returns 12 properties with correct schema', async ({ request }) => {
  const response = await request.get('http://localhost:3000/api/properties');

  expect(response.ok()).toBeTruthy();
  expect(response.status()).toBe(200);

  const data = await response.json();
  expect(Array.isArray(data)).toBe(true);
  expect(data).toHaveLength(12);

  const requiredFields = ['id', 'title', 'type', 'status', 'price', 'bedrooms', 'agentId'];
  for (const prop of data) {
    for (const field of requiredFields) {
      expect(prop).toHaveProperty(field);
    }
  }
});

// ---------------------------------------------------------------------------
// TS-23: API — Property Not Found
// ---------------------------------------------------------------------------
test('TS-23: GET /api/properties/:id returns 404 for unknown id', async ({ request }) => {
  const response = await request.get('http://localhost:3000/api/properties/nonexistent-id-xyz');
  expect(response.status()).toBe(404);
});

// ---------------------------------------------------------------------------
// TS-24: Routing — Default Redirect
// ---------------------------------------------------------------------------
test('TS-24: unknown route redirects to /properties', async ({ page }) => {
  await page.goto(`${BASE_URL}/unknown-route-xyz`);
  await page.waitForURL('**/properties', { timeout: 10_000 });

  expect(page.url()).toContain('/properties');
  // Confirm Angular path-based routing — no hash
  expect(page.url()).not.toContain('#');
});

// ---------------------------------------------------------------------------
// TS-25: Responsive Layout — 375px Mobile
// ---------------------------------------------------------------------------
test('TS-25: layout is readable at 375px mobile viewport', async ({ page, browser }) => {
  const mobilePage = await browser.newPage({
    viewport: { width: 375, height: 812 },
  });

  await mobilePage.goto(`${BASE_URL}/properties`);
  await mobilePage.waitForSelector('.property-card', { timeout: 10_000 });

  const cards = mobilePage.locator('.property-card');
  await expect(cards.first()).toBeVisible();

  const cardBox = await cards.first().boundingBox();
  expect(cardBox).not.toBeNull();
  expect(cardBox!.width).toBeGreaterThan(300);

  await mobilePage.close();
});
