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
  confetti();
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

// Tahap 2: ganti dengan confetti sungguhan (canvas-confetti).
function confetti() {}
