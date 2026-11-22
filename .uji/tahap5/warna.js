// Audit warna/material Tahap 3: rekam computed style + metrik layout,
// lalu bandingkan "sebelum" dan "sesudah" untuk memastikan hanya warna yang berubah.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const URL = 'http://127.0.0.1:8000/index.html';
const VIEWPORTS = [
  { name: '320', width: 320, height: 568 },
  { name: '360', width: 360, height: 800 },
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 900 },
];
const SELECTORS = [
  'body', '.btn', '.btn--besar', '.card', '.input', '.gate', '.mute',
  '.dekor__stiker svg',
  '.kue__badge', '.kue__kartu', '.kue__pesan',
  '.foto-hidup', '.foto__bingkai', '.foto__img',
  '.lightbox__kartu', '.lightbox__tombol',
  '.timeline__daftar', '.timeline__kartu', '.timeline__foto', '.timeline__titik',
  '.counter__jam',
  '.alasan__depan', '.alasan__belakang', '.alasan__teks',
  '.surat__sampul', '.surat__badan', '.surat__depan', '.surat__tutup',
  '.surat__segel', '.surat-modal__kertas', '.surat-modal__aksi',
  '.lampion', '.lampion__bulan', '.lampion__svg', '.lampion__judul',
  '.lampion__awan', '.lampion__jejak', '.lampion__lahir', '.lampion__kecil',
  '.lampion-modal__kertas', '.lampion-modal__input',
  '.hadiah', '.hadiah__kartu', '.hadiah__tiket', '.hadiah__media',
  '.toast', '.wa__tombol', '.sparkle__partikel', '.hati',
];
const PROPS = [
  'backgroundColor', 'backgroundImage', 'boxShadow', 'borderColor', 'borderWidth',
  'color', 'filter', 'opacity', 'borderRadius', 'textShadow',
  'padding', 'margin', 'gap', 'fontSize', 'fontFamily', 'fontWeight', 'lineHeight',
  'minHeight', 'aspectRatio', 'width', 'height',
];

(async () => {
  const outFile = process.argv[2] || 'warna.json';
  const browser = await chromium.launch({ channel: 'chrome' });
  const report = {};

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));

    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    if (await page.locator('#gate').isVisible()) {
      if (await page.locator('#sandi').isVisible()) await page.locator('#sandi').fill('14022023');
      await page.locator('#tombolBuka').click();
      await page.waitForTimeout(1400);
    }
    const totalH = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < totalH; y += 400) {
      await page.evaluate(yy => window.scrollTo(0, yy), y);
      await page.waitForTimeout(40);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(700);

    const data = await page.evaluate(({ selectors, props }) => {
      // Elemen contoh untuk elemen yang baru muncul setelah interaksi.
      const daftar = document.getElementById('kuePenerimaDaftar');
      let daftarTersembunyi = false;
      if (daftar && !daftar.querySelector('.kue__badge')) {
        daftarTersembunyi = daftar.hidden;
        daftar.hidden = false;
        const li = document.createElement('li');
        li.className = 'kue__badge';
        li.textContent = 'Contoh';
        daftar.appendChild(li);
      }
      let contohSparkle = null;
      if (!document.querySelector('.sparkle__partikel')) {
        contohSparkle = document.createElement('span');
        contohSparkle.className = 'sparkle__partikel sparkle__partikel--titik';
        contohSparkle.style.setProperty('--warna', '#E8B86D');
        contohSparkle.style.setProperty('--ukuran', '6px');
        document.body.appendChild(contohSparkle); // hanya untuk ukur, dihapus di akhir
      }

      const result = {};
      for (const sel of selectors) {
        const el = sel === 'body' ? document.body : document.querySelector(sel);
        if (!el) { result[sel] = null; continue; }
        const cs = getComputedStyle(el);
        const rec = {};
        for (const p of props) rec[p] = cs[p];
        if (sel === '.timeline__daftar') {
          const pb = getComputedStyle(el, '::before');
          rec['::before.backgroundImage'] = pb.backgroundImage;
          rec['::before.boxShadow'] = pb.boxShadow;
        }
        result[sel] = rec;
      }
      if (contohSparkle) contohSparkle.remove();
      if (daftarTersembunyi) {
        const li = daftar.querySelector('.kue__badge');
        if (li) li.remove();
        daftar.hidden = true;
      }
      result._page = {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollHeight: document.documentElement.scrollHeight,
        overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      };
      return result;
    }, { selectors: SELECTORS, props: PROPS });

    data._errors = errors;
    report[vp.name] = data;
    await context.close();
  }
  await browser.close();
  fs.writeFileSync(path.resolve(__dirname, outFile), JSON.stringify(report, null, 2));
  console.log('OK ->', outFile);
})();
