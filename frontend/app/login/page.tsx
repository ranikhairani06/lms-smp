import type { Role } from "@/lib/auth-types";
import LoginForm from "./login-form";

export default async function LoginPage({ searchParams }: {
  searchParams: Promise<{ role?: string | string[]; reason?: string | string[] }>;
}) {
  const query = await searchParams;
  const allowedRoles: Role[] = ["admin", "student", "teacher", "parent"];
  const initialRole = allowedRoles.find((role) => role === query.role) ?? "student";
  const roleMismatch = query.reason === "role-mismatch";
  return <LoginForm key={`${initialRole}-${roleMismatch}`} initialRole={initialRole} roleMismatch={roleMismatch} />;
}
