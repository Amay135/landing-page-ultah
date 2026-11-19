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

// Latar di belakang gate tidak bisa difokus atau diklik selama gate terbuka.
const latarTerkunci = ["main", "footer", "#maskot"].map((s) => document.querySelector(s));
function kunciLatar(terkunci) {
  for (const el of latarTerkunci) el.toggleAttribute("inert", terkunci);
}
kunciLatar(true);

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
  if (gate.classList.contains("gate--pergi")) return; // cegah submit ganda saat transisi
  kunciLatar(false);
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
const templatePotongan = document.getElementById("kue-potongan");
const wadahPotongan = document.getElementById("kue-potongan-wadah");
const remahKue = kueSvg.querySelector(".kue__remah");
const penerimaTeks = document.getElementById("kuePenerimaTeks");
const penerimaLucu = document.getElementById("kueLucu");
const daftarPenerima = document.getElementById("kuePenerimaDaftar");

tombolTiup.textContent = DATA.kueLabelTiup;
tombolPotong.textContent = DATA.kueLabelPotong;
tombolKasih.textContent = DATA.kueLabelKasih;
tombolPotongLagi.textContent = DATA.kueLabelPotongLagi;
daftarPenerima.setAttribute("aria-label", DATA.kueDaftarAria);
kueSvg.setAttribute("aria-label", DATA.kueAria);

// Tulisan di tingkat tengah: muat di bagian kue yang tersisa sampai potongan terakhir.
let lebarTeksMaks = 115; // menyusut bersama tingkat tengah
function aturTeksKue() {
  let ukuran = 20;
  kueTeks.textContent = DATA.kueTulisan;
  kueTeks.setAttribute("font-size", ukuran);
  while (ukuran > 6 && kueTeks.getComputedTextLength() > lebarTeksMaks) {
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

// --- Kue (F4B): potong berkali-kali, beri potongan, daftar penerima ---
// Tiap potongan memangkas 14 unit. Kue boleh terus dipotong selama tingkat atas
// masih cukup lebar untuk tiga lilin yang ikut mengecil; tidak ada angka tetap.
const LEBAR_POTONGAN = 14;
const TEPI_KANAN_KUE = 335;
const TEPI_TINGKAT = [335, 302, 269]; // tepi kanan tingkat bawah, tengah, atas
const TEPI_ATAS_KIRI = 121;
const LEBAR_ATAS_MIN = 46; // ruang minimum tingkat atas untuk tiga lilin
const jedaPisau = mqGerakMinimal.matches ? 0 : 1050;
const jedaKartu = mqGerakMinimal.matches ? 0 : 1300;
const durasiSajian = mqGerakMinimal.matches ? 0 : 1200;

// Tiap potongan mendapat piring sendiri di lingkaran sekeliling pusat kue.
// Slot dilangkahi 5 dari 12 agar piring tetap menyebar rata di jumlah berapa pun.
const PIRING = { pusatX: 195, pusatY: 285, radius: 252, slot: 12 };
function posisiPiring(i) {
  const slot = (i * 5) % PIRING.slot;
  const sudut = ((45 + slot * (360 / PIRING.slot)) * Math.PI) / 180;
  return {
    x: PIRING.pusatX + PIRING.radius * Math.cos(sudut),
    y: PIRING.pusatY + PIRING.radius * Math.sin(sudut),
  };
}

const garisPotong = document.getElementById("kue-garis-potong");
const sisaKueNotch = document.getElementById("kueSisaNotch");
const lilinKue = document.getElementById("kue-lilin");
const kueGeser = document.getElementById("kue-geser");
const bekasKue = [
  document.getElementById("kue-bekas-bawah"),
  document.getElementById("kue-bekas-tengah"),
  document.getElementById("kue-bekas-atas"),
];
const kueHabis = document.getElementById("kueHabis");

const daftarPotongan = []; // semua potongan tersimpan, tidak ada yang ditimpa
let idPotongan = 0;
let sedangPotong = false;
let sedangMenyajikan = false;
let potonganSiap = null; // potongan yang sedang menunggu nama penerima
let timerPotongPisau = 0;
let timerPotongKartu = 0;
let timerSajian = 0;

// Sisi kanan kue yang tersisa setelah n potongan (400 = belum dipotong).
function batasPotongan(n) {
  return n === 0 ? 400 : TEPI_KANAN_KUE - n * LEBAR_POTONGAN;
}

// Geser kue setengah dari bagian yang dipangkas supaya tetap di tengah alas.
function geometriPotongan(n) {
  const batas = batasPotongan(n);
  const kanan = Math.min(TEPI_KANAN_KUE, batas);
  const geser = n === 0 ? 0 : (TEPI_KANAN_KUE - kanan) / 2;
  return { batas, kanan, geser, tepi: n === 0 ? 400 : kanan + geser };
}

// Berhenti saat tingkat atas tidak lagi cukup menampung tiga lilin.
function bisaPotongLagi() {
  const { batas } = geometriPotongan(daftarPotongan.length + 1);
  return Math.min(TEPI_TINGKAT[2], batas) - TEPI_ATAS_KIRI >= LEBAR_ATAS_MIN;
}

// Mask menyusutkan kue; lilin dan tulisan ikut menyesuaikan ruang yang tersisa.
function terapkanSisaKue(n) {
  const { batas, geser, tepi } = geometriPotongan(n);
  const kananAtas = Math.min(TEPI_TINGKAT[2], batas);
  const lebarAtas = Math.max(0, kananAtas - TEPI_ATAS_KIRI);

  kueGeser.setAttribute("transform", `translate(${geser} 0)`);
  sisaKueNotch.setAttribute("x", tepi);
  sisaKueNotch.setAttribute("width", 400 - tepi);

  // Lilin selalu di tengah permukaan tingkat atas, lalu mengecil bersama kue.
  const skalaLilin = Math.min(1, (lebarAtas * 0.55) / 60);
  const pusatLilin = (TEPI_ATAS_KIRI + kananAtas) / 2 + geser;
  lilinKue.style.transform =
    `translate(${pusatLilin}px, 140px) scale(${skalaLilin}) translate(-195px, -140px)`;

  // Tulisan menyusut agar tetap muat di tingkat tengah yang tersisa.
  lebarTeksMaks = Math.max(30, Math.min(115, Math.min(302, batas) - 88 - 16));
  kueTeks.setAttribute("x", (88 + Math.min(302, batas)) / 2);
  aturTeksKue();

  bekasKue.forEach((bekas, i) => {
    const sisa = batas - TEPI_TINGKAT[i];
    if (n > 0 && sisa < 0) {
      bekas.setAttribute("transform", `translate(${sisa} 0)`);
      bekas.removeAttribute("hidden");
    } else {
      bekas.setAttribute("hidden", "");
    }
  });
}
terapkanSisaKue(0);

// Animasi pisau, satu potongan baru di tepi kue, lalu kartu nama penerima.
function mulaiPotong() {
  if (sedangPotong || sedangMenyajikan || potonganSiap) return;
  if (!bisaPotongLagi()) return;
  sedangPotong = true;
  const nomor = daftarPotongan.length + 1;
  const { tepi } = geometriPotongan(nomor);

  tombolPotong.hidden = true;
  tombolPotongLagi.hidden = true;
  kartuPotongan.hidden = true;
  kueHabis.textContent = "";
  penerimaTeks.textContent = "";
  penerimaLucu.textContent = "";
  pesanPenerima.textContent = "";
  namaPenerima.value = "";
  labelPenerima.textContent = nomor === 1 ? DATA.kueTanyaPenerima : DATA.kueTanyaPenerimaLagi;

  // Posisi pisau mengikuti tepi kue yang sedang dipotong.
  kue.style.setProperty("--pisau-x", tepi + "px");
  garisPotong.setAttribute("x1", tepi);
  garisPotong.setAttribute("x2", tepi);

  // Salin cetakan: tiap potongan jadi elemen unik dengan piring sendiri.
  // Grup luar ditempatkan di slot radial; irisan mulai dari tepi potongan.
  const irisan = templatePotongan.cloneNode(true);
  irisan.removeAttribute("id");
  irisan.removeAttribute("hidden");
  irisan.dataset.id = String(++idPotongan);
  const tumpuk = daftarPotongan.length;
  const piring = posisiPiring(tumpuk);
  const dariX = tepi + 22 - piring.x;
  const dariY = 349 - piring.y; // pusat irisan di tepi potongan dulu
  irisan.setAttribute("transform", `translate(${piring.x.toFixed(1)} ${piring.y.toFixed(1)})`);
  irisan.style.setProperty("--dari-x", dariX.toFixed(1) + "px");
  irisan.style.setProperty("--dari-y", dariY.toFixed(1) + "px");
  irisan.style.setProperty("--angkat-x", (dariX * 0.92).toFixed(1) + "px");
  irisan.style.setProperty("--angkat-y", (dariY - 34).toFixed(1) + "px");
  irisan.style.setProperty("--tengah-x", (dariX * 0.42).toFixed(1) + "px");
  irisan.style.setProperty("--tengah-y", (dariY * 0.42 - 46).toFixed(1) + "px");
  wadahPotongan.appendChild(irisan);
  const potongan = { id: idPotongan, elemen: irisan, nama: "", piring };
  daftarPotongan.push(potongan);

  // Ulang animasi pisau dan serpihan dari awal.
  kue.classList.remove("kue--mendarat", "kue--potong");
  void kue.offsetWidth;
  kue.classList.add("kue--potong");

  timerPotongPisau = setTimeout(() => {
    terapkanSisaKue(nomor);
    irisan.classList.add("kue__potongan--tampil");
    // Pisau selesai memotong: ledakan kecil di atas kue.
    const kotakKue = kueSvg.getBoundingClientRect();
    burst(kotakKue.left + kotakKue.width / 2, kotakKue.top + kotakKue.height * 0.55, 50);
    potonganSiap = potongan;
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
  if (!potonganSiap || sedangMenyajikan) return;
  const nama = namaPenerima.value.trim().slice(0, 30);
  if (!nama) {
    pesanPenerima.textContent = DATA.kuePesanNamaKosong;
    namaPenerima.focus({ preventScroll: true });
    return;
  }
  pesanPenerima.textContent = "";
  const potongan = potonganSiap;
  potonganSiap = null;
  potongan.nama = nama;
  sedangMenyajikan = true;
  kartuPotongan.hidden = true;
  potongan.elemen.classList.add("kue__potongan--sajikan");

  // Setelah potongan mendarat: pesan, badge penerima, remah, confetti di piring.
  timerSajian = setTimeout(() => {
    // Bandingkan tanpa peduli huruf besar-kecil; tampil dengan textContent, tanpa HTML.
    const namaSaya = DATA.namaSaya.trim().toLowerCase();
    const cocok = namaSaya !== "" && nama.toLowerCase().includes(namaSaya);

    const pola = daftarPotongan.length === 1 ? DATA.kueTeksPenerima : DATA.kueTeksPenerimaLagi;
    penerimaTeks.textContent = pola.replace("{nama}", () => nama);
    penerimaLucu.textContent = cocok ? DATA.potonganLucuTeks : "";

    const badge = document.createElement("li");
    badge.className = "kue__badge";
    const hati = document.createElement("span");
    hati.className = "kue__badge-hati";
    hati.setAttribute("aria-hidden", "true");
    hati.textContent = "♥";
    const teksNama = document.createElement("span");
    teksNama.textContent = nama;
    badge.append(hati, teksNama);
    daftarPenerima.appendChild(badge);
    daftarPenerima.hidden = false;

    // Remah dan ledakan mengikuti piring milik potongan ini.
    remahKue.style.transform =
      `translate(${potongan.piring.x - 344}px, ${potongan.piring.y - 452}px)`;
    const kotakPiring = potongan.elemen.getBoundingClientRect();
    burst(kotakPiring.left + kotakPiring.width / 2, kotakPiring.top + kotakPiring.height / 2, 40);
    kue.classList.add("kue--mendarat");

    if (!bisaPotongLagi()) {
      kueHabis.textContent = DATA.kueHabisTeks;
    } else {
      tombolPotongLagi.hidden = false;
      tombolPotongLagi.focus({ preventScroll: true });
    }
    sedangMenyajikan = false;
  }, durasiSajian);
});

// --- Galeri foto polaroid (F5) ---
const galeriDaftar = document.getElementById("galeriDaftar");
const WARNA_PLACEHOLDER = ["#F4B6C2", "#FFD3B6", "#CDB4DB", "#E8B86D"];
const daftarGaleri = []; // entri lightbox: {src, caption, tanggal, img}

// Placeholder pastel polos bila file foto gagal dimuat (tanpa teks contoh).
function srcPlaceholder(i) {
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 320'>" +
    `<rect width='320' height='320' fill='${WARNA_PLACEHOLDER[i % WARNA_PLACEHOLDER.length]}'/>` +
    "<circle cx='160' cy='146' r='54' fill='#FFF6EC' opacity='.5'/>" +
    "<path d='M138 188q22 16 44 0' fill='none' stroke='#5A3E36' stroke-width='4' stroke-linecap='round' opacity='.45'/>" +
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

  // Teks alternatif tetap terisi walau caption kosong (aksesibilitas).
  const labelFoto = foto.caption || "Foto kenangan " + (i + 1);

  const bingkai = document.createElement("button");
  bingkai.type = "button";
  bingkai.className = "foto__bingkai foto-hidup";
  bingkai.style.setProperty("--rot-hidup", (Math.random() < 0.5 ? -3 : 3) + "deg");
  bingkai.setAttribute(
    "aria-label",
    "Buka foto: " + labelFoto + (foto.tanggal ? ", " + foto.tanggal : "")
  );

  const img = document.createElement("img");
  img.className = "foto__img";
  img.alt = labelFoto;
  img.loading = "lazy";
  img.decoding = "async";
  img.addEventListener("error", () => { img.src = srcPlaceholder(i); }, { once: true });
  img.src = foto.src;
  daftarGaleri.push({ ...foto, img });

  bingkai.addEventListener("click", () => bukaLightbox(daftarGaleri, i));
  bingkai.append(img);
  kartuFoto.append(bingkai);

  // Caption/tanggal kosong tidak dirender supaya tidak menyisakan ruang kosong.
  if (foto.caption || foto.tanggal) {
    const caption = document.createElement("figcaption");
    caption.className = "foto__caption";
    if (foto.caption) {
      const captionTeks = document.createElement("span");
      captionTeks.className = "foto__captionTeks";
      captionTeks.textContent = foto.caption;
      caption.append(captionTeks);
    }
    if (foto.tanggal) {
      const captionTanggal = document.createElement("span");
      captionTanggal.className = "foto__tanggal";
      captionTanggal.textContent = foto.tanggal;
      caption.append(captionTanggal);
    }
    kartuFoto.append(caption);
  }
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

let daftarLightbox = daftarGaleri;
let indeksLightbox = 0;

function isiLightbox() {
  const foto = daftarLightbox[indeksLightbox];
  const caption = foto.caption || "";
  const tanggal = foto.tanggal || "";
  lightboxImg.src = foto.img.currentSrc || foto.img.src;
  lightboxImg.alt = caption || "Foto kenangan " + (indeksLightbox + 1);
  lightboxTeks.textContent = caption;
  lightboxTanggal.textContent = tanggal;
  lightboxTeks.hidden = !caption;
  lightboxTanggal.hidden = !tanggal;
  lightboxTeks.parentElement.hidden = !caption && !tanggal;
  lightboxSebelum.hidden = lightboxSesudah.hidden = daftarLightbox.length < 2;
}

function bukaLightbox(daftar, i) {
  daftarLightbox = daftar;
  indeksLightbox = i;
  isiLightbox();
  lightbox.showModal();
  document.body.classList.add("lightbox-terbuka");
}

// Geser satu foto; berputar kembali ke awal/akhir supaya tidak mentok.
function geserLightbox(langkah) {
  const jumlah = daftarLightbox.length;
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
const daftarFotoTimeline = []; // foto timeline juga bisa dibuka di lightbox
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

  // Foto opsional: efek hidup yang sama dengan galeri (F5) dan bisa dibuka di lightbox.
  if (momen.foto) {
    const tombolFoto = document.createElement("button");
    tombolFoto.type = "button";
    tombolFoto.className = "timeline__foto-tombol foto-hidup";
    tombolFoto.setAttribute("aria-label", "Buka foto: " + momen.judul);

    const foto = document.createElement("img");
    foto.className = "timeline__foto";
    foto.alt = momen.judul;
    foto.loading = "lazy";
    foto.decoding = "async";
    foto.addEventListener("error", () => { foto.src = srcPlaceholder(i); }, { once: true });
    foto.src = momen.foto;
    // Miring tipis saat diam, lalu berubah ±3 derajat saat hover/sentuh.
    tombolFoto.style.setProperty("--rot", acak(-2, 2).toFixed(1) + "deg");
    tombolFoto.style.setProperty("--rot-hidup", (Math.random() < 0.5 ? -3 : 3) + "deg");

    const indeksFoto = daftarFotoTimeline.push({
      caption: momen.judul, tanggal: tanggalPanjang(momen.tanggal), img: foto,
    }) - 1;
    tombolFoto.addEventListener("click", () => bukaLightbox(daftarFotoTimeline, indeksFoto));
    tombolFoto.append(foto);
    kartu.append(tombolFoto);
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
let timerConfettiSurat = 0;

function hentikanKetikSurat() {
  clearTimeout(timerSurat);
  timerSurat = 0;
}

// Tampilkan semua teks seketika (tombol Lewati atau selesai mengetik).
function tampilkanSuratLengkap() {
  hentikanKetikSurat();
  suratIsi.textContent = teksSuratLengkap;
  suratKursor.hidden = true;
  suratLewati.hidden = true;
}

// Ketik satu karakter per jeda; berhenti agak lama di akhir paragraf.
function ngetikSurat(i) {
  // Ikut menggulir hanya bila pembaca belum menggulir sendiri ke atas.
  const ikutBawah = suratKertas.scrollTop + suratKertas.clientHeight >= suratKertas.scrollHeight - 48;
  suratIsi.textContent = teksSuratLengkap.slice(0, i);
  if (ikutBawah) suratKertas.scrollTop = suratKertas.scrollHeight;
  if (i >= teksSuratLengkap.length) {
    tampilkanSuratLengkap();
    return;
  }
  const akhirParagraf = teksSuratLengkap[i] === "\n" && teksSuratLengkap[i + 1] === "\n";
  timerSurat = setTimeout(() => ngetikSurat(i + 1), DATA.suratKecepatanMs * (akhirParagraf ? 8 : 1));
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
  ngetikSurat(0);
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
    pindahkanKanvasConfetti(suratModal); // modal ada di top layer
    burst(innerWidth / 2, innerHeight * 0.3, 60);
    // Setelah ledakan, kembalikan confetti ke belakang agar teks surat tidak tertutup.
    clearTimeout(timerConfettiSurat);
    timerConfettiSurat = setTimeout(() => {
      if (!suratModal.open) return;
      pindahkanKanvasConfetti(document.body);
    }, 1600);
  }, mqGerakMinimal.matches ? 0 : 1350); // segel 0.3s, tutup 0.55s, kertas 0.4-1.25s, lalu jeda
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
  clearTimeout(timerConfettiSurat);
  pindahkanKanvasConfetti(document.body);
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
  clearTimeout(timerSajian);
  lilinPadam = false;
  sedangPotong = false;
  sedangMenyajikan = false;
  potonganSiap = null;
  daftarPotongan.length = 0;
  idPotongan = 0;
  // Reset tanpa animasi: kue dan lilin langsung kembali ke bentuk penuh.
  lilinKue.style.transition = "none";
  terapkanSisaKue(0);
  void lilinKue.getBoundingClientRect();
  lilinKue.style.transition = "";
  kue.classList.remove("kue--padam", "kue--potong", "kue--mendarat");
  kue.style.removeProperty("--pisau-x");
  kueSvg.setAttribute("aria-label", DATA.kueAria);
  tombolTiup.hidden = false;
  tombolPotong.hidden = true;
  tombolPotongLagi.hidden = true;
  harapanKue.textContent = "";
  harapanKue.classList.remove("kue__harapan--tampil");
  kartuPotongan.hidden = true;
  // Elemen SVG: buang semua potongan beserta piringnya.
  remahKue.style.removeProperty("transform");
  wadahPotongan.textContent = "";
  penerimaTeks.textContent = "";
  penerimaLucu.textContent = "";
  kueHabis.textContent = "";
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
const WARNA_CONFETTI = ["#F4B6C2", "#FFD3B6", "#CDB4DB", "#E8B86D", "#FFF1DF"];
const BATAS_PARTIKEL = 80; // batas total, termasuk ledakan
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

// <dialog> ada di top layer: pindahkan canvas ke dalamnya saat surat terbuka,
// lalu kembalikan ke body saat ditutup agar confetti tetap terlihat.
function pindahkanKanvasConfetti(induk) {
  if (kanvasConfetti.parentElement !== induk) induk.append(kanvasConfetti);
}

// Batas jumlah saat hujan lebat dan saat looping ringan (total tetap <= 80).
const batasHujan = () => (lebarKanvas < 700 ? 60 : 80);
const targetRingan = () => (lebarKanvas < 700 ? 14 : 20);

function acak(min, maks) {
  return min + Math.random() * (maks - min);
}

function warnaAcak() {
  return WARNA_CONFETTI[(Math.random() * WARNA_CONFETTI.length) | 0];
}

// Partikel jatuh dari atas layar (hujan lebat dan looping ringan).
// Saat ringan, gerak dibuat lebih lambat dan tenang agar latar tidak ramai.
function buatPartikelJatuh(ringan) {
  const pita = Math.random() < 0.3;
  return {
    jenis: pita ? "pita" : "kertas",
    x: acak(0, lebarKanvas),
    y: acak(-80, -12),
    lebar: pita ? acak(20, 34) : acak(7, 13),
    tinggi: pita ? acak(5, 8) : acak(5, 9),
    vx: acak(-14, 14) * (ringan ? 0.5 : 1),
    vy: ringan ? acak(32, 62) : acak(55, 120),
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

// Ledakan pembuka: kertas melompat dari sepanjang tepi atas lalu ikut jatuh.
function ledakanAtas(jumlah) {
  for (let i = 0; i < jumlah && partikelConfetti.length < BATAS_PARTIKEL; i++) {
    const p = buatPartikelJatuh(false);
    p.x = acak(0, lebarKanvas);
    p.y = acak(-24, -6);
    p.vx = acak(-150, 150);
    p.vy = acak(30, 210);
    partikelConfetti.push(p);
  }
}

// Mulai hujan lebat 4 detik, lalu lanjut ringan terus (kecuali gerak minimal).
function mulaiConfetti() {
  ukurKanvasConfetti();
  if (mqGerakMinimal.matches) return;
  sisaLebat = DURASI_LEBAT;
  ledakanAtas(72);
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
    const sebelumnyaLebat = sisaLebat > 0;
    if (sisaLebat > 0) sisaLebat = Math.max(0, sisaLebat - dt * 1000);
    // Perayaan utama usai: partikel sisanya memudar agar latar kembali tenang.
    if (sebelumnyaLebat && sisaLebat === 0) {
      for (let i = targetRingan(); i < partikelConfetti.length; i++) partikelConfetti[i].pudar = true;
    }
    const batas = sisaLebat > 0 ? batasHujan() : targetRingan();
    timbunanSpawn = Math.min(timbunanSpawn + (sisaLebat > 0 ? 220 : 12) * dt, 8);
    while (timbunanSpawn >= 1 && partikelConfetti.length < batas) {
      timbunanSpawn -= 1;
      partikelConfetti.push(buatPartikelJatuh(sisaLebat === 0));
    }
  }

  // Gerakkan partikel: jatuh, mengayun, berputar.
  for (let i = partikelConfetti.length - 1; i >= 0; i--) {
    const p = partikelConfetti[i];
    p.ayunFase += p.ayunLaju * dt;
    p.x += (p.vx + Math.sin(p.ayunFase) * p.ayunAmp) * dt;
    p.y += p.vy * dt;
    p.rotasi += p.putaran * dt;
    if (p.pudar) {
      p.alpha -= dt / 0.8;
      if (p.alpha <= 0) {
        partikelConfetti.splice(i, 1);
        continue;
      }
    }
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

  // Hentikan loop hanya saat mode gerak minimal sudah tidak punya partikel.
  if (mqGerakMinimal.matches && partikelConfetti.length === 0) hentikanLoopConfetti();
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

  for (const [lapis, kecepatan] of KECEPATAN_LAPIS.entries()) {
    const lapisEl = document.createElement("div");
    lapisEl.className = "dekor__lapis";
    lapisEl.dataset.kecepatan = kecepatan;
    let isi = "";
    for (let i = 0; i < STIKER_PER_LAPIS; i++) {
      // Bentuk diputar bergiliran agar ketujuh stiker muncul, bukan acak yang bisa menghilangkan jenis.
      const bentuk = BENTUK_STIKER[(lapis * STIKER_PER_LAPIS + i) % BENTUK_STIKER.length];
      // Selang-seling kiri/kanan dan menempel ke tepi agar tidak menutupi teks di tengah.
      const posisi = ((lapis + i) % 2 ? acak(1, 9) : acak(88, 96)).toFixed(1);
      const atas = acak(0, 50);
      const ukuran = Math.round(acak(28, 52));
      const gaya = `left:${posisi}%;width:${ukuran}px;--rot:${Math.round(acak(-28, 28))}deg;--amp:${Math.round(acak(5, 12))}px;--dur:${acak(5, 9).toFixed(1)}s;--delay:${(-acak(0, 6)).toFixed(1)}s`;
      isi += `<div class="dekor__stiker" style="${gaya};top:${atas.toFixed(2)}%">${bentuk}</div>`;
      isi += `<div class="dekor__stiker" style="${gaya};top:${(atas + 50).toFixed(2)}%">${bentuk}</div>`;
    }
    lapisEl.innerHTML = isi; // hanya string SVG statis di atas, bukan masukan pengguna
    dekor.appendChild(lapisEl);
    lapisanDekor.push(lapisEl);
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
const BENTUK_SPARKLE = ["bintang", "hati", "titik"];
// Ukuran per bentuk (px): hati 12-18, bintang 14-22, titik 3-7.
const UKURAN_SPARKLE = { hati: [12, 18], bintang: [14, 22], titik: [3, 7] };

// Dialog modal ada di top layer: pindahkan lapisan sparkle ke dialog yang terbuka
// agar sparkle dari klik pembuka tidak tertutup backdrop.
document.addEventListener("toggle", (e) => {
  if (e.target instanceof HTMLDialogElement) {
    (e.target.open ? e.target : document.body).append(lapisanSparkle);
  }
}, true);

// Simpan titik pointerdown untuk membedakan tap dari geser (scroll) di pointerup.
let titikTekan = null;
document.addEventListener("pointerdown", (e) => {
  titikTekan = e.isPrimary ? { x: e.clientX, y: e.clientY } : null;
}, { passive: true });

document.addEventListener("pointerup", (e) => {
  const mulai = titikTekan;
  titikTekan = null;
  if (!mulai || !e.isPrimary || mqGerakMinimal.matches) return;
  if (e.pointerType === "mouse" && e.button !== 0) return; // klik kiri saja
  if (Math.hypot(e.clientX - mulai.x, e.clientY - mulai.y) > 10) return; // geser = scroll, bukan tap

  // <dialog> modal ada di top layer: pindahkan lapisan sparkle ke dalamnya agar tetap terlihat.
  const dialogTerbuka = document.querySelector("dialog[open]");
  const indukSparkle = dialogTerbuka || document.body;
  if (lapisanSparkle.parentElement !== indukSparkle) indukSparkle.append(lapisanSparkle);

  const sisa = BATAS_SPARKLE - lapisanSparkle.childElementCount;
  if (sisa <= 0) return;
  const jumlah = Math.min(Math.floor(acak(14, 21)), sisa);
  for (let i = 0; i < jumlah; i++) {
    const partikel = document.createElement("span");
    const bentuk = BENTUK_SPARKLE[Math.floor(Math.random() * BENTUK_SPARKLE.length)];
    partikel.className = "sparkle__partikel sparkle__partikel--" + bentuk;
    partikel.style.left = e.clientX + "px";
    partikel.style.top = e.clientY + "px";
    // Sebar radial ke segala arah, jarak bervariasi.
    const sudut = Math.random() * Math.PI * 2;
    const jarak = acak(34, 90);
    partikel.style.setProperty("--dx", (Math.cos(sudut) * jarak).toFixed(0) + "px");
    partikel.style.setProperty("--dy", (Math.sin(sudut) * jarak).toFixed(0) + "px");
    partikel.style.setProperty("--rot", acak(-90, 90).toFixed(0) + "deg");
    partikel.style.setProperty("--dur", acak(0.9, 1.2).toFixed(2) + "s");
    partikel.style.setProperty("--ukuran", acak(UKURAN_SPARKLE[bentuk][0], UKURAN_SPARKLE[bentuk][1]).toFixed(1) + "px");
    partikel.style.setProperty("--warna", WARNA_SPARKLE[i % 2]);
    // Timeout juga membersihkan partikel bila animationend tidak sempat jalan (dialog ditutup saat animasi).
    setTimeout(() => partikel.remove(), 1300);
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

// Hati kecil di pojok: klik memunculkan toast di atas layar selama ~3 detik.
const hati = document.getElementById("hati");
const toastHati = document.getElementById("toastHati");
hati.setAttribute("aria-label", DATA.hatiAria);
let jedaToast = 0;

hati.addEventListener("click", () => {
  toastHati.textContent = DATA.hatiTeks;
  toastHati.classList.remove("toast--tampil");
  void toastHati.offsetWidth; // ulang animasi walau diklik beruntun
  toastHati.classList.add("toast--tampil");
  clearTimeout(jedaToast);
  jedaToast = setTimeout(() => toastHati.classList.remove("toast--tampil"), 3000);
});

// --- Footer: tombol pelukan WhatsApp (F12) ---
const footer = document.getElementById("footer");
const waBar = document.getElementById("waBar");
const waTombol = document.getElementById("waTombol");
const footerTeks = document.getElementById("footerTeks");

waTombol.textContent = DATA.waTombol;
waTombol.href = "https://wa.me/" + DATA.nomorWA + "?text=" + encodeURIComponent(DATA.pesanWA);
footerTeks.textContent = DATA.footerTeks;
footerTeks.hidden = !DATA.footerTeks;

// Peringatan hanya untuk nomor: format 62 tanpa +/spasi/tanda hubung, dan bukan data contoh.
if (!/^62\d{8,13}$/.test(DATA.nomorWA) || DATA.nomorWA === "6281234567890" || /\[CONTOH\]/.test(DATA.nomorWA)) {
  console.warn("F12: nomorWA di data.js belum valid atau masih contoh. Gunakan format 62 tanpa +, spasi, atau tanda hubung.");
}

// Bar hanya tampil saat pengguna mencapai dasar halaman. Maskot disembunyikan
// selama bar tampil agar tidak saling menutupi (kelas dibaca CSS).
new IntersectionObserver(([entri]) => {
  waBar.hidden = !entri.isIntersecting;
  document.body.classList.toggle("wa-tampil", entri.isIntersecting);
}, { threshold: 0.15 }).observe(footer);
