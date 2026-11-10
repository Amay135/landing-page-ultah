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
let timerPotongPisau = 0;
let timerPotongKartu = 0;

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

  timerPotongPisau = setTimeout(() => {
    potonganKue.classList.add("kue__potongan--tampil");
    sedangPotong = false;
  }, jedaPisau);

  timerPotongKartu = setTimeout(() => {
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

// --- Kartu alasan (F8) ---
const alasanDaftar = document.getElementById("alasanDaftar");
const HATI_SVG = "<svg class=\"alasan__hati\" viewBox=\"0 0 24 24\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M12 21C5.5 16.5 2 13.2 2 9.3 2 6.1 4.4 4 7 4c2 0 3.7 1.1 5 3.2C13.3 5.1 15 4 17 4c2.6 0 5 2.1 5 5.3 0 3.9-3.5 7.2-10 11.7Z\" fill=\"currentColor\"/></svg>";

DATA.alasan.forEach((alasan, i) => {
  const nomor = i + 1;
  const idTeks = "alasanTeks" + nomor;

  const item = document.createElement("li");
  item.className = "alasan__item";

  // <button> sudah menangani Enter dan Space sendiri.
  const tombol = document.createElement("button");
  tombol.type = "button";
  tombol.className = "alasan__kartu";
  tombol.setAttribute("aria-expanded", "false");
  tombol.setAttribute("aria-controls", idTeks);
  tombol.setAttribute("aria-describedby", idTeks);
  tombol.setAttribute("aria-label", "Buka alasan nomor " + nomor);

  const isi = document.createElement("span");
  isi.className = "alasan__isi";

  // Depan: nomor dan hati, dekoratif untuk pembaca layar.
  const depan = document.createElement("span");
  depan.className = "alasan__depan";
  depan.setAttribute("aria-hidden", "true");
  const labelNomor = document.createElement("span");
  labelNomor.className = "alasan__nomor";
  labelNomor.textContent = String(nomor).padStart(2, "0");
  depan.append(labelNomor);
  depan.insertAdjacentHTML("beforeend", HATI_SVG); // SVG statis, bukan masukan pengguna

  // Belakang: alasan dari data.js, aman lewat textContent.
  const belakang = document.createElement("span");
  belakang.className = "alasan__belakang";
  belakang.id = idTeks;
  belakang.setAttribute("aria-hidden", "true");
  const teksAlasan = document.createElement("span");
  teksAlasan.className = "alasan__teks";
  teksAlasan.textContent = alasan;
  belakang.append(teksAlasan);

  isi.append(depan, belakang);
  tombol.append(isi);

  tombol.addEventListener("click", () => {
    const terbuka = tombol.getAttribute("aria-expanded") === "true";
    tombol.setAttribute("aria-expanded", String(!terbuka));
    tombol.setAttribute("aria-label", (terbuka ? "Buka" : "Tutup") + " alasan nomor " + nomor);
    belakang.toggleAttribute("aria-hidden", terbuka);
    if (terbuka) return; // kartu ditutup lagi
    item.classList.add("alasan__item--dibuka");
    if (!mqGerakMinimal.matches) lepasHati(tombol);
  });

  item.append(tombol);
  alasanDaftar.append(item);
});

// Hati kecil terbang keluar dari kartu saat dibuka. Jumlahnya kecil dan dibuang
// setelah animasi selesai agar tidak menumpuk.
function lepasHati(kartu) {
  for (let i = 0; i < 6; i++) {
    const hati = document.createElement("span");
    hati.className = "alasan__hati-terbang";
    hati.textContent = "♥";
    hati.setAttribute("aria-hidden", "true");
    hati.style.setProperty("--x", acak(-46, 46).toFixed(0) + "px");
    hati.style.setProperty("--y", acak(-100, -55).toFixed(0) + "px");
    hati.style.setProperty("--rot", acak(-40, 40).toFixed(0) + "deg");
    hati.style.setProperty("--dur", acak(0.7, 1.1).toFixed(2) + "s");
    hati.addEventListener("animationend", () => hati.remove(), { once: true });
    kartu.append(hati);
  }
}

// --- Surat cinta (F9) ---
const amplop = document.getElementById("amplop");
const suratModal = document.getElementById("suratModal");
const suratKertas = document.getElementById("suratKertas");
const suratIsi = document.getElementById("suratIsi");
const suratKursor = document.getElementById("suratKursor");
const suratLewati = document.getElementById("suratLewati");
const suratTutup = document.getElementById("suratTutup");

amplop.setAttribute("aria-label", DATA.suratAriaBuka);
suratLewati.textContent = DATA.suratLabelLewati;
suratTutup.textContent = DATA.suratLabelTutup;

// Salam, paragraf, penutup, dan tanda tangan dipisah baris kosong.
const teksSuratLengkap = [DATA.salamSurat, DATA.teksSurat, DATA.penutupSurat, DATA.tandaTangan]
  .filter(Boolean)
  .join("\n\n");

let timerSurat = 0;
let jedaBukaSurat = 0;

function hentikanKetikSurat() {
  clearInterval(timerSurat);
  timerSurat = 0;
}

// Tampilkan semua teks seketika (tombol Lewati atau selesai mengetik).
function tampilkanSuratLengkap() {
  hentikanKetikSurat();
  suratIsi.textContent = teksSuratLengkap;
  suratKursor.hidden = true;
  suratLewati.hidden = true;
}

// Ketik dari awal; timer lama dibatalkan dulu agar teks tidak dobel.
function mulaiKetikSurat() {
  hentikanKetikSurat();
  suratIsi.textContent = "";
  if (mqGerakMinimal.matches) {
    tampilkanSuratLengkap();
    return;
  }
  suratKursor.hidden = false;
  suratLewati.hidden = false;
  let i = 0;
  timerSurat = setInterval(() => {
    i += 1;
    suratIsi.textContent = teksSuratLengkap.slice(0, i);
    if (i >= teksSuratLengkap.length) tampilkanSuratLengkap();
  }, DATA.suratKecepatanMs);
}

// Klik amplop: tutup terlipat dulu, lalu modal surat muncul dan mengetik.
amplop.addEventListener("click", () => {
  if (jedaBukaSurat) return; // klik ganda saat amplop sedang membuka
  amplop.classList.add("surat--buka");
  jedaBukaSurat = setTimeout(() => {
    jedaBukaSurat = 0;
    suratModal.showModal();
    suratKertas.scrollTop = 0;
    suratKertas.focus({ preventScroll: true }); // hindari fokus otomatis ke "Lewati"
    document.body.classList.add("surat-terbuka");
    mulaiKetikSurat();
  }, mqGerakMinimal.matches ? 0 : 480);
});

suratLewati.addEventListener("click", tampilkanSuratLengkap);
suratTutup.addEventListener("click", () => suratModal.close());

// Esc menutup dialog; timer ketik ikut dihentikan di sini (tidak bocor saat dibuka lagi).
suratModal.addEventListener("close", () => {
  clearTimeout(jedaBukaSurat);
  jedaBukaSurat = 0;
  hentikanKetikSurat();
  document.body.classList.remove("surat-terbuka");
  amplop.classList.remove("surat--buka");
});

// Klik di luar kertas (backdrop) menutup.
suratModal.addEventListener("click", (e) => {
  if (e.target === suratModal) suratModal.close();
});

// --- Lampion harapan (F10) ---
const lampion = document.getElementById("lampion");
const lampionJudul = document.getElementById("lampionJudul");
const lampionKet = document.getElementById("lampionKet");
const lampionBesar = document.getElementById("lampionBesar");
const teksLampion = document.getElementById("lampionTeks");
const lampionTerbang = document.getElementById("lampionTerbang");
const lampionLain = document.getElementById("lampionLain");
const lampionKecilDaftar = document.getElementById("lampionKecilDaftar");
const lampionModal = document.getElementById("lampionModal");
const formLampion = document.getElementById("formLampion");
const harapanInput = document.getElementById("harapanInput");
const harapanHitung = document.getElementById("harapanHitung");
const pesanLampion = document.getElementById("pesanLampion");
const lampionLepas = document.getElementById("lampionLepas");
const lampionTutup = document.getElementById("lampionTutup");
const lampionModalIsi = document.getElementById("lampionModalIsi");
const panggungLampion = lampion.querySelector(".lampion__panggung");

const BATAS_HARAPAN = 120;
const DURASI_TERBANG = mqGerakMinimal.matches ? 0 : 4200;

lampionJudul.textContent = DATA.judulLampion;
lampionKet.textContent = DATA.lampionKeterangan;
lampionBesar.setAttribute("aria-label", DATA.lampionKeterangan);
lampionLain.textContent = DATA.lampionLabelLain;
lampionLepas.textContent = DATA.lampionLabelLepas;
lampionTutup.textContent = DATA.lampionLabelTutup;
lampionModal.setAttribute("aria-label", DATA.judulLampion);
harapanInput.placeholder = DATA.lampionPlaceholder;
harapanInput.setAttribute("aria-label", DATA.lampionPlaceholder);
harapanInput.maxLength = BATAS_HARAPAN;

// Lampion kecil (harapan dari data.js): SVG statis, teks tetap lewat textContent.
const SVG_LAMPION_KECIL =
  '<svg viewBox="0 0 60 84" aria-hidden="true" focusable="false">' +
  '<ellipse cx="30" cy="36" rx="22" ry="24" fill="#F6B26B"/>' +
  '<rect x="20" y="10" width="20" height="5" rx="2.5" fill="#B9793F"/>' +
  '<rect x="20" y="58" width="20" height="5" rx="2.5" fill="#B9793F"/>' +
  '<path d="M30 63v8" stroke="#B9793F" stroke-width="2"/>' +
  '<rect x="26" y="71" width="8" height="6" rx="2" fill="#E8B86D"/>' +
  '<path d="M30 22c-6 8-6 20 0 28" fill="none" stroke="#FFF3D6" stroke-width="2" opacity=".5"/>' +
  "</svg>";

DATA.harapan.forEach((isiHarapan) => {
  const item = document.createElement("li");
  const tombol = document.createElement("button");
  tombol.type = "button";
  tombol.className = "lampion__kecil";
  tombol.setAttribute("aria-label", "Baca harapan: " + isiHarapan);
  tombol.innerHTML = SVG_LAMPION_KECIL; // hanya SVG statis di atas
  tombol.addEventListener("click", () => bukaBacaHarapan(isiHarapan));
  item.append(tombol);
  lampionKecilDaftar.append(item);
});
lampionKecilDaftar.hidden = !DATA.harapan.length;

function perbaruiHitungHarapan() {
  harapanHitung.textContent = harapanInput.value.length + "/" + BATAS_HARAPAN;
}
harapanInput.addEventListener("input", perbaruiHitungHarapan);

// Mode tulis: form tampil, teks bacaan disembunyikan.
function bukaTulisHarapan() {
  lampionModalIsi.hidden = true;
  formLampion.hidden = false;
  harapanInput.value = "";
  pesanLampion.textContent = "";
  perbaruiHitungHarapan();
  lampionModal.showModal();
  document.body.classList.add("lampion-terbuka");
  harapanInput.focus({ preventScroll: true });
}

// Mode baca: harapan dari data.js tampil aman lewat textContent.
function bukaBacaHarapan(isiHarapan) {
  formLampion.hidden = true;
  lampionModalIsi.hidden = false;
  lampionModalIsi.textContent = isiHarapan;
  if (!lampionModal.open) lampionModal.showModal();
  document.body.classList.add("lampion-terbuka");
  lampionTutup.focus({ preventScroll: true });
}

lampionBesar.addEventListener("click", bukaTulisHarapan);
lampionLain.addEventListener("click", bukaTulisHarapan);
lampionTutup.addEventListener("click", () => lampionModal.close());
lampionModal.addEventListener("close", () => document.body.classList.remove("lampion-terbuka"));

// Klik di luar kertas (backdrop) menutup.
lampionModal.addEventListener("click", (e) => {
  if (e.target === lampionModal) lampionModal.close();
});

formLampion.addEventListener("submit", (e) => {
  e.preventDefault();
  const harapan = harapanInput.value.trim().slice(0, BATAS_HARAPAN);
  if (!harapan) {
    pesanLampion.textContent = DATA.lampionPesanKosong;
    harapanInput.focus({ preventScroll: true });
    return;
  }
  lampionModal.close();
  lepasLampion(harapan);
});

let sedangTerbang = false;
let timerTerbang = 0;

// Lampion naik pelan; setelah selesai lampion baru muncul dari bawah.
function lepasLampion(harapan) {
  if (sedangTerbang) return;
  sedangTerbang = true;
  lampionBesar.disabled = true;
  lampionLain.hidden = true;
  lampionTerbang.textContent = "";
  lampionTerbang.classList.remove("lampion__terbang--tampil");
  teksLampion.textContent = harapan; // aman: bukan innerHTML

  if (mqGerakMinimal.matches) {
    selesaiTerbang();
    return;
  }

  lampionBesar.classList.remove("lampion__besar--baru");
  void lampionBesar.offsetWidth;
  lampionBesar.classList.add("lampion__besar--terbang");
  mulaiJejakEmas();
  taburLampionKecil();
  timerTerbang = setTimeout(selesaiTerbang, DURASI_TERBANG);
}

function selesaiTerbang() {
  timerTerbang = 0;
  sedangTerbang = false;
  lampionBesar.classList.remove("lampion__besar--terbang");
  lampionBesar.disabled = false;
  teksLampion.textContent = "";
  lampionTerbang.textContent = DATA.lampionTerbangTeks;
  lampionTerbang.classList.add("lampion__terbang--tampil");
  lampionLain.hidden = false;
  if (!mqGerakMinimal.matches) {
    void lampionBesar.offsetWidth;
    lampionBesar.classList.add("lampion__besar--baru");
    setTimeout(() => lampionBesar.classList.remove("lampion__besar--baru"), 1100);
  }
  lampionLain.focus({ preventScroll: true });
}

// Jejak percikan emas mengikuti lampion selama terbang. Jumlahnya kecil
// dan tiap percik dibuang setelah animasinya selesai.
let timerJejak = 0;

function mulaiJejakEmas() {
  clearInterval(timerJejak);
  const mulai = performance.now();
  timerJejak = setInterval(() => {
    const kotak = lampionBesar.getBoundingClientRect();
    const induk = panggungLampion.getBoundingClientRect();
    for (let i = 0; i < 2; i++) {
      const percik = document.createElement("span");
      percik.className = "lampion__jejak";
      percik.style.left = (kotak.left - induk.left + kotak.width / 2 + acak(-kotak.width * 0.24, kotak.width * 0.24)).toFixed(1) + "px";
      percik.style.top = (kotak.top - induk.top + kotak.height * 0.78).toFixed(1) + "px";
      percik.style.setProperty("--dx", acak(-14, 14).toFixed(0) + "px");
      percik.addEventListener("animationend", () => percik.remove(), { once: true });
      panggungLampion.append(percik);
    }
    if (performance.now() - mulai >= DURASI_TERBANG) clearInterval(timerJejak);
  }, 130);
}

// Lampion kecil dan bintang bermunculan di sekitar lampion yang terbang.
function taburLampionKecil() {
  for (let i = 0; i < 8; i++) {
    const el = document.createElement("span");
    el.className = "lampion__lahir" + (i % 3 === 0 ? " lampion__lahir--bintang" : "");
    el.style.left = acak(10, 90).toFixed(1) + "%";
    el.style.top = acak(22, 78).toFixed(1) + "%";
    el.style.setProperty("--dx", acak(-34, 34).toFixed(0) + "px");
    el.style.setProperty("--dy", acak(-130, -50).toFixed(0) + "px");
    el.style.setProperty("--dur", acak(1.4, 2.6).toFixed(2) + "s");
    el.addEventListener("animationend", () => el.remove(), { once: true });
    panggungLampion.append(el);
  }
}

// --- Hadiah penutup (F11) ---
const kado = document.getElementById("kado");
const hadiahJudul = document.getElementById("hadiahJudul");
const hadiahKet = document.getElementById("hadiahKet");
const hadiahIsi = document.getElementById("hadiahIsi");
const hadiahTiket = document.getElementById("hadiahTiket");
const hadiahJenis = document.getElementById("hadiahJenis");
const hadiahTeks = document.getElementById("hadiahTeks");
const hadiahBerlaku = document.getElementById("hadiahBerlaku");
const hadiahMedia = document.getElementById("hadiahMedia");
const mainkanLagi = document.getElementById("mainkanLagi");

const isiHadiah = DATA.isiHadiah || {};

hadiahJudul.textContent = DATA.hadiahJudul;
hadiahJudul.hidden = !DATA.hadiahJudul;
hadiahKet.textContent = DATA.hadiahKet;
hadiahKet.hidden = !DATA.hadiahKet;
kado.setAttribute("aria-label", DATA.hadiahAriaBuka);
mainkanLagi.textContent = DATA.hadiahLabelMainLagi;

// Isi tiket: baris kosong disembunyikan, teks tetap aman lewat textContent.
hadiahJenis.textContent = isiHadiah.jenis || "";
hadiahJenis.hidden = !isiHadiah.jenis;
hadiahTeks.textContent = isiHadiah.teks || "";
hadiahTeks.hidden = !isiHadiah.teks;
hadiahBerlaku.textContent = isiHadiah.berlaku
  ? [DATA.hadiahBerlakuLabel, isiHadiah.berlaku].filter(Boolean).join(" ")
  : "";
hadiahBerlaku.hidden = !isiHadiah.berlaku;
hadiahTiket.hidden = !(isiHadiah.jenis || isiHadiah.teks || isiHadiah.berlaku);

// Media hadiah: gambar lazy-load, atau video dengan kontrol (tanpa autoplay).
if (isiHadiah.media) {
  if (/\.(mp4|webm|ogv|mov)(\?|#|$)/i.test(isiHadiah.media)) {
    const video = document.createElement("video");
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.src = isiHadiah.media;
    hadiahMedia.append(video);
  } else {
    const img = document.createElement("img");
    img.alt = isiHadiah.jenis || "Hadiah";
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", () => { img.src = srcPlaceholder(0); }, { once: true });
    img.src = isiHadiah.media;
    hadiahMedia.append(img);
  }
} else {
  hadiahMedia.hidden = true;
}

let kadoTerbuka = false;

// Klik kado: tutup terbuka, confetti besar, lalu isi muncul dari dalam kado.
kado.addEventListener("click", () => {
  if (kadoTerbuka) return;
  kadoTerbuka = true;
  kado.classList.add("hadiah__kado--buka");
  kado.setAttribute("aria-expanded", "true");

  const kotak = kado.getBoundingClientRect();
  burst(kotak.left + kotak.width / 2, kotak.top + kotak.height / 2, 240);

  setTimeout(() => {
    hadiahIsi.hidden = false;
    hadiahIsi.classList.add("hadiah__isi--tampil");
    mainkanLagi.hidden = false;
    hadiahIsi.scrollIntoView({
      behavior: mqGerakMinimal.matches ? "auto" : "smooth",
      block: "center",
    });
  }, mqGerakMinimal.matches ? 0 : 650);
});

// Kembalikan kue, kartu alasan, surat, dan lampion ke keadaan awal.
function resetKado() {
  kadoTerbuka = false;
  kado.classList.remove("hadiah__kado--buka");
  kado.setAttribute("aria-expanded", "false");
  hadiahIsi.hidden = true;
  hadiahIsi.classList.remove("hadiah__isi--tampil");
  mainkanLagi.hidden = true;
  hadiahMedia.querySelectorAll("video").forEach((video) => video.pause());
}

function resetKue() {
  clearTimeout(timerPotongPisau);
  clearTimeout(timerPotongKartu);
  lilinPadam = false;
  sedangPotong = false;
  jumlahPenerima = 0;
  kue.classList.remove("kue--padam", "kue--potong");
  kueSvg.setAttribute("aria-label", DATA.kueAria);
  tombolTiup.hidden = false;
  tombolPotong.hidden = true;
  tombolPotongLagi.hidden = true;
  harapanKue.textContent = "";
  harapanKue.classList.remove("kue__harapan--tampil");
  kartuPotongan.hidden = true;
  piringKue.hidden = true;
  potonganKue.hidden = true;
  potonganKue.classList.remove("kue__potongan--tampil", "kue__potongan--piring");
  penerimaTeks.textContent = "";
  penerimaLucu.textContent = "";
  pesanPenerima.textContent = "";
  namaPenerima.value = "";
  daftarPenerima.textContent = "";
  daftarPenerima.hidden = true;
}

function resetAlasan() {
  alasanDaftar.querySelectorAll(".alasan__item").forEach((item, i) => {
    const nomor = i + 1;
    const tombol = item.querySelector(".alasan__kartu");
    const belakang = item.querySelector(".alasan__belakang");
    item.classList.remove("alasan__item--dibuka");
    tombol.setAttribute("aria-expanded", "false");
    tombol.setAttribute("aria-label", "Buka alasan nomor " + nomor);
    belakang.setAttribute("aria-hidden", "true");
  });
}

function resetSurat() {
  if (suratModal.open) suratModal.close(); // handler close ikut menghentikan efek ketik
  clearTimeout(jedaBukaSurat);
  jedaBukaSurat = 0;
  hentikanKetikSurat();
  amplop.classList.remove("surat--buka");
  suratIsi.textContent = "";
  suratKursor.hidden = true;
  suratLewati.hidden = false;
  suratKertas.scrollTop = 0;
}

function resetLampion() {
  clearTimeout(timerTerbang);
  clearInterval(timerJejak);
  timerTerbang = 0;
  sedangTerbang = false;
  if (lampionModal.open) lampionModal.close();
  lampionBesar.classList.remove("lampion__besar--terbang", "lampion__besar--baru");
  lampionBesar.disabled = false;
  teksLampion.textContent = "";
  lampionTerbang.textContent = "";
  lampionTerbang.classList.remove("lampion__terbang--tampil");
  lampionLain.hidden = true;
  panggungLampion.querySelectorAll(".lampion__jejak, .lampion__lahir").forEach((el) => el.remove());
}

mainkanLagi.addEventListener("click", () => {
  resetKado();
  resetKue();
  resetAlasan();
  resetSurat();
  resetLampion();
  scrollTo({ top: 0, behavior: mqGerakMinimal.matches ? "auto" : "smooth" });
});

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

// --- Sparkle saat tap/klik (F14) ---
// Satu lapisan fixed dengan pointer-events: none; tiap partikel dibuang setelah animasinya.
// Maks 30 elemen aktif sekaligus agar tetap ringan di HP.
const lapisanSparkle = document.getElementById("sparkle");
const BATAS_SPARKLE = 30;
const WARNA_SPARKLE = ["#E8B86D", "#F4B6C2"];

document.addEventListener("pointerup", (e) => {
  if (mqGerakMinimal.matches) return;
  if (e.pointerType === "mouse" && e.button !== 0) return; // klik kiri saja

  // <dialog> modal ada di top layer: pindahkan lapisan sparkle ke dalamnya agar tetap terlihat.
  const dialogTerbuka = document.querySelector("dialog[open]");
  const indukSparkle = dialogTerbuka || document.body;
  if (lapisanSparkle.parentElement !== indukSparkle) indukSparkle.append(lapisanSparkle);

  const sisa = BATAS_SPARKLE - lapisanSparkle.childElementCount;
  if (sisa <= 0) return;
  const jumlah = Math.min(Math.floor(acak(8, 13)), sisa);
  for (let i = 0; i < jumlah; i++) {
    const partikel = document.createElement("span");
    partikel.className = "sparkle__partikel sparkle__partikel--" + (Math.random() < 0.4 ? "bintang" : "titik");
    partikel.style.left = e.clientX + "px";
    partikel.style.top = e.clientY + "px";
    partikel.style.setProperty("--dx", acak(-34, 34).toFixed(0) + "px");
    partikel.style.setProperty("--dy", acak(18, 54).toFixed(0) + "px");
    partikel.style.setProperty("--rot", acak(-160, 160).toFixed(0) + "deg");
    partikel.style.setProperty("--dur", acak(0.8, 1.1).toFixed(2) + "s");
    partikel.style.setProperty("--ukuran", acak(4, 10).toFixed(1) + "px");
    partikel.style.setProperty("--warna", WARNA_SPARKLE[i % 2]);
    partikel.addEventListener("animationend", () => partikel.remove(), { once: true });
    lapisanSparkle.append(partikel);
  }
}, { passive: true });

// --- Interaksi lucu (F15) ---
const heroRahasia = document.getElementById("heroRahasia");
let klikJudul = 0;

// Klik judul hero ke-5: pesan rahasia dari data.js tampil.
heroJudul.addEventListener("click", () => {
  if (!heroRahasia.hidden) return; // sudah tampil
  klikJudul += 1;
  if (klikJudul < 5) return;
  heroRahasia.textContent = DATA.pesanRahasia;
  heroRahasia.hidden = false;
  void heroRahasia.offsetWidth;
  heroRahasia.classList.add("hero__rahasia--tampil");
});

// Maskot melambai sekali tiap klik.
const maskot = document.getElementById("maskot");
maskot.addEventListener("click", () => {
  maskot.classList.remove("maskot--lambai");
  void maskot.offsetWidth; // ulang animasi walau diklik beruntun
  maskot.classList.add("maskot--lambai");
});
maskot.addEventListener("animationend", () => maskot.classList.remove("maskot--lambai"));

// --- Footer: tombol pelukan WhatsApp (F12) ---
const footer = document.getElementById("footer");
const waBar = document.getElementById("waBar");
const waTombol = document.getElementById("waTombol");
const footerTeks = document.getElementById("footerTeks");

waTombol.textContent = DATA.waTombol;
waTombol.href = "https://wa.me/" + DATA.nomorWA + "?text=" + encodeURIComponent(DATA.pesanWA);
footerTeks.textContent = DATA.footerTeks;
footerTeks.hidden = !DATA.footerTeks;

// Peringatan di console selama data WhatsApp masih contoh.
if (/\[CONTOH\]/.test(DATA.nomorWA + DATA.pesanWA)) {
  console.warn("F12: nomorWA/pesanWA di data.js masih [CONTOH]. Ganti sebelum dibagikan.");
}

// Bar hanya tampil saat pengguna mencapai dasar halaman.
new IntersectionObserver(([entri]) => {
  waBar.hidden = !entri.isIntersecting;
}, { threshold: 0.15 }).observe(footer);
