import { Suspense } from "react";
import { Dashboard } from "./_components/screens";
export default function Page() {
  return (
    <Suspense fallback={<p>Memuat halaman...</p>}>
      <Dashboard />
    </Suspense>
  );
}
