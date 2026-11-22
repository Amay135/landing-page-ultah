// Screenshot viewport HP kecil 320x568 dan 360x640.
const { chromium } = require('playwright');
const path = require('path');
const URL = 'http://127.0.0.1:8000/index.html';
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const vp of [{ w: 320, h: 568 }, { w: 360, h: 640 }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: 'networkidle' });
    if (await page.locator('#sandi').isVisible()) await page.locator('#sandi').fill('14022023');
    await page.locator('#tombolBuka').click();
    await page.waitForTimeout(1600);
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 400) { await page.evaluate(yy => scrollTo(0, yy), y); await page.waitForTimeout(40); }
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(600);
    for (const id of ['hero', 'kue', 'galeri', 'counter', 'surat', 'lampion', 'hadiah', 'footer']) {
      await page.evaluate(id => document.getElementById(id).scrollIntoView({ block: 'start' }), id);
      await page.waitForTimeout(250);
      await page.screenshot({ path: path.join(__dirname, 'kecil', `${vp.w}x${vp.h}-${id}.png`) });
    }
    const m = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth, sh: document.documentElement.scrollHeight }));
    console.log(vp.w + 'x' + vp.h, JSON.stringify(m));
    await ctx.close();
  }
  await browser.close();
})();
