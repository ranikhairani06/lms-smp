import { Suspense } from "react";
import { Material } from "../../../../_components/screens";
export default function Page() {
  return (
    <Suspense fallback={<p>Memuat halaman...</p>}>
      <Material />
    </Suspense>
  );
}
