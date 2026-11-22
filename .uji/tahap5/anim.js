// Rekam urutan pisau dan penyajian untuk memeriksa sinkronisasi animasi.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const URL = 'http://127.0.0.1:8000/index.html';
const OUT = path.join(__dirname, 'anim');
fs.mkdirSync(OUT, { recursive: true });

const status = (page) => page.evaluate(() => {
  const irisan = document.querySelector('.kue__potongan--sajikan .kue__irisan');
  const cs = irisan ? getComputedStyle(irisan) : null;
  return {
    notch: document.getElementById('kueSisaNotch').getAttribute('width'),
    pisauOpacity: getComputedStyle(document.getElementById('kue-pisau')).opacity,
    garisOpacity: getComputedStyle(document.getElementById('kue-garis-potong')).opacity,
    formTampil: !document.getElementById('kueKartu').hidden,
    irisanOpacity: cs ? cs.opacity : null,
    irisanTransform: cs ? cs.transform : null,
    badge: document.querySelectorAll('.kue__badge').length,
  };
});

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  if (await page.locator('#sandi').isVisible()) await page.locator('#sandi').fill('14022023');
  await page.locator('#tombolBuka').click();
  await page.waitForTimeout(1400);
  await page.locator('#kue').scrollIntoViewIfNeeded();
  await page.locator('#tombolTiup').click();
  await page.waitForTimeout(1000);

  console.log('--- potong: pisau, garis, mask, kartu ---');
  await page.locator('#tombolPotong').click();
  let t = 0;
  for (const ms of [0, 300, 560, 820, 1050, 1150, 1450]) {
    await page.waitForTimeout(ms - t);
    t = ms;
    console.log(ms + 'ms', JSON.stringify(await status(page)));
    await page.screenshot({ path: path.join(OUT, `potong-${ms}.png`) });
  }

  console.log('--- saji: irisan melengkung ke piring, badge saat mendarat ---');
  await page.locator('#namaPenerima').fill('Sayang');
  await page.locator('#tombolKasih').click();
  t = 0;
  for (const ms of [0, 200, 550, 900, 1250]) {
    await page.waitForTimeout(ms - t);
    t = ms;
    console.log(ms + 'ms', JSON.stringify(await status(page)));
    await page.screenshot({ path: path.join(OUT, `saji-${ms}.png`) });
  }
  await browser.close();
})();
