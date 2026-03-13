import puppeteer from 'puppeteer';

const BASE = 'https://riechikamori.github.io/oyasumin';
const VIEWPORT = { width: 390, height: 844, deviceScaleFactor: 2 };
const DIR = './screenshots';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function shot(page, name) {
  await sleep(1000);
  await page.screenshot({ path: `${DIR}/${name}.png` });
  console.log(`  ✅ ${name}`);
}

function clickText(page, text) {
  return page.evaluate((t) => {
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walk.nextNode()) {
      if (walk.currentNode.textContent?.trim() === t) {
        let el = walk.currentNode.parentElement;
        while (el && !el.getAttribute('role')) el = el.parentElement;
        if (el) { el.click(); return true; }
        walk.currentNode.parentElement?.click();
        return true;
      }
    }
    return false;
  }, text);
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  // Clear storage
  await page.goto(BASE, { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.clear());

  // 1. Welcome
  await page.goto(BASE, { waitUntil: 'networkidle2' });
  await sleep(2000);
  await shot(page, '01_welcome');

  // 2. Setup (click はじめる)
  await clickText(page, 'はじめる');
  await sleep(2000);
  await shot(page, '02_setup');

  // Fill name using React-compatible input
  await page.evaluate(() => {
    const input = document.querySelector('input');
    if (!input) return;
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, 'value'
    )?.set;
    if (nativeSetter) {
      nativeSetter.call(input, 'あゆみ');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
  await sleep(500);
  await clickText(page, '22:30');
  await sleep(500);
  await shot(page, '02_setup_filled');

  // Click スタート
  await clickText(page, 'スタート');
  await sleep(3000);

  // 3. Home
  await shot(page, '03_home');

  // Navigate tabs by clicking tab labels
  // 4. Night
  await clickText(page, 'コンテンツ');
  await sleep(2000);
  await shot(page, '04_night');

  // 5. Log
  await clickText(page, 'ログ');
  await sleep(2000);
  await shot(page, '05_log');

  // 6. Report
  await clickText(page, 'レポート');
  await sleep(2000);
  await shot(page, '06_report');

  await browser.close();
  console.log('\nAll done!');
})();
