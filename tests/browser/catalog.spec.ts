import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('catalog filters and navigates without reloading, with working history', async ({ page }) => {
  await page.goto('/components');
  await expect(page.locator('.library-card')).toHaveCount(17);
  await page.evaluate(() => { (window as unknown as { navigationProof: string }).navigationProof = 'kept'; });
  await page.getByRole('button', { name: 'Surfaces', exact: true }).click();
  await expect(page.locator('.library-card')).toHaveCount(3);
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await page.getByRole('searchbox', { name: 'Filter components' }).fill('Glass Slider');
  await expect(page.locator('.library-card')).toHaveCount(1);
  await page.locator('.library-card').getByRole('link').click();
  await expect(page).toHaveURL(/\/components\/slider$/);
  expect(await page.evaluate(() => (window as unknown as { navigationProof: string }).navigationProof)).toBe('kept');
  await expect(page.locator('#library-main')).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/\/components$/);
});

test('customization, source, clipboard, and registry agree', async ({ page, context, request }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/components/button');
  await page.getByRole('textbox', { name: 'Label', exact: true }).fill('Save my choice');
  await page.getByRole('combobox', { name: 'Variant', exact: true }).selectOption('secondary');
  await page.getByRole('switch', { name: 'Liquid feedback' }).click();
  await expect(page.getByRole('tabpanel', { name: 'Preview' }).getByRole('button', { name: 'Save my choice' })).toHaveAttribute('data-liquid', 'false');
  await page.getByRole('tab', { name: 'Preview', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Code', exact: true })).toBeFocused();
  await expect(page.locator('.library-code-block code')).toContainText('Save my choice');
  await expect(page.locator('.library-code-block code')).toContainText('liquid={false}');
  await page.getByRole('button', { name: 'Component files' }).click();
  await expect(page.locator('.library-code-block code')).toContainText('export const Button');
  await page.getByRole('combobox', { name: 'File', exact: true }).selectOption({ label: 'theme.css' });
  await expect(page.locator('.library-code-block code')).not.toContainText('body {');
  await page.getByRole('button', { name: 'Copy command' }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('npx shadcn@latest add http://127.0.0.1:4173/r/button.json');
  for (const id of ['menu', 'toast', 'date-picker', 'data-form']) {
    const item = await (await request.get(`/r/${id}.json`)).json();
    expect(item.files.some((f: {path: string}) => f.path.endsWith('/button.tsx'))).toBe(true);
  }
});

test('search, date picker, and menu manage keyboard focus', async ({ page }) => {
  await page.goto('/components');
  await page.getByRole('button', { name: /Search components/ }).click();
  await page.getByRole('textbox', { name: 'Search the library' }).fill('date picker');
  await page.getByRole('dialog').getByRole('link', { name: /Date Picker/ }).click();
  const trigger = page.getByRole('button', { name: /Choose a date/ });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: /15/ }).first().click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await expect(trigger).toContainText('15');
  await page.goto('/components/menu');
  const options = page.getByRole('button', { name: 'Options', exact: true });
  await options.focus();
  await page.keyboard.press('ArrowDown');
  await expect(page.getByRole('menuitem', { name: 'New project' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByText('New project selected')).toBeVisible();
  await expect(options).toBeFocused();
});

test('solid glass controls support keyboard, relative drag, and hand cursor', async ({ page }) => {
  await page.goto('/components/bar-slider');
  const bar = page.getByRole('slider', { name: 'Intensity', exact: true });
  await bar.focus(); await page.keyboard.press('End');
  await expect(bar).toHaveAttribute('aria-valuenow', '100');
  await page.keyboard.press('Home');
  await expect(bar).toHaveAttribute('aria-valuenow', '0');
  await page.goto('/components/dial');
  const dial = page.getByRole('slider', { name: 'Adjust intensity' });
  const initial = Number(await dial.inputValue());
  const box = (await dial.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await expect(dial).toHaveCSS('cursor', 'grab');
  await page.mouse.down();
  await expect(dial).toHaveValue(String(initial));
  await expect(dial).toHaveCSS('cursor', 'grabbing');
  await page.mouse.move(box.x + box.width / 2 + 30, box.y + box.height / 2 - 15, { steps: 5 });
  expect(Number(await dial.inputValue())).toBeGreaterThan(initial);
  await page.mouse.up();
  await expect(dial).toHaveCSS('cursor', 'grab');
});

test('gallery, search, and data form work with real state', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/components/gallery');
  await page.getByRole('button', { name: 'Next slide' }).click();
  await expect(page.getByRole('button', { name: 'Go to slide 2' })).toHaveAttribute('aria-current', 'true');
  await page.locator('.jh-gallery__viewport').focus(); await page.keyboard.press('End');
  await expect(page.getByRole('button', { name: 'Next slide' })).toBeDisabled();
  await page.goto('/components/search-input');
  await page.getByRole('searchbox', { name: 'Search the demo' }).fill('calendar');
  await expect(page.locator('.library-demo-search-results')).toHaveText('Calendar');
  await page.goto('/components/data-form');
  await page.getByLabel('Full name', { exact: true }).fill('Alex Morgan');
  await page.getByLabel('Email address', { exact: true }).fill('alex@example.com');
  await page.getByRole('button', { name: 'Save details' }).click();
  await expect(page.getByText('Your details have been saved.')).toBeVisible();
});

test('toast and source failures offer feedback and recovery', async ({ page }) => {
  await page.goto('/components/toast');
  await page.getByRole('button', { name: 'Show notification' }).click();
  await expect(page.locator('.jh-toast')).toBeVisible();
  await page.getByRole('button', { name: 'Dismiss notification' }).click();
  await expect(page.locator('.jh-toast')).toHaveCount(0);
  await page.route('**/r/dial.json', route => route.fulfill({ status: 503, body: 'unavailable' }));
  await page.goto('/components/dial');
  await page.getByRole('tab', { name: 'Code', exact: true }).click();
  await page.getByRole('button', { name: 'Component files' }).click();
  await expect(page.getByText('Couldn’t load the source files.')).toBeVisible();
  await page.unroute('**/r/dial.json');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.locator('.library-code-block code')).toContainText('export function Dial');
});

test('light catalog and extra components are accessible and fit mobile', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of ['/', '/components', '/components/button', '/components/calendar', '/components/data-form', '/components/gallery']) {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
  await page.goto('/components');
  await page.screenshot({ path: 'test-results/catalog-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 375, height: 812 });
  for (const route of ['/components', '/components/calendar', '/components/data-form', '/components/gallery', '/installation']) {
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.goto('/components/dial');
  await page.screenshot({ path: 'test-results/catalog-mobile.png', fullPage: true });
});
