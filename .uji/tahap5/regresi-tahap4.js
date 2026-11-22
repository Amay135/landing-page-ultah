// Regresi Tahap 4 setelah polish motion: badge nama panjang, surat sampai tanda tangan, font.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const URL = 'http://127.0.0.1:8000/index.html';
const OUT = path.join(__dirname, 'sesudah');
const hasil = [];
const ok = (n, l, i = '') => { hasil.push({ n, l: !!l, i }); console.log((l ? 'PASS' : 'FAIL') + '  ' + n + (i ? '  (' + i + ')' : '')); };

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const vp of [{ w: 320, h: 800 }, { w: 360, h: 800 }]) {
    console.log('\n===== ' + vp.w + 'px =====');
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    if (await page.locator('#sandi').isVisible()) await page.locator('#sandi').fill('28052026');
    await page.locator('#tombolBuka').click();
    await page.waitForTimeout(1400);

    // Badge penerima dengan nama 30 karakter.
    await page.locator('#kue').scrollIntoViewIfNeeded();
    await page.locator('#tombolTiup').click();
    await page.waitForTimeout(1000);
    await page.locator('#tombolPotong').click();
    await page.waitForTimeout(1500);
    const nama = 'Namayangpalingpanjang12345678'.slice(0, 30);
    await page.locator('#namaPenerima').fill(nama);
    await page.locator('#tombolKasih').click();
    await page.waitForTimeout(1600);
    const badge = await page.evaluate(() => {
      const b = document.querySelector('.kue__badge');
      const cs = getComputedStyle(b);
      return {
        teks: b.textContent.trim(),
        lebar: b.clientWidth,
        isi: b.scrollWidth,
        whiteSpace: cs.whiteSpace,
        overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });
    ok('badge nama 30 karakter tidak terpotong', badge.teks.endsWith(nama) && badge.isi <= badge.lebar + 1 && badge.whiteSpace === 'normal',
      JSON.stringify({ teks: badge.teks, lebar: badge.lebar, isi: badge.isi }));
    ok('nama panjang tidak membuat scroll horizontal', !badge.overflowX);

    // Surat sampai tanda tangan.
    await page.locator('#surat').scrollIntoViewIfNeeded();
    await page.locator('#amplop').click();
    await page.waitForTimeout(1600);
    await page.locator('#suratLewati').click();
    await page.waitForTimeout(200);
    const surat = await page.evaluate(() => {
      const kertas = document.getElementById('suratKertas');
      const isi = document.getElementById('suratIsi').textContent;
      kertas.scrollTop = kertas.scrollHeight;
      return {
        akhir: isi.slice(-20),
        bisaScroll: kertas.scrollHeight > kertas.clientHeight,
        scrollTop: kertas.scrollTop,
        font: getComputedStyle(document.getElementById('suratIsi')).fontFamily,
      };
    });
    ok('surat bisa digulir sampai tanda tangan', surat.bisaScroll && surat.scrollTop > 0 && surat.akhir.includes('Aku'),
      JSON.stringify({ akhir: surat.akhir, scrollTop: Math.round(surat.scrollTop) }));
    ok('surat memakai Caveat', /Caveat/.test(surat.font), surat.font);
    await page.screenshot({ path: path.join(OUT, vp.w + '-surat-tanda-tangan.png') });
    await page.locator('#suratTutup').click();
    await page.waitForTimeout(300);

    const fonts = await page.evaluate(async () => {
      await document.fonts.ready;
      return {
        pacifico: document.fonts.check('16px Pacifico'),
        caveat: document.fonts.check('16px Caveat'),
        nunito: document.fonts.check('16px Nunito'),
      };
    });
    ok('tiga font tetap termuat', fonts.pacifico && fonts.caveat && fonts.nunito, JSON.stringify(fonts));
    ok('tanpa error console/page', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'regresi-tahap4.log'),
    hasil.map((r) => (r.l ? 'PASS' : 'FAIL') + '  ' + r.n + (r.i ? '  (' + r.i + ')' : '')).join('\n'));
  const gagal = hasil.filter((r) => !r.l);
  console.log('\n===== RINGKASAN: ' + (hasil.length - gagal.length) + '/' + hasil.length + ' lolos =====');
  if (gagal.length) process.exitCode = 1;
})();
