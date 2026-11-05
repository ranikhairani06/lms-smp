"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main style={{ maxWidth: 640, margin: "80px auto", padding: 24 }}>
    <h1>Halaman belum dapat dimuat</h1>
    <p>Koneksi ke layanan sedang bermasalah. Silakan coba lagi dalam beberapa saat.</p>
    <button type="button" onClick={reset}>Coba lagi</button>
    <p><a href="/login">Kembali ke login</a></p>
  </main>;
}
