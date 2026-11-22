// Verifikasi posisi #kontrol: dekat bawah saat bar WhatsApp tersembunyi,
// tetap di atas tombol WhatsApp saat bar tampil. Jalankan: node .uji/tahap7/verifikasi.js
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const URL = 'http://127.0.0.1:8000/index.html';
const OUT = path.join(__dirname, 'sesudah');
fs.mkdirSync(OUT, { recursive: true });

const VPS = [
  { n: '320x568', w: 320, h: 568 },
  { n: '390x844', w: 390, h: 844 },
  { n: '1440x900', w: 1440, h: 900 },
];

const ambil = () => {
  const r = (s) => {
    const el = document.querySelector(s);
    const b = el.getBoundingClientRect();
    return { top: b.top, bottom: b.bottom, left: b.left, right: b.right, width: b.width, height: b.height };
  };
  const hit = (s) => {
    const el = document.querySelector(s);
    const b = el.getBoundingClientRect();
    const p = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
    return el === p || el.contains(p);
  };
  return {
    vh: innerHeight,
    barTampil: document.body.classList.contains('wa-tampil'),
    kontrol: r('#kontrol'),
    mute: r('#tombolMute'),
    hati: r('#hati'),
    kucing: r('#maskot'),
    waTombol: r('#waTombol'),
    waBar: r('#waBar'),
    muteBisaKlik: hit('#tombolMute'),
    hatiBisaKlik: hit('#hati'),
    kucingBisaKlik: hit('#maskot'),
    scrollHorizontal: document.documentElement.scrollWidth > document.documentElement.clientWidth,
  };
};

let gagal = 0;
const cek = (nama, kondisi, info = '') => {
  console.log((kondisi ? 'PASS ' : 'FAIL ') + nama + (info ? '  (' + info + ')' : ''));
  if (!kondisi) gagal++;
};

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const vp of VPS) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    const error = [];
    page.on('pageerror', (e) => error.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') error.push(m.text()); });
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    await page.evaluate(() => document.fonts.ready);

    const sandi = await page.evaluate(() => DATA.kataSandi);
    await page.locator('#sandi').fill(sandi);
    await page.locator('#sandi').press('Enter');
    await page.waitForFunction(() => !document.getElementById('gate'), null, { timeout: 3000 });
    await page.waitForFunction(() => !document.getElementById('tombolMute').hidden, null, { timeout: 5000 });
    await page.waitForTimeout(400);

    // --- Keadaan 1: bar WhatsApp belum tampil ---
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(300);
    const atas = await page.evaluate(ambil);
    await page.screenshot({ path: path.join(OUT, vp.n + '-tanpa-bar.png') });

    console.log('\n===== ' + vp.n + ' tanpa bar =====');
    cek('bar memang tersembunyi', !atas.barTampil);
    cek('jarak kelompok ke tepi bawah 12px', Math.abs((atas.vh - atas.kontrol.bottom) - 12) <= 0.5, (atas.vh - atas.kontrol.bottom).toFixed(1) + 'px');
    cek('jarak musik ke hati tetap 8px', Math.abs(atas.hati.top - atas.mute.bottom - 8) <= 0.5, (atas.hati.top - atas.mute.bottom).toFixed(1) + 'px');
    cek('tidak menabrak maskot', atas.hati.left > atas.kucing.right, 'kiri hati ' + atas.hati.left.toFixed(1) + ' > kanan kucing ' + atas.kucing.right.toFixed(1));
    cek('musik & hati bisa diklik', atas.muteBisaKlik && atas.hatiBisaKlik);
    cek('kucing bisa diklik', atas.kucingBisaKlik);
    cek('tanpa scroll horizontal', !atas.scrollHorizontal);

    // --- Keadaan 2: bar WhatsApp tampil ---
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForFunction(() => document.body.classList.contains('wa-tampil'), null, { timeout: 4000 });
    await page.waitForTimeout(600);
    const bawah = await page.evaluate(ambil);
    await page.screenshot({ path: path.join(OUT, vp.n + '-dengan-bar.png') });

    console.log('===== ' + vp.n + ' dengan bar =====');
    cek('bar memang tampil', bawah.barTampil);
    cek('tinggi bar terukur 144px', Math.abs(bawah.waBar.height - 144) <= 0.6, bawah.waBar.height.toFixed(1) + 'px');
    cek('jarak kelompok ke tepi bawah 138px', Math.abs((bawah.vh - bawah.kontrol.bottom) - 138) <= 0.5, (bawah.vh - bawah.kontrol.bottom).toFixed(1) + 'px');
    cek('hati tetap di atas tombol WhatsApp', bawah.hati.bottom <= bawah.waTombol.top, 'hati bawah ' + bawah.hati.bottom.toFixed(1) + ' <= tombol atas ' + bawah.waTombol.top.toFixed(1));
    cek('jarak musik ke hati tetap 8px', Math.abs(bawah.hati.top - bawah.mute.bottom - 8) <= 0.5, (bawah.hati.top - bawah.mute.bottom).toFixed(1) + 'px');
    cek('tidak menabrak maskot', bawah.hati.left > bawah.kucing.right, 'kiri hati ' + bawah.hati.left.toFixed(1) + ' > kanan kucing ' + bawah.kucing.right.toFixed(1));
    cek('tidak menutupi tombol WhatsApp (horizontal)', bawah.hati.left >= bawah.waBar.right || bawah.hati.right <= bawah.waTombol.left || bawah.hati.bottom <= bawah.waTombol.top);
    cek('musik & hati bisa diklik', bawah.muteBisaKlik && bawah.hatiBisaKlik);
    cek('kucing bisa diklik', bawah.kucingBisaKlik);
    cek('tanpa scroll horizontal', !bawah.scrollHorizontal);
    cek('tanpa error console', error.length === 0, error.join(' | '));

    await ctx.close();
  }
  await browser.close();
  console.log('\nHASIL: ' + (gagal === 0 ? 'semua lolos' : gagal + ' gagal'));
  process.exit(gagal ? 1 : 0);
})();
