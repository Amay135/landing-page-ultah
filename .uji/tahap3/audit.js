// Audit layout Tahap 2: screenshot seluruh section + ukur spacing di 5 viewport.
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

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ channel: 'chrome' });
  const report = {};

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    const errors = [];
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));

    await page.goto(URL, { waitUntil: 'networkidle' });
    // Buka gate kalau ada.
    if (await page.locator('#gate').isVisible()) {
      const sandi = page.locator('#sandi');
      if (await sandi.isVisible()) await sandi.fill('28052026');
      await page.locator('#tombolBuka').click();
      await page.waitForTimeout(1400);
    }
    // Gulir pelan agar semua reveal jalan.
    const totalH = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < totalH; y += 400) {
      await page.evaluate(yy => window.scrollTo(0, yy), y);
      await page.waitForTimeout(60);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(900);

    const data = await page.evaluate((sections) => {
      const gcs = (el) => getComputedStyle(el);
      const px = (v) => Math.round(parseFloat(v) * 100) / 100;
      const box = (el) => { const r = el.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY), height: Math.round(r.height), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) }; };
      const out = { sections: {}, overflow: {}, page: {} };
      out.page = { scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth, scrollHeight: document.documentElement.scrollHeight, innerWidth: window.innerWidth };
      out.overflow = { horizontal: document.documentElement.scrollWidth > document.documentElement.clientWidth };
      // Elemen yang melewati lebar viewport
      out.overflow.elems = [...document.querySelectorAll('main *, footer *, .wa *')]
        .filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1); })
        .slice(0, 15)
        .map(el => ({ tag: el.tagName, cls: (el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className) || '', left: Math.round(el.getBoundingClientRect().left), right: Math.round(el.getBoundingClientRect().right) }));

      for (const id of sections) {
        const el = document.getElementById(id);
        if (!el) { out.sections[id] = null; continue; }
        const s = gcs(el);
        out.sections[id] = {
          box: box(el),
          padding: s.padding,
          margin: s.margin,
          gap: s.gap,
          display: s.display,
          minHeight: s.minHeight,
          inner: [...el.children].map(c => {
            const cs = gcs(c);
            return { tag: c.tagName, cls: (c.className && c.className.baseVal !== undefined ? c.className.baseVal : c.className) || '', box: box(c), padding: cs.padding, margin: cs.margin, gap: cs.gap };
          }),
        };
      }
      // Jarak antar section berturut-turut
      const gaps = [];
      for (let i = 0; i < sections.length - 1; i++) {
        const a = document.getElementById(sections[i]);
        const b = document.getElementById(sections[i + 1]);
        if (a && b) gaps.push({ from: sections[i], to: sections[i + 1], gap: Math.round(b.getBoundingClientRect().top + scrollY - (a.getBoundingClientRect().bottom + scrollY)) });
      }
      out.sectionGaps = gaps;
      // Lebar konten di dalam tiap section vs viewport
      out.content = {};
      for (const sel of ['.hero__dalam', '.kue__dalam', '.galeri__daftar', '.timeline__daftar', '.counter__hari', '.alasan__daftar', '.surat__amplop', '.lampion__dalam', '.hadiah__dalam', '.footer .hati']) {
        const el = document.querySelector(sel);
        if (el) { const r = el.getBoundingClientRect(); out.content[sel] = { width: Math.round(r.width), left: Math.round(r.left), right: Math.round(r.right), centered: Math.abs((r.left + r.right) / 2 - innerWidth / 2) < 2 }; }
      }
      return out;
    }, SECTIONS);

    data.errors = errors;
    report[vp.name] = data;

    // Screenshot tiap section dengan viewport tinggi secukupnya
    for (const id of SECTIONS) {
      const el = page.locator('#' + id);
      if (await el.count() === 0) continue;
      const box = await el.boundingBox();
      if (!box) continue;
      await page.evaluate(id => document.getElementById(id).scrollIntoView({ block: 'start' }), id);
      await page.waitForTimeout(250);
      // viewport screenshot: tampilkan bagian atas section
      await page.screenshot({ path: path.join(OUT, `${vp.name}-${id}.png`) });
    }
    // Full page (diperkecil lewat CSS transform? tidak; simpan apa adanya)
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(OUT, `${vp.name}-full.png`), fullPage: true });
    await context.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
  console.log('OK ->', OUT);
})();
