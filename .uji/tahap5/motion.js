// Tes motion Tahap 5: hover/active, sinkronisasi, ikon, dan reduced-motion.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const URL = 'http://127.0.0.1:8000/index.html';
const OUT = path.join(__dirname, 'sesudah');
const results = [];
let halaman = '';

function ok(nama, lulus, info = '') {
  results.push({ halaman, nama, lulus: !!lulus, info });
  console.log((lulus ? 'PASS' : 'FAIL') + '  ' + nama + (info ? '  (' + info + ')' : ''));
}

const gaya = (page, sel, prop, pseudo = null) =>
  page.$eval(sel, (el, [p, ps]) => getComputedStyle(el, ps)[p], [prop, pseudo]);

async function bukaGate(page) {
  if (await page.locator('#sandi').isVisible()) await page.locator('#sandi').fill('14022023');
  await page.locator('#tombolBuka').click();
  await page.waitForTimeout(1300);
}

async function rekamError(page, daftar) {
  page.on('console', (m) => { if (m.type() === 'error') daftar.push('console: ' + m.text()); });
  page.on('pageerror', (e) => daftar.push('pageerror: ' + e.message));
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });

  // ===== A. Desktop: hover, active, ikon, sinkronisasi =====
  halaman = 'desktop 390';
  console.log('\n===== ' + halaman + ' =====');
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' });
    const page = await ctx.newPage();
    const errors = [];
    await rekamError(page, errors);
    await page.goto(URL, { waitUntil: 'networkidle' });

    ok('gulir anchor memakai smooth', (await gaya(page, 'html', 'scrollBehavior')) === 'smooth');
    await bukaGate(page);

    // Musik: ikon berayun hanya saat berbunyi.
    ok('ikon musik berayun saat musik hidup',
      (await gaya(page, '.mute__ikon', 'animationName')) === 'mute-ayun');

    // Tombol mute naik mulus saat bar WhatsApp tampil (tanpa lompat 158px).
    await page.locator('#footer').scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    const translate = await gaya(page, '#tombolMute', 'translate');
    const rectMute = await page.locator('#tombolMute').boundingBox();
    ok('tombol musik terangkat di footer', rectMute && Math.round(844 - (rectMute.y + rectMute.height)) === 214,
      JSON.stringify({ translate, bawah: rectMute ? Math.round(844 - (rectMute.y + rectMute.height)) : null }));
    ok('lift tombol musik dianimasikan', (await gaya(page, '#tombolMute', 'transitionProperty')).includes('translate'));

    // Tekan tombol musik: feedback active, klik dicegah agar musik tidak berubah.
    await page.evaluate(() => {
      document.getElementById('tombolMute').addEventListener('click',
        (e) => { e.preventDefault(); e.stopImmediatePropagation(); }, { capture: true, once: true });
    });
    await page.locator('#tombolMute').hover();
    await page.mouse.down();
    await page.waitForTimeout(300);
    const transformMute = await gaya(page, '#tombolMute', 'transform');
    await page.mouse.up();
    ok('tombol musik punya feedback tekan', /matrix\(0\.9[0-9]/.test(transformMute), transformMute);

    // Tekan WhatsApp: scale terpisah dari denyut, klik dicegah.
    await page.evaluate(() => {
      document.getElementById('waTombol').addEventListener('click',
        (e) => { e.preventDefault(); e.stopImmediatePropagation(); }, { capture: true, once: true });
    });
    await page.locator('#waTombol').hover({ force: true }); // denyut membuat elemen tak pernah "stabil"
    await page.mouse.down();
    await page.waitForTimeout(250);
    const skalaWa = await gaya(page, '#waTombol', 'scale');
    await page.mouse.up();
    ok('denyut WhatsApp tetap ada', (await gaya(page, '#waTombol', 'animationName')) === 'wa-denyut');
    ok('feedback tekan WhatsApp bekerja bersama denyut', skalaWa.startsWith('0.97'), skalaWa);

    // Lampion kecil: goyangan pindah ke SVG, tombol bisa diangkat saat hover.
    await page.locator('#lampion').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    ok('goyangan lampion kecil ada di SVG',
      (await gaya(page, '.lampion__kecil', 'animationName')) === 'none' &&
      (await gaya(page, '.lampion__kecil svg', 'animationName')) === 'lampion-kecil-melayang');
    const sebelumHover = await gaya(page, '.lampion__kecil', 'transform');
    await page.locator('.lampion__kecil').first().hover();
    await page.waitForTimeout(450);
    const sesudahHover = await gaya(page, '.lampion__kecil', 'transform');
    ok('hover lampion kecil mengangkat tombol',
      sebelumHover !== sesudahHover && /matrix\(1\.0[5-9]/.test(sesudahHover),
      sebelumHover + ' -> ' + sesudahHover);

    // Lightbox: ikon SVG konsisten, navigasi tetap bekerja.
    await page.locator('#galeri').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.locator('.foto__bingkai').first().click();
    await page.waitForTimeout(450);
    const ikonLightbox = await page.evaluate(() => {
      const btns = [...document.querySelectorAll('.lightbox__tombol')];
      return btns.map((b) => {
        const svg = b.querySelector('svg');
        const r = svg?.getBoundingClientRect();
        return { label: b.getAttribute('aria-label'), svg: !!svg, w: r ? Math.round(r.width) : 0, h: r ? Math.round(r.height) : 0 };
      });
    });
    ok('lightbox memakai 3 ikon SVG 20px', ikonLightbox.length === 3 &&
      ikonLightbox.every((i) => i.svg && i.w === 20 && i.h === 20) &&
      ikonLightbox.map((i) => i.label).join('|') === 'Tutup foto|Foto sebelumnya|Foto berikutnya',
      JSON.stringify(ikonLightbox));
    const srcAwal = await page.locator('#lightboxImg').getAttribute('src');
    await page.locator('#lightboxSesudah').click();
    await page.waitForTimeout(250);
    const srcKedua = await page.locator('#lightboxImg').getAttribute('src');
    ok('navigasi lightbox tetap bekerja', srcAwal !== srcKedua);
    await page.screenshot({ path: path.join(OUT, '390-lightbox-ikon.png') });
    await page.locator('#lightboxTutup').click();
    await page.waitForTimeout(300);

    // Durasi hover kecil sudah responsif (token transisi).
    const durasiTombol = await gaya(page, '.btn', 'transitionDuration');
    ok('hover tombol 0,24 dtk', durasiTombol.startsWith('0.24s'), durasiTombol);

    // Partikel dibersihkan setelah beberapa klik beruntun.
    for (let i = 0; i < 6; i++) {
      await page.mouse.click(80 + i * 40, 300 + (i % 2) * 80);
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(2000);
    const sisaSparkle = await page.locator('.sparkle__partikel').count();
    ok('sparkle tidak menumpuk', sisaSparkle === 0, 'sisa=' + sisaSparkle);

    // Daftar animasi tak terbatas (ambient) untuk laporan, bukan kegagalan.
    const ambient = await page.evaluate(() => {
      const nameOf = (el) => {
        if (el.id) return '#' + el.id;
        if (el.classList.length) return '.' + [...el.classList].join('.');
        return el.tagName.toLowerCase();
      };
      return document.getAnimations()
        .filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations === Infinity)
        .map((a) => nameOf(a.effect.target) + ':' + a.animationName)
        .sort();
    });
    console.log('  animasi ambient berjalan:', ambient.length, JSON.stringify([...new Set(ambient)]));

    const layout = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    ok('tanpa scroll horizontal setelah interaksi', layout.sw <= layout.cw, JSON.stringify(layout));
    ok('tanpa error console/page', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  // ===== B. Reduced motion: semua fitur tetap bisa dipakai =====
  halaman = 'reduced 390';
  console.log('\n===== ' + halaman + ' =====');
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    const errors = [];
    await rekamError(page, errors);
    await page.goto(URL, { waitUntil: 'networkidle' });
    ok('gulir anchor kembali instan', (await gaya(page, 'html', 'scrollBehavior')) === 'auto');

    await bukaGate(page);
    ok('semua section tetap terlihat', await page.evaluate(() =>
      [...document.querySelectorAll('.bagian')].every((el) => getComputedStyle(el).opacity === '1')));
    ok('goyangan dekoratif mati', await page.evaluate(() => {
      const cek = (sel) => getComputedStyle(document.querySelector(sel)).animationName === 'none';
      return cek('.mute__ikon') && cek('.lampion__kecil svg') && cek('.wa__tombol') &&
        cek('.kue__nyala') && cek('.kue__balon') && cek('.hero__panah svg');
    }));
    ok('timeline langsung terbaca', await page.evaluate(() =>
      [...document.querySelectorAll('.timeline__item')].every((el) => getComputedStyle(el).opacity === '1')));

    // Hero: ketik instan dan pesan rahasia.
    ok('nama hero langsung aktif', await page.evaluate(() => !document.getElementById('heroNama').disabled));
    for (let i = 0; i < 5; i++) await page.locator('#heroNama').click({ force: true });
    await page.waitForTimeout(150);
    ok('pesan rahasia tetap bisa dibuka', await page.locator('#heroRahasia').isVisible());
    await page.screenshot({ path: path.join(OUT, 'reduce-390-hero.png') });

    // Kue: tiup, potong, beri potongan.
    await page.locator('#kue').scrollIntoViewIfNeeded();
    await page.locator('#tombolTiup').click();
    await page.waitForTimeout(1000);
    await page.locator('#tombolPotong').click();
    await page.waitForTimeout(250);
    ok('kartu penerima langsung muncul', await page.locator('#kueKartu').isVisible());
    await page.locator('#namaPenerima').fill('Sayang');
    await page.locator('#tombolKasih').click();
    await page.waitForTimeout(250);
    ok('potongan kue tetap tersaji', (await page.locator('.kue__badge').count()) === 1 &&
      (await page.locator('#kuePenerimaTeks').textContent()).length > 0);
    await page.screenshot({ path: path.join(OUT, 'reduce-390-kue.png') });

    // Galeri + lightbox.
    await page.locator('#galeri').scrollIntoViewIfNeeded();
    await page.locator('.foto__bingkai').first().click();
    await page.waitForTimeout(150);
    ok('lightbox terbuka', await page.evaluate(() => document.getElementById('lightbox').open));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(150);

    // Counter langsung ke angka akhir.
    await page.locator('#counter').scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    const hari = await page.locator('#counterHari').textContent();
    ok('counter langsung ke angka akhir', !/^Sudah 0 hari/.test(hari), hari.slice(0, 60));

    // Kartu alasan.
    await page.locator('#alasan').scrollIntoViewIfNeeded();
    const kartu = page.locator('.alasan__kartu').first();
    await kartu.click();
    await page.waitForTimeout(150);
    ok('kartu alasan bisa dibalik', (await kartu.getAttribute('aria-expanded')) === 'true');
    ok('partikel hati dilewati', (await page.locator('.alasan__hati-terbang').count()) === 0);

    // Surat langsung lengkap.
    await page.locator('#surat').scrollIntoViewIfNeeded();
    await page.locator('#amplop').click();
    await page.waitForTimeout(200);
    ok('modal surat tetap terbuka', await page.evaluate(() => document.getElementById('suratModal').open));
    ok('surat langsung lengkap', (await page.locator('#suratIsi').textContent()).length > 300);
    await page.screenshot({ path: path.join(OUT, 'reduce-390-surat.png') });
    await page.locator('#suratTutup').click();
    await page.waitForTimeout(150);

    // Lampion: tulis, lepas, lampion baru langsung siap.
    await page.locator('#lampion').scrollIntoViewIfNeeded();
    await page.locator('#lampionBesar').click({ force: true });
    await page.waitForTimeout(150);
    await page.locator('#lampionLepas').click();
    await page.waitForTimeout(100);
    ok('harapan kosong tetap ditolak', (await page.locator('#pesanLampion').textContent()).length > 0);
    await page.locator('#harapanInput').fill('Semoga kita selalu bersama');
    await page.locator('#lampionLepas').click();
    await page.waitForTimeout(200);
    ok('lampion lepas tanpa animasi, lalu siap lagi',
      (await page.locator('#lampionTerbang').textContent()).includes('terbang') &&
      await page.locator('#lampionLain').isVisible() &&
      await page.locator('#lampionBesar').isEnabled());
    await page.screenshot({ path: path.join(OUT, 'reduce-390-lampion.png') });

    // Hadiah + reset.
    await page.locator('#hadiah').scrollIntoViewIfNeeded();
    await page.locator('#kado').click();
    await page.waitForTimeout(250);
    ok('isi hadiah tetap tampil', await page.locator('#hadiahIsi').isVisible());
    await page.locator('#mainkanLagi').click();
    await page.waitForTimeout(300);
    ok('mainkan lagi mereset semuanya',
      !(await page.locator('#hadiahIsi').isVisible()) &&
      await page.locator('#tombolTiup').isVisible() &&
      (await page.locator('.alasan__kartu').first().getAttribute('aria-expanded')) === 'false');

    // Toast + mute.
    await page.locator('#hati').scrollIntoViewIfNeeded();
    await page.locator('#hati').click();
    await page.waitForTimeout(300);
    ok('toast hati tetap muncul', await page.locator('#toastHati').evaluate((el) => el.classList.contains('toast--tampil')));
    await page.locator('#tombolMute').click();
    await page.waitForTimeout(2800);
    ok('mute tetap mematikan musik', await page.evaluate(() => document.getElementById('musik').paused));
    await page.locator('#tombolMute').click();
    await page.waitForTimeout(400);
    ok('unmute tetap menyalakan musik', await page.evaluate(() => !document.getElementById('musik').paused));

    const layout = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
    }));
    ok('tanpa scroll horizontal', layout.sw <= layout.cw, JSON.stringify(layout));
    ok('tanpa error console/page', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  // ===== C. Touch: hover tidak menempel =====
  halaman = 'touch 390';
  console.log('\n===== ' + halaman + ' =====');
  {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true,
    });
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: 'networkidle' });
    ok('media hover mati di perangkat sentuh', await page.evaluate(() => !matchMedia('(hover: hover)').matches));
    await bukaGate(page);
    await page.locator('#footer').scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    ok('maskot disembunyikan saat bar WhatsApp tampil',
      await page.evaluate(() => getComputedStyle(document.getElementById('maskot')).visibility === 'hidden'));
    await page.screenshot({ path: path.join(OUT, 'touch-390-footer.png') });
    await ctx.close();
  }

  await browser.close();
  const gagal = results.filter((r) => !r.lulus);
  console.log('\n===== RINGKASAN: ' + (results.length - gagal.length) + '/' + results.length + ' lolos =====');
  fs.writeFileSync(path.join(OUT, 'motion.log'),
    results.map((r) => (r.lulus ? 'PASS' : 'FAIL') + '  [' + r.halaman + '] ' + r.nama + (r.info ? '  (' + r.info + ')' : '')).join('\n'));
  if (gagal.length) process.exitCode = 1;
})();
