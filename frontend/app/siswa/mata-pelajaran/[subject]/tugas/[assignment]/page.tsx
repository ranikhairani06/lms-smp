import { Suspense } from "react";
import { Assignment } from "../../../../_components/screens";
export default function Page() {
  return (
    <Suspense fallback={<p>Memuat halaman...</p>}>
      <Assignment />
    </Suspense>
  );
}
