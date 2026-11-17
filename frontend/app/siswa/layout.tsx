import type { ReactNode } from "react";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "./student.css";
import Shell from "./_components/shell";
import { requireUser } from "@/lib/backend";
export default async function StudentLayout({ children }: { children: ReactNode }) {
  const user = await requireUser("student");
  return <Shell user={user}>{children}</Shell>;
}
