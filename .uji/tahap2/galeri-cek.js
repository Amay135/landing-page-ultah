const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const w of [768, 1000, 1440]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 1024 } });
    const page = await ctx.newPage();
    await page.goto('http://127.0.0.1:8000/index.html', { waitUntil: 'networkidle' });
    if (await page.locator('#sandi').isVisible()) await page.locator('#sandi').fill('28052026');
    await page.locator('#tombolBuka').click();
    await page.waitForTimeout(1400);
    await page.locator('#galeri').scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await page.locator('#galeri').screenshot({ path: path.join(__dirname, 'galeri-' + w + '.png') });
    const rows = await page.evaluate(() => [...document.querySelectorAll('#galeriDaftar .foto')].map((el, i) => { const r = el.getBoundingClientRect(); return { i: i + 1, top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) }; }));
    console.log(w + 'px:'); rows.forEach(r => console.log('  #' + r.i + ' top=' + r.top + ' left=' + r.left + ' w=' + r.w + ' h=' + r.h));
    await ctx.close();
  }
  await browser.close();
})();
