// Pastikan partikel sementara dibersihkan dan tidak menumpuk.
const { chromium } = require('playwright');
const URL = 'http://127.0.0.1:8000/index.html';
const hasil = [];
const ok = (n, l, i = '') => { hasil.push({ n, l: !!l, i }); console.log((l ? 'PASS' : 'FAIL') + '  ' + n + (i ? '  (' + i + ')' : '')); };

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  if (await page.locator('#sandi').isVisible()) await page.locator('#sandi').fill('28052026');
  await page.locator('#tombolBuka').click();
  await page.waitForTimeout(1400);

  // Lampion terbang: jejak dan lampion kecil harus habis.
  await page.locator('#lampion').scrollIntoViewIfNeeded();
  await page.locator('#lampionBesar').click({ force: true });
  await page.waitForTimeout(250);
  await page.locator('#harapanInput').fill('Semoga kita selalu bersama');
  await page.locator('#lampionLepas').click();
  await page.waitForTimeout(6500);
  const sisaLampion = await page.evaluate(() => ({
    jejak: document.querySelectorAll('.lampion__jejak').length,
    lahir: document.querySelectorAll('.lampion__lahir').length,
    siap: document.getElementById('lampionLain') && !document.getElementById('lampionLain').hidden,
  }));
  ok('jejak dan lampion kecil dibersihkan', sisaLampion.jejak === 0 && sisaLampion.lahir === 0 && sisaLampion.siap,
    JSON.stringify(sisaLampion));

  // Hati kartu alasan: dibuka-tutup berulang, lalu semuanya dibuang.
  await page.locator('#alasan').scrollIntoViewIfNeeded();
  const kartu = page.locator('.alasan__kartu').first();
  for (let i = 0; i < 4; i++) {
    await kartu.click();
    await page.waitForTimeout(250);
  }
  const saatTerbuka = await page.locator('.alasan__hati-terbang').count();
  await page.waitForTimeout(1600);
  const setelah = await page.locator('.alasan__hati-terbang').count();
  ok('hati kartu alasan dibersihkan', setelah === 0, 'saat terbuka=' + saatTerbuka + ', sisa=' + setelah);

  // Sparkle: klik beruntun tidak melewati batas dan habis setelah animasi.
  for (let i = 0; i < 8; i++) {
    await page.mouse.click(60 + i * 30, 260);
    await page.waitForTimeout(60);
  }
  const puncak = await page.locator('.sparkle__partikel').count();
  await page.waitForTimeout(1300);
  const sisaSparkle = await page.locator('.sparkle__partikel').count();
  ok('sparkle dibatasi 30 dan dibersihkan', puncak <= 30 && sisaSparkle === 0, 'puncak=' + puncak + ', sisa=' + sisaSparkle);

  ok('tanpa error console/page', errors.length === 0, errors.join(' | '));
  await ctx.close();
  await browser.close();
  const gagal = hasil.filter((r) => !r.l);
  console.log('\n===== RINGKASAN: ' + (hasil.length - gagal.length) + '/' + hasil.length + ' lolos =====');
  if (gagal.length) process.exitCode = 1;
})();
