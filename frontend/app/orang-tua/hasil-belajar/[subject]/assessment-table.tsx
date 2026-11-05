"use client";

import { useState } from "react";
import { ParentCard } from "../../parent-components";

type Row = { name: string; category: string; date: string; score: number; status: string };

export default function AssessmentTable({ rows }: { rows: Row[] }) {
  const [status, setStatus] = useState("all");
  const filtered = rows.filter((row) => status === "all" || row.status === status);
  return <ParentCard className="parent-component-card">
    <div className="parent-section-title parent-results-heading"><h2>Kumpulan Nilai Hasil Belajar</h2><label className="parent-status-filter"><span className="parent-sr-only">Filter status penilaian</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Semua Status</option><option value="Selesai">Selesai</option><option value="Belum dinilai">Belum dinilai</option></select></label></div>
    <div className="parent-table-wrap" tabIndex={0} role="region" aria-label="Rincian nilai asesmen"><table className="parent-component-table">
      <thead><tr><th>No</th><th>Nama Asesmen / Materi</th><th>Jenis</th><th>Tanggal</th><th>Nilai</th><th>Status</th></tr></thead>
      <tbody>{filtered.map((row, index) => <tr key={row.name}><td>{index + 1}</td><td><strong>{row.name}</strong></td><td><span className={"parent-category is-" + (row.category === "Tugas" ? "task" : row.category === "UTS" ? "exam" : "quiz")}>{row.category}</span></td><td>{row.date}</td><td><strong>{row.score}</strong></td><td><span className="parent-status is-done">{row.status}</span></td></tr>)}{!filtered.length && <tr><td colSpan={6} className="parent-empty-state">Tidak ada asesmen dengan status ini.</td></tr>}</tbody>
    </table></div>
  </ParentCard>;
}
