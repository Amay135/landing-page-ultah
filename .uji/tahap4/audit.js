// Audit tipografi Tahap 4: ukur gaya teks + screenshot tiap state di 5 viewport.
// Jalankan: OUT_DIR=sebelum node .uji/tahap4/audit.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const URL = 'http://127.0.0.1:8000/index.html';
const OUT = path.join(__dirname, process.env.OUT_DIR || 'sebelum');
const VIEWPORTS = [
  { name: '320', width: 320, height: 800 },
  { name: '360', width: 360, height: 800 },
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 900 },
];
const SECTIONS = ['hero', 'kue', 'galeri', 'timeline', 'counter', 'alasan', 'surat', 'lampion', 'hadiah', 'footer'];

const SELECTORS = [
  '#gateJudul', '.gate__label', '.gate__pesan', '.gate__form .btn',
  '#heroAtas', '#heroJudul', '#heroKetik', '#heroNama', '#heroSubteks', '#heroPanah', '#heroRahasia',
  '#kueHarapan', '#kueTanya', '#pesanPenerima', '#kuePenerimaTeks', '#kueLucu', '#kueHabis',
  '.kue__badge', '#tombolTiup', '#tombolPotong', '#tombolKasih', '#tombolPotongLagi',
  '.foto__caption', '.foto__captionTeks', '.foto__tanggal',
  '.timeline__tanggal', '.timeline__judul', '.timeline__teks',
  '#counterHari', '#counterJam', '#counterBawah',
  '.alasan__nomor', '.alasan__teks',
  '.surat-modal__teks', '#suratLewati', '#suratTutup',
  '#lampionJudul', '#lampionKet', '#lampionTeks', '#lampionTerbang', '#lampionLain',
  '#lampionModalIsi', '#harapanInput', '#harapanHitung', '#pesanLampion', '#lampionLepas', '#lampionTutup',
  '#hadiahJudul', '#hadiahKet', '#hadiahJenis', '#hadiahTeks', '#hadiahBerlaku', '#mainkanLagi',
  '#waTombol', '#footerTeks', '#toastHati', '.lightbox__teks', '.lightbox__tanggal',
];

function collect() {
  const SELECTORS = arguments[0];
  const teksRingkas = (s) => (s || '').replace(/\s+/g, ' ').trim().slice(0, 120);
  const px = (v) => Math.round(parseFloat(v) * 100) / 100;
  const out = {};
  for (const sel of SELECTORS) {
    const els = [...document.querySelectorAll(sel)];
    if (!els.length) { out[sel] = null; continue; }
    out[sel] = els.slice(0, 3).map((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      // Hitung baris teks lewat rect dari Range (hanya untuk elemen berisi teks langsung).
      let baris = null;
      const node = [...el.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim());
      if (node) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const rects = [...range.getClientRects()].filter((x) => x.height > 2);
        baris = rects.length || null;
      }
      return {
        teks: teksRingkas(el.textContent),
        tampil: !!(r.width && r.height) && cs.visibility !== 'hidden' && cs.display !== 'none',
        fontFamily: cs.fontFamily,
        fontSize: px(cs.fontSize),
        fontWeight: cs.fontWeight,
        lineHeight: px(cs.lineHeight),
        letterSpacing: cs.letterSpacing,
        textTransform: cs.textTransform,
        textAlign: cs.textAlign,
        textWrap: cs.textWrap || cs.textWrapMode || '',
        maxWidth: cs.maxWidth,
        width: Math.round(r.width),
        height: Math.round(r.height),
        scrollW: el.scrollWidth,
        scrollH: el.scrollHeight,
        clientW: el.clientWidth,
        clientH: el.clientHeight,
        baris,
        overflow: cs.overflowX + '/' + cs.overflowY,
      };
    });
  }
  return out;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  const report = {};

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    const metrics = {};
    const shot = async (nama) => page.screenshot({ path: path.join(OUT, `${vp.name}-${nama}.png`) });
    const scrollKe = async (id) => {
      await page.evaluate((x) => document.getElementById(x).scrollIntoView({ block: 'start' }), id);
      await page.waitForTimeout(350);
    };
    const ukur = async (label) => { metrics[label] = await page.evaluate(collect, SELECTORS); };

    await page.goto(URL, { waitUntil: 'networkidle' });
    await shot('gate');
    await ukur('gate');

    if (await page.locator('#sandi').isVisible()) await page.locator('#sandi').fill('28052026');
    await page.locator('#tombolBuka').click();
    await page.waitForTimeout(1500);
    await page.waitForFunction(() => !document.getElementById('heroNama').disabled, null, { timeout: 10000 });
    for (let i = 0; i < 5; i++) await page.locator('#heroNama').click({ force: true });
    await page.waitForTimeout(700);
    await scrollKe('hero');
    await shot('hero');
    await ukur('hero');

    // Kue: tiup lalu potong satu
    await scrollKe('kue');
    await page.locator('#tombolTiup').click();
    await page.waitForTimeout(1000);
    await page.locator('#tombolPotong').click();
    await page.waitForTimeout(1600);
    await page.locator('#namaPenerima').fill('Sayang');
    await page.locator('#tombolKasih').click();
    await page.waitForTimeout(2200);
    await page.locator('#kueSvg').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await shot('kue');
    await ukur('kue');

    // Lightbox
    await scrollKe('galeri');
    await shot('galeri');
    await page.locator('.foto__bingkai').first().click();
    await page.waitForTimeout(450);
    await shot('lightbox');
    await ukur('lightbox');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Timeline + counter
    await scrollKe('timeline');
    await shot('timeline');
    await ukur('timeline');
    await scrollKe('counter');
    await page.waitForTimeout(1200);
    await shot('counter');
    await ukur('counter');

    // Alasan
    await scrollKe('alasan');
    await page.locator('.alasan__kartu').first().click();
    await page.waitForTimeout(700);
    await shot('alasan');
    await ukur('alasan');
    await page.locator('.alasan__kartu').first().click();

    // Surat
    await scrollKe('surat');
    await page.locator('#amplop').click();
    await page.waitForTimeout(1600);
    await page.locator('#suratLewati').click();
    await page.waitForTimeout(300);
    await shot('surat');
    await ukur('surat');
    await page.locator('#suratTutup').click();
    await page.waitForTimeout(400);

    // Lampion modal + teks di badan lampion
    await scrollKe('lampion');
    await shot('lampion');
    await page.locator('#lampionBesar').click({ force: true });
    await page.waitForTimeout(300);
    await shot('lampion-modal');
    await ukur('lampion-modal');
    const harapan = 'Semoga kita selalu bareng, sehat terus, dan semua mimpi kita satu per satu jadi nyata ya sayang.';
    await page.locator('#harapanInput').fill(harapan.slice(0, 120));
    await page.locator('#lampionLepas').click();
    await page.waitForTimeout(450);
    await shot('lampion-teks');
    await ukur('lampion-teks');
    await page.waitForTimeout(4300);

    // Hadiah
    await scrollKe('hadiah');
    await page.locator('#kado').click();
    await page.waitForTimeout(1100);
    await shot('hadiah');
    await ukur('hadiah');

    // Footer + toast
    await scrollKe('footer');
    await page.waitForTimeout(600);
    await page.locator('#hati').click();
    await page.waitForTimeout(500);
    await shot('footer');
    await ukur('footer');

    // Cek overflow halaman + tiap elemen yang keluar viewport
    const layout = await page.evaluate(() => {
      const luar = [...document.querySelectorAll('main *, footer *')]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return r.width > 0 && cs.position !== 'fixed' && (r.right > innerWidth + 1 || r.left < -1);
        })
        .slice(0, 20)
        .map((el) => ({
          tag: el.tagName,
          cls: typeof el.className === 'string' ? el.className : el.className?.baseVal || '',
          teks: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50),
          left: Math.round(el.getBoundingClientRect().left),
          right: Math.round(el.getBoundingClientRect().right),
        }));
      return {
        scrollW: document.documentElement.scrollWidth,
        clientW: document.documentElement.clientWidth,
        scrollH: document.documentElement.scrollHeight,
        horizontal: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        luar,
      };
    });

    const fonts = await page.evaluate(async () => {
      await document.fonts.ready;
      return {
        pacifico: document.fonts.check('16px Pacifico'),
        caveat: document.fonts.check('16px Caveat'),
        nunito: document.fonts.check('16px Nunito'),
        status: [...document.fonts].map((f) => `${f.family}:${f.weight}:${f.status}`),
      };
    });

    report[vp.name] = { metrics, layout, fonts, errors };
    console.log(`${vp.name}px selesai — horizontal=${layout.horizontal} fonts=${JSON.stringify(fonts.pacifico && fonts.caveat && fonts.nunito)} errors=${errors.length}`);
    await context.close();
  }

  // Uji fallback: browser baru + blokir Google Fonts, pastikan layout tetap utuh.
  {
    const fbBrowser = await chromium.launch({ channel: 'chrome' });
    const context = await fbBrowser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'no-preference' });
    const page = await context.newPage();
    const errors = [];
    const diblokir = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    await page.route('**/*', (route) => {
      const u = route.request().url();
      if (/fonts\.(googleapis|gstatic)\.com/.test(u)) { diblokir.push(u); return route.abort(); }
      return route.continue();
    });
    await page.goto(URL, { waitUntil: 'networkidle' });
    if (await page.locator('#sandi').isVisible()) await page.locator('#sandi').fill('28052026');
    await page.locator('#tombolBuka').click();
    await page.waitForTimeout(2500);
    const totalH = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < totalH; y += 400) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(40);
    }
    await page.evaluate(() => document.getElementById('hero').scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(OUT, '390-fallback-hero.png') });

    // Surat (teks panjang) + alasan (teks di dalam kartu) dalam kondisi font gagal.
    await page.locator('#surat').scrollIntoViewIfNeeded();
    await page.locator('#amplop').click();
    await page.waitForTimeout(1600);
    await page.locator('#suratLewati').click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, '390-fallback-surat.png') });
    await page.locator('#suratTutup').click();
    await page.waitForTimeout(300);
    await page.locator('#alasan').scrollIntoViewIfNeeded();
    await page.locator('.alasan__kartu').first().click();
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(OUT, '390-fallback-alasan.png') });

    const fs2 = await page.evaluate(async () => {
      await document.fonts.ready;
      return { jumlahFont: document.fonts.size, status: [...document.fonts].map((f) => f.family + ':' + f.status) };
    });
    const layout = await page.evaluate(() => ({
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
      horizontal: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      luar: [...document.querySelectorAll('main *, footer *')].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && getComputedStyle(el).position !== 'fixed' && (r.right > innerWidth + 1 || r.left < -1);
      }).slice(0, 12).map((el) => el.tagName + '.' + (typeof el.className === 'string' ? el.className : '')),
    }));
    report.fallback = { fonts: fs2, layout, diblokir: diblokir.length, errors };
    console.log('fallback selesai — fonts=', JSON.stringify(fs2), ' diblokir=', diblokir.length, ' horizontal=', layout.horizontal);
    await context.close();
    await fbBrowser.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(OUT, 'laporan.json'), JSON.stringify(report, null, 2));
  console.log('OK ->', OUT);
})();
