"use client";
import { Children, cloneElement, isValidElement, useId, useState, useRef, type FormEvent, type ReactNode, type ReactElement } from "react";
import { Action, Badge, Button, Card, Heading, Notice } from "./ui";
import { Solar } from "../../siswa/_components/icon";
import { subjectUrl, type Subject } from "./data";
import { type AssessmentKind, type SavedMaterial, type SavedAssessment, type Question } from "./store";
import { useTeacherCourse, useTeacherMutation } from "./useTeacherApi";
import { assessmentTypeForUiLabel, ensureTeacherCourseSection, fieldErrorMessage, gradeFromSubject, type TeacherSection } from "./teacher-api";
import { ApiError, apiRequest } from "@/lib/api";
import { isAllowedUploadExtension, MAX_UPLOAD_FILE_SIZE_BYTES, MAX_UPLOAD_FILE_SIZE_LABEL, uploadAccept, uploadExtensionsLabel, uploadFileExtension } from "@/lib/uploadLimits";
import { useRouter } from "next/navigation";

function Field({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  return <div className="tg-field"><label htmlFor={id}>{label}</label>{Children.map(children, child => isValidElement(child) && ["input", "textarea", "select"].includes(String(child.type)) ? cloneElement(child as ReactElement<{ id: string }>, { id }) : child)}</div>;
}
// TODO-DATA: lokasi ruang kelas meniru sampel Figma karena model rombel belum membawa nama ruang.
function Targets({ subject, selected, change, description = "Alokasikan materi ke kelas binaan", className = "", summaryLabel, shuffle = false, showSelectAll = true, compactLabels = false }: { subject: Subject; selected: string[]; change: (value: string[]) => void; description?: string; className?: string; summaryLabel?: string; shuffle?: boolean; showSelectAll?: boolean; compactLabels?: boolean }) { const studentCount = subject.classes.length ? selected.reduce((sum, group) => sum + (subject.classes.indexOf(group) === 0 ? 34 : 32), 0) : null; return <Card className={className} title="Target Rombongan Belajar" description={description} action={showSelectAll ? <Button type="button" tone="ghost" onClick={() => change(selected.length === subject.classes.length ? [] : subject.classes)}>Pilih Semua</Button> : undefined}><div className="tg-stack">{subject.classes.map((group, index) => <label className="tg-check-row" key={group}><input type="checkbox" checked={selected.includes(group)} onChange={event => change(event.target.checked ? [...selected, group] : selected.filter(value => value !== group))} /><span><strong>Kelas {group}{compactLabels ? "" : " (Reguler)"}</strong><small style={{ display: "block" }}>{compactLabels ? (index === 2 ? "Ruang Multimedia" : `Ruang Lab Komputer ${index + 1}`) : `Lab Komputer ${index + 1}`}</small></span><Badge>{index === 0 ? 34 : 32} Siswa</Badge></label>)}{summaryLabel ? <div className="tg-assessment-target-total"><span><Solar name="users-group-rounded" />{summaryLabel}</span><strong>{studentCount ?? "—"} Siswa</strong></div> : <Notice>{selected.length} rombongan belajar terpilih</Notice>}{shuffle && <div className="tg-assessment-toggle-row tg-assessment-shuffle"><span><strong>Acak nomor urut soal per siswa</strong></span><span className="tg-assessment-switch" aria-hidden="true" /></div>}</div></Card>; }
export function MaterialEditor({ subject, editId }: { subject: Subject; editId?: string }) {
  const router = useRouter();
  const courseState = useTeacherCourse(subject); const sections = (courseState.course?.sections || []) as TeacherSection[];
  const createMaterial = useTeacherMutation("POST", "sections/0/materials", async () => { await courseState.reload(); }, async () => { await courseState.reload(); });
  const currentId = editId || "new"; const [modified, setModified] = useState<SavedMaterial | null>(null); const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [preview, setPreview] = useState(false); const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const targetSubject = { ...subject, classes: [] };
  const apiMaterial = sections.flatMap(item => item.materials || []).find(item => String(item.id) === editId);
  const initial: SavedMaterial = { id: currentId, subject: subject.id, title: apiMaterial?.title || "", description: "", topic: "", content: apiMaterial?.body || "", targets: [], files: apiMaterial?.file_path ? [apiMaterial.file_path] : [], status: "—" };
  const form = modified || initial;
  const submitError = error || fieldErrorMessage(createMaterial.fieldErrors) || createMaterial.error || "";
  const change = (values: Partial<SavedMaterial>) => { setModified({ ...form, ...values }); setMessage(""); };
  function persist() {
    setError(""); setMessage("");
    if (editId) { setError("Perubahan materi tidak dapat disimpan karena API belum menyediakan endpoint edit materi."); return; }
    if (!form.title.trim()) { setError("Judul materi wajib diisi."); return; }
    const targetGrade = gradeFromSubject(subject);
    if (!targetGrade) { setError("Tingkat kelas materi tidak dapat ditentukan dari mata pelajaran ini."); return; }
    if (sections.length > 1) { setError("Materi tidak dapat disimpan karena course memiliki lebih dari satu bagian."); return; }
    if (!courseState.course) { setError(courseState.error || "Course belum tersedia untuk menyimpan materi."); return; }
    const extension = selectedFile ? uploadFileExtension(selectedFile.name) : "";
    const fileTypes: Record<string, string> = { jpg: "file", jpeg: "file", png: "file", gif: "file", webp: "file", pdf: "pdf", mp3: "audio", wav: "audio", m4a: "audio", aac: "audio", ogg: "audio", mp4: "video", mov: "video", avi: "video", webm: "video", mkv: "video" };
    if (selectedFile && (!isAllowedUploadExtension(selectedFile.name, "teacherMaterial") || selectedFile.size > MAX_UPLOAD_FILE_SIZE_BYTES)) { setError(`Pilih berkas materi yang diizinkan dengan ukuran maksimal ${MAX_UPLOAD_FILE_SIZE_LABEL}.`); return; }
    const formData = new FormData();
    formData.set("title", form.title.trim());
    formData.set("type", selectedFile ? fileTypes[extension] : "text");
    formData.set("target_grade", String(targetGrade));
    if (form.content.trim()) formData.set("body", form.content);
    if (selectedFile) formData.set("file", selectedFile);
    void (async () => {
      try {
        const sectionId = await ensureTeacherCourseSection(courseState.course!.id, courseState.course!.name, sections);
        const result = await createMaterial.run(formData, `sections/${sectionId}/materials`);
        if (!result) return;
        setMessage("Materi berhasil disimpan.");
        setSelectedFile(null);
      } catch (cause) {
        if (cause instanceof ApiError && cause.status === 401) router.replace("/login?role=teacher&reason=session-expired");
        if (cause instanceof ApiError && cause.status === 404) await courseState.reload();
        setError(cause instanceof ApiError && Object.keys(cause.fieldErrors).length ? fieldErrorMessage(cause.fieldErrors) : cause instanceof Error ? cause.message : "Materi belum dapat disimpan.");
      }
    })();
  }
  function addFiles(files: File[]) { if (files.length > 1) { setError("API hanya menerima satu berkas materi per permintaan."); return; } const file = files[0]; if (!file) return; if (!isAllowedUploadExtension(file.name, "teacherMaterial") || file.size > MAX_UPLOAD_FILE_SIZE_BYTES) { setError(`Pilih berkas materi yang diizinkan dengan ukuran maksimal ${MAX_UPLOAD_FILE_SIZE_LABEL}.`); return; } setError(""); setSelectedFile(file); change({ files: [file.name] }); }
  return <><Heading title={editId ? "Edit Materi Pembelajaran" : "Publikasikan Materi Pembelajaran"} description="Susun materi ajar digital, lampiran pendukung, dan sasaran rombongan belajar." /><form className="tg-stack" onSubmit={(event: FormEvent) => { event.preventDefault(); persist(); }}><div className="tg-columns"><div className="tg-stack"><Card title="Informasi Dasar Materi" description="Identitas modul dan pemetaan capaian kurikulum"><div className="tg-stack"><Field label="Judul Materi Pembelajaran *"><input required maxLength={120} value={form.title} onChange={event => change({ title: event.target.value })} placeholder="Contoh: Pengantar Logika Percabangan & Flowchart" /></Field><div className="tg-form-grid"><Field label="Topik Pembelajaran"><select value={form.topic} onChange={event => change({ topic: event.target.value })}>{["Algoritma & Pemrograman", "Jaringan Komputer", "Sistem Komputer", "Berpikir Komputasional"].map(item => <option key={item}>{item}</option>)}</select></Field><Field label="Mata Pelajaran"><div className="tg-readonly">{courseState.course?.name || "—"}</div></Field></div><div><h3>Capaian Pembelajaran (CP)</h3><div className="tg-subcard tg-soft"><Badge>—</Badge><p className="tg-small">—</p><Badge>—</Badge><p className="tg-small">—</p></div></div><Field label="Deskripsi Singkat Pengantar *"><textarea required maxLength={300} value={form.description} onChange={event => change({ description: event.target.value })} /><small>{form.description.length} / 300 karakter</small></Field></div></Card><Card title="Isi Konten Pembelajaran" description="Susun penjelasan materi dan contoh kode" action={<Button type="button" tone="outline" onClick={() => setPreview(!preview)}>{preview ? "Edit Teks" : "Pratinjau"}</Button>}>{preview ? <article className="tg-document" style={{ whiteSpace: "pre-wrap" }}>{form.content || "Konten materi belum ditulis."}</article> : <Field label="Konten materi *"><textarea className="tg-editor" required value={form.content} onChange={event => change({ content: event.target.value })} placeholder="Tuliskan penjelasan materi di sini..." /></Field>}<p className="tg-small tg-divider">Total kata: {form.content.trim() ? form.content.trim().split(/\s+/).length : 0} · Karakter: {form.content.length}</p></Card></div><aside className="tg-stack"><Targets subject={targetSubject} selected={form.targets} change={targets => change({ targets })} /><Card title="Lampiran Berkas Pendukung" description="Bahan ajar, LKPD, atau panduan praktikum"><div className="tg-dropzone" onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); addFiles([...event.dataTransfer.files]); }}><strong>Tarik berkas ke sini atau telusuri</strong><label className="tg-button tg-button-outline tg-file-picker">Telusuri Berkas<input aria-label="Pilih lampiran materi" type="file" multiple accept={uploadAccept("teacherMaterial")} onChange={event => { addFiles([...(event.target.files || [])]); event.target.value = ""; }} /></label><small>{`Format: ${uploadExtensionsLabel("teacherMaterial")} · Maks. ${MAX_UPLOAD_FILE_SIZE_LABEL}`}</small></div><div className="tg-stack tg-divider">{form.files.map(file => <div className="tg-between" key={file}><span className="tg-small" style={{ overflowWrap: "anywhere" }}>{file}</span><Button type="button" tone="ghost" onClick={() => { setSelectedFile(null); change({ files: form.files.filter(value => value !== file) }); }} aria-label={`Hapus ${file}`}>Hapus</Button></div>)}<p className="tg-small">Pratinjau menyimpan nama lampiran. Berkas belum diunggah ke server.</p></div></Card></aside></div>{submitError && <div role="alert"><Notice tone="error">{submitError}</Notice></div>}{message && <div role="status"><Notice tone="success">{message}</Notice></div>}<div className="tg-form-actions"><Action href={`${subjectUrl(subject.id)}/materi`} secondary>← Kembali ke Materi</Action><div className="tg-actions"><Button type="button" tone="outline" onClick={() => persist()}>Simpan sebagai Draf</Button><Button type="submit">Publikasikan Sekarang</Button></div></div></form></>;
}
function assessmentDateLabel(value: string, includeYear = false) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "short", ...(includeYear ? { year: "numeric" } : {}) }).format(new Date(year, month - 1, day));
}
export function AssessmentEditor({ subject, editId, kind = "kuis" }: { subject: Subject; editId?: string; kind?: AssessmentKind }) {
  const router = useRouter(); const [currentId, setCurrentId] = useState(editId || "new"); const [modified, setModified] = useState<SavedAssessment | null>(null); const [message, setMessage] = useState(""); const [error, setError] = useState("");
  const courseState = useTeacherCourse(subject); const sections = (courseState.course?.sections || []) as TeacherSection[];
  const createAssessment = useTeacherMutation("POST", "sections/0/assessments", async () => { await courseState.reload(); }, async () => { await courseState.reload(); });
  const submitError = error || fieldErrorMessage(createAssessment.fieldErrors) || createAssessment.error || "";
  const pendingAssessmentId = useRef<number | null>(null); const sentQuestions = useRef<Set<number>>(new Set()); const creationComplete = useRef(false); const creationInFlight = useRef(false);
  const apiAssessment = sections.flatMap(item => item.assessments || []).find(item => String(item.id) === editId);
  const formKind = editId ? apiAssessment?.assessment_type === "practice" ? "kuis" : "tugas" : kind;
  const editing = Boolean(editId);
  const toLocalDateTime = (value?: string | null) => value ? new Date(new Date(value).getTime() - new Date(value).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "";
  const apiQuestions: Question[] = (apiAssessment?.questions || []).map(question => ({ id: question.id, type: question.type === "multiple_choice" ? "Pilihan Ganda" : question.type === "true_false" ? "Benar / Salah" : question.type === "file_upload" ? "Unggah Portofolio" : "Uraian", text: question.prompt, weight: question.points, options: (question.options || []).map(option => option.text), answer: String((question.options || []).findIndex(option => option.text === question.correct_answer)) }));
  const initial: SavedAssessment = { id: currentId, subject: subject.id, title: apiAssessment?.title || "", type: formKind === "tugas" ? "Tugas" : "Kuis", kind: formKind, instructions: apiAssessment?.description || "", targets: [], start: toLocalDateTime(apiAssessment?.start_at), end: toLocalDateTime(apiAssessment?.end_at), questions: apiQuestions, status: apiAssessment?.is_published ? "Diterbitkan" : "Draf" };
  const form = modified || initial;
  const targetSubject = { ...subject, classes: [] };
  const [startDate, startTime = "08:00"] = form.start.split("T");
  const [endDate, endTime = "23:59"] = form.end.split("T");
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
  const [draggedQuestionId, setDraggedQuestionId] = useState<number | null>(null);
  const [dropTargetQuestionId, setDropTargetQuestionId] = useState<number | null>(null);
  const [previousQuestionOrderIds, setPreviousQuestionOrderIds] = useState<number[] | null>(null);
  const [reorderMessage, setReorderMessage] = useState<string | null>(null);
  const change = (values: Partial<SavedAssessment>) => { setModified({ ...form, ...values }); setMessage(""); };
  const updateQuestion = (id: number, values: Partial<Question>) => change({ questions: form.questions.map(question => question.id === id ? { ...question, ...values } : question) });
  function moveQuestion(draggedId: number, targetId: number | null) {
    const fromIndex = form.questions.findIndex(question => question.id === draggedId);
    if (fromIndex < 0 || draggedId === targetId) return;
    const nextQuestions = [...form.questions];
    const [draggedQuestion] = nextQuestions.splice(fromIndex, 1);
    const targetIndex = targetId === null ? nextQuestions.length : nextQuestions.findIndex(question => question.id === targetId);
    if (targetIndex < 0) return;
    nextQuestions.splice(targetIndex, 0, draggedQuestion);
    if (nextQuestions.every((question, index) => question.id === form.questions[index]?.id)) return;
    setPreviousQuestionOrderIds(form.questions.map(question => question.id));
    const draggedLabel = String(draggedId).padStart(2, "0");
    const message = targetId === null ? `Soal ${draggedLabel} dipindahkan ke akhir` : `Soal ${draggedLabel} dipindahkan sebelum soal ${String(targetId).padStart(2, "0")}`;
    setReorderMessage(message);
    change({ questions: nextQuestions });
  }
  function undoQuestionReorder() {
    if (!previousQuestionOrderIds) return;
    const order = new Map(previousQuestionOrderIds.map((id, index) => [id, index]));
    change({ questions: [...form.questions].sort((a, b) => (order.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (order.get(b.id) ?? Number.MAX_SAFE_INTEGER)) });
    setPreviousQuestionOrderIds(null);
    setReorderMessage(null);
  }
  const total = form.questions.reduce((sum, question) => sum + question.weight, 0);
  const questionGroups = ["Pilihan Ganda", "Benar / Salah", "Uraian", "Unggah Portofolio"].map(type => {
    const questions = form.questions.filter(question => question.type === type);
    return { type, count: questions.length, weight: questions.reduce((sum, question) => sum + question.weight, 0) };
  }).filter(group => group.count > 0);
  function persist(publish: boolean) {
    setError(""); setMessage("");
    if (editing) { setError("Perubahan asesmen tidak dapat disimpan karena API belum menyediakan endpoint edit asesmen."); return; }
    if (!form.title.trim()) { setError("Judul asesmen wajib diisi."); return; }
    if (form.questions.some(question => !question.text.trim() || question.weight <= 0 || (["Pilihan Ganda", "Benar / Salah"].includes(question.type) && (question.options.some(option => !option.trim()) || question.answer === "")))) { setError("Lengkapi pertanyaan dan pilihan jawaban sebelum menyimpan."); return; }
    if (publish && (total !== 100 || !form.questions.length || !form.instructions.trim())) { setError("Lengkapi instruksi dan soal, serta pastikan total bobot tepat 100 poin."); return; }
    if (publish && (!form.start || !form.end || form.end <= form.start)) { setError("Batas akhir harus setelah tanggal mulai pengerjaan."); return; }
    const assessmentType = assessmentTypeForUiLabel(form.type);
    if (!assessmentType) { setError("Jenis asesmen ini belum memiliki padanan pada API."); return; }
    if (sections.length > 1) { setError("Asesmen tidak dapat disimpan karena course memiliki lebih dari satu bagian."); return; }
    if (!courseState.course) { setError(courseState.error || "Course belum tersedia untuk menyimpan asesmen."); return; }
    const targetGrade = gradeFromSubject(subject);
    if (!targetGrade) { setError("Tingkat kelas asesmen tidak dapat ditentukan dari mata pelajaran ini."); return; }
    if (!form.end || new Date(form.end).getTime() <= Date.now()) { setError("Batas akhir asesmen harus berada setelah waktu sekarang."); return; }
    if (creationComplete.current) { setMessage("Asesmen dan seluruh soal berhasil disimpan."); return; }
    if (creationInFlight.current) return;
    creationInFlight.current = true;
    void (async () => {
      try {
      let assessmentId = pendingAssessmentId.current;
      if (!assessmentId) {
        const sectionId = await ensureTeacherCourseSection(courseState.course!.id, courseState.course!.name, sections);
        const assessmentResult = await createAssessment.run({
          title: form.title.trim(),
          assessment_type: assessmentType,
          target_grade: targetGrade,
          is_published: publish,
          duration_minutes: 60,
          end_at: new Date(form.end).toISOString(),
          start_at: form.start ? new Date(form.start).toISOString() : undefined,
          description: form.instructions,
          maximum_attempt: 1,
        }, `sections/${sectionId}/assessments`) as { data?: { id?: number } } | undefined;
        if (!assessmentResult?.data?.id) { setError(""); return; }
        assessmentId = assessmentResult.data.id;
        pendingAssessmentId.current = assessmentId;
        setCurrentId(String(assessmentId));
      }
      for (const question of form.questions) {
        if (sentQuestions.current.has(question.id)) continue;
        const type = question.type === "Pilihan Ganda" ? "multiple_choice" : question.type === "Benar / Salah" ? "true_false" : question.type === "Uraian" ? "essay" : question.type === "Unggah Portofolio" ? "file_upload" : null;
        if (!type) { setError(`Jenis soal ${question.type} tidak didukung API.`); return; }
        const selectedIndex = Number(question.answer);
        const options = ["Pilihan Ganda", "Benar / Salah"].includes(question.type)
          ? question.options.map((text, index) => ({ text, is_correct: index === selectedIndex }))
          : undefined;
        const correctAnswer = question.type === "Benar / Salah"
          ? question.answer === "0"
          : question.type === "Pilihan Ganda" ? question.options[selectedIndex] : undefined;
        let result: { data?: unknown } | undefined;
        try {
          result = await apiRequest<{ data?: unknown }>(`teacher/assessments/${assessmentId}/questions`, {
            method: "POST",
            body: JSON.stringify({ type, prompt: question.text, points: question.weight, ...(correctAnswer === undefined ? {} : { correct_answer: correctAnswer }), ...(options ? { options } : {}) }),
          });
        } catch (cause) {
          if (cause instanceof ApiError && cause.status === 401) router.replace("/login?role=teacher&reason=session-expired");
          if (cause instanceof ApiError && cause.status === 404) await courseState.reload();
          setError(cause instanceof ApiError && Object.keys(cause.fieldErrors).length ? fieldErrorMessage(cause.fieldErrors) : cause instanceof Error ? cause.message : "Soal belum dapat disimpan.");
          return;
        }
        if (!result) return;
        sentQuestions.current.add(question.id);
      }
      creationComplete.current = true;
      setMessage(publish ? "Asesmen dan seluruh soal berhasil diterbitkan." : "Asesmen dan seluruh soal berhasil disimpan sebagai draf.");
      } catch (cause) {
        if (cause instanceof ApiError && cause.status === 401) router.replace("/login?role=teacher&reason=session-expired");
        if (cause instanceof ApiError && cause.status === 404) await courseState.reload();
        setError(cause instanceof ApiError && Object.keys(cause.fieldErrors).length ? fieldErrorMessage(cause.fieldErrors) : cause instanceof Error ? cause.message : "Asesmen belum dapat disimpan.");
      } finally {
        creationInFlight.current = false;
      }
    })();
  }
  return <form className={`tg-stack tg-assessment-builder ${editing ? "is-editing" : "is-creating"}`} onSubmit={event => { event.preventDefault(); persist(true); }}>
    <header className="tg-assessment-builder-title"><h1>{editing ? `Edit ${formKind === "tugas" ? "Tugas" : "Kuis"}` : `Publikasikan ${formKind === "tugas" ? "Tugas" : "Kuis"} Baru`}</h1></header>
    <div className="tg-assessment-builder-columns">
      <div className="tg-stack tg-assessment-main-column">
    <Card className="tg-assessment-basic" title={formKind === "tugas" ? "Informasi Dasar Asesmen" : "Informasi Dasar"} description={formKind === "kuis" ? "Identitas materi, durasi pengerjaan, dan pembatasan token ujian." : undefined} action={formKind === "tugas" ? <span className="tg-assessment-required">* Wajib diisi lengkap</span> : undefined}>
      <div className="tg-stack">
        <Field label={formKind === "tugas" ? "Judul Asesmen / Tugas *" : "Judul Asesmen *"}><input required maxLength={120} value={form.title} onChange={event => change({ title: event.target.value })} /></Field>
        <div className="tg-form-grid tg-assessment-basic-grid">
          {formKind === "tugas" ? <><Field label="Tipe Asesmen *"><select value={form.type} onChange={event => change({ type: event.target.value })}><option>Tugas & Kuis Campuran</option><option>Tugas</option><option>Kuis</option></select></Field><Field label="Capaian Pembelajaran"><div className="tg-readonly tg-assessment-cp"><Badge>CP-JIK-02</Badge><span>Merancang Konfigurasi Topologi Jaringan</span><span aria-hidden="true">×</span></div></Field></> : <>
            {/* TODO-DATA: materi contoh belum menjadi bagian dari model asesmen. */}
            <Field label="Materi *"><select disabled defaultValue="Modul 04 • Perangkat Keras Jaringan"><option>Modul 04 • Perangkat Keras Jaringan</option></select></Field>
          </>}
        </div>
        <Field label={formKind === "tugas" ? "Petunjuk & Instruksi Pengerjaan Siswa *" : "Instruksi Pengerjaan Siswa"}>
          <div className="tg-assessment-editor">
            <div className="tg-assessment-toolbar" aria-label="Pemformatan teks">
              <span aria-hidden="true"><Solar name="text-bold" /></span><span aria-hidden="true"><Solar name="text-italic" /></span><span aria-hidden="true"><Solar name="text-underline" /></span><i />
              <span aria-hidden="true"><Solar name="list" /></span><span aria-hidden="true"><Solar name="list-ordered" /></span><i /><span aria-hidden="true"><Solar name="link" /></span><span aria-hidden="true"><Solar name="text-cross" /></span>
            </div>
            <textarea required value={form.instructions} onChange={event => change({ instructions: event.target.value })} />
          </div>
        </Field>
      </div>
    {formKind === "kuis" && <>
    {/* TODO-DATA: durasi, token ujian, dan pengaturan pembahasan belum tersedia pada model asesmen. */}
    <div className="tg-assessment-quiz-settings">
      <div className="tg-assessment-quiz-settings-grid">
        <section><h3>Durasi Pengerjaan</h3><div className="tg-assessment-duration"><button type="button" aria-label="Kurangi durasi" disabled>−</button><strong>60 <small>Menit</small></strong><button type="button" aria-label="Tambah durasi" disabled>+</button></div></section>
        <section><h3>Jatah Token Ujian</h3><div className="tg-assessment-token-options"><span className="is-selected">1 Kali Ujian</span><span>Beberapa Kali</span></div></section>
      </div>
      <p className="tg-assessment-token-note">*Token adalah jatah kesempatan siswa mengerjakan. Satu token terpakai setiap siswa menekan Mulai.</p>
      <div className="tg-assessment-feedback-setting"><span><strong>Tampilkan pembahasan setelah siswa selesai</strong><small>Siswa dapat langsung meninjau ulasan dan penjelasan jawaban yang tepat setelah batas waktu berakhir.</small></span><span className="tg-assessment-switch" aria-hidden="true" /></div>
    </div>
    </>}
    </Card>
      <Card className={`tg-stack tg-assessment-question-list ${formKind === "tugas" ? "tg-assessment-question-list-edit" : ""}`}>
        <div className="tg-assessment-question-heading"><div><h2>Daftar Soal</h2><Badge>{formKind === "tugas" ? `${form.questions.length} Butir Tersusun` : `${form.questions.length} butir`}</Badge></div><Button type="button" className="tg-assessment-add-question" onClick={() => change({ questions: [...form.questions, { id: Math.max(0, ...form.questions.map(question => question.id)) + 1, type: "Uraian", text: "", weight: 0, options: ["", "", "", ""], answer: "" }] })}><Solar name="add-circle" />{formKind === "tugas" ? "Tambah Butir Soal" : "Tambah Soal"}</Button></div>
        {formKind === "kuis" && <div className={`tg-assessment-reorder-hint ${draggedQuestionId !== null ? "is-drop-target" : ""}`} onDragOver={event => { if (draggedQuestionId !== null) { event.preventDefault(); event.dataTransfer.dropEffect = "move"; } }} onDrop={event => { event.preventDefault(); const draggedId = Number(event.dataTransfer.getData("text/plain")) || draggedQuestionId; if (draggedId !== null) moveQuestion(draggedId, null); setDraggedQuestionId(null); setDropTargetQuestionId(null); }}><Solar name="sort" />Lepaskan Soal di Sini untuk Mengubah Urutan</div>}
        {form.questions.map((question, index) => <div className={`tg-assessment-question-dnd ${dropTargetQuestionId === question.id ? "is-drop-target" : ""}`} key={question.id} onDragOver={event => { if (formKind === "kuis" && draggedQuestionId !== null) { event.preventDefault(); event.dataTransfer.dropEffect = "move"; setDropTargetQuestionId(question.id); } }} onDrop={event => { if (formKind === "kuis") { event.preventDefault(); const draggedId = Number(event.dataTransfer.getData("text/plain")) || draggedQuestionId; if (draggedId !== null) moveQuestion(draggedId, question.id); setDraggedQuestionId(null); setDropTargetQuestionId(null); } }} onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropTargetQuestionId(null); }}>
        <Card className={`tg-assessment-question-card ${index > 0 ? "tg-assessment-question-card-secondary" : ""}`}>
          <div className="tg-assessment-question-top"><div className="tg-inline"><span className="tg-assessment-drag" aria-label="Seret untuk mengubah urutan" draggable={formKind === "kuis" && !editing} onDragStart={event => { if (formKind === "kuis" && !editing) { event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", String(question.id)); setDraggedQuestionId(question.id); } }} onDragEnd={() => { setDraggedQuestionId(null); setDropTargetQuestionId(null); }}>⠿</span><Badge>{String(formKind === "tugas" ? index + 1 : question.id).padStart(2, "0")}</Badge><select className={`tg-assessment-type tg-assessment-type-${index}`} aria-label={`Jenis soal ${index + 1}`} value={question.type} onChange={event => updateQuestion(question.id, { type: event.target.value, options: event.target.value === "Benar / Salah" ? ["Benar", "Salah"] : question.options.length ? question.options : ["", "", "", ""], answer: "" })}><option value="Pilihan Ganda">Pilihan Ganda</option>{formKind === "kuis" && <option value="Benar / Salah">Benar / Salah</option>}<option value="Uraian">Jawaban Singkat</option><option value="Unggah Portofolio">Unggah Berkas</option></select></div><div className="tg-inline">{formKind === "tugas" ? <label className="tg-assessment-weight">Bobot: <input className="tg-grade-input" aria-label={`Bobot soal ${index + 1}`} type="number" min={0} max={10} step={1} value={question.weight / 10} onChange={event => updateQuestion(question.id, { weight: Math.min(100, Math.max(0, Number(event.target.value) * 10)) })} /> Poin</label> : <div className="tg-assessment-point-control"><select aria-label={`Bobot soal ${question.id}`} value={question.weight} onChange={event => updateQuestion(question.id, { weight: Number(event.target.value) })}>{Array.from({ length: 20 }, (_, pointIndex) => (pointIndex + 1) * 5).map(points => <option value={points} key={points}>{points} Poin</option>)}</select><Solar name="alt-arrow-down" /></div>}{formKind === "kuis" && <Button type="button" tone="ghost" aria-label={expandedQuestions.includes(question.id) ? `Ciutkan soal ${index + 1}` : `Buka soal ${index + 1}`} aria-expanded={expandedQuestions.includes(question.id)} onClick={() => setExpandedQuestions(current => current.includes(question.id) ? current.filter(id => id !== question.id) : [...current, question.id])}><Solar name={expandedQuestions.includes(question.id) ? "alt-arrow-up" : "alt-arrow-down"} /></Button>}<Button type="button" tone="ghost" aria-label={`Hapus soal ${index + 1}`} onClick={() => change({ questions: form.questions.filter(item => item.id !== question.id) })}><Solar name="trash-bin-trash" /></Button></div></div>
          {(formKind === "tugas" || expandedQuestions.includes(question.id)) ? <div className="tg-assessment-question-detail">
          <Field label={`Pertanyaan ${index + 1} *`}><textarea className="tg-assessment-question-text" rows={3} required value={question.text} onChange={event => updateQuestion(question.id, { text: event.target.value })} /></Field>
          {question.type === "Unggah Portofolio" && <span className="tg-assessment-format-note"><Solar name="info-circle" />{`Format diterima: ${uploadExtensionsLabel("studentAssessment")} (Maks. ${MAX_UPLOAD_FILE_SIZE_LABEL})`}</span>}
          {question.type === "Pilihan Ganda" || question.type === "Benar / Salah" ? <><fieldset className="tg-assessment-options"><legend className="tg-sr-only">Pilihan jawaban, pilih satu kunci yang benar</legend><div className="tg-form-grid">{question.options.map((option, optionIndex) => <label className={`tg-assessment-option ${question.answer === String(optionIndex) ? "is-correct" : ""}`} key={optionIndex}><input aria-label={`Kunci soal ${index + 1}: ${question.type === "Benar / Salah" ? option : String.fromCharCode(65 + optionIndex)}`} type="radio" name={`answer-${question.id}`} checked={question.answer === String(optionIndex)} onChange={() => updateQuestion(question.id, { answer: String(optionIndex) })} /><span className="tg-assessment-option-letter">{question.type === "Benar / Salah" ? option : String.fromCharCode(65 + optionIndex)}</span><textarea required rows={question.answer === String(optionIndex) ? 2 : 1} aria-label={`Soal ${index + 1}, pilihan ${String.fromCharCode(65 + optionIndex)}`} value={option} onChange={event => updateQuestion(question.id, { options: question.options.map((text, i) => i === optionIndex ? event.target.value : text) })} />{question.answer === String(optionIndex) && <small><Solar name="check-circle" />Kunci Jawaban</small>}</label>)}</div></fieldset>{formKind === "kuis" && question.type === "Pilihan Ganda" && <div className="tg-assessment-question-discussion"><strong>Pembahasan Soal (Dapat Dilihat Siswa Setelah Selesai)</strong><p>Switch bekerja pada layer data link (OSI Layer 2) untuk meneruskan data secara selektif ke port tujuan berdasarkan MAC Address, sehingga memisahkan collision domain.</p></div>}</> : <div className="tg-assessment-rubric">
            <div className="tg-assessment-rubric-heading"><strong><Solar name="checklist-minimalistic" />Rubrik Penilaian</strong><span><Solar name="check-circle" />Terpakai {question.weight} / {question.weight} Poin</span></div>
            {/* TODO-DATA: kriteria dan distribusi poin mengikuti contoh visual Figma; rubrik editable lama tetap tersedia di bawah. */}
            <div className="tg-assessment-rubric-samples" aria-label="Contoh kriteria rubrik">
              {((formKind === "tugas" && index === 1) || (formKind === "kuis" && question.id === 8) ? ["Kegagalan kabel workstation tidak melumpuhkan seluruh jaringan", "Peran sentral Switch/Hub dalam manajemen lalu lintas", "Perbandingan terminator pada bus"] : ["Topologi hybrid sesuai (1 Server, 1 Switch, 6 PC)", "Konfigurasi IP benar", "Nama dan nomor absen tercantum"]).map((criterion, criterionIndex) => <div className="tg-assessment-rubric-row" key={criterion}><span aria-hidden="true">⠿</span><span>{criterion}</span><strong>{((formKind === "tugas" && index === 1) || (formKind === "kuis" && question.id === 8)) ? [15, 15, 10][criterionIndex] : [10, 6, 4][criterionIndex]} <small>Poin</small></strong><span aria-hidden="true">×</span></div>)}
            </div>
            <Field label="Acuan Penilaian Guru"><textarea className="tg-assessment-rubric-input" value={question.answer} onChange={event => updateQuestion(question.id, { answer: event.target.value })} /></Field>
            <button className="tg-assessment-add-criterion" type="button"><Solar name="add" />Tambah Kriteria</button>
          </div>}
          </div> : <p className="tg-assessment-question-preview">{question.text}</p>}
        </Card></div>)}
        {formKind === "kuis" && reorderMessage && <div className="tg-assessment-reorder-status"><span><Solar name="sort" />{reorderMessage}</span><Button type="button" tone="ghost" disabled={!previousQuestionOrderIds} onClick={undoQuestionReorder}>Urungkan</Button></div>}
      </Card>
      </div>
      <aside className="tg-stack tg-assessment-builder-aside">
        <Targets className="tg-assessment-targets" subject={targetSubject} selected={form.targets} change={targets => change({ targets })} description="Tentukan rombel jenjang kelas 8 yang menerima notifikasi tugas:" summaryLabel="Total Akumulasi Siswa" shuffle={formKind === "tugas"} showSelectAll={false} compactLabels />
        {formKind === "kuis" && <>
        {/* TODO-DATA: pengacakan belum menjadi bagian dari model asesmen. */}
        <Card className="tg-assessment-randomization" title="Pengacakan Soal">
          <div className="tg-assessment-static-toggle"><span><strong>Acak nomor urut soal</strong><small>Setiap siswa melihat urutan butir yang berlainan saat asesmen.</small></span><span className="tg-assessment-switch" aria-hidden="true" /></div>
          <div className="tg-assessment-static-toggle"><span><strong>Acak urutan opsi (A–D)</strong><small>Pilihan ganda diacak secara mandiri di perangkat siswa.</small></span><span className="tg-assessment-switch tg-assessment-switch-off" aria-hidden="true" /></div>
        </Card>
        </>}
        <Card className="tg-assessment-schedule" title="Jadwal & Batas Waktu" action={formKind === "kuis" ? <Badge tone="warning">Sisa 3 Hari</Badge> : undefined}>
          <div className="tg-stack"><Field label={formKind === "tugas" ? "Tanggal Mulai Pengerjaan" : "Waktu Mulai Buka"}><div className="tg-assessment-date-pair"><div className="tg-assessment-date"><Solar name="calendar" /><span>{assessmentDateLabel(startDate, formKind === "kuis")}</span><input aria-label="Tanggal mulai pengerjaan" type="date" required value={startDate} onChange={event => change({ start: `${event.target.value}T${startTime}` })} /></div><div className="tg-assessment-date"><Solar name="clock-circle" /><span>{startTime} WIB</span><input aria-label="Waktu mulai pengerjaan" type="time" required value={startTime} onChange={event => change({ start: `${startDate}T${event.target.value}` })} /></div></div></Field><Field label="Batas Akhir (Tenggat)"><div className="tg-assessment-date-pair"><div className="tg-assessment-date tg-assessment-date-deadline"><Solar name="calendar" /><span>{assessmentDateLabel(endDate, formKind === "kuis")}</span><input aria-label="Tanggal batas akhir" type="date" required min={startDate} value={endDate} onChange={event => change({ end: `${event.target.value}T${endTime}` })} /></div><div className="tg-assessment-date tg-assessment-date-deadline"><Solar name="clock-circle" /><span>{endTime} WIB</span><input aria-label="Waktu batas akhir" type="time" required min={endDate === startDate ? startTime : undefined} value={endTime} onChange={event => change({ end: `${endDate}T${event.target.value}` })} /></div></div></Field>
            {formKind === "tugas" && <div className="tg-assessment-toggle-row"><span><strong>Izinkan Unggah Terlambat</strong><small>Tandai otomatis penalti -5 poin/hari</small></span><span className="tg-assessment-switch" aria-hidden="true" /></div>}
          </div>
        </Card>
        {formKind === "kuis" && <>
        {/* TODO-DATA: ringkasan validasi publikasi belum menjadi model tersimpan. */}
        <Card className="tg-assessment-publish-checklist" title="Publikasi Asesmen">
          {["Judul & instruksi terisi", `${form.questions.length} butir soal lengkap`, `Total akumulasi ${total} poin`, "Token: 1 kali ujian", `${form.targets.length} rombel dipilih (${subject.classes.length ? form.targets.reduce((sum, group) => sum + (subject.classes.indexOf(group) === 0 ? 34 : 32), 0) : "—"} siswa)`, "Jadwal & batas waktu valid"].map(item => <div key={item}><Solar name="check-circle" />{item}</div>)}
        </Card>
        </>}
        {formKind === "tugas" ? <Card className="tg-assessment-points" title="Bobot Poin" action={<Badge tone="success">BAGIAN 03</Badge>}>
          <div className="tg-assessment-points-total"><span>Akumulasi Bobot Soal:</span><strong>{total} <small>/ 100 Poin</small></strong></div>
          <div className="tg-assessment-points-bar" aria-hidden="true">{form.questions.map((question, index) => <span key={question.id} style={{ flex: question.weight }} className={`tg-assessment-points-segment-${index % 3}`} />)}</div>
          <div className="tg-assessment-points-legend">{form.questions.map((question, index) => <span key={question.id} className={`tg-assessment-points-legend-${index % 3}`}><i />Soal {index + 1} ({question.weight})</span>)}</div>
          <div className="tg-assessment-points-rows">{form.questions.map((question, index) => <div key={question.id}><span><Solar name="check-circle" />Soal {String(index + 1).padStart(2, "0")} • {question.type === "Pilihan Ganda" ? "otomatis" : "rubrik"}</span><strong>{question.weight} / {question.weight} Poin</strong></div>)}</div>
          <Notice tone={total === 100 ? "success" : "warning"}>{total === 100 ? "Bobot dan rubrik lengkap" : "Total bobot harus tepat 100 poin sebelum publikasi."}<small>Total poin butir telah genap 100 poin dan seluruh rubrik telah terkonfigurasi sesuai bobot.</small></Notice>
        </Card> : <Card className="tg-assessment-points" title="Rubrik & Bobot Poin" description="Distribusi poin antar butir soal untuk skor total 100.">
          <div className="tg-assessment-score-table-wrap"><table className="tg-assessment-score-table"><thead><tr><th>Tipe Soal</th><th>Jumlah Butir</th><th>Model Penilaian</th><th>Subtotal Bobot</th></tr></thead><tbody>
            {questionGroups.map(group => <tr key={group.type}><th>{group.type === "Uraian" ? "Jawaban Singkat" : group.type === "Unggah Portofolio" ? "Unggah Berkas" : group.type}</th><td>{group.count} Butir</td><td><Badge tone={["Pilihan Ganda", "Benar / Salah"].includes(group.type) ? "success" : "warning"}>{["Pilihan Ganda", "Benar / Salah"].includes(group.type) ? "Otomatis" : "Manual Guru"}</Badge></td><td><strong>{group.weight} Poin</strong></td></tr>)}
          </tbody></table></div>
          <div className={`tg-assessment-score-total ${total === 100 ? "is-valid" : "is-warning"}`}><span><Solar name={total === 100 ? "check-circle" : "info-circle"} />Total poin harus 100</span><strong>{total} / 100</strong></div>
        </Card>}
      </aside>
    </div>
    {submitError && <div role="alert"><Notice tone="error">{submitError}</Notice></div>}{message && <div role="status"><Notice tone="success">{message}</Notice></div>}
    <div className="tg-form-actions tg-assessment-builder-actions"><Action href={`${subjectUrl(subject.id)}/asesmen`} secondary><Solar name="arrow-left" />Kembali</Action><div className="tg-actions"><Button type="button" tone="outline" onClick={() => persist(false)}><Solar name="clipboard-check" />Simpan sebagai Draf</Button><Button type="submit"><Solar name="check-circle" />Publikasikan Sekarang</Button></div></div>
  </form>;
}
