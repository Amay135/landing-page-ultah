// Verifikasi tombol mute setelah fade-out 2,2 dtk.
const { chromium } = require('playwright');
const URL = 'http://127.0.0.1:8000/index.html';
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const vp of [{ w: 320, h: 568 }, { w: 360, h: 800 }, { w: 390, h: 844 }, { w: 768, h: 1024 }, { w: 1440, h: 900 }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: 'networkidle' });
    if (await page.locator('#sandi').isVisible()) await page.locator('#sandi').fill('14022023');
    await page.locator('#tombolBuka').click();
    await page.waitForTimeout(1200);
    await page.locator('#tombolMute').click();
    await page.waitForTimeout(3000);
    const a = await page.evaluate(() => ({ paused: document.getElementById('musik').paused, vol: document.getElementById('musik').volume, pressed: document.getElementById('tombolMute').getAttribute('aria-pressed') }));
    await page.locator('#tombolMute').click();
    await page.waitForTimeout(1000);
    const b = await page.evaluate(() => ({ paused: document.getElementById('musik').paused, vol: document.getElementById('musik').volume, pressed: document.getElementById('tombolMute').getAttribute('aria-pressed') }));
    console.log(`${vp.w}px  mute=${!a.paused ? 'FAIL' : 'PASS'} ${JSON.stringify(a)}  unmute=${b.paused ? 'FAIL' : 'PASS'} ${JSON.stringify(b)}`);
    await ctx.close();
  }
  await browser.close();
})();
