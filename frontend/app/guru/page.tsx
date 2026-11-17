import { requireUser } from "@/lib/backend";
import Dashboard from "./_components/dashboard";
export default async function TeacherHome() { const user = await requireUser("teacher"); return <Dashboard name={user.name} />; }
