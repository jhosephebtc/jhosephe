import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('o controle, o slider, o switch e o diálogo são operáveis por teclado', async ({ page }) => {
  await page.goto('/lab');
  const dial = page.getByRole('slider', { name: 'Adjust intensity' });
  await dial.focus();
  await page.keyboard.press('ArrowRight');
  await expect(dial).toHaveValue('65');
  await expect(page.getByText('65%', { exact: true }).first()).toBeVisible();
  const slider = page.getByRole('slider', { name: 'Intensity', exact: true });
  await slider.focus();
  await page.keyboard.press('Home');
  await expect(dial).toHaveValue('0');
  const control = page.getByRole('switch', { name: 'Ambient light' });
  await expect(control).toBeChecked();
  await control.focus();
  await page.keyboard.press('Space');
  await expect(control).not.toBeChecked();
  const trigger = page.getByRole('button', { name: 'Explore the control' });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  const smoothing = page.getByRole('slider', { name: 'Smoothing' });
  await expect(smoothing).toHaveAttribute('aria-valuenow', '60');
  await smoothing.focus();
  await page.keyboard.press('End');
  await expect(smoothing).toHaveAttribute('aria-valuenow', '100');
});

test('movimento reduzido deixa a superfície estática e controles visíveis', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/lab');
  await expect(page.getByRole('heading', { name: 'Matter responds.' })).toBeVisible();
  await expect(page.locator('.jh-shader canvas')).toHaveCount(0);
  await expect(page.locator('.jh-dial__knob')).toHaveCSS('transition-duration', '0s');
  await expect(page.locator('.jh-button__face').first()).toHaveCSS('transition-duration', '0s');
  await expect(page.locator('.jh-slider__thumb').first()).toHaveCSS('transition-duration', '0s');
});

test('layout em tela pequena não transborda e mantém alvos utilizáveis', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/lab');
  const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
  expect(widths.page).toBeLessThanOrEqual(widths.viewport);
  const box = await page.getByRole('switch', { name: 'Ambient light' }).boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
});

test('não há violações automaticamente detectáveis na tela inicial', async ({ page }) => {
  await page.goto('/lab');
  await page.locator('.deck').screenshot({ path: 'test-results/glass-controls.png' });
  await page.locator('.material-grid').screenshot({ path: 'test-results/glass-materials.png' });
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations).toEqual([]);
});
