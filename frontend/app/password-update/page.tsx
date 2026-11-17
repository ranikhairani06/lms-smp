import { requireUser } from "@/lib/backend";
import PasswordForm from "./password-form";

export default async function PasswordUpdatePage() {
  const user = await requireUser(undefined, true);
  return <PasswordForm user={user} />;
}
