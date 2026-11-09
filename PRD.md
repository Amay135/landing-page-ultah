# PRD - Website Kejutan Ulang Tahun

## 1. Ringkasan

Website statis satu halaman sebagai kejutan ulang tahun untuk pacar. Dia membuka link, lalu menjelajah cerita interaktif: kue ulang tahun, galeri kenangan, surat cinta, lampion harapan, dan hadiah penutup. Di akhir dia bisa membalas lewat WhatsApp.

## 2. Tujuan

- Dia terkejut, tersenyum, dan terharu.
- Terasa personal dan handmade, bukan template.
- Meriah sejak detik pertama (confetti, musik).
- Tiap sentuhan ada reaksi (sparkle, animasi lucu).

## 3. Pengguna

- **Pengguna utama:** pacar saya, membuka lewat HP (hampir pasti), kadang desktop.
- **Pembuat:** saya, mengganti isi lewat `data.js` dan `konten.md`.

## 4. Ruang lingkup

**Termasuk:** halaman statis, animasi, interaksi sisi browser, musik, link WhatsApp.

**Di luar cakupan:** login akun, database, backend, penyimpanan harapan di server, framework (React/Next), pembayaran, analitik.

## 5. Alur pengalaman

Gate -> Hero -> Kue -> Galeri -> Timeline -> Counter -> Alasan -> Surat -> Lampion harapan -> Hadiah -> Footer (tombol WhatsApp).

## 6. Kebutuhan fitur

Tiap fitur punya **kriteria selesai** yang bisa dites manual.

### F1. Gate (pembuka)

- Layar gelap lembut, teks "Ada kejutan buat kamu...", tombol "Buka".
- Opsional kata sandi (dari `data.js`, bisa dimatikan).
- Klik tombol: gate memudar, musik mulai, confetti pertama jatuh, masuk ke hero.

Selesai jika:
- [ ] Musik tidak jalan sebelum tombol diklik.
- [ ] Kata sandi salah menampilkan pesan lembut, benar membuka halaman.
- [ ] Setelah gate hilang, halaman bisa di-scroll.

### F2. Hero

- Judul "Selamat Ulang Tahun, [Nama]" dengan efek ketik.
- Subteks dari `data.js`, panah "scroll" bergerak.
- Nama dia bisa diklik: confetti meledak.

Selesai jika:
- [ ] Judul memakai nama dari `data.js`.
- [ ] Klik nama memicu confetti.

### F3. Confetti jatuh (global)

- Saat halaman baru dibuka: kertas dan pita pastel berjatuhan dari atas ke bawah selama 3-5 detik, lebat.
- Setelah itu tetap ada confetti ringan yang jatuh terus looping di latar.
- Ledakan ekstra di momen penting: buka gate, tiup lilin, buka kado.
- Berada di belakang konten, tidak menghalangi klik.

Selesai jika:
- [ ] Confetti terlihat segera setelah gate dibuka.
- [ ] Tombol dan teks tetap bisa diklik saat confetti jatuh.
- [ ] Tetap lancar di HP menengah (tidak patah-patah).

### F4. Kue interaktif

- Kue 3 tingkat bergaya ilustrasi manis, tulisan "Happy Birthday, [Nama]", lilin menyala berkedip, cahaya hangat.
- Tombol "Tiup Lilin": api padam, asap kecil, confetti, teks "Make a wish".
- Tombol "Potong Kue": satu potongan terpisah dengan animasi.
- Input "Potongan pertama untuk siapa?" dan tombol "Kasih": potongan geser ke piring, tampil "Potongan pertama untuk [nama]".
- Jika nama yang diketik mengandung nama saya (tidak peka huruf besar-kecil): pesan lucu "Jawaban paling benar!".
- Tombol "Potong lagi": potongan berikutnya, daftar penerima tampil.

Selesai jika:
- [ ] Nama kosong ditolak dengan pesan ramah.
- [ ] Nama maksimal 30 karakter, tampil aman (tanpa HTML).
- [ ] Daftar penerima menampilkan semua nama berurutan.
- [ ] Animasi potong dan geser berjalan mulus di HP.

### F5. Galeri foto (polaroid)

- Foto dari `data.js`: `{src, caption, tanggal}`.
- Gaya polaroid/scrapbook: miring tipis acak, washi tape, stiker.
- Saat hover atau sentuh: foto membesar sedikit (scale 1.05) dan miring acak (rotate 3 atau -3 derajat), transisi 300 ms, bayangan membesar.
- Klik foto: lightbox dengan caption dan tanggal, tombol tutup, geser kiri-kanan untuk pindah foto.

Selesai jika:
- [ ] Efek hover/sentuh mulus dan kembali normal saat dilepas.
- [ ] Lightbox bisa ditutup dan di-swipe.
- [ ] Foto di-lazy-load.

### F6. Timeline kisah kita

- Garis vertikal, titik-titik momen dari `data.js`: `{tanggal, judul, teks, foto (opsional)}`.
- Tiap momen muncul bertahap saat di-scroll.
- Foto timeline memakai efek hover/sentuh yang sama seperti F5.

Selesai jika:
- [ ] Momen muncul saat masuk layar.
- [ ] Satu kolom di HP, dua sisi di desktop.

### F7. Counter kebersamaan

- "Sudah X hari kita bersama" dari tanggal jadian (zona waktu Asia/Jakarta), angka naik dari 0 saat masuk layar.
- Di bawahnya jam:menit:detik berjalan.

Selesai jika:
- [ ] Jumlah hari benar terhadap tanggal di `data.js`.
- [ ] Detik berjalan tiap detik.

### F8. Alasan aku sayang kamu

- Kartu flip 3D, depan nomor + hati, belakang alasan dari `data.js`.
- Kartu terbuka diberi tanda. Bisa dibuka dengan keyboard.

Selesai jika:
- [ ] Semua alasan dari `data.js` tampil.
- [ ] Flip mulus, bisa dengan Enter/Space.

### F9. Surat cinta (modal + efek ketik)

- Amplop tertutup dengan segel hati. Klik: amplop terbuka, modal surat muncul.
- Teks **tidak muncul sekaligus**: muncul huruf demi huruf (efek mesin tik) dengan jeda sekitar 40-60 ms per karakter, kursor berkedip di ujung.
- Font tulisan tangan tegak bersambung (Caveat atau Dancing Script), tinta cokelat tua, kertas krem bertekstur.
- Tautan "Lewati" menampilkan semua teks seketika. Tombol "Tutup surat".
- Tanda tangan di akhir surat.

Selesai jika:
- [ ] Teks diketik pelan, bisa dibaca nyaman.
- [ ] "Lewati" dan "Tutup" berfungsi.
- [ ] Saat modal ditutup lalu dibuka lagi, efek ketik mulai dari awal.
- [ ] Surat panjang bisa di-scroll di dalam modal.

### F10. Lampion harapan

- Judul "Lepaskan Lampion Harapan Ini". Langit malam dengan bintang berkelip dan bulan.
- **Satu lampion besar** di tengah, bercahaya, bergoyang pelan, ada percikan api kecil.
- Klik lampion: modal kertas dengan kotak tulis "Tulis harapanmu di sini...", penghitung karakter (maks 120), tombol "Lepaskan Lampion".
- Harapan yang ditulis tampil tertulis tangan di badan lampion.
- Saat dilepas: lampion naik pelan sambil bergoyang, jejak percikan emas, lampion kecil dan bintang bermunculan di sekitarnya, teks "Harapanmu sudah terbang ke langit".
- Setelah itu lampion baru muncul dari bawah, tombol "Tulis harapan lain".

Selesai jika:
- [ ] Harapan kosong ditolak dengan pesan ramah.
- [ ] Teks harapan tampil aman (tanpa HTML).
- [ ] Animasi terbang selesai lalu lampion baru muncul.
- [ ] Bisa melepas lebih dari satu lampion.

### F11. Hadiah penutup

- Kotak kado besar dengan pita. Klik: tutup terbuka, confetti besar, isi muncul (teks, voucher bergaya tiket, foto, atau video dari `data.js`).
- Tombol "Mainkan lagi" kembali ke atas dan mereset interaksi.

Selesai jika:
- [ ] Isi hadiah sesuai `data.js`.
- [ ] "Mainkan lagi" mereset kue, kartu, dan lampion.

### F12. Footer: tombol pelukan WhatsApp

- Di bagian paling bawah setelah semua konten: tombol besar mengambang/menempel di bawah layar, tulisan "Kirim Pelukan Balik ke Kamu 🤗".
- Gradien pink-peach, glow lembut, animasi berdenyut pelan (pulse).
- Dibungkus tag `<a>` ke `https://wa.me/[nomor]?text=[pesan]` dengan nomor dan pesan dari `data.js`, `target="_blank"`, `rel="noopener"`. Pesan di-URL-encode.
- Baris kecil tulisan tangan di bawahnya.

Selesai jika:
- [ ] Klik membuka WhatsApp dengan pesan terisi otomatis.
- [ ] Tombol hanya tampil di bagian bawah halaman, tidak mengganggu bagian lain.
- [ ] Nomor format internasional tanpa `+` dan tanpa spasi.

### F13. Parallax dan stiker scrapbook (global)

- Stiker dekoratif acak di latar (daun kering, bunga, pita, bintang kertas, hati kecil, washi tape, sobekan kertas) dengan z-index di bawah konten.
- Elemen latar melayang pelan dan bergerak lebih lambat daripada konten saat scroll, beberapa lapisan dengan kecepatan berbeda.
- Stiker tidak boleh menutupi teks, foto, atau tombol.

Selesai jika:
- [ ] Efek parallax terlihat saat scroll.
- [ ] Tidak ada elemen dekorasi yang menghalangi interaksi.
- [ ] Mati bila `prefers-reduced-motion` aktif.

### F14. Sparkle saat disentuh (global)

- Tiap tap di HP atau klik kursor memicu ledakan partikel kecil (bintang dan titik) berwarna emas `#E8B86D` dan pink `#F4B6C2` tepat di titik sentuh.
- 8-12 partikel, menyebar sedikit, memudar, dan jatuh ke bawah dalam sekitar 1 detik.
- Tidak memblokir klik atau scroll, berlaku di semua section termasuk di atas tombol.

Selesai jika:
- [ ] Sparkle muncul tepat di titik sentuh.
- [ ] Hilang dalam sekitar 1 detik.
- [ ] Tidak menghambat scroll atau klik tombol.

### F15. Interaksi lucu tambahan

- Klik judul hero 5 kali: pesan rahasia dari `data.js`.
- Maskot kecil orisinal di pojok yang melambai saat klik.
- Tombol mute/unmute musik kecil di pojok kanan atas.

Selesai jika:
- [ ] Pesan rahasia muncul setelah klik ke-5.
- [ ] Tombol mute benar-benar mematikan dan menyalakan musik.

## 7. Kebutuhan non-fungsional

- **Perangkat:** utama HP 360-430px, lalu tablet dan desktop.
- **Performa:** load < 3 detik di 4G, total halaman idealnya < 15 MB, foto maksimal sekitar 300 KB per foto, mp3 < 5 MB.
- **Aksesibilitas dasar:** kontras teks cukup, `alt` pada gambar, fokus keyboard terlihat, `prefers-reduced-motion` dihormati.
- **Keamanan:** semua input pengguna di-escape (tanpa `innerHTML`), tidak ada data dikirim ke server.
- **Kompatibilitas:** Chrome dan Safari terbaru (Android dan iOS), Firefox, Edge.
- **Hosting:** statis, bisa di-upload ke Netlify Drop, GitHub Pages, atau Cloudflare Pages tanpa build.

## 8. Konfigurasi di `data.js`

Semua isi yang bisa diganti berada di satu file:

- `namaDia`, `namaSaya`
- `tanggalUlangTahun`, `tanggalJadian`
- `kataSandi` (kosong = tidak pakai gate sandi)
- `nomorWA`, `pesanWA`
- `foto[]`, `timeline[]`, `alasan[]`, `harapan[]`
- `teksSurat`, `isiHadiah`, `pesanRahasia`

## 9. Tahap pengerjaan

1. Kerangka, tema, gate
2. Hero dan confetti
3. Parallax dan stiker
4. Kue (lilin lalu potong dan nama)
5. Galeri
6. Timeline dan counter
7. Kartu alasan
8. Surat dengan efek ketik
9. Lampion harapan
10. Hadiah
11. Sparkle tap dan interaksi lucu
12. Footer tombol WhatsApp
13. Polish, performa, tes HP
14. Deploy

## 10. Definisi selesai

- Semua kriteria "Selesai jika" di atas lolos tes manual di HP.
- Tidak ada error di console.
- Folder siap di-upload dan link bisa dibuka tanpa login.
- Saya sudah mencoba satu kali dari awal sampai akhir dan tidak ada yang rusak.
