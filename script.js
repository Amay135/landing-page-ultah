// script.js - logika interaktif. Tiap fitur ditambahkan bertahap.

// --- Elemen ---
const gate = document.getElementById("gate");
const judulGate = document.getElementById("gateJudul");
const formGate = document.getElementById("formGate");
const labelSandi = document.getElementById("labelSandi");
const sandi = document.getElementById("sandi");
const pesanGate = document.getElementById("pesanGate");
const tombolBuka = document.getElementById("tombolBuka");
const audio = document.getElementById("musik");
const tombolMute = document.getElementById("tombolMute");

// --- Isi awal dari data.js ---
document.title = "Selamat Ulang Tahun, " + DATA.namaDia;
judulGate.textContent = DATA.gateTeks;
tombolBuka.textContent = DATA.gateTombol;
audio.src = DATA.musikFile;

// --- Gate: kata sandi opsional ---
const pakaiSandi = Boolean(DATA.kataSandi);
labelSandi.hidden = !pakaiSandi;
sandi.hidden = !pakaiSandi;
(pakaiSandi ? sandi : tombolBuka).focus();

formGate.addEventListener("submit", (e) => {
  e.preventDefault();
  if (pakaiSandi && sandi.value.trim() !== DATA.kataSandi) {
    pesanGate.textContent = DATA.petunjukSandi
      ? DATA.pesanSandiSalah + " " + DATA.petunjukSandi
      : DATA.pesanSandiSalah;
    return;
  }
  bukaGate();
});

// Gate memudar, musik mulai, confetti pertama jatuh, halaman bisa di-scroll.
function bukaGate() {
  gate.classList.add("gate--pergi");
  document.body.classList.remove("gate-tertutup");
  setTimeout(() => gate.remove(), 700);
  mulaiMusik();
  mulaiKetikHero(); // hero baru terlihat setelah gate pergi
  mulaiConfetti();
}

// Browser memblokir autoplay, jadi musik hanya mulai dari klik pengguna.
function mulaiMusik() {
  audio.play().then(
    () => { tombolMute.hidden = false; },
    () => { /* file musik belum ada atau diblokir: biarkan tombol mute tersembunyi */ }
  );
}

// Tombol mute/unmute di pojok kanan atas.
tombolMute.addEventListener("click", () => {
  audio.muted = !audio.muted;
  tombolMute.textContent = audio.muted ? "🔇" : "🔊";
  tombolMute.setAttribute("aria-pressed", String(audio.muted));
  tombolMute.setAttribute("aria-label", audio.muted ? "Nyalakan musik" : "Matikan musik");
});

// --- Hero (F2) ---
const mqGerakMinimal = matchMedia("(prefers-reduced-motion: reduce)");

const heroAtas = document.getElementById("heroAtas");
const heroJudul = document.getElementById("heroJudul");
const heroKetik = document.getElementById("heroKetik");
const heroNama = document.getElementById("heroNama");
const heroSubteks = document.getElementById("heroSubteks");
const heroPanah = document.getElementById("heroPanah");

heroAtas.textContent = DATA.heroAtas;
heroAtas.hidden = !DATA.heroAtas;
heroSubteks.textContent = DATA.heroSubteks;
heroSubteks.hidden = !DATA.heroSubteks;
heroPanah.textContent = DATA.heroPanah;
heroPanah.hidden = !DATA.heroPanah;
heroNama.textContent = DATA.namaDia;
heroJudul.setAttribute("aria-label", DATA.heroJudul + ", " + DATA.namaDia);

// Klik nama dia: confetti meledak di titik nama.
heroNama.addEventListener("click", () => {
  const kotak = heroNama.getBoundingClientRect();
  burst(kotak.left + kotak.width / 2, kotak.top + kotak.height / 2, 90);
});

// Judul diketik pelan, lalu nama muncul. Gerak minimal: tampil seketika.
function mulaiKetikHero() {
  const teks = DATA.heroJudul + ",";
  const selesai = () => {
    heroKetik.classList.add("hero__ketik--selesai");
    heroNama.classList.add("hero__nama--tampil");
    heroNama.disabled = false;
  };
  if (mqGerakMinimal.matches) {
    heroKetik.textContent = teks;
    selesai();
    return;
  }
  let i = 0;
  const jeda = setInterval(() => {
    i += 1;
    heroKetik.textContent = teks.slice(0, i);
    if (i >= teks.length) {
      clearInterval(jeda);
      selesai();
    }
  }, 55);
}

// --- Confetti global (F3) ---
// Canvas fixed di belakang konten. Partikel dibatasi agar tetap lancar di HP.
const kanvasConfetti = document.getElementById("confetti");
const ctxConfetti = kanvasConfetti.getContext("2d");
const WARNA_CONFETTI = ["#F4B6C2", "#FFD3B6", "#CDB4DB", "#E8B86D"];
const BATAS_PARTIKEL = 160; // batas total, termasuk ledakan
const DURASI_LEBAT = 4000; // ms, sesuai PRD 3-5 detik

let partikelConfetti = [];
let rafConfetti = 0;
let waktuSebelumnya = 0;
let sisaLebat = 0;
let timbunanSpawn = 0;
let lebarKanvas = 0;
let tinggiKanvas = 0;

// Ukuran canvas mengikuti layar dan rasio piksel perangkat.
function ukurKanvasConfetti() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  lebarKanvas = innerWidth;
  tinggiKanvas = innerHeight;
  kanvasConfetti.width = lebarKanvas * dpr;
  kanvasConfetti.height = tinggiKanvas * dpr;
  ctxConfetti.setTransform(dpr, 0, 0, dpr, 0, 0);
}
ukurKanvasConfetti();
addEventListener("resize", ukurKanvasConfetti);

// Batas jumlah saat hujan lebat dan saat looping ringan.
const batasHujan = () => (lebarKanvas < 700 ? 64 : 90);
const targetRingan = () => (lebarKanvas < 700 ? 18 : 28);

function acak(min, maks) {
  return min + Math.random() * (maks - min);
}

function warnaAcak() {
  return WARNA_CONFETTI[(Math.random() * WARNA_CONFETTI.length) | 0];
}

// Partikel jatuh dari atas layar (hujan lebat dan looping ringan).
function buatPartikelJatuh() {
  const pita = Math.random() < 0.3;
  return {
    jenis: pita ? "pita" : "kertas",
    x: acak(0, lebarKanvas),
    y: acak(-80, -12),
    lebar: pita ? acak(20, 34) : acak(7, 13),
    tinggi: pita ? acak(5, 8) : acak(5, 9),
    vx: acak(-14, 14),
    vy: acak(55, 120),
    rotasi: acak(0, Math.PI * 2),
    putaran: acak(-4, 4),
    ayunFase: acak(0, Math.PI * 2),
    ayunAmp: acak(10, 34),
    ayunLaju: acak(1, 2.6),
    warna: warnaAcak(),
    alpha: 1,
    umur: Infinity,
  };
}

// Partikel ledakan dari satu titik (burst).
function buatPartikelLedakan(x, y) {
  const sudut = acak(0, Math.PI * 2);
  const laju = acak(120, 380);
  const pita = Math.random() < 0.3;
  return {
    jenis: pita ? "pita" : "kertas",
    x,
    y,
    lebar: pita ? acak(18, 30) : acak(6, 11),
    tinggi: pita ? acak(5, 7) : acak(5, 8),
    vx: Math.cos(sudut) * laju,
    vy: Math.sin(sudut) * laju - 80,
    rotasi: acak(0, Math.PI * 2),
    putaran: acak(-8, 8),
    ayunFase: acak(0, Math.PI * 2),
    ayunAmp: acak(0, 10),
    ayunLaju: acak(1, 2.6),
    warna: warnaAcak(),
    alpha: 1,
    umur: acak(900, 1400),
  };
}

// Ledakan confetti di titik layar. Dipakai hero dan momen penting (lilin, kado).
function burst(x, y, jumlah) {
  const n = mqGerakMinimal.matches ? Math.max(4, Math.round(jumlah / 3)) : jumlah;
  for (let i = 0; i < n && partikelConfetti.length < BATAS_PARTIKEL; i++) {
    partikelConfetti.push(buatPartikelLedakan(x, y));
  }
  mulaiLoopConfetti();
}

// Mulai hujan lebat 4 detik, lalu lanjut ringan terus (kecuali gerak minimal).
function mulaiConfetti() {
  ukurKanvasConfetti();
  if (mqGerakMinimal.matches) return;
  sisaLebat = DURASI_LEBAT;
  mulaiLoopConfetti();
}

function mulaiLoopConfetti() {
  if (rafConfetti) return;
  waktuSebelumnya = performance.now();
  rafConfetti = requestAnimationFrame(langkahConfetti);
}

function hentikanLoopConfetti() {
  cancelAnimationFrame(rafConfetti);
  rafConfetti = 0;
}

function langkahConfetti(waktu) {
  const dt = Math.min((waktu - waktuSebelumnya) / 1000, 0.05);
  waktuSebelumnya = waktu;

  // Spawn partikel baru dari atas layar.
  if (!mqGerakMinimal.matches) {
    if (sisaLebat > 0) sisaLebat = Math.max(0, sisaLebat - dt * 1000);
    const batas = sisaLebat > 0 ? batasHujan() : targetRingan();
    timbunanSpawn = Math.min(timbunanSpawn + (sisaLebat > 0 ? 220 : 22) * dt, 8);
    while (timbunanSpawn >= 1 && partikelConfetti.length < batas) {
      timbunanSpawn -= 1;
      partikelConfetti.push(buatPartikelJatuh());
    }
  }

  // Gerakkan partikel: jatuh, mengayun, berputar.
  for (let i = partikelConfetti.length - 1; i >= 0; i--) {
    const p = partikelConfetti[i];
    p.ayunFase += p.ayunLaju * dt;
    p.x += (p.vx + Math.sin(p.ayunFase) * p.ayunAmp) * dt;
    p.y += p.vy * dt;
    p.rotasi += p.putaran * dt;
    if (p.umur !== Infinity) {
      p.vy += 620 * dt; // gravitasi untuk partikel ledakan
      p.umur -= dt * 1000;
      p.alpha = Math.min(1, Math.max(0, p.umur / 700));
      if (p.umur <= 0) {
        partikelConfetti.splice(i, 1);
        continue;
      }
    }
    if (p.y > tinggiKanvas + 40) partikelConfetti.splice(i, 1);
  }

  gambarConfetti();
  rafConfetti = requestAnimationFrame(langkahConfetti);

  // Berhenti saat tidak ada yang perlu dianimasikan (mis. mode gerak minimal).
  if (!sisaLebat && partikelConfetti.length === 0) hentikanLoopConfetti();
}

function gambarConfetti() {
  ctxConfetti.clearRect(0, 0, lebarKanvas, tinggiKanvas);
  for (const p of partikelConfetti) {
    ctxConfetti.save();
    ctxConfetti.translate(p.x, p.y);
    ctxConfetti.rotate(p.rotasi);
    ctxConfetti.globalAlpha = p.alpha;
    ctxConfetti.fillStyle = p.warna;
    if (p.jenis === "pita") {
      // Pita: garis melengkung yang bergelombang seperti kertas pita.
      ctxConfetti.strokeStyle = p.warna;
      ctxConfetti.lineWidth = p.tinggi;
      ctxConfetti.lineCap = "round";
      ctxConfetti.beginPath();
      ctxConfetti.moveTo(-p.lebar / 2, 0);
      ctxConfetti.quadraticCurveTo(0, Math.sin(p.ayunFase) * p.tinggi, p.lebar / 2, 0);
      ctxConfetti.stroke();
    } else {
      ctxConfetti.fillRect(-p.lebar / 2, -p.tinggi / 2, p.lebar, p.tinggi);
    }
    ctxConfetti.restore();
  }
}

// Jeda saat tab tidak aktif agar baterai dan CPU tidak terpakai sia-sia.
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    hentikanLoopConfetti();
    return;
  }
  if (!mqGerakMinimal.matches || partikelConfetti.length) mulaiLoopConfetti();
});
