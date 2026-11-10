// data.js - semua isi personal. Ganti nilai bertanda [CONTOH] dengan data asli.
// Penjelasan tiap bagian ada di konten.md.

const DATA = {
  // 1. Data dasar
  namaDia: "[CONTOH] Sayang",
  namaLengkapDia: "[CONTOH] Nama Lengkap",
  namaSaya: "[CONTOH] Aku",
  tanggalUlangTahun: "2000-11-10", // [CONTOH]
  tanggalJadian: "2023-02-14", // [CONTOH]
  kataSandi: "14022023", // [CONTOH] kosongkan ("") untuk mematikan sandi
  petunjukSandi: "[CONTOH] Tanggal pertama kita ketemu",

  // 2. WhatsApp (tombol pelukan)
  nomorWA: "6281234567890", // [CONTOH] format internasional tanpa + dan tanpa spasi
  pesanWA: "[CONTOH] Aku sudah lihat semuanya dan aku terharu. Ini pelukan balik buat kamu!",

  // 3. Gate
  gateTeks: "Ada kejutan buat kamu...",
  gateTombol: "Buka",
  pesanSandiSalah: "Hmm, kayaknya belum tepat. Coba lagi ya.",

  // 4. Hero
  heroJudul: "Selamat Ulang Tahun",
  heroAtas: "[CONTOH] Hari ini spesial banget",
  heroSubteks: "[CONTOH] Satu tahun lagi bersama kamu adalah hadiah terbaik buatku",
  heroPanah: "scroll ke bawah",
  pesanRahasia: "[CONTOH] Kamu masih klik-klik aja ya. Aku sayang kamu, selalu.",

  // 5. Kue
  kueTulisan: "Happy Birthday, [CONTOH] Sayang",
  kueLabelTiup: "Tiup Lilin",
  kueLabelPotong: "Potong Kue",
  kueLabelPotongLagi: "Potong lagi",
  kueLabelKasih: "Kasih 🍰",
  kueAria: "Kue ulang tahun tiga tingkat dengan lilin menyala",
  kueAriaPadam: "Kue ulang tahun tiga tingkat, lilin sudah padam",
  lilinPadamTeks: "Make a wish ✨",
  kueTanyaPenerima: "Potongan pertama untuk siapa?",
  kueTanyaPenerimaLagi: "Potongan berikutnya untuk siapa?",
  kueTeksPenerima: "Potongan pertama untuk {nama}",
  kueTeksPenerimaLagi: "Potongan berikutnya untuk {nama}",
  kuePesanNamaKosong: "Nama penerimanya diisi dulu ya 🥺",
  kueDaftarAria: "Daftar penerima potongan kue",
  potonganLucuTeks: "Jawaban paling benar!",

  // 6. Foto galeri (8 foto)
  foto: [
    { src: "assets/foto/foto1.jpg", caption: "[CONTOH] Senyum favoritku", tanggal: "[CONTOH] Jakarta, 2023" },
    { src: "assets/foto/foto2.jpg", caption: "[CONTOH] Kencan pertama", tanggal: "[CONTOH] Bandung, 2023" },
    { src: "assets/foto/foto3.jpg", caption: "[CONTOH] Ketawa sampai sakit perut", tanggal: "[CONTOH] 2023" },
    { src: "assets/foto/foto4.jpg", caption: "[CONTOH] Jalan sore", tanggal: "[CONTOH] 2023" },
    { src: "assets/foto/foto5.jpg", caption: "[CONTOH] Liburan kecil kita", tanggal: "[CONTOH] 2024" },
    { src: "assets/foto/foto6.jpg", caption: "[CONTOH] Fotonya blur tapi tetap lucu", tanggal: "[CONTOH] 2024" },
    { src: "assets/foto/foto7.jpg", caption: "[CONTOH] Makan favorit kita", tanggal: "[CONTOH] 2024" },
    { src: "assets/foto/foto8.jpg", caption: "[CONTOH] Hari paling bahagia", tanggal: "[CONTOH] 2025" },
  ],

  // 7. Timeline kisah kita
  timeline: [
    {
      tanggal: "2023-01-10",
      judul: "[CONTOH] Pertama kali ketemu",
      teks: "[CONTOH] Di tempat itu, tanpa rencana apa-apa.",
      foto: "",
    },
    {
      tanggal: "2023-02-14",
      judul: "[CONTOH] Jadian",
      teks: "[CONTOH] Akhirnya berani bilang, dan kamu bilang iya.",
      foto: "",
    },
    {
      tanggal: "2023-03-01",
      judul: "[CONTOH] Kencan pertama",
      teks: "[CONTOH] Gugup yang manis, sampai lupa waktu.",
      foto: "",
    },
    {
      tanggal: "2023-12-24",
      judul: "[CONTOH] Malam paling lucu",
      teks: "[CONTOH] Ceritanya cuma ke salah jalan, jadinya kenangan.",
      foto: "",
    },
    {
      tanggal: "2025-06-01",
      judul: "[CONTOH] Trip pertama",
      teks: "[CONTOH] Dua orang, satu ransel, banyak tawa.",
      foto: "",
    },
  ],

  // 8. Counter kebersamaan ("{hari}" diganti jumlah hari)
  counterTeks: "Sudah {hari} hari kita bersama",
  counterBawah: "[CONTOH] Dan aku mau menambah hitungan ini terus",

  // 9. Alasan aku sayang kamu
  alasan: [
    "[CONTOH] Caramu ketawa selalu bikin hariku lebih ringan.",
    "[CONTOH] Kamu selalu ingat hal-hal kecil yang aku ceritakan.",
    "[CONTOH] Kamu tahu kapan aku cuma butuh didengar.",
    "[CONTOH] Kamu berani jadi diri sendiri di depanku.",
    "[CONTOH] Cara kamu peduli tanpa minta imbalan.",
    "[CONTOH] Kita bisa diam bareng tanpa canggung.",
    "[CONTOH] Kamu selalu bilang hal jujur, walau susah.",
    "[CONTOH] Karena kamu, hal biasa terasa istimewa.",
  ],

  // 10. Surat cinta
  suratAriaBuka: "Buka surat cinta",
  suratLabelLewati: "Lewati",
  suratLabelTutup: "Tutup surat",
  suratKecepatanMs: 48, // jeda efek ketik per karakter (40-60 ms)
  salamSurat: "[CONTOH] Untuk Sayang, cintaku,",
  teksSurat: [
    "[CONTOH] Selamat ulang tahun, sayang. Hari ini aku mau kamu tahu betapa bersyukurnya aku kamu ada di hidupku.",
    "[CONTOH] Masih ingat pertama kali kita ngobrol? Aku nggak nyangka obrolan biasa itu jadi awal dari semua ini.",
    "[CONTOH] Terima kasih sudah sabar, sudah mengerti, dan sudah jadi tempat pulang paling nyaman.",
    "[CONTOH] Semoga tahun ini baik sama kamu, dan semoga kita masih terus bersama di tahun-tahun berikutnya.",
  ].join("\n\n"),
  penutupSurat: "Dengan cinta,",
  tandaTangan: "[CONTOH] Aku",

  // 11. Lampion harapan
  judulLampion: "Lepaskan Lampion Harapan Ini",
  lampionKeterangan: "Sentuh lampionnya untuk menulis harapanmu",
  lampionPlaceholder: "Tulis harapanmu di sini...",
  lampionLabelLepas: "Lepaskan Lampion 🏮",
  lampionLabelLain: "Tulis harapan lain",
  lampionLabelTutup: "Tutup",
  lampionPesanKosong: "Harapannya masih kosong, tulis dulu ya 🥺",
  lampionTerbangTeks: "Harapanmu sudah terbang ke langit ✨",
  harapan: [
    "[CONTOH] Semoga kamu selalu sehat dan bahagia.",
    "[CONTOH] Semoga semua impianmu pelan-pelan tercapai.",
    "[CONTOH] Semoga kita selalu punya alasan untuk pulang ke satu sama lain.",
  ],

  // 12. Hadiah penutup
  isiHadiah: {
    jenis: "[CONTOH] voucher kencan",
    teks: "[CONTOH] Voucher makan malam di tempat pilihanmu, berlaku seumur hidup.",
    media: "", // nama file di assets/foto, opsional
    berlaku: "[CONTOH] seumur hidup",
  },

  // 13. Footer
  footerTeks: "[CONTOH] Terima kasih sudah ada di hidupku 💛",

  // 14. Musik
  judulLagu: "[CONTOH] Lagu favorit",
  musikFile: "assets/musik.mp3",
  musikMulaiDetik: 0, // opsional

  // 15. Selera dia (untuk dekorasi)
  selera: {
    warnaFavorit: "[CONTOH]",
    bunga: "[CONTOH]",
    hewanMaskot: "[CONTOH] kucing",
    suka: "[CONTOH]",
    tidakSuka: "[CONTOH]",
  },

  // 16. Catatan tambahan
  catatan: "[CONTOH]",
};
