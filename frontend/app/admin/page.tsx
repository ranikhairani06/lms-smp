"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AdminIcon from "@/app/admin/_components/AdminIcons";
import { Button, PageHeading, Panel, SearchField, StatCard, adminStyles as s } from "@/app/admin/_components/AdminUI";

const classes = [
  { code: "7A", name: "Kelas 7A", wali: "Joko Susilo, S.Pd.", count: 34 },
  { code: "7B", name: "Kelas 7B", wali: "Sri Wahyuni, M.Pd.", count: 33 },
  { code: "8A", name: "Kelas 8A", wali: "Hendra Gunawan, S.Kom.", count: 34 },
  { code: "8B", name: "Kelas 8B", wali: "Rina Marlina, M.Pd.", count: 32 },
  { code: "9A", name: "Kelas 9A", wali: "Ahmad Fauzi, M.Pd.", count: 35 },
];

export default function AdminDashboardPage() {
  const [keyword, setKeyword] = useState("");
  const [level, setLevel] = useState("Semua");
  const visibleClasses = useMemo(() => classes.filter((item) => {
    const matchText = `${item.name} ${item.wali}`.toLowerCase().includes(keyword.toLowerCase());
    const matchLevel = level === "Semua" || item.code.startsWith(level.replace("Kls ", ""));
    return matchText && matchLevel;
  }), [keyword, level]);

  return (
    <>
      <PageHeading breadcrumbs={["LMS", "Dashboard"]} title="Dashboard Administrator" description="Ringkasan operasional dan data master SMP Terpadu" />
      {/* Bagian tampilan: empat kartu total pengguna, guru, siswa, dan wali murid. */}
      <div className={`${s.statGridFour} ${s.dashboardStats}`}>
        <StatCard label="Total Users" value="1.248" detail=" " icon="users-group-rounded-linear" tone="primary" />
        <StatCard label="Total Guru" value="58 Guru" detail="54 aktif mengajar" icon="user-id-linear" tone="success" />
        <StatCard label="Total Siswa" value="860 Siswa" detail="24 rombel kelas 7, 8, 9" icon="square-academic-cap-linear" tone="warning" />
        <StatCard label="Total Wali Murid" value="782 Wali" detail="Terhubung ke akun siswa" icon="users-group-rounded-linear" tone="info" />
      </div>

      {/* Bagian tampilan: ringkasan kelas aktif dan panel data yang perlu ditindaklanjuti. */}
      <div className={s.dashboardColumns}>
        <Panel>
          <div className={s.panelTitle}><h2>Ringkasan Kelas Aktif</h2></div>
          <div className={`${s.toolbar} ${s.dashboardToolbar}`}>
            <SearchField value={keyword} onChange={setKeyword} placeholder="Cari kelas atau wali kelas..." />
            <div className={s.toolbarSpacer} />
            <div className={s.tabs}>
              {["Semua", "Kls 7", "Kls 8", "Kls 9"].map((item) => <button key={item} aria-pressed={level === item} onClick={() => setLevel(item)}>{item}</button>)}
            </div>
          </div>
          <div className={s.classList}>
            {visibleClasses.map((item) => (
              <div className={s.classItem} key={item.code}>
                <span className={s.classCode}>{item.code}</span>
                <div className={s.classMeta}><strong>{item.name}</strong><small>Wali: {item.wali}</small></div>
                <span className={s.classCount}>{item.count} Siswa</span>
                <Link href="/admin/master-data/rombel" className={s.textLink}>Rincian <AdminIcon name="arrow-right-linear" size={13} /></Link>
              </div>
            ))}
            {visibleClasses.length === 0 && <p className={s.emptyCell}>Kelas tidak ditemukan.</p>}
          </div>
          <div className={s.pagination}><span>Menampilkan {visibleClasses.length} dari 24 Rombongan Belajar SMP</span><Link href="/admin/master-data/rombel" className={s.textLink}>Lihat Seluruh Rombel <AdminIcon name="arrow-right-linear" size={13} /></Link></div>
        </Panel>

        <div>
          <Panel>
            <div className={s.panelTitle}><div><h2>Data yang Perlu Ditindaklanjuti</h2><p>Penyimpangan data &amp; validasi administratif</p></div></div>
            <div className={`${s.attentionItem} ${s.attentionWarning}`}>
              <span className={s.attentionIcon}><AdminIcon name="danger-triangle-linear" size={19} color="#B87D0E" /></span>
              <div className={s.attentionText}><strong>8 data siswa belum terverifikasi</strong><small>NISN dan identitas siswa perlu divalidasi.</small></div>
              <Link href="/admin/pengguna/siswa" className={s.attentionButton}>Tinjau</Link>
            </div>
            <div className={`${s.attentionItem} ${s.attentionDanger}`}>
              <span className={s.attentionIcon}><AdminIcon name="users-group-rounded-linear" size={19} color="#E03131" /></span>
              <div className={s.attentionText}><strong>2 rombel melebihi kapasitas</strong><small>Rombel 9C &amp; 9D terisi lebih dari 36 siswa</small></div>
              <Link href="/admin/master-data/rombel" className={s.attentionButton} style={{ background: "var(--color-error)" }}>Lihat</Link>
            </div>
            <div className={s.pagination}><span /> <Link href="/admin/laporan/aktivitas" className={s.textLink}>Buka Riwayat Lengkap <AdminIcon name="arrow-right-linear" size={13} /></Link></div>
          </Panel>
          <Panel>
            <div className={s.panelTitle}><div><h2>Distribusi Akun per Peran</h2><p>Total 1.549 akun terdaftar dalam sistem</p></div></div>
            <div className={s.distributionBar}><span /><span /><span /><span /></div>
            <div className={s.distributionGrid}>
              <div className={s.distributionTile}><small><span>● Siswa</span><b>55.5%</b></small><strong>860</strong></div>
              <div className={s.distributionTile}><small><span>● Orang Tua</span><b>41.3%</b></small><strong>640</strong></div>
              <div className={s.distributionTile}><small><span>● Guru</span><b>3.0%</b></small><strong>46</strong></div>
              <div className={s.distributionTile}><small><span>● Admin</span><b>0.2%</b></small><strong>3</strong></div>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
