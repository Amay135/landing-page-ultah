// data.js - semua isi personal. Ganti nilai di sini, jangan di HTML/script.
// Penjelasan tiap bagian ada di konten.md.

const DATA = {
  // 1. Data dasar
  namaDia: "Sayang",
  namaLengkapDia: "Nadia",
  namaSaya: "Amay", // dipakai untuk tebak-tebakan "potongan kue untuk siapa"
  tanggalUlangTahun: "23 November", // opsional, tidak dipakai di halaman
  tanggalJadian: "2026-05-28",
  kataSandi: "28052026", // kosongkan ("") untuk mematikan sandi
  petunjukSandi: "Ingat tanggal jadian kita.",

  // 2. WhatsApp (tombol pelukan)
  nomorWA: "6285748631950", // format internasional tanpa + dan tanpa spasi
  pesanWA: "Aku udah lihat semuanya 🥹 Ini pelukan balik buat kamu 🤗❤️",
  waTombol: "Kirim Pelukan Balik ke Kamu 🤗",

  // 3. Gate
  gateTeks: "Psst... ada kejutan buat kamu 👀",
  gateTombol: "Buka Kejutannya",
  pesanSandiSalah: "Hmm, belum tepat. Coba lagi ya 😅",

  // 4. Hero
  heroJudul: "Selamat Ulang Tahun",
  heroAtas: "Dari satu server Roblox, sampai sejauh ini",
  heroSubteks: "Halaman ini khusus buat kamu player favoritku, alasan aku betah online sampai lupa waktu.",
  heroPanah: "geser ke bawah",
  pesanRahasia: "Masih aja diklik. Padahal dari tadi aku udah bilang: aku sayang kamu. Ya udah, sekali lagi — aku sayang kamu, banyak-banyak.",

  // 5. Kue
  kueTulisan: "Happy Birthday, Sayang",
  kueLabelTiup: "Tiup Lilin",
  kueLabelPotong: "Potong Kue",
  kueLabelPotongLagi: "Potong lagi 🔪🍰",
  kueLabelKasih: "Kasih 🍰",
  kueAria: "Kue ulang tahun tiga tingkat dengan lilin menyala",
  kueAriaPadam: "Kue ulang tahun tiga tingkat, lilin sudah padam",
  lilinPadamTeks: "Make a wish ✨",
  kueTanyaPenerima: "Potongan pertama untuk siapa?",
  kueTanyaPenerimaLagi: "Potongan kue untuk siapa lagi?",
  kueTeksPenerima: "Potongan pertama untuk {nama} ❤️",
  kueTeksPenerimaLagi: "Satu potong kue untuk {nama} 💗",
  kueHabisTeks: "Kuenya habis dibagi, tapi sayangku ke kamu nggak ada tombol 'habis'-nya 🤍",
  kuePesanNamaKosong: "Nama penerimanya diisi dulu ya 🥺",
  kueDaftarAria: "Daftar penerima potongan kue",
  potonganLucuTeks: "Jawaban paling benar! 🏆",

  // 6. Foto galeri (12 foto). Caption dan tanggal dibiarkan kosong sampai
  // teks asli diberikan; galeri menyembunyikan baris yang kosong.
  foto: [
    { src: "assets/foto/1.webp", caption: "", tanggal: "" },
    { src: "assets/foto/2.webp", caption: "", tanggal: "" },
    { src: "assets/foto/3.webp", caption: "", tanggal: "" },
    { src: "assets/foto/4.webp", caption: "", tanggal: "" },
    { src: "assets/foto/5.webp", caption: "", tanggal: "" },
    { src: "assets/foto/6.webp", caption: "", tanggal: "" },
    { src: "assets/foto/7.webp", caption: "", tanggal: "" },
    { src: "assets/foto/8.webp", caption: "", tanggal: "" },
    { src: "assets/foto/9.webp", caption: "", tanggal: "" },
    { src: "assets/foto/10.webp", caption: "", tanggal: "" },
    { src: "assets/foto/11.webp", caption: "", tanggal: "" },
    { src: "assets/foto/12.webp", caption: "", tanggal: "" },
  ],

  // 7. Timeline kisah kita (5 momen, urut dari yang paling awal)
  timeline: [
    {
      tanggal: "2026-05-15",
      judul: "Ketemu di Roblox",
      teks: "Awalnya cuma satu server, satu lobi, satu chat receh. Nggak ada yang nyangka obrolan iseng itu jadi awal dari semuanya.",
      foto: "",
    },
    {
      tanggal: "2026-05-17",
      judul: "Tukar Discord",
      teks: "Dua hari kemudian kita naik level: dari chat game ke DM. Sejak itu notifikasi Discord jadi hal yang paling aku tunggu tiap hari.",
      foto: "",
    },
    {
      tanggal: "2026-05-28",
      judul: "Jadian (akhirnya!)",
      teks: "Dua orang yang cuma kenal dari layar akhirnya bilang 'iya'. Nggak ada kembang api, tapi rasanya kayak menang jackpot.",
      foto: "",
    },
    {
      tanggal: "Juni 2026",
      judul: "Mulai Saling Cerita",
      teks: "Dari yang awalnya bahas game, pelan-pelan jadi bahas hari, mimpi, dan hal-hal yang nggak pernah aku ceritain ke siapa-siapa.",
      foto: "",
    },
    {
      tanggal: "2026-11-18",
      judul: "Tukar Akun Roblox",
      teks: "Ini level kepercayaan paling tinggi versi kita. Akun Roblox, lengkap dengan history konyolnya. Kalau bukan karena sayang, mana mungkin.",
      foto: "",
    },
  ],

  // 8. Counter kebersamaan ("{hari}" diganti jumlah hari)
  counterTeks: "Sudah {hari} hari sejak kamu bilang iya",
  counterBawah: "Dan tiap harinya masih kerasa kayak hari pertama.",

  // 9. Alasan aku sayang kamu (tiap teks dibuka di balik kartu)
  alasan: [
    "Kamu player favoritku. Dari semua orang di server, cuma username kamu yang aku cari.",
    "Notifikasi darimu selalu kutunggu termasuk yang isinya cuma stiker random.",
    "Cerita randommu nggak pernah membosankan. Kucing tetangga pun jadi seru kalau kamu yang cerita.",
    "Jarak bukan alasan. Kita belum pernah ketemu, tapi kamu udah jadi orang yang paling dekat.",
    "Hari biasa jadi istimewa. Nggak perlu event atau update besar cukup chat kamu, hariku langsung bagus.",
    "Kamu tempat aku cerita dan ngeluh. Dengerin keluhan recehku tanpa sekali pun bilang 'lebay'.",
    "Partner virtual sekaligus partner hati. Di game kita satu tim, di luar game kita satu cerita.",
    "Suatu hari nanti aku mau ketemu kamu beneran. Sampai hari itu, slot itu aku simpan buat kamu.",
  ],

  // 10. Surat cinta
  suratAriaBuka: "Buka surat cinta",
  suratLabelLewati: "Lewati",
  suratLabelTutup: "Tutup surat",
  suratKecepatanMs: 48, // jeda efek ketik per karakter (40-60 ms)
  salamSurat: "Untuk Sayang Nadia,",
  teksSurat: [
    "Selamat ulang tahun, sayang. Aku masih inget hari pertama kita ketemu di Roblox: satu server, satu chat, dan obrolan receh yang nggak ada rencananya. Waktu itu aku nggak tahu kalau username itu bakal jadi orang paling penting di hidupku.",
    "Terus kita tukar Discord, lanjut ngobrol sampai lupa waktu. Tanggal 28 Mei kamu bilang iya, dan sejak itu dunia online rasanya beda aja. Dari yang awalnya cuma teman main, sekarang resmi jadi dua orang yang saling memiliki. Plot twist terbaik yang nggak pernah aku rencanakan. Makasih ya udah dengerin cerita-ceritaku, dari yang serius sampai yang nggak penting banget.",
    "Aku tahu kita belum pernah ketemu langsung. Belum bisa jalan bareng, belum bisa pegangan tangan. Tapi buat aku kamu udah nyata — lebih nyata dari apa pun yang ada di layar ini.",
    "Suatu hari nanti, kalau waktunya dateng, aku mau ketemu kamu beneran. Sampai hari itu tiba, aku bakal tetap ada di sini, di chat yang sama.",
  ].join("\n\n"),
  penutupSurat: "Dengan sayang,",
  tandaTangan: "Amay",

  // 11. Lampion harapan
  judulLampion: "Lepaskan Harapanmu ke Langit",
  lampionKeterangan: "Sentuh lampionnya, tulis harapanmu buat kita ✨",
  lampionPlaceholder: "Tulis harapanmu di sini...",
  lampionLabelLepas: "Lepaskan Lampion 🏮",
  lampionLabelLain: "Tulis harapan lain",
  lampionLabelTutup: "Tutup",
  lampionPesanKosong: "Harapannya masih kosong, tulis dulu ya 🥺",
  lampionTerbangTeks: "Harapanmu sudah terbang ke langit ✨",
  harapan: [
    "Semoga koneksi kita nggak pernah lemot. Kalau pun lemot, cukup internetnya — bukan perasaannya.",
    "Semoga kamu sehat terus, bahagia, dan rezekinya lancar. Aku ikut senang tiap kamu cerita hal baik.",
    "Semoga suatu hari kita ketemu langsung, dan nggak perlu bilang 'dadah' lewat chat lagi.",
  ],

  // 12. Hadiah penutup
  hadiahJudul: "Satu hadiah terakhir (beneran)",
  hadiahKet: "Sentuh kadonya — isinya bukan barang, tapi janji 😌",
  hadiahAriaBuka: "Buka kotak hadiah",
  hadiahBerlakuLabel: "Berlaku:",
  hadiahLabelMainLagi: "Mainkan lagi",
  isiHadiah: {
    jenis: "Voucher Ketemu Langsung (versi beta)",
    teks: "Voucher ini bisa ditukar jadi satu hari beneran bareng aku: jalan, makan, dan ngobrol sampai bosan. Belum ada tanggalnya — tinggal tunggu kita sama-sama siap.",
    media: "", // nama file gambar (assets/foto) atau video (mp4/webm), opsional
    berlaku: "sampai kita ketemu",
  },

  // 13. Footer
  footerTeks: "Makasih udah jadi orang paling seru, di server maupun di luar server 💛",

  // 13b. Easter egg hati (F15)
  hatiAria: "Hati kecil, klik untuk kejutan",
  hatiTeks: "Aku sayang kamu, lebih dari jam main di Roblox ✨",

  // 14. Musik
  judulLagu: "", // opsional, tidak dipakai di halaman
  musikFile: "assets/musik.mp3",
  musikMulaiDetik: 0, // opsional

  // 15. Selera dia (untuk dekorasi)
  selera: {
    warnaFavorit: "",
    bunga: "",
    hewanMaskot: "kucing",
    suka: "",
    tidakSuka: "",
  },

  // 16. Catatan tambahan
  catatan: "",
};
