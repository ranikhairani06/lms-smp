<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Aturan styling (WAJIB DIIKUTI)

- Sumber kebenaran desain: frontend/app/globals.css (design system EduSpace dari UI/UX).
- Dilarang menulis nilai hardcode di file CSS mana pun (.css maupun .module.css): warna hex/rgb,
  font-size, line-height, border-radius, box-shadow, padding/margin/gap. Selalu pakai var(--token)
  dari globals.css.
- Spasi hanya boleh dari skala --space-xs sampai --space-2xl. Jarak antar card = var(--space-lg).
- Font hanya Poppins lewat var(--font-family). Jangan menambah font, ukuran, atau radius di luar token.
- Warna semantik (success/error/warning/info) hanya untuk status, bukan dekorasi.
- Teks di atas warna amber (secondary) harus gelap, bukan putih.
- Jangan mengubah logika, struktur JSX, nama kelas yang dipakai di TSX, atau pemanggilan API.
  Hanya ubah styling.
- Jangan membuat token baru. Nilai di luar skala dibulatkan sesuai tabel
  "Pemetaan nilai ke token" di bawah.
- Beri komentar CSS yang menjelaskan bagian tampilan apa.
- Setelah selesai, jalankan npm run lint dan npm run build lalu laporkan hasilnya.

## Font
- Poppins dimuat lewat @font-face lokal di globals.css (file di public/fonts).
  Jangan menambah @import Google Fonts atau @font-face baru di file lain.

## Pengecualian (jangan dikerjakan tanpa perintah)
- Jangan hapus atau ubah blok .parent-* di student.css (sekitar baris 9312-9336).
- Jangan menghapus selector yang tampak tidak terpakai; cukup laporkan.
## Pemetaan nilai ke token (keputusan UI/UX, WAJIB)

Semua nilai di luar skala resmi harus dibulatkan ke token. Jangan membuat token baru
dan jangan meninggalkan nilai hardcode.

## Inline style di TSX
- Nilai statis di style={{ }} (warna, font-size, radius, spasi) memakai var(--token), mengikuti
  "Pemetaan nilai ke token". Contoh: style={{ color: "var(--color-error)", gap: "var(--space-sm)" }}.
- Nilai dinamis dari data atau perhitungan (lebar progress, posisi, tinggi grafik, zoom) dibiarkan.
- Tambahan pemetaan: #737A88 -> --color-text-secondary; #E03131 -> --color-error;
  #2F9E44 -> --color-success; #E8A317 -> --color-warning; #966508 -> --color-warning-dark;
  #8DA1F3 -> --color-primary-light; fontSize 9 -> var(--text-p12-size);
  padding 14px -> var(--space-md); margin 80px -> var(--space-2xl).
- Jangan mengubah JSX selain isi atribut style.

## Admin
- Komponen admin yang dipakai: app/admin/_components/AdminUI.tsx dan AdminShell.tsx.
- Abaikan app/admin/_components/admin/AdminUI.tsx (duplikat yang tidak diimpor), jangan diubah atau dihapus.

### Spasi (hanya margin, padding, gap)
- 2px, 3px, 4px -> --space-xs
- 6px -> --space-sm (padding vertikal badge/chip/tag -> --space-xs)
- 8px -> --space-sm
- 10px -> --space-sm
- 12px -> --space-md (padding/margin kartu, panel, section, tombol);
          --space-sm (gap antar elemen kecil sejajar: ikon+teks, badge, chip)
- 14px, 16px, 18px -> --space-md
- 20px, 24px -> --space-lg
- 32px -> --space-xl, 48px -> --space-2xl
- width, height, top, left, dan sejenisnya TIDAK diubah.

### Font
- Ukuran 9/10/11px -> 12px. 14px -> 16px (teks isi utama) atau 12px (keterangan/meta).
- Selalu pakai pasangan token ukuran + line-height:
  teks isi/keterangan -> --text-p16-size/-line, --text-p12-size/-line, --text-p18-*
  tombol, badge, label form, nav, tab -> --text-l16-*, --text-l12-*, --text-l18-*
  judul -> --text-h5-* sampai --text-h1-*
- Font hanya Poppins (var(--font-family)).

### Radius
- 4px -> --radius-xs, 6px/8px -> --radius-s, 10px/12px -> --radius-m, 16px/20px -> --radius-l,
  999px -> --radius-pill, 50% -> --radius-circle.
- Radius gabungan (misalnya 6px 0 0 6px) -> var(--radius-s) 0 0 var(--radius-s).

### Warna
- #FFFFFF/#fff/white -> --color-surface; #3B5BDB -> --color-primary; #1B1D23 -> --color-text-primary;
  #1E3A8A -> --color-primary-dark; #E6EAFB -> --color-primary-tint; #FFC94D -> --color-secondary
- #4A4E58 dan #555963 -> --color-text-secondary
- #818695 -> --color-text-secondary (teks) atau --color-text-disabled (placeholder/nonaktif)
- #EDF0F4 -> --color-background (latar) atau --color-border (garis)
- #C4C8D2 -> --color-border (properti border) atau --color-text-disabled (properti color)
- #28A745 -> --color-success (isi/ikon/bar) atau --color-success-dark (teks di atas tint)
- #16833B -> --color-success-dark; #1260A6 -> --color-info-dark
- Teks di atas amber harus gelap. Badge dan banner: latar tint, teks varian dark.
- transparent dan none dibiarkan.

### Bayangan
- Card/panel -> --shadow-1, dropdown/menu -> --shadow-2, modal/dialog -> --shadow-3.
- Bayangan lain (misalnya pada tombol) -> none.

### Variabel lokal
- Variabel --es-*, --parent-*, --lms-*, --ad-* didefinisikan sebagai alias token global
  (contoh: --es-primary: var(--color-primary)).
  
## Lint
- Lint saat ini gagal karena 3 error react-hooks/set-state-in-effect di
  app/siswa/_components/quiz.tsx (baris 367, 390, 444). Ini sudah ada sebelum refactor styling.
  Jangan diperbaiki dan jangan diubah.
- Syarat selesai: npm run build berhasil dan tidak ada error lint baru di luar tiga itu.
## Warna di luar palet (aturan cadangan)
- Border berwarna apa pun yang tidak ada di palet (misalnya #eeebfa, #d7d6e6, #e0ddef, #e5e7ee) -> var(--color-border).
- Warna teks di luar palet -> var(--color-text-secondary). Warna latar netral di luar palet -> var(--color-background).
- Teks pesan kosong (empty state) dan teks yang harus terbaca -> var(--color-text-secondary), BUKAN --color-text-disabled.
  --color-text-disabled hanya untuk placeholder dan elemen yang benar-benar nonaktif.
- Latar hover di atas kartu putih -> var(--color-primary-tint) atau var(--color-background), BUKAN --color-surface
  (putih di atas putih membuat hover tidak terlihat).
- Warna lain yang tidak jelas fungsinya: JANGAN ditebak. Biarkan, lalu laporkan lengkap dengan nomor baris. 
## Mencocokkan halaman dengan desain Figma (WAJIB saat diminta merevisi halaman)

Gambar Figma yang saya lampirkan adalah acuan yang benar. Kode saat ini hasil slicing awal
dan boleh berbeda dari desain.

### Cara kerja
1. Sebelum mengubah apa pun, tulis transkripsi singkat teks dari gambar Figma yang akan kamu
   ubah atau tambahkan (judul, label, angka contoh, nama tombol). Jika ada teks yang tidak
   terbaca jelas, tulis "tidak jelas" dan JANGAN menebak.
2. Bandingkan dengan kode halaman: konten (teks, label, bagian/kartu, urutan, jumlah item),
   tata letak (jumlah kolom, posisi), komponen (tombol, badge, tabel, progress), dan gaya.
3. Perbaiki hanya yang berbeda. Jangan merombak bagian yang sudah sama.

### Aturan konten
- Teks statis (judul, label, keterangan, nama tombol) harus persis seperti di Figma.
- Data contoh yang ditulis langsung di kode: ganti sesuai Figma. Data yang berasal dari
  API/backend: JANGAN diganti dengan teks Figma dan jangan hapus pemanggilan API; cukup
  sesuaikan tampilannya.
- Bagian yang ada di Figma tapi belum ada di kode: tambahkan sebagai tampilan statis dengan
  data contoh dari Figma, beri komentar TODO-DATA. Jangan membuat endpoint atau logika baru.
- Bagian yang ada di kode tapi tidak ada di Figma: hapus HANYA jika murni statis (tanpa
  logika, API, atau penanganan klik). Jika punya logika, biarkan dan laporkan.
- Jangan menambah fitur, halaman, atau rute baru.

### Aturan kode
- Ikuti seluruh "Aturan styling" dan "Pemetaan nilai ke token": tidak ada nilai hardcode.
- Nama gaya teks di Figma sama dengan nama token: Heading/h5 = --text-h5-*, Paragraf/p18 =
  --text-p18-*, Label/l16 = --text-l16-*. Pakai token itu persis, termasuk ketebalannya
  (Bold = --font-weight-bold, SemiBold = --font-weight-semibold). Untuk elemen yang sedang
  diperbaiki, ini mengalahkan aturan "jangan ubah ukuran font".
- Pakai kelas dan komponen yang sudah ada. Kelas baru hanya di file CSS role yang sama,
  dengan awalan role yang sudah dipakai di file itu, dan wajib memakai token.
- Komponen bersama (ui.tsx, AdminUI.tsx, shell): boleh menambah varian atau prop opsional.
  Jangan mengubah tampilan default karena dipakai halaman lain. Jika perlu mengubah default,
  laporkan dulu tanpa mengubah.
- Responsif: jika Figma menyertakan versi mobile, ikuti. Jika tidak, jangan ubah perilaku
  mobile yang ada.
- Jangan ubah logika, pemanggilan API, routing, nama props, atau halaman lain di luar yang diminta.
- Jangan menjalankan perintah git.
- Jalankan npm run build. Lint boleh gagal hanya karena 3 error lama di quiz.tsx.

### Laporan akhir (wajib)
1. Perbedaan yang diperbaiki (file dan bagian).
2. Perbedaan yang sengaja tidak diubah dan alasannya.
3. Hal yang butuh keputusan saya.
4. File yang berubah dan hasil build.

## Komponen lintas role (components/lms)
- Komponen di components/lms tidak boleh memakai variabel milik role (--ad-*, --lms-*, --es-*, --parent-*).
  Pakai token global dari globals.css (--color-*, --space-*, --radius-*, --text-*).
- Komponen lintas role tidak boleh menetapkan font dasar pada elemen root.

## Dialog, modal, dan popover
- Dialog, modal, dan popover memakai token global, bukan variabel role. Elemen ini bisa dirender di luar
  pembungkus role sehingga variabel role tidak tersedia.
- Setelah memindahkan elemen apa pun ke komponen bersama, periksa apakah ia masih berada di dalam
  pembungkus role yang gayanya ia butuhkan.

## Error handling
- Setiap halaman yang memuat data dari API wajib menangani tiga keadaan: memuat (LoadingState),
  kosong (EmptyState), dan gagal (ErrorState dengan tombol coba lagi) dari components/lms/state.
- Setiap pemanggilan API dibungkus penanganan gagal (jaringan, 401, 403, 404, 422, 500) dengan pesan
  bahasa Indonesia; jangan menampilkan pesan teknis mentah.