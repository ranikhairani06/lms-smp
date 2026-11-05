import type { ReactNode } from "react";
import { requireUser } from "@/lib/backend";
import "../../styles/lms-tokens.css";
import "./teacher.css";
import TeacherShell from "./_components/shell";
import { TeacherDataProvider } from "./_components/store";

export const metadata = { title: "EduSpace — Portal Guru", description: "Kelola pembelajaran dan asesmen siswa." };
export default async function TeacherLayout({ children }: { children: ReactNode }) {
  const user = await requireUser("teacher");
  return <TeacherDataProvider userId={user.id}><TeacherShell user={user}>{children}</TeacherShell></TeacherDataProvider>;
}
