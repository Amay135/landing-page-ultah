// Ukur tinggi nyata bar WhatsApp dan posisi #kontrol di beberapa viewport.
// Jalankan: node .uji/tahap7/ukur.js (server di :8000)
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const URL = 'http://127.0.0.1:8000/index.html';
const OUT = path.join(__dirname, 'sebelum');
fs.mkdirSync(OUT, { recursive: true });

const VPS = [
  { n: '320x568', w: 320, h: 568 },
  { n: '390x844', w: 390, h: 844 },
  { n: '1440x900', w: 1440, h: 900 },
];

const ambil = () => {
  const r = (s) => {
    const el = document.querySelector(s);
    if (!el) return null;
    const b = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return { top: +b.top.toFixed(1), bottom: +b.bottom.toFixed(1), left: +b.left.toFixed(1), right: +b.right.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1), display: cs.display, hidden: el.hidden, padding: cs.padding, gap: cs.gap, fontSize: cs.fontSize, lineHeight: cs.lineHeight };
  };
  return {
    vh: innerHeight,
    vw: innerWidth,
    waTampil: document.body.classList.contains('wa-tampil'),
    bar: r('#waBar'),
    tombolWa: r('#waTombol'),
    teksWa: r('#footerTeks'),
    kontrol: r('#kontrol'),
    mute: r('#tombolMute'),
    hati: r('#hati'),
    kucing: r('#maskot'),
    footer: r('#footer'),
  };
};

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const vp of VPS) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
    await page.evaluate(() => document.fonts.ready);

    const sandi = await page.evaluate(() => DATA.kataSandi);
    await page.locator('#sandi').fill(sandi);
    await page.locator('#sandi').press('Enter');
    await page.waitForFunction(() => !document.getElementById('gate'), null, { timeout: 3000 });
    await page.waitForFunction(() => !document.getElementById('tombolMute').hidden, null, { timeout: 5000 });
    await page.waitForTimeout(400);

    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(300);
    const atas = await page.evaluate(ambil);
    await page.screenshot({ path: path.join(OUT, vp.n + '-atas.png') });

    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForFunction(() => document.body.classList.contains('wa-tampil'), null, { timeout: 4000 });
    await page.waitForTimeout(600);
    const bawah = await page.evaluate(ambil);
    await page.screenshot({ path: path.join(OUT, vp.n + '-bawah.png') });

    const cek = (state) => {
      const k = state.kontrol, t = state.tombolWa, m = state.kucing;
      return {
        gaBarTinggi: +(state.vh - t.top).toFixed(1),
        barTinggi: state.bar.h,
        kontrolBottom: +(state.vh - k.bottom).toFixed(1),
        hatiKeWa: +(t.top - state.hati.bottom).toFixed(1),
        kontrolKeKucing: +(m.left - k.right).toFixed(1),
        kontrolKeFooter: +(state.vh - k.bottom).toFixed(1),
        jarakMuteHati: +(state.hati.top - state.mute.bottom).toFixed(1),
      };
    };

    console.log('\n===== ' + vp.n + ' =====');
    console.log('ATAS  bottomKontrol=' + cek(atas).kontrolBottom + ' barH=' + atas.bar.h + ' kontrol=' + JSON.stringify([atas.kontrol.top, atas.kontrol.bottom]) + ' kucing=' + JSON.stringify([atas.kucing.top, atas.kucing.bottom]));
    console.log('BAWAH barH=' + bawah.bar.h + ' waTombolTop=' + bawah.tombolWa.top + ' teksWaH=' + bawah.teksWa.h + ' kontrol=' + JSON.stringify([bawah.kontrol.top, bawah.kontrol.bottom]) + ' kucing=' + JSON.stringify([bawah.kucing.top, bawah.kucing.bottom]));
    console.log('RINGKAS atas ', JSON.stringify(cek(atas)));
    console.log('RINGKAS bawah', JSON.stringify(cek(bawah)));
    await ctx.close();
  }
  await browser.close();
})();
