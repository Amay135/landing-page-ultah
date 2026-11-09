# CLAUDE.md - Website Ulang Tahun

Website kejutan ulang tahun untuk pacar. Halaman statis, satu halaman, mobile-first.

## Baca dulu sebelum mengerjakan apa pun

1. `PRD.md` - apa yang dibangun dan perilaku tiap fitur.
2. `desain.md` - gaya visual dan struktur halaman.
3. `konten.md` - semua isi personal (nama, tanggal, teks, foto).
4. Folder `referensi/` (jika ada) - contoh tampilan dari Stitch. Tiru nuansanya, jangan salin mentah.

## Stack

- HTML + CSS + JavaScript biasa. **Tanpa framework, tanpa build step, tanpa backend.**
- Library boleh lewat CDN: GSAP + ScrollTrigger, canvas-confetti. Jangan tambah library lain tanpa bertanya.
- Font dari Google Fonts: Pacifico atau Playfair Display (judul), Caveat atau Dancing Script (tulisan tangan), Nunito (isi).

## Struktur folder

```
ultah/
├── index.html
├── style.css
├── script.js
├── data.js          <- SEMUA teks, nama, tanggal, daftar foto
├── assets/
│   ├── foto/
│   └── musik.mp3
├── referensi/       <- opsional
├── CLAUDE.md
├── PRD.md
├── desain.md
└── konten.md
```

## Aturan kode

- Semua teks, nama, tanggal, nomor WhatsApp, dan daftar foto hanya ada di `data.js`. Jangan tulis keras (hardcode) di HTML atau script.
- Palet lewat CSS custom properties di `:root`: krem `#FFF6EC`, pink `#F4B6C2`, peach `#FFD3B6`, lavender `#CDB4DB`, emas `#E8B86D`, teks `#5A3E36`.
- Mobile-first (360-430px), lalu rapikan tablet dan desktop.
- Animasi pakai `transform` dan `opacity`. Hindari animasi properti yang memicu reflow.
- Hormati `prefers-reduced-motion` (matikan paralaks, kurangi confetti).
- Efek partikel (confetti, sparkle) dibatasi jumlahnya dan memakai `pointer-events: none`.
- Semua teks dari input pengguna (nama potongan kue, harapan lampion) harus di-escape sebelum ditampilkan. Pakai `textContent`, bukan `innerHTML`.
- Musik tidak boleh autoplay sebelum ada klik dari pengguna (aturan browser).
- Beri komentar singkat per bagian kode. Nama variabel dan fungsi jelas.
- Gambar: `alt` terisi, `loading="lazy"` kecuali yang pertama terlihat.

## Cara kerja

- **Satu tahap per permintaan.** Jangan kerjakan tahap yang belum diminta.
- Jangan ubah bagian yang tidak disebut. Kalau perlu mengubah bagian lain, tanyakan dulu.
- Sebelum mulai tahap besar, rangkum rencana dalam beberapa baris.
- Setelah selesai tiap tahap: jelaskan singkat apa yang berubah dan cara mengeceknya.
- Jika data di `konten.md` belum terisi, pakai data contoh yang jelas bertanda `[CONTOH]` dan beri tahu saya.
- Jika permintaan ambigu atau bentrok dengan `PRD.md`, tanyakan, jangan menebak.
- Commit git tiap tahap selesai dengan pesan singkat, contoh: `feat: kue interaktif`.

## Cara tes lokal

```
python -m http.server 8000
```

atau `npx serve`. Buka `http://localhost:8000`. Untuk tes di HP, buka alamat IP lokal komputer dari HP di jaringan Wi-Fi yang sama.

## Karakter dan hak cipta

- Jangan gambar karakter berhak cipta (Disney, Sanrio, dan sejenisnya). Maskot harus karakter orisinal buatan sendiri.
- Jangan salin lirik lagu ke halaman. Musik cukup sebagai file audio yang saya sediakan.

## Checklist sebelum dianggap selesai

- Tidak ada error di console.
- Tidak ada scroll horizontal di HP.
- Teks tidak terpotong di 360px.
- Musik bisa diputar dan dimatikan.
- Semua interaksi di `PRD.md` lolos tes manual.
- Foto dikompres, halaman load < 3 detik di 4G.
- Folder siap di-upload ke Netlify/GitHub Pages tanpa langkah build.
