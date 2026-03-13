import puppeteer from 'puppeteer';

const BASE = 'https://riechikamori.github.io/oyasumin';
const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 2 };
const DIR = './screenshots';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  // Clear storage
  await page.goto(BASE, { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.clear());
  await page.goto(BASE, { waitUntil: 'networkidle2' });
  await sleep(3000);

  // Find and click "はじめる" button
  const clicked = await page.evaluate(() => {
    const els = document.querySelectorAll('[role="button"]');
    for (const el of els) {
      if (el.textContent?.includes('はじめる')) {
        el.click();
        return true;
      }
    }
    return false;
  });
  console.log('Clicked はじめる:', clicked);
  await sleep(3000);

  await page.screenshot({ path: `${DIR}/02_setup.png`, fullPage: true });
  console.log('  ✅ 02_setup');

  // Type name
  await page.evaluate(() => {
    const input = document.querySelector('input');
    if (input) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
      ).set;
      nativeInputValueSetter.call(input, 'あゆみ');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await sleep(1000);

  // Click 22:30 time option
  await page.evaluate(() => {
    const els = document.querySelectorAll('[role="button"]');
    for (const el of els) {
      if (el.textContent?.trim() === '22:30') {
        el.click();
        return;
      }
    }
  });
  await sleep(1000);

  await page.screenshot({ path: `${DIR}/02_setup_filled.png`, fullPage: true });
  console.log('  ✅ 02_setup_filled');

  await browser.close();
  console.log('Done!');
})();
