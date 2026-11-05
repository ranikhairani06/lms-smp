import { notFound } from "next/navigation";
import { requireUser } from "@/lib/backend";
import { subjects, classGroups, students } from "../_components/data";
import { SubjectList, SubjectSummary, MaterialList, AssessmentList } from "../_components/subjects";
import { MaterialEditor, AssessmentEditor } from "../_components/editors";
import { Submissions, Grading, AssessmentAnalysis } from "../_components/assessment-results";
import { ClassList, ClassDetail, Gradebook, StudentProgress } from "../_components/classes";
import { ResultsExport, Notifications, TeacherProfile } from "../_components/account-screens";

export default async function TeacherRoute({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const user = await requireUser("teacher");
  const [section, id, area, item, action, studentId] = path;
  const routeKey = path.join("/");
  if (path.length === 1) {
    if (section === "mata-pelajaran") return <SubjectList />;
    if (section === "kelas") return <ClassList />;
    if (section === "hasil-belajar") return <ResultsExport />;
    if (section === "notifikasi") return <Notifications />;
    if (section === "profil") return <TeacherProfile user={user} />;
  }
  if (section === "mata-pelajaran") {
    const subject = subjects.find(value => value.id === id);
    if (!subject) notFound();
    if (path.length === 2) return <SubjectSummary key={routeKey} subject={subject} teacher={user.name} />;
    if (area === "materi") {
      if (path.length === 3) return <MaterialList key={routeKey} subject={subject} />;
      if (item === "baru" && path.length === 4) return <MaterialEditor key={routeKey} subject={subject} />;
      if (action === "edit" && path.length === 5) return <MaterialEditor key={routeKey} subject={subject} editId={item} />;
    }
    if (area === "asesmen") {
      if (path.length === 3) return <AssessmentList key={routeKey} subject={subject} />;
      if (item === "baru" && path.length === 4) return <AssessmentEditor key={routeKey} subject={subject} />;
      if (action === "edit" && path.length === 5) return <AssessmentEditor key={routeKey} subject={subject} editId={item} />;
      if (["tugas-01", "kuis-01"].includes(item)) {
        if (action === "pengumpulan" && path.length === 5) return <Submissions key={routeKey} subject={subject} assessment={item} />;
        if (action === "analisis" && path.length === 5) return <AssessmentAnalysis key={routeKey} subject={subject} assessment={item} />;
        if (action === "nilai" && path.length === 6 && students.some(student => student.id === studentId)) return <Grading key={routeKey} subject={subject} assessment={item} studentId={studentId} />;
      }
    }
  }
  if (section === "kelas") {
    const group = classGroups.find(group => group.toLowerCase() === id);
    if (!group) notFound();
    if (path.length === 2) return <ClassDetail key={routeKey} group={group} teacher={user.name} />;
    if (path.length === 3 && area === "nilai") return <Gradebook key={routeKey} group={group} />;
    if (path.length === 3 && area === "progres") return <StudentProgress key={routeKey} group={group} />;
  }
  notFound();
}
