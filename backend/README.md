# Backend LMS SMP

Backend tim berada di `team/` sebagai repository Git terpisah:
https://github.com/melatoninated/LMS-SMP-PAD (branch `master`).
Integrasi awal diperiksa terhadap commit `f3ff3cc`.
Folder `team/` dan `.runtime/` diabaikan oleh Git frontend.

## Menjalankan backend yang sudah disiapkan

Dari root `C:\xampp\htdocs\lms-smp` di PowerShell:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File backend/php.ps1 artisan serve --host=127.0.0.1 --port=8000
```

Biarkan terminal ini tetap berjalan. API berada di `http://127.0.0.1:8000/api`.
Database lokal adalah `team/database/database.sqlite`; tidak membutuhkan MySQL.
Perintah memakai PHP 8.4 di `.runtime/php`, dengan konfigurasi `php-conf/php.ini`.

## Setup pada komputer lain

1. Clone dari root project: `git clone https://github.com/melatoninated/LMS-SMP-PAD.git backend/team`.
2. Siapkan PHP **8.3 atau 8.4** dan Composer. Meskipun README tim menyebut PHP 8.2+, versi paket dalam `composer.lock` memerlukan 8.3–8.4.
3. Atur `$env:LMS_PHP_BIN = 'C:\lokasi\php.exe'` jika PHP yang sesuai belum ada di PATH. Script juga otomatis mengenali `.runtime/php/php.exe`. PHP Windows resmi tersedia di https://www.php.net/downloads.php?os=windows&version=8.4.
4. Jalankan `powershell -NoProfile -ExecutionPolicy Bypass -File backend/composer.ps1 install --no-interaction --prefer-dist`.
5. Salin `backend/team/.env.example` menjadi `backend/team/.env`. Atur `APP_TIMEZONE=Asia/Jakarta` dan `DB_DATABASE` ke path absolut file SQLite, menggunakan `/`, misalnya `C:/xampp/htdocs/lms-smp/backend/team/database/database.sqlite`.
6. Buat file SQLite kosong **hanya jika belum ada**, lalu jalankan:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File backend/php.ps1 artisan key:generate
powershell -NoProfile -ExecutionPolicy Bypass -File backend/php.ps1 artisan migrate --seed
```

Jangan mengulang `key:generate` pada aplikasi yang sudah memiliki kunci. Jangan memakai `migrate:fresh` untuk database yang ingin dipertahankan.
Frontend Next.js mengakses API; build Vite/Blade backend tidak diperlukan untuk integrasi ini.
Jika Composer tidak ditemukan otomatis, atur `LMS_COMPOSER_PHAR` ke lokasi `composer.phar`.

## Akun demo lokal

| Login sebagai | Username | Password awal |
| --- | --- | --- |
| Siswa | `0012345671` | `17052012` |
| Orang Tua | `ortu-0012345671` | `OrtuDev!2026` |
| Guru | `G001` | `GuruDev!2026` |
| Admin | `admin@example.com` | `AdminDev!2026` |

Siswa, guru, dan orang tua wajib mengganti password pada login pertama. Setelah diganti, gunakan password baru.

## Pembaruan dan pengujian

Perubahan backend dikelola di repository `backend/team`, terpisah dari frontend.
Periksa `git -C backend/team status` sebelum menarik perubahan tim.
Setelah menarik update, jalankan Composer install dan `artisan migrate` sesuai perubahan backend.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File backend/php.ps1 artisan test
```

Lihat `../INTEGRASI.md` untuk alur frontend, batas integrasi, dan pengujian HTTP.
