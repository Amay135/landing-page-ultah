// Regresi khusus hasil Tahap 1 dan 2 setelah perubahan warna/material Tahap 3.
const { chromium } = require('playwright');
const URL = 'http://127.0.0.1:8000/index.html';
const HASIL = [];
const ok = (nama, lulus, info = '') => { HASIL.push({ nama, lulus: !!lulus, info }); console.log((lulus ? 'PASS' : 'FAIL') + '  ' + nama + (info ? '  (' + info + ')' : '')); };

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const vp of [{ w: 320, h: 568 }, { w: 360, h: 800 }, { w: 390, h: 844 }, { w: 768, h: 1024 }, { w: 1440, h: 900 }]) {
    console.log('\n===== ' + vp.w + 'px =====');
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    if (await page.locator('#sandi').isVisible()) await page.locator('#sandi').fill('14022023');
    await page.locator('#tombolBuka').click();
    await page.waitForTimeout(1400);
    const totalH = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < totalH; y += 500) { await page.evaluate(yy => scrollTo(0, yy), y); await page.waitForTimeout(30); }
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(1000); // beri waktu reveal transform selesai sebelum ukur jarak

    const data = await page.evaluate(() => {
      const rasio = el => getComputedStyle(el).aspectRatio;
      const urut = [...document.querySelectorAll('.galeri__daftar .foto__img')].map(i => i.getAttribute('src'));
      const panorama = [4, 5, 10, 11].map(i => rasio(document.querySelectorAll('.foto__img')[i]));
      const biasa = [0, 1, 2, 3, 6, 7, 8, 9].map(i => rasio(document.querySelectorAll('.foto__img')[i]));
      const awan = [...document.querySelectorAll('.lampion__awan')].map(a => ({ display: getComputedStyle(a).display, anim: getComputedStyle(a).animationName, w: a.getBoundingClientRect().width }));
      return {
        urut,
        urutData: (typeof DATA !== 'undefined' ? DATA.foto : []).map(f => f.src),
        panorama,
        biasa,
        awan,
        counterMinHeight: getComputedStyle(document.getElementById('counter')).minHeight,
        gapSections: (() => {
          const ids = ['hero', 'kue', 'galeri', 'timeline', 'counter', 'alasan', 'surat', 'lampion', 'hadiah', 'footer'];
          const out = [];
          for (let i = 0; i < ids.length - 1; i++) {
            const a = document.getElementById(ids[i]), b = document.getElementById(ids[i + 1]);
            out.push(Math.round(b.getBoundingClientRect().top + scrollY - (a.getBoundingClientRect().bottom + scrollY)));
          }
          return out;
        })(),
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
    });

    ok('12 foto dan urutannya sesuai data.js', data.urut.length === 12 && data.urut.every((s, i) => s === data.urutData[i]), 'jumlah=' + data.urut.length);
    ok('foto 5,6,11,12 rasio 4:3', data.panorama.every(r => r.startsWith('4 / 3')), data.panorama.join(','));
    ok('foto lain rasio 1:1', data.biasa.every(r => r.startsWith('1 / 1')), data.biasa.join(','));
    ok('awan CSS lampion ada dan beranimasi', data.awan.length === 3 && data.awan.every(a => a.display !== 'none' && a.anim === 'awan-geser'), JSON.stringify(data.awan.map(a => Math.round(a.w))));
    ok('counter bukan min-height 60vh', data.counterMinHeight === 'auto' || data.counterMinHeight === '0px', data.counterMinHeight);
    ok('jarak antar-section stabil (toleransi subpiksel 2px)', data.gapSections.every(g => Math.abs(g) <= 2), data.gapSections.join(','));
    ok('tanpa scroll horizontal', !data.overflow);
    ok('tanpa error console/page', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }
  await browser.close();
  const gagal = HASIL.filter(h => !h.lulus);
  console.log('\n===== RINGKASAN: ' + (HASIL.length - gagal.length) + '/' + HASIL.length + ' lolos =====');
  if (gagal.length) process.exitCode = 1;
})();
