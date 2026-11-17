import { Suspense } from "react";
import { History } from "../_components/screens";
export default function Page() {
  return (
    <Suspense fallback={<p>Memuat halaman...</p>}>
      <History />
    </Suspense>
  );
}
