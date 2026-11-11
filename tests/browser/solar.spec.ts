import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('observatório solar', () => {
  test.use({ geolocation: { latitude: -3.7319, longitude: -38.5267, accuracy: 20 }, permissions: ['geolocation'], timezoneId: 'Asia/Tokyo' });

  test('usa a posição autorizada e o fuso local, atualiza o instante e não envia coordenadas', async ({ page }) => {
    const errors: string[] = [];
    const externalRequests: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:4173') && !request.url().startsWith('data:')) externalRequests.push(request.url()); });
    await page.clock.setFixedTime(new Date('2026-11-10T15:00:00Z'));
    await page.goto('/solar');
    await expect(page.getByRole('heading', { name: 'Posição do Sol em tempo real' })).toBeAttached();
    await expect(page.getByText(/Dispositivo · -3.7319°, -38.5267°/)).toBeVisible();
    await expect(page.getByText('Hora local · America/Fortaleza', { exact: true })).toBeVisible();
    await expect(page.locator('.instrument__clock')).toHaveText('12:00:00');
    await expect(page.locator('.instrument-data dd').nth(1)).toHaveText(/05:(09|10)/);
    await expect(page.locator('.instrument-data dd').nth(2)).toHaveText(/17:2[56]/);
    const altitude = await page.locator('.instrument-data dd').first().textContent();
    await page.clock.setFixedTime(new Date('2026-11-10T15:05:00Z'));
    await expect(page.locator('.instrument__clock')).toHaveText('12:05:00');
    await expect(page.locator('.instrument-data dd').first()).not.toHaveText(altitude!);
    expect(errors).toEqual([]);
    expect(externalRequests).toEqual([]);
    await page.screenshot({ path: 'test-results/solar-desktop.png', fullPage: true });
  });

  test('fica legível em 375px, 768px e 1440px com Geist Sans e sem violações automáticas', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-11-10T15:00:00Z'));
    await page.goto('/solar');
    await expect(page.getByText(/Dispositivo ·/)).toBeVisible();
    for (const width of [375, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const result = await new AxeBuilder({ page }).analyze();
      expect(result.violations).toEqual([]);
    }
    await page.setViewportSize({ width: 375, height: 812 });
    const computedFonts = await page.locator('.solar-page').evaluate(element => Array.from(element.querySelectorAll('*')).filter(el => el.textContent?.trim()).map(el => getComputedStyle(el).fontFamily));
    expect(computedFonts.every(font => font.includes('Geist Variable') && !font.includes('Mono'))).toBe(true);
    await page.screenshot({ path: 'test-results/solar-mobile.png', fullPage: true });
  });

  test('permite coordenadas manuais, dia polar e retorno do foco ao fechar', async ({ page }) => {
    await page.clock.install({ time: new Date('2026-06-21T10:00:00Z') });
    await page.goto('/solar');
    const location = page.getByRole('button', { name: 'Sua localização' });
    await location.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByLabel('Nome do local', { exact: true }).fill('Tromsø');
    await page.getByLabel('Latitude', { exact: true }).fill('69.6492');
    await page.getByLabel('Longitude', { exact: true }).fill('18.9553');
    await page.getByLabel('Fuso horário', { exact: true }).fill('Europe/Oslo');
    await page.getByRole('button', { name: 'Aplicar localização' }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Tromsø' })).toBeFocused();
    await expect(page.locator('.instrument__caption').filter({ hasText: /^Dia polar$/ })).toBeAttached();
    await expect(page.locator('.instrument-data dd').nth(1)).toHaveText('—');
    await expect(page.getByText('Coordenadas manuais · 69.6492°, 18.9553°')).toBeVisible();
  });

  test('respeita movimento reduzido e cores forçadas', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce', forcedColors: 'active' });
    await page.goto('/solar');
    await expect(page.getByText(/Dispositivo ·/)).toBeVisible();
    await expect(page.locator('.instrument-mobile')).toBeVisible();
    await expect(page.locator('.instrument')).toBeHidden();
    await expect(page.getByRole('button', { name: 'Sua localização' })).toHaveCSS('transition-duration', '0s');
  });
});

test('permissão recusada mantém os dados vazios e oferece alternativa manual', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'geolocation', { configurable: true, value: { getCurrentPosition: (_ok: unknown, error: (e: { code: number }) => void) => error({ code: 1 }) } });
  });
  await page.goto('/solar');
  await expect(page.getByText(/Acesso à localização não autorizado\./).first()).toBeVisible();
  await expect(page.locator('.instrument-data dd').nth(1)).toHaveText('—');
  await expect(page.getByText('EM TEMPO REAL', { exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Configurar localização' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByLabel('Nome do local', { exact: true })).toHaveValue('Fortaleza');
  await page.getByLabel('Nome do local', { exact: true }).fill('Local manual');
  await page.getByRole('button', { name: 'Aplicar localização' }).click();
  await expect(page.getByRole('button', { name: 'Local manual' })).toBeVisible();
});
