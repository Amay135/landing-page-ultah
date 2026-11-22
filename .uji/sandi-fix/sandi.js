// Tes perbaikan kata sandi: sandi baru satu-satunya, pesan baru, input numerik terlihat.
// Jalankan dengan server lokal di :8000.
const { chromium } = require('playwright');
const URL = 'http://127.0.0.1:8000/index.html';

const PESAN = 'Hmm, belum tepat. Coba lagi ya 😅 Ingat tanggal jadian kita.';
let gagal = 0;
function ok(nama, lulus, extra = '') {
  if (!lulus) gagal++;
  console.log((lulus ? 'PASS' : 'FAIL') + '  ' + nama + (extra ? '  (' + extra + ')' : ''));
}
async function pesanGate(page) {
  return (await page.locator('#pesanGate').textContent()).trim();
}
async function cobaSandi(page, nilai) {
  await page.locator('#sandi').fill(nilai);
  await page.locator('#tombolBuka').click();
  await page.waitForTimeout(250);
  return page.locator('#gate').isVisible();
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });

  for (const vp of [{ w: 360, h: 800 }, { w: 1440, h: 900 }]) {
    console.log('\n===== ' + vp.w + 'px =====');
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    const error = [];
    page.on('console', m => { if (m.type() === 'error') error.push('console: ' + m.text()); });
    page.on('pageerror', e => error.push('pageerror: ' + e.message));

    // Kebenaran sumber: satu-satunya sandi adalah 28052026.
    const sumber = await (await page.request.get('http://127.0.0.1:8000/data.js?v=20260528')).text();
    ok('data.js memuat 28052026', sumber.includes('"28052026"'));
    ok('data.js tidak memuat 14022023', !sumber.includes('14022023'));
    ok('data.js tidak memuat petunjuk Valentine', !/Valentine/i.test(sumber));
    const html = await (await page.request.get('http://127.0.0.1:8000/index.html')).text();
    ok('index.html memakai cache-busting ?v=', /src="data\.js\?v=/.test(html) && /src="script\.js\?v=/.test(html));

    await page.goto(URL, { waitUntil: 'networkidle' });
    ok('gate tampil', await page.locator('#gate').isVisible());

    // Masalah 3: input numerik yang terlihat.
    const attr = await page.locator('#sandi').evaluate(el => ({
      type: el.type, inputMode: el.inputMode,
    }));
    ok('input terlihat (type=text)', attr.type === 'text', attr.type);
    ok('keyboard numerik (inputmode=numeric)', attr.inputMode === 'numeric', attr.inputMode);

    // Hanya angka yang diterima, dari ketikan, simbol, spasi, dan paste campuran.
    await page.locator('#sandi').fill('');
    await page.locator('#sandi').type('ab12 cd!3@#', { delay: 10 });
    ok('huruf/simbol/spasi dibuang saat diketik', (await page.locator('#sandi').inputValue()) === '123', await page.locator('#sandi').inputValue());
    await page.locator('#sandi').fill('');
    await page.locator('#sandi').pressSequentially('9a8b7 6!5', { delay: 10 });
    ok('hanya angka tersisa', (await page.locator('#sandi').inputValue()) === '98765');
    await page.locator('#sandi').fill('a1b2c3d4e5f6g7h8i9');
    ok('paste campuran disaring', (await page.locator('#sandi').inputValue()) === '12345678', await page.locator('#sandi').inputValue());
    await page.locator('#sandi').fill('1234567890123');
    ok('maksimal 8 digit', (await page.locator('#sandi').inputValue()) === '12345678', await page.locator('#sandi').inputValue());

    // Masalah 1 & 2: sandi yang benar/salah dan pesan baru.
    ok('input kosong ditolak', await cobaSandi(page, ''));
    ok('pesan kosong benar', (await pesanGate(page)) === PESAN, await pesanGate(page));
    ok('14022023 ditolak', await cobaSandi(page, '14022023'));
    ok('pesan 14022023 benar', (await pesanGate(page)) === PESAN, await pesanGate(page));
    ok('12345678 ditolak', await cobaSandi(page, '12345678'));
    ok('pesan tidak menyebut Valentine', !/Valentine/i.test(await pesanGate(page)));
    ok('pesan tampil role=status (toast lama, desain sama)',
      (await page.locator('#pesanGate').getAttribute('role')) === 'status');

    // Masalah 2 & 3: Enter membuka gate dengan sandi baru.
    await page.locator('#sandi').fill('28052026');
    await page.locator('#sandi').press('Enter');
    await page.waitForTimeout(900);
    ok('28052026 diterima lewat Enter', !(await page.locator('#gate').isVisible()));
    const musik = await page.evaluate(() => { const a = document.getElementById('musik'); return { paused: a.paused, t: a.currentTime }; });
    ok('musik mulai setelah gate terbuka', !musik.paused && musik.t > 0, JSON.stringify(musik));

    // Regresi tampilan: tidak ada scroll horizontal.
    const scroll = await page.evaluate(() => ({ w: innerWidth, c: document.documentElement.scrollWidth }));
    ok('tidak ada scroll horizontal', scroll.c <= scroll.w, JSON.stringify(scroll));

    ok('tanpa error console/page', error.length === 0, error.join(' | '));
    await ctx.close();
  }

  await browser.close();
  console.log('\n' + (gagal ? gagal + ' GAGAL' : 'SEMUA LULUS'));
  process.exit(gagal ? 1 : 0);
})();
