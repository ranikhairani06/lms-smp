import type { ReactNode } from "react";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "./parent.css";
import ParentShell from "./parent-shell";
import { requireUser } from "@/lib/backend";

export const metadata = {
  title: "EduSpace — Portal Orang Tua",
  description: "Pantau perkembangan belajar putra/putri Anda.",
};

export default async function ParentLayout({ children }: { children: ReactNode }) {
  const user = await requireUser("parent");
  return <ParentShell user={user}>{children}</ParentShell>;
}
