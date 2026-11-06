<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

## Aturan styling (WAJIB DIIKUTI)

- Sumber kebenaran desain: frontend/app/globals.css (design system EduSpace dari UI/UX).
- Dilarang menulis nilai hardcode di file .module.css: warna hex/rgb, font-size, line-height,
  border-radius, box-shadow, padding/margin/gap. Selalu pakai var(--token) dari globals.css.
- Spasi hanya boleh dari skala --space-xs sampai --space-2xl. Jarak antar card = var(--space-lg).
- Font hanya Poppins lewat var(--font-family). Jangan menambah font, ukuran, atau radius di luar token.
- Warna semantik (success/error/warning/info) hanya untuk status, bukan dekorasi.
- Teks di atas warna amber (secondary) harus gelap, bukan putih.
- Jangan mengubah logika, struktur JSX, nama kelas yang dipakai di TSX, atau pemanggilan API.
  Hanya ubah styling.
- Jika ada nilai yang tidak punya token padanan, JANGAN membuat token baru.
  Biarkan nilainya, lalu laporkan di akhir pekerjaan.
- Beri komentar CSS yang menjelaskan bagian tampilan apa.
- Setelah selesai, jalankan npm run lint dan npm run build lalu laporkan hasilnya.

## Font
- Poppins dimuat lewat @font-face lokal di globals.css (file di public/fonts).
  Jangan menambah @import Google Fonts atau @font-face baru di file lain.

## Pengecualian (jangan dikerjakan tanpa perintah)
- Jangan hapus atau ubah blok .parent-* di student.css (sekitar baris 9312-9336).
- Jangan menghapus selector yang tampak tidak terpakai; cukup laporkan.

<!-- END:nextjs-agent-rules -->
