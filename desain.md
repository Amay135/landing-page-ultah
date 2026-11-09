# Desain Website Ulang Tahun

Website kejutan ulang tahun untuk pacar. Satu halaman, scroll satu arah, mobile-first.

## 1. Tujuan

- Buat dia terkejut dan terharu.
- Terasa personal: foto, kenangan, dan tulisan sendiri.
- Interaktif: tiap klik ada reaksi lucu.
- Estetik: pastel hangat, paralaks, pita jatuh.

## 2. Gaya Visual

### Palet warna

| Peran | Warna | Hex |
|-------|-------|-----|
| Latar utama | Krem | `#FFF6EC` |
| Aksen 1 | Pink dusty | `#F4B6C2` |
| Aksen 2 | Peach | `#FFD3B6` |
| Aksen 3 | Lavender | `#CDB4DB` |
| Highlight | Emas lembut | `#E8B86D` |
| Teks | Cokelat tua | `#5A3E36` |

Ganti sesuai warna favorit dia.

### Font

- Judul: `Pacifico` atau `Playfair Display` italic.
- Tulisan tangan (caption, surat): `Caveat`.
- Isi: `Nunito` atau `Poppins`.

### Bentuk dan gerak

- Sudut membulat (16-24px), bayangan lembut.
- Transisi halus: fade + slide saat section masuk layar.
- Durasi animasi 0.4-0.8 detik, easing lembut.
- Hormati `prefers-reduced-motion`.

## 3. Struktur Halaman

### 3.1 Gate (pembuka)

- Layar gelap lembut, teks: "Ada kejutan buat kamu...".
- Tombol besar "Buka".
- Opsional: kata sandi (mis. tanggal jadian).
- Klik tombol: musik mulai, pita pertama jatuh, masuk ke hero.
- Catatan: browser blok audio autoplay, jadi musik wajib mulai dari klik.

### 3.2 Hero

- "Selamat Ulang Tahun, [Nama]" besar, efek ketik.
- Latar paralaks: awan, bintang, balon pelan melayang.
- Panah kecil bergerak: "scroll ke bawah".

### 3.3 Kue interaktif (fitur utama)

Alur:

1. Kue tampil dengan lilin menyala.
2. Klik lilin atau tombol "Tiup": api padam, confetti meledak, muncul teks "Make a wish".
3. Klik kue atau tombol "Potong": pisau animasi, satu potongan terpisah.
4. Muncul input: "Potongan pertama untuk siapa?".
5. Dia ketik nama, potongan geser ke piring dengan animasi.
6. Tampil teks: "Potongan pertama untuk [Nama]".
7. Pesan kejutan jika nama sama dengan nama kamu: "Jawaban paling benar!".
8. Tombol "Potong lagi" untuk potongan berikutnya, tiap potongan bisa untuk nama berbeda.

Teknis: kue digambar dengan SVG atau CSS agar bisa dianimasikan. Potongan adalah elemen terpisah.

### 3.4 Galeri foto

- Gaya polaroid atau scrapbook: foto agak miring, ada tape dan stiker.
- Paralaks: tiap foto bergerak beda kecepatan saat scroll.
- Klik foto: zoom ke tengah, caption kenangan, goyang kecil.
- Lazy loading, foto dikompres (maks ~300 KB per foto).
- Jumlah foto: 8-12.

### 3.5 Timeline kisah kita

- Garis vertikal dengan titik-titik momen: ketemu pertama, jadian, kencan pertama, momen lucu, trip.
- Tiap momen muncul bergantian saat di-scroll.
- Tiap titik punya tanggal, judul pendek, satu kalimat.

### 3.6 Counter kebersamaan

- "Sudah [X] hari kita bersama".
- Angka naik dari 0 dengan animasi saat masuk layar.
- Tambahan: jam, menit berjalan real-time.

### 3.7 Alasan aku sayang kamu

- Kartu bisa dibalik (flip card). Depan: nomor. Belakang: alasan.
- 6-10 kartu, campur lucu dan serius.

### 3.8 Surat

- Amplop tertutup. Klik: amplop terbuka, surat keluar.
- Teks muncul per paragraf pelan.
- Bagian paling personal: tulis pakai suara sendiri.

### 3.9 Wish

- Lampion atau bintang naik pelan dari bawah.
- Klik satu: muncul harapan atau doa untuk dia tahun ini.
- 5-7 harapan.

### 3.10 Hadiah penutup

- Kotak kado besar.
- Klik: tutup terbuka, confetti, isi kejutan (voucher kencan, janji, foto, video, atau pesan terakhir).
- Tombol "Mainkan lagi" untuk kembali ke atas.

## 4. Efek Global

### Pita jatuh (confetti)

- Kertas dan pita warna palet jatuh dari atas ke bawah.
- Dirender di `<canvas>` fixed, di belakang konten.
- Rotasi dan kecepatan acak, 40-80 partikel agar HP tidak lag.
- Ledakan lebih banyak saat momen penting: buka gate, tiup lilin, buka kado.

### Paralaks

- Layer dekorasi (awan, bintang, bunga, pita) kecepatan scroll berbeda.
- Foto galeri dan judul section sedikit melayang.
- Pakai `transform` dan `requestAnimationFrame` untuk performa.

### Animasi klik lucu

- Klik di mana saja: hati atau bintang kecil muncul lalu naik dan hilang.
- Klik judul 5 kali: pesan rahasia (easter egg).
- Klik foto: goyang.
- Klik nama dia: confetti meledak.
- Maskot kecil buatan sendiri (kucing atau beruang) melambai saat klik. Hindari karakter berhak cipta.

### Musik

- Lagu favorit dia, file ringan (mp3 < 5 MB).
- Tombol mute/unmute kecil di pojok kanan atas.
- Volume awal sedang.

## 5. Konten yang Perlu Disiapkan

- [ ] Nama panggilan dia
- [ ] Tanggal ulang tahun
- [ ] Tanggal jadian dan momen penting
- [ ] 8-12 foto kenangan + caption
- [ ] 6-10 alasan sayang
- [ ] Teks surat
- [ ] 5-7 harapan
- [ ] Isi hadiah kejutan
- [ ] Lagu favorit (file mp3)
- [ ] Warna favorit dia
- [ ] Kata sandi gate (opsional)

## 6. Teknis

- Stack: HTML + CSS + JavaScript (tanpa framework), satu halaman.
- Library opsional: GSAP + ScrollTrigger (animasi scroll), canvas-confetti.
- Mobile-first: viewport 360-430px dulu, lalu desktop.
- Target performa: halaman load < 3 detik di 4G.
- Hosting gratis: GitHub Pages, Netlify, atau Vercel.
- Kirim link ke dia tepat tengah malam atau saat kejutan.

## 7. Prioritas Jika Waktu Mepet

1. Gate + hero
2. Kue interaktif
3. Galeri foto
4. Surat
5. Hadiah penutup
6. Timeline, counter, alasan, wish (tambahan)

## 8. Checklist Akhir

- [ ] Tes di HP (Android dan iOS jika bisa)
- [ ] Musik bisa diputar dan dimatikan
- [ ] Nama potongan kue tampil benar
- [ ] Tidak ada typo di teks
- [ ] Foto tidak berat
- [ ] Link bisa dibuka tanpa login
