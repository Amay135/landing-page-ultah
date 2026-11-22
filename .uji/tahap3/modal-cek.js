// Cek visual material setelah interaksi: kue terpotong, lightbox, kartu alasan,
// surat, modal lampion, toast hati, dan isi hadiah.
const { chromium } = require('playwright');
const path = require('path');
const URL = 'http://127.0.0.1:8000/index.html';
const OUT = path.join(__dirname, 'interaksi');

(async () => {
  require('fs').mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const vp of [{ w: 390, h: 844 }, { w: 1440, h: 900 }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));

    await page.goto(URL, { waitUntil: 'networkidle' });
    if (await page.locator('#sandi').isVisible()) await page.locator('#sandi').fill('14022023');
    await page.locator('#tombolBuka').click();
    await page.waitForTimeout(1500);

    // Kue: tiup, potong, beri satu potongan.
    await page.locator('#kue').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.locator('#tombolTiup').click();
    await page.waitForTimeout(1000);
    await page.locator('#tombolPotong').click();
    await page.waitForTimeout(1700);
    await page.locator('#namaPenerima').fill('Sayang');
    await page.locator('#tombolKasih').click();
    await page.waitForTimeout(2200);
    await page.screenshot({ path: path.join(OUT, `${vp.w}-kue-potong.png`) });

    // Lightbox galeri.
    await page.locator('#galeri').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.locator('.foto__bingkai').first().click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT, `${vp.w}-lightbox.png`) });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Kartu alasan terbuka.
    await page.locator('#alasan').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.locator('.alasan__kartu').first().click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(OUT, `${vp.w}-alasan-buka.png`) });

    // Surat.
    await page.locator('#surat').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.locator('#amplop').click();
    await page.waitForTimeout(1200);
    await page.locator('#suratLewati').click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, `${vp.w}-surat.png`) });
    await page.locator('#suratTutup').click();
    await page.waitForTimeout(400);

    // Modal lampion.
    await page.locator('#lampion').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.locator('#lampionBesar').click({ force: true });
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, `${vp.w}-lampion-modal.png`) });
    await page.locator('#lampionTutup').click();
    await page.waitForTimeout(300);

    // Toast hati di footer.
    await page.locator('#footer').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.locator('#hati').click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(OUT, `${vp.w}-footer-toast.png`) });

    // Isi hadiah.
    await page.locator('#kado').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.locator('#kado').click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(OUT, `${vp.w}-hadiah-buka.png`) });

    console.log(vp.w + 'px errors:', errors.length ? errors.join(' | ') : 'none');
    await ctx.close();
  }
  await browser.close();
})();
