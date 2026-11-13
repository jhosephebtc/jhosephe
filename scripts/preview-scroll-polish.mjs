import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const outDir =
  'C:/Users/Administrador/AppData/Local/Cursor/AgentStores/cursor_agent_stores/bc-e6681aab-f8ca-47c9-bc38-86148565c0d4/files/media';

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

async function shot(route, selector, file) {
  await page.goto(`http://127.0.0.1:4173${route}`, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(500);
  const el = page.locator(selector).first();
  if ((await el.count()) === 0) {
    await page.screenshot({ path: `${outDir}/${file.replace('.png', '-page.png')}` });
    console.log('missing', file);
    return null;
  }
  await el.screenshot({ path: `${outDir}/${file}` });
  console.log('ok', file);
  return el;
}

await shot('/components/simple-scroll', '.jh-simple-scroll', 'simple-scroll-inline-meta.png');
const simpleMetrics = await page.evaluate(() => {
  const btn = document.querySelector('.jh-simple-scroll__item.is-selected');
  if (!btn) return null;
  const meta = btn.querySelector('.jh-simple-scroll__meta');
  const after = getComputedStyle(btn, '::after');
  const br = btn.getBoundingClientRect();
  const mr = meta?.getBoundingClientRect();
  return {
    metaText: meta?.textContent?.trim(),
    metaInline: !!meta && meta.parentElement?.tagName === 'STRONG',
    afterML: after.marginLeft,
    afterBg: after.backgroundColor,
    gapMetaToRight: mr ? br.right - mr.right : null,
    justify: getComputedStyle(btn).justifyContent,
  };
});
console.log('simple', JSON.stringify(simpleMetrics));

await shot('/components/scroll-area', '.jh-scroll-frame', 'scroll-area-inline-detail.png');
const scrollMetrics = await page.evaluate(() => {
  const frame = document.querySelector('.jh-scroll-frame');
  const area = frame?.querySelector('.jh-scroll-area');
  const btn = document.querySelector('.jh-scroll-option[aria-pressed="true"]');
  if (!frame || !area) return null;
  return {
    framePadR: getComputedStyle(frame).paddingRight,
    areaPadR: getComputedStyle(area).paddingRight,
    detail: btn?.querySelector('small')?.textContent?.trim(),
    afterBg: btn ? getComputedStyle(btn, '::after').backgroundColor : null,
    afterML: btn ? getComputedStyle(btn, '::after').marginLeft : null,
  };
});
console.log('scroll-area', JSON.stringify(scrollMetrics));

await shot('/components/accordion-scroll', '.jh-scroll-frame.jh-accordion-scroll, .jh-accordion--scroll', 'accordion-scroll-equal-inset.png');
const accMetrics = await page.evaluate(() => {
  const frame = document.querySelector('.jh-scroll-frame.jh-accordion-scroll, .jh-scroll-frame');
  const area = frame?.querySelector('.jh-scroll-area');
  if (!frame || !area) return null;
  return {
    framePadR: getComputedStyle(frame).paddingRight,
    areaPadR: getComputedStyle(area).paddingRight,
  };
});
console.log('accordion', JSON.stringify(accMetrics));

await page.goto('http://127.0.0.1:4173/components/scroll-area', { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
const nav = page.locator('.library-nav-group a[aria-current="page"]').first();
await nav.screenshot({ path: `${outDir}/nav-selected-bolinha.png` });
const navMetrics = await page.evaluate(() => {
  const a = document.querySelector('.library-nav-group a[aria-current="page"]');
  if (!a) return null;
  const cs = getComputedStyle(a);
  const dot = a.querySelector('.library-nav-dot');
  return {
    bg: cs.backgroundColor,
    shadow: cs.boxShadow,
    text: a.textContent?.trim(),
    dotBg: dot ? getComputedStyle(dot).backgroundColor : null,
  };
});
console.log('nav', JSON.stringify(navMetrics));

await shot('/components/smooth-shape', '.library-demo-shape', 'smooth-shape-glass-solid.png');
const shapeMetrics = await page.evaluate(() => {
  const face = document.querySelector('.jh-glass-shape');
  if (!face) return null;
  const cs = getComputedStyle(face);
  return {
    bg: cs.backgroundColor,
    bgImage: cs.backgroundImage,
    shadow: cs.boxShadow,
  };
});
console.log('shape', JSON.stringify(shapeMetrics));

await browser.close();
console.log('done');
