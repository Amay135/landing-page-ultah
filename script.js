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

// --- Kue (F4A): tulisan, lilin, tiup lilin ---
const kue = document.getElementById("kue");
const kueSvg = document.getElementById("kueSvg");
const kueTeks = document.getElementById("kueTeks");
const tombolTiup = document.getElementById("tombolTiup");
const tombolPotong = document.getElementById("tombolPotong");
const harapanKue = document.getElementById("kueHarapan");
const kartuPotongan = document.getElementById("kueKartu");
const formPotongan = document.getElementById("formPotongan");
const labelPenerima = document.getElementById("labelPenerima");
const namaPenerima = document.getElementById("namaPenerima");
const pesanPenerima = document.getElementById("pesanPenerima");
const tombolKasih = document.getElementById("tombolKasih");
const tombolPotongLagi = document.getElementById("tombolPotongLagi");
const potonganKue = document.getElementById("kue-potongan");
const piringKue = document.getElementById("kue-piring");
const penerimaTeks = document.getElementById("kuePenerimaTeks");
const penerimaLucu = document.getElementById("kueLucu");
const daftarPenerima = document.getElementById("kuePenerimaDaftar");

tombolTiup.textContent = DATA.kueLabelTiup;
tombolPotong.textContent = DATA.kueLabelPotong;
tombolKasih.textContent = DATA.kueLabelKasih;
tombolPotongLagi.textContent = DATA.kueLabelPotongLagi;
daftarPenerima.setAttribute("aria-label", DATA.kueDaftarAria);
kueSvg.setAttribute("aria-label", DATA.kueAria);

// Tulisan di tingkat tengah: perkecil font bila nama panjang agar tetap muat.
function aturTeksKue() {
  const lebarMaks = 190; // satuan viewBox
  let ukuran = 26;
  kueTeks.textContent = DATA.kueTulisan;
  kueTeks.setAttribute("font-size", ukuran);
  while (ukuran > 9 && kueTeks.getComputedTextLength() > lebarMaks) {
    ukuran -= 1;
    kueTeks.setAttribute("font-size", ukuran);
  }
}
aturTeksKue();
document.fonts?.ready.then(aturTeksKue); // ukur ulang setelah font Caveat termuat

// Latar gradien kue ditampilkan lewat body agar confetti (di atasnya) tetap terlihat.
const pengamatLatarKue = new IntersectionObserver(
  ([entri]) => document.body.classList.toggle("kue-aktif", entri.intersectionRatio >= 0.55),
  { threshold: 0.55 }
);
pengamatLatarKue.observe(kue);

// Tiup lilin: api padam + asap, confetti di api, "Make a wish", lalu tombol potong.
let lilinPadam = false;
tombolTiup.addEventListener("click", () => {
  if (lilinPadam) return;
  lilinPadam = true;
  kue.classList.add("kue--padam");
  kueSvg.setAttribute("aria-label", DATA.kueAriaPadam);
  tombolTiup.hidden = true;
  harapanKue.textContent = DATA.lilinPadamTeks;
  harapanKue.classList.add("kue__harapan--tampil");

  const api = kueSvg.querySelector(".kue__api");
  const kotak = (api || kueSvg).getBoundingClientRect();
  burst(kotak.left + kotak.width / 2, kotak.top + kotak.height / 2, 120);

  // Tombol potong muncul setelah api padam.
  setTimeout(() => {
    tombolPotong.hidden = false;
    tombolPotong.focus({ preventScroll: true });
  }, 800);
});

// --- Kue (F4B): potong, beri potongan, daftar penerima ---
const jedaPisau = mqGerakMinimal.matches ? 0 : 450;
const jedaKartu = mqGerakMinimal.matches ? 0 : 1000;
let jumlahPenerima = 0;
let sedangPotong = false;

// Animasi pisau, potongan terpisah, lalu kartu nama penerima.
function mulaiPotong() {
  if (sedangPotong) return;
  sedangPotong = true;
  tombolPotong.hidden = true;
  kartuPotongan.hidden = true;
  tombolPotongLagi.hidden = true;
  penerimaTeks.textContent = "";
  penerimaLucu.textContent = "";
  pesanPenerima.textContent = "";
  namaPenerima.value = "";
  labelPenerima.textContent = jumlahPenerima === 0 ? DATA.kueTanyaPenerima : DATA.kueTanyaPenerimaLagi;

  piringKue.hidden = false;
  potonganKue.hidden = false;
  potonganKue.classList.remove("kue__potongan--tampil", "kue__potongan--piring");

  // Ulang animasi pisau dari awal.
  kue.classList.remove("kue--potong");
  void kue.offsetWidth;
  kue.classList.add("kue--potong");

  setTimeout(() => {
    potonganKue.classList.add("kue__potongan--tampil");
    sedangPotong = false;
  }, jedaPisau);

  setTimeout(() => {
    kartuPotongan.hidden = false;
    namaPenerima.focus({ preventScroll: true });
  }, jedaKartu);
}

tombolPotong.addEventListener("click", mulaiPotong);
tombolPotongLagi.addEventListener("click", mulaiPotong);

formPotongan.addEventListener("submit", (e) => {
  e.preventDefault();
  const nama = namaPenerima.value.trim().slice(0, 30);
  if (!nama) {
    pesanPenerima.textContent = DATA.kuePesanNamaKosong;
    namaPenerima.focus({ preventScroll: true });
    return;
  }
  pesanPenerima.textContent = "";
  jumlahPenerima += 1;

  // Bandingkan tanpa peduli huruf besar-kecil; tampil dengan textContent, tanpa HTML.
  const namaSaya = DATA.namaSaya.trim().toLowerCase();
  const cocok = namaSaya !== "" && nama.toLowerCase().includes(namaSaya);

  const pola = jumlahPenerima === 1 ? DATA.kueTeksPenerima : DATA.kueTeksPenerimaLagi;
  penerimaTeks.textContent = pola.replace("{nama}", () => nama);
  penerimaLucu.textContent = cocok ? DATA.potonganLucuTeks : "";

  const baris = document.createElement("li");
  baris.textContent = nama;
  daftarPenerima.appendChild(baris);
  daftarPenerima.hidden = false;

  kartuPotongan.hidden = true;
  potonganKue.classList.remove("kue__potongan--tampil");
  potonganKue.classList.add("kue__potongan--piring");

  const kotakPiring = piringKue.getBoundingClientRect();
  burst(kotakPiring.left + kotakPiring.width / 2, kotakPiring.top + kotakPiring.height / 2, 40);

  tombolPotongLagi.hidden = false;
  tombolPotongLagi.focus({ preventScroll: true });
});

// --- Galeri foto polaroid (F5) ---
const galeriDaftar = document.getElementById("galeriDaftar");
const WARNA_PLACEHOLDER = ["#F4B6C2", "#FFD3B6", "#CDB4DB", "#E8B86D"];
const fotoImgGaleri = [];

// Placeholder pastel bertanda [CONTOH] selama file di assets/foto belum ada.
function srcPlaceholder(i) {
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 320'>" +
    `<rect width='320' height='320' fill='${WARNA_PLACEHOLDER[i % WARNA_PLACEHOLDER.length]}'/>` +
    "<circle cx='160' cy='146' r='54' fill='#FFF6EC' opacity='.5'/>" +
    "<path d='M138 188q22 16 44 0' fill='none' stroke='#5A3E36' stroke-width='4' stroke-linecap='round' opacity='.45'/>" +
    "<text x='160' y='258' text-anchor='middle' font-family='Nunito, sans-serif' font-size='19' fill='#5A3E36'>[CONTOH]</text>" +
    "</svg>";
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

DATA.foto.forEach((foto, i) => {
  const kartuFoto = document.createElement("figure");
  kartuFoto.className = "foto";
  // Miring tipis acak saat diam; arah miring acak saat disentuh.
  kartuFoto.style.setProperty("--rot", acak(-2.5, 2.5).toFixed(1) + "deg");
  kartuFoto.style.setProperty("--tape-x", acak(28, 72).toFixed(0) + "%");
  kartuFoto.style.setProperty("--tape-rot", acak(-9, 9).toFixed(0) + "deg");

  const bingkai = document.createElement("button");
  bingkai.type = "button";
  bingkai.className = "foto__bingkai foto-hidup";
  bingkai.style.setProperty("--rot-hidup", (Math.random() < 0.5 ? -3 : 3) + "deg");
  bingkai.setAttribute("aria-label", "Buka foto: " + foto.caption + ", " + foto.tanggal);

  const img = document.createElement("img");
  img.className = "foto__img";
  img.alt = foto.caption;
  img.loading = "lazy";
  img.decoding = "async";
  img.addEventListener("error", () => { img.src = srcPlaceholder(i); }, { once: true });
  img.src = foto.src;
  fotoImgGaleri.push(img);

  const caption = document.createElement("figcaption");
  caption.className = "foto__caption";
  const captionTeks = document.createElement("span");
  captionTeks.className = "foto__captionTeks";
  captionTeks.textContent = foto.caption;
  const captionTanggal = document.createElement("span");
  captionTanggal.className = "foto__tanggal";
  captionTanggal.textContent = foto.tanggal;
  caption.append(captionTeks, captionTanggal);

  bingkai.addEventListener("click", () => bukaLightbox(i));
  bingkai.append(img);
  kartuFoto.append(bingkai, caption);
  galeriDaftar.append(kartuFoto);
});

// Lightbox: satu foto besar, navigasi tombol/panah keyboard/swipe, Esc menutup.
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxTeks = document.getElementById("lightboxTeks");
const lightboxTanggal = document.getElementById("lightboxTanggal");
const lightboxTutup = document.getElementById("lightboxTutup");
const lightboxSebelum = document.getElementById("lightboxSebelum");
const lightboxSesudah = document.getElementById("lightboxSesudah");
const adaBanyakFoto = DATA.foto.length > 1;
lightboxSebelum.hidden = !adaBanyakFoto;
lightboxSesudah.hidden = !adaBanyakFoto;

let indeksLightbox = 0;

function isiLightbox() {
  const foto = DATA.foto[indeksLightbox];
  const imgAsal = fotoImgGaleri[indeksLightbox];
  lightboxImg.src = imgAsal.currentSrc || imgAsal.src;
  lightboxImg.alt = foto.caption;
  lightboxTeks.textContent = foto.caption;
  lightboxTanggal.textContent = foto.tanggal;
}

function bukaLightbox(i) {
  indeksLightbox = i;
  isiLightbox();
  lightbox.showModal();
  document.body.classList.add("lightbox-terbuka");
}

// Geser satu foto; berputar kembali ke awal/akhir supaya tidak mentok.
function geserLightbox(langkah) {
  const jumlah = DATA.foto.length;
  if (!jumlah) return;
  indeksLightbox = (indeksLightbox + langkah + jumlah) % jumlah;
  isiLightbox();
}

lightboxTutup.addEventListener("click", () => lightbox.close());
lightboxSebelum.addEventListener("click", () => geserLightbox(-1));
lightboxSesudah.addEventListener("click", () => geserLightbox(1));
lightbox.addEventListener("close", () => document.body.classList.remove("lightbox-terbuka"));

// Klik backdrop (di luar kartu) menutup.
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) lightbox.close();
});

// Panah kiri/kanan saat lightbox terbuka (Esc sudah ditangani <dialog>).
lightbox.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") geserLightbox(-1);
  else if (e.key === "ArrowRight") geserLightbox(1);
});

// Swipe kiri/kanan di HP; abaikan geser vertikal.
let sentuhAwalX = 0;
let sentuhAwalY = 0;
lightbox.addEventListener("touchstart", (e) => {
  sentuhAwalX = e.touches[0].clientX;
  sentuhAwalY = e.touches[0].clientY;
}, { passive: true });
lightbox.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - sentuhAwalX;
  const dy = e.changedTouches[0].clientY - sentuhAwalY;
  if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) geserLightbox(dx < 0 ? 1 : -1);
}, { passive: true });

// Paralaks halus per foto: geser berlawanan arah scroll, dibatasi agar tak aneh.
if (!mqGerakMinimal.matches) {
  const fotoParalaks = [...galeriDaftar.querySelectorAll(".foto")];
  let dasarParalaks = [];
  let rafParalaksFoto = 0;

  function ukurParalaksFoto() {
    for (const el of fotoParalaks) el.style.transform = "";
    dasarParalaks = fotoParalaks.map((el) => el.getBoundingClientRect().top + scrollY);
    perbaruiParalaksFoto();
  }

  function perbaruiParalaksFoto() {
    rafParalaksFoto = 0;
    const tengahLayar = scrollY + innerHeight / 2;
    fotoParalaks.forEach((el, i) => {
      const jarak = tengahLayar - (dasarParalaks[i] + el.offsetHeight / 2);
      const geser = Math.max(-16, Math.min(16, jarak * 0.05));
      el.style.transform = `translate3d(0, ${geser.toFixed(1)}px, 0)`;
    });
  }

  function mintaParalaksFoto() {
    if (!rafParalaksFoto) rafParalaksFoto = requestAnimationFrame(perbaruiParalaksFoto);
  }

  addEventListener("scroll", mintaParalaksFoto, { passive: true });
  addEventListener("resize", ukurParalaksFoto);
  ukurParalaksFoto();
}

// --- Timeline kisah kita (F6) ---
const timelineDaftar = document.getElementById("timelineDaftar");
const formatTanggal = new Intl.DateTimeFormat("id-ID", {
  day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
});

// "2023-01-10" -> "10 Januari 2023"; tanggal tak dikenal ditampilkan apa adanya.
function tanggalPanjang(tanggal) {
  const cocok = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tanggal);
  if (!cocok) return tanggal;
  return formatTanggal.format(Date.UTC(+cocok[1], +cocok[2] - 1, +cocok[3]));
}

const itemTimeline = DATA.timeline.map((momen, i) => {
  const item = document.createElement("li");
  item.className = "timeline__item";

  const titik = document.createElement("span");
  titik.className = "timeline__titik";
  titik.setAttribute("aria-hidden", "true");

  const kartu = document.createElement("div");
  kartu.className = "timeline__kartu card";

  const tanggal = document.createElement("p");
  tanggal.className = "timeline__tanggal";
  tanggal.textContent = tanggalPanjang(momen.tanggal);

  const judul = document.createElement("h3");
  judul.className = "timeline__judul";
  judul.textContent = momen.judul;

  kartu.append(tanggal, judul);

  if (momen.teks) {
    const teks = document.createElement("p");
    teks.className = "timeline__teks";
    teks.textContent = momen.teks;
    kartu.append(teks);
  }

  // Foto opsional: efek hidup yang sama dengan galeri (F5).
  if (momen.foto) {
    const foto = document.createElement("img");
    foto.className = "timeline__foto foto-hidup";
    foto.alt = momen.judul;
    foto.loading = "lazy";
    foto.decoding = "async";
    foto.addEventListener("error", () => { foto.src = srcPlaceholder(i); }, { once: true });
    foto.src = momen.foto;
    kartu.append(foto);
  }

  item.append(titik, kartu);
  timelineDaftar.append(item);
  return item;
});

if (!mqGerakMinimal.matches) {
  // Momen muncul satu per satu saat masuk layar.
  const pengamatTimeline = new IntersectionObserver((entri, pengamat) => {
    for (const e of entri) {
      if (!e.isIntersecting) continue;
      e.target.classList.add("timeline__item--tampil");
      pengamat.unobserve(e.target);
    }
  }, { threshold: 0.25 });
  itemTimeline.forEach((item) => pengamatTimeline.observe(item));

  // Garis tumbuh mengikuti scroll (--progres dipakai CSS).
  let rafGarisTimeline = 0;
  function perbaruiGarisTimeline() {
    rafGarisTimeline = 0;
    const kotak = timelineDaftar.getBoundingClientRect();
    if (!kotak.height) return;
    const progres = Math.max(0, Math.min(1, (innerHeight * 0.65 - kotak.top) / kotak.height));
    timelineDaftar.style.setProperty("--progres", progres.toFixed(3));
  }
  function mintaGarisTimeline() {
    if (!rafGarisTimeline) rafGarisTimeline = requestAnimationFrame(perbaruiGarisTimeline);
  }
  addEventListener("scroll", mintaGarisTimeline, { passive: true });
  addEventListener("resize", mintaGarisTimeline);
  perbaruiGarisTimeline();
}

// --- Counter kebersamaan (F7) ---
const counterHari = document.getElementById("counterHari");
const counterJam = document.getElementById("counterJam");
const counterBawah = document.getElementById("counterBawah");

counterBawah.textContent = DATA.counterBawah;
counterBawah.hidden = !DATA.counterBawah;

// Selisih hari kalender di Asia/Jakarta, bukan zona waktu perangkat.
function jumlahHariBersama() {
  const cocok = /^(\d{4})-(\d{2})-(\d{2})$/.exec(DATA.tanggalJadian);
  if (!cocok) return 0;
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" })
    .format(new Date())
    .split("-")
    .map(Number);
  const selisih = Date.UTC(y, m - 1, d) - Date.UTC(+cocok[1], +cocok[2] - 1, +cocok[3]);
  return Math.max(0, Math.round(selisih / 86400000));
}

const hariBersama = jumlahHariBersama();

function tampilHari(nilai) {
  counterHari.textContent = DATA.counterTeks.replace("{hari}", () => nilai.toLocaleString("id-ID"));
}

// Angka naik dari 0 saat counter masuk layar.
if (mqGerakMinimal.matches) {
  tampilHari(hariBersama);
} else {
  tampilHari(0);
  const pengamatCounter = new IntersectionObserver(([entri]) => {
    if (!entri.isIntersecting) return;
    pengamatCounter.disconnect();
    const mulai = performance.now();
    const naik = (waktu) => {
      const t = Math.min((waktu - mulai) / 1400, 1);
      tampilHari(Math.round(hariBersama * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(naik);
    };
    requestAnimationFrame(naik);
  }, { threshold: 0.5 });
  pengamatCounter.observe(counterHari);
}

// Jam:menit:detik Asia/Jakarta, diperbarui tiap detik.
const formatJam = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
});

function perbaruiJam() {
  const bagian = {};
  for (const p of formatJam.formatToParts(new Date())) bagian[p.type] = p.value;
  counterJam.textContent = bagian.hour + ":" + bagian.minute + ":" + bagian.second;
}

perbaruiJam();
setInterval(perbaruiJam, 1000);

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

// --- Stiker dekoratif dan parallax (F13) ---
// SVG buatan sendiri: daun kering, bunga, pita, bintang kertas, hati, washi tape, sobekan kertas.
const BENTUK_STIKER = [
  `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M7 33C7 18 19 7 33 7c0 14-11 26-26 26Z" fill="#CDB4DB"/><path d="M10 30 27 13M16 30l5-11M26 22l-10 5" stroke="#5A3E36" stroke-width="1.1" stroke-linecap="round" opacity=".4" fill="none"/></svg>`,
  `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><g fill="#F4B6C2"><circle cx="20" cy="9" r="7"/><circle cx="30" cy="16.5" r="7"/><circle cx="26.5" cy="29" r="7"/><circle cx="13.5" cy="29" r="7"/><circle cx="10" cy="16.5" r="7"/></g><circle cx="20" cy="20" r="5.5" fill="#E8B86D"/></svg>`,
  `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M17 20C10 11 3 13 4 20c.8 5 8 5 13 0Z" fill="#F4B6C2"/><path d="M23 20c7-9 13-7 12 0-.8 5-8 5-12 0Z" fill="#F4B6C2"/><path d="M16 22 12 35l8-4 4 4V22Z" fill="#E8B86D"/><circle cx="20" cy="20" r="3.4" fill="#E8B86D"/></svg>`,
  `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="m20 4 4.7 9.5 10.5 1.5-7.6 7.4 1.8 10.6L20 28l-9.4 5 1.8-10.6-7.6-7.4 10.5-1.5Z" fill="#E8B86D"/></svg>`,
  `<svg viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path d="M20 33C10 26 4 21 4 14.5 4 9 8 6 12.5 6c3 0 5.5 1.5 7.5 4 2-2.5 4.5-4 7.5-4C32 6 36 9 36 14.5 36 21 30 26 20 33Z" fill="#F4B6C2"/></svg>`,
  `<svg viewBox="0 0 60 22" aria-hidden="true" focusable="false"><rect width="60" height="22" rx="3" fill="#FFD3B6" opacity=".9"/><g stroke="#FFF6EC" stroke-width="4" opacity=".75"><path d="M10 0v22M22 0v22M34 0v22M46 0v22"/></g></svg>`,
  `<svg viewBox="0 0 44 34" aria-hidden="true" focusable="false"><path d="M2 6 8 3l7 2 7-3 8 2 8-2 4 5-2 7 3 6-4 7-6-3-7 4-8-3-7 3-6-4-2-7 3-5Z" fill="#FFF1DF" stroke="#E7CDB5" stroke-width="1"/></svg>`,
];

const KECEPATAN_LAPIS = [0.1, 0.22, 0.36]; // < 1: lebih lambat dari konten
const STIKER_PER_LAPIS = 5;
const lapisanDekor = [];
let tinggiLayarDekor = innerHeight;
let rafDekor = 0;

// Tiap stiker diduplikasi di bawahnya (top + 50%) agar lapisan setinggi 200% bisa looping mulus.
function pasangDekorasi() {
  if (mqGerakMinimal.matches) return;

  const dekor = document.createElement("div");
  dekor.className = "dekor";
  dekor.setAttribute("aria-hidden", "true");

  for (const kecepatan of KECEPATAN_LAPIS) {
    const lapis = document.createElement("div");
    lapis.className = "dekor__lapis";
    lapis.dataset.kecepatan = kecepatan;
    let isi = "";
    for (let i = 0; i < STIKER_PER_LAPIS; i++) {
      const bentuk = BENTUK_STIKER[(Math.random() * BENTUK_STIKER.length) | 0];
      // Hanya di sisi kiri/kanan agar teks di tengah tidak tertutup.
      const kiri = (Math.random() < 0.5 ? acak(1, 13) : acak(82, 93)).toFixed(1);
      const atas = acak(0, 50);
      const ukuran = Math.round(acak(28, 58));
      const gaya = `left:${kiri}%;width:${ukuran}px;--rot:${Math.round(acak(-28, 28))}deg;--amp:${Math.round(acak(5, 12))}px;--dur:${acak(5, 9).toFixed(1)}s;--delay:${(-acak(0, 6)).toFixed(1)}s`;
      isi += `<div class="dekor__stiker" style="${gaya};top:${atas.toFixed(2)}%">${bentuk}</div>`;
      isi += `<div class="dekor__stiker" style="${gaya};top:${(atas + 50).toFixed(2)}%">${bentuk}</div>`;
    }
    lapis.innerHTML = isi; // hanya string SVG statis di atas, bukan masukan pengguna
    dekor.appendChild(lapis);
    lapisanDekor.push(lapis);
  }

  document.body.prepend(dekor);
  addEventListener("scroll", mintaParallax, { passive: true });
  addEventListener("resize", () => {
    tinggiLayarDekor = innerHeight;
    mintaParallax();
  });
  mintaParallax();
}

// Geser tiap lapisan sesuai kecepatannya; modulo tinggi layar membuat loop mulus.
function perbaruiParallax() {
  rafDekor = 0;
  for (const lapis of lapisanDekor) {
    const kecepatan = Number(lapis.dataset.kecepatan);
    const y = -((scrollY * kecepatan) % tinggiLayarDekor);
    lapis.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
  }
}

function mintaParallax() {
  if (!rafDekor) rafDekor = requestAnimationFrame(perbaruiParallax);
}

pasangDekorasi();

// --- Reveal section saat masuk layar (fade + slide) ---
if (!mqGerakMinimal.matches) {
  const pemantauBagian = new IntersectionObserver((entri, pengamat) => {
    for (const e of entri) {
      if (!e.isIntersecting) continue;
      e.target.classList.add("bagian--tampil");
      pengamat.unobserve(e.target);
    }
  }, { threshold: 0.1 });
  document.querySelectorAll(".bagian").forEach((el) => pemantauBagian.observe(el));
}
