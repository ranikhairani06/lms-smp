"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Button, Field, InfoBanner, Modal, PageHeading, Pagination, SearchField, TableEmpty, adminStyles as s } from "@/app/admin/_components/AdminUI";
import { ErrorState, LoadingState } from "@/components/lms/state";
import { useAdminMutation, useAdminResource } from "@/app/admin/_components/useAdminApi";

type Subject = { id: number; code: string; name: string };

export default function MataPelajaranPage() {
  const resource = useAdminResource<Subject[]>("subjects");
  const [notice, setNotice] = useState("");
  const [keyword, setKeyword] = useState("");
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [selected, setSelected] = useState<Subject | null>(null);
  const [deleteSelected, setDeleteSelected] = useState<Subject | null>(null);
  const [form, setForm] = useState({ code: "", name: "" });
  const [page, setPage] = useState(1);
  const refresh = async () => { await resource.reload(); };
  const closeForm = () => { setModal(null); setSelected(null); };
  const create = useAdminMutation("POST", "subjects", async () => { setNotice("Mata pelajaran berhasil ditambahkan."); closeForm(); await refresh(); }, refresh);
  const update = useAdminMutation("PUT", `subjects/${selected?.id ?? 0}`, async () => { setNotice("Mata pelajaran berhasil diperbarui."); closeForm(); await refresh(); }, refresh);
  const remove = useAdminMutation("DELETE", `subjects/${deleteSelected?.id ?? 0}`, async () => { setNotice("Mata pelajaran berhasil dihapus."); setDeleteSelected(null); await refresh(); }, refresh);
  const filtered = useMemo(() => (resource.data ?? []).filter((subject) => `${subject.code} ${subject.name}`.toLowerCase().includes(keyword.toLowerCase())), [resource.data, keyword]);
  const pageRows = filtered.slice((page - 1) * 10, page * 10);
  const openForm = (subject?: Subject) => {
    setSelected(subject ?? null);
    setForm(subject ? { code: subject.code, name: subject.name } : { code: "", name: "" });
    setNotice("");
    setModal(subject ? "edit" : "add");
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = { code: form.code.trim(), name: form.name.trim() };
    const result = modal === "edit" ? await update.run(payload) : await create.run(payload);
    if (!result) setNotice(modal === "edit" ? update.error ?? "Mata pelajaran belum dapat disimpan." : create.error ?? "Mata pelajaran belum dapat disimpan.");
  };

  return <>
    <PageHeading breadcrumbs={["LMS", "Master Data", "Mata Pelajaran"]} title="Mata Pelajaran" description="Kelola kode dan nama mata pelajaran."
      actions={<Button icon="add-circle-linear" onClick={() => openForm()}>Tambah Mata Pelajaran</Button>} />
    {notice && <InfoBanner tone={create.error || update.error || remove.error ? "danger" : "success"}>{notice}</InfoBanner>}
    {resource.loading && <LoadingState title="Memuat mata pelajaran..." />}
    {resource.error && <ErrorState title={resource.error} action={<Button variant="outline" onClick={() => void refresh()}>Coba Lagi</Button>} />}
    <div className={s.panel}>
      <div className={s.toolbar}><SearchField value={keyword} onChange={(value) => { setKeyword(value); setPage(1); }} placeholder="Cari kode atau nama mata pelajaran..." /><div className={s.toolbarSpacer} /></div>
      <div className={s.tableWrap}><table className={s.dataTable}>
        <thead><tr><th>Kode</th><th>Nama Mata Pelajaran</th><th>Aksi</th></tr></thead>
        <tbody>{pageRows.map((subject) => <tr key={subject.id}>
          <td><span className={s.tableStrong}>{subject.code}</span></td><td>{subject.name}</td>
          <td><div className={s.tableActions}><Button variant="ghost" onClick={() => openForm(subject)}>Edit</Button><Button variant="danger" disabled={remove.loading} onClick={() => { setNotice(""); setDeleteSelected(subject); }}>Hapus</Button></div></td>
        </tr>)}{filtered.length === 0 && <TableEmpty colSpan={3} label={resource.empty ? "Belum ada mata pelajaran." : undefined} />}</tbody>
      </table></div>
      <Pagination current={page} total={Math.max(1, Math.ceil(filtered.length / 10))} onChange={setPage} label={`Menampilkan ${filtered.length ? (page - 1) * 10 + 1 : 0}-${Math.min(page * 10, filtered.length)} dari ${filtered.length} mata pelajaran`} />
    </div>

    {modal && <Modal title={modal === "add" ? "Tambah Mata Pelajaran" : "Edit Mata Pelajaran"} subtitle="Masukkan kode dan nama mata pelajaran." onClose={closeForm} footer={<><Button variant="outline" disabled={create.loading || update.loading} onClick={closeForm}>Batal</Button><Button type="submit" form="subject-form" disabled={create.loading || update.loading}>{create.loading || update.loading ? "Menyimpan..." : "Simpan"}</Button></>}>
      <form id="subject-form" onSubmit={submit}>
        <Field label="Kode" value={form.code} onChange={(value) => setForm((current) => ({ ...current, code: value }))} maxLength={50} required error={create.fieldErrors.code?.[0] ?? update.fieldErrors.code?.[0]} />
        <Field label="Nama Mata Pelajaran" value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} maxLength={255} required error={create.fieldErrors.name?.[0] ?? update.fieldErrors.name?.[0]} />
        {(create.error || update.error) && <InfoBanner tone="danger">{create.error ?? update.error}</InfoBanner>}
      </form>
    </Modal>}
    {deleteSelected && <Modal title="Hapus mata pelajaran?" subtitle={deleteSelected.name} onClose={() => { if (!remove.loading) setDeleteSelected(null); }} footer={<><Button variant="outline" disabled={remove.loading} onClick={() => setDeleteSelected(null)}>Batal</Button><Button variant="danger" disabled={remove.loading} onClick={() => { void remove.run(); }}>{remove.loading ? "Menghapus..." : "Ya, Hapus"}</Button></>}>
      <p className={s.pageDescription}>Mata pelajaran <strong>{deleteSelected.name}</strong> akan dihapus.</p>
      {remove.error && <InfoBanner tone="danger">{remove.error}</InfoBanner>}
    </Modal>}
  </>;
}
