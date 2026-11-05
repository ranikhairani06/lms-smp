export const subjects = [
  { id: "informatika-8", code: "INF-08", name: "Informatika Kelas VIII", description: "Sistem Komputer, Algoritma Pemrograman & Analisis Data", classes: ["8A", "8B", "8C"], students: 98, sessions: 3, progress: 68, target: 75 },
  { id: "informatika-7", code: "INF-07", name: "Informatika Kelas VII", description: "Berpikir Komputasional, Perangkat TIK & Jaringan Dasar", classes: ["7A", "7B"], students: 70, sessions: 2, progress: 55, target: 75 },
  { id: "informatika-9", code: "INF-09", name: "Informatika & Literasi Digital Kelas IX", description: "Kecerdasan Buatan Dasar, Keamanan Siber & Dampak Sosial TIK", classes: ["9A", "9B"], students: 66, sessions: 2, progress: 42, target: 78 },
  { id: "matematika-7", code: "MK-07", name: "Matematika Kelas VII", description: "Bilangan Bulat, Aljabar Sederhana & Geometri Pengukuran", classes: ["7C"], students: 34, sessions: 2, progress: 75, target: 75 },
];
export type Subject = typeof subjects[number];
export const students = [
  { id: "0098421001", name: "Siti Rahma", gender: "P", group: "8A", scores: [95, 92, 98, 94, 96], progress: 90, tasks: 4, activity: "Hari ini, 09:42" },
  { id: "0098421008", name: "Andi Pratama", gender: "L", group: "8A", scores: [88, 84, 90, 85, 86], progress: 80, tasks: 3, activity: "Hari ini, 08:15" },
  { id: "0098421015", name: "Budi Santoso", gender: "L", group: "8A", scores: [82, 80, 80, 84, 82], progress: 60, tasks: 2, activity: "Kemarin, 14:20" },
  { id: "0098421021", name: "Dinda Kirana", gender: "P", group: "8B", scores: [78, 78, 82, 76, 75], progress: 50, tasks: 1, activity: "2 hari lalu" },
  { id: "0098421025", name: "Danu Wijaya", gender: "L", group: "8B", scores: [76, 70, 74, 78, 72], progress: 30, tasks: 1, activity: "4 hari lalu" },
  { id: "0098421033", name: "Gilang Ramadhan", gender: "L", group: "8C", scores: [64, 68, 70, 65, 60], progress: 10, tasks: 0, activity: "1 minggu lalu" },
];
export const materials = [
  { id: "bab-4", title: "Bab 4: Perangkat Keras Jaringan & Subnetting", description: "Topologi LAN, IP addressing v4 kelas C, dan switch-router dasar", file: "PDF (4.2 MB)", date: "18 Okt 2026", progress: 94, status: "Diterbitkan" },
  { id: "bab-5", title: "Bab 5: Pengantar Logika Percabangan", description: "Logika IF-THEN-ELSE, operator relasional, dan flowchart dasar", file: "DOCX (1.8 MB)", date: "22 Okt 2026", progress: 0, status: "Draf" },
  { id: "bab-1", title: "Bab 1: Dekomposisi & Pengenalan Pola", description: "Strategi algoritma dan abstraksi data", file: "PDF (3.5 MB)", date: "22 Jul 2026", progress: 98, status: "Diterbitkan" },
  { id: "bab-2", title: "Bab 2: Integrasi Aplikasi Perkantoran", description: "Spreadsheet, dokumen laporan, dan surat massal", file: "PDF (5.1 MB)", date: "15 Agu 2026", progress: 92, status: "Diterbitkan" },
  { id: "bab-3", title: "Bab 3: Sistem Komputer & Mekanisme OS", description: "Interaksi ALU, register, memori, dan manajemen proses", file: "PDF (2.9 MB)", date: "05 Sep 2026", progress: 89, status: "Diterbitkan" },
  { id: "bab-6", title: "Bab 6: Praktik Pemrograman", description: "Penyusunan proyek program sederhana", file: "Belum ada berkas", date: "23 Okt 2026", progress: 0, status: "Draf" },
];
export const classGroups = ["8A", "8B", "8C", "7A", "7B", "9A", "9B", "7C"];
export const taskTitle = "Tugas 01: Analisis Topologi Jaringan Komputer & Skema LAN";
export const subjectUrl = (id = "informatika-8") => `/guru/mata-pelajaran/${id}`;
export const classUrl = (id = "8A") => `/guru/kelas/${id.toLowerCase()}`;
export const mean = (values: number[]) => values.reduce((sum, score) => sum + score, 0) / values.length;
export const finalScore = (scores: number[]) => mean(scores.slice(0, 4)) * .6 + scores[4] * .4;
export function exportCsv(name: string, rows: (string | number)[][]) {
  const safe = (value: string | number) => {
    const text = String(value);
    return '"' + (/^[=+@\-]/.test(text) ? "'" + text : text).replaceAll('"', '""') + '"';
  };
  const blob = new Blob(["\uFEFF" + rows.map(row => row.map(safe).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a"); anchor.href = url; anchor.download = name + ".csv";
  document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
