# Portal Guru

Implementasi 17 layar dari `ROLE GURU.pdf`, memakai token `styles/lms-tokens.css` dari `DESIGN (2).md`.

## Akses lokal

Buka `/login?role=teacher`, pilih Guru, lalu gunakan akun seed Laravel `G001` / `GuruDev!2026`. Login dan penjagaan role menggunakan sesi Laravel yang sudah tersedia. Login guru dan halaman `/akun` mengarah ke `/guru`.

## Halaman

| Layar | Rute |
| --- | --- |
| Dashboard | `/guru` |
| Mata pelajaran | `/guru/mata-pelajaran` |
| Ringkasan & silabus | `/guru/mata-pelajaran/informatika-8` |
| Daftar materi | `/guru/mata-pelajaran/informatika-8/materi` |
| Editor materi | `/guru/mata-pelajaran/informatika-8/materi/baru` atau `/materi/bab-5/edit` pada mapel |
| Daftar asesmen | `/guru/mata-pelajaran/informatika-8/asesmen` |
| Editor asesmen | `/guru/mata-pelajaran/informatika-8/asesmen/baru` |
| Pengumpulan tugas | `/guru/mata-pelajaran/informatika-8/asesmen/tugas-01/pengumpulan` |
| Koreksi manual | `/guru/mata-pelajaran/informatika-8/asesmen/tugas-01/nilai/0098421001` |
| Analisis hasil | `/guru/mata-pelajaran/informatika-8/asesmen/tugas-01/analisis` |
| Kelas diampu | `/guru/kelas` |
| Detail kelas | `/guru/kelas/8a` |
| Buku nilai | `/guru/kelas/8a/nilai` |
| Progres siswa | `/guru/kelas/8a/progres` |
| Ekspor hasil | `/guru/hasil-belajar` |
| Notifikasi | `/guru/notifikasi` |
| Profil | `/guru/profil` |

Empat mapel dan delapan rombel contoh memiliki rute masing-masing. Rute yang tidak dikenali menampilkan halaman tidak ditemukan.

## Aturan tampilan

- Poppins; judul halaman 24/32, judul card 20/26, isi 16/24, keterangan dan tabel 12/18 px.
- Card: radius 16 px, padding 24 px desktop / 16 px mobile. Sidebar desktop 232 px.
- Spasi mengikuti skala 4, 8, 16, 24, 32, 48 px; warna memakai token EduSpace.
- Tabel menggulir di dalam card; mobile memakai navigasi bawah. Modal mendukung Escape dan fokus bawaan elemen dialog.

## Batas integrasi

Login, logout, identitas akun, dan perubahan kata sandi memakai API yang sudah ada. Data pembelajaran masih fixture di `_components/data.ts`; badge `Data contoh` menandai status tersebut.

Draf materi, asesmen, nilai rubrik, buku nilai, dan status baca notifikasi disimpan ke localStorage per ID pengguna. Publikasi hanya mengubah pratinjau lokal; tidak mengirim nilai atau pesan ke siswa/orang tua. Lampiran menyimpan nama berkas, bukan mengunggah isi berkas. Agenda tambahan dan draf capaian pembelajaran bersifat sementara.

Unduhan rekap menghasilkan CSV UTF-8 yang dapat dibuka di Excel, bukan berkas XLSX. Komponen/kelas yang dipilih menentukan isi berkas. Nilai rapor dihitung dari 60% rata-rata formatif dan 40% sumatif.

## Pemeriksaan

`npm exec --offline -- eslint app/guru app/akun/page.tsx lib/auth-types.ts`

`npx --offline next typegen` lalu `npx --offline tsc --noEmit`

Browser: 17 layar pada lebar 1440, 768, dan 393 px; pencarian/filter, editor/draf, validasi bobot 100, koreksi/umpan balik, buku nilai, CSV, notifikasi, dan navigasi mobile.
