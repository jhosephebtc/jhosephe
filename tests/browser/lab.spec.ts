import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('o controle, o slider, o switch e o diálogo são operáveis por teclado', async ({ page }) => {
  await page.goto('/');
  const dial = page.getByRole('slider', { name: 'Ajustar intensidade' });
  await dial.focus();
  await page.keyboard.press('ArrowRight');
  await expect(dial).toHaveValue('65');
  await expect(page.getByText('65%', { exact: true }).first()).toBeVisible();
  const slider = page.getByRole('slider', { name: 'Intensidade', exact: true });
  await slider.focus();
  await page.keyboard.press('Home');
  await expect(dial).toHaveValue('0');
  const control = page.getByRole('switch', { name: 'Luz ambiente' });
  await expect(control).toBeChecked();
  await control.focus();
  await page.keyboard.press('Space');
  await expect(control).not.toBeChecked();
  const trigger = page.getByRole('button', { name: 'Explorar o controle' });
  await trigger.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('movimento reduzido deixa a superfície estática e controles visíveis', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'A matéria responde.' })).toBeVisible();
  await expect(page.locator('.jh-shader canvas')).toHaveCount(0);
  await expect(page.locator('.jh-dial__knob')).toHaveCSS('transition-duration', '0s');
});

test('layout em tela pequena não transborda e mantém alvos utilizáveis', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
  expect(widths.page).toBeLessThanOrEqual(widths.viewport);
  const box = await page.getByRole('switch', { name: 'Luz ambiente' }).boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
});

test('não há violações automaticamente detectáveis na tela inicial', async ({ page }) => {
  await page.goto('/');
  const result = await new AxeBuilder({ page }).analyze();
  expect(result.violations).toEqual([]);
});
