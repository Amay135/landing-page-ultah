// Tes interaksi setelah perubahan Tahap 2. Jalankan di 390 dan 1440.
const { chromium } = require('playwright');
const URL = 'http://127.0.0.1:8000/index.html';

const results = [];
function ok(name, cond, extra = '') { results.push({ name, pass: !!cond, extra }); console.log((cond ? 'PASS' : 'FAIL') + '  ' + name + (extra ? '  (' + extra + ')' : '')); }

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const vp of [{ w: 320, h: 568 }, { w: 360, h: 800 }, { w: 390, h: 844 }, { w: 768, h: 1024 }, { w: 1440, h: 900 }]) {
    console.log('\n===== ' + vp.w + 'px =====');
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, permissions: [] });
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    await page.goto(URL, { waitUntil: 'networkidle' });

    // 1. Gate & musik
    ok('gate tampil sebelum dibuka', await page.locator('#gate').isVisible());
    ok('musik belum jalan sebelum klik', await page.evaluate(() => document.getElementById('musik').paused));
    if (await page.locator('#sandi').isVisible()) await page.locator('#sandi').fill('28052026');
    await page.locator('#tombolBuka').click();
    await page.waitForTimeout(1500);
    ok('gate hilang setelah dibuka', !(await page.locator('#gate').isVisible()));
    const audioState = await page.evaluate(() => { const a = document.getElementById('musik'); return { paused: a.paused, src: a.currentSrc, t: a.currentTime }; });
    ok('musik mulai setelah klik', !audioState.paused && audioState.t > 0, JSON.stringify(audioState));
    ok('tombol mute tampil', await page.locator('#tombolMute').isVisible());

    // 2. Hero
    await page.waitForFunction(() => !document.getElementById('heroNama').disabled, null, { timeout: 10000 });
    ok('nama di hero dari data.js', (await page.locator('#heroNama').textContent()).includes('Sayang'));
    for (let i = 0; i < 5; i++) await page.locator('#heroNama').click({ force: true });
    await page.waitForTimeout(400);
    ok('pesan rahasia muncul setelah 5 klik', await page.locator('#heroRahasia').isVisible());

    // 3. Kue
    await page.locator('#kue').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.locator('#tombolTiup').click();
    await page.waitForTimeout(1100);
    ok('lilin padam', await page.locator('#kue').evaluate(el => el.classList.contains('kue--padam')));
    ok('teks make a wish', (await page.locator('#kueHarapan').textContent()).includes('Make a wish'));
    ok('tombol potong muncul', await page.locator('#tombolPotong').isVisible());
    await page.locator('#tombolPotong').click();
    await page.waitForTimeout(1600);
    ok('kartu nama penerima muncul', await page.locator('#kueKartu').isVisible());
    await page.locator('#tombolKasih').click();
    await page.waitForTimeout(200);
    ok('nama kosong ditolak', (await page.locator('#pesanPenerima').textContent()).length > 0);
    await page.locator('#namaPenerima').fill('Sayang');
    await page.locator('#tombolKasih').click();
    await page.waitForTimeout(2200);
    ok('badge penerima dibuat', await page.locator('.kue__badge').count() >= 1);
    ok('teks penerima muncul', (await page.locator('#kuePenerimaTeks').textContent()).length > 0);
    ok('tombol potong lagi muncul', await page.locator('#tombolPotongLagi').isVisible());

    // 4. Galeri lightbox
    await page.locator('#galeri').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.locator('.foto__bingkai').first().click();
    await page.waitForTimeout(400);
    ok('lightbox terbuka', await page.evaluate(() => document.getElementById('lightbox').open));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    ok('lightbox tertutup dengan Esc', !(await page.evaluate(() => document.getElementById('lightbox').open)));

    // 5. Timeline reveal + counter
    await page.locator('#timeline').scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    ok('timeline reveal', await page.locator('.timeline__item--tampil').count() > 0);
    await page.locator('#counter').scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    const jam1 = await page.locator('#counterJam').textContent();
    await page.waitForTimeout(1200);
    const jam2 = await page.locator('#counterJam').textContent();
    ok('counter berjalan', jam1 !== jam2, jam1 + ' -> ' + jam2);

    // 6. Alasan flip (klik + keyboard)
    await page.locator('#alasan').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const kartu1 = page.locator('.alasan__kartu').first();
    await kartu1.click();
    await page.waitForTimeout(400);
    ok('kartu alasan terbuka (klik)', (await kartu1.getAttribute('aria-expanded')) === 'true');
    await kartu1.click();
    await page.waitForTimeout(300);
    ok('kartu alasan tertutup', (await kartu1.getAttribute('aria-expanded')) === 'false');
    const kartu2 = page.locator('.alasan__kartu').nth(1);
    await kartu2.focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    ok('kartu alasan terbuka (keyboard)', (await kartu2.getAttribute('aria-expanded')) === 'true');

    // 7. Surat
    await page.locator('#surat').scrollIntoViewIfNeeded();
    await page.locator('#amplop').click();
    await page.waitForTimeout(1800);
    ok('modal surat terbuka', await page.evaluate(() => document.getElementById('suratModal').open));
    await page.locator('#suratLewati').click();
    await page.waitForTimeout(200);
    ok('lewati mengisi surat lengkap', (await page.locator('#suratIsi').textContent()).length > 300);
    await page.locator('#suratTutup').click();
    await page.waitForTimeout(400);
    ok('surat tertutup', !(await page.evaluate(() => document.getElementById('suratModal').open)));

    // 8. Lampion
    await page.locator('#lampion').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.locator('#lampionBesar').click({ force: true }); // tombol bergoyang terus
    await page.waitForTimeout(300);
    ok('modal lampion terbuka', await page.evaluate(() => document.getElementById('lampionModal').open));
    await page.locator('#lampionLepas').click();
    await page.waitForTimeout(200);
    ok('harapan kosong ditolak', (await page.locator('#pesanLampion').textContent()).length > 0);
    await page.locator('#harapanInput').fill('Semoga kita selalu bersama');
    await page.locator('#lampionLepas').click();
    await page.waitForTimeout(5600);
    ok('lampion terbang + teks', (await page.locator('#lampionTerbang').textContent()).includes('terbang'));
    ok('tombol lampion lain muncul', await page.locator('#lampionLain').isVisible());
    ok('lampion baru bisa diklik', await page.locator('#lampionBesar').isEnabled());

    // 9. Footer WhatsApp + hati + mute
    await page.locator('#footer').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    ok('bar WhatsApp tampil di footer', await page.locator('#waBar').isVisible());
    const wa = await page.locator('#waTombol').evaluate(a => ({ href: a.href, target: a.target, rel: a.rel }));
    ok('link WhatsApp benar', wa.href.startsWith('https://wa.me/6285748631950?text=') && wa.target === '_blank' && wa.rel.includes('noopener'), wa.href.slice(0, 60));
    await page.locator('#hati').click();
    await page.waitForTimeout(400);
    ok('toast hati muncul', await page.locator('#toastHati').evaluate(el => el.classList.contains('toast--tampil')));
    await page.locator('#tombolMute').click();
    await page.waitForTimeout(3000); // fade-out volume 2,2 dtk dulu, baru pause
    ok('mute mematikan musik', await page.evaluate(() => document.getElementById('musik').paused));
    await page.locator('#tombolMute').click();
    await page.waitForTimeout(500);
    ok('unmute menyalakan musik', await page.evaluate(() => !document.getElementById('musik').paused));

    // 10. Sparkle
    await page.mouse.click(vp.w / 2, vp.h / 2);
    await page.waitForTimeout(120);
    const partikel = await page.locator('.sparkle__partikel').count();
    ok('sparkle muncul', partikel > 0 && partikel <= 30, 'partikel=' + partikel);
    await page.waitForTimeout(1400);
    ok('sparkle dibersihkan', (await page.locator('.sparkle__partikel').count()) === 0);

    // 11. Hadiah + Mainkan lagi
    await page.locator('#kado').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.locator('#kado').click();
    await page.waitForTimeout(1000);
    ok('isi hadiah tampil', await page.locator('#hadiahIsi').isVisible());
    ok('tombol mainkan lagi tampil', await page.locator('#mainkanLagi').isVisible());
    await page.locator('#mainkanLagi').click();
    await page.waitForTimeout(1200);
    ok('mainkan lagi menutup hadiah', !(await page.locator('#hadiahIsi').isVisible()));
    ok('mainkan lagi mereset kue', await page.locator('#tombolTiup').isVisible());
    ok('mainkan lagi mereset kartu', await page.evaluate(() => [...document.querySelectorAll('.alasan__kartu')].every(k => k.getAttribute('aria-expanded') === 'false')));

    // 12. Layout akhir
    const layout = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
      scrollH: document.documentElement.scrollHeight,
      over: [...document.querySelectorAll('main *, footer *')].filter(el => {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        return r.width > 0 && cs.position !== 'fixed' && (r.right > innerWidth + 1 || r.left < -1);
      }).map(el => el.tagName + '.' + (typeof el.className === 'string' ? el.className : '')).slice(0, 8),
    }));
    ok('tidak ada scroll horizontal', layout.scrollW <= layout.clientW, JSON.stringify({ w: layout.scrollW, c: layout.clientW }));
    console.log('  halaman:', layout.scrollH + 'px');

    ok('tanpa error console/page', errors.length === 0, errors.join(' | '));

    await ctx.close();
  }
  await browser.close();
  const gagal = results.filter(r => !r.pass);
  console.log('\n===== RINGKASAN: ' + (results.length - gagal.length) + '/' + results.length + ' lolos =====');
  if (gagal.length) { console.log('GAGAL:'); gagal.forEach(g => console.log(' - ' + g.name + ' ' + g.extra)); process.exitCode = 1; }
})();
