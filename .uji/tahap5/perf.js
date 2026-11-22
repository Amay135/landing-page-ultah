// Ukur kelancaran frame dengan CPU diperlambat 4x (perkiraan HP menengah).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const URL = 'http://127.0.0.1:8000/index.html';
const log = [];

function catat(label, deltas) {
  const d = [...deltas].sort((a, b) => a - b);
  const p = (q) => d[Math.min(d.length - 1, Math.floor(d.length * q))];
  const hasil = {
    label,
    frame: d.length,
    rataMs: +(d.reduce((a, b) => a + b, 0) / d.length).toFixed(1),
    p95Ms: +p(0.95).toFixed(1),
    p99Ms: +p(0.99).toFixed(1),
    lebih33ms: d.filter((x) => x > 33).length,
  };
  log.push(hasil);
  console.log('  ' + label + ': ' + JSON.stringify(hasil));
}

const ukurFrame = (page, jumlah = 180) => page.evaluate((n) => new Promise((resolve) => {
  const d = [];
  let lalu = performance.now();
  const tik = (now) => {
    d.push(now - lalu);
    lalu = now;
    if (d.length >= n) resolve(d); else requestAnimationFrame(tik);
  };
  requestAnimationFrame(tik);
}), jumlah);

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  if (await page.locator('#sandi').isVisible()) await page.locator('#sandi').fill('28052026');
  await page.locator('#tombolBuka').click();
  await page.waitForTimeout(5500); // hujan confetti lebat selesai, tersisa hujan ringan

  const client = await ctx.newCDPSession(page);
  await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  console.log('CPU 4x lebih lambat');

  // Hero: confetti ringan + stiker + musik.
  catat('hero', await ukurFrame(page));

  // Kue: balon, api, halo + confetti ringan.
  await page.evaluate(() => document.getElementById('kue').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(500);
  catat('kue', await ukurFrame(page));

  // Lampion: goyangan, bintang, awan, dan saat lampion terbang + percikan.
  await page.evaluate(() => document.getElementById('lampion').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(400);
  catat('lampion diam', await ukurFrame(page));
  await page.locator('#lampionBesar').click({ force: true });
  await page.waitForTimeout(250);
  await page.locator('#harapanInput').fill('Semoga kita selalu bersama');
  await page.locator('#lampionLepas').click();
  catat('lampion terbang', await ukurFrame(page, 120));

  await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await ctx.close();

  // Reduced motion, CPU 4x: memastikan halaman tetap ringan.
  const ctxR = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const pageR = await ctxR.newPage();
  await pageR.goto(URL, { waitUntil: 'networkidle' });
  if (await pageR.locator('#sandi').isVisible()) await pageR.locator('#sandi').fill('28052026');
  await pageR.locator('#tombolBuka').click();
  await pageR.waitForTimeout(1000);
  const clientR = await ctxR.newCDPSession(pageR);
  await clientR.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  catat('reduced motion', await ukurFrame(pageR));
  await ctxR.close();

  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'perf.log'), JSON.stringify(log, null, 2));
})();
