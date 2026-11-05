# Integrasi frontend Next.js dan backend Laravel

## Jalankan dari dua terminal PowerShell

Terminal backend, dari root project:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File backend/php.ps1 artisan serve --host=127.0.0.1 --port=8000
```

Terminal frontend:

```powershell
cd frontend
npm run dev
```

Buka **http://localhost:3000/login**. Akun demo dan setup backend dijelaskan di [backend/README.md](backend/README.md).

## Konfigurasi dan alur request

`frontend/.env.local` berisi:

```dotenv
BACKEND_API_URL=http://127.0.0.1:8000/api
```

Pada checkout baru, salin `frontend/.env.example` menjadi `.env.local`.
Restart Next.js setiap kali mengubah konfigurasi ini. Untuk menggunakan backend tim yang sudah di-host, isi URL API-nya (termasuk `/api`). Database lokal dan akun demo lokal tidak otomatis tersedia pada server tim.

Browser mengirim request ke `/api/auth/*` milik Next.js. Next.js meneruskannya ke Laravel, lalu menyimpan token Sanctum dalam cookie HttpOnly `lms_session`. Token tidak dikirim dalam JSON ke browser dan tidak disimpan dalam localStorage. Cookie menggunakan Secure pada production HTTPS. Pilihan "Ingat saya" menyimpan cookie selama 30 hari; tanpa pilihan tersebut cookie berlaku selama sesi browser, sedangkan token backend kedaluwarsa setelah satu hari.

Karena request Laravel dilakukan oleh server Next.js, alur ini tidak membutuhkan konfigurasi CORS tambahan di browser. Gunakan `backendRequest` dari `frontend/lib/backend.ts` untuk request server berikutnya dan selalu periksa sesi/otorisasi. Jangan mengimpor modul tersebut ke Client Component.

## Yang sudah terhubung

| Fitur | API Laravel |
| --- | --- |
| Login sesuai peran | `POST /api/auth/login` |
| Pemeriksaan sesi dan identitas | `GET /api/me` |
| Ganti password, termasuk login pertama | `PUT /api/auth/password` |
| Logout dan pencabutan token | `POST /api/auth/logout` |

Portal `/siswa`, `/orang-tua`, dan `/guru` memeriksa sesi, kewajiban ganti password, serta peran melalui backend. Header portal dan formulir ganti password menampilkan identitas akun yang masuk. Guru diarahkan ke `/guru`; admin masih menggunakan `/akun`. Membuka portal dengan sesi role lain menampilkan login untuk role yang diperlukan beserta penjelasan.

Portal guru memiliki 17 layar sesuai PDF UI/UX. Akses demo melalui `/login?role=teacher` dengan `G001` / `GuruDev!2026`. Data pembelajaran masih contoh dan perubahan pratinjau disimpan di browser, belum dikirim ke API. Rute, batas fitur, dan aturan desain dijelaskan di [panduan portal guru](frontend/app/guru/README.md).

## Batas integrasi awal

Isi dashboard, profil rinci, mata pelajaran, progres, nilai, tugas, dan kuis yang sudah ada di frontend masih menggunakan data contoh atau penyimpanan browser. Login berhasil **belum berarti semua data pembelajaran sudah berasal dari database**.

Backend menyediakan endpoint siswa untuk dashboard, courses, materi, assessment, dan profil, serta `GET /api/parent/dashboard`. Tahap berikutnya adalah memetakan struktur data dan ID dari API ke masing-masing layar. Beberapa tampilan seperti ringkasan nilai/progres memerlukan penyesuaian atau penambahan respons backend; jangan mengganti ID contoh dengan angka perkiraan.

## Pemeriksaan

```powershell
cd frontend
npx tsc --noEmit
npm run build
```

Uji HTTP otomatis (kedua server harus aktif di port 3000 dan 8000, dengan akun demo lokal yang masih memakai password awal):

```powershell
node scripts/auth-smoke.mjs
```

Skrip memeriksa 29 kondisi, mengubah sementara password akun demo orang tua lalu mengembalikannya, serta mencabut seluruh token pengujian. Tunggu satu menit sebelum mengulang apabila terkena batas login Laravel (5 request per menit).

Untuk pengujian manual:

1. Akses `/siswa` tanpa login: kembali ke login.
2. Login siswa `0012345671` dengan `17052012`: diarahkan ke ganti password pada login pertama.
3. Coba password saat ini yang salah dan konfirmasi yang tidak sama: perubahan harus ditolak.
4. Simpan password baru yang valid: diarahkan ke portal siswa dan gunakan password baru untuk login selanjutnya.
5. Klik Logout lalu Keluar: token dicabut dan portal tidak dapat diakses tanpa login.
6. Login orang tua `ortu-0012345671` dengan `OrtuDev!2026`: diarahkan ke portal orang tua; `/siswa` meminta login siswa dengan penjelasan perbedaan role.
7. Hentikan Laravel lalu kirim formulir login: frontend menampilkan kegagalan koneksi, bukan keberhasilan palsu.

`npm run lint` pada kode awal memiliki error React hooks di `app/siswa/_components/quiz.tsx` dan beberapa peringatan lain. Kode kuis tersebut belum termasuk integrasi autentikasi ini.

Verifikasi integrasi awal: build production dan TypeScript lolos; 29 pemeriksaan HTTP lolos; backend yang dihentikan menghasilkan 503 tanpa sesi baru. Sembilan test Laravel lolos pada run pertama, lalu satu test otorisasi yang gagal karena folder cache belum tersedia lolos setelah folder dibuat oleh `backend/runtime.ps1`.
