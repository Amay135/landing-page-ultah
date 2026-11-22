// Tes final fix: kontrol mengambang, input sandi, animasi keluar modal,
// scroll anchoring kartu kue, confetti surat, dan regresi alur utama.
// Jalankan: node .uji/tahap6/final-fix.js  (butuh server di :8000)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const URL = 'http://127.0.0.1:8000/index.html';
const OUT = path.join(__dirname, 'sesudah');
fs.mkdirSync(OUT, { recursive: true });

const VPS = [
  { n: '320x568', w: 320, h: 568 },
  { n: '320x800', w: 320, h: 800 },
  { n: '360x800', w: 360, h: 800 },
  { n: '390x844', w: 390, h: 844 },
  { n: '768x1024', w: 768, h: 1024 },
  { n: '1440x900', w: 1440, h: 900 },
];
const PESAN_BARU = 'Hmm, belum tepat. Coba lagi ya 😅 Ingat tanggal jadian kita.';
const SANDI_LAMA = '14022023'; // hanya untuk memastikan nilai lama ditolak

const results = [];
function ok(name, cond, extra = '') {
  results.push({ name, pass: !!cond });
  console.log((cond ? 'PASS' : 'FAIL') + '  ' + name + (extra ? '  (' + extra + ')' : ''));
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const errors = [];

  for (const vp of VPS) {
    console.log('\n===== ' + vp.n + ' =====');
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') errors.push(vp.n + ' console: ' + m.text()); });
    page.on('pageerror', (e) => errors.push(vp.n + ' pageerror: ' + e.message));
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    await page.evaluate(() => document.fonts.ready);

    // --- Gate: tampilan awal ---
    await page.screenshot({ path: path.join(OUT, vp.n + '-gate.png') });
    ok('gate tampil', await page.locator('#gate').isVisible());

    // --- Input: warna teks dan kontras ---
    const inputGaya = await page.locator('#sandi').evaluate((el) => {
      const rs = getComputedStyle(el);
      const lum = (c) => {
        const n = c.match(/\d+(\.\d+)?/g).slice(0, 3).map(Number).map((v) => {
          v /= 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * n[0] + 0.7152 * n[1] + 0.0722 * n[2];
      };
      const a = lum(rs.color), b = lum(rs.backgroundColor);
      return { color: rs.color, bg: rs.backgroundColor, kontras: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05) };
    });
    ok('teks input gelap di atas latar terang', inputGaya.kontras >= 4.5, inputGaya.color + ' kontras ' + inputGaya.kontras.toFixed(1));

    // Karakter ketikan terlihat: isi kata sandi lama (salah) lalu potret.
    await page.locator('#sandi').fill(SANDI_LAMA);
    await page.screenshot({ path: path.join(OUT, vp.n + '-gate-ketik.png') });
    ok('tombol Enter mengirim (sandi lama ditolak)', await (async () => {
      await page.locator('#sandi').press('Enter');
      await page.waitForTimeout(150);
      return await page.locator('#gate').isVisible();
    })());
    const pesan = (await page.locator('#pesanGate').textContent()).trim();
    ok('pesan salah baru', pesan === PESAN_BARU, pesan);
    ok('tidak ada petunjuk Valentine', !pesan.toLowerCase().includes('valentine'));
    await page.screenshot({ path: path.join(OUT, vp.n + '-gate-error.png') });

    // Kata sandi baru: sumber tunggal dari data.js.
    const sandiBenar = await page.evaluate(() => DATA.kataSandi);
    await page.locator('#sandi').fill(sandiBenar);
    if (vp.n === '360x800') {
      await page.locator('#tombolBuka').click(); // uji jalur tombol masuk
      ok('tombol masuk membuka gate', true);
    } else {
      await page.locator('#sandi').press('Enter');
    }
    await page.waitForFunction(() => !document.getElementById('gate'), null, { timeout: 3000 });
    ok('gate terbuka dengan sandi baru', !(await page.locator('#gate').count()));

    // --- Kontrol mengambang: posisi saat di atas ---
    await page.waitForFunction(() => !document.getElementById('tombolMute').hidden, null, { timeout: 5000 });
    await page.waitForTimeout(400);
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(300);
    const rAtas = await page.evaluate(() => {
      const g = (s) => { const e = document.querySelector(s); const r = e.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; };
      return { mute: g('#tombolMute'), hati: g('#hati'), kucing: g('#maskot') };
    });
    ok('musik di atas hati (satu kelompok)', Math.abs(rAtas.hati.top - rAtas.mute.bottom - 8) <= 1.5, JSON.stringify({ muteBottom: rAtas.mute.bottom, hatiTop: rAtas.hati.top }));
    ok('musik dan hati sejajar kanan', Math.abs(rAtas.mute.right - rAtas.hati.right) <= 0.5);
    ok('hati di sisi kanan layar', rAtas.hati.right > vp.w - 30, 'right=' + rAtas.hati.right);
    await page.screenshot({ path: path.join(OUT, vp.n + '-kontrol-atas.png') });

    // --- Kontrol mengambang: saat WhatsApp tampil, posisi harus identik ---
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForFunction(() => document.body.classList.contains('wa-tampil'), null, { timeout: 4000 });
    await page.waitForTimeout(600);
    const rBawah = await page.evaluate(() => {
      const g = (s) => { const e = document.querySelector(s); const r = e.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; };
      const wa = document.querySelector('#waTombol').getBoundingClientRect();
      return { mute: g('#tombolMute'), hati: g('#hati'), kucing: g('#maskot'), waTop: wa.top };
    });
    ok('musik tidak bergeser saat WhatsApp tampil', Math.abs(rBawah.mute.top - rAtas.mute.top) <= 0.5, rAtas.mute.top + ' -> ' + rBawah.mute.top);
    ok('hati tidak bergeser saat WhatsApp tampil', Math.abs(rBawah.hati.top - rAtas.hati.top) <= 0.5, rAtas.hati.top + ' -> ' + rBawah.hati.top);
    const kucingTampil = await page.locator('#maskot').evaluate((el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return s.visibility !== 'hidden' && s.display !== 'none' && Number(s.opacity) > 0.9 && r.bottom > 0 && r.top < innerHeight;
    });
    ok('kucing tetap terlihat di bawah', kucingTampil);
    ok('kucing tidak tertutup bar WhatsApp', rBawah.kucing.bottom <= rBawah.waTop + 0.5, JSON.stringify({ kucingBottom: rBawah.kucing.bottom, waTop: rBawah.waTop }));
    ok('hati tidak menutupi tombol WhatsApp', rBawah.hati.bottom <= rBawah.waTop + 0.5, JSON.stringify({ hatiBottom: rBawah.hati.bottom, waTop: rBawah.waTop }));
    const kucingDiAtas = await page.locator('#maskot').evaluate((el) => {
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return el === hit || el.contains(hit);
    });
    ok('kucing bisa diklik (tidak tertutup)', kucingDiAtas);
    await page.screenshot({ path: path.join(OUT, vp.n + '-kontrol-footer.png') });

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
    ok('tanpa scroll horizontal', overflow);

    await ctx.close();
  }

  // --- Regresi alur utama + modal + scroll anchoring, di 390 dan 1440 ---
  for (const vp of [{ n: '390x844', w: 390, h: 844 }, { n: '1440x900', w: 1440, h: 900 }]) {
    console.log('\n===== alur ' + vp.n + ' =====');
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') errors.push(vp.n + ' console: ' + m.text()); });
    page.on('pageerror', (e) => errors.push(vp.n + ' pageerror: ' + e.message));
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });

    const sandiBenar = await page.evaluate(() => DATA.kataSandi);
    await page.locator('#sandi').fill(sandiBenar);
    await page.locator('#sandi').press('Enter');
    await page.waitForFunction(() => !document.getElementById('gate'), null, { timeout: 3000 });

    // Hero
    await page.waitForFunction(() => !document.getElementById('heroNama').disabled, null, { timeout: 10000 });
    for (let i = 0; i < 5; i++) await page.locator('#heroNama').click({ force: true });
    await page.waitForTimeout(400);
    ok('hero: pesan rahasia', await page.locator('#heroRahasia').isVisible());

    // Kue + scroll anchoring
    await page.locator('#kue').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.locator('#tombolTiup').click();
    await page.waitForTimeout(1100);
    ok('kue: lilin padam', await page.locator('#kue').evaluate((el) => el.classList.contains('kue--padam')));
    await page.locator('#tombolPotong').click();
    await page.waitForTimeout(1600);
    ok('kue: kartu penerima tampil', await page.locator('#kueKartu').isVisible());
    await page.locator('#namaPenerima').fill('Sayang');
    const gulirSebelum = await page.evaluate(() => scrollY);
    await page.locator('#tombolKasih').click();
    await page.waitForTimeout(80);
    const gulirSesudah = await page.evaluate(() => scrollY);
    ok('scroll tidak meloncat saat kartu disembunyikan', Math.abs(gulirSesudah - gulirSebelum) <= 2, gulirSebelum + ' -> ' + gulirSesudah);
    await page.waitForTimeout(2200);
    ok('kue: badge penerima', (await page.locator('.kue__badge').count()) >= 1);
    ok('kue: kartu tersembunyi', !(await page.locator('#kueKartu').isVisible()));

    // Lightbox: tutup lewat tombol, animasi keluar, scroll lock bersih
    await page.locator('#galeri').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.locator('.foto__bingkai').first().click();
    await page.waitForTimeout(400);
    ok('lightbox terbuka', await page.evaluate(() => document.getElementById('lightbox').open));
    await page.locator('#lightboxTutup').click();
    const lbTutup = await page.evaluate(() => {
      const d = document.getElementById('lightbox');
      return { open: d.open, pergi: d.classList.contains('modal--pergi'), pointer: getComputedStyle(d).pointerEvents };
    });
    ok('lightbox: animasi keluar dipicu', lbTutup.open && lbTutup.pergi, JSON.stringify(lbTutup));
    ok('lightbox: tidak menangkap klik saat memudar', lbTutup.pointer === 'none');
    await page.waitForTimeout(350);
    ok('lightbox tertutup setelah animasi', !(await page.evaluate(() => document.getElementById('lightbox').open)));
    ok('scroll lock lightbox bersih', !(await page.evaluate(() => document.body.classList.contains('lightbox-terbuka'))));

    // Lightbox: Escape
    await page.locator('.foto__bingkai').first().click();
    await page.waitForTimeout(300);
    await page.keyboard.press('Escape');
    ok('lightbox: Esc memulai animasi keluar', await page.locator('#lightbox').evaluate((d) => d.open && d.classList.contains('modal--pergi')));
    await page.waitForTimeout(350);
    ok('lightbox: Esc menutup', !(await page.evaluate(() => document.getElementById('lightbox').open)));

    // Surat: confetti di belakang kertas, tutup animasi + Esc
    await page.locator('#surat').scrollIntoViewIfNeeded();
    await page.locator('#amplop').click();
    await page.waitForTimeout(1800);
    ok('surat terbuka', await page.evaluate(() => document.getElementById('suratModal').open));
    const lapisan = await page.evaluate(() => {
      const d = document.getElementById('suratModal');
      const kertas = document.getElementById('suratKertas');
      const kanvas = document.getElementById('confetti');
      return { kanvasDiDialog: kanvas.parentElement === d, zKertas: getComputedStyle(kertas).zIndex, zKanvas: getComputedStyle(kanvas).zIndex };
    });
    ok('confetti di belakang surat', lapisan.kanvasDiDialog && Number(lapisan.zKertas) > Number(lapisan.zKanvas), JSON.stringify(lapisan));
    await page.screenshot({ path: path.join(OUT, 'surat-confetti-' + vp.n + '.png') });
    await page.keyboard.press('Escape');
    ok('surat: Esc memulai animasi keluar', await page.locator('#suratModal').evaluate((d) => d.open && d.classList.contains('modal--pergi')));
    await page.waitForTimeout(350);
    ok('surat tertutup', !(await page.evaluate(() => document.getElementById('suratModal').open)));
    ok('confetti kembali ke body', await page.evaluate(() => document.getElementById('confetti').parentElement === document.body));

    // Lampion: tutup tombol dengan animasi
    await page.locator('#lampion').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.locator('#lampionBesar').click({ force: true });
    await page.waitForTimeout(300);
    ok('lampion terbuka', await page.evaluate(() => document.getElementById('lampionModal').open));
    await page.locator('#lampionTutup').click();
    ok('lampion: animasi keluar dipicu', await page.locator('#lampionModal').evaluate((d) => d.open && d.classList.contains('modal--pergi')));
    await page.waitForTimeout(350);
    ok('lampion tertutup', !(await page.evaluate(() => document.getElementById('lampionModal').open)));
    ok('scroll lock lampion bersih', !(await page.evaluate(() => document.body.classList.contains('lampion-terbuka'))));

    // Footer: toast hati, mute/unmute, WhatsApp
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForFunction(() => document.body.classList.contains('wa-tampil'), null, { timeout: 4000 });
    await page.locator('#hati').click();
    await page.waitForTimeout(400);
    ok('toast hati muncul', await page.locator('#toastHati').evaluate((el) => el.classList.contains('toast--tampil')));
    await page.locator('#tombolMute').click();
    await page.waitForTimeout(3000);
    ok('mute mematikan musik', await page.evaluate(() => document.getElementById('musik').paused));
    await page.locator('#tombolMute').click();
    await page.waitForTimeout(500);
    ok('unmute menyalakan musik', await page.evaluate(() => !document.getElementById('musik').paused));
    const wa = await page.locator('#waTombol').evaluate((a) => ({ href: a.href, target: a.target, rel: a.rel }));
    ok('link WhatsApp tetap benar', wa.href.startsWith('https://wa.me/6285748631950?text=') && wa.target === '_blank' && wa.rel.includes('noopener'));

    // Hadiah + mainkan lagi
    await page.locator('#kado').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.locator('#kado').click();
    await page.waitForTimeout(1000);
    ok('hadiah terbuka', await page.locator('#hadiahIsi').isVisible());
    await page.locator('#mainkanLagi').click();
    await page.waitForTimeout(1200);
    ok('mainkan lagi mereset kue', await page.locator('#tombolTiup').isVisible());

    await ctx.close();
  }

  // --- Reduced motion ---
  console.log('\n===== reduced motion =====');
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') errors.push('rm console: ' + m.text()); });
    page.on('pageerror', (e) => errors.push('rm pageerror: ' + e.message));
    await page.goto(URL, { waitUntil: 'networkidle' });
    const sandiBenar = await page.evaluate(() => DATA.kataSandi);
    await page.locator('#sandi').fill(sandiBenar);
    await page.locator('#sandi').press('Enter');
    await page.waitForFunction(() => !document.getElementById('gate'), null, { timeout: 3000 });
    await page.waitForTimeout(300);
    const rm = await page.evaluate(() => {
      const bagian = document.querySelector('.bagian');
      const dekor = document.querySelector('.dekor');
      return { bagianOpacity: getComputedStyle(bagian).opacity, dekor: dekor ? getComputedStyle(dekor).display : 'tidak dibuat' };
    });
    ok('reduced motion: konten tetap terlihat', rm.bagianOpacity === '1' && (rm.dekor === 'none' || rm.dekor === 'tidak dibuat'), JSON.stringify(rm));
    await page.locator('#galeri').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.locator('.foto__bingkai').first().click();
    await page.waitForTimeout(200);
    await page.locator('#lightboxTutup').click();
    await page.waitForTimeout(350);
    ok('reduced motion: modal tetap bisa ditutup', !(await page.evaluate(() => document.getElementById('lightbox').open)));
    ok('reduced motion: kucing terlihat', await page.locator('#maskot').isVisible());
    await ctx.close();
  }

  await browser.close();
  const gagal = results.filter((r) => !r.pass);
  console.log('\n===== RINGKASAN: ' + (results.length - gagal.length) + '/' + results.length + ' lolos =====');
  const unik = [...new Set(errors)];
  console.log('Console/page error: ' + unik.length + (unik.length ? ' -> ' + unik.join(' | ') : ''));
  if (gagal.length) {
    console.log('GAGAL:');
    gagal.forEach((g) => console.log(' - ' + g.name));
    process.exitCode = 1;
  }
})();
