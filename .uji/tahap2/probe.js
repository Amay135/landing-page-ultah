// Probe: posisi anak-anak tiap section + gap, di 1440 dan 360.
const { chromium } = require('playwright');
const URL = 'http://127.0.0.1:8000/index.html';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const vp of [{ w: 360, h: 800 }, { w: 1440, h: 900 }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    await page.goto(URL, { waitUntil: 'networkidle' });
    if (await page.locator('#gate').isVisible()) {
      const s = page.locator('#sandi'); if (await s.isVisible()) await s.fill('28052026');
      await page.locator('#tombolBuka').click(); await page.waitForTimeout(1200);
    }
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 500) { await page.evaluate(yy => scrollTo(0, yy), y); await page.waitForTimeout(40); }
    await page.waitForTimeout(500);

    const data = await page.evaluate(() => {
      const out = {};
      const ids = ['hero', 'kue', 'counter', 'alasan', 'surat', 'lampion', 'hadiah', 'footer'];
      for (const id of ids) {
        const sec = document.getElementById(id);
        if (!sec) continue;
        const rb = sec.getBoundingClientRect();
        const visible = [...sec.querySelectorAll(':scope > *, :scope > * > *')].filter(el => {
          const r = el.getBoundingClientRect();
          return r.height > 0 && getComputedStyle(el).display !== 'none' && !el.hidden;
        });
        out[id] = {
          sectionTop: Math.round(rb.top + scrollY), sectionH: Math.round(rb.height),
          rows: visible.slice(0, 14).map(el => {
            const r = el.getBoundingClientRect();
            const cs = getComputedStyle(el);
            return { tag: el.tagName, cls: (typeof el.className === 'string' ? el.className : el.className.baseVal) || '', top: Math.round(r.top + scrollY), h: Math.round(r.height), mb: cs.marginBottom, mt: cs.marginTop, gap: cs.gap };
          })
        };
      }
      // Gallery grid rows
      const g = document.getElementById('galeriDaftar');
      if (g) {
        out.galeriRows = [...g.children].map((el, i) => { const r = el.getBoundingClientRect(); return { i: i + 1, top: Math.round(r.top + scrollY), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) }; });
      }
      return out;
    });
    console.log('\n########## ' + vp.w + 'px ##########');
    for (const [id, v] of Object.entries(data)) {
      if (id === 'galeriRows') { console.log('galeriRows:'); v.forEach(x => console.log(`  #${x.i} top=${x.top} left=${x.left} w=${x.w} h=${x.h}`)); continue; }
      console.log(`\n${id}: top=${v.sectionTop} h=${v.sectionH}`);
      let prevBottom = null;
      for (const r of v.rows) {
        let gap = '';
        if (prevBottom !== null && r.h > 0) gap = ` gapPrev=${r.top - prevBottom}`;
        prevBottom = r.top + r.h;
        console.log(`  ${r.tag}.${r.cls.slice(0, 34).padEnd(34)} top=${String(r.top).padStart(5)} h=${String(r.h).padStart(4)} mt=${r.mt} mb=${r.mb} gap=${r.gap}${gap}`);
      }
    }
    await ctx.close();
  }
  await browser.close();
})();
